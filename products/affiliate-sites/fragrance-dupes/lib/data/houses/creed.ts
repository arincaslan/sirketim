import type { ReferenceFragrance } from "@/lib/types";

/** Creed. See lib/data/references.ts for data-accuracy caveats. */
export const CREED: ReferenceFragrance[] = [
  {
    slug: "aventus",
    name: "Aventus",
    brand: "Creed",
    family: "Fruity Chypre",
    notes: {
      top: ["Pineapple", "Bergamot", "Black Currant", "Apple"],
      heart: ["Birch", "Patchouli", "Jasmine", "Rose"],
      base: ["Musk", "Oakmoss", "Ambergris", "Vanilla"],
    },
    facets: { freshness: 7, sweetness: 6, warmth: 6, woodyDepth: 7, longevity: 8, sillage: 8 },
    longevityHoursRange: [7, 10],
    sillageLabel: "Beast Mode",
    priceUsd: 445,
    bottleMl: 100,
    concentration: "Eau de Parfum",
    affiliateLinkId: "original-aventus",
  },
  {
    slug: "green-irish-tweed",
    name: "Green Irish Tweed",
    brand: "Creed",
    family: "Fougere",
    notes: {
      top: ["Lemon Verbena", "Peppermint"],
      heart: ["Violet Leaf", "Iris"],
      base: ["Sandalwood", "Ambergris"],
    },
    facets: { freshness: 9, sweetness: 2, warmth: 3, woodyDepth: 6, longevity: 7, sillage: 6 },
    longevityHoursRange: [6, 9],
    sillageLabel: "Strong",
    priceUsd: 400,
    bottleMl: 100,
    concentration: "Eau de Parfum",
    affiliateLinkId: "original-green-irish-tweed",
  },
  {
    slug: "silver-mountain-water",
    name: "Silver Mountain Water",
    brand: "Creed",
    family: "Fresh Woody",
    notes: {
      top: ["Bergamot", "Mandarin"],
      heart: ["Green Tea", "Black Currant"],
      base: ["Musk", "Sandalwood", "Petitgrain"],
    },
    facets: { freshness: 9, sweetness: 3, warmth: 2, woodyDepth: 5, longevity: 6, sillage: 6 },
    longevityHoursRange: [5, 8],
    sillageLabel: "Strong",
    priceUsd: 400,
    bottleMl: 100,
    concentration: "Eau de Parfum",
    affiliateLinkId: "original-silver-mountain-water",
  },
  {
    slug: "virgin-island-water",
    name: "Virgin Island Water",
    brand: "Creed",
    family: "Citrus Tropical",
    notes: {
      top: ["Coconut", "Lime", "Sugar Cane", "Mandarin", "Bergamot"],
      heart: ["White Rum", "Ylang-Ylang", "Ginger"],
      base: ["Musk", "Jasmine", "Copra"],
    },
    facets: { freshness: 8, sweetness: 7, warmth: 4, woodyDepth: 2, longevity: 6, sillage: 6 },
    longevityHoursRange: [5, 8],
    sillageLabel: "Strong",
    priceUsd: 400,
    bottleMl: 100,
    concentration: "Eau de Parfum",
    affiliateLinkId: "original-virgin-island-water",
  },
  {
    slug: "millesime-imperial",
    name: "Millesime Imperial",
    brand: "Creed",
    family: "Fresh Woody",
    notes: {
      top: ["Sea Salt", "Bergamot", "Lemon"],
      heart: ["Iris", "Musk"],
      base: ["Sandalwood", "Sea Notes"],
    },
    facets: { freshness: 9, sweetness: 4, warmth: 3, woodyDepth: 5, longevity: 6, sillage: 6 },
    longevityHoursRange: [5, 8],
    sillageLabel: "Strong",
    priceUsd: 430,
    bottleMl: 100,
    concentration: "Eau de Parfum",
    affiliateLinkId: "original-millesime-imperial",
  },
  {
    slug: "royal-oud",
    name: "Royal Oud",
    brand: "Creed",
    family: "Woody Spicy",
    notes: {
      top: ["Pink Pepper", "Bergamot", "Lemon"],
      heart: ["Oud", "Cedar", "Angelica"],
      base: ["Sandalwood", "Musk", "Vetiver"],
    },
    facets: { freshness: 5, sweetness: 3, warmth: 6, woodyDepth: 9, longevity: 7, sillage: 7 },
    longevityHoursRange: [6, 9],
    sillageLabel: "Strong",
    priceUsd: 470,
    bottleMl: 100,
    concentration: "Eau de Parfum",
    affiliateLinkId: "original-royal-oud",
  },
  {
    slug: "viking",
    name: "Viking",
    brand: "Creed",
    family: "Woody Aromatic",
    notes: {
      top: ["Pink Pepper", "Bergamot", "Lavender"],
      heart: ["Rose", "Peppermint", "Sichuan Pepper"],
      base: ["Vetiver", "Sandalwood", "Birch"],
    },
    facets: { freshness: 7, sweetness: 3, warmth: 6, woodyDepth: 7, longevity: 7, sillage: 7 },
    longevityHoursRange: [6, 9],
    sillageLabel: "Strong",
    priceUsd: 445,
    bottleMl: 100,
    concentration: "Eau de Parfum",
    affiliateLinkId: "original-viking",
  },
  {
    slug: "love-in-white",
    name: "Love in White",
    brand: "Creed",
    family: "Floral Woody",
    notes: {
      top: ["Rice Husk", "Iris", "Daffodil"],
      heart: ["Orange Zest", "Magnolia"],
      base: ["Sandalwood", "Vanilla", "Amber"],
    },
    facets: { freshness: 6, sweetness: 6, warmth: 5, woodyDepth: 5, longevity: 6, sillage: 6 },
    longevityHoursRange: [5, 8],
    sillageLabel: "Strong",
    priceUsd: 400,
    bottleMl: 75,
    concentration: "Eau de Parfum",
    affiliateLinkId: "original-love-in-white",
  },
  {
    slug: "spring-flower",
    name: "Spring Flower",
    brand: "Creed",
    family: "Floral Fruity",
    notes: {
      top: ["Melon", "Peach", "Apple", "Bergamot"],
      heart: ["Rose", "Jasmine", "Carnation"],
      base: ["Musk", "Ambergris", "Vanilla"],
    },
    facets: { freshness: 7, sweetness: 7, warmth: 4, woodyDepth: 3, longevity: 6, sillage: 6 },
    longevityHoursRange: [5, 7],
    sillageLabel: "Moderate",
    priceUsd: 295,
    bottleMl: 75,
    concentration: "Eau de Parfum",
    affiliateLinkId: "original-spring-flower",
  },

  /* ── Added 2026-09-07, from the FragranceShop.com (CJ) buy-link scope ──────
   * Note pyramids were RESEARCHED per fragrance, not written from memory and
   * not taken from the feed — that feed has no note data whatsoever, its
   * DESCRIPTION column being byte-identical to TITLE on all 5,802 rows.
   * Facets remain editorial estimates, the same convention as every entry
   * above (see lib/data/references.ts).
   *
   * `priceUsd`/`bottleMl` are the RETAILER'S listed figures for the bottle
   * they actually stock, which is why some are unusual sizes (Samsara 30ml,
   * Himalaya 250ml). That is a departure from the approximate-retail figures
   * above and is deliberate: these entries exist because we can link them, so
   * the price that matters is the one at the far end of that link.
   *
   * Three researched candidates were DROPPED rather than guessed: J'adore
   * L'Or (sources give marketing prose, no tiered pyramid), Versace Vanitas
   * (sources conflate the 2011 EDP with the 2012 EDT) and Creed Royal Water
   * (sources openly disagree on the heart and base). Sauvage Parfum was
   * dropped for a different reason worth knowing — this merchant sells every
   * Sauvage concentration as a SIZE VARIANT of one product page, so it cannot
   * be told apart from Sauvage EDT by any feed-driven matcher.
   */
  {
    slug: "original-santal",
    name: "Original Santal",
    brand: "Creed",
    family: "Oriental Woody",
    notes: {
      top: ["Juniper Berries", "Coriander", "Ginger", "Rosemary", "Bergamot", "Mandarin Orange"],
      heart: ["Sandalwood", "Lavender", "Geranium", "Orange Blossom"],
      base: ["Tonka Bean", "Musk", "Cedar", "Oakmoss"],
    },
    facets: { freshness: 5, sweetness: 6, warmth: 7, woodyDepth: 7, longevity: 7, sillage: 6 },
    longevityHoursRange: [6, 8],
    sillageLabel: "Strong",
    priceUsd: 230.95,
    bottleMl: 100,
    concentration: "Eau de Parfum",
    affiliateLinkId: "original-original-santal",
  },
  {
    slug: "himalaya",
    name: "Himalaya",
    brand: "Creed",
    family: "Woody",
    notes: {
      top: ["Calabrian Bergamot", "Grapefruit", "Sicilian Lemon"],
      heart: ["Sandalwood"],
      base: ["Musk", "Ambergris", "Cedar"],
    },
    facets: { freshness: 7, sweetness: 2, warmth: 5, woodyDepth: 7, longevity: 6, sillage: 5 },
    longevityHoursRange: [5, 7],
    sillageLabel: "Moderate",
    priceUsd: 437.95,
    bottleMl: 250,
    concentration: "Eau de Parfum",
    affiliateLinkId: "original-himalaya",
  },
  {
    slug: "neroli-sauvage",
    name: "Neroli Sauvage",
    brand: "Creed",
    family: "Citrus Aromatic",
    notes: {
      top: ["Bergamot", "Grapefruit"],
      heart: ["Verbena", "Neroli"],
      base: ["Ambergris"],
    },
    facets: { freshness: 9, sweetness: 2, warmth: 3, woodyDepth: 2, longevity: 4, sillage: 4 },
    longevityHoursRange: [3, 5],
    sillageLabel: "Moderate",
    priceUsd: 219.95,
    bottleMl: 100,
    concentration: "Eau de Parfum",
    affiliateLinkId: "original-neroli-sauvage",
  },
];
