import { NextRequest, NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import NewOrderEmail from "@/components/emails/NewOrderEmail";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { type, data } = body;

  if (type === "payment") {
    const client = new MercadoPagoConfig({
      accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
    });
    const payment = new Payment(client);

    try {
      const paymentInfo = await payment.get({ id: data.id });

      if (
        paymentInfo &&
        paymentInfo.external_reference &&
        paymentInfo.status === "approved"
      ) {
        const orderId = paymentInfo.external_reference;

        const { error: updateError } = await supabaseAdmin
          .from("orders")
          .update({ status: "approved", payment_id: data.id })
          .eq("id", orderId);

        if (updateError)
          throw new Error(`Error updating order: ${updateError.message}`);

        const { data: orderDetails } = await supabaseAdmin
          .from("orders")
          .select("*, products(*, profiles(email))")
          .eq("id", orderId)
          .single();

        if (orderDetails) {
          const partnerEmail = orderDetails.products?.profiles?.email;
          const adminEmail = process.env.ADMIN_EMAIL;
          const recipientEmail = partnerEmail || adminEmail;

          if (recipientEmail) {
            await resend.emails.send({
              from: "Vendas <vendas@tech4loop.com.br>", // Configure um domínio no Resend para usar seu próprio email
              to: [recipientEmail],
              subject: `Novo Pedido Recebido: ${orderDetails.products.name}`,
              react: NewOrderEmail({ order: orderDetails }),
            });
          }
        }
      }
    } catch (error) {
      console.error("Webhook Error:", error);
      return NextResponse.json(
        { status: "Error processing webhook" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ status: "Received" }, { status: 200 });
}
