import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const supabase = createServerComponentClient({ cookies });

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) redirect("/admin/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", session.user.id)
    .single();
  if (profile?.role !== "admin") redirect("/partner/dashboard"); // Se não for admin, redireciona para o painel de parceiro

  // Busca estatísticas
  const { count: productCount } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true });
  const { count: partnerCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "partner");

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold">Painel Super Admin</h1>
      <p className="text-gray-400 mt-2">Visão geral do sistema.</p>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 my-8">
        <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-800">
          <h3 className="text-gray-400 text-sm">Total de Produtos</h3>
          <p className="text-3xl font-bold">{productCount ?? 0}</p>
        </div>
        <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-800">
          <h3 className="text-gray-400 text-sm">Total de Parceiros</h3>
          <p className="text-3xl font-bold">{partnerCount ?? 0}</p>
        </div>
      </div>

      {/* Ações Rápidas */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Gerenciamento</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/admin/partners/add"
            className="bg-gray-800 p-6 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <h3 className="text-xl font-bold mb-2">Adicionar Parceiro</h3>
            <p className="text-gray-400">
              Cadastre um novo parceiro revendedor.
            </p>
          </Link>
          <Link
            href="/admin/partners"
            className="bg-gray-800 p-6 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <h3 className="text-xl font-bold mb-2">Gerenciar Parceiros</h3>
            <p className="text-gray-400">
              Visualize e gerencie todos os parceiros.
            </p>
          </Link>
          <Link
            href="/admin/products"
            className="bg-gray-800 p-6 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <h3 className="text-xl font-bold mb-2">Gerenciar Produtos</h3>
            <p className="text-gray-400">
              Edite ou remova produtos de todos os parceiros.
            </p>
          </Link>
          <Link
            href="/admin/products/add"
            className="bg-gray-800 p-6 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <h3 className="text-xl font-bold mb-2">Adicionar Produto</h3>
            <p className="text-gray-400">
              Cadastre um novo produto para a loja principal.
            </p>
          </Link>
          <Link
            href="/admin/categories"
            className="bg-gray-800 p-6 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <h3 className="text-xl font-bold mb-2">Gerenciar Categorias</h3>
            <p className="text-gray-400">
              Adicione, edite ou remova categorias de produtos.
            </p>
          </Link>
          <Link
            href="/admin/orders"
            className="bg-gray-800 p-6 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <h3 className="text-xl font-bold mb-2">Ver Pedidos</h3>
            <p className="text-gray-400">
              Visualize todos os pedidos da loja e de parceiros.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
