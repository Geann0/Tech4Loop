/**
 * Badge de Status de Estoque
 * Exibe visualmente o status do estoque de um produto
 */

interface StockBadgeProps {
  stock: number | null | undefined;
  className?: string;
  showText?: boolean;
}

export default function StockBadge({
  stock,
  className = "",
  showText = true,
}: StockBadgeProps) {
  // Se stock é null ou undefined, não mostrar nada
  if (stock === null || stock === undefined) {
    return null;
  }

  let status: "out" | "critical" | "low" | "ok" = "ok";
  let text = "";
  let colorClasses = "";

  if (stock === 0) {
    status = "out";
    text = "Fora de Estoque";
    colorClasses = "bg-red-500/20 text-red-400 border-red-500/50";
  } else if (stock <= 5) {
    status = "critical";
    text = `Apenas ${stock} ${stock === 1 ? "unidade" : "unidades"}`;
    colorClasses = "bg-orange-500/20 text-orange-400 border-orange-500/50";
  } else if (stock <= 10) {
    status = "low";
    text = "Estoque Limitado";
    colorClasses = "bg-yellow-500/20 text-yellow-400 border-yellow-500/50";
  } else {
    // Não mostrar badge se tem estoque ok
    if (!showText) return null;
    text = "Em Estoque";
    colorClasses = "bg-green-500/20 text-green-400 border-green-500/50";
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClasses} ${className}`}
      aria-label={`Status de estoque: ${text}`}
    >
      {status === "out" && (
        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
      )}
      {status === "critical" && (
        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
      )}
      {showText && text}
    </span>
  );
}

/**
 * Hook para obter informações de estoque formatadas
 */
export function useStockInfo(stock: number | null | undefined) {
  if (stock === null || stock === undefined) {
    return {
      available: true,
      message: null,
      status: "unknown" as const,
    };
  }

  if (stock === 0) {
    return {
      available: false,
      message: "Produto fora de estoque",
      status: "out" as const,
    };
  }

  if (stock <= 5) {
    return {
      available: true,
      message: `Últimas ${stock} ${stock === 1 ? "unidade" : "unidades"} disponíveis!`,
      status: "critical" as const,
    };
  }

  if (stock <= 10) {
    return {
      available: true,
      message: "Estoque limitado",
      status: "low" as const,
    };
  }

  return {
    available: true,
    message: null,
    status: "ok" as const,
  };
}
