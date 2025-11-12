"use client";

import WhatsAppButton from "@/components/WhatsAppButton";
import { FormEvent, useState } from "react";

export default function ContatoPage() {
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("loading");
    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, subject: `Contato de ${data.name}` }),
      });

      if (!response.ok) throw new Error();

      setStatus("success");
      (event.target as HTMLFormElement).reset();
    } catch (error) {
      setStatus("error");
    }
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Entre em Contato</h1>
        <p className="text-lg text-gray-400 mb-12">
          Tem alguma dúvida ou sugestão? Fale conosco através dos nossos canais
          de atendimento.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Informações e Links */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Canais de Atendimento</h2>
          <div>
            <h3 className="font-bold text-neon-blue">WhatsApp</h3>
            <p className="text-gray-400">+55 (69) 99350-0039</p>
            <div className="flex items-center gap-4">
              <div className="text-neon-blue text-2xl">ICON</div>
              <div>
                <h3 className="font-bold text-white">Dúvida Geral</h3>
                <WhatsAppButton
                  productName="Dúvida Geral"
                  className="text-left p-0 bg-transparent hover:bg-transparent font-normal"
                  partnerName={null}
                  partnerWhatsapp={null}
                />
              </div>
            </div>
          </div>
          <div>
            <h3 className="font-bold text-neon-blue">E-mail</h3>
            <a
              href="mailto:suporte.tech4loop@gmail.com"
              className="text-gray-400 hover:text-white"
            >
              suporte.tech4loop@gmail.com
            </a>
          </div>
          <div>
            <h3 className="font-bold text-neon-blue">Instagram</h3>
            <a
              href="https://instagram.com/tech4loop"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white"
            >
              @tech4loop
            </a>
          </div>
          <div>
            <h3 className="font-bold text-neon-blue">Localização</h3>
            <p className="text-gray-400">Ouro Preto do Oeste - RO</p>
          </div>
        </div>

        {/* Formulário de Contato */}
        <div className="bg-gray-900/50 p-8 rounded-lg border border-gray-800">
          <h2 className="text-2xl font-bold mb-6">Ou nos envie uma mensagem</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-300"
              >
                Nome
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                className="mt-1 block w-full bg-gray-800 border-gray-700 rounded-md shadow-sm focus:ring-neon-blue focus:border-neon-blue"
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
                className="mt-1 block w-full bg-gray-800 border-gray-700 rounded-md shadow-sm focus:ring-neon-blue focus:border-neon-blue"
              />
            </div>
            <div>
              <label
                htmlFor="message"
                className="block text-sm font-medium text-gray-300"
              >
                Mensagem
              </label>
              <textarea
                id="message"
                name="message"
                rows={4}
                required
                className="mt-1 block w-full bg-gray-800 border-gray-700 rounded-md shadow-sm focus:ring-neon-blue focus:border-neon-blue"
              ></textarea>
            </div>
            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full bg-electric-purple text-white font-bold py-3 px-4 rounded-lg hover:shadow-glow transition-shadow disabled:bg-gray-500 disabled:cursor-not-allowed"
            >
              {status === "loading" ? "Enviando..." : "Enviar Mensagem"}
            </button>
            {status === "success" && (
              <p className="text-green-400 text-center">
                Mensagem enviada com sucesso!
              </p>
            )}
            {status === "error" && (
              <p className="text-red-400 text-center">
                Ocorreu um erro. Tente novamente.
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
