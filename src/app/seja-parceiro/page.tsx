"use client";

import { FormEvent, useState } from "react";

export default function SejaParceiroPage() {
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
        body: JSON.stringify({
          ...data,
          subject: `Interesse de Parceria: ${data.name}`,
        }),
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
        <h1 className="text-4xl font-bold mb-4">Seja um Parceiro Tech4Loop</h1>
        <p className="text-lg text-gray-400 mb-12">
          Leve nossos produtos para a sua loja e faça parte da nossa rede de
          revendedores. Oferecemos condições especiais e suporte dedicado.
        </p>
      </div>

      <div className="max-w-xl mx-auto bg-gray-900/50 p-8 rounded-lg border border-gray-800">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Preencha o formulário de interesse
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-300"
            >
              Nome Completo / Nome da Loja
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
              E-mail para Contato
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
              htmlFor="phone"
              className="block text-sm font-medium text-gray-300"
            >
              Telefone / WhatsApp
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              required
              className="mt-1 block w-full bg-gray-800 border-gray-700 rounded-md shadow-sm focus:ring-neon-blue focus:border-neon-blue"
            />
          </div>
          <div>
            <label
              htmlFor="message"
              className="block text-sm font-medium text-gray-300"
            >
              Fale um pouco sobre sua loja ou negócio
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
            className="w-full bg-neon-blue text-black font-bold py-3 px-4 rounded-lg hover:shadow-glow transition-shadow disabled:bg-gray-500 disabled:cursor-not-allowed"
          >
            {status === "loading" ? "Enviando..." : "Enviar Interesse"}
          </button>
          {status === "success" && (
            <p className="text-green-400 text-center">
              Interesse enviado com sucesso! Entraremos em contato.
            </p>
          )}
          {status === "error" && (
            <p className="text-red-400 text-center">
              Ocorreu um erro. Por favor, tente novamente.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
