"use client";

import { useState } from "react";
import { Product } from "@/types";
import Link from "next/link";
import Image from "next/image";
import WhatsAppButton from "./WhatsAppButton";

interface PartnerProductGridProps {
  products: Product[];
  partners: string[];
}

export default function PartnerProductGrid({
  products,
  partners,
}: PartnerProductGridProps) {
  const [activePartner, setActivePartner] = useState(partners[0] || null);

  const filteredProducts = activePartner
    ? products.filter((product) => product.partner_name === activePartner)
    : [];

  if (partners.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">
          Nenhum parceiro com produtos foi encontrado.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Filtros por Parceiro */}
      <div className="flex flex-wrap justify-center gap-4 my-12">
        {partners.map((partner) => (
          <button
            key={partner}
            onClick={() => setActivePartner(partner)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activePartner === partner
                ? "bg-electric-purple text-white"
                : "bg-gray-800 hover:bg-gray-700"
            }`}
          >
            {partner}
          </button>
        ))}
      </div>

      {/* Grid de Produtos do Parceiro */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
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
                <h3 className="text-xl font-bold mb-2 truncate">
                  {product.name}
                </h3>
                <p className="text-2xl font-bold text-neon-blue mb-4 flex-grow">
                  R$ {product.price.toFixed(2)}
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
          ))
        ) : (
          <p className="col-span-full text-center text-gray-400">
            Nenhum produto encontrado para este parceiro.
          </p>
        )}
      </div>
    </>
  );
}
