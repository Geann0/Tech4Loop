"use server";

import { MercadoPagoConfig, Preference } from "mercadopago";
import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

interface CheckoutState {
  error?: string | null;
  success?: boolean;
  paymentUrl?: string;
}

export async function processCheckout(
  prevState: CheckoutState,
  formData: FormData
): Promise<CheckoutState> {
  const supabase = createServerActionClient({ cookies });

  // Product and Partner Info
  const productId = String(formData.get("productId"));
  const productName = String(formData.get("productName"));
  const productPrice = Number(formData.get("productPrice"));
  const productSlug = String(formData.get("slug"));
  const partnerName = String(formData.get("partnerName"));
  const partnerRegions = String(formData.get("partnerRegions"));

  // Customer Info
  const name = String(formData.get("name"));
  const email = String(formData.get("email"));
  const phone = String(formData.get("phone"));
  const cep = String(formData.get("cep"));
  const address = String(formData.get("address"));
  const city = String(formData.get("city"));
  const userState = String(formData.get("state")).toUpperCase();

  if (!name || !email || !phone || !address || !city || !cep || !userState) {
    return { error: "Por favor, preencha todos os campos." };
  }

  // Region Check
  if (partnerName && partnerName !== "Tech4Loop") {
    const regions = partnerRegions ? partnerRegions.split(",") : [];
    if (
      regions.length > 0 &&
      !regions.some((r) => r.trim().toUpperCase() === userState.trim())
    ) {
      return {
        error: `Desculpe, a loja "${partnerName}" não atende a região "${userState}".`,
      };
    }
  }

  // 1. Create Order in DB
  const { data: orderData, error: orderError } = await supabase
    .from("orders")
    .insert({
      product_id: productId,
      customer_name: name,
      customer_email: email,
      customer_phone: phone,
      customer_cep: cep,
      customer_address: address,
      customer_city: city,
      customer_state: userState,
    })
    .select()
    .single();

  if (orderError) {
    console.error("Order creation error:", orderError);
    return { error: "Não foi possível criar seu pedido. Tente novamente." };
  }

  // 2. Create Mercado Pago Preference
  const client = new MercadoPagoConfig({
    accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
  });
  const preference = new Preference(client);

  try {
    const result = await preference.create({
      body: {
        items: [
          {
            id: productId,
            title: productName,
            quantity: 1,
            unit_price: productPrice,
          },
        ],
        payer: { name, email, phone: { number: phone } },
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_SITE_URL}/compra-sucesso`,
          failure: `${process.env.NEXT_PUBLIC_SITE_URL}/produtos/${productSlug}`,
          pending: `${process.env.NEXT_PUBLIC_SITE_URL}/produtos/${productSlug}`,
        },
        auto_return: "approved",
        external_reference: orderData.id,
        notification_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/webhooks/mercadopago`,
      },
    });

    return { success: true, paymentUrl: result.init_point };
  } catch (error) {
    console.error("Mercado Pago error:", error);
    return {
      error: "Falha ao iniciar o processo de pagamento. Tente novamente.",
    };
  }
}
