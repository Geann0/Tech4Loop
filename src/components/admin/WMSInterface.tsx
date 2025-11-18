"use client";

import { useState, useEffect } from "react";
import {
  Package,
  Printer,
  CheckCircle,
  Truck,
  AlertCircle,
} from "lucide-react";

interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  products: {
    name: string;
    sku: string;
    image_urls: string[];
    stock_quantity: number;
  };
}

interface FulfillmentOrder {
  id: string;
  created_at: string;
  customer_name: string;
  customer_address: string;
  customer_number: string;
  customer_neighborhood: string;
  customer_city: string;
  customer_state: string;
  customer_cep: string;
  customer_whatsapp: string;
  total_amount: number;
  payment_method: string;
  status: "processing" | "picked" | "packed" | "shipped";
  order_items: OrderItem[];
  tracking_code?: string;
}

export default function WMSInterface() {
  const [orders, setOrders] = useState<FulfillmentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<
    "all" | "processing" | "picked" | "packed"
  >("processing");

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/fulfillment?status=${filter}`);
      const data = await response.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error("Erro ao carregar pedidos:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await fetch(`/api/admin/fulfillment/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      loadOrders(); // Recarregar lista
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
    }
  };

  const printPickList = (order: FulfillmentOrder) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Lista de Separação - Pedido #${order.id.slice(0, 8)}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { font-size: 24px; margin-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #f5f5f5; font-weight: bold; }
            .header { margin-bottom: 30px; }
            .signature { margin-top: 50px; border-top: 1px solid #000; padding-top: 10px; width: 300px; }
            @media print { button { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>📦 LISTA DE SEPARAÇÃO</h1>
            <p><strong>Pedido:</strong> #${order.id.slice(0, 8)}</p>
            <p><strong>Cliente:</strong> ${order.customer_name}</p>
            <p><strong>Data:</strong> ${new Date(order.created_at).toLocaleDateString("pt-BR")}</p>
          </div>

          <table>
            <thead>
              <tr>
                <th>SKU</th>
                <th>Produto</th>
                <th>Quantidade</th>
                <th>Conferido</th>
              </tr>
            </thead>
            <tbody>
              ${order.order_items
                .map(
                  (item) => `
                <tr>
                  <td>${item.products.sku}</td>
                  <td>${item.products.name}</td>
                  <td><strong>${item.quantity}</strong></td>
                  <td style="width: 80px;">☐</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>

          <div class="signature">
            <p><strong>Separado por:</strong> _______________________</p>
            <p><strong>Data/Hora:</strong> _____ / _____ / _____ - _____ : _____</p>
          </div>

          <button onclick="window.print()" style="margin-top: 20px; padding: 10px 20px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Imprimir
          </button>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const generateShippingLabel = async (order: FulfillmentOrder) => {
    try {
      const response = await fetch(`/api/admin/fulfillment/${order.id}/label`, {
        method: "POST",
      });
      const data = await response.json();

      if (data.success && data.labelUrl) {
        window.open(data.labelUrl, "_blank");
        loadOrders();
      } else {
        alert(`Erro ao gerar etiqueta: ${data.error}`);
      }
    } catch (error) {
      alert("Erro ao gerar etiqueta de envio");
    }
  };

  const stats = {
    processing: orders.filter((o) => o.status === "processing").length,
    picked: orders.filter((o) => o.status === "picked").length,
    packed: orders.filter((o) => o.status === "packed").length,
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📦 WMS - Gestão de Fulfillment
          </h1>
          <p className="text-gray-600">
            Sistema de separação, embalagem e expedição de pedidos
          </p>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex gap-4">
            <button
              onClick={() => setFilter("processing")}
              className={`px-6 py-2 rounded-lg font-semibold transition ${
                filter === "processing"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              🟦 Aguardando Separação ({stats.processing})
            </button>
            <button
              onClick={() => setFilter("picked")}
              className={`px-6 py-2 rounded-lg font-semibold transition ${
                filter === "picked"
                  ? "bg-yellow-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              🟨 Separados ({stats.picked})
            </button>
            <button
              onClick={() => setFilter("packed")}
              className={`px-6 py-2 rounded-lg font-semibold transition ${
                filter === "packed"
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              🟩 Embalados ({stats.packed})
            </button>
          </div>
        </div>

        {/* Grid de Pedidos */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando pedidos...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">Nenhum pedido nesta etapa</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500"
              >
                {/* Cabeçalho */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      Pedido #{order.id.slice(0, 8)}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleString("pt-BR")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-gray-900">
                      R$ {parseFloat(order.total_amount.toString()).toFixed(2)}
                    </p>
                    <span
                      className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                        order.status === "processing"
                          ? "bg-blue-100 text-blue-800"
                          : order.status === "picked"
                            ? "bg-yellow-100 text-yellow-800"
                            : order.status === "packed"
                              ? "bg-green-100 text-green-800"
                              : "bg-purple-100 text-purple-800"
                      }`}
                    >
                      {order.status === "processing" && "Aguardando"}
                      {order.status === "picked" && "Separado"}
                      {order.status === "packed" && "Embalado"}
                      {order.status === "shipped" && "Enviado"}
                    </span>
                  </div>
                </div>

                {/* Cliente */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="font-semibold text-gray-900 mb-1">
                    {order.customer_name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {order.customer_address}, {order.customer_number}
                  </p>
                  <p className="text-sm text-gray-600">
                    {order.customer_neighborhood} - {order.customer_city}/
                    {order.customer_state}
                  </p>
                  <p className="text-sm text-gray-600">
                    CEP: {order.customer_cep}
                  </p>
                  <p className="text-sm text-gray-600">
                    WhatsApp: {order.customer_whatsapp}
                  </p>
                </div>

                {/* Itens */}
                <div className="space-y-2 mb-4">
                  <h4 className="font-semibold text-gray-700">Itens:</h4>
                  {order.order_items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-2 bg-gray-50 rounded"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {item.products.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          SKU: {item.products.sku}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-gray-900">
                          {item.quantity}x
                        </p>
                        <p className="text-xs text-gray-500">
                          Estoque: {item.products.stock_quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Ações */}
                <div className="space-y-2">
                  {order.status === "processing" && (
                    <>
                      <button
                        onClick={() => printPickList(order)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg flex items-center justify-center gap-2 transition"
                      >
                        <Printer className="w-4 h-4" />
                        Imprimir Lista de Separação
                      </button>
                      <button
                        onClick={() => updateOrderStatus(order.id, "picked")}
                        className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-2 rounded-lg flex items-center justify-center gap-2 transition"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Marcar como Separado
                      </button>
                    </>
                  )}

                  {order.status === "picked" && (
                    <button
                      onClick={() => updateOrderStatus(order.id, "packed")}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg flex items-center justify-center gap-2 transition"
                    >
                      <Package className="w-4 h-4" />
                      Marcar como Embalado
                    </button>
                  )}

                  {order.status === "packed" && (
                    <>
                      <button
                        onClick={() => generateShippingLabel(order)}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg flex items-center justify-center gap-2 transition"
                      >
                        <Printer className="w-4 h-4" />
                        Gerar Etiqueta de Envio
                      </button>
                      <button
                        onClick={() => updateOrderStatus(order.id, "shipped")}
                        className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 rounded-lg flex items-center justify-center gap-2 transition"
                      >
                        <Truck className="w-4 h-4" />
                        Marcar como Enviado
                      </button>
                    </>
                  )}
                </div>

                {order.tracking_code && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      <strong>Código de Rastreio:</strong> {order.tracking_code}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Legenda */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h3 className="font-bold text-gray-900 mb-4">
            📋 Fluxo de Fulfillment
          </h3>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span className="text-sm text-gray-700">
                <strong>Processing:</strong> Aguardando separação
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              <span className="text-sm text-gray-700">
                <strong>Picked:</strong> Produtos separados
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-sm text-gray-700">
                <strong>Packed:</strong> Embalado e pronto
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded"></div>
              <span className="text-sm text-gray-700">
                <strong>Shipped:</strong> Enviado aos Correios
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
