import type { ReferenceFragrance } from "@/lib/types";

/** Guerlain. See lib/data/references.ts for data-accuracy caveats. */
export const GUERLAIN: ReferenceFragrance[] = [
  {
    slug: "shalimar",
    name: "Shalimar",
    brand: "Guerlain",
    family: "Oriental Vanilla",
    notes: {
      top: ["Bergamot", "Lemon", "Mandarin"],
      heart: ["Iris", "Jasmine", "Rose"],
      base: ["Vanilla", "Tonka Bean", "Opoponax", "Leather", "Incense"],
    },
    facets: { freshness: 3, sweetness: 8, warmth: 9, woodyDepth: 5, longevity: 8, sillage: 8 },
    longevityHoursRange: [7, 10],
    sillageLabel: "Strong",
    priceUsd: 132,
    bottleMl: 90,
    concentration: "Eau de Parfum",
    affiliateLinkId: "original-shalimar",
  },
  {
    slug: "lhomme-ideal",
    name: "L'Homme Ideal",
    brand: "Guerlain",
    family: "Aromatic Fougere",
    notes: {
      top: ["Almond", "Bergamot", "Lemon"],
      heart: ["Rose", "Orange Blossom", "Cherry Blossom"],
      base: ["Tonka Bean", "Leather", "Vanilla", "Cedar"],
    },
    facets: { freshness: 5, sweetness: 7, warmth: 7, woodyDepth: 5, longevity: 6, sillage: 6 },
    longevityHoursRange: [5, 7],
    sillageLabel: "Moderate",
    priceUsd: 110,
    bottleMl: 100,
    concentration: "Eau de Toilette",
    affiliateLinkId: "original-lhomme-ideal",
  },
  {
    slug: "mon-guerlain",
    name: "Mon Guerlain",
    brand: "Guerlain",
    family: "Oriental Floral",
    notes: {
      top: ["Lavender", "Bergamot"],
      heart: ["Jasmine", "Iris"],
      base: ["Vanilla", "Sandalwood", "Coumarin"],
    },
    facets: { freshness: 5, sweetness: 8, warmth: 7, woodyDepth: 4, longevity: 7, sillage: 6 },
    longevityHoursRange: [6, 8],
    sillageLabel: "Strong",
    priceUsd: 122,
    bottleMl: 100,
    concentration: "Eau de Parfum",
    affiliateLinkId: "original-mon-guerlain",
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
    slug: "samsara",
    name: "Samsara",
    brand: "Guerlain",
    family: "Floral Woody Musk",
    notes: {
      top: ["Ylang-Ylang", "Peach", "Bergamot", "Green Notes", "Lemon"],
      heart: ["Iris", "Jasmine", "Narcissus", "Orris Root", "Violet", "Rose"],
      base: ["Sandalwood", "Vanilla", "Iris", "Amber", "Tonka Bean", "Musk"],
    },
    facets: { freshness: 4, sweetness: 6, warmth: 7, woodyDepth: 7, longevity: 8, sillage: 8 },
    longevityHoursRange: [8, 12],
    sillageLabel: "Strong",
    priceUsd: 149.95,
    bottleMl: 30,
    concentration: "Eau de Parfum",
    affiliateLinkId: "original-samsara",
  },
];
