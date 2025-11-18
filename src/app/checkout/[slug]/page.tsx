import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import CheckoutForm from "@/components/checkout/CheckoutForm";
import { Product } from "@/types";

export const dynamic = "force-dynamic";

async function getProduct(slug: string): Promise<Product> {
  const supabase = createServerComponentClient({ cookies });

  const { data: product } = await supabase
    .from("products")
    .select("*, categories(name)")
    .eq("slug", slug)
    .single();

  if (!product) {
    notFound();
  }
  return product as Product;
}

export default async function CheckoutPage({
  params,
}: {
  params: { slug: string };
}) {
  const product = await getProduct(params.slug);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black">
      <div className="container mx-auto px-4 py-8 lg:py-12">
        {/* Header */}
        <div className="max-w-7xl mx-auto mb-8">
          <div className="text-center mb-2">
            <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-neon-blue to-electric-purple bg-clip-text text-transparent">
              Finalizar Compra
            </h1>
          </div>

          {/* Steps */}
          <div className="flex items-center justify-center gap-2 text-sm">
            <span className="text-neon-blue font-bold">1. Carrinho</span>
            <span className="text-gray-600">→</span>
            <span className="text-white font-bold">2. Informações</span>
            <span className="text-gray-600">→</span>
            <span className="text-gray-500">3. Pagamento</span>
            <span className="text-gray-600">→</span>
            <span className="text-gray-500">4. Confirmação</span>
          </div>
        </div>

        {/* Form */}
        <div className="max-w-7xl mx-auto">
          <CheckoutForm product={product} />
        </div>

        {/* Badges de Segurança */}
        <div className="max-w-7xl mx-auto mt-8">
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <span className="text-green-400 text-lg">🔒</span>
              <span>Pagamento Seguro</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-400 text-lg">✓</span>
              <span>SSL Certificado</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-400 text-lg">⚡︎</span>
              <span>Entrega Rápida</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
