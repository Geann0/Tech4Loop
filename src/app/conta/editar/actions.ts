"use server";

import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { updateProfileSchema } from "@/lib/validations";

export async function getProfile() {
  try {
    const supabase = createServerActionClient({ cookies });

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: "Usuário não autenticado",
      };
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("Profile fetch error:", profileError);
      return {
        success: false,
        error: "Erro ao carregar perfil",
      };
    }

    return {
      success: true,
      profile,
    };
  } catch (error) {
    console.error("Unexpected error:", error);
    return {
      success: false,
      error: "Erro inesperado",
    };
  }
}

export async function updateProfile(data: {
  full_name: string;
  phone?: string;
  whatsapp?: string;
}) {
  try {
    const supabase = createServerActionClient({ cookies });

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: "Usuário não autenticado",
      };
    }

    // Validate data
    const validation = updateProfileSchema.safeParse(data);
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.errors[0].message,
      };
    }

    // Update profile
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        full_name: data.full_name,
        phone: data.phone || null,
        whatsapp: data.whatsapp || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (updateError) {
      console.error("Profile update error:", updateError);
      return {
        success: false,
        error: "Erro ao atualizar perfil",
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error("Unexpected error:", error);
    return {
      success: false,
      error: "Erro inesperado",
    };
  }
}
