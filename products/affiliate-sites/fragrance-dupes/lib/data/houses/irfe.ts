import type { ReferenceFragrance } from "@/lib/types";

/**
 * Maison IRFE. See lib/data/references.ts for data-accuracy caveats, and read
 * the scope note there before adding a ninth entry.
 *
 * WHY THIS HOUSE IS HERE AT ALL, when nobody dupes it. Every other house in
 * this catalogue earns its place by being copied - that is the scope rule in
 * references.ts. IRFE is the deliberate exception, a founder decision of
 * 2026-10-05 taken with the facts in front of it: we are enrolled in IRFE's
 * own CJ programme at 15% (CJ advertiser 17213922), so this is the first
 * reference that is also its own retailer. The alternative readings were
 * checked rather than assumed:
 *
 *   - IRFE's own copy names NO other fragrance. Every "inspired by" in its
 *     feed is narrative - its 1924 Rue Duphot boutique, St. Moritz, Dover
 *     Street, "a romantic lady". Each product credits a named Givaudan or
 *     DSM-Firmenich perfumer. It is not a dupe house.
 *   - No dupe house we carry copies it either: zero matches for "irfe" across
 *     all three dupe feeds on disk.
 *   - So it cannot be listed as a dupe without US inventing the pairing, which
 *     is why it sits on the originals side.
 *
 * Expect ZERO dupe matches on these eight pages. That is the honest state and
 * not a bug to be papered over; if a dupe house ever copies one, it will match
 * through the normal scoring path with no change here.
 *
 * NOTES ARE IRFE'S OWN, FACETS ARE OURS. The three-tier pyramids below are
 * transcribed from the "KEY INGREDIENTS AND FRAGRANCE NOTES" block IRFE
 * publishes on each product page, reached through its CJ feed of 2026-10-04
 * (scripts/feeds/irfe-20261004/, gitignored). Where IRFE publishes three notes
 * per tier, three are recorded - the list is not padded out to match the
 * fuller entries. Stated origins are trimmed ("Oakmoss Absolute Croatia" ->
 * "Oakmoss") because lib/similarity.ts matches on material, and a dupe's
 * "Oakmoss" would never meet the sourced spelling.
 *
 * The `facets` are derived by us from those pyramids, the same way every other
 * reference's are. They are not IRFE's numbers and IRFE publishes none.
 *
 * PRICE IS THE FULL-SIZE BOTTLE, founder instruction 2026-10-05. The Heritage
 * trio exists only in 100ml; the Maison five top out at 50ml, so 50ml is their
 * full size. IRFE also sells 10ml splash bottles ($65), 3ml vials ($10), a
 * 5x10ml coffret ($320) and a 5x3ml discovery set ($85). NONE of those may
 * become `priceUsd`: this field is the price of the variant whose volume equals
 * `bottleMl`, and a $10 vial recorded here would make the per-millilitre
 * comparison on every page a false claim.
 *
 * IMAGES ARE IN lib/data/irfe-images.ts, added 2026-10-08. This paragraph used
 * to say there were none, and the reason it gave was wrong: it judged the
 * small-bottle rows by their file names (white502, silver502, red502) and
 * called them colour-coded packaging that might not be the specific juice.
 * Looking at them settled it in one pass - IRFE's Maison line gives each
 * fragrance its own bottle colour, and each frame carries that fragrance's own
 * named box, so the colour IS the product identity. Kept as a correction
 * rather than deleted, because the mistake is the useful part: a file name is
 * not evidence about a picture.
 */
