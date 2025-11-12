"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/produtos", label: "Produtos" },
  { href: "/parcerias", label: "Parcerias" },
  { href: "/sobre", label: "Sobre" },
  { href: "/contato", label: "Contato" },
];

const Footer = () => {
  const pathname = usePathname();
  const showPartnerButton = pathname.startsWith("/parcerias");

  return (
    <footer className="bg-gray-900/50 border-t border-gray-800 text-gray-400">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Navegação</h3>
            <ul className="space-y-2">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="hover:text-neon-blue transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Redes Sociais</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://www.instagram.com/tech4loop"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-neon-blue transition-colors"
                >
                  Instagram
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Contato</h3>
            <p>suporte.tech4loop@gmail.com</p>
          </div>
        </div>

        {showPartnerButton && (
          <div className="text-center mt-8 pt-8 border-t border-gray-800">
            <Link
              href="/seja-parceiro"
              className="bg-neon-blue text-black font-bold py-3 px-6 rounded-lg hover:shadow-glow transition-shadow"
            >
              Quer ser um Parceiro? Clique Aqui!
            </Link>
          </div>
        )}

        <div className="mt-8 border-t border-gray-800 pt-6 text-center text-sm">
          <p>
            &copy; {new Date().getFullYear()} Tech4Loop. Todos os direitos
            reservados.
          </p>
          <p className="mt-1">Ouro Preto do Oeste - RO</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
