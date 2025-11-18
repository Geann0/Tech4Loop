import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  try {
    let query = supabaseAdmin
      .from("orders")
      .select(
        `
        *,
        order_items(
          *,
          products(name, sku, image_urls, stock_quantity)
        )
      `
      )
      .eq("payment_status", "approved")
      .order("created_at", { ascending: true });

    if (status && status !== "all") {
      query = query.eq("status", status);
    } else {
      // Mostrar apenas pedidos em fulfillment
      query = query.in("status", ["processing", "picked", "packed"]);
    }

    const { data: orders, error } = await query;

    if (error) throw error;

    return NextResponse.json({ orders: orders || [] });
  } catch (error) {
    console.error("Erro ao buscar pedidos WMS:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
