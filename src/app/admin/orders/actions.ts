"use server";

import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function updateOrderStatus(orderId: string, status: string) {
  const supabase = createServerActionClient({ cookies });

  // Verificar se é admin
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Não autorizado" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin" && profile?.role !== "partner") {
    return { error: "Apenas admin ou parceiro pode atualizar pedidos" };
  }

  // Se for parceiro, verificar se o pedido pertence a ele
  if (profile?.role === "partner") {
    const { data: order } = await supabase
      .from("orders")
      .select("partner_id")
      .eq("id", orderId)
      .single();

    if (order?.partner_id !== user.id) {
      return { error: "Este pedido não pertence a você" };
    }
  }

  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId);

  if (error) {
    console.error("Error updating order:", error);
    return { error: error.message };
  }

  revalidatePath("/admin/orders");
  revalidatePath("/partner/orders");

  return { success: true };
}

export async function cancelOrder(orderId: string) {
  return updateOrderStatus(orderId, "cancelled");
}

export async function approveOrder(orderId: string) {
  return updateOrderStatus(orderId, "processing");
}

export async function shipOrder(orderId: string, trackingCode?: string) {
  const supabase = createServerActionClient({ cookies });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Não autorizado" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin" && profile?.role !== "partner") {
    return { error: "Apenas admin ou parceiro pode enviar pedidos" };
  }

  // Se for parceiro, verificar se o pedido pertence a ele
  if (profile?.role === "partner") {
    const { data: order } = await supabase
      .from("orders")
      .select("partner_id")
      .eq("id", orderId)
      .single();

    if (order?.partner_id !== user.id) {
      return { error: "Este pedido não pertence a você" };
    }
  }

  const updateData: any = { status: "shipped" };
  if (trackingCode) {
    updateData.tracking_code = trackingCode;
  }

  const { error } = await supabase
    .from("orders")
    .update(updateData)
    .eq("id", orderId);

  if (error) {
    console.error("Error shipping order:", error);
    return { error: error.message };
  }

  revalidatePath("/admin/orders");
  revalidatePath("/partner/orders");

  return { success: true };
}

export async function deliverOrder(orderId: string) {
  return updateOrderStatus(orderId, "delivered");
}
