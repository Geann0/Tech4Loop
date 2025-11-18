"use server";

import { createClient } from "@/lib/supabaseClient";
import { revalidatePath } from "next/cache";

export interface Address {
  id: string;
  user_id: string;
  label: string;
  recipient_name: string;
  zip_code: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export async function createAddress(prevState: any, formData: FormData) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "Usuário não autenticado", success: false };
    }

    const label = formData.get("label") as string;
    const recipientName = formData.get("recipientName") as string;
    const zipCode = formData.get("zipCode") as string;
    const street = formData.get("street") as string;
    const number = formData.get("number") as string;
    const complement = formData.get("complement") as string;
    const neighborhood = formData.get("neighborhood") as string;
    const city = formData.get("city") as string;
    const state = formData.get("state") as string;
    const isDefault = formData.get("isDefault") === "true";

    // Validações
    if (!label || label.trim().length < 2) {
      return {
        error: "Nome do endereço deve ter pelo menos 2 caracteres",
        success: false,
      };
    }

    if (!recipientName || recipientName.trim().length < 3) {
      return {
        error: "Nome do destinatário deve ter pelo menos 3 caracteres",
        success: false,
      };
    }

    if (!zipCode || zipCode.replace(/\D/g, "").length !== 8) {
      return { error: "CEP inválido", success: false };
    }

    if (!street || !number || !neighborhood || !city || !state) {
      return {
        error: "Todos os campos obrigatórios devem ser preenchidos",
        success: false,
      };
    }

    // Se é default, remover default dos outros
    if (isDefault) {
      await supabase
        .from("user_addresses")
        .update({ is_default: false })
        .eq("user_id", user.id);
    }

    const { error: insertError } = await supabase
      .from("user_addresses")
      .insert({
        user_id: user.id,
        label: label.trim(),
        recipient_name: recipientName.trim(),
        zip_code: zipCode.replace(/\D/g, ""),
        street: street.trim(),
        number: number.trim(),
        complement: complement?.trim() || null,
        neighborhood: neighborhood.trim(),
        city: city.trim(),
        state: state.trim().toUpperCase(),
        is_default: isDefault,
      });

    if (insertError) {
      console.error("Erro ao criar endereço:", insertError);
      return { error: "Erro ao salvar endereço", success: false };
    }

    revalidatePath("/conta/enderecos");
    return { error: null, success: true };
  } catch (error) {
    console.error("Erro ao criar endereço:", error);
    return { error: "Erro ao criar endereço", success: false };
  }
}

export async function updateAddress(
  addressId: string,
  prevState: any,
  formData: FormData
) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "Usuário não autenticado", success: false };
    }

    const label = formData.get("label") as string;
    const recipientName = formData.get("recipientName") as string;
    const zipCode = formData.get("zipCode") as string;
    const street = formData.get("street") as string;
    const number = formData.get("number") as string;
    const complement = formData.get("complement") as string;
    const neighborhood = formData.get("neighborhood") as string;
    const city = formData.get("city") as string;
    const state = formData.get("state") as string;
    const isDefault = formData.get("isDefault") === "true";

    // Validações
    if (!label || label.trim().length < 2) {
      return {
        error: "Nome do endereço deve ter pelo menos 2 caracteres",
        success: false,
      };
    }

    if (!recipientName || recipientName.trim().length < 3) {
      return {
        error: "Nome do destinatário deve ter pelo menos 3 caracteres",
        success: false,
      };
    }

    if (!zipCode || zipCode.replace(/\D/g, "").length !== 8) {
      return { error: "CEP inválido", success: false };
    }

    // Se é default, remover default dos outros
    if (isDefault) {
      await supabase
        .from("user_addresses")
        .update({ is_default: false })
        .eq("user_id", user.id);
    }

    const { error: updateError } = await supabase
      .from("user_addresses")
      .update({
        label: label.trim(),
        recipient_name: recipientName.trim(),
        zip_code: zipCode.replace(/\D/g, ""),
        street: street.trim(),
        number: number.trim(),
        complement: complement?.trim() || null,
        neighborhood: neighborhood.trim(),
        city: city.trim(),
        state: state.trim().toUpperCase(),
        is_default: isDefault,
        updated_at: new Date().toISOString(),
      })
      .eq("id", addressId)
      .eq("user_id", user.id);

    if (updateError) {
      console.error("Erro ao atualizar endereço:", updateError);
      return { error: "Erro ao atualizar endereço", success: false };
    }

    revalidatePath("/conta/enderecos");
    return { error: null, success: true };
  } catch (error) {
    console.error("Erro ao atualizar endereço:", error);
    return { error: "Erro ao atualizar endereço", success: false };
  }
}

export async function deleteAddress(addressId: string) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "Usuário não autenticado", success: false };
    }

    const { error: deleteError } = await supabase
      .from("user_addresses")
      .delete()
      .eq("id", addressId)
      .eq("user_id", user.id);

    if (deleteError) {
      console.error("Erro ao deletar endereço:", deleteError);
      return { error: "Erro ao deletar endereço", success: false };
    }

    revalidatePath("/conta/enderecos");
    return { error: null, success: true };
  } catch (error) {
    console.error("Erro ao deletar endereço:", error);
    return { error: "Erro ao deletar endereço", success: false };
  }
}

export async function setDefaultAddress(addressId: string) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "Usuário não autenticado", success: false };
    }

    // Remover default de todos
    await supabase
      .from("user_addresses")
      .update({ is_default: false })
      .eq("user_id", user.id);

    // Definir novo default
    const { error: updateError } = await supabase
      .from("user_addresses")
      .update({ is_default: true, updated_at: new Date().toISOString() })
      .eq("id", addressId)
      .eq("user_id", user.id);

    if (updateError) {
      console.error("Erro ao definir endereço padrão:", updateError);
      return { error: "Erro ao definir endereço padrão", success: false };
    }

    revalidatePath("/conta/enderecos");
    return { error: null, success: true };
  } catch (error) {
    console.error("Erro ao definir endereço padrão:", error);
    return { error: "Erro ao definir endereço padrão", success: false };
  }
}
