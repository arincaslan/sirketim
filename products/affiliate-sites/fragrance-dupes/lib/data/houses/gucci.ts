import type { ReferenceFragrance } from "@/lib/types";

/** Gucci. See lib/data/references.ts for data-accuracy caveats. */
export const GUCCI: ReferenceFragrance[] = [
  {
    slug: "gucci-guilty-pour-homme",
    name: "Guilty Pour Homme",
    brand: "Gucci",
    family: "Aromatic Fougere",
    notes: {
      top: ["Pink Pepper", "Lemon", "Lavender"],
      heart: ["Orange Blossom", "Neroli", "Coriander"],
      base: ["Patchouli", "Cedar", "Amber"],
    },
    facets: { freshness: 6, sweetness: 4, warmth: 6, woodyDepth: 5, longevity: 6, sillage: 6 },
    longevityHoursRange: [5, 8],
    sillageLabel: "Strong",
    priceUsd: 110,
    bottleMl: 90,
    concentration: "Eau de Toilette",
    affiliateLinkId: "original-gucci-guilty-pour-homme",
  },
  {
    slug: "gucci-bloom",
    name: "Bloom",
    brand: "Gucci",
    family: "White Floral",
    notes: {
      top: ["Rangoon Creeper"],
      heart: ["Tuberose", "Jasmine"],
      base: ["Orris Root", "Sandalwood"],
    },
    facets: { freshness: 4, sweetness: 6, warmth: 5, woodyDepth: 4, longevity: 7, sillage: 7 },
    longevityHoursRange: [6, 9],
    sillageLabel: "Strong",
    priceUsd: 130,
    bottleMl: 100,
    concentration: "Eau de Parfum",
    affiliateLinkId: "original-gucci-bloom",
  },
  {
    slug: "flora-gorgeous-gardenia",
    name: "Flora Gorgeous Gardenia",
    brand: "Gucci",
    family: "Floral Fruity",
    notes: {
      top: ["Pear", "Red Berries"],
      heart: ["Gardenia", "Frangipani"],
      base: ["Patchouli", "Brown Sugar"],
    },
    facets: { freshness: 5, sweetness: 8, warmth: 5, woodyDepth: 3, longevity: 6, sillage: 6 },
    longevityHoursRange: [5, 7],
    sillageLabel: "Strong",
    priceUsd: 120,
    bottleMl: 100,
    concentration: "Eau de Parfum",
    affiliateLinkId: "original-flora-gorgeous-gardenia",
  },
  {
    slug: "gucci-rush",
    name: "Rush",
    brand: "Gucci",
    family: "Floral Chypre",
    notes: {
      top: ["Gardenia", "Freesia", "Peach", "Coriander"],
      heart: ["Jasmine", "Rose", "Vanilla"],
      base: ["Patchouli", "Vetiver", "Musk"],
    },
    facets: { freshness: 4, sweetness: 7, warmth: 6, woodyDepth: 5, longevity: 7, sillage: 7 },
    longevityHoursRange: [6, 9],
    sillageLabel: "Strong",
    priceUsd: 120,
    bottleMl: 75,
    concentration: "Eau de Toilette",
    affiliateLinkId: "original-gucci-rush",
  },
  {
    slug: "guilty-absolute",
    name: "Guilty Absolute",
    brand: "Gucci",
    family: "Leather Woody",
    notes: {
      top: ["Leather"],
      heart: ["Patchouli", "Vetiver"],
      base: ["Woody Notes", "Leather", "Cypress"],
    },
    facets: { freshness: 2, sweetness: 2, warmth: 7, woodyDepth: 9, longevity: 8, sillage: 7 },
    longevityHoursRange: [7, 10],
    sillageLabel: "Strong",
    priceUsd: 115,
    bottleMl: 90,
    concentration: "Eau de Parfum",
    affiliateLinkId: "original-guilty-absolute",
  },
  {
    slug: "memoire-dune-odeur",
    name: "Memoire d'une Odeur",
    brand: "Gucci",
    family: "Aromatic",
    notes: {
      top: ["Roman Chamomile", "Mineral Notes"],
      heart: ["Jasmine", "Musk"],
      base: ["Sandalwood", "Cedar", "Vanilla"],
    },
    facets: { freshness: 7, sweetness: 3, warmth: 4, woodyDepth: 5, longevity: 6, sillage: 5 },
    longevityHoursRange: [5, 7],
    sillageLabel: "Moderate",
    priceUsd: 120,
    bottleMl: 100,
    concentration: "Eau de Parfum",
    affiliateLinkId: "original-memoire-dune-odeur",
  },
  {
    slug: "gucci-intense-oud",
    name: "Intense Oud",
    brand: "Gucci",
    family: "Oriental Woody",
    notes: {
      top: ["Raspberry", "Saffron", "Bergamot"],
      heart: ["Oud", "Rose", "Incense", "Patchouli"],
      base: ["Amber", "Leather", "Castoreum"],
    },
    facets: { freshness: 2, sweetness: 5, warmth: 8, woodyDepth: 9, longevity: 9, sillage: 8 },
    longevityHoursRange: [8, 12],
    sillageLabel: "Beast Mode",
    priceUsd: 180,
    bottleMl: 90,
    concentration: "Eau de Parfum",
    affiliateLinkId: "original-gucci-intense-oud",
  },
  {
    slug: "gucci-bamboo",
    name: "Bamboo",
    brand: "Gucci",
    family: "Floral Woody",
    notes: {
      top: ["Bergamot"],
      heart: ["Casablanca Lily", "Ylang-Ylang", "Orange Blossom"],
      base: ["Sandalwood", "Amber", "Vanilla"],
    },
    facets: { freshness: 5, sweetness: 5, warmth: 5, woodyDepth: 5, longevity: 6, sillage: 5 },
    longevityHoursRange: [5, 7],
    sillageLabel: "Moderate",
    priceUsd: 110,
    bottleMl: 75,
    concentration: "Eau de Parfum",
    affiliateLinkId: "original-gucci-bamboo",
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
    slug: "gucci-guilty-oud",
    name: "Guilty Oud",
    brand: "Gucci",
    family: "Oriental Woody",
    notes: {
      top: ["Bulgarian Rose", "Blackberry", "Pink Pepper"],
      heart: ["Patchouli", "Cypriol"],
      base: ["Agarwood", "Leather", "Amber"],
    },
    facets: { freshness: 2, sweetness: 4, warmth: 8, woodyDepth: 9, longevity: 8, sillage: 8 },
    longevityHoursRange: [8, 10],
    sillageLabel: "Strong",
    priceUsd: 194.95,
    bottleMl: 90,
    concentration: "Eau de Parfum",
    affiliateLinkId: "original-gucci-guilty-oud",
  },
];
