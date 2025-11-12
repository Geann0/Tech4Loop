"use server";

import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function signIn(formData: FormData) {
  const email = String(formData.get("email"));
  const password = String(formData.get("password"));
  const supabase = createServerActionClient({ cookies });

  // 1. Tenta fazer o login
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    console.error("Sign-in error:", signInError.message);
    return redirect(
      "/admin/login?message=Credenciais inválidas. Tente novamente."
    );
  }

  // 2. Obter o usuário autenticado para buscar o perfil
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return redirect(
      "/admin/login?message=Não foi possível obter os dados do usuário."
    );
  }

  // 3. Buscar o perfil e o role do usuário na tabela 'profiles'
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    console.error("Profile error:", profileError?.message);
    // Se o perfil não existe, desloga o usuário para segurança
    await supabase.auth.signOut();
    return redirect(
      "/admin/login?message=Não foi possível encontrar o perfil do usuário."
    );
  }

  // 4. Redirecionar com base no role
  if (profile.role === "admin") {
    return redirect("/admin/dashboard");
  } else if (profile.role === "partner") {
    return redirect("/partner/dashboard");
  } else {
    // Role desconhecido, desloga e retorna erro
    await supabase.auth.signOut();
    return redirect(
      "/admin/login?message=Você não tem permissão para acessar esta área."
    );
  }
}
