"use server";

import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function resetPassword(newPassword: string) {
  try {
    const supabase = createServerActionClient({ cookies });

    // Validate password strength
    if (newPassword.length < 8) {
      return {
        success: false,
        error: "A senha deve ter pelo menos 8 caracteres",
      };
    }

    // Update password
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      console.error("Password update error:", error);
      return {
        success: false,
        error: "Erro ao redefinir senha. Tente novamente.",
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
