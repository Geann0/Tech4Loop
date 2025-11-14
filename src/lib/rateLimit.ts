/**
 * Sistema simples de rate limiting baseado em memória
 * Para produção, considere usar Redis ou similar
 */

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

// Limpar registros antigos a cada 10 minutos
setInterval(
  () => {
    const now = Date.now();
    Object.keys(store).forEach((key) => {
      if (store[key].resetTime < now) {
        delete store[key];
      }
    });
  },
  10 * 60 * 1000
);

export interface RateLimitOptions {
  maxRequests: number;
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
}

/**
 * Verifica se o rate limit foi excedido
 */
export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions
): RateLimitResult {
  const now = Date.now();
  const key = identifier;

  if (!store[key] || store[key].resetTime < now) {
    // Primeira requisição ou janela expirada - resetar
    store[key] = {
      count: 1,
      resetTime: now + options.windowMs,
    };

    return {
      allowed: true,
      remaining: options.maxRequests - 1,
      resetTime: store[key].resetTime,
    };
  }

  // Incrementar contador
  store[key].count++;

  const allowed = store[key].count <= options.maxRequests;
  const remaining = Math.max(0, options.maxRequests - store[key].count);

  return {
    allowed,
    remaining,
    resetTime: store[key].resetTime,
  };
}

/**
 * Extrai identificador da requisição (IP ou userId)
 */
export function getIdentifier(req: Request, userId?: string): string {
  if (userId) return `user:${userId}`;

  // Tentar pegar IP real (considerando proxies)
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded
    ? forwarded.split(",")[0]
    : req.headers.get("x-real-ip") || "unknown";

  return `ip:${ip}`;
}

/**
 * Rate limit padrão para APIs
 */
export const DEFAULT_RATE_LIMIT: RateLimitOptions = {
  maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100"),
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000"), // 15 minutos
};

/**
 * Rate limit mais restritivo para ações sensíveis
 */
export const STRICT_RATE_LIMIT: RateLimitOptions = {
  maxRequests: 10,
  windowMs: 60000, // 1 minuto
};

/**
 * Rate limit para login/autenticação
 */
export const AUTH_RATE_LIMIT: RateLimitOptions = {
  maxRequests: 5,
  windowMs: 300000, // 5 minutos
};
