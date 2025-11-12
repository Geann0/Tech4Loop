"use client";

import { useState } from "react";
import { Product, Profile } from "@/types";
import Image from "next/image";
import Link from "next/link";
import WhatsAppButton from "./WhatsAppButton";

type ProductWithCategoryAndProfile = Product & {
  categories: { name: string } | null;
  profiles: Profile | null;
};

export default function ProductDetailsClient({
  product,
}: {
  product: ProductWithCategoryAndProfile;
}) {
  const [mainImage, setMainImage] = useState(product.image_urls[0]);

  return (
    <div className="text-white">
      <Link
        href="/produtos"
        className="text-neon-blue hover:underline mb-8 inline-block"
      >
        &larr; Voltar para todos os produtos
      </Link>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Galeria de Imagens */}
        <div>
          <div className="relative w-full h-96 rounded-lg mb-4 border border-gray-700 overflow-hidden">
            <Image
              src={mainImage}
              alt={product.name}
              fill
              style={{ objectFit: "contain" }}
              priority
              className="bg-gray-800"
            />
          </div>
          <div className="grid grid-cols-5 gap-2">
            {product.image_urls.map((url, index) => (
              <div
                key={index}
                className={`relative w-full h-20 rounded-md cursor-pointer border-2 ${
                  mainImage === url ? "border-neon-blue" : "border-transparent"
                }`}
                onClick={() => setMainImage(url)}
              >
                <Image
                  src={url}
                  alt={`${product.name} thumbnail ${index + 1}`}
                  fill
                  style={{ objectFit: "contain" }}
                  className="bg-gray-800 rounded"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Informações do Produto */}
        <div className="space-y-4 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight break-words">
            {product.name}
          </h1>
          {product.categories && (
            <p className="text-sm text-gray-400">{product.categories.name}</p>
          )}
          <p className="text-3xl text-neon-blue">
            {new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(product.price)}
          </p>
          <p className="text-sm text-gray-400 mb-6">
            Vendido por: {product.partner_name || "Tech4Loop"}
          </p>

          <div className="mt-8 flex flex-col gap-4">
            <Link
              href={`/checkout/${product.slug}`}
              className="w-full text-center bg-neon-blue text-black font-bold py-3 px-6 rounded-lg hover:shadow-glow transition-shadow"
            >
              Comprar Agora
            </Link>
            <WhatsAppButton
              productName={product.name}
              className="w-full"
              partnerName={product.partner_name}
              partnerWhatsapp={product.profiles?.whatsapp_number || null}
            />
          </div>
        </div>
      </div>

      {/* Descrição e Detalhes */}
      <section className="mt-16" aria-labelledby="description-heading">
        <div className="border-b border-gray-700">
          <h2 id="description-heading" className="text-2xl font-bold py-4">
            Detalhes do Produto
          </h2>
        </div>
        {product.description && (
          <div
            className="prose prose-invert max-w-none text-gray-300 mt-6 break-words"
            dangerouslySetInnerHTML={{ __html: product.description }}
          />
        )}
      </section>

      {/* Especificações Técnicas */}
      {product.technical_specs &&
        Object.keys(product.technical_specs).length > 0 && (
          <section className="mt-10" aria-labelledby="specs-heading">
            <div className="border-b border-gray-700">
              <h2 id="specs-heading" className="text-2xl font-bold py-4">
                Especificações Técnicas
              </h2>
            </div>
            <ul className="mt-6 space-y-2 text-gray-300">
              {Object.entries(product.technical_specs).map(([key, value]) => (
                <li
                  key={key}
                  className="flex justify-between border-b border-gray-800 py-2"
                >
                  <span className="font-semibold">{key}:</span>
                  <span>{String(value)}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

      {/* Conteúdo da Caixa */}
      {product.box_contents && product.box_contents.length > 0 && (
        <section className="mt-10" aria-labelledby="box-contents-heading">
          <div className="border-b border-gray-700">
            <h2 id="box-contents-heading" className="text-2xl font-bold py-4">
              Conteúdo da Caixa
            </h2>
          </div>
          <ul className="mt-6 list-disc list-inside space-y-2 text-gray-300">
            {product.box_contents.map((item: string, index: number) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
