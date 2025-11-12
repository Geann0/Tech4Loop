"use client";

import { useFormState, useFormStatus } from "react-dom";
import { createPartner } from "@/app/admin/actions";
import { useEffect, useRef } from "react";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-neon-blue hover:shadow-glow transition-shadow disabled:bg-gray-500"
    >
      {pending ? "Criando..." : "Criar Parceiro"}
    </button>
  );
}

export default function AddPartnerForm() {
  const [state, formAction] = useFormState(createPartner, { error: null });
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.error === null) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="max-w-lg mx-auto bg-gray-900/50 p-8 rounded-lg border border-gray-800 space-y-6"
    >
      <div>
        <label
          htmlFor="partner_name"
          className="block text-sm font-medium text-gray-300"
        >
          Nome da Loja do Parceiro
        </label>
        <input
          type="text"
          id="partner_name"
          name="partner_name"
          required
          className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-neon-blue"
        />
      </div>
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-300"
        >
          Email de Login
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
          htmlFor="whatsapp_number"
          className="block text-sm font-medium text-gray-300"
        >
          Número do WhatsApp (Opcional)
        </label>
        <input
          type="text"
          id="whatsapp_number"
          name="whatsapp_number"
          placeholder="Ex: 5569999999999"
          className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-neon-blue"
        />
      </div>
      <div>
        <label
          htmlFor="service_regions"
          className="block text-sm font-medium text-gray-300"
        >
          Regiões de Atendimento (Opcional)
        </label>
        <input
          type="text"
          id="service_regions"
          name="service_regions"
          placeholder="Ex: RO, AC, AM (separado por vírgula)"
          className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-neon-blue"
        />
      </div>
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-300"
        >
          Senha Provisória
        </label>
        <input
          type="password"
          id="password"
          name="password"
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
