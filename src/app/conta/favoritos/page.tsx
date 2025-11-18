import { redirect } from "next/navigation";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import ProfileSidebar from "@/components/profile/ProfileSidebar";
import FavoritesList from "@/components/profile/FavoritesList";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function FavoritosPage() {
  const supabase = createServerComponentClient({ cookies });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  const user = session.user;

  if (!user) {
    redirect("/login");
  }

  // Buscar perfil para verificar role
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profile?.role === "admin") {
    redirect("/admin/dashboard");
  }

  if (profile?.role === "partner") {
    redirect("/partner/dashboard");
  }

  // Buscar favoritos do usuário com produtos
  const { data: favorites } = await supabase
    .from("favorites")
    .select(
      `
      id,
      product_id,
      created_at,
      products (
        id,
        name,
        slug,
        description,
        price,
        compare_at_price,
        images,
        stock_quantity,
        category_id
      )
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // Transformar dados para o formato esperado
  const formattedFavorites =
    favorites?.map((fav: any) => ({
      id: fav.id,
      product: fav.products,
    })) || [];

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header com gradiente */}
        <div className="mb-8 p-8 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl border border-purple-500/30">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neon-blue to-electric-purple">
            Meu Perfil
          </h1>
          <p className="text-gray-400 mt-2">Produtos que você favoritou</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <ProfileSidebar
              profile={{
                id: user.id,
                email: user.email || "",
                partner_name: profile?.partner_name,
                role: profile?.role || "customer",
              }}
            />
          </div>

          {/* Conteúdo */}
          <div className="md:col-span-3">
            <FavoritesList favorites={formattedFavorites} />
          </div>
        </div>
      </div>
    </div>
  );
}
