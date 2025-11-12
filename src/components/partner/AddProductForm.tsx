"use client";

import { useFormState, useFormStatus } from "react-dom";
import { createProduct } from "@/app/partner/actions";
import { useEffect, useRef, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

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
      {pending ? "Salvando..." : "Salvar Produto"}
    </button>
  );
}

export default function AddProductForm() {
  const [state, formAction] = useFormState(createProduct, { error: "" });
  const [categories, setCategories] = useState<Category[]>([]);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      const supabase = createClientComponentClient();
      const { data, error } = await supabase
        .from("categories")
        .select("name")
        .order("name");
      if (data) {
        setCategories(data);
      }
      if (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
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
            htmlFor="category"
            className="block text-sm font-medium text-gray-300"
          >
            Categoria
          </label>
          <select
            id="category"
            name="category"
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
          required
          className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-neon-blue"
        ></textarea>
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-300"
        >
          Descrição Completa
        </label>
        <textarea
          id="description"
          name="description"
          rows={6}
          required
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

      {state.error && (
        <p className="text-sm text-red-500 text-center">{state.error}</p>
      )}
    </form>
  );
}
