"use client";

import { useFormStatus } from "react-dom";
import { toggleUserBan } from "@/app/admin/actions";

interface ToggleBanButtonProps {
  userId: string;
  isBanned: boolean;
}

function SubmitButton({ isBanned }: { isBanned: boolean }) {
  const { pending } = useFormStatus();
  const text = isBanned ? "Desbanir" : "Banir";
  const pendingText = isBanned ? "Aguarde..." : "Aguarde...";

  return (
    <button
      type="submit"
      disabled={pending}
      className={`px-3 py-1 text-sm rounded-md transition-colors disabled:opacity-50 ${
        isBanned
          ? "bg-green-600 hover:bg-green-700 text-white"
          : "bg-red-600 hover:bg-red-700 text-white"
      }`}
    >
      {pending ? pendingText : text}
    </button>
  );
}

export default function ToggleBanButton({
  userId,
  isBanned,
}: ToggleBanButtonProps) {
  return (
    <form action={toggleUserBan}>
      <input type="hidden" name="userId" value={userId} />
      <input type="hidden" name="isBanned" value={String(isBanned)} />
      <SubmitButton isBanned={isBanned} />
    </form>
  );
}
