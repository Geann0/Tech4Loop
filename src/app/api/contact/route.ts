import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import {
  checkRateLimit,
  getIdentifier,
  STRICT_RATE_LIMIT,
} from "@/lib/rateLimit";

const resend = new Resend(process.env.RESEND_API_KEY);
const supportEmail = "suporte.tech4loop@gmail.com";

export async function POST(req: NextRequest) {
  // Rate limiting
  const identifier = getIdentifier(req);
  const rateLimit = checkRateLimit(identifier, STRICT_RATE_LIMIT);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Muitas requisições. Tente novamente em alguns minutos." },
      {
        status: 429,
        headers: {
          "Retry-After": String(
            Math.ceil((rateLimit.resetTime - Date.now()) / 1000)
          ),
        },
      }
    );
  }

  try {
    const body = await req.json();
    const { name, email, phone, message, subject } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Campos obrigatórios faltando." },
        { status: 400 }
      );
    }

    await resend.emails.send({
      from: "onboarding@resend.dev", // Para produção, use um domínio verificado. Ex: 'Contato <contato@tech4loop.com>'
      to: supportEmail,
      subject: subject || "Novo Contato do Site Tech4Loop",
      reply_to: email,
      html: `
        <p><strong>Nome:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        ${phone ? `<p><strong>Telefone:</strong> ${phone}</p>` : ""}
        <hr />
        <p><strong>Mensagem:</strong></p>
        <p>${message.replace(/\n/g, "<br>")}</p>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao enviar email:", error);
    return NextResponse.json(
      { error: "Erro ao enviar a mensagem." },
      { status: 500 }
    );
  }
}
