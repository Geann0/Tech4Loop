import { NextRequest, NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { createClient } from "@supabase/supabase-js";
import {
  checkRateLimit,
  getIdentifier,
  DEFAULT_RATE_LIMIT,
} from "@/lib/rateLimit";

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
});
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  // Rate limiting
  const identifier = getIdentifier(req);
  const rateLimit = checkRateLimit(identifier, DEFAULT_RATE_LIMIT);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Muitas requisições. Aguarde antes de tentar novamente." },
      { status: 429 }
    );
  }

  try {
    const { productId, orderId, customerInfo } = await req.json();

    if (!productId || !orderId || !customerInfo) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    // Busca o produto no DB para garantir o preço correto
    const { data: product, error: productError } = await supabaseAdmin
      .from("products")
      .select("name, price")
      .eq("id", productId)
      .single();

    if (productError || !product) {
      return NextResponse.json(
        { error: "Produto não encontrado" },
        { status: 404 }
      );
    }

    const preference = await new Preference(client).create({
      body: {
        items: [
          {
            id: productId,
            title: product.name,
            quantity: 1,
            unit_price: product.price,
          },
        ],
        payer: {
          name: customerInfo.name,
          email: customerInfo.email, // Opcional, mas recomendado
        },
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_SITE_URL}/compra-sucesso`,
          failure: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/${productId}`, // Volta para o checkout em caso de falha
        },
        notification_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/payment-webhook`,
        external_reference: orderId,
      },
    });

    return NextResponse.json({ preferenceId: preference.id });
  } catch (error) {
    console.error("Error creating payment preference:", error);
    return NextResponse.json(
      { error: "Falha ao criar preferência de pagamento" },
      { status: 500 }
    );
  }
}
