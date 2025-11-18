"use client";

import { useState } from "react";
import Link from "next/link";
import { sendPasswordResetEmail } from "./actions";

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    const result = await sendPasswordResetEmail(email);

    if (result.success) {
      setMessage({
        type: "success",
        text: "Email de recuperação enviado! Verifique sua caixa de entrada.",
      });
      setEmail("");
    } else {
      setMessage({
        type: "error",
        text: result.error || "Erro ao enviar email de recuperação.",
      });
    }

    setIsLoading(false);
  }

  return (
    <div className="container mx-auto px-4 py-16 min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-8">
          <h1 className="text-3xl font-bold mb-2 text-center">
            Esqueceu sua senha?
          </h1>
          <p className="text-gray-400 text-center mb-8">
            Digite seu email e enviaremos instruções para redefinir sua senha.
          </p>

          {message && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                message.type === "success"
                  ? "bg-green-500/10 border border-green-500/50 text-green-400"
                  : "bg-red-500/10 border border-red-500/50 text-red-400"
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-neon-blue focus:border-transparent"
                placeholder="seu@email.com"
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-neon-blue to-electric-purple text-white py-3 px-6 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Enviando..." : "Enviar Email de Recuperação"}
            </button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <Link
              href="/admin/login"
              className="block text-sm text-neon-blue hover:text-electric-purple transition-colors"
            >
              Voltar para o login
            </Link>
            <Link
              href="/register"
              className="block text-sm text-gray-400 hover:text-white transition-colors"
            >
              Não tem uma conta? Cadastre-se
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
