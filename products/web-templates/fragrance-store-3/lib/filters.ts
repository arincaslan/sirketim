import { getFullSizes, getSampleSize, getStartingPrice } from "@/lib/products";
import type { Availability, Concentration, GenderExpression, Intensity, Product, ScentFamily, Season } from "@/lib/types";

export type PriceBand = "under-90" | "90-150" | "150-plus";

export interface FilterState {
  families: ScentFamily[];
  genders: GenderExpression[];
  intensities: Intensity[];
  seasons: Season[];
  priceBands: PriceBand[];
  sizes: number[];
  availabilities: Availability[];
  formats: Concentration[];
  sampleOnly: boolean;
}

export const EMPTY_FILTERS: FilterState = {
  families: [],
  genders: [],
  intensities: [],
  seasons: [],
  priceBands: [],
  sizes: [],
  availabilities: [],
  formats: [],
  sampleOnly: false,
};

export const PRICE_BANDS: { id: PriceBand; label: string }[] = [
  { id: "under-90", label: "Under $90" },
  { id: "90-150", label: "$90 – $150" },
  { id: "150-plus", label: "$150+" },
];

export const AVAILABILITY_OPTIONS: { id: Availability; label: string }[] = [
  { id: "in-stock", label: "In stock" },
  { id: "low-stock", label: "Low stock" },
  { id: "preorder", label: "Preorder" },
];

export function toggleValue<T>(list: T[], item: T): T[] {
  return list.includes(item) ? list.filter((v) => v !== item) : [...list, item];
}

export function countActiveFilters(filters: FilterState): number {
  return (
    filters.families.length +
    filters.genders.length +
    filters.intensities.length +
    filters.seasons.length +
    filters.priceBands.length +
    filters.sizes.length +
    filters.availabilities.length +
    filters.formats.length +
    (filters.sampleOnly ? 1 : 0)
  );
}

export function matchesFilters(product: Product, filters: FilterState): boolean {
  if (filters.families.length && !filters.families.includes(product.family)) return false;
  if (filters.genders.length && !filters.genders.includes(product.gender)) return false;
  if (filters.intensities.length && !filters.intensities.includes(product.intensity)) return false;
  if (filters.seasons.length && !filters.seasons.some((s) => product.seasons.includes(s))) return false;
  if (filters.formats.length && !filters.formats.includes(product.concentration)) return false;
  if (filters.availabilities.length && !filters.availabilities.includes(product.availability)) return false;
  if (filters.sampleOnly && !getSampleSize(product)) return false;

  if (filters.sizes.length) {
    const productSizes = getFullSizes(product).map((s) => s.ml);
    if (!filters.sizes.some((ml) => productSizes.includes(ml))) return false;
  }

  if (filters.priceBands.length) {
    const startingPrice = getStartingPrice(product);
    const inBand = filters.priceBands.some((band) => {
      if (band === "under-90") return startingPrice < 90;
      if (band === "90-150") return startingPrice >= 90 && startingPrice <= 150;
      return startingPrice > 150;
    });
    if (!inBand) return false;
  }

  return true;
}

export function matchesSearch(product: Product, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    product.name.toLowerCase().includes(q) ||
    product.tagline.toLowerCase().includes(q) ||
    product.family.toLowerCase().includes(q) ||
    product.place.toLowerCase().includes(q)
  );
}
