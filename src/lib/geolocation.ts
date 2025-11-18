/**
 * Serviço de validação geográfica e busca de CEP
 * Utiliza a API ViaCEP para obter informações de endereço
 */

export interface CEPData {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string; // cidade
  uf: string; // estado
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean;
}

export type CoverageType = "city" | "state" | "country";

export interface CoverageArea {
  type: CoverageType;
  cities?: string[]; // ["OURO PRETO DO OESTE", "JI-PARANÁ"]
  states?: string[]; // ["RO", "SP"]
  country?: string; // "BR"
}

// Cache em memória para CEPs (válido por 24h)
const cepCache = new Map<string, { data: CEPData; timestamp: number }>();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas em ms

/**
 * Limpa entradas antigas do cache
 */
function cleanExpiredCache() {
  const now = Date.now();
  const keysToDelete: string[] = [];

  cepCache.forEach((value, key) => {
    if (now - value.timestamp > CACHE_DURATION) {
      keysToDelete.push(key);
    }
  });

  keysToDelete.forEach((key) => cepCache.delete(key));
}

/**
 * Busca informações de um CEP usando a API ViaCEP (com cache)
 */
export async function fetchCEPData(cep: string): Promise<CEPData | null> {
  try {
    const cleanCEP = cep.replace(/\D/g, "");

    if (cleanCEP.length !== 8) {
      console.error("CEP inválido:", cep);
      return null;
    }

    // Verifica cache
    const cached = cepCache.get(cleanCEP);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log("📦 CEP encontrado no cache:", cleanCEP);
      return cached.data;
    }

    console.log("🌐 Buscando CEP na API ViaCEP:", cleanCEP);
    const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`, {
      next: { revalidate: 86400 }, // Revalida a cada 24h
    });

    if (!response.ok) {
      console.error("Erro ao buscar CEP:", response.statusText);
      return null;
    }

    const data: CEPData = await response.json();

    if (data.erro) {
      console.error("CEP não encontrado:", cep);
      return null;
    }

    // Armazena no cache
    cepCache.set(cleanCEP, { data, timestamp: Date.now() });
    cleanExpiredCache(); // Limpa cache antigo

    return data;
  } catch (error) {
    console.error("Erro na API ViaCEP:", error);
    return null;
  }
}

/**
 * Normaliza nome de cidade para comparação
 * Remove acentos, converte para maiúsculas e remove hífen/espaços extras
 */
export function normalizeCityName(city: string): string {
  return city
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .trim()
    .replace(/\s+/g, " ");
}

/**
 * Valida se um CEP está dentro da área de cobertura
 */
export async function validateCoverage(
  cep: string,
  coverage: CoverageArea
): Promise<{
  valid: boolean;
  reason?: string;
  location?: { city: string; state: string };
}> {
  const cepData = await fetchCEPData(cep);

  if (!cepData) {
    return {
      valid: false,
      reason: "CEP inválido ou não encontrado",
    };
  }

  const userCity = normalizeCityName(cepData.localidade);
  const userState = cepData.uf.toUpperCase();

  // Validação por PAÍS
  if (coverage.type === "country") {
    const country = coverage.country?.toUpperCase() || "BR";
    if (country === "BR") {
      return {
        valid: true,
        location: { city: cepData.localidade, state: userState },
      };
    }
    return {
      valid: false,
      reason: `Esta loja só atende no país: ${country}`,
      location: { city: cepData.localidade, state: userState },
    };
  }

  // Validação por ESTADO
  if (coverage.type === "state") {
    const states = coverage.states?.map((s) => s.toUpperCase()) || [];
    if (states.includes(userState)) {
      return {
        valid: true,
        location: { city: cepData.localidade, state: userState },
      };
    }
    return {
      valid: false,
      reason: `Esta loja não atende o estado ${userState}. Atende apenas: ${states.join(", ")}`,
      location: { city: cepData.localidade, state: userState },
    };
  }

  // Validação por CIDADE
  if (coverage.type === "city") {
    const cities = coverage.cities?.map(normalizeCityName) || [];
    if (cities.includes(userCity)) {
      return {
        valid: true,
        location: { city: cepData.localidade, state: userState },
      };
    }
    return {
      valid: false,
      reason: `Esta loja não atende ${cepData.localidade}. Cidades atendidas: ${coverage.cities?.join(", ")}`,
      location: { city: cepData.localidade, state: userState },
    };
  }

  return {
    valid: false,
    reason: "Área de cobertura não configurada",
    location: { city: cepData.localidade, state: userState },
  };
}

/**
 * Converte service_regions do formato antigo para CoverageArea
 * Formato antigo: ["RO", "SP"] (apenas estados)
 * Formato novo: { type: 'state', states: ["RO", "SP"] }
 */
export function parseCoverageFromRegions(
  regions: string[] | null | undefined,
  partnerName?: string
): CoverageArea {
  if (!regions || regions.length === 0) {
    // Se não tem regiões definidas, assume cobertura nacional
    return {
      type: "country",
      country: "BR",
    };
  }

  // Se tiver apenas siglas de 2 letras, assume que são estados
  const allStates = regions.every((r) => r.length === 2);
  if (allStates) {
    return {
      type: "state",
      states: regions.map((r) => r.toUpperCase()),
    };
  }

  // Caso contrário, assume que são cidades
  return {
    type: "city",
    cities: regions.map(normalizeCityName),
  };
}

/**
 * Formata mensagem amigável de erro de cobertura
 */
export function formatCoverageErrorMessage(
  partnerName: string,
  reason: string,
  location: { city: string; state: string }
): string {
  return `Ops! A loja "${partnerName}" não atende sua região (${location.city}/${location.state}). ${reason}. Que tal buscar produtos similares de outras lojas que atendem sua área?`;
}
