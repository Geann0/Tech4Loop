"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signInCustomer } from "./actions";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await signInCustomer(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
    // Se não houver erro, o redirecionamento acontece no server action
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <Link href="/">
            <h2 className="mt-6 text-center text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-neon-blue to-electric-purple">
              Tech4Loop
            </h2>
          </Link>
          <p className="mt-2 text-center text-sm text-gray-400">
            Faça login na sua conta para continuar
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-900/50 border border-red-500 p-4">
              <p className="text-sm text-red-200">{error}</p>
            </div>
          )}

          {searchParams.get("registered") === "true" && (
            <div className="rounded-md bg-green-900/50 border border-green-500 p-4">
              <p className="text-sm text-green-200 font-semibold mb-2">
                ✅ Conta criada com sucesso!
              </p>
              <p className="text-xs text-green-300">
                📧 Verifique seu email e clique no link de confirmação antes de
                fazer login.
              </p>
            </div>
          )}

          {searchParams.get("reset") === "success" && (
            <div className="rounded-md bg-green-900/50 border border-green-500 p-4">
              <p className="text-sm text-green-200">
                Senha redefinida com sucesso! Faça login com sua nova senha.
              </p>
            </div>
          )}

          <div className="space-y-4">
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
                  autoComplete="current-password"
                  required
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-700 bg-gray-900 placeholder-gray-500 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent sm:text-sm pr-10"
                  placeholder="•••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300"
                >
                  {showPassword ? "👁" : "⌣"}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link
                href="/esqueci-senha"
                className="font-medium text-neon-blue hover:underline"
              >
                Esqueceu sua senha?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-black bg-neon-blue hover:shadow-glow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neon-blue disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </div>

          <div className="text-center space-y-2">
            <p className="text-sm text-gray-400">
              Não tem uma conta?{" "}
              <Link
                href="/register"
                className="font-medium text-neon-blue hover:underline"
              >
                Criar conta
              </Link>
            </p>
            <p className="text-sm text-gray-400">
              ADM {""}
              <Link
                href="/admin/login"
                className="font-medium text-electric-purple hover:underline"
              >logar</Link>
            </p>
            <p className="text-sm text-gray-400">
              <Link
                href="/"
                className="font-medium text-gray-300 hover:text-white"
              >
                ← Voltar para o site
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
