"use client";

import Link from "next/link";
import { formatDate } from "@/lib/utils";

interface ProfileOverviewProps {
  profile: {
    id: string;
    email: string;
    partner_name?: string | null;
    whatsapp_number?: string | null;
    created_at: string;
    role: string;
  };
  stats: {
    totalOrders: number;
    pendingOrders: number;
    completedOrders: number;
  };
}

export default function ProfileOverview({
  profile,
  stats,
}: ProfileOverviewProps) {
  const quickActions = [
    {
      icon: "◈",
      title: "Editar Dados",
      description: "Atualize suas informações pessoais",
      href: "/conta/dados",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: "◈",
      title: "Meus Endereços",
      description: "Gerencie seus endereços de entrega",
      href: "/conta/enderecos",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: "$",
      title: "Segurança",
      description: "Altere sua senha",
      href: "/conta/seguranca",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: "☐",
      title: "Minhas Compras",
      description: "Veja seu histórico de pedidos",
      href: "/conta/compras",
      color: "from-orange-500 to-red-500",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-dark-card border border-gray-800 rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-neon-blue/20 rounded-lg flex items-center justify-center">
              <span className="text-2xl">☐</span>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">
                {stats.totalOrders}
              </p>
              <p className="text-sm text-gray-400">Total de Compras</p>
            </div>
          </div>
        </div>

        <div className="bg-dark-card border border-gray-800 rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
              <span className="text-2xl">◌</span>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">
                {stats.pendingOrders}
              </p>
              <p className="text-sm text-gray-400">Em Andamento</p>
            </div>
          </div>
        </div>

        <div className="bg-dark-card border border-gray-800 rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
              <span className="text-2xl text-green-400">✓</span>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">
                {stats.completedOrders}
              </p>
              <p className="text-sm text-gray-400">Entregues</p>
            </div>
          </div>
        </div>
      </div>

      {/* Informações do Perfil */}
      <div className="bg-dark-card border border-gray-800 rounded-xl overflow-hidden">
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>👤</span>
            <span>Informações da Conta</span>
          </h2>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Nome Completo
              </label>
              <div className="flex items-center justify-between p-4 bg-gray-900/50 border border-gray-700 rounded-lg">
                <p className="text-white font-medium">
                  {profile.partner_name || "Não informado"}
                </p>
                <Link
                  href="/conta/dados"
                  className="text-neon-blue hover:text-neon-blue/80 text-sm"
                >
                  Editar
                </Link>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Email
              </label>
              <div className="flex items-center justify-between p-4 bg-gray-900/50 border border-gray-700 rounded-lg">
                <p className="text-white font-medium truncate">
                  {profile.email}
                </p>
                <span className="text-green-400 text-xs bg-green-500/10 px-2 py-1 rounded">
                  Verificado
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                WhatsApp
              </label>
              <div className="flex items-center justify-between p-4 bg-gray-900/50 border border-gray-700 rounded-lg">
                <p className="text-white font-medium">
                  {profile.whatsapp_number
                    ? `(${profile.whatsapp_number.slice(0, 2)}) ${profile.whatsapp_number.slice(2, 7)}-${profile.whatsapp_number.slice(7)}`
                    : "Não informado"}
                </p>
                <Link
                  href="/conta/dados"
                  className="text-neon-blue hover:text-neon-blue/80 text-sm"
                >
                  {profile.whatsapp_number ? "Editar" : "Adicionar"}
                </Link>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Membro desde
              </label>
              <div className="p-4 bg-gray-900/50 border border-gray-700 rounded-lg">
                <p className="text-white font-medium">
                  {formatDate(profile.created_at)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ações Rápidas */}
      <div className="bg-dark-card border border-gray-800 rounded-xl overflow-hidden">
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>⚡︎</span>
            <span>Ações Rápidas</span>
          </h2>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="group p-4 bg-gray-900/50 border border-gray-700 hover:border-gray-600 rounded-xl transition-all hover:shadow-lg hover:shadow-neon-blue/10"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 bg-gradient-to-br ${action.color} rounded-lg flex items-center justify-center flex-shrink-0`}
                  >
                    <span className="text-2xl text-white">{action.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white mb-1 group-hover:text-neon-blue transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {action.description}
                    </p>
                  </div>
                  <span className="text-gray-600 group-hover:text-neon-blue transition-colors">
                    →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Dicas de Segurança */}
      <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-2xl">⚠</span>
          </div>
          <div>
            <h3 className="font-bold text-yellow-400 mb-2">
              Proteja sua Conta
            </h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-center gap-2">
                <span className="text-yellow-400">•</span>
                <span>
                  Use uma senha forte com letras, números e caracteres especiais
                </span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-yellow-400">•</span>
                <span>Nunca compartilhe suas credenciais com terceiros</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-yellow-400">•</span>
                <span>Mantenha seu email e telefone sempre atualizados</span>
              </li>
            </ul>
            <Link
              href="/conta/seguranca"
              className="inline-block mt-4 text-yellow-400 hover:text-yellow-300 font-medium text-sm"
            >
              Gerenciar Segurança →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
