import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get("status");
  const externalReference = searchParams.get("external_reference"); // Nosso ID do pedido

  if (!externalReference) {
    return NextResponse.redirect(
      new URL("/compra-falha?reason=no_ref", request.url)
    );
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Atualiza o status do pedido no banco de dados
  const { error } = await supabaseAdmin
    .from("orders")
    .update({ payment_status: status })
    .eq("id", externalReference);

  if (error) {
    console.error("Error updating order status:", error);
    // Mesmo com erro, redireciona o cliente para uma página de feedback
  }

  // Redireciona o cliente para a página de sucesso ou falha
  if (status === "approved") {
    return NextResponse.redirect(new URL("/compra-sucesso", request.url));
  } else {
    return NextResponse.redirect(
      new URL(`/compra-falha?reason=${status}`, request.url)
    );
  }
}
