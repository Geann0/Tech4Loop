"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { updateProfile, getProfile } from "./actions";
import type { Profile } from "@/types";

export default function EditarPerfilPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    whatsapp: "",
  });

  useEffect(() => {
    async function loadProfile() {
      const result = await getProfile();

      if (result.success && result.profile) {
        setFormData({
          full_name: result.profile.full_name || "",
          phone: result.profile.phone || "",
          whatsapp: result.profile.whatsapp || "",
        });
      } else if (result.error) {
        setMessage({
          type: "error",
          text: result.error,
        });
      }

      setIsLoading(false);
    }

    loadProfile();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    const result = await updateProfile(formData);

    if (result.success) {
      setMessage({
        type: "success",
        text: "Perfil atualizado com sucesso!",
      });

      setTimeout(() => {
        router.push("/conta");
      }, 1500);
    } else {
      setMessage({
        type: "error",
        text: result.error || "Erro ao atualizar perfil",
      });
      setIsSaving(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 min-h-screen">
        <div className="max-w-2xl mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-blue mx-auto"></div>
          <p className="text-gray-400 mt-4">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 min-h-screen">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link
            href="/conta"
            className="text-neon-blue hover:text-electric-purple transition-colors inline-flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Voltar para Minha Conta
          </Link>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-8">
          <h1 className="text-3xl font-bold mb-8">Editar Perfil</h1>

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
              <label
                htmlFor="full_name"
                className="block text-sm font-medium mb-2"
              >
                Nome Completo
              </label>
              <input
                type="text"
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-neon-blue focus:border-transparent"
                placeholder="Seu nome completo"
                disabled={isSaving}
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium mb-2">
                Telefone
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-neon-blue focus:border-transparent"
                placeholder="(00) 00000-0000"
                disabled={isSaving}
              />
              <p className="mt-2 text-xs text-gray-400">Opcional</p>
            </div>

            <div>
              <label
                htmlFor="whatsapp"
                className="block text-sm font-medium mb-2"
              >
                WhatsApp
              </label>
              <input
                type="tel"
                id="whatsapp"
                name="whatsapp"
                value={formData.whatsapp}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-neon-blue focus:border-transparent"
                placeholder="(00) 00000-0000"
                disabled={isSaving}
              />
              <p className="mt-2 text-xs text-gray-400">
                Opcional - Para contato relacionado aos seus pedidos
              </p>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 bg-gradient-to-r from-neon-blue to-electric-purple text-white py-3 px-6 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? "Salvando..." : "Salvar Alterações"}
              </button>

              <Link
                href="/conta"
                className="flex-1 bg-gray-700 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-600 transition-colors text-center"
              >
                Cancelar
              </Link>
            </div>
          </form>

          <div className="mt-8 pt-8 border-t border-gray-700">
            <h2 className="text-xl font-bold mb-4">Alterar Senha</h2>
            <p className="text-gray-400 mb-4">
              Para alterar sua senha, use a opção &quot;Esqueci minha
              senha&quot; na tela de login.
            </p>
            <Link
              href="/esqueci-senha"
              className="inline-block text-neon-blue hover:text-electric-purple transition-colors"
            >
              Redefinir senha →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
