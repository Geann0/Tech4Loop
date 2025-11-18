import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { Product } from "@/types";
import PartnerProductGrid from "@/components/PartnerProductGrid";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ParceriasPage() {
  const supabase = createServerComponentClient({ cookies });

  const { data: productsData, error } = await supabase
    .from("products")
    .select(
      "*, profiles!products_partner_id_fkey(whatsapp_number, service_regions)"
    );
  if (error) console.error("Error fetching products:", error);
  const products: Product[] = productsData || [];

  // Extrai parceiros únicos que têm produtos
  const partnersWithProducts = Array.from(
    new Set(products.map((p) => p.partner_name).filter(Boolean))
  ) as string[];

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Nossos Parceiros</h1>
        <p className="text-lg text-gray-400 mb-8">
          Produtos de qualidade vendidos por nossos parceiros de confiança em
          todo o Brasil.
        </p>
      </div>

      <PartnerProductGrid products={products} partners={partnersWithProducts} />
    </div>
  );
}
