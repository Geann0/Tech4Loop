"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatDate } from "@/lib/utils";

interface Order {
  id: string;
  created_at: string;
  status: string;
  payment_status?: string;
  total_amount: number;
  customer_address: string;
  customer_city: string;
  customer_state: string;
  order_items?: Array<{
    quantity: number;
    price_at_purchase: number;
    products?: {
      id: string;
      name: string;
      image_urls: string[];
      slug: string;
    };
  }>;
}

interface OrdersHistoryProps {
  orders: Order[];
}

export default function OrdersHistory({ orders }: OrdersHistoryProps) {
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const statusConfig: Record<
    string,
    { label: string; color: string; icon: string }
  > = {
    pending: { label: "Pendente", color: "text-yellow-400", icon: "◌" },
    processing: { label: "Processando", color: "text-blue-400", icon: "◌" },
    shipped: { label: "Enviado", color: "text-purple-400", icon: "→" },
    delivered: { label: "Entregue", color: "text-green-400", icon: "✓" },
    cancelled: { label: "Cancelado", color: "text-red-400", icon: "✕︎" },
  };

  const paymentStatusConfig: Record<string, { label: string; color: string }> =
    {
      pending: { label: "Aguardando", color: "text-yellow-400" },
      approved: { label: "Aprovado", color: "text-green-400" },
      rejected: { label: "Recusado", color: "text-red-400" },
      cancelled: { label: "Cancelado", color: "text-gray-400" },
    };

  const filteredOrders =
    filterStatus === "all"
      ? orders
      : orders.filter((o) => o.status === filterStatus);

  const stats = {
    all: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    processing: orders.filter((o) => o.status === "processing").length,
    shipped: orders.filter((o) => o.status === "shipped").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
  };

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="bg-dark-card border border-gray-800 rounded-xl p-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterStatus("all")}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filterStatus === "all"
                ? "bg-neon-blue text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            Todos ({stats.all})
          </button>
          <button
            onClick={() => setFilterStatus("pending")}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filterStatus === "pending"
                ? "bg-yellow-500 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            Pendentes ({stats.pending})
          </button>
          <button
            onClick={() => setFilterStatus("processing")}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filterStatus === "processing"
                ? "bg-blue-500 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            Processando ({stats.processing})
          </button>
          <button
            onClick={() => setFilterStatus("shipped")}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filterStatus === "shipped"
                ? "bg-purple-500 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            Enviados ({stats.shipped})
          </button>
          <button
            onClick={() => setFilterStatus("delivered")}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filterStatus === "delivered"
                ? "bg-green-500 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            Entregues ({stats.delivered})
          </button>
        </div>
      </div>

      {/* Lista de Pedidos */}
      {filteredOrders.length === 0 ? (
        <div className="bg-dark-card border border-gray-800 rounded-xl p-12 text-center">
          <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center text-4xl mx-auto mb-4">
            ☐
          </div>
          <h3 className="text-xl font-bold text-white mb-2">
            Nenhum pedido encontrado
          </h3>
          <p className="text-gray-400 mb-6">
            {filterStatus === "all"
              ? "Você ainda não realizou nenhuma compra"
              : "Nenhum pedido com este status"}
          </p>
          <Link
            href="/produtos"
            className="inline-block px-6 py-3 bg-gradient-to-r from-neon-blue to-electric-purple text-white font-bold rounded-xl hover:shadow-glow transition-all"
          >
            Explorar Produtos
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-dark-card border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 transition-all"
            >
              {/* Header do Pedido */}
              <div className="bg-gray-900/50 px-6 py-4 border-b border-gray-800">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-6">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">
                        Pedido #{order.id.slice(0, 8)}
                      </p>
                      <p className="text-sm text-gray-400">
                        {formatDate(order.created_at)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Status</p>
                      <span
                        className={`flex items-center gap-2 font-medium ${statusConfig[order.status]?.color || "text-gray-400"}`}
                      >
                        <span>{statusConfig[order.status]?.icon}</span>
                        <span>{statusConfig[order.status]?.label}</span>
                      </span>
                    </div>
                    {order.payment_status && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Pagamento</p>
                        <span
                          className={`font-medium ${paymentStatusConfig[order.payment_status]?.color || "text-gray-400"}`}
                        >
                          {paymentStatusConfig[order.payment_status]?.label}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 mb-1">Total</p>
                    <p className="text-xl font-bold text-neon-blue">
                      R$ {order.total_amount.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Produtos do Pedido */}
              <div className="p-6 space-y-4">
                {order.order_items?.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-4 bg-gray-900/30 rounded-lg"
                  >
                    {item.products && (
                      <>
                        <Image
                          src={item.products.image_urls[0]}
                          alt={item.products.name}
                          width={80}
                          height={80}
                          className="rounded-lg bg-gray-800 object-contain"
                        />
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/produtos/${item.products.slug}`}
                            className="font-bold text-white hover:text-neon-blue transition-colors line-clamp-2"
                          >
                            {item.products.name}
                          </Link>
                          <p className="text-sm text-gray-400 mt-1">
                            Quantidade: {item.quantity}
                          </p>
                          <p className="text-sm text-gray-400">
                            R$ {item.price_at_purchase.toFixed(2)}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                ))}

                {/* Endereço de Entrega */}
                <div className="pt-4 border-t border-gray-800">
                  <p className="text-xs text-gray-500 mb-2">Entrega em:</p>
                  <p className="text-sm text-gray-300">
                    {order.customer_address}, {order.customer_city} -{" "}
                    {order.customer_state}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
