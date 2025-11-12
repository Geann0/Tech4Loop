"use client";

import { useFormState, useFormStatus } from "react-dom";
import { updateAdminProduct } from "@/app/admin/actions";
import { Product } from "@/types";
import Image from "next/image";
import { useState } from "react";

type Category = {
  name: string;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-neon-blue hover:shadow-glow transition-shadow disabled:bg-gray-500"
    >
      {pending ? "Salvando..." : "Salvar Alterações"}
    </button>
  );
}

export default function AdminEditProductForm({
  product,
  categories,
}: {
  product: Product;
  categories: Category[];
}) {
  const [state, formAction] = useFormState(updateAdminProduct, { error: "" });

  return (
    <form
      action={formAction}
      className="max-w-2xl mx-auto bg-gray-900/50 p-8 rounded-lg border border-gray-800 space-y-6"
    >
      <input type="hidden" name="id" value={product.id} />
      <input
        type="hidden"
        name="current_image_urls"
        value={product.image_urls.join(",")}
      />

      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-300"
        >
          Nome do Produto
        </label>
        <input
          type="text"
          id="name"
          name="name"
          defaultValue={product.name}
          required
          className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-neon-blue"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="price"
            className="block text-sm font-medium text-gray-300"
          >
            Preço
          </label>
          <input
            type="number"
            id="price"
            name="price"
            step="0.01"
            defaultValue={product.price}
            required
            className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-neon-blue"
          />
        </div>
        <div>
          <label
            htmlFor="category"
            className="block text-sm font-medium text-gray-300"
          >
            Categoria
          </label>
          <select
            id="category_id"
            name="category_id"
            defaultValue={product.category_id ?? ""}
            required
            className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-neon-blue"
          >
            <option value="">Selecione...</option>
            {categories.map((cat) => (
              <option key={cat.name} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label
          htmlFor="short_description"
          className="block text-sm font-medium text-gray-300"
        >
          Descrição Curta
        </label>
        <textarea
          id="short_description"
          name="short_description"
          rows={3}
          defaultValue={product.short_description ?? ""}
          required
          className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-neon-blue"
        ></textarea>
      </div>

      <div>
        <label
          htmlFor="new_image_url"
          className="block text-sm font-medium text-gray-300"
        >
          Substituir Imagem Principal (Opcional)
        </label>
        <input
          type="file"
          id="new_image_url"
          name="new_image_url"
          accept="image/*"
          className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-electric-purple file:text-white hover:file:bg-purple-700"
        />
      </div>

      <SubmitButton />
      {state?.error && (
        <p className="text-sm text-red-500 text-center">{state.error}</p>
      )}
    </form>
  );
}
