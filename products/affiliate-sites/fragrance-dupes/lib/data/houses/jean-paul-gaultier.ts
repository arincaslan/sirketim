import type { ReferenceFragrance } from "@/lib/types";

/** Jean Paul Gaultier. See lib/data/references.ts for data-accuracy caveats. */
export const JEAN_PAUL_GAULTIER: ReferenceFragrance[] = [
  {
    slug: "le-male",
    name: "Le Male",
    brand: "Jean Paul Gaultier",
    family: "Aromatic Fougere",
    notes: {
      top: ["Mint", "Lavender", "Bergamot", "Cardamom"],
      heart: ["Cinnamon", "Cumin", "Orange Blossom"],
      base: ["Vanilla", "Tonka Bean", "Sandalwood", "Amber"],
    },
    facets: { freshness: 5, sweetness: 8, warmth: 7, woodyDepth: 4, longevity: 7, sillage: 8 },
    longevityHoursRange: [6, 9],
    sillageLabel: "Beast Mode",
    priceUsd: 95,
    bottleMl: 125,
    concentration: "Eau de Toilette",
    affiliateLinkId: "original-le-male",
  },
  {
    slug: "le-male-le-parfum",
    name: "Le Male Le Parfum",
    brand: "Jean Paul Gaultier",
    family: "Oriental Fougere",
    notes: {
      top: ["Cardamom", "Bergamot", "Mint"],
      heart: ["Lavender"],
      base: ["Vanilla", "Tonka Bean", "Cedar", "Benzoin"],
    },
    facets: { freshness: 3, sweetness: 9, warmth: 8, woodyDepth: 5, longevity: 9, sillage: 9 },
    longevityHoursRange: [9, 12],
    sillageLabel: "Beast Mode",
    priceUsd: 115,
    bottleMl: 125,
    concentration: "Eau de Parfum",
    affiliateLinkId: "original-le-male-le-parfum",
  },
  {
    slug: "ultra-male",
    name: "Ultra Male",
    brand: "Jean Paul Gaultier",
    family: "Oriental Fougere",
    notes: {
      top: ["Pear", "Bergamot", "Mint", "Lavender"],
      heart: ["Cinnamon", "Cumin", "Caraway"],
      base: ["Vanilla", "Tonka Bean", "Amber", "Patchouli"],
    },
    facets: { freshness: 4, sweetness: 9, warmth: 8, woodyDepth: 4, longevity: 8, sillage: 9 },
    longevityHoursRange: [8, 11],
    sillageLabel: "Beast Mode",
    priceUsd: 105,
    bottleMl: 125,
    concentration: "Eau de Toilette",
    affiliateLinkId: "original-ultra-male",
  },
  {
    slug: "jpg-classique",
    name: "Classique",
    brand: "Jean Paul Gaultier",
    family: "Oriental Floral",
    notes: {
      top: ["Rose", "Orange Blossom", "Star Anise", "Mandarin"],
      heart: ["Ylang-Ylang", "Ginger", "Orchid", "Cinnamon"],
      base: ["Vanilla", "Amber", "Musk", "Sandalwood", "Tonka Bean"],
    },
    facets: { freshness: 4, sweetness: 8, warmth: 8, woodyDepth: 4, longevity: 8, sillage: 8 },
    longevityHoursRange: [7, 10],
    sillageLabel: "Beast Mode",
    priceUsd: 100,
    bottleMl: 100,
    concentration: "Eau de Toilette",
    affiliateLinkId: "original-jpg-classique",
  },
  {
    slug: "jpg-scandal",
    name: "Scandal",
    brand: "Jean Paul Gaultier",
    family: "Gourmand Chypre",
    notes: {
      top: ["Blood Orange", "Mandarin"],
      heart: ["Honey", "Gardenia", "Orange Blossom"],
      base: ["Licorice", "Patchouli", "Beeswax", "Caramel"],
    },
    facets: { freshness: 4, sweetness: 9, warmth: 7, woodyDepth: 4, longevity: 8, sillage: 8 },
    longevityHoursRange: [7, 10],
    sillageLabel: "Beast Mode",
    priceUsd: 110,
    bottleMl: 80,
    concentration: "Eau de Parfum",
    affiliateLinkId: "original-jpg-scandal",
  },
  {
    slug: "scandal-pour-homme",
    name: "Scandal Pour Homme",
    brand: "Jean Paul Gaultier",
    family: "Aromatic Gourmand",
    notes: {
      top: ["Blood Orange", "Mandarin", "Clary Sage"],
      heart: ["Tonka Bean", "Vetiver"],
      base: ["Tobacco", "Caramel", "Sandalwood"],
    },
    facets: { freshness: 4, sweetness: 8, warmth: 8, woodyDepth: 5, longevity: 7, sillage: 7 },
    longevityHoursRange: [6, 9],
    sillageLabel: "Strong",
    priceUsd: 110,
    bottleMl: 100,
    concentration: "Eau de Toilette",
    affiliateLinkId: "original-scandal-pour-homme",
  },
  {
    slug: "le-beau",
    name: "Le Beau",
    brand: "Jean Paul Gaultier",
    family: "Woody Amber",
    notes: {
      top: ["Bergamot", "Coconut Wood"],
      heart: ["Coconut"],
      base: ["Tonka Bean", "Woody Notes"],
    },
    facets: { freshness: 6, sweetness: 7, warmth: 6, woodyDepth: 5, longevity: 6, sillage: 6 },
    longevityHoursRange: [5, 8],
    sillageLabel: "Strong",
    priceUsd: 100,
    bottleMl: 125,
    concentration: "Eau de Toilette",
    affiliateLinkId: "original-le-beau",
  },
  {
    slug: "la-belle",
    name: "La Belle",
    brand: "Jean Paul Gaultier",
    family: "Oriental Vanilla",
    notes: {
      top: ["Pear", "Bergamot"],
      heart: ["Orange Blossom", "Jasmine"],
      base: ["Vanilla", "Tonka Bean", "Sandalwood"],
    },
    facets: { freshness: 4, sweetness: 9, warmth: 7, woodyDepth: 4, longevity: 7, sillage: 7 },
    longevityHoursRange: [6, 8],
    sillageLabel: "Strong",
    priceUsd: 125,
    bottleMl: 100,
    concentration: "Eau de Parfum",
    affiliateLinkId: "original-la-belle",
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
  /* NOT ADDED: Scandal Pour Homme Le Parfum, and the reason is a real limit of
   * feed matching rather than a gap to fill later. FragranceShop sells TWO
   * products whose names are identical once the gender tag is removed:
   *   "Jean Paul Gaultier Scandal Le Parfum Cologne for Men"   $104.95
   *   "Jean Paul Gaultier Scandal Le Parfum Perfume for Women"  $98.95
   * They are different fragrances. Our matcher strips that tag on purpose (it
   * is how "Cologne" gets misread as a concentration — see
   * scripts/ingest-cj-feed.mjs), so a reference named "Scandal Le Parfum" would
   * match both and take the cheaper, linking the women's bottle from the men's
   * page. Adding it needs the matcher to keep gender where a name is otherwise
   * ambiguous; until then it stays out.
   */
];
