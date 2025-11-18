"use server";

import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { validateImageFiles } from "@/lib/imageValidation";

// Cria um cliente Supabase com privilégios de administrador (service_role).
// Este cliente ignora as políticas de RLS e deve ser usado APENAS no servidor.
const getSupabaseAdminClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      "Variáveis de ambiente do Supabase não configuradas corretamente."
    );
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

// Função auxiliar para verificar se o usuário logado é um admin.
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

export async function createPartner(
  prevState: { error: string },
  formData: FormData
): Promise<{ error: string }> {
  if (!(await isAdmin())) {
    return { error: "Acesso negado." };
  }

  const partnerName = String(formData.get("partner_name"));
  const email = String(formData.get("email"));
  const password = String(formData.get("password"));
  const whatsappNumber = String(formData.get("whatsapp_number")) || null;
  const serviceRegions = String(formData.get("service_regions"))
    .split(",")
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean);

  if (!partnerName || !email || !password) {
    return { error: "Nome, email e senha são obrigatórios." };
  }

  const supabaseAdmin = getSupabaseAdminClient();

  const { data: newUserData, error: newUserError } =
    await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // O usuário já é criado como confirmado.
    });

  if (newUserError) {
    console.error("Erro ao criar usuário:", newUserError);
    return { error: newUserError.message };
  }

  // Atualiza o perfil que foi criado automaticamente pelo gatilho do banco de dados.
  const { error: profileError } = await supabaseAdmin
    .from("profiles")
    .update({
      partner_name: partnerName,
      whatsapp_number: whatsappNumber,
      service_regions: serviceRegions,
      role: "partner", // Promove o usuário para parceiro
    })
    .eq("id", newUserData.user.id);

  if (profileError) {
    console.error("Erro ao atualizar perfil:", profileError);
    // Se a atualização do perfil falhar, deleta o usuário recém-criado para evitar inconsistências.
    await supabaseAdmin.auth.admin.deleteUser(newUserData.user.id);
    return { error: profileError.message };
  }

  revalidatePath("/admin/partners");
  return { error: "" };
}

export async function toggleUserBan(formData: FormData) {
  if (!(await isAdmin())) {
    throw new Error("Acesso negado.");
  }

  const userId = String(formData.get("userId"));
  const isBanned = formData.get("isBanned") === "true";

  const supabaseAdmin = getSupabaseAdminClient();

  const { error } = await supabaseAdmin
    .from("profiles")
    .update({ is_banned: !isBanned })
    .eq("id", userId);

  if (error) {
    console.error("Error updating user status:", error);
    throw new Error("Falha ao atualizar o status do usuário.");
  }

  revalidatePath("/admin/partners");
}

export async function deletePartner(formData: FormData) {
  if (!(await isAdmin())) {
    throw new Error("Acesso negado.");
  }

  const userId = String(formData.get("userId"));
  if (!userId) {
    throw new Error("ID do usuário não fornecido.");
  }

  const supabaseAdmin = getSupabaseAdminClient();

  // Deletar o usuário do sistema de autenticação.
  // A exclusão em cascata (ON DELETE CASCADE) removerá o perfil associado.
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

  if (error) {
    console.error("Error deleting user:", error);
    throw new Error("Falha ao excluir o parceiro.");
  }

  revalidatePath("/admin/partners");
}

export async function updatePartner(
  prevState: { error: string },
  formData: FormData
): Promise<{ error: string }> {
  if (!(await isAdmin())) {
    return { error: "Acesso negado." };
  }

  const userId = String(formData.get("id"));
  const partnerName = String(formData.get("partner_name"));
  const whatsappNumber = String(formData.get("whatsapp_number")) || null;
  const serviceRegions = String(formData.get("service_regions"))
    .split(",")
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean);

  if (!userId || !partnerName) {
    return { error: "Dados inválidos." };
  }

  const supabaseAdmin = getSupabaseAdminClient();

  const { error } = await supabaseAdmin
    .from("profiles")
    .update({
      partner_name: partnerName,
      whatsapp_number: whatsappNumber,
      service_regions: serviceRegions,
    })
    .eq("id", userId);

  if (error) {
    console.error("Error updating partner:", error);
    return { error: "Falha ao atualizar o parceiro." };
  }

  revalidatePath("/admin/partners");
  redirect("/admin/partners");
}

