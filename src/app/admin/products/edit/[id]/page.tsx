import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import AdminEditProductForm from "@/components/admin/AdminEditProductForm";
import Link from "next/link";
import { Product } from "@/types";

export const dynamic = "force-dynamic";

async function getProduct(id: string): Promise<Product> {
  const supabase = createServerComponentClient({ cookies });
  const { data: product, error } = await supabase
    .from("products")
    .select("*, profiles(whatsapp_number, service_regions)")
    .eq("id", id)
    .single();

  if (error || !product) {
    notFound();
  }
  return product as Product;
}

export default async function EditAdminProductPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return redirect("/admin/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") {
    return redirect("/admin/login?message=Acesso negado.");
  }

  const product = await getProduct(params.id);
  const { data: categories } = await supabase
    .from("categories")
    .select("name")
    .order("name");

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Editar Produto</h1>
        <Link href="/admin/products" className="text-neon-blue hover:underline">
          &larr; Voltar para Produtos
        </Link>
      </div>
      <AdminEditProductForm product={product} categories={categories || []} />
    </div>
  );
}
