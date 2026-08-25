import type { DupeCandidate, ReferenceFragrance } from "@/lib/types";

/**
 * Fixture dataset for the Dupe Finder. Reference fragrances are real,
 * well-known designer/niche scents, referenced by name only (standard
 * nominative use - see DESIGN.md §9). Dupe-candidate brand names are real,
 * currently-operating "inspired by" retailers found in
 * departments/sales/affiliate-program-signup-checklist.md's own research
 * (Dossier, MicroPerfumes, ALT. Fragrances, Regency Fragrances, Divain,
 * Parfum Inspirations, hkPerfumes). Specific dupe product names/prices/
 * facet scores are illustrative fixture data for this build, not verified
 * current catalog entries - every affiliateLinkId resolves to a placeholder
 * destination in lib/affiliate-links.ts, never a real program.
 *
 * Facet scores (0-10) are editorial estimates for demo purposes, not
 * lab-measured data - same convention fragrance-store-3's quiz already
 * uses. Similarity is never stored here - it's computed from notes + facets
 * by lib/similarity.ts, so the number shown on the site is genuinely
 * derived, not invented.
 */

export const REFERENCES: ReferenceFragrance[] = [
  {
    slug: "baccarat-rouge-540",
    name: "Baccarat Rouge 540",
    brand: "Maison Francis Kurkdjian",
    family: "Amber Woody",
    notes: {
      top: ["Saffron", "Jasmine"],
      heart: ["Amberwood", "Ambergris"],
      base: ["Fir Resin", "Cedar"],
    },
    facets: { freshness: 2, sweetness: 7, warmth: 8, woodyDepth: 7, longevity: 9, sillage: 8 },
    longevityHoursRange: [8, 12],
    sillageLabel: "Beast Mode",
    priceUsd: 325,
    bottleMl: 70,
    concentration: "Extrait de Parfum",
  },
  {
    slug: "bleu-de-chanel",
    name: "Bleu de Chanel",
    brand: "Chanel",
    family: "Woody Aromatic",
    notes: {
      top: ["Citrus", "Mint", "Pink Pepper"],
      heart: ["Ginger", "Nutmeg", "Jasmine"],
      base: ["Incense", "Vetiver", "Cedar", "Sandalwood"],
    },
    facets: { freshness: 8, sweetness: 2, warmth: 4, woodyDepth: 6, longevity: 7, sillage: 6 },
    longevityHoursRange: [6, 8],
    sillageLabel: "Strong",
    priceUsd: 148,
    bottleMl: 100,
    concentration: "Eau de Parfum",
  },
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
  },
  {
    slug: "coco-mademoiselle",
    name: "Coco Mademoiselle",
    brand: "Chanel",
    family: "Chypre Floral",
    notes: {
      top: ["Orange", "Bergamot"],
      heart: ["Rose", "Jasmine"],
      base: ["Patchouli", "Vetiver", "Musk"],
    },
    facets: { freshness: 6, sweetness: 4, warmth: 5, woodyDepth: 5, longevity: 7, sillage: 6 },
    longevityHoursRange: [6, 8],
    sillageLabel: "Strong",
    priceUsd: 165,
    bottleMl: 100,
    concentration: "Eau de Parfum",
  },
  {
    slug: "tobacco-vanille",
    name: "Tobacco Vanille",
    brand: "Tom Ford",
    family: "Oriental Spicy",
    notes: {
      top: ["Tobacco Leaf", "Spices"],
      heart: ["Vanilla", "Cacao", "Tonka Bean"],
      base: ["Dried Fruit", "Woods"],
    },
    facets: { freshness: 1, sweetness: 8, warmth: 9, woodyDepth: 6, longevity: 9, sillage: 8 },
    longevityHoursRange: [8, 12],
    sillageLabel: "Beast Mode",
    priceUsd: 248,
    bottleMl: 50,
    concentration: "Eau de Parfum",
  },
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
  },
];

