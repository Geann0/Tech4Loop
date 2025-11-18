"use client";

import { useFormState, useFormStatus } from "react-dom";
import { createCategory } from "@/app/admin/categories/actions";
import { useEffect, useRef } from "react";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-neon-blue hover:shadow-glow transition-shadow disabled:bg-gray-500"
    >
      {pending ? "Adicionando..." : "Adicionar Categoria"}
    </button>
  );
}

export default function AddCategoryForm() {
  const [state, formAction] = useFormState(createCategory, { error: "" });
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state?.error) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="bg-gray-900/50 p-8 rounded-lg border border-gray-800 space-y-6"
    >
      <h2 className="text-xl font-bold text-center">Nova Categoria</h2>
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-300"
        >
          Nome da Categoria
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-neon-blue"
        />
      </div>
      <SubmitButton />
      {state?.error && (
        <p className="text-sm text-red-500 text-center">{state.error}</p>
      )}
    </form>
  );
}
