import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Rotas que requerem autenticação
const protectedRoutes = [
  "/admin/dashboard",
  "/admin/products",
  "/admin/categories",
  "/admin/partners",
  "/admin/orders",
  "/partner/dashboard",
  "/partner/add-product",
  "/partner/edit",
  "/partner/orders",
  "/conta",
];

// Rotas públicas mesmo estando em pastas protegidas
const publicRoutes = ["/admin/login", "/seja-parceiro"];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const path = req.nextUrl.pathname;

  // Verificar se é uma rota protegida
  const isProtectedRoute = protectedRoutes.some((route) =>
    path.startsWith(route)
  );
  const isPublicRoute = publicRoutes.some((route) => path.startsWith(route));

  // Se não estiver logado e tentar acessar rota protegida
  if (!session && isProtectedRoute && !isPublicRoute) {
    const loginUrl = new URL("/admin/login", req.url);
    loginUrl.searchParams.set("redirect", path);
    return NextResponse.redirect(loginUrl);
  }

  // Se estiver logado, verificar role e permissões
  if (session) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, is_banned")
      .eq("id", session.user.id)
      .single();

    // Verificar se está banido
    if (profile?.is_banned) {
      return NextResponse.redirect(new URL("/conta/banido", req.url));
    }

    // Verificar permissões de admin
    if (path.startsWith("/admin") && path !== "/admin/login") {
      if (profile?.role !== "admin") {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }

    // Verificar permissões de partner
    if (path.startsWith("/partner")) {
      if (profile?.role !== "partner" && profile?.role !== "admin") {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }

    // Redirecionar da página de login se já estiver autenticado
    if (path === "/admin/login" && session) {
      if (profile?.role === "admin") {
        return NextResponse.redirect(new URL("/admin/dashboard", req.url));
      }
      if (profile?.role === "partner") {
        return NextResponse.redirect(new URL("/partner/dashboard", req.url));
      }
      return NextResponse.redirect(new URL("/conta", req.url));
    }
  }

  // Adicionar headers de segurança
  const response = res;
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*|api/webhooks).*)",
  ],
};
