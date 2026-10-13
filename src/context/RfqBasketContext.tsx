"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Product } from "@/data/initialProducts";
import { RfqBasketItem } from "@/lib/whatsapp";

interface RfqBasketContextType {
  items: RfqBasketItem[];
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isCallModalOpen: boolean;
  setIsCallModalOpen: (open: boolean) => void;
  addItem: (product: Product, quantityNote?: string) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantityNote: string) => void;
  clearBasket: () => void;
  isInBasket: (productId: string) => boolean;
}

const RfqBasketContext = createContext<RfqBasketContextType | undefined>(
  undefined
);

export function RfqBasketProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<RfqBasketItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("eshayat_rfq_basket");
        if (saved) {
          setItems(JSON.parse(saved));
        }
      } catch {
        // Ignore parse error
      }
    }
  }, []);

  const persist = (next: RfqBasketItem[]) => {
    setItems(next);
    if (typeof window !== "undefined") {
      localStorage.setItem("eshayat_rfq_basket", JSON.stringify(next));
    }
  };

  const addItem = (product: Product, quantityNote = "Wholesale Inquiry") => {
    const exists = items.find((i) => i.product.id === product.id);
    if (exists) {
      setIsOpen(true);
      return;
    }
    const next = [...items, { product, quantityNote }];
    persist(next);
  };

  const removeItem = (productId: string) => {
    persist(items.filter((i) => i.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantityNote: string) => {
    persist(
      items.map((i) =>
        i.product.id === productId ? { ...i, quantityNote } : i
      )
    );
  };

  const clearBasket = () => {
    persist([]);
  };

  const isInBasket = (productId: string) =>
    items.some((i) => i.product.id === productId);

  return (
    <RfqBasketContext.Provider
      value={{
        items,
        isOpen,
        setIsOpen,
        isCallModalOpen,
        setIsCallModalOpen,
        addItem,
        removeItem,
        updateQuantity,
        clearBasket,
        isInBasket,
      }}
    >
      {children}
    </RfqBasketContext.Provider>
  );
}

export function useRfqBasket() {
  const ctx = useContext(RfqBasketContext);
  if (!ctx) {
    throw new Error("useRfqBasket must be used within an RfqBasketProvider");
  }
  return ctx;
}
