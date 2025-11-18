"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { CartItem, Cart } from "@/types/index";

interface CartContextType {
  cart: Cart;
  addToCart: (item: Omit<CartItem, "quantity" | "selected">) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  toggleItemSelection: (productId: string) => void;
  selectAllItems: () => void;
  deselectAllItems: () => void;
  clearCart: () => void;
  removeSelectedItems: () => void;
  getItemQuantity: (productId: string) => number;
  isInCart: (productId: string) => boolean;
  selectedItems: CartItem[];
  selectedTotal: number;
  hasSelectedItems: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "tech4loop_cart";

function calculateCartTotal(items: CartItem[]): number {
  return items.reduce(
    (total, item) => total + item.product_price * item.quantity,
    0
  );
}

function calculateItemCount(items: CartItem[]): number {
  return items.reduce((count, item) => count + item.quantity, 0);
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart>({
    items: [],
    total: 0,
    itemCount: 0,
  });

  const [isLoaded, setIsLoaded] = useState(false);

  // Carregar carrinho do localStorage quando o componente montar
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        const parsedCart: CartItem[] = JSON.parse(savedCart);
        setCart({
          items: parsedCart,
          total: calculateCartTotal(parsedCart),
          itemCount: calculateItemCount(parsedCart),
        });
      }
    } catch (error) {
      console.error("Erro ao carregar carrinho:", error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Salvar carrinho no localStorage sempre que mudar
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart.items));
      } catch (error) {
        console.error("Erro ao salvar carrinho:", error);
      }
    }
  }, [cart.items, isLoaded]);

  const addToCart = (item: Omit<CartItem, "quantity" | "selected">) => {
    setCart((prevCart) => {
      const existingItem = prevCart.items.find(
        (i) => i.product_id === item.product_id
      );

      let newItems: CartItem[];

      if (existingItem) {
        // Incrementa quantidade se o item já existe
        newItems = prevCart.items.map((i) =>
          i.product_id === item.product_id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      } else {
        // Adiciona novo item com quantidade 1 e selecionado por padrão
        newItems = [
          ...prevCart.items,
          { ...item, quantity: 1, selected: true },
        ];
      }

      return {
        items: newItems,
        total: calculateCartTotal(newItems),
        itemCount: calculateItemCount(newItems),
      };
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => {
      const newItems = prevCart.items.filter((i) => i.product_id !== productId);

      return {
        items: newItems,
        total: calculateCartTotal(newItems),
        itemCount: calculateItemCount(newItems),
      };
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart((prevCart) => {
      const newItems = prevCart.items.map((i) =>
        i.product_id === productId ? { ...i, quantity } : i
      );

      return {
        items: newItems,
        total: calculateCartTotal(newItems),
        itemCount: calculateItemCount(newItems),
      };
    });
  };

  const clearCart = () => {
    setCart({
      items: [],
      total: 0,
      itemCount: 0,
    });
  };

  const getItemQuantity = (productId: string): number => {
    const item = cart.items.find((i) => i.product_id === productId);
    return item?.quantity || 0;
  };

  const isInCart = (productId: string): boolean => {
    return cart.items.some((i) => i.product_id === productId);
  };

  const toggleItemSelection = (productId: string) => {
    setCart((prevCart) => {
      const newItems = prevCart.items.map((i) =>
        i.product_id === productId ? { ...i, selected: !i.selected } : i
      );

      return {
        items: newItems,
        total: calculateCartTotal(newItems),
        itemCount: calculateItemCount(newItems),
      };
    });
  };

  const selectAllItems = () => {
    setCart((prevCart) => {
      const newItems = prevCart.items.map((i) => ({ ...i, selected: true }));

      return {
        items: newItems,
        total: calculateCartTotal(newItems),
        itemCount: calculateItemCount(newItems),
      };
    });
  };

  const deselectAllItems = () => {
    setCart((prevCart) => {
      const newItems = prevCart.items.map((i) => ({ ...i, selected: false }));

      return {
        items: newItems,
        total: calculateCartTotal(newItems),
        itemCount: calculateItemCount(newItems),
      };
    });
  };

  const removeSelectedItems = () => {
    setCart((prevCart) => {
      const newItems = prevCart.items.filter((i) => !i.selected);

      return {
        items: newItems,
        total: calculateCartTotal(newItems),
        itemCount: calculateItemCount(newItems),
      };
    });
  };

  const selectedItems = cart.items.filter((item) => item.selected);
  const selectedTotal = selectedItems.reduce(
    (total, item) => total + item.product_price * item.quantity,
    0
  );
  const hasSelectedItems = selectedItems.length > 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        toggleItemSelection,
        selectAllItems,
        deselectAllItems,
        clearCart,
        removeSelectedItems,
        getItemQuantity,
        isInCart,
        selectedItems,
        selectedTotal,
        hasSelectedItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart deve ser usado dentro de um CartProvider");
  }
  return context;
}