export const IRFE: ReferenceFragrance[] = [
  {
    slug: "ma-france-folie-parisienne",
    name: "Ma France Folie Parisienne",
    brand: "IRFE",
    family: "Chypre Floral",
    notes: {
      top: ["Angelica Root", "Cedar Leaf", "Ylang Ylang", "Lemon", "Gurjun Balsam"],
      heart: ["Jasmine Absolute", "Rose Absolute", "Broom Flower", "Iris Butter", "Clary Sage"],
      base: [
        "Sandalwood",
        "Oakmoss",
        "Leather",
        "Ambergris",
        "Patchouli",
        "Vetiver",
        "Styrax",
        "Tonka Bean",
      ],
    },
    facets: { freshness: 5, sweetness: 5, warmth: 7, woodyDepth: 7, longevity: 8, sillage: 7 },
    longevityHoursRange: [7, 9],
    sillageLabel: "Strong",
    priceUsd: 350,
    bottleMl: 100,
    concentration: "Eau de Parfum",
    affiliateLinkId: "irfe-ma-france-folie-parisienne",
  },
  {
    slug: "my-st-moritz-lakeside-bliss",
    name: "My St. Moritz Lakeside Bliss",
    brand: "IRFE",
    family: "Amber",
    notes: {
      top: ["Bergamot", "Mandarin", "Magnolia Leaf", "Clary Sage", "Coriander Seed"],
      heart: ["Rose", "Cocoa Absolute", "Cinnamon Bark", "Nutmeg", "Opoponax"],
      base: ["Amber", "Labdanum", "Frankincense", "Patchouli", "Vanilla", "Styrax", "Tolu Balsam"],
    },
    facets: { freshness: 4, sweetness: 7, warmth: 9, woodyDepth: 5, longevity: 8, sillage: 7 },
    longevityHoursRange: [7, 9],
    sillageLabel: "Strong",
    priceUsd: 325,
    bottleMl: 100,
    concentration: "Eau de Parfum",
    affiliateLinkId: "irfe-my-st-moritz-lakeside-bliss",
  },
  {
    slug: "my-britain-lord-and-lady",
    name: "My Britain Lord & Lady",
    brand: "IRFE",
    family: "Woody Oriental",
    notes: {
      top: ["Lemon", "Black Pepper", "Smoked Marshmallow"],
      heart: ["Incense", "Suede", "Vanilla Orchid"],
      base: ["Tonka Bean", "Cashmere Woods", "Sandalwood"],
    },
    facets: { freshness: 3, sweetness: 6, warmth: 8, woodyDepth: 7, longevity: 8, sillage: 6 },
    longevityHoursRange: [7, 9],
    sillageLabel: "Strong",
    priceUsd: 300,
    bottleMl: 100,
    concentration: "Eau de Parfum",
    affiliateLinkId: "irfe-my-britain-lord-and-lady",
  },
  {
    slug: "patchouli-forever-worn",
    name: "Patchouli Forever Worn",
    brand: "IRFE",
    family: "Amber Woody",
    notes: {
      top: ["Honey", "Tobacco", "Davana"],
      heart: ["Lavandin", "Clearwood", "Amber"],
      base: ["Patchouli", "Sandalwood", "Cedarwood"],
    },
    facets: { freshness: 2, sweetness: 6, warmth: 8, woodyDepth: 9, longevity: 8, sillage: 7 },
    longevityHoursRange: [8, 10],
    sillageLabel: "Strong",
    priceUsd: 285,
    bottleMl: 50,
    concentration: "Eau de Parfum",
    affiliateLinkId: "irfe-patchouli-forever-worn",
  },
  {
    slug: "marshmallow-musk",
    name: "Marshmallow Musk",
    brand: "IRFE",
    family: "Gourmand Musk",
    notes: {
      top: ["Earl Grey Tea", "Magnolia", "Lavender"],
      heart: ["Jasmine", "Marshmallow", "Iris"],
      base: ["Woody Notes", "Vanilla", "Musk"],
    },
    facets: { freshness: 4, sweetness: 8, warmth: 6, woodyDepth: 3, longevity: 7, sillage: 5 },
    longevityHoursRange: [6, 8],
    sillageLabel: "Moderate",
    priceUsd: 285,
    bottleMl: 50,
    concentration: "Eau de Parfum",
    affiliateLinkId: "irfe-marshmallow-musk",
  },
  {
    slug: "smoldering-pepper",
    name: "Smoldering Pepper",
    brand: "IRFE",
    family: "Woody Spicy",
    notes: {
      top: ["Black Pepper", "Saffron", "Olibanum"],
      heart: ["Labdanum", "Patchouli", "Cypriol"],
      base: ["Vanilla", "Smoked Leather", "Oud"],
    },
    facets: { freshness: 2, sweetness: 4, warmth: 9, woodyDepth: 9, longevity: 9, sillage: 8 },
    longevityHoursRange: [9, 12],
    sillageLabel: "Beast Mode",
    priceUsd: 285,
    bottleMl: 50,
    concentration: "Eau de Parfum",
    affiliateLinkId: "irfe-smoldering-pepper",
  },
  {
    slug: "saffron-leather",
    name: "Saffron Leather",
    brand: "IRFE",
    family: "Leather",
    notes: {
      top: ["Bergamot", "Cinnamon", "Petitgrain", "Blackcurrant"],
      heart: ["Saffron", "Cistus", "Rose", "Violet"],
      base: ["Leather", "Sandalwood", "Cedarwood"],
    },
    facets: { freshness: 4, sweetness: 3, warmth: 7, woodyDepth: 8, longevity: 8, sillage: 7 },
    longevityHoursRange: [7, 9],
    sillageLabel: "Strong",
    priceUsd: 285,
    bottleMl: 50,
    concentration: "Eau de Parfum",
    affiliateLinkId: "irfe-saffron-leather",
  },
  {
    slug: "centifolia-rose",
    name: "Centifolia Rose",
    brand: "IRFE",
    family: "Floral",
    notes: {
      top: ["Bergamot", "Pink Pepper", "Pear"],
      heart: ["Rose", "Orris", "Neroli"],
      base: ["Cedarwood", "Sandalwood", "White Musk"],
    },
    facets: { freshness: 6, sweetness: 5, warmth: 4, woodyDepth: 4, longevity: 7, sillage: 6 },
    longevityHoursRange: [6, 8],
    sillageLabel: "Moderate",
    priceUsd: 285,
    bottleMl: 50,
    concentration: "Eau de Parfum",
    affiliateLinkId: "irfe-centifolia-rose",
  },
];
