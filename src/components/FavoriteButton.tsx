"use client";

import { useState, useEffect } from "react";
import { toggleFavorite, checkIsFavorite } from "@/app/conta/favoritos/actions";

interface FavoriteButtonProps {
  productId: string;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export default function FavoriteButton({
  productId,
  size = "md",
  showLabel = false,
  className = "",
}: FavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkStatus() {
      const status = await checkIsFavorite(productId);
      setIsFavorited(status);
      setIsLoading(false);
    }
    checkStatus();
  }, [productId]);

  const handleToggle = async () => {
    setIsLoading(true);
    const result = await toggleFavorite(productId);
    if (result.success) {
      setIsFavorited(result.isFavorited ?? false);
    }
    setIsLoading(false);
  };

  const sizes = {
    sm: "text-xl p-2",
    md: "text-2xl p-3",
    lg: "text-3xl p-4",
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`
        ${sizes[size]}
        ${isFavorited ? "text-red-500" : "text-gray-400"}
        hover:text-red-500
        transition-all
        disabled:opacity-50
        disabled:cursor-not-allowed
        ${className}
      `}
      title={isFavorited ? "Remover dos favoritos" : "Adicionar aos favoritos"}
    >
      {isLoading ? (
        <span className="animate-spin">◌</span>
      ) : isFavorited ? (
        "♥"
      ) : (
        "♡"
      )}
      {showLabel && (
        <span className="ml-2 text-sm">
          {isFavorited ? "Favoritado" : "Favoritar"}
        </span>
      )}
    </button>
  );
}
