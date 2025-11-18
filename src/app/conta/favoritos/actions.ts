"use server";

import { createClient } from "@/lib/supabaseClient";
import { revalidatePath } from "next/cache";

export interface Favorite {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
}

export async function toggleFavorite(productId: string) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "Usuário não autenticado", success: false };
    }

    // Verificar se já existe
    const { data: existing } = await supabase
      .from("favorites")
      .select("id")
      .eq("user_id", user.id)
      .eq("product_id", productId)
      .single();

    if (existing) {
      // Remover dos favoritos
      const { error: deleteError } = await supabase
        .from("favorites")
        .delete()
        .eq("id", existing.id);

      if (deleteError) {
        console.error("Erro ao remover favorito:", deleteError);
        return {
          error: "Erro ao remover dos favoritos",
          success: false,
          isFavorited: true,
        };
      }

      revalidatePath("/conta/favoritos");
      return { error: null, success: true, isFavorited: false };
    } else {
      // Adicionar aos favoritos
      const { error: insertError } = await supabase.from("favorites").insert({
        user_id: user.id,
        product_id: productId,
      });

      if (insertError) {
        console.error("Erro ao adicionar favorito:", insertError);
        return {
          error: "Erro ao adicionar aos favoritos",
          success: false,
          isFavorited: false,
        };
      }

      revalidatePath("/conta/favoritos");
      return { error: null, success: true, isFavorited: true };
    }
  } catch (error) {
    console.error("Erro ao alternar favorito:", error);
    return { error: "Erro ao processar favorito", success: false };
  }
}

export async function checkIsFavorite(productId: string) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return false;
    }

    const { data } = await supabase
      .from("favorites")
      .select("id")
      .eq("user_id", user.id)
      .eq("product_id", productId)
      .single();

    return !!data;
  } catch (error) {
    return false;
  }
}
