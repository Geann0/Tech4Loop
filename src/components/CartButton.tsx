"use client";

import { useCart } from "@/contexts/CartContext";
import Link from "next/link";
import { useState } from "react";

export default function CartButton() {
  const { cart } = useCart();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-white hover:text-neon-blue transition-colors"
        aria-label="Carrinho de compras"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
          />
        </svg>
        {cart.itemCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-electric-purple text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {cart.itemCount > 99 ? "99+" : cart.itemCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-80 bg-gray-900 border border-gray-800 rounded-lg shadow-2xl z-50 max-h-96 overflow-y-auto">
            {cart.items.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-gray-400 mb-4">Seu carrinho está vazio</p>
                <Link
                  href="/produtos"
                  onClick={() => setIsOpen(false)}
                  className="text-neon-blue hover:underline"
                >
                  Ver produtos
                </Link>
              </div>
            ) : (
              <>
                <div className="p-4 border-b border-gray-800">
                  <h3 className="font-bold text-lg">
                    Carrinho ({cart.itemCount})
                  </h3>
                </div>
                <div className="p-4">
                  {/* Items list - simplificado */}
                  <div className="space-y-3">
                    {cart.items.map((item) => (
                      <div key={item.product_id} className="text-sm">
                        <p className="font-semibold truncate">
                          {item.product_name}
                        </p>
                        <p className="text-gray-400">
                          {item.quantity}x R$ {item.product_price.toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-800">
                    <div className="flex justify-between font-bold text-lg mb-4">
                      <span>Total:</span>
                      <span className="text-neon-blue">
                        R$ {cart.total.toFixed(2)}
                      </span>
                    </div>
                    <Link
                      href="/carrinho"
                      onClick={() => setIsOpen(false)}
                      className="block w-full bg-electric-purple text-white text-center font-bold py-2 rounded-lg hover:shadow-glow transition-all"
                    >
                      Ver Carrinho
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
