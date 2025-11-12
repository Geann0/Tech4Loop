import { NextRequest, NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { createClient } from "@supabase/supabase-js";

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
});
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  // Adiciona validação de segurança com token
  const secret = request.headers.get("x-secret-token");
  if (secret !== process.env.MERCADO_PAGO_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    if (body.type === "payment") {
      const paymentId = body.data.id;

      try {
        const paymentClient = new Payment(client);
        const payment = await paymentClient.get({ id: Number(paymentId) });

        if (payment && payment.external_reference) {
          const orderId = payment.external_reference;
          const paymentStatus = payment.status; // ex: 'approved', 'rejected'

          // 1. Atualiza o status do pedido no seu banco de dados
          const { error: updateError } = await supabaseAdmin
            .from("orders")
            .update({ status: paymentStatus })
            .eq("id", orderId);

          if (updateError) {
            console.error("Webhook order update error:", updateError);
            return NextResponse.json(
              { error: "Failed to update order status" },
              { status: 500 }
            );
          }

          // 2. Se o pagamento foi aprovado, atualiza o estoque
          if (paymentStatus === "approved") {
            // Busca os itens do pedido
            const { data: orderItems, error: itemsError } = await supabaseAdmin
              .from("order_items")
              .select("product_id, quantity")
              .eq("order_id", orderId);

            if (itemsError) {
              console.error("Webhook: Error fetching order items:", itemsError);
              // O status do pedido foi atualizado, mas o estoque não. Requer atenção manual.
              return NextResponse.json(
                { error: "Could not fetch order items to update stock." },
                { status: 500 }
              );
            }

            // Atualiza o estoque para cada item do pedido
            for (const item of orderItems) {
              if (item.product_id && item.quantity) {
                // Usando uma RPC para decrementar o estoque de forma atômica
                const { error: stockError } = await supabaseAdmin.rpc(
                  "decrement_stock",
                  {
                    p_product_id: item.product_id,
                    p_quantity: item.quantity,
                  }
                );

                if (stockError) {
                  console.error(
                    `Webhook: Error decrementing stock for product ${item.product_id}:`,
                    stockError
                  );
                  // Novamente, requer atenção manual.
                }
              }
            }
          }
        }
      } catch (error) {
        console.error("Webhook processing error:", error);
        return NextResponse.json(
          { error: "Internal server error" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
