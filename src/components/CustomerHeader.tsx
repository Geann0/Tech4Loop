"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import Image from "next/image";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    // Pega a sessão inicial
    const getInitialSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };
    getInitialSession();

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/produtos", label: "Produtos" },
    { href: "/parcerias", label: "Parcerias" },
    { href: "/sobre", label: "Sobre" },
    { href: "/contato", label: "Contato" },
  ];

  return (
    <header className="bg-background/80 backdrop-blur-sm fixed top-0 left-0 right-0 z-50 border-b border-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <Image
                src="/images/logo.png"
                alt="Tech4Loop Logo"
                width={150}
                height={40}
                priority // Carrega a logo com prioridade
              />
            </Link>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-300 hover:text-neon-blue transition-colors"
              >
                {link.label}
              </Link>
            ))}
            {user && (
              <Link
                href="/conta" // Link para a futura página da conta do cliente
                className="text-gray-300 hover:text-neon-blue transition-colors"
              >
                Minha Conta
              </Link>
            )}
          </nav>
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <button
                onClick={handleLogout}
                className="bg-electric-purple text-white font-bold py-2 px-6 rounded-lg hover:shadow-glow transition-shadow"
              >
                Sair
              </button>
            ) : (
              <Link
                href="/login" // Link para a página de login/registro
                className="bg-neon-blue text-black font-bold py-2 px-6 rounded-lg hover:shadow-glow transition-shadow"
              >
                Login / Registrar
              </Link>
            )}
          </div>
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-300 hover:text-white"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={
                    isMenuOpen
                      ? "M6 18L18 6M6 6l12 12"
                      : "M4 6h16M4 12h16m-7 6h7"
                  }
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
      {isMenuOpen && (
        <div className="md:hidden bg-background border-t border-gray-800">
          <nav className="px-2 pt-2 pb-3 space-y-1 sm:px-3 flex flex-col items-center">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-300 hover:text-neon-blue block px-3 py-2 rounded-md text-base font-medium"
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link
                  href="/conta"
                  className="text-gray-300 hover:text-neon-blue block px-3 py-2 rounded-md text-base font-medium"
                >
                  Minha Conta
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-electric-purple text-white font-bold py-2 px-6 rounded-lg hover:shadow-glow transition-shadow mt-4"
                >
                  Sair
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="bg-neon-blue text-black font-bold py-2 px-6 rounded-lg hover:shadow-glow transition-shadow mt-4"
              >
                Login / Registrar
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
