"use server";

import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function signInCustomer(formData: FormData) {
  const email = String(formData.get("email"));
  const password = String(formData.get("password"));
  const supabase = createServerActionClient({ cookies });

  // 1. Tenta fazer o login
  const { data: authData, error: signInError } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    });

  if (signInError) {
    console.error("Sign-in error:", signInError.message);

    // Mensagem específica para email não confirmado
    if (signInError.message.includes("Email not confirmed")) {
      return {
        error:
          "Email não confirmado. Verifique sua caixa de entrada e clique no link de confirmação.",
      };
    }

    return {
      error: "Email ou senha incorretos. Tente novamente.",
    };
  }

  // 2. Verificar se temos sessão
  if (!authData.session) {
    return {
      error: "Erro ao criar sessão. Tente novamente.",
    };
  }

  const user = authData.user;

  // 3. Buscar o perfil e o role do usuário na tabela 'profiles'
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, is_banned")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    console.error("Profile error:", profileError?.message);
    // Se o perfil não existe, desloga o usuário para segurança
    await supabase.auth.signOut();
    return {
      error: "Não foi possível encontrar o perfil do usuário.",
    };
  }

  // 4. Verificar se está banido
  if (profile.is_banned) {
    await supabase.auth.signOut();
    redirect("/conta/banido");
  }

  // 5. Verificar se é realmente um customer
  if (profile.role !== "customer") {
    await supabase.auth.signOut();
    return {
      error: "Esta área é apenas para clientes. Use o login de admin/parceiro.",
    };
  }

  // 6. Revalidar cache e redirecionar
  revalidatePath("/", "layout"); // Revalida toda a aplicação
  redirect("/conta");
}
