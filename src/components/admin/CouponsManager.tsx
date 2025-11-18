"use client";

import { useState } from "react";
import {
  createCoupon,
  updateCouponStatus,
  deleteCoupon,
  getCouponUsage,
} from "@/app/admin/cupons/actions";
import {
  Plus,
  Percent,
  DollarSign,
  Calendar,
  Users,
  BarChart,
  Trash2,
  Eye,
  EyeOff,
} from "lucide-react";

interface Coupon {
  id: string;
  code: string;
  description: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_purchase_amount: number;
  max_discount_amount: number | null;
  usage_limit: number | null;
  usage_limit_per_user: number;
  usage_count: number;
  valid_from: string;
  valid_until: string | null;
  status: "active" | "inactive" | "expired";
  first_purchase_only: boolean;
  created_at: string;
}

export default function CouponsManager({
  initialCoupons,
}: {
  initialCoupons: Coupon[];
}) {
  const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  async function handleCreateCoupon(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const result = await createCoupon(formData);

    if (result.success) {
      setMessage({ type: "success", text: result.message! });
      setShowCreateForm(false);
      window.location.reload(); // Recarregar cupons
    } else {
      setMessage({ type: "error", text: result.error! });
    }
  }

  async function handleToggleStatus(couponId: string, currentStatus: string) {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    const result = await updateCouponStatus(couponId, newStatus);

    if (result.success) {
      setCoupons(
        coupons.map((c) =>
          c.id === couponId ? { ...c, status: newStatus as any } : c
        )
      );
      setMessage({ type: "success", text: result.message! });
    } else {
      setMessage({ type: "error", text: result.error! });
    }
  }

  async function handleDelete(couponId: string) {
    if (!confirm("Tem certeza que deseja excluir este cupom?")) return;

    const result = await deleteCoupon(couponId);

    if (result.success) {
      setCoupons(coupons.filter((c) => c.id !== couponId));
      setMessage({ type: "success", text: result.message! });
    } else {
      setMessage({ type: "error", text: result.error! });
    }
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              🎟️ Cupons de Desconto
            </h1>
            <p className="text-gray-600 mt-1">
              Crie e gerencie cupons promocionais
            </p>
          </div>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Novo Cupom
          </button>
        </div>

        {/* Mensagem */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Formulário de Criação */}
        {showCreateForm && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6">Criar Novo Cupom</h2>
            <form onSubmit={handleCreateCoupon} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Código do Cupom *
                  </label>
                  <input
                    type="text"
                    name="code"
                    required
                    placeholder="BEMVINDO10"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 uppercase"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Tipo de Desconto *
                  </label>
                  <select
                    name="discount_type"
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="percentage">Porcentagem (%)</option>
                    <option value="fixed">Valor Fixo (R$)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Valor do Desconto *
                  </label>
                  <input
                    type="number"
                    name="discount_value"
                    required
                    step="0.01"
                    min="0"
                    placeholder="10"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Compra Mínima (R$)
                  </label>
                  <input
                    type="number"
                    name="min_purchase_amount"
                    step="0.01"
                    min="0"
                    defaultValue="0"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Desconto Máximo (R$) - Opcional
                  </label>
                  <input
                    type="number"
                    name="max_discount_amount"
                    step="0.01"
                    min="0"
                    placeholder="50"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Limite Total de Usos (deixe vazio para ilimitado)
                  </label>
                  <input
                    type="number"
                    name="usage_limit"
                    min="1"
                    placeholder="100"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Usos por Usuário *
                  </label>
                  <input
                    type="number"
                    name="usage_limit_per_user"
                    required
                    defaultValue="1"
                    min="1"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Válido Até
                  </label>
                  <input
                    type="date"
                    name="valid_until"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Descrição
                </label>
                <textarea
                  name="description"
                  rows={3}
                  placeholder="Cupom de boas-vindas para novos clientes"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="first_purchase_only"
                  id="first_purchase"
                  value="true"
                  className="w-4 h-4 text-orange-500 rounded"
                />
                <label htmlFor="first_purchase" className="text-sm">
                  Válido apenas para primeira compra
                </label>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="bg-orange-500 text-white px-8 py-3 rounded-lg hover:bg-orange-600 transition"
                >
                  Criar Cupom
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="bg-gray-200 text-gray-800 px-8 py-3 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Lista de Cupons */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coupons.map((coupon) => (
            <div
              key={coupon.id}
              className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-orange-500"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-orange-600">
                    {coupon.code}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {coupon.description}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    coupon.status === "active"
                      ? "bg-green-100 text-green-800"
                      : coupon.status === "expired"
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {coupon.status === "active"
                    ? "Ativo"
                    : coupon.status === "expired"
                      ? "Expirado"
                      : "Inativo"}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  {coupon.discount_type === "percentage" ? (
                    <Percent className="w-4 h-4 text-orange-500" />
                  ) : (
                    <DollarSign className="w-4 h-4 text-orange-500" />
                  )}
                  <span className="font-semibold">
                    {coupon.discount_type === "percentage"
                      ? `${coupon.discount_value}% OFF`
                      : `R$ ${coupon.discount_value.toFixed(2)} OFF`}
                  </span>
                </div>

                {coupon.min_purchase_amount > 0 && (
                  <div className="text-sm text-gray-600">
                    Compra mínima: R$ {coupon.min_purchase_amount.toFixed(2)}
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="w-4 h-4" />
                  Usado: {coupon.usage_count}
                  {coupon.usage_limit ? ` / ${coupon.usage_limit}` : ""}
                </div>

                {coupon.valid_until && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    Válido até:{" "}
                    {new Date(coupon.valid_until).toLocaleDateString("pt-BR")}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() =>
                    handleToggleStatus(coupon.id, coupon.status)
                  }
                  className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition text-sm flex items-center justify-center gap-2"
                >
                  {coupon.status === "active" ? (
                    <>
                      <EyeOff className="w-4 h-4" /> Desativar
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4" /> Ativar
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleDelete(coupon.id)}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition text-sm"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {coupons.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p>Nenhum cupom cadastrado ainda.</p>
            <p className="text-sm mt-2">
              Clique em &quot;Novo Cupom&quot; para criar o primeiro!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
