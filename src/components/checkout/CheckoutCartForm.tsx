"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useEffect, useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  formatCEP,
  formatPhone,
  fetchAddressByCEP,
  saveCheckoutData,
  loadCheckoutData,
  calculateShipping,
} from "@/lib/checkoutUtils";
import { processCartCheckout } from "@/app/checkout/cartActions";

function SubmitButton({ paymentMethod }: { paymentMethod: string }) {
  const { pending } = useFormStatus();

  const methodLabels: Record<string, string> = {
    credit_card: "💳 Continuar para Pagamento com Cartão",
    pix: "📱 Gerar QR Code PIX",
    boleto: "🧾 Gerar Boleto Bancário",
    wallet: "👛 Pagar com Carteira Digital",
  };

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full flex justify-center items-center gap-2 py-4 px-6 border border-transparent rounded-xl shadow-sm text-base font-bold text-white bg-gradient-to-r from-neon-blue to-electric-purple hover:shadow-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? (
        <>
          <span className="animate-spin">⏳</span>
          <span>Processando...</span>
        </>
      ) : (
        <span>{methodLabels[paymentMethod] || "Finalizar Pedido"}</span>
      )}
    </button>
  );
}

export default function CheckoutCartForm({
  userEmail,
}: {
  userEmail?: string;
}) {
  const { cart, clearCart } = useCart();
  const router = useRouter();
  const initialState = { error: null, success: false, paymentUrl: undefined };
  const [state, formAction] = useFormState(processCartCheckout, initialState);
  const [paymentMethod, setPaymentMethod] = useState("credit_card");
  const [saveData, setSaveData] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: userEmail || "",
    phone: "",
    cep: "",
    address: "",
    city: "",
    state: "",
  });
  const [shipping, setShipping] = useState(calculateShipping("", cart.total));

  // Redirecionar se carrinho vazio
  useEffect(() => {
    if (cart.items.length === 0) {
      router.push("/carrinho");
    }
  }, [cart.items.length, router]);

  // Carregar dados salvos
  useEffect(() => {
    if (saveData) {
      const savedData = loadCheckoutData();
      if (savedData) {
        setFormData((prev) => ({
          ...prev,
          name: savedData.name,
          phone: savedData.phone,
          cep: savedData.cep,
          address: savedData.address,
          city: savedData.city,
          state: savedData.state,
        }));
      }
    }
  }, [saveData]);

  useEffect(() => {
    if (state.success && state.paymentUrl) {
      if (saveData) {
        saveCheckoutData(formData);
      }
      clearCart();
      window.location.href = state.paymentUrl;
    }
  }, [state, saveData, formData, clearCart]);

  // Auto-preencher endereço com ViaCEP
  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCEP(e.target.value);
    setFormData({ ...formData, cep: formatted });

    const cleanCEP = formatted.replace(/\D/g, "");

    if (cleanCEP.length === 8) {
      setCepLoading(true);
      const addressData = await fetchAddressByCEP(cleanCEP);
      setCepLoading(false);

      if (addressData) {
        setFormData({
          ...formData,
          cep: formatted,
          address: addressData.logradouro,
          city: addressData.localidade,
          state: addressData.uf,
        });
        setShipping(calculateShipping(cleanCEP, cart.total));
      }
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setFormData({ ...formData, phone: formatted });
  };

  if (cart.items.length === 0) {
    return null;
  }

  const paymentMethods = [
    {
      id: "credit_card",
      name: "💳 Cartão de Crédito",
      description: "Até 12x sem juros",
    },
    { id: "pix", name: "📱 PIX", description: "Aprovação imediata" },
    { id: "boleto", name: "🧾 Boleto", description: "Vencimento em 3 dias" },
    {
      id: "wallet",
      name: "👛 Carteira Digital",
      description: "Mercado Pago, PicPay",
    },
  ];

  return (
    <form action={formAction} className="grid lg:grid-cols-3 gap-8">
      {/* Coluna Esquerda - Formulário */}
      <div className="lg:col-span-2 space-y-6">
        {/* Dados Pessoais */}
        <div className="bg-dark-card border border-gray-800 rounded-xl overflow-hidden">
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-4 border-b border-gray-700">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>👤</span>
              <span>Dados Pessoais</span>
            </h2>
          </div>

          <div className="p-6 space-y-4">
            {/* Input fields com emojis */}
            <input type="hidden" name="cartData" value={JSON.stringify(cart)} />

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nome Completo *
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent transition-all"
                placeholder="Seu nome completo"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  📧 Email *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent transition-all"
                  placeholder="seu@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  📞 Telefone *
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  maxLength={15}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent transition-all"
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Endereço de Entrega */}
        <div className="bg-dark-card border border-gray-800 rounded-xl overflow-hidden">
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-4 border-b border-gray-700">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>📦</span>
              <span>Endereço de Entrega</span>
            </h2>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                CEP *
              </label>
              <input
                type="text"
                name="cep"
                required
                value={formData.cep}
                onChange={handleCepChange}
                maxLength={9}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent transition-all"
                placeholder="00000-000"
              />
              {cepLoading && (
                <p className="text-xs text-gray-400 mt-1">
                  🔍 Buscando endereço...
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Endereço *
              </label>
              <input
                type="text"
                name="address"
                required
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent transition-all"
                placeholder="Rua, número, complemento"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Cidade *
                </label>
                <input
                  type="text"
                  name="city"
                  required
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent transition-all"
                  placeholder="Cidade"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Estado *
                </label>
                <input
                  type="text"
                  name="state"
                  required
                  value={formData.state}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      state: e.target.value.toUpperCase(),
                    })
                  }
                  maxLength={2}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent transition-all"
                  placeholder="UF"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Método de Pagamento */}
        <div className="bg-dark-card border border-gray-800 rounded-xl overflow-hidden">
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-4 border-b border-gray-700">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>💰</span>
              <span>Forma de Pagamento</span>
            </h2>
          </div>

          <div className="p-6 space-y-3">
            <input type="hidden" name="paymentMethod" value={paymentMethod} />
            {paymentMethods.map((method) => (
              <label
                key={method.id}
                className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  paymentMethod === method.id
                    ? "border-neon-blue bg-neon-blue/10"
                    : "border-gray-700 hover:border-gray-600"
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="paymentMethodRadio"
                    value={method.id}
                    checked={paymentMethod === method.id}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4 text-neon-blue"
                  />
                  <div>
                    <p className="font-medium text-white">{method.name}</p>
                    <p className="text-sm text-gray-400">
                      {method.description}
                    </p>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Checkbox salvar dados */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="saveData"
            checked={saveData}
            onChange={(e) => setSaveData(e.target.checked)}
            className="w-4 h-4"
          />
          <label htmlFor="saveData" className="text-sm text-gray-300">
            💾 Salvar meus dados para próximas compras
          </label>
        </div>

        {/* Mensagens de erro */}
        {state.error && (
          <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
            <p className="text-sm text-red-400 flex items-center gap-2">
              <span>⚠️</span>
              <span>{state.error}</span>
            </p>
          </div>
        )}
      </div>

      {/* Coluna Direita - Resumo */}
      <div className="lg:col-span-1">
        <div className="bg-dark-card border border-gray-800 rounded-xl overflow-hidden sticky top-24">
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-4 border-b border-gray-700">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>🛍️</span>
              <span>Resumo do Pedido</span>
            </h2>
          </div>

          <div className="p-6 space-y-4">
            {/* Lista de produtos */}
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {cart.items.map((item) => (
                <div key={item.product_id} className="flex gap-3 items-center">
                  <div className="relative w-16 h-16 flex-shrink-0 bg-gray-900 rounded">
                    <Image
                      src={item.product_image}
                      alt={item.product_name}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">
                      {item.product_name}
                    </p>
                    <p className="text-xs text-gray-400">
                      Qtd: {item.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-neon-blue">
                    R$ {(item.product_price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-700 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Subtotal:</span>
                <span className="text-white">R$ {cart.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">🚚 Frete:</span>
                <span className="text-white">
                  {shipping.value === 0
                    ? "GRÁTIS"
                    : `R$ ${shipping.value.toFixed(2)}`}
                </span>
              </div>
            </div>

            <div className="border-t border-gray-700 pt-4">
              <div className="flex justify-between text-xl font-bold">
                <span className="text-white">Total:</span>
                <span className="text-neon-blue">
                  R$ {(cart.total + shipping.value).toFixed(2)}
                </span>
              </div>
            </div>

            <SubmitButton paymentMethod={paymentMethod} />
          </div>
        </div>
      </div>
    </form>
  );
}
