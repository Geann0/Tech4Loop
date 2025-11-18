"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useEffect, useState } from "react";
import { Product } from "@/types";
import { processCheckout } from "@/app/checkout/actions";
import Image from "next/image";
import {
  formatCEP,
  formatPhone,
  fetchAddressByCEP,
  saveCheckoutData,
  loadCheckoutData,
  calculateShipping,
} from "@/lib/checkoutUtils";

function SubmitButton({ paymentMethod }: { paymentMethod: string }) {
  const { pending } = useFormStatus();
  
  const methodLabels: Record<string, string> = {
    credit_card: "Continuar para Pagamento com Cartão",
    pix: "Gerar QR Code PIX",
    boleto: "Gerar Boleto Bancário",
    wallet: "Pagar com Carteira Digital",
  };
  
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full flex justify-center items-center gap-2 py-4 px-6 border border-transparent rounded-xl shadow-sm text-base font-bold text-white bg-gradient-to-r from-neon-blue to-electric-purple hover:shadow-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? (
        <>
          <span className="animate-spin">◌</span>
          <span>Processando...</span>
        </>
      ) : (
        <>
          <span>→</span>
          <span>{methodLabels[paymentMethod] || "Finalizar Pedido"}</span>
        </>
      )}
    </button>
  );
}

