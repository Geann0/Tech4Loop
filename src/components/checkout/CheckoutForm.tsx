"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useEffect } from "react";
import { Product } from "@/types";
import { processCheckout } from "@/app/checkout/actions";
import Image from "next/image";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-neon-blue hover:shadow-glow transition-shadow disabled:bg-gray-500"
    >
      {pending ? "Processando..." : "Ir para Pagamento"}
    </button>
  );
}

export default function CheckoutForm({ product }: { product: Product }) {
  const initialState = { error: null, success: false, paymentUrl: undefined };
  const [state, formAction] = useFormState(processCheckout, initialState);

  useEffect(() => {
    if (state.success && state.paymentUrl) {
      window.location.href = state.paymentUrl;
    }
  }, [state]);

  return (
    <div className="bg-gray-900/50 p-8 rounded-lg border border-gray-800">
      <div className="flex items-center gap-4 mb-8 border-b border-gray-700 pb-6">
        <Image
          src={product.image_urls[0]}
          alt={product.name}
          width={80}
          height={80}
          className="rounded-md bg-gray-700 object-contain"
        />
        <div className="overflow-hidden">
          <h2 className="text-xl font-bold truncate">{product.name}</h2>
          <p className="text-2xl font-bold text-neon-blue">
            R$ {product.price.toFixed(2)}
          </p>
          <p className="text-sm text-gray-400">
            Vendido por: {product.partner_name || "Tech4Loop"}
          </p>
        </div>
      </div>

      <form action={formAction} className="space-y-6">
        <input type="hidden" name="productId" value={product.id} />
        <input type="hidden" name="productName" value={product.name} />
        <input type="hidden" name="productPrice" value={product.price} />
        <input type="hidden" name="slug" value={product.slug} />
        <input
          type="hidden"
          name="partnerName"
          value={product.partner_name || ""}
        />
        <input
          type="hidden"
          name="partnerWhatsapp"
          value={product.profiles?.whatsapp_number || ""}
        />
        <input
          type="hidden"
          name="partnerRegions"
          value={product.profiles?.service_regions?.join(",") || ""}
        />

        <h3 className="text-lg font-semibold text-white">Seus Dados</h3>
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-300"
          >
            Nome Completo
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-neon-blue"
          />
        </div>
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-300"
          >
            E-mail
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-neon-blue"
          />
        </div>
        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-gray-300"
          >
            Telefone (WhatsApp)
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            required
            className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-neon-blue"
          />
        </div>

        <h3 className="text-lg font-semibold text-white pt-4 border-t border-gray-700">
          Endereço de Entrega
        </h3>
        <div>
          <label
            htmlFor="cep"
            className="block text-sm font-medium text-gray-300"
          >
            CEP
          </label>
          <input
            type="text"
            id="cep"
            name="cep"
            required
            className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-neon-blue"
          />
        </div>
        <div>
          <label
            htmlFor="address"
            className="block text-sm font-medium text-gray-300"
          >
            Endereço (Rua, Número, Bairro)
          </label>
          <input
            type="text"
            id="address"
            name="address"
            required
            className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-neon-blue"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="city"
              className="block text-sm font-medium text-gray-300"
            >
              Cidade
            </label>
            <input
              type="text"
              id="city"
              name="city"
              required
              className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-neon-blue"
            />
          </div>
          <div>
            <label
              htmlFor="state"
              className="block text-sm font-medium text-gray-300"
            >
              Estado (UF)
            </label>
            <input
              type="text"
              id="state"
              name="state"
              required
              maxLength={2}
              placeholder="Ex: RO"
              className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-neon-blue"
            />
          </div>
        </div>

        <SubmitButton />

        {state?.error && (
          <p className="text-sm text-red-500 text-center mt-4">{state.error}</p>
        )}
      </form>
    </div>
  );
}