export const DUPES: DupeCandidate[] = [
  {
    slug: "dossier-ambrosia",
    referenceSlug: "baccarat-rouge-540",
    name: "Ambrosia",
    brand: "Dossier",
    affiliateLinkId: "dossier-ambrosia",
    notes: {
      top: ["Saffron", "Jasmine"],
      heart: ["Amber", "Woods"],
      base: ["Cedarwood", "Musk"],
    },
    facets: { freshness: 2, sweetness: 7, warmth: 8, woodyDepth: 6, longevity: 6, sillage: 6 },
    longevityHoursRange: [5, 7],
    sillageLabel: "Strong",
    priceUsd: 49,
    bottleMl: 50,
    concentration: "Eau de Parfum",
    verdict:
      "Matches the saffron-amber opening closely and keeps the same syrupy warmth through the heart. It thins out faster and sits closer to skin by hour six, so it reads as a genuine same-day match rather than an all-night one.",
  },
  {
    slug: "microperfumes-amber-nights",
    referenceSlug: "baccarat-rouge-540",
    name: "Amber Nights",
    brand: "MicroPerfumes",
    affiliateLinkId: "microperfumes-amber-nights",
    notes: {
      top: ["Saffron"],
      heart: ["Amber", "Floral Notes"],
      base: ["Woody Musk"],
    },
    facets: { freshness: 3, sweetness: 6, warmth: 7, woodyDepth: 6, longevity: 5, sillage: 5 },
    longevityHoursRange: [4, 6],
    sillageLabel: "Moderate",
    priceUsd: 35,
    bottleMl: 30,
    concentration: "Eau de Parfum",
    verdict:
      "Gets the amber-woody direction right but the saffron opening is softer and the fir-resin base is largely absent, so the drydown reads simpler and less resinous than the original.",
  },
  {
    slug: "alt-blue-cedar",
    referenceSlug: "bleu-de-chanel",
    name: "Blue Cedar",
    brand: "ALT. Fragrances",
    affiliateLinkId: "alt-blue-cedar",
    notes: {
      top: ["Citrus", "Grapefruit"],
      heart: ["Ginger", "Lavender"],
      base: ["Cedar", "Sandalwood", "Musk"],
    },
    facets: { freshness: 8, sweetness: 2, warmth: 4, woodyDepth: 5, longevity: 5, sillage: 5 },
    longevityHoursRange: [4, 6],
    sillageLabel: "Moderate",
    priceUsd: 34,
    bottleMl: 50,
    concentration: "Eau de Parfum",
    verdict:
      "The citrus-cedar arc tracks well for the first few hours. Lavender stands in for the original's incense-vetiver base, which keeps the dupe cleaner and less smoky in the drydown.",
  },
  {
    slug: "dossier-aromatic-blue",
    referenceSlug: "bleu-de-chanel",
    name: "Aromatic Blue",
    brand: "Dossier",
    affiliateLinkId: "dossier-aromatic-blue",
    notes: {
      top: ["Bergamot", "Mint"],
      heart: ["Nutmeg", "Jasmine"],
      base: ["Cedar", "Musk"],
    },
    facets: { freshness: 7, sweetness: 2, warmth: 4, woodyDepth: 5, longevity: 5, sillage: 5 },
    longevityHoursRange: [4, 6],
    sillageLabel: "Moderate",
    priceUsd: 49,
    bottleMl: 50,
    concentration: "Eau de Parfum",
    verdict:
      "Close on the spiced-citrus opening. Loses some of the original's incense weight by the heart, so it wears a touch lighter and less serious through the afternoon.",
  },
  {
    slug: "alt-bright",
    referenceSlug: "black-opium",
    name: "Bright",
    brand: "ALT. Fragrances",
    affiliateLinkId: "alt-bright",
    notes: {
      top: ["Pear", "Orange Blossom"],
      heart: ["Coffee", "Jasmine"],
      base: ["Vanilla", "Musk"],
    },
    facets: { freshness: 3, sweetness: 8, warmth: 6, woodyDepth: 3, longevity: 6, sillage: 6 },
    longevityHoursRange: [5, 7],
    sillageLabel: "Strong",
    priceUsd: 34,
    bottleMl: 50,
    concentration: "Eau de Parfum",
    verdict:
      "The coffee-vanilla core is genuinely close, which is the part most people are buying this for. It is noticeably sweeter and less bitter-almond up top, so the opening is friendlier and a little less edgy than the original.",
  },
  {
    slug: "regency-midnight-bloom",
    referenceSlug: "black-opium",
    name: "Midnight Bloom",
    brand: "Regency Fragrances",
    affiliateLinkId: "regency-midnight-bloom",
    notes: {
      top: ["Pink Pepper"],
      heart: ["Coffee", "White Flowers"],
      base: ["Vanilla", "Woods"],
    },
    facets: { freshness: 2, sweetness: 7, warmth: 6, woodyDepth: 3, longevity: 5, sillage: 6 },
    longevityHoursRange: [4, 6],
    sillageLabel: "Moderate",
    priceUsd: 28,
    bottleMl: 30,
    concentration: "Eau de Parfum",
    verdict:
      "Leans on the coffee-vanilla pairing without the pear-orange blossom opening, so it arrives at a similar place but skips the original's brighter first twenty minutes.",
  },
  {
    slug: "divain-111",
    referenceSlug: "coco-mademoiselle",
    name: "No. 111",
    brand: "Divain",
    affiliateLinkId: "divain-111",
    notes: {
      top: ["Orange", "Bergamot"],
      heart: ["Rose"],
      base: ["Patchouli", "Musk"],
    },
    facets: { freshness: 6, sweetness: 4, warmth: 5, woodyDepth: 4, longevity: 5, sillage: 5 },
    longevityHoursRange: [4, 6],
    sillageLabel: "Moderate",
    priceUsd: 27,
    bottleMl: 30,
    concentration: "Eau de Parfum",
    verdict:
      "The citrus-rose-patchouli skeleton is intact and easy to recognize. Jasmine and vetiver are both toned down, so the heart reads a little flatter and the drydown is less mossy.",
  },
  {
    slug: "parfum-inspirations-mademoiselle-rose",
    referenceSlug: "coco-mademoiselle",
    name: "Mademoiselle Rose",
    brand: "Parfum Inspirations",
    affiliateLinkId: "parfum-inspirations-mademoiselle-rose",
    notes: {
      top: ["Bergamot"],
      heart: ["Rose", "Jasmine"],
      base: ["Patchouli"],
    },
    facets: { freshness: 5, sweetness: 5, warmth: 5, woodyDepth: 4, longevity: 5, sillage: 5 },
    longevityHoursRange: [4, 6],
    sillageLabel: "Moderate",
    priceUsd: 25,
    bottleMl: 30,
    concentration: "Eau de Parfum",
    verdict:
      "Rose-forward in a way that tracks the original's heart closely. The opening skips the orange note entirely, so it arrives at the floral stage faster and stays there longer.",
  },
  {
    slug: "divain-823",
    referenceSlug: "tobacco-vanille",
    name: "No. 823",
    brand: "Divain",
    affiliateLinkId: "divain-823",
    notes: {
      top: ["Tobacco Leaf"],
      heart: ["Vanilla", "Cacao"],
      base: ["Tonka Bean", "Woods"],
    },
    facets: { freshness: 1, sweetness: 8, warmth: 8, woodyDepth: 5, longevity: 6, sillage: 6 },
    longevityHoursRange: [5, 7],
    sillageLabel: "Strong",
    priceUsd: 27,
    bottleMl: 30,
    concentration: "Eau de Parfum",
    verdict:
      "The tobacco-vanilla-cacao gourmand core is very close, arguably the closest match in this dataset. It fades a full work-shift earlier than the original, which is the main thing the price difference buys you.",
  },
  {
    slug: "microperfumes-tobacco-amber",
    referenceSlug: "tobacco-vanille",
    name: "Tobacco Amber",
    brand: "MicroPerfumes",
    affiliateLinkId: "microperfumes-tobacco-amber",
    notes: {
      top: ["Spices"],
      heart: ["Vanilla", "Tobacco"],
      base: ["Amber", "Woods"],
    },
    facets: { freshness: 2, sweetness: 7, warmth: 8, woodyDepth: 5, longevity: 5, sillage: 5 },
    longevityHoursRange: [4, 6],
    sillageLabel: "Moderate",
    priceUsd: 32,
    bottleMl: 30,
    concentration: "Eau de Parfum",
    verdict:
      "Recognizably in the same family (warm, sweet, spiced) but the dried-fruit facet the original is known for is essentially missing, so it reads more generically amber than specifically tobacco.",
  },
  {
    slug: "regency-sandalwood-33",
    referenceSlug: "santal-33",
    name: "Sandalwood 33",
    brand: "Regency Fragrances",
    affiliateLinkId: "regency-sandalwood-33",
    notes: {
      top: ["Cardamom"],
      heart: ["Sandalwood", "Violet"],
      base: ["Leather", "Cedar"],
    },
    facets: { freshness: 4, sweetness: 3, warmth: 5, woodyDepth: 8, longevity: 5, sillage: 5 },
    longevityHoursRange: [4, 6],
    sillageLabel: "Moderate",
    priceUsd: 28,
    bottleMl: 30,
    concentration: "Eau de Parfum",
    verdict:
      "The cardamom-sandalwood-leather backbone is unmistakably aimed at the original and lands well. Papyrus is absent, so the original's slightly dusty, paper-like top note doesn't carry over.",
  },
  {
    slug: "hkperfumes-santal-leather",
    referenceSlug: "santal-33",
    name: "Santal Leather",
    brand: "hkPerfumes",
    affiliateLinkId: "hkperfumes-santal-leather",
    notes: {
      top: ["Cardamom", "Iris"],
      heart: ["Sandalwood"],
      base: ["Leather", "Musk"],
    },
    facets: { freshness: 3, sweetness: 3, warmth: 6, woodyDepth: 8, longevity: 5, sillage: 5 },
    longevityHoursRange: [4, 6],
    sillageLabel: "Moderate",
    priceUsd: 26,
    bottleMl: 30,
    concentration: "Eau de Parfum",
    verdict:
      "Iris in place of violet gives this one a slightly powdery opening instead of the original's fruitier one. The sandalwood-leather heart and base are the strongest part of the match.",
  },
];

export function getReference(slug: string): ReferenceFragrance | undefined {
  return REFERENCES.find((r) => r.slug === slug);
}

export function getDupesFor(referenceSlug: string): DupeCandidate[] {
  return DUPES.filter((d) => d.referenceSlug === referenceSlug);
}

export function getDupe(slug: string): DupeCandidate | undefined {
  return DUPES.find((d) => d.slug === slug);
}
