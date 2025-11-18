"use client";

import { useState, useEffect } from "react";
import { Download, RefreshCw, AlertCircle, CheckCircle } from "lucide-react";

interface ReconciliationItem {
  order_id: string;
  order_date: string;
  customer_name: string;
  total_amount: number;
  payment_method: string;
  payment_id: string | null;
  payment_status: string;
  mp_gross_amount?: number;
  mp_fee_amount?: number;
  mp_net_amount?: number;
  mp_payout_date?: string;
  status: "matched" | "pending" | "discrepancy";
}

export default function ReconciliationDashboard() {
  const [items, setItems] = useState<ReconciliationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0], // Últimos 30 dias
    end: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    loadReconciliationData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange]);

  const loadReconciliationData = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/admin/reconciliation?start=${dateRange.start}&end=${dateRange.end}`
      );
      const data = await response.json();
      setItems(data.items || []);
    } catch (error) {
      console.error("Erro ao carregar dados de reconciliação:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = [
      "Pedido ID",
      "Data Pedido",
      "Cliente",
      "Valor Total",
      "Método",
      "MP Transaction ID",
      "Valor Bruto MP",
      "Taxa MP",
      "Valor Líquido MP",
      "Data Repasse",
      "Status",
    ];

    const rows = items.map((item) => [
      item.order_id,
      new Date(item.order_date).toLocaleDateString("pt-BR"),
      item.customer_name,
      `R$ ${item.total_amount.toFixed(2)}`,
      item.payment_method,
      item.payment_id || "N/A",
      item.mp_gross_amount ? `R$ ${item.mp_gross_amount.toFixed(2)}` : "N/A",
      item.mp_fee_amount ? `R$ ${item.mp_fee_amount.toFixed(2)}` : "N/A",
      item.mp_net_amount ? `R$ ${item.mp_net_amount.toFixed(2)}` : "N/A",
      item.mp_payout_date || "Pendente",
      item.status === "matched" ? "Conciliado" : "Pendente",
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `reconciliacao_${dateRange.start}_${dateRange.end}.csv`;
    link.click();
  };

  const summary = {
    totalOrders: items.length,
    totalRevenue: items.reduce((sum, item) => sum + item.total_amount, 0),
    totalFees: items.reduce((sum, item) => sum + (item.mp_fee_amount || 0), 0),
    matched: items.filter((i) => i.status === "matched").length,
    pending: items.filter((i) => i.status === "pending").length,
    discrepancies: items.filter((i) => i.status === "discrepancy").length,
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            💰 Reconciliação Financeira
          </h1>
          <p className="text-gray-600">
            Comparação entre pedidos, transações Mercado Pago e repasses
            bancários
          </p>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data Inicial
              </label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) =>
                  setDateRange({ ...dateRange, start: e.target.value })
                }
                className="border border-gray-300 rounded-lg px-4 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data Final
              </label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) =>
                  setDateRange({ ...dateRange, end: e.target.value })
                }
                className="border border-gray-300 rounded-lg px-4 py-2"
              />
            </div>
            <button
              onClick={loadReconciliationData}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition"
            >
              <RefreshCw className="w-4 h-4" />
              Atualizar
            </button>
            <button
              onClick={exportToCSV}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition ml-auto"
            >
              <Download className="w-4 h-4" />
              Exportar CSV
            </button>
          </div>
        </div>

        {/* Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm text-gray-600 mb-1">Total de Pedidos</div>
            <div className="text-3xl font-bold text-gray-900">
              {summary.totalOrders}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm text-gray-600 mb-1">Receita Bruta</div>
            <div className="text-3xl font-bold text-green-600">
              R$ {summary.totalRevenue.toFixed(2)}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm text-gray-600 mb-1">Taxas MP</div>
            <div className="text-3xl font-bold text-red-600">
              R$ {summary.totalFees.toFixed(2)}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm text-gray-600 mb-1">Receita Líquida</div>
            <div className="text-3xl font-bold text-blue-600">
              R$ {(summary.totalRevenue - summary.totalFees).toFixed(2)}
            </div>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div>
              <div className="text-2xl font-bold text-green-700">
                {summary.matched}
              </div>
              <div className="text-sm text-green-600">Conciliados</div>
            </div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="w-8 h-8 text-yellow-600" />
            <div>
              <div className="text-2xl font-bold text-yellow-700">
                {summary.pending}
              </div>
              <div className="text-sm text-yellow-600">Pendentes</div>
            </div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="w-8 h-8 text-red-600" />
            <div>
              <div className="text-2xl font-bold text-red-700">
                {summary.discrepancies}
              </div>
              <div className="text-sm text-red-600">Divergências</div>
            </div>
          </div>
        </div>

        {/* Tabela */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="text-center py-12">
                <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Carregando dados...</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Pedido
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Valor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      MP ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Taxa
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Líquido
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {items.map((item) => (
                    <tr key={item.order_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          #{item.order_id.slice(0, 8)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(item.order_date).toLocaleDateString(
                            "pt-BR"
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {item.customer_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          R$ {item.total_amount.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-xs text-gray-600 font-mono">
                          {item.payment_id
                            ? item.payment_id.slice(0, 12) + "..."
                            : "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-red-600">
                          {item.mp_fee_amount
                            ? `R$ ${item.mp_fee_amount.toFixed(2)}`
                            : "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-green-600">
                          {item.mp_net_amount
                            ? `R$ ${item.mp_net_amount.toFixed(2)}`
                            : "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.status === "matched" && (
                          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            Conciliado
                          </span>
                        )}
                        {item.status === "pending" && (
                          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Pendente
                          </span>
                        )}
                        {item.status === "discrepancy" && (
                          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                            Divergência
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Legenda */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">
            ℹ️ Sobre a Reconciliação
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>
              <strong>Conciliado:</strong> Pedido confirmado no MP com repasse
              agendado
            </li>
            <li>
              <strong>Pendente:</strong> Aguardando confirmação de pagamento ou
              repasse
            </li>
            <li>
              <strong>Divergência:</strong> Valores não batem entre sistema e MP
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
