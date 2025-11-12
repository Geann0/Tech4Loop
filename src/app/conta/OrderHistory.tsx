"use client";

import { Order } from "@/types";
import Link from "next/link";

type OrderWithItems = Order & {
  order_items: {
    id: string;
    quantity: number;
    products: {
      name: string;
      slug: string;
      image_urls: string[];
    } | null;
  }[];
};

export default function OrderHistory({ orders }: { orders: OrderWithItems[] }) {
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Meus Pedidos</h2>
      <div className="space-y-6">
        {orders.length > 0 ? (
          orders.map((order) => (
            <div
              key={order.id}
              className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg"
            >
              <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-gray-700 pb-3 mb-3">
                <div>
                  <p className="font-semibold">
                    Pedido #{order.id.substring(0, 8)}
                  </p>
                  <p className="text-sm text-gray-400">
                    Realizado em:{" "}
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-sm sm:text-right mt-2 sm:mt-0">
                  <p>
                    Status:{" "}
                    <span
                      className={`font-semibold ${
                        order.status === "approved"
                          ? "text-green-400"
                          : "text-yellow-400"
                      }`}
                    >
                      {order.status}
                    </span>
                  </p>
                  <p className="font-bold text-lg">
                    Total:{" "}
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(order.total_amount)}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                {order.order_items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4">
                    <img
                      src={item.products?.image_urls[0] ?? "/placeholder.png"}
                      alt={item.products?.name ?? "Produto"}
                      className="w-16 h-16 object-contain rounded-md bg-gray-700"
                    />
                    <div className="flex-grow">
                      {item.products ? (
                        <Link
                          href={`/produtos/${item.products.slug}`}
                          className="font-semibold hover:text-neon-blue transition-colors"
                        >
                          {item.products.name}
                        </Link>
                      ) : (
                        <p className="font-semibold text-gray-500">
                          Produto indisponível
                        </p>
                      )}
                      <p className="text-sm text-gray-400">
                        Quantidade: {item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-400">Você ainda não fez nenhum pedido.</p>
        )}
      </div>
    </div>
  );
}
