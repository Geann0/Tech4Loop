"use client";

import { useState } from "react";
import {
  approveOrder,
  cancelOrder,
  shipOrder,
  deliverOrder,
} from "@/app/admin/orders/actions";

interface OrderActionsProps {
  orderId: string;
  currentStatus: string;
}

export default function OrderActions({
  orderId,
  currentStatus,
}: OrderActionsProps) {
  const [loading, setLoading] = useState(false);
  const [trackingCode, setTrackingCode] = useState("");
  const [showTracking, setShowTracking] = useState(false);

  const handleAction = async (
    action: (id: string, tracking?: string) => Promise<any>
  ) => {
    setLoading(true);
    const result = await action(orderId, trackingCode || undefined);
    setLoading(false);

    if (result.error) {
      alert(`Erro: ${result.error}`);
    } else {
      alert("Status atualizado com sucesso!");
      setShowTracking(false);
      setTrackingCode("");
    }
  };

  return (
    <div className="flex gap-2 flex-wrap">
      {currentStatus === "pending" && (
        <>
          <button
            onClick={() => handleAction(approveOrder)}
            disabled={loading}
            className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-xs font-medium disabled:opacity-50"
          >
            ✅ Aprovar
          </button>
          <button
            onClick={() => handleAction(cancelOrder)}
            disabled={loading}
            className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-xs font-medium disabled:opacity-50"
          >
            ❌ Cancelar
          </button>
        </>
      )}

      {currentStatus === "processing" && (
        <>
          <button
            onClick={() => setShowTracking(!showTracking)}
            disabled={loading}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs font-medium disabled:opacity-50"
          >
            📦 Enviar
          </button>
          {showTracking && (
            <div className="w-full mt-2 flex gap-2">
              <input
                type="text"
                placeholder="Código de rastreio (opcional)"
                value={trackingCode}
                onChange={(e) => setTrackingCode(e.target.value)}
                className="flex-1 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm"
              />
              <button
                onClick={() => handleAction(shipOrder)}
                disabled={loading}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs font-medium disabled:opacity-50"
              >
                Confirmar Envio
              </button>
            </div>
          )}
        </>
      )}

      {currentStatus === "shipped" && (
        <button
          onClick={() => handleAction(deliverOrder)}
          disabled={loading}
          className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-xs font-medium disabled:opacity-50"
        >
          ✓ Marcar como Entregue
        </button>
      )}

      {(currentStatus === "delivered" || currentStatus === "cancelled") && (
        <span className="text-xs text-gray-400">
          {currentStatus === "delivered" ? "Pedido finalizado" : "Cancelado"}
        </span>
      )}
    </div>
  );
}
