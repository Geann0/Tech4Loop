"use client";

import { useEffect, useState } from "react";
import { Order } from "@/types/index";
import Link from "next/link";
import NextImage from "next/image";
import {
  formatCurrency,
  formatDate,
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
} from "@/lib/utils";

type OrderWithItems = Order & {
  order_items: {
    id: string;
    quantity: number;
    price_at_purchase: number;
    products: {
      name: string;
      slug: string;
      image_urls: string[];
    } | null;
  }[];
};

export default function OrderHistory({ userId }: { userId: string }) {
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const response = await fetch(`/api/orders?userId=${userId}`);
        if (response.ok) {
          const data = await response.json();
          setOrders(data);
        }
      } catch (error) {
        console.error("Erro ao buscar pedidos:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [userId]);

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-neon-blue"></div>
        <p className="text-gray-400 mt-4">Carregando pedidos...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400 mb-4">Você ainda não fez nenhum pedido.</p>
        <Link
          href="/produtos"
          className="inline-block bg-electric-purple text-white font-bold py-2 px-6 rounded-lg hover:shadow-glow transition-all"
        >
          Ver Produtos
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div
          key={order.id}
          className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 hover:border-gray-600 transition-colors"
        >
          <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-gray-700 pb-4 mb-4">
            <div>
              <p className="font-semibold text-lg">
                Pedido #{order.id.substring(0, 8)}
              </p>
              <p className="text-sm text-gray-400">
                Realizado em: {formatDate(order.created_at, true)}
              </p>
            </div>
            <div className="text-sm sm:text-right mt-2 sm:mt-0">
              <div className="mb-2">
                <span className="text-gray-400">Status: </span>
                <span
                  className={`font-semibold ${
                    order.status === "delivered"
                      ? "text-green-400"
                      : order.status === "shipped"
                        ? "text-blue-400"
                        : order.status === "cancelled"
                          ? "text-red-400"
                          : "text-yellow-400"
                  }`}
                >
                  {ORDER_STATUS_LABELS[order.status] || order.status}
                </span>
              </div>
              {order.payment_status && (
                <div className="mb-2">
                  <span className="text-gray-400">Pagamento: </span>
                  <span
                    className={`font-semibold ${
                      order.payment_status === "approved"
                        ? "text-green-400"
                        : order.payment_status === "rejected"
                          ? "text-red-400"
                          : "text-yellow-400"
                    }`}
                  >
                    {PAYMENT_STATUS_LABELS[order.payment_status] ||
                      order.payment_status}
                  </span>
                </div>
              )}
              <p className="font-bold text-xl text-neon-blue">
                {formatCurrency(order.total_amount)}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {order.order_items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 p-3 bg-gray-900/50 rounded-lg"
              >
                {item.products && (
                  <>
                    <div className="relative w-16 h-16 flex-shrink-0">
                      <NextImage
                        src={item.products.image_urls[0] ?? "/placeholder.png"}
                        alt={item.products.name}
                        fill
                        style={{ objectFit: "contain" }}
                        className="rounded-md bg-gray-700"
                      />
                    </div>
                    <div className="flex-grow">
                      <Link
                        href={`/produtos/${item.products.slug}`}
                        className="font-semibold hover:text-neon-blue transition-colors block"
                      >
                        {item.products.name}
                      </Link>
                      <p className="text-sm text-gray-400">
                        Quantidade: {item.quantity} ×{" "}
                        {formatCurrency(item.price_at_purchase)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-neon-blue">
                        {formatCurrency(item.quantity * item.price_at_purchase)}
                      </p>
                    </div>
                  </>
                )}
                {!item.products && (
                  <p className="font-semibold text-gray-500">
                    Produto não disponível
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Endereço de entrega */}
          <div className="mt-4 pt-4 border-t border-gray-700">
            <p className="text-sm text-gray-400 mb-2">
              <strong>Entrega:</strong>
            </p>
            <p className="text-sm">
              {order.customer_name}
              <br />
              {order.customer_address}, {order.customer_city} -{" "}
              {order.customer_state}
              <br />
              CEP: {order.customer_cep}
              <br />
              Tel: {order.customer_phone}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
