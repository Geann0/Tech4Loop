"use client";

import { useFormStatus } from "react-dom";
import { deleteAdminProduct } from "@/app/admin/actions"; // Corrigido para deleteAdminProduct

interface AdminDeleteProductButtonProps {
  productId: string;
  imageUrls: string[];
}

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

export default function AdminDeleteProductButton({
  productId,
  imageUrls,
}: AdminDeleteProductButtonProps) {
  const handleDelete = (formData: FormData) => {
    if (
      window.confirm(
        "Tem certeza que deseja excluir este produto? Esta ação é irreversível."
      )
    ) {
      deleteAdminProduct(formData);
    }
  };

  return (
    <form action={handleDelete}>
      <input type="hidden" name="productId" value={productId} />
      {imageUrls.map((url, index) => (
        <input key={index} type="hidden" name="imageUrls" value={url} />
      ))}
      <SubmitButton />
    </form>
  );
}
