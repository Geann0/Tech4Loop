import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Order } from "@/types";
import OrderActions from "@/components/admin/OrderActions";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
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
  if (profile?.role !== "admin")
    return redirect("/admin/login?message=Acesso negado.");

  const { data: orders, error } = await supabase
    .from("orders")
    .select("*, order_items(*, products(*))")
    .order("created_at", { ascending: false });

  if (error) console.error("Error fetching orders:", error);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Todos os Pedidos</h1>
        <Link
          href="/admin/dashboard"
          className="text-neon-blue hover:underline"
        >
          &larr; Voltar para o Painel
        </Link>
      </div>
      <div className="bg-gray-900/50 border border-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Produto(s)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Valor Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Data
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {((orders as Order[]) || []).map((order) => {
                // 🔒 CALCULAR TOTAL REAL baseado nos order_items
                const orderTotal = (order.order_items || []).reduce(
                  (sum, item) => sum + item.price_at_purchase * item.quantity,
                  0
                );

                return (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {order.customer_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {(order.order_items || []).map((item) => (
                        <div key={item.id}>
                          {item.products?.name ?? "Produto não encontrado"} (x
                          {item.quantity})
                        </div>
                      ))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(orderTotal)}
                      {/* Verificar inconsistência */}
                      {Math.abs(orderTotal - order.total_amount) > 0.01 && (
                        <div className="text-xs text-red-400 mt-1">
                          ⚠️ Divergência: BD = R${" "}
                          {order.total_amount.toFixed(2)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          order.status === "delivered"
                            ? "bg-green-100 text-green-800"
                            : order.status === "cancelled"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <OrderActions
                        orderId={order.id}
                        currentStatus={order.status}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
