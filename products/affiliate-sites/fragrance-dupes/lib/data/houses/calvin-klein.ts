import type { ReferenceFragrance } from "@/lib/types";

/** Calvin Klein. See lib/data/references.ts for data-accuracy caveats. */
export const CALVIN_KLEIN: ReferenceFragrance[] = [
  {
    slug: "ck-one",
    name: "CK One",
    brand: "Calvin Klein",
    family: "Citrus Aromatic",
    notes: {
      top: ["Lemon", "Bergamot", "Pineapple", "Cardamom"],
      heart: ["Nutmeg", "Violet", "Jasmine", "Lily of the Valley"],
      base: ["Musk", "Amber", "Cedar", "Oakmoss"],
    },
    facets: { freshness: 9, sweetness: 3, warmth: 3, woodyDepth: 4, longevity: 4, sillage: 4 },
    longevityHoursRange: [3, 5],
    sillageLabel: "Moderate",
    priceUsd: 62,
    bottleMl: 100,
    concentration: "Eau de Toilette",
    affiliateLinkId: "original-ck-one",
  },
  {
    slug: "eternity",
    name: "Eternity",
    brand: "Calvin Klein",
    family: "Floral Green",
    notes: {
      top: ["Freesia", "Mandarin", "Sage"],
      heart: ["Lily", "Marigold", "Violet", "Rose"],
      base: ["Sandalwood", "Patchouli", "Musk", "Amber"],
    },
    facets: { freshness: 7, sweetness: 4, warmth: 4, woodyDepth: 4, longevity: 5, sillage: 5 },
    longevityHoursRange: [4, 6],
    sillageLabel: "Moderate",
    priceUsd: 78,
    bottleMl: 100,
    concentration: "Eau de Parfum",
    affiliateLinkId: "original-eternity",
  },
  {
    slug: "obsession",
    name: "Obsession",
    brand: "Calvin Klein",
    family: "Oriental Spicy",
    notes: {
      top: ["Mandarin", "Bergamot", "Basil"],
      heart: ["Jasmine", "Orange Blossom", "Coriander"],
      base: ["Amber", "Vanilla", "Musk", "Sandalwood", "Civet"],
    },
    facets: { freshness: 3, sweetness: 7, warmth: 9, woodyDepth: 5, longevity: 7, sillage: 8 },
    longevityHoursRange: [6, 9],
    sillageLabel: "Strong",
    priceUsd: 76,
    bottleMl: 100,
    concentration: "Eau de Parfum",
    affiliateLinkId: "original-obsession",
  },
];
