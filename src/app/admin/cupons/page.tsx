import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";
import CouponsManager from "@/components/admin/CouponsManager";

export const metadata: Metadata = {
  title: "Gerenciar Cupons | Admin Tech4Loop",
  description: "Crie e gerencie cupons de desconto",
};

export default async function CouponsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  // Verificar se é admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    redirect("/");
  }

  // Buscar cupons
  const { data: coupons } = await supabase
    .from("coupons")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-gray-50">
      <CouponsManager initialCoupons={coupons || []} />
    </div>
  );
}
