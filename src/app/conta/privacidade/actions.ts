"use server";

import { createClient } from "@/lib/supabaseClient";
import { revalidatePath } from "next/cache";

/**
 * Exportar todos os dados pessoais do usuário (direito LGPD)
 */
export async function exportUserData() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Não autenticado" };
  }

  try {
    // Buscar dados do perfil
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    // Buscar pedidos
    const { data: orders } = await supabase
      .from("orders")
      .select("*, order_items(*, products(name, price))")
      .eq("customer_email", user.email);

    // Buscar favoritos
    const { data: favorites } = await supabase
      .from("favorites")
      .select("*, products(name, price, image_url)")
      .eq("user_id", user.id);

    // Buscar avaliações
    const { data: reviews } = await supabase
      .from("reviews")
      .select("*, products(name)")
      .eq("user_id", user.id);

    // Compilar todos os dados
    const userData = {
      exportDate: new Date().toISOString(),
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.created_at,
      },
      profile: profile
        ? {
            fullName: profile.full_name,
            phone: profile.phone,
            cpf: profile.cpf,
            birthDate: profile.birth_date,
            lgpdConsent: profile.lgpd_consent,
            lgpdConsentDate: profile.lgpd_consent_date,
          }
        : null,
      addresses: profile?.addresses || [],
      orders: orders?.map((o: any) => ({
        id: o.id,
        date: o.created_at,
        status: o.status,
        totalAmount: o.total_amount,
        items: o.order_items,
        shippingAddress: {
          address: o.customer_address,
          number: o.customer_number,
          complement: o.customer_complement,
          neighborhood: o.customer_neighborhood,
          city: o.customer_city,
          state: o.customer_state,
          cep: o.customer_cep,
        },
      })),
      favorites: favorites?.map((f: any) => ({
        productName: f.products.name,
        addedAt: f.created_at,
      })),
      reviews: reviews?.map((r: any) => ({
        productName: r.products.name,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.created_at,
      })),
    };

    // Converter para JSON formatado
    const jsonData = JSON.stringify(userData, null, 2);

    // Retornar como base64 para download
    const base64Data = Buffer.from(jsonData).toString("base64");

    return {
      success: true,
      data: base64Data,
      filename: `meus-dados-tech4loop-${new Date().toISOString().split("T")[0]}.json`,
    };
  } catch (error) {
    console.error("❌ Erro ao exportar dados:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Erro ao exportar dados",
    };
  }
}

/**
 * Solicitar exclusão de conta (direito LGPD - direito ao esquecimento)
 */
export async function requestAccountDeletion() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Não autenticado" };
  }

  try {
    // Registrar solicitação de exclusão
    const { error: logError } = await supabase
      .from("deletion_requests")
      .insert({
        user_id: user.id,
        email: user.email,
        requested_at: new Date().toISOString(),
        status: "pending",
        reason: "User requested via LGPD privacy page",
      });

    if (logError) throw logError;

    // Anonimizar dados imediatamente (não excluir por questões legais/fiscais)
    const { error: updateError } = await supabase.from("profiles").update({
      full_name: "[DADOS REMOVIDOS]",
      phone: null,
      cpf: null,
      birth_date: null,
      addresses: [],
      lgpd_consent: false,
    }).eq("id", user.id);

    if (updateError) throw updateError;

    // Logout do usuário
    await supabase.auth.signOut();

    return {
      success: true,
      message:
        "Sua solicitação de exclusão foi registrada. Seus dados foram anonimizados e você receberá um e-mail de confirmação em até 48 horas.",
    };
  } catch (error) {
    console.error("❌ Erro ao solicitar exclusão:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Erro ao processar solicitação",
    };
  }
}

/**
 * Atualizar preferências de consentimento LGPD
 */
export async function updateConsent(consent: {
  marketing: boolean;
  analytics: boolean;
  personalization: boolean;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Não autenticado" };
  }

  try {
    const { error } = await supabase
      .from("profiles")
      .update({
        consent_marketing: consent.marketing,
        consent_analytics: consent.analytics,
        consent_personalization: consent.personalization,
        lgpd_consent_updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) throw error;

    revalidatePath("/conta/privacidade");

    return {
      success: true,
      message: "Preferências atualizadas com sucesso",
    };
  } catch (error) {
    console.error("❌ Erro ao atualizar consentimento:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Erro ao atualizar preferências",
    };
  }
}

/**
 * Obter histórico de consentimentos
 */
export async function getConsentHistory() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Não autenticado", history: [] };
  }

  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select(
        "lgpd_consent, lgpd_consent_date, lgpd_consent_updated_at, consent_marketing, consent_analytics, consent_personalization"
      )
      .eq("id", user.id)
      .single();

    if (!profile) {
      return { success: false, error: "Perfil não encontrado", history: [] };
    }

    const history = [
      {
        date: profile.lgpd_consent_date,
        action: "Consentimento inicial",
        details: "Aceite dos termos de uso e política de privacidade",
      },
    ];

    if (profile.lgpd_consent_updated_at) {
      history.push({
        date: profile.lgpd_consent_updated_at,
        action: "Atualização de preferências",
        details: `Marketing: ${profile.consent_marketing ? "Sim" : "Não"}, Analytics: ${profile.consent_analytics ? "Sim" : "Não"}, Personalização: ${profile.consent_personalization ? "Sim" : "Não"}`,
      });
    }

    return {
      success: true,
      history: history.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      ),
    };
  } catch (error) {
    console.error("❌ Erro ao buscar histórico:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Erro ao buscar histórico",
      history: [],
    };
  }
}
