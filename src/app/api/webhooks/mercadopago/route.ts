import { NextRequest, NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import NewOrderEmail from "@/components/emails/NewOrderEmail";
import crypto from "crypto";
import { emitNFe } from "@/lib/nfe-integration";
import { checkRateLimit, getWebhookIdentifier } from "@/lib/webhookRateLimit";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  // 🔒 RATE LIMITING: Proteger contra flood de webhooks
  const ip =
    request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip");
  const identifier = getWebhookIdentifier(ip, undefined); // Será atualizado com payment_id depois

  const rateLimit = checkRateLimit(identifier, {
    maxRequests: 50, // 50 requests por minuto por IP
    windowMs: 60 * 1000,
  });

  if (!rateLimit.allowed) {
    console.warn(`⚠️ Rate limit excedido para ${identifier}`);
    return NextResponse.json(
      {
        error: "Too many requests",
        resetTime: new Date(rateLimit.resetTime).toISOString(),
      },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": "50",
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": rateLimit.resetTime.toString(),
        },
      }
    );
  }

  // 🔒 SEGURANÇA: Verificar assinatura HMAC-SHA256 do Mercado Pago
  const signature = request.headers.get("x-signature");
  const xRequestId = request.headers.get("x-request-id");

  if (!signature) {
    console.error("❌ Webhook rejeitado: sem assinatura X-Signature");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Obter o corpo bruto da requisição para validação
  const rawBody = await request.text();
  const body = JSON.parse(rawBody);

  // Validar assinatura HMAC-SHA256
  const secret = process.env.MERCADO_PAGO_WEBHOOK_SECRET;
  if (!secret) {
    console.error("❌ MERCADO_PAGO_WEBHOOK_SECRET não configurado");
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
    );
  }

  // Extrair ts e v1 do cabeçalho X-Signature
  // Formato: ts=1234567890,v1=abc123def456...
  const parts = signature.split(",");
  const ts = parts.find((p) => p.startsWith("ts="))?.split("=")[1];
  const v1 = parts.find((p) => p.startsWith("v1="))?.split("=")[1];

  if (!ts || !v1) {
    console.error("❌ Webhook rejeitado: formato de assinatura inválido");
    return NextResponse.json(
      { error: "Invalid signature format" },
      { status: 401 }
    );
  }

  // Construir a string para validação conforme documentação do Mercado Pago
  // manifest = id + request_id + timestamp_ts
  const manifest = `id:${body.data?.id};request-id:${xRequestId};ts:${ts};`;

  // Calcular HMAC-SHA256
  const calculatedSignature = crypto
    .createHmac("sha256", secret)
    .update(manifest)
    .digest("hex");

  // Comparação segura contra timing attacks
  if (calculatedSignature !== v1) {
    console.error("❌ Webhook rejeitado: assinatura HMAC inválida");
    console.error(`   Esperado: ${v1}`);
    console.error(`   Calculado: ${calculatedSignature}`);
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  console.log("✅ Webhook autenticado com sucesso");

  const { type, data } = body;

  if (type === "payment") {
    const client = new MercadoPagoConfig({
      accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
    });
    const payment = new Payment(client);

    try {
      const paymentInfo = await payment.get({ id: data.id });

      if (
        paymentInfo &&
        paymentInfo.external_reference &&
        paymentInfo.status === "approved"
      ) {
        const orderId = paymentInfo.external_reference;

        // Verificar idempotência - evitar processar o mesmo pagamento múltiplas vezes
        const { data: existingOrder } = await supabaseAdmin
          .from("orders")
          .select("payment_id")
          .eq("id", orderId)
          .single();

        if (existingOrder?.payment_id) {
          return NextResponse.json(
            { status: "Already processed" },
            { status: 200 }
          );
        }

        const { error: updateError } = await supabaseAdmin
          .from("orders")
          .update({
            status: "processing",
            payment_status: "approved",
            payment_id: data.id,
          })
          .eq("id", orderId);

        if (updateError)
          throw new Error(`Error updating order: ${updateError.message}`);

        const { data: orderDetails } = await supabaseAdmin
          .from("orders")
          .select(
            "*, order_items(*, products(*, profiles!products_partner_id_fkey(email)))"
          )
          .eq("id", orderId)
          .single();

        if (orderDetails) {
          // Decrementar estoque dos produtos
          if (orderDetails.order_items && orderDetails.order_items.length > 0) {
            for (const item of orderDetails.order_items) {
              const { data: stockResult } = await supabaseAdmin.rpc(
                "decrement_product_stock",
                {
                  product_uuid: item.product_id,
                  quantity_to_decrement: item.quantity || 1,
                }
              );

              if (stockResult && !stockResult[0]?.success) {
                console.warn(
                  `Falha ao decrementar estoque do produto ${item.product_id}: ${stockResult[0]?.message}`
                );
              }
            }

            // ✅ ENVIAR EMAIL PARA TODOS OS PARCEIROS ENVOLVIDOS
            console.log(`📧 Enviando emails para parceiros...`);
            
            // Agrupar itens por parceiro
            const partnerGroups = new Map();
            
            for (const item of orderDetails.order_items) {
              const partnerId = item.products?.partner_id;
              const partnerEmail = item.products?.profiles?.email;
              const partnerName = item.products?.profiles?.partner_name || "Parceiro";
              
              if (partnerId && partnerEmail) {
                if (!partnerGroups.has(partnerId)) {
                  partnerGroups.set(partnerId, {
                    email: partnerEmail,
                    name: partnerName,
                    items: [],
                  });
                }
                partnerGroups.get(partnerId).items.push(item);
              }
            }

            // Enviar email para cada parceiro com SEUS produtos
            for (const partnerId of Array.from(partnerGroups.keys())) {
              const partnerData = partnerGroups.get(partnerId)!;
              const partnerSubtotal = partnerData.items.reduce(
                (sum: number, item: any) => sum + (item.price_at_purchase * item.quantity),
                0
              );

              console.log(`  → Enviando para ${partnerData.name} (${partnerData.items.length} produto(s), R$ ${partnerSubtotal.toFixed(2)})`);
              
              try {
                await resend.emails.send({
                  from: "Vendas <vendas@tech4loop.com.br>",
                  to: [partnerData.email],
                  subject: `Novo Pedido Recebido: ${partnerData.items.length} produto(s) - R$ ${partnerSubtotal.toFixed(2)}`,
                  react: NewOrderEmail({ 
                    order: {
                      ...orderDetails,
                      order_items: partnerData.items,
                      partner_subtotal: partnerSubtotal,
                    } 
                  }),
                });
                console.log(`  ✅ Email enviado para ${partnerData.name}`);
              } catch (emailError) {
                console.error(`  ❌ Erro ao enviar email para ${partnerData.name}:`, emailError);
              }
            }

            // Se nenhum parceiro encontrado, enviar para admin
            if (partnerGroups.size === 0) {
              const adminEmail = process.env.ADMIN_EMAIL;
              if (adminEmail) {
                console.log(`  → Enviando para admin (nenhum parceiro encontrado)`);
                await resend.emails.send({
                  from: "Vendas <vendas@tech4loop.com.br>",
                  to: [adminEmail],
                  subject: `Novo Pedido Recebido: ${orderDetails.order_items.length} produto(s)`,
                  react: NewOrderEmail({ order: orderDetails }),
                });
              }
            }

            // 🧾 EMITIR NF-e (OBRIGATÓRIO NO BRASIL)
            console.log(
              `📝 Iniciando emissão de NF-e para pedido ${orderId}...`
            );

            // 🔒 CALCULAR TOTAL baseado nos itens REAIS (price_at_purchase)
            const nfeTotal = orderDetails.order_items.reduce(
              (sum: number, item: any) => sum + (item.price_at_purchase * item.quantity),
              0
            );

            // ⚠️ VALIDAR se total calculado bate com total do banco
            if (Math.abs(nfeTotal - parseFloat(orderDetails.total_amount)) > 0.01) {
              console.error("⚠️ DIVERGÊNCIA NO TOTAL DA NF-e!");
              console.error("Total calculado:", nfeTotal);
              console.error("Total no BD:", orderDetails.total_amount);
              // Usar total calculado (mais confiável)
            }

            const nfeResult = await emitNFe({
              naturezaOperacao: "Venda de mercadoria",
              produtos: orderDetails.order_items.map((item: any) => ({
                codigo: item.product_id,
                descricao: item.products.name,
                ncm: item.products.ncm || "62044200",
                quantidade: item.quantity,
                // ✅ USAR PRICE_AT_PURCHASE (preço pago pelo cliente)
                valorUnitario: item.price_at_purchase,
                valorTotal: item.price_at_purchase * item.quantity,
              })),
              cliente: {
                nome: orderDetails.customer_name,
                cpf: orderDetails.customer_cpf,
                email: orderDetails.customer_email,
                telefone: orderDetails.customer_whatsapp,
                endereco: {
                  logradouro: orderDetails.customer_address,
                  numero: orderDetails.customer_number || "S/N",
                  complemento: orderDetails.customer_complement,
                  bairro: orderDetails.customer_neighborhood,
                  cidade: orderDetails.customer_city,
                  estado: orderDetails.customer_state,
                  cep: orderDetails.customer_cep,
                },
              },
              // ✅ USAR TOTAL CALCULADO (mais confiável)
              valorTotal: nfeTotal,
              formaPagamento:
                orderDetails.payment_method === "credit_card"
                  ? "Cartão de Crédito"
                  : orderDetails.payment_method === "pix"
                    ? "PIX"
                    : orderDetails.payment_method === "boleto"
                      ? "Boleto"
                      : "Wallet",
            });

            if (nfeResult.success) {
              console.log(
                `✅ NF-e emitida com sucesso! Chave: ${nfeResult.nfeKey}`
              );

              // Salvar chave NF-e no banco
              await supabaseAdmin
                .from("orders")
                .update({
                  nfe_key: nfeResult.nfeKey,
                  nfe_url: nfeResult.danfeUrl,
                })
                .eq("id", orderId);

              // Enviar DANFE para o cliente
              if (nfeResult.danfeUrl) {
                await resend.emails.send({
                  from: "Vendas <vendas@tech4loop.com.br>",
                  to: [orderDetails.customer_email],
                  subject: `Nota Fiscal - Pedido #${orderId}`,
                  html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                      <h2>Nota Fiscal Eletrônica</h2>
                      <p>Olá ${orderDetails.customer_name},</p>
                      <p>A Nota Fiscal do seu pedido foi emitida com sucesso!</p>
                      <p><strong>Chave de Acesso:</strong> ${nfeResult.nfeKey}</p>
                      <p><a href="${nfeResult.danfeUrl}" style="background-color: #FF6B00; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Baixar DANFE (PDF)</a></p>
                    </div>
                  `,
                });
              }
            } else {
              console.error(`❌ Falha ao emitir NF-e: ${nfeResult.error}`);
              // Não bloqueia o pedido, mas registra o erro
              await supabaseAdmin
                .from("orders")
                .update({
                  nfe_error: nfeResult.error,
                })
                .eq("id", orderId);
            }
          }
        }
      }
    } catch (error) {
      console.error("Webhook Error:", error);
      return NextResponse.json(
        { status: "Error processing webhook" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ status: "Received" }, { status: 200 });
}
