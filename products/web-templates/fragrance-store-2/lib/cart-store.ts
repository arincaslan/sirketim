"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartLine } from "@/lib/types";

interface CartState {
  lines: CartLine[];
  hasHydrated: boolean;
  /** Last line added, used to drive the bottom "Added to bag" toast — this
   * template shows a toast instead of auto-opening a drawer (see DESIGN.md). */
  lastAdded: CartLine | null;
  addItem: (line: Omit<CartLine, "quantity">, quantity?: number) => void;
  removeItem: (slug: string, sizeMl: number) => void;
  updateQuantity: (slug: string, sizeMl: number, quantity: number) => void;
  clearCart: () => void;
  clearLastAdded: () => void;
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
      hasHydrated: false,
      lastAdded: null,

      addItem: (line, quantity = 1) => {
        set((state) => {
          const existing = state.lines.find(
            (l) => l.slug === line.slug && l.sizeMl === line.sizeMl
          );

          const lines = existing
            ? state.lines.map((l) =>
                l.slug === line.slug && l.sizeMl === line.sizeMl
                  ? { ...l, quantity: l.quantity + quantity }
                  : l
              )
            : [...state.lines, { ...line, quantity }];

          return { lines, lastAdded: { ...line, quantity } };
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
      clearLastAdded: () => set({ lastAdded: null }),
      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: "fragrance-store-2-cart",
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
