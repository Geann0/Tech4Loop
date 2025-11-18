"use server";

import { MercadoPagoConfig, Preference } from "mercadopago";
import { createClient } from "@supabase/supabase-js";
import type { CartItem } from "@/types";

interface CheckoutState {
  error?: string | null;
  success?: boolean;
  paymentUrl?: string;
}

export async function processCartCheckout(
  prevState: CheckoutState,
  formData: FormData
): Promise<CheckoutState> {
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

  try {
    // Dados do cliente
    const name = String(formData.get("name"));
    const email = String(formData.get("email"));
    const phone = String(formData.get("phone"));
    const cep = String(formData.get("cep"));
    const address = String(formData.get("address"));
    const city = String(formData.get("city"));
    const userState = String(formData.get("state")).toUpperCase();
    const paymentMethod =
      String(formData.get("paymentMethod")) || "credit_card";

    // Dados do carrinho
    const cartDataRaw = formData.get("cartData");
    if (!cartDataRaw) {
      return { error: "Carrinho vazio" };
    }

    const cart = JSON.parse(String(cartDataRaw)) as {
      items: CartItem[];
      total: number;
    };

    if (!cart.items || cart.items.length === 0) {
      return { error: "Carrinho vazio" };
    }

    // Validações básicas
    if (!name || !email || !phone || !address || !city || !cep || !userState) {
      return { error: "Por favor, preencha todos os campos obrigatórios." };
    }

    // Verificar estoque de todos os produtos
    for (const item of cart.items) {
      const { data: product, error: productError } = await supabase
        .from("products")
        .select("stock, name")
        .eq("id", item.product_id)
        .single();

      if (productError || !product) {
        return { error: `Produto "${item.product_name}" não encontrado.` };
      }

      if (
        product.stock !== null &&
        product.stock !== undefined &&
        product.stock < item.quantity
      ) {
        return {
          error: `Desculpe, "${product.name}" tem apenas ${product.stock} unidade(s) disponível(is).`,
        };
      }
    }

    // Criar pedido principal
    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .insert({
        partner_id: cart.items[0].partner_id || null,
        customer_name: name,
        customer_email: email,
        customer_phone: phone,
        customer_cep: cep,
        customer_address: address,
        customer_city: city,
        customer_state: userState,
        total_amount: cart.total,
        status: "pending",
        payment_status: "pending",
      })
      .select()
      .single();

    if (orderError) {
      console.error("❌ Order creation error:", orderError);
      return {
        error: `Não foi possível criar seu pedido: ${orderError.message || "Erro desconhecido"}`,
      };
    }

    console.log("✅ Order created:", orderData.id);

    // Criar itens do pedido
    const orderItems = cart.items.map((item) => ({
      order_id: orderData.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price_at_purchase: item.product_price,
    }));

    const { error: orderItemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (orderItemsError) {
      console.error("❌ Order items creation error:", orderItemsError);
      return {
        error: `Erro ao adicionar produtos ao pedido: ${orderItemsError.message}`,
      };
    }

    console.log(`✅ Created ${cart.items.length} order items`);

    // Criar preferência Mercado Pago
    const client = new MercadoPagoConfig({
      accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
    });
    const preference = new Preference(client);

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3002";
    const isLocalhost =
      siteUrl.includes("localhost") || siteUrl.includes("127.0.0.1");

    // Configurar métodos de pagamento
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

    // Preparar itens para o Mercado Pago
    const mpItems = cart.items.map((item) => ({
      id: item.product_id,
      title: item.product_name,
      quantity: item.quantity,
      unit_price: item.product_price,
      picture_url: item.product_image,
    }));

    const preferenceBody: any = {
      items: mpItems,
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
        pending: `${siteUrl}/conta/compras`,
      },
      external_reference: orderData.id,
      notification_url: `${siteUrl}/api/webhooks/mercadopago`,
      statement_descriptor: "TECH4LOOP",
    };

    if (!isLocalhost) {
      preferenceBody.auto_return = "approved";
    }

    const result = await preference.create({
      body: preferenceBody,
    });

    console.log("✅ Mercado Pago preference created:", result.id);

    return {
      success: true,
      paymentUrl: result.init_point,
    };
  } catch (error: any) {
    console.error("❌ Checkout error:", error);
    return {
      error: `Falha ao processar checkout: ${error.message || "Erro desconhecido"}`,
    };
  }
}
