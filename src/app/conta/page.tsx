import { requireAuth } from "@/lib/auth";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import ProfileSidebar from "@/components/profile/ProfileSidebar";
import ProfileOverview from "@/components/profile/ProfileOverview";

export const dynamic = "force-dynamic";

export default async function ContaPage() {
  const user = await requireAuth();
  const supabase = createServerComponentClient({ cookies });

  // Buscar informações completas do perfil
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/admin/login");
  }

  // Redirecionar para dashboard apropriado se for admin ou partner
  if (profile.role === "admin") {
    redirect("/admin/dashboard");
  }

  if (profile.role === "partner") {
    redirect("/partner/dashboard");
  }

  // Buscar estatísticas do usuário
  const { data: orders, count: ordersCount } = await supabase
    .from("orders")
    .select("*", { count: "exact" })
    .eq("customer_email", profile.email);

  const stats = {
    totalOrders: ordersCount || 0,
    pendingOrders: orders?.filter((o) => o.status === "pending").length || 0,
    completedOrders:
      orders?.filter((o) => o.status === "delivered").length || 0,
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black">
      <div className="container mx-auto px-4 py-8 lg:py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-neon-blue to-electric-purple bg-clip-text text-transparent mb-2">
            Meu Perfil
          </h1>
          <p className="text-gray-400">
            Gerencie suas informações e preferências
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <ProfileSidebar profile={profile} />
          </div>

          {/* Conteúdo Principal */}
          <div className="lg:col-span-3">
            <ProfileOverview profile={profile} stats={stats} />
          </div>
        </div>
      </div>
    </div>
  );
}
