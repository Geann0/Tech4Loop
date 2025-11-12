import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Se o usuário não estiver logado e tentar acessar uma rota protegida, redirecione para o login
  if (
    !session &&
    (req.nextUrl.pathname.startsWith("/admin/dashboard") ||
      req.nextUrl.pathname.startsWith("/partner/dashboard"))
  ) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  return res;
}

export const config = {
  matcher: ["/admin/dashboard/:path*", "/partner/dashboard/:path*"],
};
