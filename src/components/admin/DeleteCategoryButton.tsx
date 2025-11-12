"use client";

import { useFormStatus } from "react-dom";
import { deleteCategory } from "@/app/admin/categories/actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="px-3 py-1 text-sm rounded-md transition-colors bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
    >
      {pending ? "Excluindo..." : "Excluir"}
    </button>
  );
}

export default function DeleteCategoryButton({
  categoryId,
  categoryName,
}: {
  categoryId: string;
  categoryName: string;
}) {
  const handleDelete = (formData: FormData) => {
    if (
      window.confirm(
        `Tem certeza que deseja excluir a categoria "${categoryName}"?`
      )
    ) {
      deleteCategory(formData);
    }
  };

  return (
    <form action={handleDelete}>
      <input type="hidden" name="id" value={categoryId} />
      <SubmitButton />
    </form>
  );
}
