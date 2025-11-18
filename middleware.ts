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
const publicRoutes = [
  "/admin/login",
  "/seja-parceiro",
  "/login", // Login de cliente
  "/register", // Registro de cliente
  "/esqueci-senha", // Recuperação de senha
  "/redefinir-senha", // Reset de senha
];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // CRÍTICO: Aguardar a sessão ser estabelecida
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
    // Redirecionar para login correto baseado na rota
    const loginUrl = path.startsWith("/conta")
      ? new URL("/login", req.url) // Cliente usa /login
      : new URL("/admin/login", req.url); // Admin/Partner usa /admin/login

    loginUrl.searchParams.set("redirect", path);

    // CRÍTICO: Criar redirect a partir de res (preserva cookies)
    const redirectResponse = NextResponse.redirect(loginUrl);

    // Copiar cookies do res original
    res.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value);
    });

    return redirectResponse;
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
      const banRedirect = NextResponse.redirect(
        new URL("/conta/banido", req.url)
      );
      res.cookies.getAll().forEach((cookie) => {
        banRedirect.cookies.set(cookie.name, cookie.value);
      });
      return banRedirect;
    }

    // Verificar permissões de admin
    if (path.startsWith("/admin") && path !== "/admin/login") {
      if (profile?.role !== "admin") {
        const homeRedirect = NextResponse.redirect(new URL("/", req.url));
        res.cookies.getAll().forEach((cookie) => {
          homeRedirect.cookies.set(cookie.name, cookie.value);
        });
        return homeRedirect;
      }
    }

    // Verificar permissões de partner
    if (path.startsWith("/partner")) {
      if (profile?.role !== "partner" && profile?.role !== "admin") {
        const homeRedirect = NextResponse.redirect(new URL("/", req.url));
        res.cookies.getAll().forEach((cookie) => {
          homeRedirect.cookies.set(cookie.name, cookie.value);
        });
        return homeRedirect;
      }
    }

    // Redirecionar da página de login se já estiver autenticado
    if ((path === "/admin/login" || path === "/login") && session) {
      let targetUrl = "/conta"; // default

      if (profile?.role === "admin") {
        targetUrl = "/admin/dashboard";
      } else if (profile?.role === "partner") {
        targetUrl = "/partner/dashboard";
      }

      const authRedirect = NextResponse.redirect(new URL(targetUrl, req.url));
      res.cookies.getAll().forEach((cookie) => {
        authRedirect.cookies.set(cookie.name, cookie.value);
      });
      return authRedirect;
    }
  }

  // Adicionar headers de segurança
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "origin-when-cross-origin");
  res.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );

  // CRÍTICO: SEMPRE retornar res (não response) para preservar cookies
  return res;
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
