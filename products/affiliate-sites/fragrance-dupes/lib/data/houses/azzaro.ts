import type { ReferenceFragrance } from "@/lib/types";

/** Azzaro. See lib/data/references.ts for data-accuracy caveats. */
export const AZZARO: ReferenceFragrance[] = [
  {
    slug: "wanted",
    name: "Wanted",
    brand: "Azzaro",
    family: "Woody Spicy",
    notes: {
      top: ["Lemon", "Ginger", "Mint"],
      heart: ["Cardamom", "Juniper", "Lavender"],
      base: ["Tonka Bean", "Vetiver", "Amberwood"],
    },
    facets: { freshness: 7, sweetness: 5, warmth: 6, woodyDepth: 6, longevity: 6, sillage: 6 },
    longevityHoursRange: [5, 7],
    sillageLabel: "Moderate",
    priceUsd: 96,
    bottleMl: 100,
    concentration: "Eau de Toilette",
    affiliateLinkId: "original-wanted",
  },
  {
    slug: "the-most-wanted",
    name: "The Most Wanted",
    brand: "Azzaro",
    family: "Oriental Woody",
    notes: {
      top: ["Ginger", "Cardamom"],
      heart: ["Liquor Accord", "Toffee"],
      base: ["Amberwood", "Vanilla"],
    },
    facets: { freshness: 4, sweetness: 8, warmth: 8, woodyDepth: 6, longevity: 8, sillage: 8 },
    longevityHoursRange: [7, 10],
    sillageLabel: "Beast Mode",
    priceUsd: 110,
    bottleMl: 100,
    concentration: "Eau de Parfum",
    affiliateLinkId: "original-the-most-wanted",
  },
  {
    slug: "chrome",
    name: "Chrome",
    brand: "Azzaro",
    family: "Citrus Aromatic",
    notes: {
      top: ["Lemon", "Bergamot", "Pineapple", "Rosemary"],
      heart: ["Jasmine", "Coriander", "Cyclamen", "Oakmoss"],
      base: ["Musk", "Sandalwood", "Cedar", "Tonka Bean"],
    },
    facets: { freshness: 9, sweetness: 3, warmth: 3, woodyDepth: 4, longevity: 5, sillage: 5 },
    longevityHoursRange: [4, 6],
    sillageLabel: "Moderate",
    priceUsd: 88,
    bottleMl: 100,
    concentration: "Eau de Toilette",
    affiliateLinkId: "original-chrome",
  },
];
