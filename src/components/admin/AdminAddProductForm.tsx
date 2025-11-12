"use client";

import { createAdminProduct } from "@/app/admin/actions";
import { useFormState, useFormStatus } from "react-dom";
import { useEffect, useRef, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Category } from "@/types";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-neon-blue hover:shadow-glow transition-shadow disabled:bg-gray-500"
    >
      {pending ? "Salvando..." : "Salvar Produto"}
    </button>
  );
}

export default function AdminAddProductForm() {
  const [state, formAction] = useFormState(createAdminProduct, { error: "" });
  const [partners, setPartners] = useState<
    { id: string; partner_name: string }[]
  >([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClientComponentClient();
      const { data: partnersData } = await supabase
        .from("profiles")
        .select("id, partner_name")
        .eq("role", "partner");

      if (partnersData) setPartners(partnersData);

      const { data: categoriesData } = await supabase
        .from("categories")
        .select("id, name, created_at");

      if (categoriesData) setCategories(categoriesData);
    }

    fetchData();
  }, []);

  useEffect(() => {
    if (state.error === "") {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="max-w-2xl mx-auto bg-gray-900/50 p-8 rounded-lg border border-gray-800 space-y-6"
    >
      <div>
        <label
          htmlFor="partner_id"
          className="block text-sm font-medium text-gray-300"
        >
          Parceiro
        </label>
        <select
          id="partner_id"
          name="partner_id"
          required
          className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-neon-blue"
        >
          <option value="">Selecione um parceiro...</option>
          {partners.map((partner) => (
            <option key={partner.id} value={partner.id}>
              {partner.partner_name}
            </option>
          ))}
        </select>
      </div>

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
            required
            className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-neon-blue"
          />
        </div>
        <div>
          <label
            htmlFor="stock"
            className="block text-sm font-medium text-gray-300"
          >
            Estoque
          </label>
          <input
            type="number"
            id="stock"
            name="stock"
            defaultValue={0}
            required
            className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-neon-blue"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="category_id"
          className="block text-sm font-medium text-gray-300"
        >
          Categoria
        </label>
        <select
          id="category_id"
          name="category_id"
          required
          className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-neon-blue"
        >
          <option value="">Selecione...</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
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
          required
          className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-neon-blue"
        ></textarea>
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-300"
        >
          Descrição Completa (Opcional)
        </label>
        <textarea
          id="description"
          name="description"
          rows={6}
          className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-neon-blue"
        ></textarea>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300">
          Imagens do Produto (até 5)
        </label>
        <div className="mt-2 space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <input
              key={i}
              type="file"
              name="images"
              accept="image/*"
              className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-electric-purple file:text-white hover:file:bg-purple-700"
            />
          ))}
        </div>
      </div>

      <SubmitButton />

      {state?.error && (
        <p className="text-sm text-red-500 text-center">{state.error}</p>
      )}
    </form>
  );
}
