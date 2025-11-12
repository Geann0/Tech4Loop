"use server";

import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// Função auxiliar para verificar se o usuário é um parceiro autenticado
async function getAuthenticatedPartner() {
  const supabase = createServerActionClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/admin/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, partner_name")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "partner") {
    redirect("/admin/login?message=Acesso negado.");
  }

  return { user, profile };
}

export async function createProduct(
  prevState: { error: string },
  formData: FormData
): Promise<{ error: string }> {
  const { user, profile } = await getAuthenticatedPartner();
  if (!profile) return { error: "Perfil de parceiro não encontrado." };

  const supabase = createServerActionClient({ cookies });

  const name = String(formData.get("name"));
  const price = Number(formData.get("price"));
  const category_id = String(formData.get("category_id"));
  const short_description = String(formData.get("short_description"));
  const description = String(formData.get("description"));
  const stock = Number(formData.get("stock"));
  const images = formData.getAll("images") as File[];
  let slug = name
    .toLowerCase()
    .replace(/ /g, "-")
    .replace(/[^\w-]+/g, "");

  // Checa se o slug já existe e adiciona um sufixo se necessário
  const { data: existingSlug } = await supabase
    .from("products")
    .select("slug")
    .eq("slug", slug)
    .single();

  if (existingSlug) {
    slug = `${slug}-${Math.random().toString(36).substring(2, 8)}`;
  }

  if (images.length === 0 || images[0].size === 0) {
    return { error: "Pelo menos uma imagem do produto é obrigatória." };
  }

  const imageUrls: string[] = [];
  for (const image of images) {
    const filePath = `${user.id}/${Date.now()}-${image.name}`;
    const { error: uploadError } = await supabase.storage
      .from("product_images")
      .upload(filePath, image);
    if (uploadError) {
      console.error("Upload Error:", uploadError);
      return { error: "Falha ao fazer upload das imagens." };
    }
    const { data: urlData } = supabase.storage
      .from("product_images")
      .getPublicUrl(filePath);
    imageUrls.push(urlData.publicUrl);
  }

  const { error: insertError } = await supabase
    .from("products")
    .insert({
      partner_id: user.id,
      partner_name: profile.partner_name,
      name,
      price,
      category_id,
      short_description,
      description,
      stock,
      image_urls: imageUrls,
      slug: slug,
    })
    .single();

  if (insertError) {
    console.error("Insert Product Error:", insertError);
    return {
      error: "Falha ao cadastrar o produto. O nome do produto pode já existir.",
    };
  }

  revalidatePath("/partner/dashboard");
  redirect("/partner/dashboard");
}

export async function updateProduct(
  prevState: { error: string },
  formData: FormData
): Promise<{ error: string }> {
  const { user } = await getAuthenticatedPartner();
  const supabase = createServerActionClient({ cookies });

  const id = String(formData.get("id"));
  const name = String(formData.get("name"));
  const price = Number(formData.get("price"));
  const category_id = String(formData.get("category_id"));
  const short_description = String(formData.get("short_description"));
  const description = String(formData.get("description"));
  const stock = Number(formData.get("stock"));
  const status = String(formData.get("status"));
  const newImageFile = formData.get("new_image_url") as File;
  const currentImageUrlsString = formData.get("current_image_urls")?.toString();
  const currentImageUrls = currentImageUrlsString
    ? currentImageUrlsString.split(",")
    : [];

  let finalImageUrls = [...currentImageUrls];

  if (newImageFile && newImageFile.size > 0) {
    const filePath = `${user.id}/${Date.now()}-${newImageFile.name}`;
    const { error: uploadError } = await supabase.storage
      .from("product_images")
      .upload(filePath, newImageFile);

    if (uploadError) {
      console.error("Update Upload Error:", uploadError);
      return { error: "Falha ao fazer upload da nova imagem." };
    }

    if (currentImageUrls.length > 0 && currentImageUrls[0]) {
      const oldFilePath = currentImageUrls[0].split("/product_images/")[1];
      await supabase.storage.from("product_images").remove([oldFilePath]);
    }

    finalImageUrls[0] = supabase.storage
      .from("product_images")
      .getPublicUrl(filePath).data.publicUrl;
  }

  const { error: updateError } = await supabase
    .from("products")
    .update({
      name,
      price,
      category_id,
      short_description,
      description,
      stock,
      status,
      image_urls: finalImageUrls,
    })
    .eq("id", id)
    .eq("partner_id", user.id);

  if (updateError) {
    console.error("Update Product Error:", updateError);
    return { error: "Falha ao atualizar o produto." };
  }

  revalidatePath("/partner/dashboard");
  redirect("/partner/dashboard");
}

export async function deleteProduct(formData: FormData) {
  const { user } = await getAuthenticatedPartner();
  const supabase = createServerActionClient({ cookies });

  const productId = String(formData.get("productId"));
  const imageUrls = formData
    .getAll("imageUrls")
    .filter((url) => typeof url === "string" && url) as string[];

  if (!productId) {
    throw new Error("ID do produto não fornecido.");
  }

  // Deleta o produto do banco de dados
  const { error: deleteError } = await supabase
    .from("products")
    .delete()
    .eq("id", productId)
    .eq("partner_id", user.id);

  if (deleteError) {
    console.error("Delete Error:", deleteError);
    throw new Error("Falha ao excluir o produto.");
  }

  // Deleta as imagens do storage
  if (imageUrls.length > 0) {
    const filePaths = imageUrls.map((url) => url.split("/product_images/")[1]);
    const { error: removeError } = await supabase.storage
      .from("product_images")
      .remove(filePaths);
    if (removeError) {
      console.error("Storage Remove Error:", removeError);
      // Não lança erro aqui, apenas registra, pois o produto já foi deletado.
    }
  }

  revalidatePath("/partner/dashboard");
}
