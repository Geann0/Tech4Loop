import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import ToggleBanButton from "@/components/admin/ToggleBanButton";
import DeletePartnerButton from "@/components/admin/DeletePartnerButton";

// Força a página a ser renderizada dinamicamente, garantindo que os dados sejam sempre os mais recentes.
export const dynamic = "force-dynamic";

export default async function AdminPartnersPage() {
  const supabase = createServerComponentClient({ cookies });

  // 1. Verificar se o usuário é admin
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

  // 2. Buscar todos os parceiros
  const { data: partners, error } = await supabase
    .from("profiles")
    .select("id, email, partner_name, is_banned")
    .eq("role", "partner");

  if (error) {
    console.error("Error fetching partners:", error);
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gerenciar Parceiros</h1>
        <div className="flex items-center gap-4">
          <Link
            href="/admin/partners/add"
            className="bg-neon-blue text-black font-bold py-2 px-4 rounded-lg hover:shadow-glow transition-shadow"
          >
            Adicionar Parceiro
          </Link>
          <Link
            href="/admin/dashboard"
            className="text-neon-blue hover:underline"
          >
            &larr; Voltar para o Painel
          </Link>
        </div>
      </div>
      <div className="bg-gray-900/50 border border-gray-800 rounded-lg shadow-lg overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Nome da Loja
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {partners && partners.length > 0 ? (
              partners.map((partner) => (
                <tr key={partner.id} className="hover:bg-gray-800/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                    {partner.partner_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {partner.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        partner.is_banned
                          ? "bg-red-900 text-red-200"
                          : "bg-green-900 text-green-200"
                      }`}
                    >
                      {partner.is_banned ? "Banido" : "Ativo"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2 flex items-center">
                    <ToggleBanButton
                      userId={partner.id}
                      isBanned={partner.is_banned}
                    />
                    <Link
                      href={`/admin/partners/edit/${partner.id}`}
                      className="px-3 py-1 text-sm rounded-md transition-colors bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Editar
                    </Link>
                    <DeletePartnerButton
                      userId={partner.id}
                      partnerName={partner.partner_name || "Parceiro sem nome"}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-400">
                  Nenhum parceiro encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