export async function createAdminProduct(
  prevState: { error: string },
  formData: FormData
): Promise<{ error: string }> {
  if (!(await isAdmin())) {
    return { error: "Acesso negado." };
  }

  const supabaseAdmin = getSupabaseAdminClient();

  const name = String(formData.get("name"));
  const price = Number(formData.get("price"));
  const old_price = formData.get("old_price")
    ? Number(formData.get("old_price"))
    : null;
  const category_id = String(formData.get("category_id"));
  const short_description = String(formData.get("short_description"));
  const description = String(formData.get("description"));
  const stock = Number(formData.get("stock"));
  const partner_id = String(formData.get("partner_id")) || null; // Pode ser vazio
  const brand = String(formData.get("brand"));
  const condition = String(formData.get("condition"));
  const availability = String(formData.get("availability"));
  const images = formData.getAll("images") as File[];

  // Validações dos novos campos
  if (!brand || brand.trim() === "") {
    return { error: "Marca é obrigatória." };
  }
  if (!condition || !["new", "used", "refurbished"].includes(condition)) {
    return { error: "Condição inválida." };
  }
  if (
    !availability ||
    !["in_stock", "low_stock", "pre_order", "out_of_stock"].includes(
      availability
    )
  ) {
    return { error: "Disponibilidade inválida." };
  }

  // Filtrar apenas imagens válidas (não vazias)
  const validImages = images.filter((img) => img && img.size > 0);

  console.log(`📷 Total de imagens recebidas: ${images.length}`);
  console.log(`✅ Imagens válidas (não vazias): ${validImages.length}`);

  let slug = name
    .toLowerCase()
    .replace(/ /g, "-")
    .replace(/[^\w-]+/g, "");

  // Verifica se o slug já existe
  const { data: existingSlug } = await supabaseAdmin
    .from("products")
    .select("slug")
    .eq("slug", slug)
    .single();

  if (existingSlug) {
    slug += `-${Date.now()}`; // Adiciona um sufixo para tornar o slug único
  }

  // Validação de imagens
  const imageValidation = validateImageFiles(validImages);
  if (!imageValidation.valid) {
    return { error: imageValidation.error || "Imagens inválidas" };
  }

  // Define partner_name baseado no partner_id
  let partnerName = "Tech4Loop";
  let uploadPartnerId = "tech4loop-admin"; // Pasta padrão para produtos da loja

  if (partner_id) {
    const { data: partnerProfile } = await supabaseAdmin
      .from("profiles")
      .select("partner_name")
      .eq("id", partner_id)
      .single();

    if (!partnerProfile) {
      return { error: "Parceiro não encontrado." };
    }

    partnerName = partnerProfile.partner_name;
    uploadPartnerId = partner_id;
  }

  const imageUrls: string[] = [];
  for (const image of validImages) {
    // Sanitizar nome do arquivo: remover caracteres especiais e acentos
    const sanitizedFileName = image.name
      .normalize("NFD") // Decompõe caracteres acentuados
      .replace(/[\u0300-\u036f]/g, "") // Remove acentos
      .replace(/[^a-zA-Z0-9._-]/g, "_") // Substitui caracteres especiais por _
      .replace(/_{2,}/g, "_") // Remove underscores duplicados
      .toLowerCase();

    const filePath = `${uploadPartnerId}/${Date.now()}-${sanitizedFileName}`;
    console.log(`📤 Fazendo upload: ${filePath}, tamanho: ${image.size} bytes`);

    const { error: uploadError } = await supabaseAdmin.storage
      .from("product_images")
      .upload(filePath, image);

    if (uploadError) {
      console.error("❌ Upload Error:", uploadError);
      return {
        error: `Falha ao fazer upload: ${uploadError.message || "Erro desconhecido"}. Verifique se o bucket 'product_images' existe e está público.`,
      };
    }

    const { data: urlData } = supabaseAdmin.storage
      .from("product_images")
      .getPublicUrl(filePath);
    imageUrls.push(urlData.publicUrl);
    console.log(`✅ Upload concluído: ${urlData.publicUrl}`);
  }

  console.log(`🎉 Total de ${imageUrls.length} imagens enviadas com sucesso`);

  // Objeto de inserção explícito para garantir que 'category' não seja enviado
  const productData = {
    partner_id: partner_id,
    partner_name: partnerName,
    name,
    price,
    old_price,
    category_id,
    short_description,
    description,
    stock,
    brand,
    condition,
    availability,
    image_urls: imageUrls,
    slug: slug,
  };

  const { error: insertError } = await supabaseAdmin
    .from("products")
    .insert(productData)
    .single();

  if (insertError) {
    console.error("Insert Product Error:", insertError);
    return {
      error:
        "Falha ao cadastrar o produto. Verifique os dados e tente novamente.",
    };
  }

  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function updateAdminProduct(
  prevState: { error: string },
  formData: FormData
): Promise<{ error: string }> {
  if (!(await isAdmin())) {
    return { error: "Acesso negado." };
  }
  const supabaseAdmin = getSupabaseAdminClient();

  const id = String(formData.get("id"));
  const name = String(formData.get("name"));
  const price = Number(formData.get("price"));
  const old_price = formData.get("old_price")
    ? Number(formData.get("old_price"))
    : null;
  const brand = String(formData.get("brand") || "");
  const condition = String(formData.get("condition") || "");
  const availability = String(formData.get("availability") || "");
  const category_id = String(formData.get("category_id"));
  const short_description = String(formData.get("short_description"));
  const description = String(formData.get("description"));
  const stock = Number(formData.get("stock"));
  const newImageFile = formData.get("new_image_url") as File;
  const currentImageUrlsString = formData.get("current_image_urls")?.toString();
  const currentImageUrls = currentImageUrlsString
    ? currentImageUrlsString.split(",")
    : [];

  // Validar campos obrigatórios
  if (!brand || brand.trim() === "") {
    return { error: "Marca é obrigatória." };
  }

  const allowedConditions = ["new", "used", "refurbished"];
  if (!condition || !allowedConditions.includes(condition)) {
    return { error: "Condição inválida. Use: novo, usado ou recondicionado." };
  }

  const allowedAvailability = [
    "in_stock",
    "low_stock",
    "pre_order",
    "out_of_stock",
  ];
  if (!availability || !allowedAvailability.includes(availability)) {
    return { error: "Disponibilidade inválida." };
  }

  const finalImageUrls = [...currentImageUrls];

  if (newImageFile && newImageFile.size > 0) {
    // Sanitizar nome do arquivo
    const sanitizedFileName = newImageFile.name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9._-]/g, "_")
      .replace(/_{2,}/g, "_")
      .toLowerCase();

    const filePath = `${Date.now()}-${sanitizedFileName}`;
    const { error: uploadError } = await supabaseAdmin.storage
      .from("product_images")
      .upload(filePath, newImageFile);

    if (uploadError) {
      console.error("Update Upload Error:", uploadError);
      return { error: "Falha ao fazer upload da nova imagem." };
    }

    if (currentImageUrls[0]) {
      const oldFilePath = currentImageUrls[0].split("/product_images/")[1];
      await supabaseAdmin.storage.from("product_images").remove([oldFilePath]);
    }

    finalImageUrls[0] = supabaseAdmin.storage
      .from("product_images")
      .getPublicUrl(filePath).data.publicUrl;
  }

  // Objeto de atualização explícito
  const updateData = {
    name,
    price,
    old_price,
    brand,
    condition,
    availability,
    category_id,
    short_description,
    description,
    stock,
    image_urls: finalImageUrls,
  };

  const { error: updateError } = await supabaseAdmin
    .from("products")
    .update(updateData)
    .eq("id", id);

  if (updateError) {
    console.error("Update Error:", updateError);
    return { error: "Falha ao atualizar o produto." };
  }

  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function toggleProductStatus(formData: FormData) {
  if (!(await isAdmin())) {
    throw new Error("Acesso negado.");
  }

  const productId = String(formData.get("productId"));
  const currentStatus = String(formData.get("currentStatus"));

  if (!productId) {
    throw new Error("ID do produto não fornecido.");
  }

  const newStatus = currentStatus === "active" ? "inactive" : "active";

  const supabaseAdmin = getSupabaseAdminClient();
  const { error } = await supabaseAdmin
    .from("products")
    .update({ status: newStatus })
    .eq("id", productId);

  if (error) {
    console.error("Error toggling product status:", error);
    throw new Error("Falha ao alterar o status do produto.");
  }

  revalidatePath("/admin/products");
}

export async function deleteAdminProduct(formData: FormData) {
  if (!(await isAdmin())) {
    throw new Error("Acesso negado.");
  }

  const productId = String(formData.get("productId"));
  const imageUrls = formData
    .getAll("imageUrls")
    .filter((url) => typeof url === "string" && url) as string[];

  if (!productId) {
    throw new Error("ID do produto não fornecido.");
  }

  const supabaseAdmin = getSupabaseAdminClient();

  const { error: deleteError } = await supabaseAdmin
    .from("products")
    .delete()
    .eq("id", productId);

  if (deleteError) {
    console.error("Error deleting product:", deleteError);
    throw new Error("Falha ao excluir o produto.");
  }

  if (imageUrls.length > 0) {
    const filePaths = imageUrls.map((url) => url.split("/product_images/")[1]);
    const { error: removeError } = await supabaseAdmin.storage
      .from("product_images")
      .remove(filePaths);
    if (removeError) {
      console.error("Storage Remove Error:", removeError);
    }
  }

  revalidatePath("/admin/products");
}
