"use server";

import { createClient } from "@/lib/supabaseClient";
import { revalidatePath } from "next/cache";

export interface Review {
  id: string;
  user_id: string;
  product_id: string;
  order_id: string;
  rating: number;
  title: string;
  comment: string;
  created_at: string;
  updated_at: string;
}

export async function createReview(prevState: any, formData: FormData) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "Usuário não autenticado", success: false };
    }

    const productId = formData.get("productId") as string;
    const orderId = formData.get("orderId") as string;
    const rating = parseInt(formData.get("rating") as string);
    const title = formData.get("title") as string;
    const comment = formData.get("comment") as string;

    // Validações
    if (!productId || !orderId) {
      return { error: "Produto ou pedido inválido", success: false };
    }

    if (!rating || rating < 1 || rating > 5) {
      return {
        error: "Avaliação deve ser entre 1 e 5 estrelas",
        success: false,
      };
    }

    if (!title || title.trim().length < 3) {
      return {
        error: "Título deve ter pelo menos 3 caracteres",
        success: false,
      };
    }

    if (!comment || comment.trim().length < 10) {
      return {
        error: "Comentário deve ter pelo menos 10 caracteres",
        success: false,
      };
    }

    // Verificar se já avaliou este produto
    const { data: existing } = await supabase
      .from("product_reviews")
      .select("id")
      .eq("user_id", user.id)
      .eq("product_id", productId)
      .single();

    if (existing) {
      return { error: "Você já avaliou este produto", success: false };
    }

    // Criar avaliação
    const { error: insertError } = await supabase
      .from("product_reviews")
      .insert({
        user_id: user.id,
        product_id: productId,
        order_id: orderId,
        rating,
        title: title.trim(),
        comment: comment.trim(),
      });

    if (insertError) {
      console.error("Erro ao criar avaliação:", insertError);
      return { error: "Erro ao salvar avaliação", success: false };
    }

    revalidatePath("/conta/avaliacoes");
    revalidatePath(`/produtos/${productId}`);
    return { error: null, success: true };
  } catch (error) {
    console.error("Erro ao criar avaliação:", error);
    return { error: "Erro ao criar avaliação", success: false };
  }
}

export async function updateReview(
  reviewId: string,
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

    const rating = parseInt(formData.get("rating") as string);
    const title = formData.get("title") as string;
    const comment = formData.get("comment") as string;

    // Validações
    if (!rating || rating < 1 || rating > 5) {
      return {
        error: "Avaliação deve ser entre 1 e 5 estrelas",
        success: false,
      };
    }

    if (!title || title.trim().length < 3) {
      return {
        error: "Título deve ter pelo menos 3 caracteres",
        success: false,
      };
    }

    if (!comment || comment.trim().length < 10) {
      return {
        error: "Comentário deve ter pelo menos 10 caracteres",
        success: false,
      };
    }

    const { error: updateError } = await supabase
      .from("product_reviews")
      .update({
        rating,
        title: title.trim(),
        comment: comment.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", reviewId)
      .eq("user_id", user.id);

    if (updateError) {
      console.error("Erro ao atualizar avaliação:", updateError);
      return { error: "Erro ao atualizar avaliação", success: false };
    }

    revalidatePath("/conta/avaliacoes");
    return { error: null, success: true };
  } catch (error) {
    console.error("Erro ao atualizar avaliação:", error);
    return { error: "Erro ao atualizar avaliação", success: false };
  }
}

export async function deleteReview(reviewId: string) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "Usuário não autenticado", success: false };
    }

    const { error: deleteError } = await supabase
      .from("product_reviews")
      .delete()
      .eq("id", reviewId)
      .eq("user_id", user.id);

    if (deleteError) {
      console.error("Erro ao deletar avaliação:", deleteError);
      return { error: "Erro ao deletar avaliação", success: false };
    }

    revalidatePath("/conta/avaliacoes");
    return { error: null, success: true };
  } catch (error) {
    console.error("Erro ao deletar avaliação:", error);
    return { error: "Erro ao deletar avaliação", success: false };
  }
}
