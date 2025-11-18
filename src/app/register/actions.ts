"use server";

import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { registerSchema } from "@/lib/validations";
import { z } from "zod";

export async function registerUser(formData: FormData) {
  const supabase = createServerActionClient({ cookies });

  try {
    // Extrair e validar dados
    const data = {
      email: String(formData.get("email")),
      password: String(formData.get("password")),
      confirmPassword: String(formData.get("confirmPassword")),
      fullName: String(formData.get("fullName")),
      whatsappNumber: String(formData.get("whatsappNumber")),
    };

    // 🔒 LGPD: Extrair consentimento
    const lgpdConsent = formData.get("lgpdConsent") === "true";
    const lgpdConsentDate = String(formData.get("lgpdConsentDate"));

    if (!lgpdConsent) {
      return {
        error:
          "Você precisa aceitar os Termos de Uso e Política de Privacidade.",
      };
    }

    // Validar com Zod
    const validatedData = registerSchema.parse(data);

    // Criar usuário no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: validatedData.email,
      password: validatedData.password,
      options: {
        data: {
          full_name: validatedData.fullName,
          whatsapp_number: validatedData.whatsappNumber,
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
        // Auto-confirma email em desenvolvimento (configure no Supabase: Settings > Auth > Email Auth > Disable "Enable email confirmations")
      },
    });

    if (authError) {
      console.error("Erro ao criar usuário:", authError);

      if (authError.message.includes("already registered")) {
        return { error: "Este email já está cadastrado." };
      }

      return { error: authError.message };
    }

    if (!authData.user) {
      return { error: "Erro ao criar usuário. Tente novamente." };
    }

    // 🔒 LGPD: Atualizar perfil COM consentimento
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        partner_name: validatedData.fullName,
        whatsapp_number: validatedData.whatsappNumber,
        role: "customer",
        lgpd_consent: lgpdConsent,
        lgpd_consent_date: lgpdConsentDate,
      })
      .eq("id", authData.user.id);

    if (profileError) {
      console.error("❌ ERRO CRÍTICO: Falha ao salvar consentimento LGPD!");
      console.error(profileError);
      // Não falhar cadastro, mas logar erro crítico
    } else {
      console.log(
        `✅ Consentimento LGPD salvo para usuário ${authData.user.id}`
      );
    }

    return { success: true };
  } catch (error) {
    console.error("Erro no registro:", error);

    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message };
    }

    return { error: "Erro ao criar conta. Tente novamente." };
  }
}
