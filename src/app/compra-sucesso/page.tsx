import Link from "next/link";

export default function CompraSucessoPage() {
  return (
    <div className="container mx-auto px-4 py-16 text-center flex flex-col items-center justify-center min-h-[60vh]">
      <h1 className="text-4xl font-bold text-neon-blue mb-4">
        Pagamento Aprovado!
      </h1>
      <p className="text-lg text-gray-300 mb-8 max-w-xl">
        Obrigado por sua compra! Seu pedido foi recebido e em breve você
        receberá mais informações.
      </p>
      <Link
        href="/produtos"
        className="bg-electric-purple text-white font-bold py-3 px-8 rounded-lg hover:shadow-glow transition-shadow"
      >
        Continuar Comprando
      </Link>
    </div>
  );
}
