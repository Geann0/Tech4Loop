"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { registerUser } from "./actions";

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [lgpdConsent, setLgpdConsent] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    // 🔒 VALIDAR CONSENTIMENTO LGPD
    if (!lgpdConsent) {
      setError(
        "Você precisa aceitar os Termos de Uso e Política de Privacidade para continuar."
      );
      return;
    }

    setLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.append("lgpdConsent", "true");
    formData.append("lgpdConsentDate", new Date().toISOString());

    const result = await registerUser(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push("/login?registered=true");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-neon-blue to-electric-purple">
            Criar nova conta
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Ou{" "}
            <Link
              href="/admin/login"
              className="font-medium text-neon-blue hover:underline"
            >
              faça login em uma conta existente
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-900/50 border border-red-500 p-4">
              <p className="text-sm text-red-200">{error}</p>
            </div>
          )}

          {searchParams.get("verified") === "true" && (
            <div className="rounded-md bg-green-900/50 border border-green-500 p-4">
              <p className="text-sm text-green-200">
                Email verificado! Agora você pode fazer login.
              </p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Nome completo
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-700 bg-gray-900 placeholder-gray-500 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent sm:text-sm"
                placeholder="Seu nome completo"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-700 bg-gray-900 placeholder-gray-500 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent sm:text-sm"
                placeholder="seu@email.com"
              />
              <p className="mt-1 text-xs text-gray-400">
                Use um email válido (Gmail, Outlook, Yahoo, etc.)
              </p>
            </div>

            <div>
              <label
                htmlFor="whatsappNumber"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                WhatsApp
              </label>
              <input
                id="whatsappNumber"
                name="whatsappNumber"
                type="tel"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-700 bg-gray-900 placeholder-gray-500 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent sm:text-sm"
                placeholder="(11) 99999-9999"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Senha
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-700 bg-gray-900 placeholder-gray-500 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent sm:text-sm pr-10"
                  placeholder="Mínimo 8 caracteres"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300"
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Confirmar senha
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-700 bg-gray-900 placeholder-gray-500 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent sm:text-sm"
                placeholder="Digite a senha novamente"
              />
            </div>
          </div>

          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
            <p className="text-xs text-gray-400 mb-2 font-semibold">
              A senha deve conter:
            </p>
            <ul className="text-xs text-gray-500 space-y-1">
              <li>✓ Mínimo de 8 caracteres</li>
              <li>✓ Pelo menos uma letra maiúscula (A-Z)</li>
              <li>✓ Pelo menos uma letra minúscula (a-z)</li>
              <li>✓ Pelo menos um número (0-9)</li>
              <li>✓ Pelo menos um caractere especial (!@#$%^&*)</li>
            </ul>
          </div>

          {/* 🔒 LGPD CONSENT - OBRIGATÓRIO */}
          <div className="bg-blue-900/20 border border-blue-500/40 rounded-lg p-4">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={lgpdConsent}
                onChange={(e) => setLgpdConsent(e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-gray-600 bg-gray-800 text-neon-blue focus:ring-2 focus:ring-neon-blue focus:ring-offset-0 cursor-pointer"
                required
              />
              <span className="text-sm text-gray-300 flex-1">
                Eu li e aceito os{" "}
                <Link
                  href="/termos"
                  target="_blank"
                  className="text-neon-blue hover:underline font-semibold"
                >
                  Termos de Uso
                </Link>{" "}
                e a{" "}
                <Link
                  href="/privacidade"
                  target="_blank"
                  className="text-neon-blue hover:underline font-semibold"
                >
                  Política de Privacidade
                </Link>
                , e autorizo o tratamento dos meus dados pessoais conforme a
                LGPD.
              </span>
            </label>

            {!lgpdConsent && (
              <p className="mt-2 text-xs text-yellow-400 flex items-center gap-2">
                ⚠️ Obrigatório para criar conta
              </p>
            )}
          </div>

          <div className="space-y-3">
            <div className="rounded-md bg-blue-900/30 border border-blue-500/30 p-3">
              <p className="text-xs text-blue-200">
                ⚠️ Após criar sua conta, você receberá um email de confirmação.
                É necessário confirmar seu email antes de fazer login.
              </p>
            </div>
            <button
              type="submit"
              disabled={loading || !lgpdConsent}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-black bg-neon-blue hover:shadow-glow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neon-blue disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? "Criando conta..." : "Criar conta"}
            </button>
          </div>

          <div className="text-center space-y-2">
            <p className="text-sm text-gray-400">
              Já tem uma conta?{" "}
              <Link
                href="/admin/login"
                className="font-medium text-neon-blue hover:underline"
              >
                Fazer login
              </Link>
            </p>
            <p className="text-sm text-gray-400">
              {" "}
              <Link
                href="/seja-parceiro"
                className="font-medium text-electric-purple hover:underline"
              >
                Seja um parceiro Tech4Loop
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
