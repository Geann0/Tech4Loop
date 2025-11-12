import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { Product, Category } from "@/types";
import ProductGrid from "@/components/ProductGrid";

export const dynamic = "force-dynamic";

export default async function ProdutosPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const supabase = createServerComponentClient({ cookies });
  const category = searchParams?.category as string;
  const search = searchParams?.search as string;

  let query = supabase
    .from("products")
    .select("*, categories(name), profiles(whatsapp_number)");

  if (category) {
    query = query.eq("category_id", category);
  }

  if (search) {
    query = query.ilike("name", `%${search}%`);
  }

  const { data: products, error: productsError } = await query;

  const { data: categoriesData, error: categoriesError } = await supabase
    .from("categories")
    .select("id, name, created_at")
    .order("name");

  if (productsError || categoriesError) {
    console.error("Error fetching data:", productsError || categoriesError);
    return (
      <p className="text-center text-red-500">
        Ocorreu um erro ao carregar os produtos. Tente novamente mais tarde.
      </p>
    );
  }

  const allCategories = categoriesData ?? [];

  return (
    <div className="bg-background min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <ProductGrid
          products={products as any[]}
          allCategories={allCategories}
          currentCategory={category}
          searchQuery={search}
        />
      </div>
    </div>
  );
}
