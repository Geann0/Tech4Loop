import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import EditPartnerForm from "@/components/admin/EditPartnerForm";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function getPartner(id: string) {
  const supabase = createServerComponentClient({ cookies });
  const { data: partner, error } = await supabase
    .from("profiles")
    .select("id, partner_name, email, whatsapp_number, service_regions")
    .eq("id", id)
    .single();

  if (error || !partner) {
    notFound();
  }
  return partner;
}

export default async function EditPartnerPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return redirect("/admin/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") {
    return redirect("/admin/login?message=Acesso negado.");
  }

  const partner = await getPartner(params.id);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Editar Parceiro</h1>
        <Link href="/admin/partners" className="text-neon-blue hover:underline">
          &larr; Voltar para Parceiros
        </Link>
      </div>
      <EditPartnerForm partner={partner} />
    </div>
  );
}
