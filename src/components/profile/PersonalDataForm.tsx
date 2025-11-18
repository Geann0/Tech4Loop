"use client";

import { useFormState, useFormStatus } from "react-dom";
import { formatPhone } from "@/lib/checkoutUtils";
import { useState } from "react";
import { updatePersonalData } from "@/app/conta/dados/actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="px-6 py-3 bg-gradient-to-r from-neon-blue to-electric-purple text-white font-bold rounded-xl hover:shadow-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
    >
      {pending ? (
        <>
          <span className="animate-spin">◌</span>
          <span>Salvando...</span>
        </>
      ) : (
        <>
          <span>✓</span>
          <span>Salvar Alterações</span>
        </>
      )}
    </button>
  );
}

interface PersonalDataFormProps {
  profile: {
    id: string;
    email: string;
    partner_name?: string | null;
    whatsapp_number?: string | null;
  };
}

export default function PersonalDataForm({ profile }: PersonalDataFormProps) {
  const initialState = { error: null, success: false };
  const [state, formAction] = useFormState(updatePersonalData, initialState);
  const [phone, setPhone] = useState(profile.whatsapp_number || "");

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setPhone(formatted);
  };

  return (
    <div className="bg-dark-card border border-gray-800 rounded-xl overflow-hidden">
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-4 border-b border-gray-700">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span>◈</span>
          <span>Informações Pessoais</span>
        </h2>
      </div>

      <form action={formAction} className="p-6 space-y-6">
        <input type="hidden" name="profileId" value={profile.id} />

        {/* Nome */}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            Nome Completo *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            defaultValue={profile.partner_name || ""}
            placeholder="Seu nome completo"
            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent transition-all"
          />
          <p className="mt-1 text-xs text-gray-500">
            Este nome será usado em suas compras e comunicações
          </p>
        </div>

        {/* Email (somente leitura) */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            Email
          </label>
          <div className="relative">
            <input
              type="email"
              id="email"
              value={profile.email}
              disabled
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-400 cursor-not-allowed"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-green-400 text-xs bg-green-500/10 px-2 py-1 rounded">
              Verificado
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            O email não pode ser alterado por questões de segurança
          </p>
        </div>

        {/* WhatsApp */}
        <div>
          <label
            htmlFor="whatsapp"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            WhatsApp *
          </label>
          <input
            type="tel"
            id="whatsapp"
            name="whatsapp"
            required
            value={phone}
            onChange={handlePhoneChange}
            placeholder="(00) 00000-0000"
            maxLength={15}
            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent transition-all"
          />
          <p className="mt-1 text-xs text-gray-500">
            Usado para contato sobre seus pedidos e ofertas
          </p>
        </div>

        {/* Mensagens */}
        {state?.success && (
          <div className="p-4 bg-green-500/10 border border-green-500/50 rounded-lg">
            <p className="text-sm text-green-400 flex items-center gap-2">
              <span>✓</span>
              <span>Dados atualizados com sucesso!</span>
            </p>
          </div>
        )}

        {state?.error && (
          <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
            <p className="text-sm text-red-400">{state.error}</p>
          </div>
        )}

        {/* Botões */}
        <div className="flex items-center gap-4 pt-4 border-t border-gray-700">
          <SubmitButton />
          <button
            type="button"
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-xl transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
