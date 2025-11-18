/**
 * Sanitização de HTML usando DOMPurify
 *
 * Uso apenas no client-side para evitar problemas de ESM/CommonJS
 */

export function sanitizeHTML(html: string): string {
  // Se estiver no servidor (SSR), retornar HTML sem sanitizar
  // O componente deve ser "use client" para usar esta função
  if (typeof window === "undefined") {
    console.warn(
      "sanitizeHTML chamado no servidor - retornando HTML não sanitizado"
    );
    return html;
  }

  try {
    const DOMPurify = require("dompurify");

    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: [
        "p",
        "br",
        "strong",
        "em",
        "u",
        "b",
        "i",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "ul",
        "ol",
        "li",
        "a",
        "blockquote",
        "code",
        "pre",
        "table",
        "thead",
        "tbody",
        "tr",
        "th",
        "td",
        "div",
        "span",
        "hr",
      ],
      ALLOWED_ATTR: [
        "href",
        "target",
        "rel",
        "class",
        "id",
        "alt",
        "title",
        "style",
      ],
      ALLOW_DATA_ATTR: false,
      ALLOWED_URI_REGEXP:
        /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    });
  } catch (error) {
    console.error("Erro ao sanitizar HTML:", error);
    return html; // Fallback
  }
}

/**
 * Sanitização estrita (remove quase tudo, apenas texto básico)
 */
export function sanitizeHTMLStrict(html: string): string {
  if (typeof window === "undefined") {
    return html;
  }

  try {
    const DOMPurify = require("dompurify");

    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ["p", "br", "strong", "em"],
      ALLOWED_ATTR: [],
    });
  } catch (error) {
    console.error("Erro ao sanitizar HTML:", error);
    return html;
  }
}
