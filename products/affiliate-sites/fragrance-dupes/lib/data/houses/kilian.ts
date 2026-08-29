import type { ReferenceFragrance } from "@/lib/types";

/** By Kilian. See lib/data/references.ts for data-accuracy caveats. */
export const KILIAN: ReferenceFragrance[] = [
  {
    slug: "love-dont-be-shy",
    name: "Love, Don't Be Shy",
    brand: "By Kilian",
    family: "Oriental Vanilla",
    notes: {
      top: ["Bergamot"],
      heart: ["Orange Blossom", "Jasmine", "Marshmallow"],
      base: ["Vanilla Bourbon", "Sandalwood", "Musk"],
    },
    facets: { freshness: 2, sweetness: 9, warmth: 7, woodyDepth: 3, longevity: 8, sillage: 7 },
    longevityHoursRange: [7, 9],
    sillageLabel: "Strong",
    priceUsd: 250,
    bottleMl: 50,
    concentration: "Eau de Parfum",
    affiliateLinkId: "original-love-dont-be-shy",
  },
  {
    slug: "angels-share",
    name: "Angels' Share",
    brand: "By Kilian",
    family: "Woody Oriental",
    notes: {
      top: ["Cognac"],
      heart: ["Cinnamon", "Tonka Bean", "Oak"],
      base: ["Sandalwood", "Vanilla", "Oak Wood"],
    },
    facets: { freshness: 1, sweetness: 8, warmth: 8, woodyDepth: 6, longevity: 8, sillage: 7 },
    longevityHoursRange: [7, 9],
    sillageLabel: "Strong",
    priceUsd: 250,
    bottleMl: 50,
    concentration: "Eau de Parfum",
    affiliateLinkId: "original-angels-share",
  },
  {
    slug: "straight-to-heaven",
    name: "Straight to Heaven",
    brand: "By Kilian",
    family: "Leather Spicy",
    notes: {
      top: ["Bulgarian Rose", "Black Currant", "Rum"],
      heart: ["Jasmine", "Patchouli"],
      base: ["Leather", "Amber", "Musk"],
    },
    facets: { freshness: 1, sweetness: 6, warmth: 8, woodyDepth: 6, longevity: 8, sillage: 7 },
    longevityHoursRange: [7, 9],
    sillageLabel: "Strong",
    priceUsd: 250,
    bottleMl: 50,
    concentration: "Eau de Parfum",
    affiliateLinkId: "original-straight-to-heaven",
  },
];
