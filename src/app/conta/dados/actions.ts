"use server";

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

interface UpdateDataState {
  error?: string | null;
  success?: boolean;
}

export async function updatePersonalData(
  prevState: UpdateDataState,
  formData: FormData
): Promise<UpdateDataState> {
  try {
    const supabase = createServerComponentClient({ cookies });

    // Verificar autenticação
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "Não autenticado" };
    }

    const profileId = String(formData.get("profileId"));
    const name = String(formData.get("name"));
    const whatsapp = String(formData.get("whatsapp")).replace(/\D/g, "");

    // Validações
    if (!name || name.trim().length < 3) {
      return { error: "Nome deve ter pelo menos 3 caracteres" };
    }

    if (!whatsapp || (whatsapp.length !== 10 && whatsapp.length !== 11)) {
      return { error: "Telefone inválido" };
    }

    // Atualizar dados
    const { error } = await supabase
      .from("profiles")
      .update({
        partner_name: name.trim(),
        whatsapp_number: whatsapp,
        updated_at: new Date().toISOString(),
      })
      .eq("id", profileId)
      .eq("id", user.id); // Segurança: só pode atualizar próprio perfil

    if (error) {
      console.error("Erro ao atualizar perfil:", error);
      return { error: "Erro ao atualizar dados. Tente novamente." };
    }

    revalidatePath("/conta");
    revalidatePath("/conta/dados");

    return { success: true };
  } catch (error) {
    console.error("Erro:", error);
    return { error: "Erro inesperado. Tente novamente." };
  }
}

export async function updatePassword(
  prevState: UpdateDataState,
  formData: FormData
): Promise<UpdateDataState> {
  try {
    const supabase = createServerComponentClient({ cookies });

    const currentPassword = String(formData.get("currentPassword"));
    const newPassword = String(formData.get("newPassword"));
    const confirmPassword = String(formData.get("confirmPassword"));

    // Validações
    if (!currentPassword || !newPassword || !confirmPassword) {
      return { error: "Todos os campos são obrigatórios" };
    }

    if (newPassword !== confirmPassword) {
      return { error: "As senhas não coincidem" };
    }

    if (newPassword.length < 8) {
      return { error: "A nova senha deve ter pelo menos 8 caracteres" };
    }

    // Validar senha forte
    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasNumber = /\d/.test(newPassword);
    const hasSpecial = /[!@#$%^&*_\-]/.test(newPassword);

    if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecial) {
      return {
        error:
          "A senha deve conter letra maiúscula, minúscula, número e caractere especial",
      };
    }

    // Tentar fazer login com senha atual para validar
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      return { error: "Usuário não encontrado" };
    }

    // Verificar senha atual (re-autenticar)
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });

    if (signInError) {
      return { error: "Senha atual incorreta" };
    }

    // Atualizar senha
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      console.error("Erro ao atualizar senha:", updateError);
      return { error: "Erro ao atualizar senha. Tente novamente." };
    }

    return { success: true };
  } catch (error) {
    console.error("Erro:", error);
    return { error: "Erro inesperado. Tente novamente." };
  }
}
