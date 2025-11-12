"use server";

import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function isAdmin() {
  const supabase = createServerActionClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  return profile?.role === "admin";
}

export async function createCategory(
  prevState: { error: string },
  formData: FormData
): Promise<{ error: string }> {
  if (!(await isAdmin())) return { error: "Acesso negado." };

  const name = String(formData.get("name"));
  if (!name) return { error: "O nome da categoria é obrigatório." };

  const supabase = createServerActionClient({ cookies });
  const { error } = await supabase.from("categories").insert({ name });

  if (error) {
    console.error("Create Category Error:", error);
    return { error: "Falha ao criar a categoria. O nome pode já existir." };
  }

  revalidatePath("/admin/categories");
  return { error: "" };
}

export async function updateCategory(
  prevState: { error: string },
  formData: FormData
): Promise<{ error: string }> {
  if (!(await isAdmin())) return { error: "Acesso negado." };

  const id = String(formData.get("id"));
  const name = String(formData.get("name"));
  if (!id || !name) return { error: "Dados inválidos." };

  const supabase = createServerActionClient({ cookies });
  const { error } = await supabase
    .from("categories")
    .update({ name })
    .eq("id", id);

  if (error) {
    console.error("Update Category Error:", error);
    return { error: "Falha ao atualizar a categoria." };
  }

  revalidatePath("/admin/categories");
  redirect("/admin/categories");
}

export async function deleteCategory(formData: FormData) {
  if (!(await isAdmin())) throw new Error("Acesso negado.");

  const id = String(formData.get("id"));
  if (!id) throw new Error("ID da categoria não fornecido.");

  const supabase = createServerActionClient({ cookies });
  const { error } = await supabase.from("categories").delete().eq("id", id);

  if (error) {
    console.error("Delete Category Error:", error);
    throw new Error("Falha ao excluir a categoria.");
  }

  revalidatePath("/admin/categories");
}
