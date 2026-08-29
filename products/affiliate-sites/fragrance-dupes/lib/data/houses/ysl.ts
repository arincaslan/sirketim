import type { ReferenceFragrance } from "@/lib/types";

/**
 * Yves Saint Laurent. See lib/data/references.ts for data-accuracy caveats.
 *
 * Black Opium moved here from other.ts (2026-08-29) once the house crossed
 * the 3-entry threshold that splits a house into its own file.
 *
 * MYSLF (2023) was on the initial expansion list and was deliberately
 * skipped: it is recent enough that this session could not reach the
 * confidence bar the rest of this catalog holds for its exact note pyramid
 * (live verification also failed - every fragrance database/retailer
 * fetch attempted this session returned 403 or empty JS-rendered content).
 * Add it once its note structure can be confidently sourced rather than
 * reconstructed from marketing copy.
 */
export const YSL: ReferenceFragrance[] = [
  {
    slug: "black-opium",
    name: "Black Opium",
    brand: "Yves Saint Laurent",
    family: "Gourmand Oriental",
    notes: {
      top: ["Pear", "Pink Pepper", "Orange Blossom"],
      heart: ["Coffee", "Jasmine", "Bitter Almond"],
      base: ["Vanilla", "Patchouli", "Cedar"],
    },
    facets: { freshness: 3, sweetness: 8, warmth: 6, woodyDepth: 3, longevity: 8, sillage: 8 },
    longevityHoursRange: [8, 10],
    sillageLabel: "Beast Mode",
    priceUsd: 168,
    bottleMl: 90,
    concentration: "Eau de Parfum",
    affiliateLinkId: "original-black-opium",
  },
  {
    slug: "libre",
    name: "Libre",
    brand: "Yves Saint Laurent",
    family: "Aromatic Floral",
    notes: {
      top: ["Mandarin Orange", "Lavender"],
      heart: ["Lavender", "Orange Blossom", "Jasmine Sambac"],
      base: ["Musk", "Vanilla", "Ambergris", "Cedar"],
    },
    facets: { freshness: 5, sweetness: 6, warmth: 6, woodyDepth: 3, longevity: 7, sillage: 7 },
    longevityHoursRange: [6, 9],
    sillageLabel: "Strong",
    priceUsd: 98,
    bottleMl: 50,
    concentration: "Eau de Parfum",
    affiliateLinkId: "original-libre",
  },
  {
    slug: "y",
    name: "Y",
    brand: "Yves Saint Laurent",
    family: "Woody Aromatic",
    notes: {
      top: ["Apple", "Bergamot", "Ginger"],
      heart: ["Sage", "Juniper Berries", "Geranium"],
      base: ["Tonka Bean", "Cedar", "Amberwood"],
    },
    facets: { freshness: 7, sweetness: 3, warmth: 4, woodyDepth: 5, longevity: 7, sillage: 6 },
    longevityHoursRange: [6, 8],
    sillageLabel: "Strong",
    priceUsd: 92,
    bottleMl: 60,
    concentration: "Eau de Parfum",
    affiliateLinkId: "original-y",
  },
  {
    slug: "l-homme",
    name: "L'Homme",
    brand: "Yves Saint Laurent",
    family: "Aromatic Fresh",
    notes: {
      top: ["Bergamot", "Spearmint", "Ginger"],
      heart: ["Jasmine", "Tea Accord"],
      base: ["Tonka Bean", "Vetiver", "Cedar", "Incense"],
    },
    facets: { freshness: 6, sweetness: 3, warmth: 4, woodyDepth: 5, longevity: 6, sillage: 5 },
    longevityHoursRange: [5, 7],
    sillageLabel: "Moderate",
    priceUsd: 88,
    bottleMl: 60,
    concentration: "Eau de Toilette",
    affiliateLinkId: "original-l-homme",
  },
  {
    slug: "mon-paris",
    name: "Mon Paris",
    brand: "Yves Saint Laurent",
    family: "Floral Fruity",
    notes: {
      top: ["Strawberry", "Raspberry", "Pear"],
      heart: ["Peony", "Jasmine Sambac", "Orange Blossom"],
      base: ["Patchouli", "White Musk", "Ambergris"],
    },
    facets: { freshness: 3, sweetness: 8, warmth: 6, woodyDepth: 2, longevity: 7, sillage: 7 },
    longevityHoursRange: [6, 8],
    sillageLabel: "Strong",
    priceUsd: 98,
    bottleMl: 50,
    concentration: "Eau de Parfum",
    affiliateLinkId: "original-mon-paris",
  },
];
