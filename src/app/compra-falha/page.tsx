import Link from "next/link";

export default function CompraFalha() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-4xl font-bold text-red-500 mb-4">Pagamento Falhou</h1>
      <p className="text-lg text-gray-400 mb-8">
        Ocorreu um problema ao processar seu pagamento. Por favor, tente
        novamente.
      </p>
      <Link
        href="/produtos"
        className="bg-neon-blue text-black font-bold py-3 px-6 rounded-lg hover:shadow-glow transition-shadow"
      >
        Ver outros produtos
      </Link>
    </div>
  );
}
