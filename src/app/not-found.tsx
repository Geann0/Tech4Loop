import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neon-blue to-electric-purple">
          404
        </h1>
        <h2 className="text-3xl md:text-4xl font-bold mt-4 mb-6">
          Página não encontrada
        </h2>
        <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto">
          Desculpe, a página que você está procurando não existe ou foi movida.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="bg-neon-blue text-black font-bold py-3 px-8 rounded-lg hover:shadow-glow transition-all"
          >
            Voltar para Home
          </Link>
          <Link
            href="/produtos"
            className="bg-electric-purple text-white font-bold py-3 px-8 rounded-lg hover:shadow-glow transition-all"
          >
            Ver Produtos
          </Link>
        </div>
      </div>
    </div>
  );
}
