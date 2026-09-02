import type { ReferenceFragrance } from "@/lib/types";

/** Carolina Herrera. See lib/data/references.ts for data-accuracy caveats. */
export const CAROLINA_HERRERA: ReferenceFragrance[] = [
  {
    slug: "very-good-girl",
    name: "Very Good Girl",
    brand: "Carolina Herrera",
    family: "Floral Fruity",
    notes: {
      top: ["Red Currant", "Cherry"],
      heart: ["Rose", "Jasmine"],
      base: ["Vetiver", "Sandalwood"],
    },
    facets: { freshness: 4, sweetness: 8, warmth: 6, woodyDepth: 4, longevity: 7, sillage: 7 },
    longevityHoursRange: [6, 8],
    sillageLabel: "Strong",
    priceUsd: 132,
    bottleMl: 80,
    concentration: "Eau de Parfum",
    affiliateLinkId: "original-very-good-girl",
  },
  {
    slug: "212-vip",
    name: "212 VIP",
    brand: "Carolina Herrera",
    family: "Oriental Vanilla",
    notes: {
      top: ["Passion Fruit", "Rum"],
      heart: ["Gardenia"],
      base: ["Musk", "Tonka Bean", "Vanilla"],
    },
    facets: { freshness: 4, sweetness: 8, warmth: 7, woodyDepth: 3, longevity: 6, sillage: 6 },
    longevityHoursRange: [5, 7],
    sillageLabel: "Strong",
    priceUsd: 110,
    bottleMl: 80,
    concentration: "Eau de Parfum",
    affiliateLinkId: "original-212-vip",
  },
  {
    slug: "bad-boy",
    name: "Bad Boy",
    brand: "Carolina Herrera",
    family: "Woody Spicy",
    notes: {
      top: ["Bergamot", "Black Pepper", "White Pepper"],
      heart: ["Sage", "Cedar"],
      base: ["Tonka Bean", "Cacao", "Amberwood"],
    },
    facets: { freshness: 5, sweetness: 6, warmth: 7, woodyDepth: 7, longevity: 7, sillage: 7 },
    longevityHoursRange: [6, 8],
    sillageLabel: "Strong",
    priceUsd: 120,
    bottleMl: 100,
    concentration: "Eau de Toilette",
    affiliateLinkId: "original-bad-boy",
  },
];
