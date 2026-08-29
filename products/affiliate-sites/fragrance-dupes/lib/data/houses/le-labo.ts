import type { ReferenceFragrance } from "@/lib/types";

/**
 * Le Labo. See lib/data/references.ts for data-accuracy caveats.
 *
 * Santal 33 moved here from other.ts (2026-08-29) once the house crossed
 * the 3-entry threshold that splits a house into its own file.
 */
export const LE_LABO: ReferenceFragrance[] = [
  {
    slug: "santal-33",
    name: "Santal 33",
    brand: "Le Labo",
    family: "Woody",
    notes: {
      top: ["Cardamom", "Violet", "Iris"],
      heart: ["Sandalwood", "Papyrus"],
      base: ["Leather", "Cedarwood", "Musk"],
    },
    facets: { freshness: 4, sweetness: 3, warmth: 5, woodyDepth: 9, longevity: 7, sillage: 6 },
    longevityHoursRange: [6, 8],
    sillageLabel: "Strong",
    priceUsd: 210,
    bottleMl: 50,
    concentration: "Eau de Parfum",
    affiliateLinkId: "original-santal-33",
  },
  {
    slug: "another-13",
    name: "Another 13",
    brand: "Le Labo",
    family: "Woody Amber",
    notes: {
      top: ["Bergamot", "Musk"],
      heart: ["Jasmine", "Orange Blossom", "Sea Notes"],
      base: ["Ambroxan", "Musk", "Cedar"],
    },
    facets: { freshness: 5, sweetness: 3, warmth: 4, woodyDepth: 4, longevity: 6, sillage: 4 },
    longevityHoursRange: [5, 7],
    sillageLabel: "Moderate",
    priceUsd: 196,
    bottleMl: 50,
    concentration: "Eau de Parfum",
    affiliateLinkId: "original-another-13",
  },
  {
    slug: "rose-31",
    name: "Rose 31",
    brand: "Le Labo",
    family: "Woody Floral",
    notes: {
      top: ["Coriander", "Cumin"],
      heart: ["Rose", "Cedar"],
      base: ["Amber", "Musk", "Vetiver", "Olibanum"],
    },
    facets: { freshness: 3, sweetness: 2, warmth: 5, woodyDepth: 7, longevity: 7, sillage: 5 },
    longevityHoursRange: [6, 8],
    sillageLabel: "Moderate",
    priceUsd: 196,
    bottleMl: 50,
    concentration: "Eau de Parfum",
    affiliateLinkId: "original-rose-31",
  },
  {
    slug: "the-noir-29",
    name: "The Noir 29",
    brand: "Le Labo",
    family: "Oriental Woody",
    notes: {
      top: ["Cardamom", "Bergamot"],
      heart: ["Black Tea", "Musk"],
      base: ["Tonka Bean", "Vetiver", "Amber"],
    },
    facets: { freshness: 3, sweetness: 4, warmth: 6, woodyDepth: 5, longevity: 6, sillage: 5 },
    longevityHoursRange: [5, 7],
    sillageLabel: "Moderate",
    priceUsd: 196,
    bottleMl: 50,
    concentration: "Eau de Parfum",
    affiliateLinkId: "original-the-noir-29",
  },
];
