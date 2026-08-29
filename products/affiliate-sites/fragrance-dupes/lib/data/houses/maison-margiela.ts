import type { ReferenceFragrance } from "@/lib/types";

/** Maison Margiela (the "Replica" line). See lib/data/references.ts for
 *  data-accuracy caveats. */
export const MAISON_MARGIELA: ReferenceFragrance[] = [
  {
    slug: "jazz-club",
    name: "Jazz Club",
    brand: "Maison Margiela",
    family: "Oriental Spicy",
    notes: {
      top: ["Italian Lemon", "Pink Pepper"],
      heart: ["Clary Sage", "Rum Absolute"],
      base: ["Vanilla", "Tobacco Leaf", "Guaiac Wood"],
    },
    facets: { freshness: 2, sweetness: 6, warmth: 7, woodyDepth: 5, longevity: 6, sillage: 5 },
    longevityHoursRange: [5, 7],
    sillageLabel: "Moderate",
    priceUsd: 150,
    bottleMl: 100,
    concentration: "Eau de Toilette",
    affiliateLinkId: "original-jazz-club",
  },
  {
    slug: "by-the-fireplace",
    name: "By the Fireplace",
    brand: "Maison Margiela",
    family: "Gourmand Woody",
    notes: {
      top: ["Pink Pepper", "Clove"],
      heart: ["Chestnut"],
      base: ["Vanilla", "Guaiac Wood", "Cashmeran"],
    },
    facets: { freshness: 1, sweetness: 7, warmth: 8, woodyDepth: 6, longevity: 6, sillage: 5 },
    longevityHoursRange: [5, 7],
    sillageLabel: "Moderate",
    priceUsd: 150,
    bottleMl: 100,
    concentration: "Eau de Toilette",
    affiliateLinkId: "original-by-the-fireplace",
  },
  {
    slug: "beach-walk",
    name: "Beach Walk",
    brand: "Maison Margiela",
    family: "Aquatic Floral",
    notes: {
      top: ["Grapefruit", "Lemon"],
      heart: ["Coconut", "Ylang-Ylang"],
      base: ["Musk", "Cedarwood"],
    },
    facets: { freshness: 7, sweetness: 5, warmth: 3, woodyDepth: 2, longevity: 5, sillage: 4 },
    longevityHoursRange: [4, 6],
    sillageLabel: "Moderate",
    priceUsd: 150,
    bottleMl: 100,
    concentration: "Eau de Toilette",
    affiliateLinkId: "original-beach-walk",
  },
];
