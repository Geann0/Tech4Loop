"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useState } from "react";
import { updatePassword } from "@/app/conta/dados/actions";

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
          <span>Alterando...</span>
        </>
      ) : (
        <>
          <span>$</span>
          <span>Alterar Senha</span>
        </>
      )}
    </button>
  );
}

interface SecuritySettingsProps {
  email: string;
}

export default function SecuritySettings({ email }: SecuritySettingsProps) {
  const initialState = { error: null, success: false };
  const [state, formAction] = useFormState(updatePassword, initialState);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  return (
    <div className="space-y-6">
      {/* Alterar Senha */}
      <div className="bg-dark-card border border-gray-800 rounded-xl overflow-hidden">
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>$</span>
            <span>Alterar Senha</span>
          </h2>
        </div>

        <form action={formAction} className="p-6 space-y-6">
          {/* Senha Atual */}
          <div>
            <label
              htmlFor="currentPassword"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Senha Atual *
            </label>
            <div className="relative">
              <input
                type={showPasswords.current ? "text" : "password"}
                id="currentPassword"
                name="currentPassword"
                required
                className="w-full px-4 py-3 pr-12 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent transition-all"
                placeholder="Digite sua senha atual"
              />
              <button
                type="button"
                onClick={() =>
                  setShowPasswords((prev) => ({
                    ...prev,
                    current: !prev.current,
                  }))
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
              >
                {showPasswords.current ? "👁" : "👁‍🗨"}
              </button>
            </div>
          </div>

          {/* Nova Senha */}
          <div>
            <label
              htmlFor="newPassword"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Nova Senha *
            </label>
            <div className="relative">
              <input
                type={showPasswords.new ? "text" : "password"}
                id="newPassword"
                name="newPassword"
                required
                minLength={8}
                className="w-full px-4 py-3 pr-12 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent transition-all"
                placeholder="Mínimo 8 caracteres"
              />
              <button
                type="button"
                onClick={() =>
                  setShowPasswords((prev) => ({ ...prev, new: !prev.new }))
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
              >
                {showPasswords.new ? "👁" : "👁‍🗨"}
              </button>
            </div>
            <ul className="mt-2 text-xs text-gray-500 space-y-1">
              <li>• Mínimo 8 caracteres</li>
              <li>• Letra maiúscula e minúscula</li>
              <li>• Pelo menos um número</li>
              <li>• Caractere especial (!@#$%^&*_-)</li>
            </ul>
          </div>

          {/* Confirmar Senha */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Confirmar Nova Senha *
            </label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                required
                minLength={8}
                className="w-full px-4 py-3 pr-12 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent transition-all"
                placeholder="Digite novamente"
              />
              <button
                type="button"
                onClick={() =>
                  setShowPasswords((prev) => ({
                    ...prev,
                    confirm: !prev.confirm,
                  }))
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
              >
                {showPasswords.confirm ? "👁" : "👁‍🗨"}
              </button>
            </div>
          </div>

          {/* Mensagens */}
          {state?.success && (
            <div className="p-4 bg-green-500/10 border border-green-500/50 rounded-lg">
              <p className="text-sm text-green-400 flex items-center gap-2">
                <span>✓</span>
                <span>Senha alterada com sucesso!</span>
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

      {/* Informações de Segurança */}
      <div className="bg-dark-card border border-gray-800 rounded-xl overflow-hidden">
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>◉</span>
            <span>Informações da Conta</span>
          </h2>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-900/50 border border-gray-700 rounded-lg">
            <div>
              <p className="font-medium text-white mb-1">Email da Conta</p>
              <p className="text-sm text-gray-400">{email}</p>
            </div>
            <span className="text-green-400 text-xs bg-green-500/10 px-3 py-1 rounded-full">
              Verificado
            </span>
          </div>

          <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠</span>
              <div>
                <p className="font-medium text-yellow-400 mb-2">
                  Dicas de Segurança
                </p>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Nunca compartilhe sua senha com ninguém</li>
                  <li>• Use senhas diferentes para cada serviço</li>
                  <li>• Altere sua senha periodicamente</li>
                  <li>• Evite usar informações pessoais na senha</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
