import type { ReferenceFragrance } from "@/lib/types";

/** Guerlain. See lib/data/references.ts for data-accuracy caveats. */
export const GUERLAIN: ReferenceFragrance[] = [
  {
    slug: "shalimar",
    name: "Shalimar",
    brand: "Guerlain",
    family: "Oriental Vanilla",
    notes: {
      top: ["Bergamot", "Lemon", "Mandarin"],
      heart: ["Iris", "Jasmine", "Rose"],
      base: ["Vanilla", "Tonka Bean", "Opoponax", "Leather", "Incense"],
    },
    facets: { freshness: 3, sweetness: 8, warmth: 9, woodyDepth: 5, longevity: 8, sillage: 8 },
    longevityHoursRange: [7, 10],
    sillageLabel: "Strong",
    priceUsd: 132,
    bottleMl: 90,
    concentration: "Eau de Parfum",
    affiliateLinkId: "original-shalimar",
  },
  {
    slug: "lhomme-ideal",
    name: "L'Homme Ideal",
    brand: "Guerlain",
    family: "Aromatic Fougere",
    notes: {
      top: ["Almond", "Bergamot", "Lemon"],
      heart: ["Rose", "Orange Blossom", "Cherry Blossom"],
      base: ["Tonka Bean", "Leather", "Vanilla", "Cedar"],
    },
    facets: { freshness: 5, sweetness: 7, warmth: 7, woodyDepth: 5, longevity: 6, sillage: 6 },
    longevityHoursRange: [5, 7],
    sillageLabel: "Moderate",
    priceUsd: 110,
    bottleMl: 100,
    concentration: "Eau de Toilette",
    affiliateLinkId: "original-lhomme-ideal",
  },
  {
    slug: "mon-guerlain",
    name: "Mon Guerlain",
    brand: "Guerlain",
    family: "Oriental Floral",
    notes: {
      top: ["Lavender", "Bergamot"],
      heart: ["Jasmine", "Iris"],
      base: ["Vanilla", "Sandalwood", "Coumarin"],
    },
    facets: { freshness: 5, sweetness: 8, warmth: 7, woodyDepth: 4, longevity: 7, sillage: 6 },
    longevityHoursRange: [6, 8],
    sillageLabel: "Strong",
    priceUsd: 122,
    bottleMl: 100,
    concentration: "Eau de Parfum",
    affiliateLinkId: "original-mon-guerlain",
  },
];
