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
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-2">
          Finalizar Compra
        </h1>
        <p className="text-center text-gray-400 mb-10">
          Preencha seus dados para o pagamento e entrega.
        </p>
        <CheckoutForm product={product} />
      </div>
    </div>
  );
}
