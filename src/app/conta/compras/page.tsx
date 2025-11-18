import { requireAuth } from "@/lib/auth";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ProfileSidebar from "@/components/profile/ProfileSidebar";
import OrdersHistory from "@/components/profile/OrdersHistory";

export const dynamic = "force-dynamic";

export default async function ComprasPage() {
  const user = await requireAuth();
  const supabase = createServerComponentClient({ cookies });

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/login");
  }

  if (profile.role === "admin") {
    redirect("/admin/dashboard");
  }

  if (profile.role === "partner") {
    redirect("/partner/dashboard");
  }

  // Buscar pedidos do usuário
  const { data: orders } = await supabase
    .from("orders")
    .select(
      `
      *,
      order_items (
        *,
        products (*)
      )
    `
    )
    .eq("customer_email", profile.email)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black">
      <div className="container mx-auto px-4 py-8 lg:py-12">
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-neon-blue to-electric-purple bg-clip-text text-transparent mb-2">
            Minhas Compras
          </h1>
          <p className="text-gray-400">
            Acompanhe seus pedidos e histórico de compras
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <ProfileSidebar profile={profile} />
          </div>

          <div className="lg:col-span-3">
            <OrdersHistory orders={orders || []} />
          </div>
        </div>
      </div>
    </div>
  );
}
