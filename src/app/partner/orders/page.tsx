import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Order } from "@/types";

export const dynamic = "force-dynamic";

export default async function PartnerOrdersPage() {
  const supabase = createServerComponentClient({ cookies });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return redirect("/admin/login");

  const { data: orders, error } = await supabase
    .from("orders")
    .select("*, products!inner(partner_id)")
    .eq("products.partner_id", user.id)
    .order("created_at", { ascending: false });
  if (error) console.error("Error fetching orders:", error);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Meus Pedidos</h1>
        <Link
          href="/partner/dashboard"
          className="text-neon-blue hover:underline"
        >
          &larr; Voltar para o Painel
        </Link>
      </div>
      <div className="bg-gray-900/50 border border-gray-800 rounded-lg shadow-lg overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Cliente
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Produto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Valor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Data
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {((orders as unknown as Order[]) || []).map((order) => (
              <tr key={order.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                  {order.customer_info.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {order.product_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  R$ {order.total_price}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {new Date(order.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
