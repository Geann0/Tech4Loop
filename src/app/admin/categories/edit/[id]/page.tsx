import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import EditCategoryForm from "@/components/admin/EditCategoryForm";
import Link from "next/link";

async function getCategory(id: string) {
  const supabase = createServerComponentClient({ cookies });
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("id", id)
    .single();
  if (error) notFound();
  return data;
}

export default async function EditCategoryPage({
  params,
}: {
  params: { id: string };
}) {
  const category = await getCategory(params.id);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Editar Categoria</h1>
        <Link
          href="/admin/categories"
          className="text-neon-blue hover:underline"
        >
          &larr; Voltar para Categorias
        </Link>
      </div>
      <EditCategoryForm category={category} />
    </div>
  );
}
