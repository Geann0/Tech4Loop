export default function BannedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        <h1 className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-orange-500 mb-6">
          Conta Suspensa
        </h1>
        <p className="text-gray-400 text-lg mb-8">
          Sua conta foi suspensa por violar nossas políticas de uso.
        </p>
        <p className="text-gray-500 mb-8">
          Se você acredita que isso foi um erro, por favor entre em contato com
          nossa equipe de suporte.
        </p>
        <a
          href="/contato"
          className="inline-block bg-electric-purple text-white font-bold py-3 px-8 rounded-lg hover:shadow-glow transition-all"
        >
          Falar com Suporte
        </a>
      </div>
    </div>
  );
}
