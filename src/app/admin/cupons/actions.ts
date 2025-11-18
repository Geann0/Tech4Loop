"use server";

import { createClient } from "@/lib/supabaseClient";
import { revalidatePath } from "next/cache";

export async function createCoupon(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Não autenticado" };
  }

  // Verificar se é admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    return { success: false, error: "Sem permissão" };
  }

  try {
    const code = formData.get("code") as string;
    const description = formData.get("description") as string;
    const discountType = formData.get("discount_type") as string;
    const discountValue = parseFloat(formData.get("discount_value") as string);
    const minPurchaseAmount = parseFloat(
      (formData.get("min_purchase_amount") as string) || "0"
    );
    const maxDiscountAmount =
      formData.get("max_discount_amount") as string || null;
    const usageLimit = formData.get("usage_limit") as string || null;
    const usageLimitPerUser = parseInt(
      formData.get("usage_limit_per_user") as string
    );
    const validUntil = formData.get("valid_until") as string;
    const firstPurchaseOnly =
      formData.get("first_purchase_only") === "true";

    const { error } = await supabase.from("coupons").insert({
      code: code.toUpperCase().trim(),
      description,
      discount_type: discountType,
      discount_value: discountValue,
      min_purchase_amount: minPurchaseAmount,
      max_discount_amount: maxDiscountAmount
        ? parseFloat(maxDiscountAmount)
        : null,
      usage_limit: usageLimit ? parseInt(usageLimit) : null,
      usage_limit_per_user: usageLimitPerUser,
      valid_until: validUntil ? new Date(validUntil).toISOString() : null,
      first_purchase_only: firstPurchaseOnly,
      created_by: user.id,
      status: "active",
    });

    if (error) throw error;

    revalidatePath("/admin/cupons");

    return {
      success: true,
      message: "Cupom criado com sucesso!",
    };
  } catch (error) {
    console.error("Erro ao criar cupom:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao criar cupom",
    };
  }
}

export async function updateCouponStatus(couponId: string, status: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Não autenticado" };
  }

  try {
    const { error } = await supabase
      .from("coupons")
      .update({ status })
      .eq("id", couponId);

    if (error) throw error;

    revalidatePath("/admin/cupons");

    return {
      success: true,
      message: "Status atualizado!",
    };
  } catch (error) {
    console.error("Erro ao atualizar cupom:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Erro ao atualizar cupom",
    };
  }
}

export async function deleteCoupon(couponId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Não autenticado" };
  }

  try {
    const { error } = await supabase.from("coupons").delete().eq("id", couponId);

    if (error) throw error;

    revalidatePath("/admin/cupons");

    return {
      success: true,
      message: "Cupom excluído!",
    };
  } catch (error) {
    console.error("Erro ao excluir cupom:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao excluir cupom",
    };
  }
}

export async function getCouponUsage(couponId: string) {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("coupon_usage")
      .select(
        `
        *,
        orders (
          id,
          customer_name,
          customer_email,
          total_amount,
          created_at
        )
      `
      )
      .eq("coupon_id", couponId)
      .order("used_at", { ascending: false });

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error("Erro ao buscar uso do cupom:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erro ao buscar histórico",
    };
  }
}
