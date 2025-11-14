"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log do erro para sistema de monitoramento (ex: Sentry)
    console.error("Error caught by error boundary:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        <h1 className="text-9xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neon-blue to-electric-purple">
          Ops!
        </h1>
        <h2 className="text-3xl md:text-4xl font-bold mt-4 mb-6">
          Algo deu errado
        </h2>
        <p className="text-gray-400 text-lg mb-8">
          Encontramos um erro inesperado. Nossa equipe foi notificada e estamos
          trabalhando para resolver o problema.
        </p>
        {error.digest && (
          <p className="text-sm text-gray-500 mb-8">
            Código do erro: {error.digest}
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="bg-neon-blue text-black font-bold py-3 px-8 rounded-lg hover:shadow-glow transition-all"
          >
            Tentar Novamente
          </button>
          <Link
            href="/"
            className="bg-electric-purple text-white font-bold py-3 px-8 rounded-lg hover:shadow-glow transition-all inline-block"
          >
            Voltar para Home
          </Link>
        </div>
      </div>
    </div>
  );
}
