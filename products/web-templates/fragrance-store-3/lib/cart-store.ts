"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartLine } from "@/lib/types";

interface CartState {
  lines: CartLine[];
  hasHydrated: boolean;
  isDrawerOpen: boolean;
  lastAdded: CartLine | null;
  discountCode: string | null;
  discountPercent: number;
  addItem: (line: Omit<CartLine, "quantity">, quantity?: number) => void;
  removeItem: (slug: string, sizeMl: number) => void;
  updateQuantity: (slug: string, sizeMl: number, quantity: number) => void;
  clearCart: () => void;
  clearLastAdded: () => void;
  setHasHydrated: (value: boolean) => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  applyDiscount: (code: string) => boolean;
  clearDiscount: () => void;
}

/** The only working demo code, deliberately documented in the UI itself
 * (see components/store/order-summary.tsx) rather than hidden. */
const VALID_DISCOUNT_CODES: Record<string, number> = {
  WELCOME10: 10,
};

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
      isDrawerOpen: false,
      lastAdded: null,
      discountCode: null,
      discountPercent: 0,

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

          return { lines, lastAdded: { ...line, quantity }, isDrawerOpen: true };
        });
      },

      removeItem: (slug, sizeMl) => {
        set((state) => ({
          lines: state.lines.filter((l) => !(l.slug === slug && l.sizeMl === sizeMl)),
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

      clearCart: () => set({ lines: [], discountCode: null, discountPercent: 0 }),
      clearLastAdded: () => set({ lastAdded: null }),
      setHasHydrated: (value) => set({ hasHydrated: value }),
      openDrawer: () => set({ isDrawerOpen: true }),
      closeDrawer: () => set({ isDrawerOpen: false }),

      applyDiscount: (code) => {
        const normalized = code.trim().toUpperCase();
        const percent = VALID_DISCOUNT_CODES[normalized];
        if (!percent) return false;
        set({ discountCode: normalized, discountPercent: percent });
        return true;
      },
      clearDiscount: () => set({ discountCode: null, discountPercent: 0 }),
    }),
    {
      name: "fragrance-store-3-cart",
      partialize: (state) => ({
        lines: state.lines,
        discountCode: state.discountCode,
        discountPercent: state.discountPercent,
      }),
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
  return state.lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
}

export function selectDiscountAmount(state: CartState): number {
  const subtotal = selectCartSubtotal(state);
  return Math.round(subtotal * (state.discountPercent / 100) * 100) / 100;
}
