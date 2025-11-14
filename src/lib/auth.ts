import {
  createServerActionClient,
  createServerComponentClient,
  createRouteHandlerClient,
} from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

export type UserRole = "admin" | "partner" | "customer";

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  partner_name?: string | null;
  is_banned: boolean;
}

/**
 * Obtém o usuário autenticado (para Server Components)
 * Cached para evitar múltiplas chamadas
 */
export const getUser = cache(async (): Promise<AuthUser | null> => {
  const supabase = createServerComponentClient({ cookies });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, partner_name, is_banned")
    .eq("id", user.id)
    .single();

  if (!profile) return null;

  return {
    id: user.id,
    email: user.email!,
    role: profile.role as UserRole,
    partner_name: profile.partner_name,
    is_banned: profile.is_banned,
  };
});

/**
 * Obtém o usuário autenticado (para Server Actions)
 */
export async function getUserForAction(): Promise<AuthUser | null> {
  const supabase = createServerActionClient({ cookies });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, partner_name, is_banned")
    .eq("id", user.id)
    .single();

  if (!profile) return null;

  return {
    id: user.id,
    email: user.email!,
    role: profile.role as UserRole,
    partner_name: profile.partner_name,
    is_banned: profile.is_banned,
  };
}

/**
 * Obtém o usuário autenticado (para Route Handlers)
 */
export async function getUserForRoute(req: Request): Promise<AuthUser | null> {
  const supabase = createRouteHandlerClient({ cookies });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, partner_name, is_banned")
    .eq("id", user.id)
    .single();

  if (!profile) return null;

  return {
    id: user.id,
    email: user.email!,
    role: profile.role as UserRole,
    partner_name: profile.partner_name,
    is_banned: profile.is_banned,
  };
}

/**
 * Requer autenticação - redireciona se não autenticado
 */
export async function requireAuth(): Promise<AuthUser> {
  const user = await getUser();

  if (!user) {
    redirect("/admin/login");
  }

  if (user.is_banned) {
    redirect("/conta/banido");
  }

  return user;
}

/**
 * Requer papel específico - redireciona se não autorizado
 */
export async function requireRole(role: UserRole): Promise<AuthUser> {
  const user = await requireAuth();

  if (user.role !== role) {
    redirect("/");
  }

  return user;
}

/**
 * Requer admin - redireciona se não for admin
 */
export async function requireAdmin(): Promise<AuthUser> {
  return requireRole("admin");
}

/**
 * Requer partner - redireciona se não for partner
 */
export async function requirePartner(): Promise<AuthUser> {
  return requireRole("partner");
}

/**
 * Verifica se o usuário tem permissão
 */
export async function hasRole(role: UserRole): Promise<boolean> {
  const user = await getUser();
  return user?.role === role;
}

/**
 * Verifica se é admin
 */
export async function isAdmin(): Promise<boolean> {
  return hasRole("admin");
}

/**
 * Verifica se é partner
 */
export async function isPartner(): Promise<boolean> {
  return hasRole("partner");
}

/**
 * Verifica se o usuário está banido
 */
export async function isBanned(): Promise<boolean> {
  const user = await getUser();
  return user?.is_banned ?? false;
}

/**
 * Verifica se o usuário é o dono do recurso ou admin
 */
export async function canAccessResource(
  resourceOwnerId: string
): Promise<boolean> {
  const user = await getUser();

  if (!user) return false;
  if (user.role === "admin") return true;
  if (user.id === resourceOwnerId) return true;

  return false;
}
