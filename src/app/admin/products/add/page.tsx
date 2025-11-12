"use client";

import Link from "next/link";
import AdminAddProductForm from "@/components/admin/AdminAddProductForm";

export default function AddAdminProductPage() {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          Adicionar Produto (Loja Principal)
        </h1>
        <Link href="/admin/products" className="text-neon-blue hover:underline">
          &larr; Voltar para Produtos
        </Link>
      </div>
      <AdminAddProductForm />
    </div>
  );
}
