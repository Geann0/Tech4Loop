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

    // Atualizar perfil (se já não foi criado pelo trigger)
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        partner_name: validatedData.fullName,
        whatsapp_number: validatedData.whatsappNumber,
        role: "customer",
      })
      .eq("id", authData.user.id);

    if (profileError) {
      console.error("Erro ao atualizar perfil:", profileError);
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
