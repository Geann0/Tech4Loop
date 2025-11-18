/**
 * Configuração de cookies para desenvolvimento com ngrok
 *
 * O problema: ngrok usa HTTPS mas os cookies Supabase precisam
 * de configurações especiais para funcionar corretamente
 */

export const cookieOptions = {
  name: "sb",
  domain: undefined, // Deixar undefined para ngrok funcionar
  path: "/",
  sameSite: "lax" as const, // 'lax' funciona melhor com ngrok do que 'strict'
  secure: true, // ngrok sempre usa HTTPS
  httpOnly: false, // Precisa ser false para JavaScript acessar
};
