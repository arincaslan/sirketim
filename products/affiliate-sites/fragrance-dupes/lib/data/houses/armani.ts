import type { ReferenceFragrance } from "@/lib/types";

/** Giorgio Armani / Emporio Armani. See lib/data/references.ts for caveats. */
export const ARMANI: ReferenceFragrance[] = [
  {
    slug: "acqua-di-gio",
    name: "Acqua di Gio",
    brand: "Armani",
    family: "Aquatic Aromatic",
    notes: {
      top: ["Lime", "Lemon", "Bergamot", "Neroli"],
      heart: ["Sea Notes", "Jasmine", "Rosemary", "Peach"],
      base: ["White Musk", "Cedar", "Oakmoss", "Patchouli", "Amber"],
    },
    facets: { freshness: 9, sweetness: 2, warmth: 2, woodyDepth: 4, longevity: 5, sillage: 5 },
    longevityHoursRange: [4, 6],
    sillageLabel: "Moderate",
    priceUsd: 100,
    bottleMl: 100,
    concentration: "Eau de Toilette",
    affiliateLinkId: "original-acqua-di-gio",
  },
  {
    slug: "acqua-di-gio-profumo",
    name: "Acqua di Gio Profumo",
    brand: "Armani",
    family: "Aquatic Woody",
    notes: {
      top: ["Bergamot"],
      heart: ["Sea Notes", "Geranium", "Sage", "Rosemary"],
      base: ["Patchouli", "Incense"],
    },
    facets: { freshness: 8, sweetness: 2, warmth: 5, woodyDepth: 7, longevity: 8, sillage: 7 },
    longevityHoursRange: [7, 10],
    sillageLabel: "Strong",
    priceUsd: 120,
    bottleMl: 75,
    concentration: "Eau de Parfum",
    affiliateLinkId: "original-acqua-di-gio-profumo",
  },
  {
    slug: "armani-code",
    name: "Armani Code",
    brand: "Armani",
    family: "Oriental Woody",
    notes: {
      top: ["Bergamot", "Lemon"],
      heart: ["Olive Blossom", "Star Anise"],
      base: ["Tonka Bean", "Tobacco", "Leather"],
    },
    facets: { freshness: 4, sweetness: 6, warmth: 7, woodyDepth: 5, longevity: 7, sillage: 6 },
    longevityHoursRange: [6, 8],
    sillageLabel: "Strong",
    priceUsd: 110,
    bottleMl: 75,
    concentration: "Eau de Toilette",
    affiliateLinkId: "original-armani-code",
  },
  {
    slug: "armani-code-profumo",
    name: "Armani Code Profumo",
    brand: "Armani",
    family: "Oriental Spicy",
    notes: {
      top: ["Cardamom", "Mandarin"],
      heart: ["Orange Blossom", "Nutmeg", "Lavender"],
      base: ["Tonka Bean", "Amber", "Leather"],
    },
    facets: { freshness: 3, sweetness: 7, warmth: 8, woodyDepth: 6, longevity: 8, sillage: 8 },
    longevityHoursRange: [8, 11],
    sillageLabel: "Beast Mode",
    priceUsd: 120,
    bottleMl: 110,
    concentration: "Eau de Parfum",
    affiliateLinkId: "original-armani-code-profumo",
  },
  {
    slug: "stronger-with-you",
    name: "Stronger With You",
    brand: "Armani",
    family: "Gourmand Woody",
    notes: {
      top: ["Cardamom", "Pink Pepper", "Violet Leaf", "Melon"],
      heart: ["Sage", "Lavender", "Cinnamon"],
      base: ["Chestnut", "Vanilla", "Amberwood", "Suede"],
    },
    facets: { freshness: 4, sweetness: 8, warmth: 7, woodyDepth: 5, longevity: 7, sillage: 7 },
    longevityHoursRange: [6, 9],
    sillageLabel: "Strong",
    priceUsd: 95,
    bottleMl: 100,
    concentration: "Eau de Toilette",
    affiliateLinkId: "original-stronger-with-you",
  },
  {
    slug: "armani-si",
    name: "Si",
    brand: "Armani",
    family: "Chypre Fruity",
    notes: {
      top: ["Black Currant", "Bergamot", "Mandarin"],
      heart: ["Rose", "Freesia"],
      base: ["Vanilla", "Patchouli", "Ambroxan", "Woody Notes"],
    },
    facets: { freshness: 5, sweetness: 7, warmth: 6, woodyDepth: 5, longevity: 7, sillage: 7 },
    longevityHoursRange: [6, 9],
    sillageLabel: "Strong",
    priceUsd: 130,
    bottleMl: 100,
    concentration: "Eau de Parfum",
    affiliateLinkId: "original-armani-si",
  },
  {
    slug: "my-way",
    name: "My Way",
    brand: "Armani",
    family: "Floral",
    notes: {
      top: ["Orange Blossom", "Bergamot"],
      heart: ["Tuberose", "Jasmine"],
      base: ["White Musk", "Vanilla", "Cedar"],
    },
    facets: { freshness: 6, sweetness: 6, warmth: 4, woodyDepth: 3, longevity: 6, sillage: 6 },
    longevityHoursRange: [5, 8],
    sillageLabel: "Strong",
    priceUsd: 130,
    bottleMl: 90,
    concentration: "Eau de Parfum",
    affiliateLinkId: "original-my-way",
  },
  {
    slug: "bois-dencens",
    name: "Prive Bois d'Encens",
    brand: "Armani",
    family: "Woody Incense",
    notes: {
      top: ["Incense", "Bergamot"],
      heart: ["Frankincense", "Cedar"],
      base: ["Vetiver", "Amber", "Musk"],
    },
    facets: { freshness: 4, sweetness: 2, warmth: 6, woodyDepth: 8, longevity: 7, sillage: 6 },
    longevityHoursRange: [6, 9],
    sillageLabel: "Strong",
    priceUsd: 290,
    bottleMl: 100,
    concentration: "Eau de Toilette",
    affiliateLinkId: "original-bois-dencens",
  },
  {
    slug: "because-its-you",
    name: "Because It's You",
    brand: "Armani",
    family: "Floral Fruity",
    notes: {
      top: ["Raspberry", "Pink Pepper", "Bergamot"],
      heart: ["Rose", "Jasmine", "Orange Blossom"],
      base: ["Vanilla", "Musk", "Patchouli"],
    },
    facets: { freshness: 5, sweetness: 8, warmth: 6, woodyDepth: 3, longevity: 7, sillage: 6 },
    longevityHoursRange: [6, 8],
    sillageLabel: "Strong",
    priceUsd: 130,
    bottleMl: 100,
    concentration: "Eau de Parfum",
    affiliateLinkId: "original-because-its-you",
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
    slug: "acqua-di-gio-profondo",
    name: "Acqua di Gio Profondo",
    brand: "Armani",
    family: "Aquatic Aromatic",
    notes: {
      top: ["Marine Notes", "Aquozone", "Bergamot", "Green Mandarin"],
      heart: ["Rosemary", "Lavender", "Cypress", "Mastic"],
      base: ["Mineral Notes", "Musk", "Patchouli", "Amber"],
    },
    facets: { freshness: 9, sweetness: 1, warmth: 3, woodyDepth: 5, longevity: 7, sillage: 6 },
    longevityHoursRange: [6, 9],
    sillageLabel: "Strong",
    priceUsd: 128.95,
    bottleMl: 200,
    concentration: "Eau de Parfum",
    affiliateLinkId: "original-acqua-di-gio-profondo",
  },
];
