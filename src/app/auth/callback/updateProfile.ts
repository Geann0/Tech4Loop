"use server";

import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function updateProfile(
  prevState: { error: string | null; success: boolean },
  formData: FormData
) {
  const supabase = createServerActionClient({ cookies });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      error: "Você precisa estar logado para atualizar seu perfil.",
      success: false,
    };
  }

  const fullName = String(formData.get("fullName"));
  const whatsappNumber = String(formData.get("whatsappNumber"));

  const { error } = await supabase
    .from("profiles")
    .update({
      partner_name: fullName,
      whatsapp_number: whatsappNumber,
    })
    .eq("id", user.id);

  if (error) {
    console.error("Error updating profile:", error);
    return {
      error: "Não foi possível atualizar o perfil. Tente novamente.",
      success: false,
    };
  }

  revalidatePath("/conta");
  return { error: null, success: true };
}
