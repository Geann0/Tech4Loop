// Utilidades para o Checkout

// Tipos para dados salvos
export interface SavedCheckoutData {
  name: string;
  email: string;
  phone: string;
  cep: string;
  address: string;
  city: string;
  state: string;
  savedAt: string;
}

// LocalStorage keys
const CHECKOUT_DATA_KEY = "tech4loop_checkout_data";

/**
 * Salvar dados do checkout no localStorage
 */
export function saveCheckoutData(
  data: Omit<SavedCheckoutData, "savedAt">
): void {
  try {
    const savedData: SavedCheckoutData = {
      ...data,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(CHECKOUT_DATA_KEY, JSON.stringify(savedData));
    console.log("✅ Dados do checkout salvos com sucesso");
  } catch (error) {
    console.error("❌ Erro ao salvar dados do checkout:", error);
  }
}

/**
 * Recuperar dados do checkout do localStorage
 */
export function loadCheckoutData(): SavedCheckoutData | null {
  try {
    const data = localStorage.getItem(CHECKOUT_DATA_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      console.log("✅ Dados do checkout carregados");
      return parsed;
    }
    return null;
  } catch (error) {
    console.error("❌ Erro ao carregar dados do checkout:", error);
    return null;
  }
}

/**
 * Limpar dados salvos do checkout
 */
export function clearCheckoutData(): void {
  try {
    localStorage.removeItem(CHECKOUT_DATA_KEY);
    console.log("✅ Dados do checkout removidos");
  } catch (error) {
    console.error("❌ Erro ao remover dados do checkout:", error);
  }
}

/**
 * Formatar CEP (00000-000)
 */
export function formatCEP(value: string): string {
  const numbers = value.replace(/\D/g, "");
  if (numbers.length <= 5) {
    return numbers;
  }
  return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
}

/**
 * Formatar telefone ((00) 00000-0000)
 */
export function formatPhone(value: string): string {
  const numbers = value.replace(/\D/g, "");

  if (numbers.length <= 2) {
    return numbers;
  }
  if (numbers.length <= 7) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  }
  if (numbers.length <= 11) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  }
  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
}

/**
 * Validar CEP (formato 00000-000)
 */
export function isValidCEP(cep: string): boolean {
  const numbers = cep.replace(/\D/g, "");
  return numbers.length === 8;
}

/**
 * Validar telefone brasileiro
 */
export function isValidPhone(phone: string): boolean {
  const numbers = phone.replace(/\D/g, "");
  return numbers.length === 10 || numbers.length === 11;
}

/**
 * Validar email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Buscar endereço via CEP (ViaCEP API)
 */
export async function fetchAddressByCEP(cep: string): Promise<{
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
} | null> {
  try {
    const cleanCEP = cep.replace(/\D/g, "");

    if (cleanCEP.length !== 8) {
      return null;
    }

    const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);

    if (!response.ok) {
      throw new Error("Erro ao buscar CEP");
    }

    const data = await response.json();

    if (data.erro) {
      return null;
    }

    return data;
  } catch (error) {
    console.error("Erro ao buscar CEP:", error);
    return null;
  }
}

/**
 * Obter nome amigável do método de pagamento
 */
export function getPaymentMethodName(method: string): string {
  const methods: Record<string, string> = {
    credit_card: "Cartão de Crédito",
    pix: "PIX",
    boleto: "Boleto Bancário",
    wallet: "Carteira Digital",
  };
  return methods[method] || method;
}

/**
 * Obter ícone do método de pagamento
 */
export function getPaymentMethodIcon(method: string): string {
  const icons: Record<string, string> = {
    credit_card: "💳",
    pix: "⚡︎",
    boleto: "📄",
    wallet: "📱",
  };
  return icons[method] || "💰";
}

/**
 * Calcular frete (simulação - você pode integrar com API real)
 */
export function calculateShipping(
  cep: string,
  price: number
): {
  value: number;
  days: number;
  name: string;
} {
  // Simulação simples - em produção, integre com Correios ou Melhor Envio
  const cleanCEP = cep.replace(/\D/g, "");

  // CEPs de Rondônia (76xxx-xxx, 78xxx-xxx)
  if (cleanCEP.startsWith("76") || cleanCEP.startsWith("78")) {
    return {
      value: 0, // Frete grátis local
      days: 2,
      name: "Entrega Regional",
    };
  }

  // Outros estados
  if (price >= 200) {
    return {
      value: 0, // Frete grátis acima de R$ 200
      days: 7,
      name: "Entrega Nacional Grátis",
    };
  }

  return {
    value: 15.9,
    days: 7,
    name: "Entrega Nacional",
  };
}

/**
 * Validar formulário completo de checkout
 */
export function validateCheckoutForm(data: {
  name: string;
  email: string;
  phone: string;
  cep: string;
  address: string;
  city: string;
  state: string;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.name || data.name.trim().length < 3) {
    errors.push("Nome deve ter pelo menos 3 caracteres");
  }

  if (!isValidEmail(data.email)) {
    errors.push("Email inválido");
  }

  if (!isValidPhone(data.phone)) {
    errors.push("Telefone inválido");
  }

  if (!isValidCEP(data.cep)) {
    errors.push("CEP inválido");
  }

  if (!data.address || data.address.trim().length < 5) {
    errors.push("Endereço deve ter pelo menos 5 caracteres");
  }

  if (!data.city || data.city.trim().length < 3) {
    errors.push("Cidade inválida");
  }

  if (!data.state || data.state.length !== 2) {
    errors.push("UF deve ter 2 caracteres");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
