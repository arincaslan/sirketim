import type { ReferenceFragrance } from "@/lib/types";

/** Byredo. See lib/data/references.ts for data-accuracy caveats. */
export const BYREDO: ReferenceFragrance[] = [
  {
    slug: "gypsy-water",
    name: "Gypsy Water",
    brand: "Byredo",
    family: "Fresh Woody",
    notes: {
      top: ["Bergamot", "Lemon", "Juniper Berries", "Pepper"],
      heart: ["Incense", "Pine Needles", "Orange Blossom"],
      base: ["Vanilla", "Sandalwood", "Amber", "Musk"],
    },
    facets: { freshness: 6, sweetness: 3, warmth: 4, woodyDepth: 5, longevity: 5, sillage: 4 },
    longevityHoursRange: [4, 6],
    sillageLabel: "Moderate",
    priceUsd: 220,
    bottleMl: 100,
    concentration: "Eau de Parfum",
    affiliateLinkId: "original-gypsy-water",
  },
  {
    slug: "mojave-ghost",
    name: "Mojave Ghost",
    brand: "Byredo",
    family: "Woody Floral",
    notes: {
      top: ["Cotton Flower", "Ambrette"],
      heart: ["Sandalwood", "Magnolia", "Jasmine"],
      base: ["Musk", "Amber", "Cedarwood"],
    },
    facets: { freshness: 4, sweetness: 3, warmth: 4, woodyDepth: 5, longevity: 5, sillage: 3 },
    longevityHoursRange: [4, 6],
    sillageLabel: "Intimate",
    priceUsd: 220,
    bottleMl: 100,
    concentration: "Eau de Parfum",
    affiliateLinkId: "original-mojave-ghost",
  },
  {
    slug: "bal-dafrique",
    name: "Bal d'Afrique",
    brand: "Byredo",
    family: "Citrus Aromatic",
    notes: {
      top: ["Bergamot", "Lemon", "Neroli", "African Marigold"],
      heart: ["Violet", "Jasmine", "Cyclamen"],
      base: ["Vetiver", "Musk", "Cedarwood"],
    },
    facets: { freshness: 6, sweetness: 3, warmth: 4, woodyDepth: 5, longevity: 5, sillage: 4 },
    longevityHoursRange: [4, 6],
    sillageLabel: "Moderate",
    priceUsd: 220,
    bottleMl: 100,
    concentration: "Eau de Parfum",
    affiliateLinkId: "original-bal-dafrique",
  },
];
