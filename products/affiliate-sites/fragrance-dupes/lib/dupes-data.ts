import { REFERENCES } from "@/lib/data/references";
import type { DupeCandidate, ReferenceFragrance } from "@/lib/types";

export { REFERENCES };

/**
 * Producer listings for the Dupe Finder.
 *
 * The reference (original) catalog moved to lib/data/references.ts, one file
 * per house, when it grew past the original six fixtures - see that file's
 * header for the scope and data-accuracy caveats. It is re-exported here so
 * existing `from "@/lib/dupes-data"` imports keep working.
 *
 * Reference fragrances are real,
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

export const DUPES: DupeCandidate[] = [
  {
    slug: "dossier-ambrosia",
    referenceSlug: "baccarat-rouge-540",
    name: "Ambrosia",
    brand: "Dossier",
    producerSlug: "dossier",
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
    producerSlug: "microperfumes",
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
    producerSlug: "alt-fragrances",
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
    producerSlug: "dossier",
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
    producerSlug: "alt-fragrances",
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
    producerSlug: "regency-fragrances",
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
    producerSlug: "divain",
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
    producerSlug: "parfum-inspirations",
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
    producerSlug: "divain",
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
    producerSlug: "microperfumes",
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
    producerSlug: "regency-fragrances",
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
    producerSlug: "hkperfumes",
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

  /* ---------------------------------------------------------------------
   * DRYDOWN's own line (producer `drydown-atelier`, isHouse).
   *
   * PLACEHOLDER PRICING. `costUsd: 8.51` is the founder's real stated
   * production cost per 55ml bottle. `priceUsd: 32` is NOT a decided retail
   * price - it is a stand-in so the UI has something to render, pending the
   * pricing decision MARKETPLACE-PLAN.md §5 leaves open. Change it there
   * before anything ships.
   *
   * No product photography exists for this line yet, so nothing here
   * references an image. Do not generate placeholder bottle imagery for it.
   *
   * Conflict-of-interest note: these are our own products being scored by our
   * own similarity formula and ranked against paying producers' listings on a
   * site branded "Independent Fragrance Comparisons." The UI discloses house
   * products explicitly wherever they appear; that disclosure is load-bearing
   * for the site's credibility, not decoration. See MARKETPLACE-PLAN.md §5.
   *
   * OBSERVED, AND THE REAL PROBLEM TO SOLVE: No. 01 Ember currently ranks #1
   * against Baccarat Rouge 540 at 79%, ahead of Dossier's Ambrosia at 57% and
   * MicroPerfumes' Amber Nights at 49%. Nothing in the ranking code favours
   * it - lib/catalog.ts uses one formula for every listing and breaks ties
   * toward the cheaper bottle. It wins because its note list here was written
   * to sit almost on top of the reference's, which is trivially easy to do
   * when you are the one filling in your own product's data.
   *
   * That is the conflict, and it does not get solved by better code. Before
   * this ships, the house line's notes and facet scores need to be assessed
   * the same sceptical way a third party's would be - ideally by someone who
   * did not make the fragrance - or the site is scoring its own homework in
   * public while calling itself independent.
   * ------------------------------------------------------------------- */
  {
    slug: "drydown-no-01-ember",
    referenceSlug: "baccarat-rouge-540",
    name: "No. 01 Ember",
    brand: "Drydown Atelier",
    producerSlug: "drydown-atelier",
    notes: {
      top: ["Saffron", "Jasmine"],
      heart: ["Amberwood", "Amber"],
      base: ["Fir Resin", "Cedar", "Musk"],
    },
    facets: { freshness: 2, sweetness: 7, warmth: 8, woodyDepth: 7, longevity: 7, sillage: 7 },
    longevityHoursRange: [6, 8],
    sillageLabel: "Strong",
    priceUsd: 32,
    bottleMl: 55,
    costUsd: 8.51,
    concentration: "Eau de Parfum",
    verdict:
      "We kept the fir-resin base most dupes drop, which is the part that makes the original read resinous rather than merely sweet. It does not project as hard past hour six, and we would rather say so than claim otherwise about our own bottle.",
  },
  {
    slug: "drydown-no-02-cold-cedar",
    referenceSlug: "bleu-de-chanel",
    name: "No. 02 Cold Cedar",
    brand: "Drydown Atelier",
    producerSlug: "drydown-atelier",
    notes: {
      top: ["Citrus", "Mint", "Pink Pepper"],
      heart: ["Ginger", "Nutmeg"],
      base: ["Incense", "Vetiver", "Cedar"],
    },
    facets: { freshness: 8, sweetness: 2, warmth: 4, woodyDepth: 6, longevity: 6, sillage: 5 },
    longevityHoursRange: [5, 7],
    sillageLabel: "Moderate",
    priceUsd: 32,
    bottleMl: 55,
    costUsd: 8.51,
    concentration: "Eau de Parfum",
    verdict:
      "The incense-vetiver drydown is the hard part of this original and the part most alternatives skip; we went after it directly. The tradeoff is a quieter first hour than the original's bright citrus burst.",
  },
  {
    slug: "drydown-no-03-pipe-smoke",
    referenceSlug: "tobacco-vanille",
    name: "No. 03 Pipe Smoke",
    brand: "Drydown Atelier",
    producerSlug: "drydown-atelier",
    notes: {
      top: ["Tobacco Leaf", "Spices"],
      heart: ["Tonka Bean", "Vanilla"],
      base: ["Dried Fruits", "Woody Notes"],
    },
    facets: { freshness: 1, sweetness: 8, warmth: 9, woodyDepth: 6, longevity: 7, sillage: 6 },
    longevityHoursRange: [6, 9],
    sillageLabel: "Strong",
    priceUsd: 32,
    bottleMl: 55,
    costUsd: 8.51,
    concentration: "Eau de Parfum",
    verdict:
      "Close on the tobacco-tonka core, with the dried-fruit sweetness pulled back a little from the original's near-jammy level. Warmer and rounder than the reference, which some people will prefer and some will not.",
  },

  /* ---------------------------------------------------------------------
   * Listings against the expanded house catalog. Same fixture status as
   * everything above: real producer names, illustrative product names and
   * prices, placeholder affiliate destinations.
   *
   * Note that the two house products in this block deliberately do NOT top
   * their charts - No. 04 sits behind two third-party listings on Aventus and
   * No. 05 behind one on Sauvage. That is the honest result of writing their
   * notes as an actual formulation compromise rather than as a copy of the
   * reference's pyramid, and it is what the ranking looks like when nobody
   * has their thumb on it. Compare with No. 01 Ember above, which does top
   * its chart, and see that entry's comment for why that is a problem to fix
   * rather than a result to be pleased about.
   * ------------------------------------------------------------------- */

  // --- Creed Aventus (the most-duped fragrance in the market) ---
  {
    slug: "alt-ecstasy",
    referenceSlug: "aventus",
    name: "Ecstasy",
    brand: "ALT. Fragrances",
    producerSlug: "alt-fragrances",
    affiliateLinkId: "alt-ecstasy",
    notes: {
      top: ["Pineapple", "Bergamot", "Black Currant"],
      heart: ["Birch", "Patchouli", "Jasmine"],
      base: ["Musk", "Oakmoss", "Ambergris"],
    },
    facets: { freshness: 7, sweetness: 6, warmth: 6, woodyDepth: 7, longevity: 7, sillage: 7 },
    longevityHoursRange: [6, 9],
    sillageLabel: "Strong",
    priceUsd: 40,
    bottleMl: 50,
    concentration: "Extrait de Parfum",
    verdict:
      "The closest of the widely available Aventus alternatives on the smoky-pineapple opening, and the extrait concentration means it holds most of a workday. The birch smoke is a touch sharper and less rounded than the original's.",
  },
  {
    slug: "dossier-woody-pineapple",
    referenceSlug: "aventus",
    name: "Woody Pineapple",
    brand: "Dossier",
    producerSlug: "dossier",
    affiliateLinkId: "dossier-woody-pineapple",
    notes: {
      top: ["Pineapple", "Bergamot", "Apple"],
      heart: ["Birch", "Patchouli", "Rose"],
      base: ["Musk", "Oakmoss", "Vanilla"],
    },
    facets: { freshness: 7, sweetness: 7, warmth: 5, woodyDepth: 6, longevity: 6, sillage: 6 },
    longevityHoursRange: [5, 7],
    sillageLabel: "Strong",
    priceUsd: 49,
    bottleMl: 50,
    concentration: "Eau de Parfum",
    verdict:
      "Fruitier and sweeter than the original, with the smoke dialled back. Reads as an easier, more casual take rather than a straight match, and fades noticeably sooner.",
  },
  {
    slug: "divain-006",
    referenceSlug: "aventus",
    name: "No. 006",
    brand: "Divain",
    producerSlug: "divain",
    affiliateLinkId: "divain-006",
    notes: {
      top: ["Pineapple", "Black Currant"],
      heart: ["Birch", "Jasmine"],
      base: ["Musk", "Ambergris"],
    },
    facets: { freshness: 6, sweetness: 6, warmth: 5, woodyDepth: 6, longevity: 5, sillage: 5 },
    longevityHoursRange: [4, 6],
    sillageLabel: "Moderate",
    priceUsd: 39,
    bottleMl: 100,
    concentration: "Eau de Parfum",
    verdict:
      "Recognisably in the same family and the cheapest per ml of the three. The opening is thinner and it sits close to the skin after a couple of hours, so it works better as an everyday bottle than a statement one.",
  },
  {
    slug: "drydown-no-04-pineapple-smoke",
    referenceSlug: "aventus",
    name: "No. 04 Pineapple Smoke",
    brand: "Drydown Atelier",
    producerSlug: "drydown-atelier",
    notes: {
      top: ["Pineapple", "Bergamot"],
      heart: ["Birch", "Cedar"],
      base: ["Musk", "Ambergris", "Vetiver"],
    },
    facets: { freshness: 6, sweetness: 5, warmth: 5, woodyDepth: 7, longevity: 7, sillage: 6 },
    longevityHoursRange: [6, 8],
    sillageLabel: "Strong",
    priceUsd: 32,
    bottleMl: 55,
    costUsd: 8.51,
    concentration: "Eau de Parfum",
    verdict:
      "We went drier than the original on purpose, trading some of the fruit for a cleaner birch-vetiver base. That costs us match points against a reference defined by its pineapple, and two of the listings above score higher here. We would rather publish that than reweight our own formula.",
  },

  // --- Dior Sauvage ---
  {
    slug: "dossier-fougere-bergamot",
    referenceSlug: "sauvage",
    name: "Fougere Bergamot",
    brand: "Dossier",
    producerSlug: "dossier",
    affiliateLinkId: "dossier-fougere-bergamot",
    notes: {
      top: ["Bergamot", "Pepper"],
      heart: ["Lavender", "Geranium", "Sichuan Pepper"],
      base: ["Ambroxan", "Cedar"],
    },
    facets: { freshness: 8, sweetness: 2, warmth: 5, woodyDepth: 6, longevity: 7, sillage: 7 },
    longevityHoursRange: [6, 8],
    sillageLabel: "Strong",
    priceUsd: 49,
    bottleMl: 50,
    concentration: "Eau de Parfum",
    verdict:
      "Ambroxan is the whole trick with this original and this one uses plenty of it, so the fresh-peppery signature lands. It projects hard for two hours then settles much closer than the reference does.",
  },
  {
    slug: "regency-wild-bergamot",
    referenceSlug: "sauvage",
    name: "Wild Bergamot",
    brand: "Regency Fragrances",
    producerSlug: "regency-fragrances",
    affiliateLinkId: "regency-wild-bergamot",
    notes: {
      top: ["Bergamot", "Pink Pepper"],
      heart: ["Lavender", "Elemi"],
      base: ["Ambroxan", "Labdanum", "Cedar"],
    },
    facets: { freshness: 8, sweetness: 3, warmth: 5, woodyDepth: 6, longevity: 8, sillage: 8 },
    longevityHoursRange: [7, 10],
    sillageLabel: "Beast Mode",
    priceUsd: 42,
    bottleMl: 60,
    concentration: "Extrait de Parfum",
    verdict:
      "The strongest performer of the Sauvage alternatives we have data on, and the labdanum gives the drydown a resinous edge the original does not have. Close enough for the office, distinguishable side by side.",
  },
  {
    slug: "drydown-no-05-grey-pepper",
    referenceSlug: "sauvage",
    name: "No. 05 Grey Pepper",
    brand: "Drydown Atelier",
    producerSlug: "drydown-atelier",
    notes: {
      top: ["Bergamot", "Pepper"],
      heart: ["Lavender", "Geranium"],
      base: ["Ambroxan", "Vetiver"],
    },
    facets: { freshness: 8, sweetness: 2, warmth: 4, woodyDepth: 6, longevity: 7, sillage: 6 },
    longevityHoursRange: [6, 8],
    sillageLabel: "Strong",
    priceUsd: 32,
    bottleMl: 55,
    costUsd: 8.51,
    concentration: "Eau de Parfum",
    verdict:
      "A quieter reading of the same idea, with vetiver where the original puts cedar and labdanum. Regency's bottle above scores higher and projects harder; ours is the one to pick if you find the original overwhelming rather than if you want more of it.",
  },

  // --- Parfums de Marly Layton ---
  {
    slug: "alt-levant",
    referenceSlug: "layton",
    name: "Levant",
    brand: "ALT. Fragrances",
    producerSlug: "alt-fragrances",
    affiliateLinkId: "alt-levant",
    notes: {
      top: ["Apple", "Lavender", "Bergamot"],
      heart: ["Geranium", "Violet"],
      base: ["Vanilla", "Sandalwood", "Cardamom", "Pepper"],
    },
    facets: { freshness: 5, sweetness: 8, warmth: 8, woodyDepth: 6, longevity: 8, sillage: 8 },
    longevityHoursRange: [7, 10],
    sillageLabel: "Beast Mode",
    priceUsd: 40,
    bottleMl: 50,
    concentration: "Extrait de Parfum",
    verdict:
      "Gets the apple-and-spiced-vanilla accord that makes the original recognisable, and performs close to it. The guaiac wood is missing, so the drydown is sweeter and less smoky.",
  },
  {
    slug: "hkperfumes-spiced-apple",
    referenceSlug: "layton",
    name: "Spiced Apple",
    brand: "hkPerfumes",
    producerSlug: "hkperfumes",
    affiliateLinkId: "hkperfumes-spiced-apple",
    notes: {
      top: ["Apple", "Bergamot", "Mandarin"],
      heart: ["Violet", "Jasmine"],
      base: ["Vanilla", "Guaiac Wood", "Pepper"],
    },
    facets: { freshness: 5, sweetness: 7, warmth: 7, woodyDepth: 6, longevity: 7, sillage: 7 },
    longevityHoursRange: [6, 9],
    sillageLabel: "Strong",
    priceUsd: 45,
    bottleMl: 50,
    concentration: "Eau de Parfum",
    verdict:
      "Keeps the guaiac wood most alternatives drop, which makes the base truer even though the opening is less bright. A slightly more grown-up take than the sweeter competition.",
  },

  // --- Jean Paul Gaultier Le Male ---
  {
    slug: "divain-212",
    referenceSlug: "le-male",
    name: "No. 212",
    brand: "Divain",
    producerSlug: "divain",
    affiliateLinkId: "divain-212",
    notes: {
      top: ["Mint", "Lavender", "Bergamot"],
      heart: ["Cinnamon", "Orange Blossom"],
      base: ["Vanilla", "Tonka Bean", "Amber"],
    },
    facets: { freshness: 5, sweetness: 8, warmth: 7, woodyDepth: 3, longevity: 7, sillage: 7 },
    longevityHoursRange: [6, 9],
    sillageLabel: "Strong",
    priceUsd: 39,
    bottleMl: 100,
    concentration: "Eau de Parfum",
    verdict:
      "The mint-vanilla-tonka signature is unmistakable and the value per ml is the best in this comparison. Missing the cumin that gives the original its slightly dirty edge, so it reads cleaner and more generic.",
  },
  {
    slug: "parfum-inspirations-sailor-mint",
    referenceSlug: "le-male",
    name: "Sailor Mint",
    brand: "Parfum Inspirations",
    producerSlug: "parfum-inspirations",
    affiliateLinkId: "parfum-inspirations-sailor-mint",
    notes: {
      top: ["Mint", "Lavender", "Cardamom"],
      heart: ["Cinnamon", "Cumin"],
      base: ["Vanilla", "Tonka Bean", "Sandalwood"],
    },
    facets: { freshness: 5, sweetness: 8, warmth: 8, woodyDepth: 4, longevity: 6, sillage: 6 },
    longevityHoursRange: [5, 7],
    sillageLabel: "Strong",
    priceUsd: 34,
    bottleMl: 50,
    concentration: "Eau de Parfum",
    verdict:
      "Keeps the cumin, which makes it the more faithful of the two even though it does not last as long. If the original's slightly animalic warmth is the part you want, this is the closer bottle.",
  },

  // --- Armani Acqua di Gio ---
  {
    slug: "dossier-marine-bergamot",
    referenceSlug: "acqua-di-gio",
    name: "Marine Bergamot",
    brand: "Dossier",
    producerSlug: "dossier",
    affiliateLinkId: "dossier-marine-bergamot",
    notes: {
      top: ["Lime", "Bergamot", "Neroli"],
      heart: ["Sea Notes", "Jasmine", "Rosemary"],
      base: ["White Musk", "Cedar", "Patchouli"],
    },
    facets: { freshness: 9, sweetness: 2, warmth: 2, woodyDepth: 4, longevity: 5, sillage: 5 },
    longevityHoursRange: [4, 6],
    sillageLabel: "Moderate",
    priceUsd: 49,
    bottleMl: 50,
    concentration: "Eau de Parfum",
    verdict:
      "An accurate reading of a famously hard-to-improve-on fresh aquatic, right down to matching the original's modest longevity. There is no performance gain here, only a price one.",
  },
  {
    slug: "microperfumes-aqua-breeze",
    referenceSlug: "acqua-di-gio",
    name: "Aqua Breeze",
    brand: "MicroPerfumes",
    producerSlug: "microperfumes",
    affiliateLinkId: "microperfumes-aqua-breeze",
    notes: {
      top: ["Lemon", "Bergamot"],
      heart: ["Sea Notes", "Rosemary"],
      base: ["White Musk", "Cedar"],
    },
    facets: { freshness: 9, sweetness: 2, warmth: 2, woodyDepth: 3, longevity: 4, sillage: 4 },
    longevityHoursRange: [3, 5],
    sillageLabel: "Intimate",
    priceUsd: 30,
    bottleMl: 30,
    concentration: "Eau de Parfum",
    verdict:
      "Simpler than the original and shorter-lived, but the citrus-marine core is right. The decant size makes this a cheap way to decide whether the style suits you at all.",
  },

  // --- Remaining flagships, one listing each ---
  {
    slug: "regency-irish-green",
    referenceSlug: "green-irish-tweed",
    name: "Irish Green",
    brand: "Regency Fragrances",
    producerSlug: "regency-fragrances",
    affiliateLinkId: "regency-irish-green",
    notes: {
      top: ["Lemon Verbena", "Peppermint"],
      heart: ["Violet Leaf", "Iris"],
      base: ["Sandalwood", "Ambergris", "Musk"],
    },
    facets: { freshness: 9, sweetness: 2, warmth: 3, woodyDepth: 6, longevity: 6, sillage: 6 },
    longevityHoursRange: [5, 8],
    sillageLabel: "Strong",
    priceUsd: 42,
    bottleMl: 60,
    concentration: "Extrait de Parfum",
    verdict:
      "A close structural match to a fragrance whose whole appeal is its clean violet-leaf freshness. The ambergris in the base is thinner, which is where the price difference shows.",
  },
  {
    slug: "alt-powdered-iris",
    referenceSlug: "dior-homme-intense",
    name: "Powdered Iris",
    brand: "ALT. Fragrances",
    producerSlug: "alt-fragrances",
    affiliateLinkId: "alt-powdered-iris",
    notes: {
      top: ["Lavender"],
      heart: ["Iris", "Pear"],
      base: ["Vetiver", "Cedar", "Vanilla"],
    },
    facets: { freshness: 3, sweetness: 6, warmth: 6, woodyDepth: 6, longevity: 7, sillage: 6 },
    longevityHoursRange: [6, 9],
    sillageLabel: "Strong",
    priceUsd: 40,
    bottleMl: 50,
    concentration: "Extrait de Parfum",
    verdict:
      "Iris this good is expensive to formulate and it shows: the powdery heart is convincing, but sweeter and less austere than the original. The closest thing to this style at the price.",
  },
  {
    slug: "hkperfumes-tobacco-osmanthus",
    referenceSlug: "herod",
    name: "Tobacco Osmanthus",
    brand: "hkPerfumes",
    producerSlug: "hkperfumes",
    affiliateLinkId: "hkperfumes-tobacco-osmanthus",
    notes: {
      top: ["Cinnamon", "Pepper"],
      heart: ["Osmanthus", "Tobacco Leaf"],
      base: ["Vanilla", "Incense", "Cedar"],
    },
    facets: { freshness: 2, sweetness: 8, warmth: 9, woodyDepth: 7, longevity: 8, sillage: 7 },
    longevityHoursRange: [7, 10],
    sillageLabel: "Strong",
    priceUsd: 45,
    bottleMl: 50,
    concentration: "Eau de Parfum",
    verdict:
      "The vanilla-tobacco heart is genuinely close and it performs well. Slightly flatter through the middle, where the original's osmanthus does more work.",
  },
  {
    slug: "parfum-inspirations-tuberose-bloom",
    referenceSlug: "gucci-bloom",
    name: "Tuberose Bloom",
    brand: "Parfum Inspirations",
    producerSlug: "parfum-inspirations",
    affiliateLinkId: "parfum-inspirations-tuberose-bloom",
    notes: {
      top: ["Rangoon Creeper"],
      heart: ["Tuberose", "Jasmine"],
      base: ["Orris Root", "Sandalwood", "Musk"],
    },
    facets: { freshness: 4, sweetness: 6, warmth: 5, woodyDepth: 4, longevity: 6, sillage: 6 },
    longevityHoursRange: [5, 8],
    sillageLabel: "Strong",
    priceUsd: 34,
    bottleMl: 50,
    concentration: "Eau de Parfum",
    verdict:
      "A near-linear white floral, same as the original, and the tuberose is rendered well. Marginally sharper in the first ten minutes before it settles into the same shape.",
  },
  {
    slug: "divain-341",
    referenceSlug: "delina",
    name: "No. 341",
    brand: "Divain",
    producerSlug: "divain",
    affiliateLinkId: "divain-341",
    notes: {
      top: ["Litchi", "Rhubarb", "Bergamot"],
      heart: ["Turkish Rose", "Peony"],
      base: ["Cashmeran", "Cedar", "Musk"],
    },
    facets: { freshness: 6, sweetness: 8, warmth: 5, woodyDepth: 5, longevity: 7, sillage: 7 },
    longevityHoursRange: [6, 9],
    sillageLabel: "Strong",
    priceUsd: 39,
    bottleMl: 100,
    concentration: "Eau de Parfum",
    verdict:
      "The litchi-rose opening is the signature and it is reproduced closely. Less incense in the drydown, so it stays fruity where the original turns slightly smoky.",
  },
  {
    slug: "microperfumes-code-noir",
    referenceSlug: "armani-code",
    name: "Code Noir",
    brand: "MicroPerfumes",
    producerSlug: "microperfumes",
    affiliateLinkId: "microperfumes-code-noir",
    notes: {
      top: ["Bergamot", "Lemon"],
      heart: ["Olive Blossom", "Star Anise"],
      base: ["Tonka Bean", "Tobacco"],
    },
    facets: { freshness: 4, sweetness: 6, warmth: 7, woodyDepth: 4, longevity: 6, sillage: 5 },
    longevityHoursRange: [5, 7],
    sillageLabel: "Moderate",
    priceUsd: 32,
    bottleMl: 30,
    concentration: "Eau de Parfum",
    verdict:
      "Faithful on the anise-tonka accord that defines the original. The leather in the base is largely absent, which makes it lighter and less smooth late on.",
  },
  {
    slug: "parfum-inspirations-classic-aldehyde",
    referenceSlug: "chanel-no-5",
    name: "Classic Aldehyde",
    brand: "Parfum Inspirations",
    producerSlug: "parfum-inspirations",
    affiliateLinkId: "parfum-inspirations-classic-aldehyde",
    notes: {
      top: ["Aldehydes", "Ylang-Ylang", "Neroli"],
      heart: ["Iris", "Jasmine", "Rose"],
      base: ["Sandalwood", "Vanilla", "Musk"],
    },
    facets: { freshness: 5, sweetness: 4, warmth: 6, woodyDepth: 4, longevity: 6, sillage: 6 },
    longevityHoursRange: [5, 8],
    sillageLabel: "Strong",
    priceUsd: 34,
    bottleMl: 50,
    concentration: "Eau de Parfum",
    verdict:
      "Aldehydic florals are hard to fake and this is a creditable attempt, but the original's depth comes from materials that cost more than this whole bottle. Recognisable rather than interchangeable.",
  },
  {
    slug: "divain-158",
    referenceSlug: "miss-dior",
    name: "No. 158",
    brand: "Divain",
    producerSlug: "divain",
    affiliateLinkId: "divain-158",
    notes: {
      top: ["Blood Orange", "Mandarin"],
      heart: ["Rose", "Peony"],
      base: ["Patchouli", "Musk", "Vanilla"],
    },
    facets: { freshness: 6, sweetness: 6, warmth: 4, woodyDepth: 4, longevity: 6, sillage: 6 },
    longevityHoursRange: [5, 8],
    sillageLabel: "Strong",
    priceUsd: 39,
    bottleMl: 100,
    concentration: "Eau de Parfum",
    verdict:
      "Tracks the citrus-rose-patchouli structure accurately at a third of the price per ml. Slightly louder and less refined in the opening, closer to level by the drydown.",
  },
  {
    slug: "regency-silver-stream",
    referenceSlug: "silver-mountain-water",
    name: "Silver Stream",
    brand: "Regency Fragrances",
    producerSlug: "regency-fragrances",
    affiliateLinkId: "regency-silver-stream",
    notes: {
      top: ["Bergamot", "Mandarin"],
      heart: ["Green Tea", "Black Currant"],
      base: ["Musk", "Sandalwood"],
    },
    facets: { freshness: 9, sweetness: 3, warmth: 2, woodyDepth: 5, longevity: 6, sillage: 6 },
    longevityHoursRange: [5, 8],
    sillageLabel: "Strong",
    priceUsd: 42,
    bottleMl: 60,
    concentration: "Extrait de Parfum",
    verdict:
      "The green-tea-and-blackcurrant idea is intact and the extrait concentration actually outlasts the original, which is unusual. Less shimmer in the opening.",
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
