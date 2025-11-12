import Link from "next/link";

export default function AdminHeader() {
  return (
    <header className="bg-gray-900/50 border-b border-gray-800 shadow-lg sticky top-0 z-50 backdrop-blur-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-neon-blue text-2xl font-bold">
              Tech4Loop
            </Link>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="/partner/dashboard"
              className="text-gray-300 hover:text-neon-blue transition-colors px-3 py-2 rounded-md text-sm font-medium"
            >
              Painel do Parceiro
            </Link>
            <Link
              href="/admin/dashboard"
              className="text-gray-300 hover:text-neon-blue transition-colors px-3 py-2 rounded-md text-sm font-medium"
            >
              Painel do Admin
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
