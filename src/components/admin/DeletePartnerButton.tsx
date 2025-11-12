"use client";

import { deletePartner } from "@/app/admin/actions";
import { useFormStatus } from "react-dom";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="px-3 py-1 text-sm rounded-md transition-colors bg-gray-700 hover:bg-gray-600 text-white disabled:opacity-50"
    >
      {pending ? "Excluindo..." : "Excluir"}
    </button>
  );
}

export default function DeletePartnerButton({
  userId,
  partnerName,
}: {
  userId: string;
  partnerName: string;
}) {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    if (
      !confirm(
        `Tem certeza que deseja excluir o parceiro "${partnerName}"? Todos os seus produtos também serão perdidos. Esta ação é irreversível.`
      )
    ) {
      event.preventDefault();
    }
  };

  return (
    <form action={deletePartner} onSubmit={handleSubmit} className="m-0">
      <input type="hidden" name="userId" value={userId} />
      <SubmitButton />
    </form>
  );
}
