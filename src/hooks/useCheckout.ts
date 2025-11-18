"use client";

import { useState, useEffect } from "react";
import {
  SavedCheckoutData,
  loadCheckoutData,
  saveCheckoutData,
  clearCheckoutData,
  formatCEP,
  formatPhone,
  fetchAddressByCEP,
  calculateShipping,
  validateCheckoutForm,
} from "@/lib/checkoutUtils";

interface CheckoutFormData {
  name: string;
  email: string;
  phone: string;
  cep: string;
  address: string;
  city: string;
  state: string;
}

interface UseCheckoutOptions {
  autoLoadSavedData?: boolean;
  productPrice?: number;
}

export function useCheckout(options: UseCheckoutOptions = {}) {
  const { autoLoadSavedData = false, productPrice = 0 } = options;

  const [formData, setFormData] = useState<CheckoutFormData>({
    name: "",
    email: "",
    phone: "",
    cep: "",
    address: "",
    city: "",
    state: "",
  });

  const [cepLoading, setCepLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [shipping, setShipping] = useState(calculateShipping("", productPrice));

  // Carregar dados salvos
  useEffect(() => {
    if (autoLoadSavedData) {
      const savedData = loadCheckoutData();
      if (savedData) {
        setFormData({
          name: savedData.name,
          email: savedData.email,
          phone: savedData.phone,
          cep: savedData.cep,
          address: savedData.address,
          city: savedData.city,
          state: savedData.state,
        });
      }
    }
  }, [autoLoadSavedData]);

  // Atualizar campo
  const updateField = (field: keyof CheckoutFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Formatar e atualizar CEP
  const handleCEPChange = async (value: string) => {
    const formatted = formatCEP(value);
    updateField("cep", formatted);

    const cleanCEP = formatted.replace(/\D/g, "");

    if (cleanCEP.length === 8) {
      setCepLoading(true);
      const addressData = await fetchAddressByCEP(cleanCEP);
      setCepLoading(false);

      if (addressData && !addressData.erro) {
        setFormData((prev) => ({
          ...prev,
          cep: formatted,
          address: addressData.logradouro
            ? `${addressData.logradouro}, ${addressData.bairro}`
            : prev.address,
          city: addressData.localidade,
          state: addressData.uf,
        }));

        // Atualizar frete
        const newShipping = calculateShipping(cleanCEP, productPrice);
        setShipping(newShipping);
      }
    }
  };

  // Formatar e atualizar telefone
  const handlePhoneChange = (value: string) => {
    const formatted = formatPhone(value);
    updateField("phone", formatted);
  };

  // Validar formulário
  const validate = (): boolean => {
    const validation = validateCheckoutForm(formData);
    setErrors(validation.errors);
    return validation.valid;
  };

  // Salvar dados
  const saveData = () => {
    saveCheckoutData(formData);
  };

  // Limpar dados
  const clearData = () => {
    clearCheckoutData();
    setFormData({
      name: "",
      email: "",
      phone: "",
      cep: "",
      address: "",
      city: "",
      state: "",
    });
  };

  // Resetar erros
  const clearErrors = () => {
    setErrors([]);
  };

  return {
    formData,
    updateField,
    handleCEPChange,
    handlePhoneChange,
    cepLoading,
    shipping,
    errors,
    validate,
    saveData,
    clearData,
    clearErrors,
  };
}
