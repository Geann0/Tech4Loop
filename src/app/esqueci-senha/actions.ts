"use server";

import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function sendPasswordResetEmail(email: string) {
  try {
    const supabase = createServerActionClient({ cookies });

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        success: false,
        error: "Email inválido",
      };
    }

    // Send password reset email
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/redefinir-senha`,
    });

    if (error) {
      console.error("Password reset error:", error);
      return {
        success: false,
        error: "Erro ao enviar email de recuperação. Tente novamente.",
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error("Unexpected error:", error);
    return {
      success: false,
      error: "Erro inesperado. Tente novamente mais tarde.",
    };
  }
}
