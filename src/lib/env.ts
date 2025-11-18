/**
 * Validação de Variáveis de Ambiente
 * Garante que todas as variáveis necessárias estejam configuradas antes do startup
 */

interface EnvConfig {
  key: string;
  required: boolean;
  description: string;
}

const ENV_VARS: EnvConfig[] = [
  // Supabase
  {
    key: "NEXT_PUBLIC_SUPABASE_URL",
    required: true,
    description: "URL do projeto Supabase",
  },
  {
    key: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    required: true,
    description: "Chave pública (anon) do Supabase",
  },
  {
    key: "SUPABASE_SERVICE_ROLE_KEY",
    required: true,
    description: "Chave de serviço do Supabase (admin)",
  },

  // Mercado Pago
  {
    key: "MERCADO_PAGO_ACCESS_TOKEN",
    required: true,
    description: "Token de acesso do Mercado Pago",
  },

  // Resend (Email)
  {
    key: "RESEND_API_KEY",
    required: true,
    description: "API Key do Resend para envio de emails",
  },

  // Site
  {
    key: "NEXT_PUBLIC_SITE_URL",
    required: true,
    description: "URL do site em produção",
  },

  // Opcionais
  {
    key: "ADMIN_EMAIL",
    required: false,
    description: "Email do administrador para notificações",
  },
  {
    key: "RATE_LIMIT_MAX_REQUESTS",
    required: false,
    description: "Número máximo de requisições (default: 100)",
  },
  {
    key: "RATE_LIMIT_WINDOW_MS",
    required: false,
    description: "Janela de tempo do rate limit em ms (default: 900000)",
  },
];

/**
 * Valida se todas as variáveis de ambiente obrigatórias estão configuradas
 * @throws Error se alguma variável obrigatória estiver faltando
 */
export function validateEnvVars(): void {
  const missing: string[] = [];
  const warnings: string[] = [];

  for (const { key, required, description } of ENV_VARS) {
    const value = process.env[key];

    if (required && !value) {
      missing.push(`❌ ${key} - ${description}`);
    } else if (!required && !value) {
      warnings.push(`⚠️  ${key} - ${description} (opcional)`);
    }
  }

  if (missing.length > 0) {
    console.error(
      "\n🚨 ERRO: Variáveis de ambiente obrigatórias não configuradas:\n"
    );
    missing.forEach((msg) => console.error(msg));
    console.error("\nConfigure essas variáveis no arquivo .env.local\n");
    throw new Error("Variáveis de ambiente obrigatórias não configuradas");
  }

  if (warnings.length > 0 && process.env.NODE_ENV === "development") {
    console.warn("\n⚠️  Variáveis de ambiente opcionais não configuradas:\n");
    warnings.forEach((msg) => console.warn(msg));
    console.warn("\n");
  }

  // Em desenvolvimento, mostrar status
  if (process.env.NODE_ENV === "development") {
    console.log(
      "✅ Todas as variáveis de ambiente obrigatórias estão configuradas\n"
    );
  }
}

/**
 * Obtém uma variável de ambiente com valor padrão
 */
export function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key];

  if (!value && !defaultValue) {
    throw new Error(
      `Variável de ambiente ${key} não encontrada e sem valor padrão`
    );
  }

  return value || defaultValue!;
}

/**
 * Verifica se está em ambiente de produção
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

/**
 * Verifica se está em ambiente de desenvolvimento
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === "development";
}

// Validar na inicialização (apenas no servidor)
if (typeof window === "undefined") {
  try {
    validateEnvVars();
  } catch (error) {
    // Em desenvolvimento, apenas avisar
    if (process.env.NODE_ENV === "development") {
      console.warn("⚠️  Algumas variáveis de ambiente não estão configuradas");
    } else {
      // Em produção, falhar
      throw error;
    }
  }
}
