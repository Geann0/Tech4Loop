import Link from "next/link";
import AddPartnerForm from "@/components/admin/AddPartnerForm";

export default function AddPartnerPage() {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Adicionar Novo Parceiro</h1>
        <Link href="/admin/partners" className="text-neon-blue hover:underline">
          &larr; Voltar para Parceiros
        </Link>
      </div>
      <AddPartnerForm />
    </div>
  );
}
