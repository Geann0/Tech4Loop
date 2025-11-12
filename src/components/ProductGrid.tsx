"use client";

import { useState } from "react";
import { Product, Category, Profile } from "@/types";
import Link from "next/link";
import Image from "next/image";
import WhatsAppButton from "./WhatsAppButton";

type ProductWithCategoryAndProfile = Product & {
  categories: { name: string } | null;
  profiles: Profile | null;
};

interface ProductGridProps {
  products: ProductWithCategoryAndProfile[];
  allCategories: Category[];
  currentCategory?: string;
  searchQuery?: string;
}

export default function ProductGrid({
  products,
  allCategories,
  currentCategory,
  searchQuery,
}: ProductGridProps) {
  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      !currentCategory || product.category_id === currentCategory;
    const matchesSearch =
      !searchQuery ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <>
      {/* Filtros */}
      <div className="flex flex-wrap justify-center gap-4 mb-12">
        <Link
          href="/produtos"
          className={`px-4 py-2 rounded-lg transition-colors ${
            !currentCategory
              ? "bg-electric-purple text-white"
              : "bg-gray-800 hover:bg-gray-700"
          }`}
        >
          Todos
        </Link>
        {allCategories.map((category) => (
          <Link
            key={category.id}
            href={`/produtos?category=${category.id}`}
            className={`px-4 py-2 rounded-lg transition-colors ${
              currentCategory === category.id
                ? "bg-electric-purple text-white"
                : "bg-gray-800 hover:bg-gray-700"
            }`}
          >
            {category.name}
          </Link>
        ))}
      </div>

      {/* Grid de Produtos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="bg-gray-900/50 rounded-lg overflow-hidden border border-gray-800 flex flex-col transition-transform transform hover:-translate-y-2 group"
          >
            <div className="relative w-full h-56">
              <Image
                src={product.image_urls[0]}
                alt={product.name}
                fill
                style={{ objectFit: "contain" }}
                className="bg-gray-700"
              />
            </div>
            <div className="p-4 flex flex-col flex-grow">
              <span className="text-sm text-gray-400 mb-1">
                Vendido por: {product.partner_name || "Tech4Loop"}
              </span>
              <h3 className="text-xl font-bold mb-2 truncate">
                {product.name}
              </h3>
              <p className="text-2xl font-bold text-neon-blue mb-4 flex-grow">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(product.price)}
              </p>
              <div className="flex flex-col gap-2">
                <Link
                  href={`/produtos/${product.slug}`}
                  className="w-full text-center bg-electric-purple text-white font-bold py-2 px-4 rounded-lg group-hover:shadow-glow transition-shadow"
                >
                  Ver Detalhes
                </Link>
                <WhatsAppButton
                  productName={product.name}
                  className="w-full text-center"
                  partnerName={product.partner_name}
                  partnerWhatsapp={product.profiles?.whatsapp_number || null}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
