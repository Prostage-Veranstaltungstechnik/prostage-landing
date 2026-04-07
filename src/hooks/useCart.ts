"use client";

import { useState, useEffect, useCallback } from "react";

const CART_KEY = "prostage_cart";

export interface CartItem {
  id: string;
  name: string;
  price: string;
  unit: string;
  category: string;
  categoryLabel: string;
}

function readCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeCart(items: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("cart-updated"));
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);

  const sync = useCallback(() => setItems(readCart()), []);

  useEffect(() => {
    sync();
    window.addEventListener("cart-updated", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("cart-updated", sync);
      window.removeEventListener("storage", sync);
    };
  }, [sync]);

  function addItem(item: CartItem) {
    const cart = readCart();
    if (!cart.some((c) => c.id === item.id)) {
      writeCart([...cart, item]);
    }
  }

  function removeItem(id: string) {
    writeCart(readCart().filter((c) => c.id !== id));
  }

  function clearCart() {
    writeCart([]);
  }

  function isInCart(id: string) {
    return items.some((c) => c.id === id);
  }

  return { items, addItem, removeItem, clearCart, isInCart };
}
