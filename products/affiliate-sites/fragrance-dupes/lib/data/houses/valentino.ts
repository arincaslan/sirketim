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
    slug: "born-in-roma-donna",
    name: "Donna Born in Roma",
    brand: "Valentino",
    family: "Floral Woody",
    notes: {
      top: ["Bergamot", "Pink Pepper", "Black Currant"],
      heart: ["Jasmine Tea", "Jasmine Sambac", "Jasmine"],
      base: ["Cashmeran", "Guaiac Wood", "Vanilla"],
    },
    facets: { freshness: 5, sweetness: 5, warmth: 5, woodyDepth: 6, longevity: 7, sillage: 7 },
    longevityHoursRange: [6, 9],
    sillageLabel: "Strong",
    priceUsd: 114.95,
    bottleMl: 100,
    concentration: "Eau de Parfum",
    affiliateLinkId: "original-born-in-roma-donna",
  },
];
