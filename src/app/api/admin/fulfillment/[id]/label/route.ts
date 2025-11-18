import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { generateShippingLabel } from "@/lib/shipping-labels";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Buscar dados do pedido
    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .select(
        `
        *,
        order_items(
          *,
          products(weight, dimensions)
        )
      `
      )
      .eq("id", params.id)
      .single();

    if (error || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Calcular peso e dimensões totais
    const totalWeight = order.order_items.reduce(
      (sum: number, item: any) =>
        sum + (item.products.weight || 0.5) * item.quantity,
      0
    );

    // Gerar etiqueta
    const result = await generateShippingLabel(
      order.id,
      {
        name: process.env.COMPANY_NAME || "Tech4Loop",
        phone: process.env.COMPANY_PHONE || "11999999999",
        address: process.env.COMPANY_ADDRESS || "Rua Exemplo",
        number: process.env.COMPANY_NUMBER || "123",
        neighborhood: process.env.COMPANY_NEIGHBORHOOD || "Centro",
        city: process.env.COMPANY_CITY || "São Paulo",
        state: process.env.COMPANY_STATE || "SP",
        postalCode: process.env.COMPANY_CEP || "01000000",
      },
      {
        name: order.customer_name,
        phone: order.customer_whatsapp,
        address: order.customer_address,
        number: order.customer_number,
        complement: order.customer_complement,
        neighborhood: order.customer_neighborhood,
        city: order.customer_city,
        state: order.customer_state,
        postalCode: order.customer_cep,
      },
      {
        weight: totalWeight,
        height: 10, // Valores padrão - em produção, pegar das dimensões dos produtos
        width: 20,
        length: 30,
      }
    );

    if (result.success) {
      // Salvar tracking code no banco
      await supabaseAdmin
        .from("orders")
        .update({
          tracking_code: result.trackingCode,
          label_url: result.labelUrl,
        })
        .eq("id", params.id);

      return NextResponse.json(result);
    } else {
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error) {
    console.error("Erro ao gerar etiqueta:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
