"use client";

import { updatePartner } from "@/app/admin/actions";
import { useFormState, useFormStatus } from "react-dom";
import { useState, useEffect } from "react";

type CoverageType = "country" | "state" | "city";

interface Partner {
  id: string;
  partner_name: string | null;
  email: string | null;
  whatsapp_number: string | null;
  service_regions: string[] | null;
}

interface EditPartnerFormProps {
  partner: Partner;
}

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

function detectCoverageType(regions: string[] | null): CoverageType {
  if (!regions || regions.length === 0) return "country";
  const allStates = regions.every((r) => r.length === 2);
  return allStates ? "state" : "city";
}

export default function EditPartnerForm({ partner }: EditPartnerFormProps) {
  const [state, formAction] = useFormState<{ error: string }, FormData>(
    updatePartner,
    { error: "" }
  );
  const [coverageType, setCoverageType] = useState<CoverageType>(
    detectCoverageType(partner.service_regions)
  );

  return (
    <form
      action={formAction}
      className="max-w-lg mx-auto bg-gray-900/50 p-8 rounded-lg border border-gray-800 space-y-6"
    >
      <input type="hidden" name="id" value={partner.id} />

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-300"
        >
          Email do Parceiro
        </label>
        <input
          type="email"
          id="email"
          name="email"
          defaultValue={partner.email ?? ""}
          disabled
          className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-400 cursor-not-allowed"
        />
      </div>

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
          defaultValue={partner.partner_name ?? ""}
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
          defaultValue={partner.whatsapp_number ?? ""}
          placeholder="Ex: 5569999999999"
          className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-neon-blue"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Tipo de Cobertura Geográfica
        </label>
        <div className="space-y-3 mb-4">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="radio"
              name="coverage_type"
              value="country"
              checked={coverageType === "country"}
              onChange={(e) => setCoverageType(e.target.value as CoverageType)}
              className="w-4 h-4 text-neon-blue focus:ring-neon-blue"
            />
            <div>
              <span className="text-white font-medium">
                🌎 País Inteiro (Brasil)
              </span>
              <p className="text-xs text-gray-400">
                Atende todas as cidades do Brasil
              </p>
            </div>
          </label>

          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="radio"
              name="coverage_type"
              value="state"
              checked={coverageType === "state"}
              onChange={(e) => setCoverageType(e.target.value as CoverageType)}
              className="w-4 h-4 text-neon-blue focus:ring-neon-blue"
            />
            <div>
              <span className="text-white font-medium">
                🗺️ Estados Específicos
              </span>
              <p className="text-xs text-gray-400">
                Atende estados selecionados
              </p>
            </div>
          </label>

          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="radio"
              name="coverage_type"
              value="city"
              checked={coverageType === "city"}
              onChange={(e) => setCoverageType(e.target.value as CoverageType)}
              className="w-4 h-4 text-neon-blue focus:ring-neon-blue"
            />
            <div>
              <span className="text-white font-medium">
                🏙️ Cidades Específicas
              </span>
              <p className="text-xs text-gray-400">
                Atende apenas cidades selecionadas
              </p>
            </div>
          </label>
        </div>

        {coverageType === "state" && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Estados (UF)
            </label>
            <input
              type="text"
              name="service_regions"
              defaultValue={partner.service_regions?.join(", ") ?? ""}
              placeholder="Ex: RO, AC, SP (separado por vírgula)"
              className="block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-neon-blue"
            />
            <p className="text-xs text-gray-400 mt-1">
              Digite as siglas dos estados separadas por vírgula
            </p>
          </div>
        )}

        {coverageType === "city" && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Cidades
            </label>
            <textarea
              name="service_regions"
              rows={4}
              defaultValue={partner.service_regions?.join(", ") ?? ""}
              placeholder="Ex: Ouro Preto do Oeste, Ji-Paraná, Ariquemes (uma por linha ou separado por vírgula)"
              className="block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-neon-blue"
            />
            <p className="text-xs text-gray-400 mt-1">
              Digite os nomes completos das cidades
            </p>
          </div>
        )}

        {coverageType === "country" && (
          <input type="hidden" name="service_regions" value="" />
        )}
      </div>

      <SubmitButton />

      {state?.error && (
        <p className="text-sm text-red-500 text-center">{state.error}</p>
      )}
    </form>
  );
}
