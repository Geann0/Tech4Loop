"use client";

import Link from "next/link";
import AddProductForm from "@/components/partner/AddProductForm";

export default function AddProductPage() {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Adicionar Novo Produto</h1>
        <Link
          href="/partner/dashboard"
          className="text-neon-blue hover:underline"
        >
          &larr; Voltar para o Painel
        </Link>
      </div>
      <AddProductForm />
    </div>
  );
}
