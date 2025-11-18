import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { trackCorreios } from "@/lib/shipping-labels";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .select("*")
      .eq("id", params.orderId)
      .single();

    if (error || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Buscar eventos de rastreio se tiver tracking code
    let events: any[] = [];
    if (order.tracking_code) {
      const trackingData = await trackCorreios(order.tracking_code);
      events = trackingData.events;
    }

    // Calcular previsão de entrega (7 dias úteis após envio)
    let estimatedDelivery = null;
    if (order.status === "shipped" && order.updated_at) {
      const shipDate = new Date(order.updated_at);
      estimatedDelivery = new Date(
        shipDate.getTime() + 7 * 24 * 60 * 60 * 1000
      );
    }

    return NextResponse.json({
      order_id: order.id,
      status: order.status,
      tracking_code: order.tracking_code,
      customer_name: order.customer_name,
      total_amount: order.total_amount,
      created_at: order.created_at,
      estimated_delivery: estimatedDelivery,
      events,
    });
  } catch (error) {
    console.error("Erro ao buscar rastreamento:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
