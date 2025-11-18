import { redirect } from "next/navigation";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import ProfileSidebar from "@/components/profile/ProfileSidebar";
import ReviewsList from "@/components/profile/ReviewsList";
import type { Review } from "./actions";

export const dynamic = "force-dynamic"; // Força renderização dinâmica
export const revalidate = 0; // Desabilita cache

export default async function AvaliacoesPage() {
  const supabase = createServerComponentClient({ cookies });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  console.log('🔍 [Avaliacoes] Session:', !!session, '- User:', session?.user?.id);

  if (!session) {
    console.log('❌ [Avaliacoes] No session found, redirecting to /login');
    redirect("/login");
  }

  const user = session.user;

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

  // Buscar avaliações do usuário com produtos
  const { data: reviews } = await supabase
    .from("product_reviews")
    .select(
      `
      id,
      user_id,
      product_id,
      order_id,
      rating,
      title,
      comment,
      created_at,
      updated_at,
      products (
        id,
        name,
        slug,
        price,
        images
      )
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // Transformar dados para o formato esperado
  const formattedReviews =
    reviews?.map((rev: any) => ({
      review: {
        id: rev.id,
        user_id: rev.user_id,
        product_id: rev.product_id,
        order_id: rev.order_id,
        rating: rev.rating,
        title: rev.title,
        comment: rev.comment,
        created_at: rev.created_at,
        updated_at: rev.updated_at,
      } as Review,
      product: rev.products,
    })) || [];

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header com gradiente */}
        <div className="mb-8 p-8 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl border border-purple-500/30">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neon-blue to-electric-purple">
            Meu Perfil
          </h1>
          <p className="text-gray-400 mt-2">Suas avaliações de produtos</p>
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
            <ReviewsList reviews={formattedReviews} />
          </div>
        </div>
      </div>
    </div>
  );
}
