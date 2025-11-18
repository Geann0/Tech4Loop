import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { MercadoPagoConfig, Payment } from "mercadopago";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  if (!start || !end) {
    return NextResponse.json({ error: "Missing date range" }, { status: 400 });
  }

  try {
    // Buscar pedidos no período
    const { data: orders, error } = await supabaseAdmin
      .from("orders")
      .select("*")
      .gte("created_at", `${start}T00:00:00`)
      .lte("created_at", `${end}T23:59:59`)
      .eq("payment_status", "approved")
      .order("created_at", { ascending: false });

    if (error) throw error;

    const client = new MercadoPagoConfig({
      accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
    });
    const payment = new Payment(client);

    // Buscar detalhes do Mercado Pago para cada pedido
    const items = await Promise.all(
      (orders || []).map(async (order) => {
        let mpData = null;

        if (order.payment_id) {
          try {
            const paymentInfo = await payment.get({ id: order.payment_id });
            mpData = {
              mp_gross_amount: paymentInfo.transaction_amount || 0,
              mp_fee_amount:
                paymentInfo.fee_details?.reduce(
                  (sum: number, fee: any) => sum + fee.amount,
                  0
                ) || 0,
              mp_net_amount:
                (paymentInfo.transaction_amount || 0) -
                (paymentInfo.fee_details?.reduce(
                  (sum: number, fee: any) => sum + fee.amount,
                  0
                ) || 0),
              mp_payout_date: paymentInfo.money_release_date,
            };
          } catch (error) {
            console.error(
              `Erro ao buscar dados MP para pedido ${order.id}:`,
              error
            );
          }
        }

        // Determinar status de reconciliação
        let status: "matched" | "pending" | "discrepancy" = "pending";
        if (mpData) {
          const orderTotal = parseFloat(order.total_amount);
          const mpTotal = mpData.mp_gross_amount || 0;

          if (Math.abs(orderTotal - mpTotal) < 0.01) {
            status = "matched";
          } else {
            status = "discrepancy";
          }
        }

        return {
          order_id: order.id,
          order_date: order.created_at,
          customer_name: order.customer_name,
          total_amount: parseFloat(order.total_amount),
          payment_method: order.payment_method,
          payment_id: order.payment_id,
          payment_status: order.payment_status,
          ...mpData,
          status,
        };
      })
    );

    return NextResponse.json({ items });
  } catch (error) {
    console.error("Erro na reconciliação:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
