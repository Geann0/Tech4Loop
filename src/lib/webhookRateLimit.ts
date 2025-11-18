/**
 * Sistema de Rate Limiting para Webhooks
 * Protege contra ataques de flooding e abuse
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// Armazena contadores em memória (para produção, usar Redis)
const rateLimitStore = new Map<string, RateLimitEntry>();

export interface RateLimitConfig {
  maxRequests: number; // Número máximo de requests
  windowMs: number; // Janela de tempo em milissegundos
}

/**
 * Verifica se o IP/identificador excedeu o rate limit
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = {
    maxRequests: 100, // 100 requests por janela
    windowMs: 60 * 1000, // 1 minuto
  }
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  // Se não existe entrada ou a janela expirou, criar nova
  if (!entry || now > entry.resetTime) {
    const resetTime = now + config.windowMs;
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime,
    });

    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime,
    };
  }

  // Incrementar contador
  entry.count++;

  // Verificar se excedeu o limite
  if (entry.count > config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
    };
  }

  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetTime: entry.resetTime,
  };
}

/**
 * Limpa entradas expiradas (executar periodicamente)
 */
export function cleanupExpiredEntries(): void {
  const now = Date.now();
  
  Array.from(rateLimitStore.entries()).forEach(([key, entry]) => {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  });
}

/**
 * Extrai identificador único do request (IP ou Payment ID)
 */
export function getWebhookIdentifier(
  ip: string | null,
  paymentId?: string
): string {
  // Preferir payment_id para evitar bloqueio por IP compartilhado
  if (paymentId) {
    return `payment:${paymentId}`;
  }
  
  return `ip:${ip || "unknown"}`;
}

// Executar limpeza a cada 5 minutos
if (typeof setInterval !== "undefined") {
  setInterval(cleanupExpiredEntries, 5 * 60 * 1000);
}
