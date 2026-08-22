import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a number of whole US dollars (e.g. 128) as a currency string
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
export function computeOrderTotals(subtotal: number, discount = 0) {
  const discountedSubtotal = Math.max(0, subtotal - discount);
  const shipping =
    discountedSubtotal <= 0 || discountedSubtotal >= FREE_SHIPPING_THRESHOLD
      ? 0
      : FLAT_SHIPPING_COST;
  const tax = Math.round(discountedSubtotal * TAX_RATE * 100) / 100;
  const total = discountedSubtotal + shipping + tax;
  return { discountedSubtotal, shipping, tax, total };
}

export function formatRating(rating: number): string {
  return rating.toFixed(1);
}

/**
 * Derives a plausible 5-to-1-star review breakdown from a product's average
 * rating and review count — deterministic, not randomly generated per
 * render, so the breakdown bars never disagree with themselves between
 * server and client paint. Returns counts indexed [5-star, 4-star, 3-star,
 * 2-star, 1-star].
 */
export function estimateRatingBreakdown(rating: number, count: number): number[] {
  const weights = [5, 4, 3, 2, 1].map((star) => {
    const distance = Math.abs(star - rating);
    return Math.max(0.015, 1 - distance / 2.6) ** 2;
  });
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  const raw = weights.map((w) => (w / totalWeight) * count);
  const rounded = raw.map((n) => Math.floor(n));
  let remainder = count - rounded.reduce((sum, n) => sum + n, 0);
  const fractions = raw.map((n, i) => ({ i, frac: n - Math.floor(n) })).sort((a, b) => b.frac - a.frac);
  for (let i = 0; i < fractions.length && remainder > 0; i++) {
    rounded[fractions[i].i] += 1;
    remainder -= 1;
  }
  return rounded;
}
