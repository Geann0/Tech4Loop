import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { signIn } from "@/app/auth/actions";
import Link from "next/link";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { message: string };
}) {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    // Se já houver uma sessão, redireciona para o dashboard.
    // A lógica principal de redirecionamento está no Server Action e no middleware.
    return redirect("/admin/dashboard");
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md p-8 space-y-8 bg-gray-900/50 rounded-lg border border-gray-800">
        <div className="text-center">
          <Link href="/">
            <h1 className="text-3xl font-bold text-white">Tech4Loop</h1>
          </Link>
          <p className="mt-2 text-gray-400">Acesso Restrito</p>
        </div>
        <form className="space-y-6" action={signIn}>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-300"
            >
              E-mail
            </label>
            <div className="mt-1">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-neon-blue"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-300"
            >
              Senha
            </label>
            <div className="mt-1">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-neon-blue"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-neon-blue hover:shadow-glow transition-shadow"
            >
              Entrar
            </button>
          </div>
          {searchParams.message && (
            <p className="text-center text-sm text-red-500">
              {searchParams.message}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
