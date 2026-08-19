"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartLine } from "@/lib/types";

interface CartState {
  lines: CartLine[];
  isOpen: boolean;
  hasHydrated: boolean;
  addItem: (line: Omit<CartLine, "quantity">, quantity?: number) => void;
  removeItem: (slug: string, sizeMl: number) => void;
  updateQuantity: (slug: string, sizeMl: number, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  setHasHydrated: (value: boolean) => void;
}

/**
 * Client-side cart store, persisted to localStorage.
 *
 * There is no backend here: this is the entire "database" for the cart.
 * Nothing is sent to a server until (and unless) a buyer of this template
 * wires up their own API route / order backend.
 */
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      isOpen: false,
      hasHydrated: false,

      addItem: (line, quantity = 1) => {
        set((state) => {
          const existing = state.lines.find(
            (l) => l.slug === line.slug && l.sizeMl === line.sizeMl
          );

          if (existing) {
            return {
              lines: state.lines.map((l) =>
                l.slug === line.slug && l.sizeMl === line.sizeMl
                  ? { ...l, quantity: l.quantity + quantity }
                  : l
              ),
            };
          }

          return { lines: [...state.lines, { ...line, quantity }] };
        });
      },

      removeItem: (slug, sizeMl) => {
        set((state) => ({
          lines: state.lines.filter(
            (l) => !(l.slug === slug && l.sizeMl === sizeMl)
          ),
        }));
      },

      updateQuantity: (slug, sizeMl, quantity) => {
        if (quantity <= 0) {
          get().removeItem(slug, sizeMl);
          return;
        }
        set((state) => ({
          lines: state.lines.map((l) =>
            l.slug === slug && l.sizeMl === sizeMl ? { ...l, quantity } : l
          ),
        }));
      },

      clearCart: () => set({ lines: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: "fragrance-store-cart",
      partialize: (state) => ({ lines: state.lines }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

export function selectCartCount(state: CartState): number {
  return state.lines.reduce((sum, line) => sum + line.quantity, 0);
}

export function selectCartSubtotal(state: CartState): number {
  return state.lines.reduce(
    (sum, line) => sum + line.unitPrice * line.quantity,
    0
  );
}
