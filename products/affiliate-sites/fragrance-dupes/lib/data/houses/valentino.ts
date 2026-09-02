import type { ReferenceFragrance } from "@/lib/types";

/** Valentino. See lib/data/references.ts for data-accuracy caveats. */
export const VALENTINO: ReferenceFragrance[] = [
  {
    slug: "valentino-uomo",
    name: "Uomo",
    brand: "Valentino",
    family: "Oriental Woody",
    notes: {
      top: ["Bergamot", "Myrtle"],
      heart: ["Iris", "Coffee"],
      base: ["Leather", "Cedar", "Hazelnut", "Gianduia Cream"],
    },
    facets: { freshness: 4, sweetness: 7, warmth: 7, woodyDepth: 6, longevity: 7, sillage: 6 },
    longevityHoursRange: [6, 8],
    sillageLabel: "Strong",
    priceUsd: 118,
    bottleMl: 100,
    concentration: "Eau de Toilette",
    affiliateLinkId: "original-valentino-uomo",
  },
  {
    slug: "voce-viva",
    name: "Voce Viva",
    brand: "Valentino",
    family: "Floral Vanilla",
    notes: {
      top: ["Bergamot", "Mandarin"],
      heart: ["Orange Blossom", "Gardenia"],
      base: ["Vanilla", "Crystal Moss"],
    },
    facets: { freshness: 5, sweetness: 8, warmth: 6, woodyDepth: 3, longevity: 7, sillage: 6 },
    longevityHoursRange: [6, 8],
    sillageLabel: "Strong",
    priceUsd: 125,
    bottleMl: 100,
    concentration: "Eau de Parfum",
    affiliateLinkId: "original-voce-viva",
  },
];
