import { notFound } from "next/navigation";
import { Metadata } from "next";
import ProductDetailsClient from "@/components/ProductDetailsClient";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { Product } from "@/types";

export const dynamic = "force-dynamic";

type ProductPageProps = {
  params: {
    slug: string;
  };
};

// Função para gerar metadados dinâmicos (SEO)
export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const supabase = createServerComponentClient({ cookies });
  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("slug", params.slug)
    .single();

  if (!product) {
    return {
      title: "Produto não encontrado",
    };
  }

  return {
    title: product.name,
    description: product.short_description,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const supabase = createServerComponentClient({ cookies });

  const { data: product } = await supabase
    .from("products")
    .select("*, categories(name)")
    .eq("slug", params.slug)
    .single();

  if (!product) {
    notFound();
  }

  return (
    <div className="bg-background text-white">
      <ProductDetailsClient product={product} />
    </div>
  );
}
