import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import DeleteProductButton from "@/components/partner/DeleteProductButton";

export const dynamic = "force-dynamic";

export default async function PartnerDashboard() {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/admin/login");
  }

  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .eq("partner_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching partner products:", error);
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Painel do Parceiro</h1>
        <div className="flex gap-4">
          <Link
            href="/partner/orders"
            className="bg-gray-700 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-600 transition-shadow"
          >
            Ver Pedidos
          </Link>
          <Link
            href="/partner/add-product"
            className="bg-neon-blue text-black font-bold py-2 px-4 rounded-lg hover:shadow-glow transition-shadow"
          >
            Adicionar Produto
          </Link>
        </div>
      </div>
      <div className="bg-gray-900/50 border border-gray-800 rounded-lg shadow-lg overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Produto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Preço
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Categoria
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {products && products.length > 0 ? (
              products.map((product) => (
                <tr key={product.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <Image
                          className="h-10 w-10 rounded-md object-contain bg-gray-700"
                          src={product.image_urls[0]}
                          alt={product.name}
                          width={40}
                          height={40}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-white break-words">
                          {product.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    R$ {product.price}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {product.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2 flex items-center">
                    <Link
                      href={`/partner/edit/${product.id}`}
                      className="px-3 py-1 text-sm rounded-md transition-colors bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Editar
                    </Link>
                    <DeleteProductButton
                      productId={product.id}
                      imageUrls={product.image_urls}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-400">
                  Você ainda não cadastrou nenhum produto.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
