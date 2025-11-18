"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import {
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  type Address,
} from "@/app/conta/enderecos/actions";
import { formatCEP, fetchAddressByCEP } from "@/lib/checkoutUtils";

interface AddressManagerProps {
  addresses: Address[];
}

export default function AddressManager({ addresses }: AddressManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Meus Endereços</h1>
        <button
          onClick={() => {
            setEditingAddress(null);
            setShowForm(true);
          }}
          className="px-4 py-2 bg-gradient-to-r from-neon-blue to-electric-purple text-white font-bold rounded-lg hover:shadow-glow transition-all"
        >
          + Novo Endereço
        </button>
      </div>

      {/* Lista de Endereços */}
      {addresses.length === 0 && !showForm && (
        <div className="bg-dark-card border border-gray-800 rounded-xl p-12 text-center">
          <div className="text-6xl mb-4">☐</div>
          <h3 className="text-xl font-bold text-white mb-2">
            Nenhum endereço cadastrado
          </h3>
          <p className="text-gray-400 mb-6">
            Adicione um endereço para facilitar suas compras
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-3 bg-gradient-to-r from-neon-blue to-electric-purple text-white font-bold rounded-lg hover:shadow-glow transition-all"
          >
            Adicionar Endereço
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {addresses.map((address) => (
          <div
            key={address.id}
            className={`bg-dark-card border rounded-xl p-6 ${
              address.is_default
                ? "border-neon-blue shadow-lg shadow-neon-blue/20"
                : "border-gray-800"
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  {address.label}
                  {address.is_default && (
                    <span className="text-xs bg-neon-blue/20 text-neon-blue px-2 py-1 rounded">
                      Padrão
                    </span>
                  )}
                </h3>
                <p className="text-sm text-gray-400">
                  {address.recipient_name}
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingAddress(address);
                  setShowForm(true);
                }}
                className="text-gray-400 hover:text-white"
              >
                ✎
              </button>
            </div>

            <div className="text-sm text-gray-300 space-y-1">
              <p>
                {address.street}, {address.number}
              </p>
              {address.complement && <p>{address.complement}</p>}
              <p>
                {address.neighborhood} - {address.city}/{address.state}
              </p>
              <p>CEP: {formatCEP(address.zip_code)}</p>
            </div>

            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-700">
              {!address.is_default && (
                <button
                  onClick={() => setDefaultAddress(address.id)}
                  className="text-sm text-neon-blue hover:underline"
                >
                  Tornar padrão
                </button>
              )}
              <button
                onClick={() => setDeleteConfirm(address.id)}
                className="text-sm text-red-400 hover:underline ml-auto"
              >
                Excluir
              </button>
            </div>

            {/* Modal de confirmação de exclusão */}
            {deleteConfirm === address.id && (
              <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                <div className="bg-dark-card border border-gray-800 rounded-xl p-6 max-w-md w-full">
                  <h3 className="text-xl font-bold text-white mb-4">
                    Confirmar Exclusão
                  </h3>
                  <p className="text-gray-300 mb-6">
                    Tem certeza que deseja excluir o endereço &quot;
                    {address.label}&quot;?
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={async () => {
                        await deleteAddress(address.id);
                        setDeleteConfirm(null);
                      }}
                      className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Formulário */}
      {showForm && (
        <AddressForm
          address={editingAddress}
          onClose={() => {
            setShowForm(false);
            setEditingAddress(null);
          }}
        />
      )}
    </div>
  );
}

function AddressForm({
  address,
  onClose,
}: {
  address: Address | null;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    label: address?.label || "",
    recipientName: address?.recipient_name || "",
    zipCode: address ? formatCEP(address.zip_code) : "",
    street: address?.street || "",
    number: address?.number || "",
    complement: address?.complement || "",
    neighborhood: address?.neighborhood || "",
    city: address?.city || "",
    state: address?.state || "",
    isDefault: address?.is_default || false,
  });

  const [cepLoading, setCepLoading] = useState(false);

  const actionWithId = address
    ? updateAddress.bind(null, address.id)
    : createAddress;

  const initialState = { error: null, success: false };
  const [state, formAction] = useFormState(actionWithId, initialState);

  const handleCEPChange = async (value: string) => {
    const formatted = formatCEP(value);
    setFormData((prev) => ({ ...prev, zipCode: formatted }));

    const cleanCEP = formatted.replace(/\D/g, "");
    if (cleanCEP.length === 8) {
      setCepLoading(true);
      const addressData = await fetchAddressByCEP(cleanCEP);
      if (addressData) {
        setFormData((prev) => ({
          ...prev,
          street: addressData.logradouro,
          neighborhood: addressData.bairro,
          city: addressData.localidade,
          state: addressData.uf,
        }));
      }
      setCepLoading(false);
    }
  };

  const handleSubmit = async (formDataObj: FormData) => {
    await formAction(formDataObj);
    if (state?.success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-dark-card border border-gray-800 rounded-xl p-6 max-w-2xl w-full my-8">
        <h2 className="text-2xl font-bold text-white mb-6">
          {address ? "Editar Endereço" : "Novo Endereço"}
        </h2>

        <form action={handleSubmit} className="space-y-4">
          {state?.error && (
            <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
              <p className="text-sm text-red-400">{state.error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nome do Endereço *
              </label>
              <input
                type="text"
                name="label"
                value={formData.label}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, label: e.target.value }))
                }
                placeholder="Ex: Casa, Trabalho, Mãe"
                required
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-neon-blue"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nome do Destinatário *
              </label>
              <input
                type="text"
                name="recipientName"
                value={formData.recipientName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    recipientName: e.target.value,
                  }))
                }
                placeholder="Quem vai receber"
                required
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-neon-blue"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              CEP *
            </label>
            <input
              type="text"
              name="zipCode"
              value={formData.zipCode}
              onChange={(e) => handleCEPChange(e.target.value)}
              placeholder="00000-000"
              maxLength={9}
              required
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-neon-blue"
            />
            {cepLoading && (
              <p className="text-xs text-gray-400 mt-1">Buscando CEP...</p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Rua *
              </label>
              <input
                type="text"
                name="street"
                value={formData.street}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, street: e.target.value }))
                }
                required
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-neon-blue"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Número *
              </label>
              <input
                type="text"
                name="number"
                value={formData.number}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, number: e.target.value }))
                }
                required
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-neon-blue"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Complemento
            </label>
            <input
              type="text"
              name="complement"
              value={formData.complement}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, complement: e.target.value }))
              }
              placeholder="Apto, bloco, sala..."
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-neon-blue"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Bairro *
              </label>
              <input
                type="text"
                name="neighborhood"
                value={formData.neighborhood}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    neighborhood: e.target.value,
                  }))
                }
                required
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-neon-blue"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Cidade *
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, city: e.target.value }))
                }
                required
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-neon-blue"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Estado *
              </label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    state: e.target.value.toUpperCase(),
                  }))
                }
                maxLength={2}
                placeholder="RO"
                required
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-neon-blue"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="isDefault"
              id="isDefault"
              checked={formData.isDefault}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  isDefault: e.target.checked,
                }))
              }
              className="w-4 h-4"
            />
            <label htmlFor="isDefault" className="text-sm text-gray-300">
              Definir como endereço padrão
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-gradient-to-r from-neon-blue to-electric-purple text-white font-bold rounded-lg hover:shadow-glow transition-all"
            >
              {address ? "Atualizar" : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
