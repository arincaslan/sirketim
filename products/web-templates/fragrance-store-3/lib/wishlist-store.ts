"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { WishlistLine } from "@/lib/types";

interface WishlistState {
  items: WishlistLine[];
  hasHydrated: boolean;
  toggle: (slug: string) => void;
  remove: (slug: string) => void;
  has: (slug: string) => boolean;
  setHasHydrated: (value: boolean) => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      hasHydrated: false,

      toggle: (slug) => {
        set((state) => {
          const exists = state.items.some((item) => item.slug === slug);
          return {
            items: exists
              ? state.items.filter((item) => item.slug !== slug)
              : [...state.items, { slug, addedAt: Date.now() }],
          };
        });
      },

      remove: (slug) => {
        set((state) => ({ items: state.items.filter((item) => item.slug !== slug) }));
      },

      has: (slug) => get().items.some((item) => item.slug === slug),
      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: "fragrance-store-3-wishlist",
      partialize: (state) => ({ items: state.items }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

export function selectWishlistCount(state: WishlistState): number {
  return state.items.length;
}
