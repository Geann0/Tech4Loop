import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import EditProductForm from "@/components/partner/EditProductForm";
import Link from "next/link";
import { Product } from "@/types";

export const dynamic = "force-dynamic";

async function getProduct(id: string, userId: string): Promise<Product> {
  const supabase = createServerComponentClient({ cookies });
  const { data: product, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .eq("partner_id", userId) // Garante que o parceiro só pode editar seu próprio produto
    .single();

  if (error || !product) {
    notFound();
  }
  return product as Product;
}

export default async function EditPartnerProductPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return redirect("/admin/login");

  const product = await getProduct(params.id, user.id);
  const { data: categories } = await supabase
    .from("categories")
    .select("name")
    .order("name");

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Editar Produto</h1>
        <Link
          href="/partner/dashboard"
          className="text-neon-blue hover:underline"
        >
          &larr; Voltar para o Painel
        </Link>
      </div>
      <EditProductForm product={product} categories={categories || []} />
    </div>
  );
}
