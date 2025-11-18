"use client";

import { useState, useEffect } from "react";
import { Package, Truck, CheckCircle, Clock, MapPin } from "lucide-react";
import Link from "next/link";

interface TrackingData {
  order_id: string;
  status: "processing" | "picked" | "packed" | "shipped" | "delivered";
  tracking_code?: string;
  customer_name: string;
  total_amount: number;
  created_at: string;
  estimated_delivery?: string;
  events: Array<{
    date: string;
    status: string;
    location: string;
    description: string;
  }>;
}

export default function TrackingPage({
  params,
}: {
  params: { orderId: string };
}) {
  const [tracking, setTracking] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTracking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadTracking = async () => {
    try {
      const response = await fetch(`/api/tracking/${params.orderId}`);

      if (!response.ok) {
        setError("Pedido não encontrado");
        setLoading(false);
        return;
      }

      const data = await response.json();
      setTracking(data);
    } catch (err) {
      setError("Erro ao carregar rastreamento");
    } finally {
      setLoading(false);
    }
  };

  const statusSteps = [
    { key: "processing", label: "Processando", icon: Clock },
    { key: "picked", label: "Separado", icon: Package },
    { key: "packed", label: "Embalado", icon: Package },
    { key: "shipped", label: "Enviado", icon: Truck },
    { key: "delivered", label: "Entregue", icon: CheckCircle },
  ];

  const getCurrentStep = () => {
    if (!tracking) return 0;
    return statusSteps.findIndex((step) => step.key === tracking.status);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando rastreamento...</p>
        </div>
      </div>
    );
  }

  if (error || !tracking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Pedido não encontrado
          </h2>
          <p className="text-gray-600 mb-6">
            Não foi possível localizar o rastreamento deste pedido.
          </p>
          <Link
            href="/conta/compras"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition"
          >
            Ver meus pedidos
          </Link>
        </div>
      </div>
    );
  }

  const currentStep = getCurrentStep();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                📦 Rastreamento de Pedido
              </h1>
              <p className="text-gray-600">
                Pedido{" "}
                <span className="font-mono font-bold">
                  #{tracking.order_id.slice(0, 8)}
                </span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">
                R$ {parseFloat(tracking.total_amount.toString()).toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Status Progress */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <div className="relative">
            {/* Progress Bar */}
            <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200">
              <div
                className="h-full bg-blue-600 transition-all duration-500"
                style={{
                  width: `${(currentStep / (statusSteps.length - 1)) * 100}%`,
                }}
              ></div>
            </div>

            {/* Steps */}
            <div className="relative flex justify-between">
              {statusSteps.map((step, index) => {
                const Icon = step.icon;
                const isActive = index <= currentStep;
                const isCurrent = index === currentStep;

                return (
                  <div key={step.key} className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all ${
                        isActive
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-500"
                      } ${isCurrent ? "ring-4 ring-blue-200 scale-110" : ""}`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <p
                      className={`text-xs md:text-sm font-semibold text-center ${
                        isActive ? "text-gray-900" : "text-gray-500"
                      }`}
                    >
                      {step.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tracking Code */}
        {tracking.tracking_code && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700 font-semibold mb-1">
                  Código de Rastreio
                </p>
                <p className="text-2xl font-mono font-bold text-blue-900">
                  {tracking.tracking_code}
                </p>
              </div>
              <a
                href={`https://www.google.com/search?q=${tracking.tracking_code}+rastreio`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition"
              >
                Rastrear nos Correios
              </a>
            </div>
            {tracking.estimated_delivery && (
              <p className="text-sm text-blue-700 mt-4">
                📅 Previsão de entrega:{" "}
                <strong>
                  {new Date(tracking.estimated_delivery).toLocaleDateString(
                    "pt-BR"
                  )}
                </strong>
              </p>
            )}
          </div>
        )}

        {/* Timeline de Eventos */}
        {tracking.events && tracking.events.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              Histórico de Movimentação
            </h2>
            <div className="space-y-4">
              {tracking.events.map((event, index) => (
                <div
                  key={index}
                  className="flex gap-4 pb-4 border-b border-gray-200 last:border-0"
                >
                  <div className="flex-shrink-0">
                    <div className="w-3 h-3 bg-blue-600 rounded-full mt-1"></div>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">
                      {event.status}
                    </p>
                    <p className="text-sm text-gray-600">{event.description}</p>
                    <div className="flex gap-4 mt-1">
                      <p className="text-xs text-gray-500">
                        📅 {new Date(event.date).toLocaleString("pt-BR")}
                      </p>
                      {event.location && (
                        <p className="text-xs text-gray-500">
                          📍 {event.location}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Informações Adicionais */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <h3 className="font-bold text-gray-900 mb-3">ℹ️ Informações</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>
              • O código de rastreio pode levar até 24h para ser ativado nos
              Correios
            </li>
            <li>
              • As informações são atualizadas automaticamente a cada
              movimentação
            </li>
            <li>• Em caso de dúvidas, entre em contato através do WhatsApp</li>
          </ul>
        </div>

        {/* CTA */}
        <div className="text-center mt-8">
          <Link
            href="/conta/compras"
            className="inline-block text-blue-600 hover:text-blue-700 font-semibold"
          >
            ← Voltar para meus pedidos
          </Link>
        </div>
      </div>
    </div>
  );
}
