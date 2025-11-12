import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import Link from "next/link";
import AddCategoryForm from "@/components/admin/AddCategoryForm";
import DeleteCategoryButton from "@/components/admin/DeleteCategoryButton";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const supabase = createServerComponentClient({ cookies });
  const { data: categories, error } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  if (error) console.error("Error fetching categories:", error.message);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gerenciar Categorias</h1>
        <Link
          href="/admin/dashboard"
          className="text-neon-blue hover:underline"
        >
          &larr; Voltar para o Painel
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <AddCategoryForm />
        </div>
        <div className="md:col-span-2 bg-gray-900/50 border border-gray-800 rounded-lg shadow-lg overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Nome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {categories?.map((category) => (
                <tr key={category.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                    {category.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2 flex items-center">
                    <Link
                      href={`/admin/categories/edit/${category.id}`}
                      className="px-3 py-1 text-sm rounded-md transition-colors bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Editar
                    </Link>
                    <DeleteCategoryButton
                      categoryId={category.id}
                      categoryName={category.name}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
