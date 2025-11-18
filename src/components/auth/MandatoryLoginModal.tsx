"use client";

import { useRouter } from "next/navigation";
import { X } from "lucide-react";

interface MandatoryLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  action: "cart" | "favorite" | "checkout";
}

export default function MandatoryLoginModal({
  isOpen,
  onClose,
  action,
}: MandatoryLoginModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const actionTexts = {
    cart: "adicionar produtos ao carrinho",
    favorite: "favoritar produtos",
    checkout: "finalizar sua compra",
  };

  const handleLogin = () => {
    // Salvar URL atual para redirect após login
    sessionStorage.setItem("redirectAfterLogin", window.location.pathname);
    router.push("/login");
  };

  const handleRegister = () => {
    // Salvar URL atual para redirect após registro
    sessionStorage.setItem("redirectAfterLogin", window.location.pathname);
    router.push("/register");
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/60 z-50 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md animate-in zoom-in duration-200">
        <div className="bg-white rounded-2xl shadow-2xl mx-4">
          {/* Header */}
          <div className="relative border-b border-gray-100 p-6 pb-4">
            <button
              onClick={onClose}
              className="absolute right-4 top-4 p-2 rounded-full hover:bg-gray-100 transition"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
            <h2 className="text-2xl font-bold text-gray-900">
              Login Necessário
            </h2>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-blue-900 text-sm leading-relaxed">
                🔒 Para <strong>{actionTexts[action]}</strong>, você precisa
                estar logado em sua conta.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <p className="text-gray-600 text-sm">
                Ao criar uma conta você pode:
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold mt-0.5">✓</span>
                  <span>Salvar seus produtos favoritos</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold mt-0.5">✓</span>
                  <span>Acompanhar seus pedidos em tempo real</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold mt-0.5">✓</span>
                  <span>Salvar endereços para checkout rápido</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold mt-0.5">✓</span>
                  <span>Acessar promoções exclusivas</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 pt-2 space-y-3">
            <button
              onClick={handleLogin}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3.5 rounded-xl transition shadow-md hover:shadow-lg"
            >
              Fazer Login
            </button>
            <button
              onClick={handleRegister}
              className="w-full bg-white hover:bg-gray-50 text-orange-600 font-semibold py-3.5 rounded-xl border-2 border-orange-500 transition"
            >
              Criar Conta Grátis
            </button>
            <button
              onClick={onClose}
              className="w-full text-gray-500 hover:text-gray-700 text-sm font-medium py-2 transition"
            >
              Continuar navegando
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