export default function CheckoutForm({ product }: { product: Product }) {
  const initialState = { error: null, success: false, paymentUrl: undefined };
  const [state, formAction] = useFormState(processCheckout, initialState);
  const [paymentMethod, setPaymentMethod] = useState("credit_card");
  const [saveData, setSaveData] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    cep: "",
    address: "",
    city: "",
    state: "",
  });
  const [shipping, setShipping] = useState(calculateShipping("", product.price));

  // Carregar dados salvos ao montar o componente
  useEffect(() => {
    const savedData = loadCheckoutData();
    if (savedData && saveData) {
      setFormData({
        name: savedData.name,
        email: savedData.email,
        phone: savedData.phone,
        cep: savedData.cep,
        address: savedData.address,
        city: savedData.city,
        state: savedData.state,
      });
    }
  }, [saveData]);

  useEffect(() => {
    if (state.success && state.paymentUrl) {
      // Salvar dados se checkbox estiver marcado
      if (saveData) {
        saveCheckoutData(formData);
      }
      window.location.href = state.paymentUrl;
    }
  }, [state, saveData, formData]);

  // Auto-preencher endereço com ViaCEP
  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCEP(e.target.value);
    setFormData({ ...formData, cep: formatted });

    const cleanCEP = formatted.replace(/\D/g, "");
    
    if (cleanCEP.length === 8) {
      setCepLoading(true);
      const addressData = await fetchAddressByCEP(cleanCEP);
      setCepLoading(false);

      if (addressData && !addressData.erro) {
        setFormData({
          ...formData,
          cep: formatted,
          address: addressData.logradouro
            ? `${addressData.logradouro}, ${addressData.bairro}`
            : formData.address,
          city: addressData.localidade,
          state: addressData.uf,
        });

        // Calcular frete
        const newShipping = calculateShipping(cleanCEP, product.price);
        setShipping(newShipping);
      }
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setFormData({ ...formData, phone: formatted });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof typeof formData
  ) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Coluna Principal - Formulário */}
      <div className="lg:col-span-2 space-y-6">
        {/* Card de Informações Pessoais */}
        <div className="bg-dark-card border border-gray-800 rounded-xl overflow-hidden">
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-4 border-b border-gray-700">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>◉</span>
              <span>Informações de Contato</span>
            </h3>
          </div>
          
          <form action={formAction} className="p-6 space-y-4">
            <input type="hidden" name="productId" value={product.id} />
            <input type="hidden" name="productName" value={product.name} />
            <input type="hidden" name="productPrice" value={product.price} />
            <input type="hidden" name="slug" value={product.slug} />
            <input type="hidden" name="partnerId" value={product.partner_id || ""} />
            <input type="hidden" name="partnerName" value={product.partner_name || "Tech4Loop"} />
            <input type="hidden" name="paymentMethod" value={paymentMethod} />
            <input type="hidden" name="saveData" value={saveData ? "true" : "false"} />

            {/* Nome e Email em Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={(e) => handleInputChange(e, "name")}
                  placeholder="João Silva"
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent transition-all"
                />
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                  WhatsApp *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  placeholder="(69) 99999-9999"
                  maxLength={15}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                E-mail *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={formData.email}
                onChange={(e) => handleInputChange(e, "email")}
                placeholder="joao@email.com"
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent transition-all"
              />
            </div>
        </div>
      </div>

        {/* Card de Endereço */}
        <div className="bg-dark-card border border-gray-800 rounded-xl overflow-hidden">
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-4 border-b border-gray-700">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>◈</span>
              <span>Endereço de Entrega</span>
            </h3>
          </div>
          
          <div className="p-6 space-y-4">
            <div>
              <label htmlFor="cep" className="block text-sm font-medium text-gray-300 mb-2">
                CEP * {cepLoading && <span className="text-neon-blue text-xs">(Buscando...)</span>}
              </label>
              <input
                type="text"
                id="cep"
                name="cep"
                required
                value={formData.cep}
                onChange={handleCepChange}
                placeholder="00000-000"
                maxLength={9}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent transition-all"
              />
              <p className="mt-1 text-xs text-gray-500">Digite o CEP para preencher automaticamente</p>
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-300 mb-2">
                Endereço Completo *
              </label>
              <input
                type="text"
                id="address"
                name="address"
                required
                value={formData.address}
                onChange={(e) => handleInputChange(e, "address")}
                placeholder="Rua, Número, Bairro, Complemento"
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-300 mb-2">
                  Cidade *
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  required
                  value={formData.city}
                  onChange={(e) => handleInputChange(e, "city")}
                  placeholder="Porto Velho"
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent transition-all"
                />
              </div>
              
              <div>
                <label htmlFor="state" className="block text-sm font-medium text-gray-300 mb-2">
                  UF *
                </label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  required
                  value={formData.state}
                  onChange={(e) => handleInputChange(e, "state")}
                  maxLength={2}
                  placeholder="RO"
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent transition-all uppercase"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Card de Método de Pagamento */}
        <div className="bg-dark-card border border-gray-800 rounded-xl overflow-hidden">
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-4 border-b border-gray-700">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>$</span>
              <span>Forma de Pagamento</span>
            </h3>
          </div>
          
          <div className="p-6 space-y-3">
            {/* Cartão de Crédito */}
            <button
              type="button"
              onClick={() => setPaymentMethod("credit_card")}
              className={`w-full p-4 rounded-lg border-2 transition-all flex items-center gap-4 ${
                paymentMethod === "credit_card"
                  ? "border-neon-blue bg-neon-blue/10"
                  : "border-gray-700 bg-gray-900/50 hover:border-gray-600"
              }`}
            >
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                paymentMethod === "credit_card" ? "border-neon-blue" : "border-gray-600"
              }`}>
                {paymentMethod === "credit_card" && (
                  <div className="w-3 h-3 rounded-full bg-neon-blue"></div>
                )}
              </div>
              <div className="flex-1 text-left">
                <p className="font-bold text-white">Cartão de Crédito</p>
                <p className="text-sm text-gray-400">Visa, Mastercard, Elo, etc.</p>
              </div>
              <span className="text-2xl">💳</span>
            </button>

            {/* PIX */}
            <button
              type="button"
              onClick={() => setPaymentMethod("pix")}
              className={`w-full p-4 rounded-lg border-2 transition-all flex items-center gap-4 ${
                paymentMethod === "pix"
                  ? "border-green-500 bg-green-500/10"
                  : "border-gray-700 bg-gray-900/50 hover:border-gray-600"
              }`}
            >
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                paymentMethod === "pix" ? "border-green-500" : "border-gray-600"
              }`}>
                {paymentMethod === "pix" && (
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                )}
              </div>
              <div className="flex-1 text-left">
                <p className="font-bold text-white">PIX</p>
                <p className="text-sm text-gray-400">Aprovação instantânea</p>
              </div>
              <span className="text-2xl">⚡︎</span>
            </button>

            {/* Boleto */}
            <button
              type="button"
              onClick={() => setPaymentMethod("boleto")}
              className={`w-full p-4 rounded-lg border-2 transition-all flex items-center gap-4 ${
                paymentMethod === "boleto"
                  ? "border-orange-500 bg-orange-500/10"
                  : "border-gray-700 bg-gray-900/50 hover:border-gray-600"
              }`}
            >
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                paymentMethod === "boleto" ? "border-orange-500" : "border-gray-600"
              }`}>
                {paymentMethod === "boleto" && (
                  <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                )}
              </div>
              <div className="flex-1 text-left">
                <p className="font-bold text-white">Boleto Bancário</p>
                <p className="text-sm text-gray-400">Vencimento em 3 dias</p>
              </div>
              <span className="text-2xl">📄</span>
            </button>

            {/* Carteira Digital */}
            <button
              type="button"
              onClick={() => setPaymentMethod("wallet")}
              className={`w-full p-4 rounded-lg border-2 transition-all flex items-center gap-4 ${
                paymentMethod === "wallet"
                  ? "border-electric-purple bg-electric-purple/10"
                  : "border-gray-700 bg-gray-900/50 hover:border-gray-600"
              }`}
            >
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                paymentMethod === "wallet" ? "border-electric-purple" : "border-gray-600"
              }`}>
                {paymentMethod === "wallet" && (
                  <div className="w-3 h-3 rounded-full bg-electric-purple"></div>
                )}
              </div>
              <div className="flex-1 text-left">
                <p className="font-bold text-white">Carteira Digital</p>
                <p className="text-sm text-gray-400">Mercado Pago, PicPay, etc.</p>
              </div>
              <span className="text-2xl">📱</span>
            </button>
          </div>
        </div>

        {/* Checkbox Salvar Dados */}
        <div className="bg-gray-900/30 border border-gray-800 rounded-lg p-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={saveData}
              onChange={(e) => setSaveData(e.target.checked)}
              className="w-5 h-5 rounded border-gray-600 bg-gray-800 text-neon-blue focus:ring-2 focus:ring-neon-blue focus:ring-offset-0"
            />
            <span className="text-sm text-gray-300">
              Salvar meus dados para compras futuras
            </span>
          </label>
        </div>

        {/* Botão de Submissão */}
        <SubmitButton paymentMethod={paymentMethod} />

        {/* Mensagens de Erro */}
        {state?.error && (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/50">
            <p className="text-sm text-red-400 text-center mb-3">
              {state.error}
            </p>

            {state?.outOfCoverage && state?.productId && (
              <div className="text-center">
                <a
                  href={`/produtos?similar=${state.productId}&city=${state.userLocation?.city || ""}&state=${state.userLocation?.state || ""}`}
                  className="inline-block px-6 py-2 bg-electric-purple text-white rounded-lg hover:shadow-glow transition-shadow text-sm font-semibold"
                >
                  ◉ Buscar Produtos Similares na Minha Região
                </a>
              </div>
            )}
          </div>
        )}
      </form>
    </div>

      {/* Coluna Lateral - Resumo do Pedido */}
      <div className="lg:col-span-1">
        <div className="bg-dark-card border border-gray-800 rounded-xl overflow-hidden sticky top-4">
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-4 border-b border-gray-700">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>◈</span>
              <span>Resumo do Pedido</span>
            </h3>
          </div>
          
          <div className="p-6">
            {/* Produto */}
            <div className="flex gap-4 pb-6 border-b border-gray-700">
              <Image
                src={product.image_urls[0]}
                alt={product.name}
                width={80}
                height={80}
                className="rounded-lg bg-gray-800 object-contain"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-white text-sm line-clamp-2 mb-1">
                  {product.name}
                </h4>
                <p className="text-xs text-gray-400">
                  Vendido por: {product.partner_name || "Tech4Loop"}
                </p>
                <p className="text-sm text-gray-400 mt-2">Qtd: 1</p>
              </div>
            </div>

            {/* Valores */}
            <div className="py-6 space-y-3 border-b border-gray-700">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Subtotal</span>
                <span className="text-white font-medium">R$ {product.price.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">
                  Frete {shipping.name && `(${shipping.name})`}
                  {shipping.days > 0 && (
                    <span className="block text-xs text-gray-500">
                      Entrega em {shipping.days} dias
                    </span>
                  )}
                </span>
                {shipping.value === 0 ? (
                  <span className="text-green-400 font-medium">Grátis</span>
                ) : (
                  <span className="text-white font-medium">R$ {shipping.value.toFixed(2)}</span>
                )}
              </div>
            </div>

            {/* Total */}
            <div className="pt-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-lg font-bold text-white">Total</span>
                <span className="text-2xl font-bold text-neon-blue">
                  R$ {(product.price + shipping.value).toFixed(2)}
                </span>
              </div>
              {shipping.value === 0 && product.price < 200 && (
                <p className="text-xs text-gray-500 text-right">
                  Frete grátis para sua região!
                </p>
              )}
              {product.price >= 200 && shipping.value === 0 && (
                <p className="text-xs text-green-400 text-right">
                  ✓ Você ganhou frete grátis!
                </p>
              )}
            </div>

            {/* Garantias */}
            <div className="mt-6 pt-6 border-t border-gray-700 space-y-3">
              {/* Método de Pagamento Selecionado */}
              {paymentMethod && (
                <div className="mb-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                  <p className="text-xs text-gray-400 mb-1">Forma de Pagamento</p>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {paymentMethod === "credit_card" && "💳"}
                      {paymentMethod === "pix" && "⚡︎"}
                      {paymentMethod === "boleto" && "📄"}
                      {paymentMethod === "wallet" && "📱"}
                    </span>
                    <span className="text-sm font-medium text-white">
                      {paymentMethod === "credit_card" && "Cartão de Crédito"}
                      {paymentMethod === "pix" && "PIX"}
                      {paymentMethod === "boleto" && "Boleto"}
                      {paymentMethod === "wallet" && "Carteira Digital"}
                    </span>
                  </div>
                  {paymentMethod === "credit_card" && (
                    <p className="text-xs text-gray-500 mt-1">Até 12x sem juros</p>
                  )}
                  {paymentMethod === "pix" && (
                    <p className="text-xs text-green-400 mt-1">Aprovação instantânea</p>
                  )}
                  {paymentMethod === "boleto" && (
                    <p className="text-xs text-gray-500 mt-1">Vencimento em 3 dias</p>
                  )}
                </div>
              )}
              
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <span className="text-green-400">✓</span>
                <span>Compra 100% segura</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <span className="text-green-400">✓</span>
                <span>Garantia de devolução</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <span className="text-green-400">✓</span>
                <span>Suporte ao cliente</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
