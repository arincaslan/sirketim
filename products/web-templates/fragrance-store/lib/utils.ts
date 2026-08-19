import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a number of US cents-free dollars (e.g. 128) as a currency string
 * (e.g. "$128"). Fragrance pricing in this template is always whole dollars.
 */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export const FREE_SHIPPING_THRESHOLD = 120;
export const FLAT_SHIPPING_COST = 12;
export const TAX_RATE = 0.08;

/**
 * Mock order math for the demo checkout — a flat shipping fee under a free
 * threshold, plus a flat estimated tax rate. There is no real shipping or
 * tax API wired up; this is just arithmetic for the on-screen summary.
 */
export function computeOrderTotals(subtotal: number) {
  const shipping =
    subtotal <= 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_COST;
  const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
  const total = subtotal + shipping + tax;
  return { shipping, tax, total };
}
