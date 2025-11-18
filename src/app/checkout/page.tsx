import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";
import CheckoutCartForm from "@/components/checkout/CheckoutCartForm";

export const metadata = {
  title: "Checkout - Tech4Loop",
  description: "Finalize sua compra com segurança",
};

export default async function CheckoutPage() {
  // Verificar autenticação (opcional - pode permitir checkout como convidado)
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-gray-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neon-blue to-electric-purple">
            Finalizar Compra
          </h1>
          <p className="mt-2 text-gray-400">
            Preencha seus dados para concluir o pedido
          </p>
        </div>

        {/* Stepper de progresso */}
        <div className="mb-8 flex items-center justify-center">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-neon-blue flex items-center justify-center text-black font-bold">
                🛒
              </div>
              <span className="ml-2 text-sm font-medium text-white">
                Carrinho
              </span>
            </div>
            <div className="w-16 h-1 bg-neon-blue"></div>
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-neon-blue flex items-center justify-center text-black font-bold">
                📝
              </div>
              <span className="ml-2 text-sm font-medium text-white">Dados</span>
            </div>
            <div className="w-16 h-1 bg-gray-700"></div>
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-gray-400 font-bold">
                💳
              </div>
              <span className="ml-2 text-sm font-medium text-gray-400">
                Pagamento
              </span>
            </div>
          </div>
        </div>

        {/* Formulário de Checkout */}
        <CheckoutCartForm userEmail={user?.email} />

        {/* Selo de Segurança */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-4 px-6 py-3 bg-gray-900/50 border border-gray-800 rounded-xl">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span className="text-green-500">🔒</span>
              <span>Pagamento 100% Seguro</span>
            </div>
            <div className="w-px h-6 bg-gray-700"></div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span>💳</span>
              <span>Mercado Pago</span>
            </div>
            <div className="w-px h-6 bg-gray-700"></div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span>📱</span>
              <span>PIX</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
