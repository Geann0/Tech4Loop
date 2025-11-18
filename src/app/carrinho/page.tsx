"use client";

import { useCart } from "@/contexts/CartContext";
import Image from "next/image";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

export default function CartPage() {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    clearCart,
    toggleItemSelection,
    selectAllItems,
    deselectAllItems,
    removeSelectedItems,
    selectedItems,
    selectedTotal,
    hasSelectedItems,
  } = useCart();

  const allSelected =
    cart.items.length > 0 && cart.items.every((item) => item.selected);

  const handleSelectAll = () => {
    if (allSelected) {
      deselectAllItems();
    } else {
      selectAllItems();
    }
  };

  if (cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 min-h-screen">
        <div className="text-center max-w-md mx-auto">
          <h1 className="text-4xl font-bold mb-6">Carrinho Vazio</h1>
          <p className="text-gray-400 mb-8">
            Você ainda não adicionou produtos ao seu carrinho.
          </p>
          <Link
            href="/produtos"
            className="inline-block bg-electric-purple text-white font-bold py-3 px-8 rounded-lg hover:shadow-glow transition-all"
          >
            Ver Produtos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Meu Carrinho ({cart.itemCount})</h1>
        <div className="flex gap-3">
          {hasSelectedItems && (
            <button
              onClick={removeSelectedItems}
              className="text-red-500 hover:text-red-400 transition-colors px-4 py-2 border border-red-500 rounded-lg"
            >
              Remover Selecionados ({selectedItems.length})
            </button>
          )}
          <button
            onClick={clearCart}
            className="text-gray-400 hover:text-gray-300 transition-colors px-4 py-2 border border-gray-700 rounded-lg"
          >
            Limpar Tudo
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Checkbox Selecionar Todos */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 mb-4 flex items-center gap-3">
            <input
              type="checkbox"
              id="select-all"
              checked={allSelected}
              onChange={handleSelectAll}
              className="w-5 h-5 rounded border-gray-600 bg-gray-800 text-electric-purple focus:ring-2 focus:ring-electric-purple focus:ring-offset-0 cursor-pointer"
            />
            <label
              htmlFor="select-all"
              className="cursor-pointer font-semibold"
            >
              Selecionar Todos ({cart.items.length})
            </label>
          </div>

          <div className="space-y-4">
            {cart.items.map((item) => (
              <div
                key={item.product_id}
                className={`bg-gray-900/50 border rounded-lg p-4 flex gap-4 transition-all ${
                  item.selected ? "border-electric-purple" : "border-gray-800"
                }`}
              >
                {/* Checkbox de Seleção */}
                <div className="flex items-start pt-1">
                  <input
                    type="checkbox"
                    checked={item.selected || false}
                    onChange={() => toggleItemSelection(item.product_id)}
                    className="w-5 h-5 rounded border-gray-600 bg-gray-800 text-electric-purple focus:ring-2 focus:ring-electric-purple focus:ring-offset-0 cursor-pointer"
                    aria-label={`Selecionar ${item.product_name}`}
                  />
                </div>

                <div className="relative w-24 h-24 flex-shrink-0">
                  <Image
                    src={item.product_image}
                    alt={item.product_name}
                    fill
                    style={{ objectFit: "contain" }}
                    className="rounded"
                  />
                </div>

                <div className="flex-grow">
                  <Link
                    href={`/produtos/${item.product_slug}`}
                    className="font-semibold hover:text-neon-blue transition-colors block mb-1"
                  >
                    {item.product_name}
                  </Link>
                  {item.partner_name && (
                    <p className="text-sm text-gray-400 mb-2">
                      Vendido por: {item.partner_name}
                    </p>
                  )}
                  <p className="text-neon-blue font-bold">
                    {formatCurrency(item.product_price)}
                  </p>
                </div>

                <div className="flex flex-col items-end justify-between">
                  <button
                    onClick={() => removeFromCart(item.product_id)}
                    className="text-red-500 hover:text-red-400 transition-colors"
                    aria-label="Remover item"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>

                  <div className="flex items-center gap-2 border border-gray-700 rounded">
                    <button
                      onClick={() =>
                        updateQuantity(item.product_id, item.quantity - 1)
                      }
                      className="px-2 py-1 hover:bg-gray-800 transition-colors"
                      aria-label="Diminuir quantidade"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 min-w-[40px] text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(item.product_id, item.quantity + 1)
                      }
                      className="px-2 py-1 hover:bg-gray-800 transition-colors"
                      aria-label="Aumentar quantidade"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 sticky top-24">
            <h2 className="text-2xl font-bold mb-4">Resumo do Pedido</h2>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-gray-400">Items Selecionados:</span>
                <span className="font-semibold">{selectedItems.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Subtotal:</span>
                <span>{formatCurrency(selectedTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Frete:</span>
                <span className="text-sm">Calculado no checkout</span>
              </div>
            </div>

            <div className="border-t border-gray-800 pt-4 mb-6">
              <div className="flex justify-between text-xl font-bold">
                <span>Total:</span>
                <span className="text-neon-blue">
                  {formatCurrency(selectedTotal)}
                </span>
              </div>
            </div>

            {!hasSelectedItems && (
              <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/50 rounded-lg text-sm text-yellow-500">
                ⚠️ Selecione pelo menos um produto para continuar
              </div>
            )}

            <Link
              href="/checkout"
              className={`block w-full text-center font-bold py-3 rounded-lg transition-all mb-3 ${
                hasSelectedItems
                  ? "bg-electric-purple text-white hover:shadow-glow"
                  : "bg-gray-700 text-gray-400 cursor-not-allowed pointer-events-none"
              }`}
            >
              Finalizar Compra ({selectedItems.length}{" "}
              {selectedItems.length === 1 ? "item" : "itens"})
            </Link>

            <Link
              href="/produtos"
              className="block w-full text-center text-neon-blue hover:underline"
            >
              Continuar Comprando
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
