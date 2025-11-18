"use server";

import { MercadoPagoConfig, Preference } from "mercadopago";
import { createClient } from "@supabase/supabase-js";
import {
  validateCoverage,
  parseCoverageFromRegions,
  formatCoverageErrorMessage,
} from "@/lib/geolocation";

interface CheckoutState {
  error?: string | null;
  success?: boolean;
  paymentUrl?: string;
  outOfCoverage?: boolean;
  userLocation?: { city: string; state: string };
  productId?: string;
  paymentMethod?: string;
}

export async function processCheckout(
  prevState: CheckoutState,
  formData: FormData
): Promise<CheckoutState> {
  // Usar SERVICE_ROLE_KEY para bypass RLS durante checkout público
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  // Product and Partner Info
  const productId = String(formData.get("productId"));
  const productName = String(formData.get("productName"));
  const productPrice = Number(formData.get("productPrice"));
  const productSlug = String(formData.get("slug"));
  const partnerIdRaw = formData.get("partnerId");
  const partnerId =
    partnerIdRaw && partnerIdRaw !== "null" && partnerIdRaw !== ""
      ? String(partnerIdRaw)
      : null;
  const partnerName = String(formData.get("partnerName")) || "Tech4Loop";

  // Customer Info
  const name = String(formData.get("name"));
  const email = String(formData.get("email"));
  const phone = String(formData.get("phone"));
  const cep = String(formData.get("cep"));
  const address = String(formData.get("address"));
  const city = String(formData.get("city"));
  const userState = String(formData.get("state")).toUpperCase();
  const paymentMethod = String(formData.get("paymentMethod")) || "credit_card";
  const saveData = formData.get("saveData") === "true";

  if (!name || !email || !phone || !address || !city || !cep || !userState) {
    return { error: "Por favor, preencha todos os campos obrigatórios." };
  }

  if (!cep || cep.replace(/\D/g, "").length !== 8) {
    return { error: "Por favor, informe um CEP válido." };
  }

  // Verificar estoque disponível
  const { data: product, error: productError } = await supabase
    .from("products")
    .select("stock, name")
    .eq("id", productId)
    .single();

  if (productError || !product) {
    return { error: "Produto não encontrado." };
  }

  if (
    product.stock !== null &&
    product.stock !== undefined &&
    product.stock <= 0
  ) {
    return {
      error: `Desculpe, "${product.name}" está fora de estoque no momento.`,
    };
  }

  // ===== VALIDAÇÃO DE COBERTURA GEOGRÁFICA =====
  console.log(`📍 Validando cobertura para CEP: ${cep}`);

  // Buscar informações do parceiro/loja
  let partnerRegions: string[] | null = null;

  if (partnerId) {
    const { data: partnerData } = await supabase
      .from("profiles")
      .select("service_regions")
      .eq("id", partnerId)
      .single();

    partnerRegions = partnerData?.service_regions || null;
  }

  // Converter para o formato de cobertura
  const coverage = parseCoverageFromRegions(partnerRegions, partnerName);

  // Validar se o CEP está dentro da área de cobertura
  const coverageResult = await validateCoverage(cep, coverage);

  if (!coverageResult.valid) {
    const errorMessage = formatCoverageErrorMessage(
      partnerName,
      coverageResult.reason || "",
      coverageResult.location || { city, state: userState }
    );

    console.log(`❌ Fora da área de cobertura:`, coverageResult);

    return {
      error: errorMessage,
      outOfCoverage: true,
      userLocation: coverageResult.location,
      productId: productId,
    };
  }

  console.log(`✅ CEP válido e dentro da área de cobertura`);

  // 1. Create Order in DB
  const { data: orderData, error: orderError } = await supabase
    .from("orders")
    .insert({
      partner_id: partnerId,
      customer_name: name,
      customer_email: email,
      customer_phone: phone,
      customer_cep: cep,
      customer_address: address,
      customer_city: city,
      customer_state: userState,
      total_amount: productPrice,
      status: "pending",
    })
    .select()
    .single();

  if (orderError) {
    console.error("❌ Order creation error:", orderError);
    console.error("Order data:", {
      partnerId,
      name,
      email,
      phone,
      cep,
      address,
      city,
      userState,
      total_amount: productPrice,
    });
    return {
      error: `Não foi possível criar seu pedido: ${orderError.message || "Erro desconhecido"}. Tente novamente.`,
    };
  }

  console.log("✅ Order created:", orderData.id);

  // 2. Create Order Item (produto específico)
  const { error: orderItemError } = await supabase.from("order_items").insert({
    order_id: orderData.id,
    product_id: productId,
    quantity: 1,
    price_at_purchase: productPrice,
  });

  if (orderItemError) {
    console.error("❌ Order item creation error:", orderItemError);
    return {
      error: `Erro ao adicionar produto ao pedido: ${orderItemError.message}`,
    };
  }

  console.log("✅ Order item created for product:", productId);

  // 3. Create Mercado Pago Preference
  const client = new MercadoPagoConfig({
    accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
  });
  const preference = new Preference(client);

  try {
    console.log("💳 Creating Mercado Pago preference...");
    console.log("💰 Payment method selected:", paymentMethod);
    console.log("💾 Save data:", saveData);

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3002";
    const isLocalhost =
      siteUrl.includes("localhost") || siteUrl.includes("127.0.0.1");

    console.log("🌐 Site URL:", siteUrl);
    console.log("🏠 Is localhost:", isLocalhost);

    // Configurar métodos de pagamento permitidos baseado na escolha do usuário
    const paymentMethods: any = {
      installments: 12,
    };

    switch (paymentMethod) {
      case "pix":
        paymentMethods.excluded_payment_types = [
          { id: "ticket" },
          { id: "credit_card" },
          { id: "debit_card" },
        ];
        break;
      case "boleto":
        paymentMethods.excluded_payment_types = [
          { id: "credit_card" },
          { id: "debit_card" },
        ];
        paymentMethods.excluded_payment_methods = [{ id: "pix" }];
        break;
      case "wallet":
        paymentMethods.excluded_payment_types = [
          { id: "ticket" },
          { id: "credit_card" },
          { id: "debit_card" },
        ];
        break;
      case "credit_card":
      default:
        paymentMethods.excluded_payment_types = [{ id: "ticket" }];
        paymentMethods.excluded_payment_methods = [{ id: "pix" }];
        break;
    }

    const preferenceBody: any = {
      items: [
        {
          id: productId,
          title: productName,
          quantity: 1,
          unit_price: productPrice,
        },
      ],
      payer: {
        name,
        email,
        phone: { number: phone },
        address: {
          zip_code: cep,
          street_name: address,
          city_name: city,
          state_name: userState,
        },
      },
      payment_methods: paymentMethods,
      back_urls: {
        success: `${siteUrl}/compra-sucesso`,
        failure: `${siteUrl}/compra-falha`,
        pending: `${siteUrl}/produtos/${productSlug}`,
      },
      external_reference: orderData.id,
      notification_url: `${siteUrl}/api/webhooks/mercadopago`,
      statement_descriptor: "TECH4LOOP",
    };

    // auto_return só funciona com URLs públicas (não localhost)
    if (!isLocalhost) {
      preferenceBody.auto_return = "approved";
    }

    const result = await preference.create({
      body: preferenceBody,
    });

    console.log("✅ Mercado Pago preference created:", result.id);

    // Se saveData for true, aqui você pode salvar no localStorage do cliente
    // ou em um cookie (seria necessário fazer isso no client-side)

    return {
      success: true,
      paymentUrl: result.init_point,
      paymentMethod,
    };
  } catch (error: any) {
    console.error("❌ Mercado Pago error:", error);
    console.error("Error details:", error.message, error.cause);
    return {
      error: `Falha ao iniciar pagamento: ${error.message || "Erro desconhecido"}. Verifique suas credenciais do Mercado Pago.`,
    };
  }
}
