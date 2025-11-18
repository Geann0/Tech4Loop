"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { toggleFavorite } from "@/app/conta/favoritos/actions";
import type { Product } from "@/types";

interface FavoritesListProps {
  favorites: Array<{
    id: string;
    product: Product;
  }>;
}

export default function FavoritesList({ favorites }: FavoritesListProps) {
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [items, setItems] = useState(favorites);

  const handleRemove = async (productId: string, favoriteId: string) => {
    setRemovingId(favoriteId);
    const result = await toggleFavorite(productId);
    if (result.success) {
      setItems((prev) => prev.filter((item) => item.id !== favoriteId));
    }
    setRemovingId(null);
  };

  if (items.length === 0) {
    return (
      <div className="bg-dark-card border border-gray-800 rounded-xl p-12 text-center">
        <div className="text-6xl mb-4">♡</div>
        <h3 className="text-xl font-bold text-white mb-2">
          Nenhum produto favorito
        </h3>
        <p className="text-gray-400 mb-6">
          Adicione produtos aos favoritos para encontrá-los facilmente depois
        </p>
        <Link
          href="/produtos"
          className="inline-block px-6 py-3 bg-gradient-to-r from-neon-blue to-electric-purple text-white font-bold rounded-lg hover:shadow-glow transition-all"
        >
          Ver Produtos
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">
          {items.length} {items.length === 1 ? "Produto" : "Produtos"}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map(({ id, product }) => (
          <div
            key={id}
            className="bg-dark-card border border-gray-800 rounded-xl overflow-hidden hover:border-neon-blue/50 transition-all group"
          >
            <Link href={`/produtos/${product.slug}`} className="block relative">
              <div className="aspect-square relative bg-gray-900">
                {product.images && product.images.length > 0 && (
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                )}
                {product.stock_quantity === 0 && (
                  <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                    <span className="text-red-400 font-bold text-lg">
                      Esgotado
                    </span>
                  </div>
                )}
              </div>
            </Link>

            <div className="p-4">
              <Link
                href={`/produtos/${product.slug}`}
                className="block hover:text-neon-blue transition-colors"
              >
                <h3 className="font-bold text-white mb-2 line-clamp-2">
                  {product.name}
                </h3>
              </Link>

              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-2xl font-bold text-neon-blue">
                    R$ {product.price.toFixed(2).replace(".", ",")}
                  </p>
                  {product.compare_at_price &&
                    product.compare_at_price > product.price && (
                      <p className="text-sm text-gray-500 line-through">
                        R${" "}
                        {product.compare_at_price.toFixed(2).replace(".", ",")}
                      </p>
                    )}
                </div>
              </div>

              <div className="flex gap-2">
                <Link
                  href={`/produtos/${product.slug}`}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-neon-blue to-electric-purple text-white font-bold rounded-lg hover:shadow-glow transition-all text-center text-sm"
                >
                  Ver Detalhes
                </Link>
                <button
                  onClick={() => handleRemove(product.id, id)}
                  disabled={removingId === id}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
                  title="Remover dos favoritos"
                >
                  {removingId === id ? "..." : "✕︎"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
