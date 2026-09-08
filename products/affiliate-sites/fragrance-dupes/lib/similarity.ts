import type { DupeCandidate, FacetScores, FragranceNotes, ReferenceFragrance } from "@/lib/types";

/**
 * Similarity scoring - disclosed on /about, not a black-box number. See
 * DESIGN.md §8 "Similarity score, honestly computed, not invented-precise."
 *
 * Up to FOUR components, decided 2026-09-08 alongside the structural ceiling
 * and imputed-pyramid penalty in lib/verification.ts (see PRODUCER-PROGRAM.md
 * §7 for the full record - this redesign exists because the producer
 * subscription program is about to make outside producers a second, larger
 * source of exactly the self-reported data this formula scores):
 *  - Note overlap (40%, was 50%): top/heart/base overlap, weighted 20/35/45 -
 *    base notes count most because they're the drydown, the part that
 *    lingers and the part this whole site is named after.
 *  - Facet closeness (30%, was 35%): inverse of the average absolute
 *    difference across the six radar facets, normalized to 0-1.
 *  - Family match bonus (15%, unchanged): full credit if both fragrances
 *    share an olfactive family, partial credit (CROSS_FAMILY_CREDIT)
 *    otherwise.
 *  - Ingredient overlap (15%, NEW): plain Jaccard over a flat, UNTIERED
 *    ingredient/INCI list - no top/heart/base split, unlike notes. Active
 *    ONLY when both sides of the comparison have one recorded. See
 *    BASE_WEIGHTS/FULL_WEIGHTS below for why this is two fixed weight sets
 *    rather than one formula that redistributes the 15 points proportionally
 *    - a proportional redistribution would shift every existing score the
 *    moment this shipped, even though zero listings have ingredient data at
 *    ship time.
 */

const NOTE_WEIGHTS = { top: 0.2, heart: 0.35, base: 0.45 } as const;

function jaccard(a: string[], b: string[]): number {
  const setA = new Set(a.map((n) => n.toLowerCase()));
  const setB = new Set(b.map((n) => n.toLowerCase()));
  if (setA.size === 0 && setB.size === 0) return 0;
  let intersection = 0;
  for (const n of setA) if (setB.has(n)) intersection += 1;
  const union = new Set([...setA, ...setB]).size;
  return union === 0 ? 0 : intersection / union;
}

function noteOverlap(a: FragranceNotes, b: FragranceNotes): number {
  return (
    jaccard(a.top, b.top) * NOTE_WEIGHTS.top +
    jaccard(a.heart, b.heart) * NOTE_WEIGHTS.heart +
    jaccard(a.base, b.base) * NOTE_WEIGHTS.base
  );
}

const FACET_KEYS: (keyof FacetScores)[] = [
  "freshness",
  "sweetness",
  "warmth",
  "woodyDepth",
  "longevity",
  "sillage",
];

function facetCloseness(a: FacetScores, b: FacetScores): number {
  const totalDiff = FACET_KEYS.reduce((sum, key) => sum + Math.abs(a[key] - b[key]), 0);
  const avgDiff = totalDiff / FACET_KEYS.length;
  return 1 - avgDiff / 10;
}

/** The subset of ReferenceFragrance/DupeCandidate that noteOverlap and
 *  facetCloseness actually read. Both real types satisfy this shape, so
 *  computeOriginalSimilarity below can accept a ReferenceFragrance on both
 *  sides without a new scoring scheme, and computeSimilarity's familyBonus()
 *  call can accept a ReferenceFragrance/DupeCandidate pair the same way. */
export interface ScentProfile {
  family: string;
  notes: FragranceNotes;
  facets: FacetScores;
}

/**
 * 0.4 partial credit is an editorial choice (same convention as the facet
 * scores: not a measurement), not a measured constant.
 */
const CROSS_FAMILY_CREDIT = 0.4;

/** Full credit if both sides share an olfactive family, partial credit
 *  otherwise. Shared by computeSimilarity and computeOriginalSimilarity so
 *  there is exactly one definition of "family match" on this site - until
 *  2026-09-08 computeSimilarity instead hardcoded this to 1, because
 *  DupeCandidate had no `family` field to compare against
 *  reference.family with at all (every fixture listing happened to share
 *  its reference's family, which is why the bug was never exercised - see
 *  lib/types.ts's doc comment on DupeCandidate.family). */
function familyBonus(a: ScentProfile, b: ScentProfile): number {
  return a.family === b.family ? 1 : CROSS_FAMILY_CREDIT;
}

/** Used whenever ingredient data is not available on both sides of a
 *  comparison - i.e. every listing today. Identical to the formula's
 *  weights before the 2026-09-08 ingredient component existed, so a
 *  listing with no ingredient data scores exactly as it always has. */
const BASE_WEIGHTS = { notes: 0.5, facets: 0.35, family: 0.15 } as const;

/** Used only when BOTH sides of a comparison have a non-empty ingredients
 *  list. NOT derived from BASE_WEIGHTS by proportionally redistributing 15
 *  points across the other three - that would land at roughly 47/35/18
 *  instead of 50/35/15, shifting every ingredient-less score by a point or
 *  two the moment this shipped. Two hand-authored constants instead, so the
 *  no-ingredient-data case is bit-identical to the pre-2026-09-08 formula. */
const FULL_WEIGHTS = { notes: 0.4, facets: 0.3, family: 0.15, ingredients: 0.15 } as const;

function hasIngredientData(p: { ingredients?: string[] }): boolean {
  return !!p.ingredients && p.ingredients.length > 0;
}

/** Returns an integer 0-100 similarity score. This is the RAW score - see
 *  lib/verification.ts's getPublishedScore for the imputed-pyramid penalty
 *  and the 90%/95% ceilings applied before anything here is shown to a
 *  buyer. Components must never call this directly for anything a user
 *  sees; call lib/catalog.ts's getPublishedSimilarity instead. */
export function computeSimilarity(reference: ReferenceFragrance, dupe: DupeCandidate): number {
  const notesScore = noteOverlap(reference.notes, dupe.notes);
  const facetsScore = Math.max(0, facetCloseness(reference.facets, dupe.facets));
  const familyScore = familyBonus(reference, dupe);

  if (hasIngredientData(reference) && hasIngredientData(dupe)) {
    const ingredientsScore = jaccard(reference.ingredients!, dupe.ingredients!);
    const raw =
      notesScore * FULL_WEIGHTS.notes +
      facetsScore * FULL_WEIGHTS.facets +
      familyScore * FULL_WEIGHTS.family +
      ingredientsScore * FULL_WEIGHTS.ingredients;
    return Math.round(raw * 100);
  }

  const raw = notesScore * BASE_WEIGHTS.notes + facetsScore * BASE_WEIGHTS.facets + familyScore * BASE_WEIGHTS.family;
  return Math.round(raw * 100);
}

/**
 * Similarity between two ORIGINAL reference fragrances - e.g. for a
 * "related originals" module on a fragrance page. Reuses the exact same
 * noteOverlap/facetCloseness/familyBonus weighting as computeSimilarity's
 * no-ingredient-data path (50% notes / 35% facets / 15% family) - not a
 * different formula, and not extended with an ingredient term: there is no
 * DupeCandidate or producer-submitted data on either side here, so the
 * scoring problem the ingredient component and the ceilings in
 * lib/verification.ts exist to solve does not apply. See that file's
 * module doc for why this function's callers never route through
 * getPublishedScore either.
 */
export function computeOriginalSimilarity(a: ScentProfile, b: ScentProfile): number {
  const notesScore = noteOverlap(a.notes, b.notes);
  const facetsScore = Math.max(0, facetCloseness(a.facets, b.facets));
  const familyScore = familyBonus(a, b);
  const raw = notesScore * BASE_WEIGHTS.notes + facetsScore * BASE_WEIGHTS.facets + familyScore * BASE_WEIGHTS.family;
  return Math.round(raw * 100);
}

/** Ranks every other reference in the catalog by similarity to `reference`
 *  (via computeOriginalSimilarity) and returns the top `limit`, ties broken
 *  alphabetically by name for a stable order. Excludes `reference` itself. */
export function getRelatedReferences<T extends ScentProfile & { slug: string; name: string }>(
  reference: T,
  candidates: T[],
  limit = 6
): (T & { similarity: number })[] {
  return candidates
    .filter((c) => c.slug !== reference.slug)
    .map((c) => ({ ...c, similarity: computeOriginalSimilarity(reference, c) }))
    .sort((x, y) => y.similarity - x.similarity || x.name.localeCompare(y.name))
    .slice(0, limit);
}

export function pricePerMl(priceUsd: number, bottleMl: number): number {
  return priceUsd / bottleMl;
}

export function formatPricePerMl(priceUsd: number, bottleMl: number): string {
  return `$${pricePerMl(priceUsd, bottleMl).toFixed(2)}/ml`;
}

/** A price for the original, and the bottle it belongs to. */
export interface OriginalPricing {
  priceUsd: number;
  bottleMl: number;
}

/**
 * How many times cheaper (per ml) the dupe is versus the original.
 *
 * `original` defaults to the reference's own hand-maintained figures, but call
 * sites should pass `getOriginalPricing(reference)` from lib/catalog.ts so the
 * comparison runs against **the retailer's actual price** wherever we have
 * one. Founder's call, 2026-09-07: the site shows what the shop charges and
 * compares against that. Two different prices for the same bottle on one page
 * — a hand-maintained "retail" figure driving the claim while the buy button
 * showed something lower — was the alternative, and it is worse.
 *
 * A `ReferenceFragrance` structurally satisfies OriginalPricing, which is why
 * the default is just `reference`.
 */
export function valueMultiple(
  reference: ReferenceFragrance,
  dupe: DupeCandidate,
  original: OriginalPricing = reference
): number {
  const refPerMl = pricePerMl(original.priceUsd, original.bottleMl);
  const dupePerMl = pricePerMl(dupe.priceUsd, dupe.bottleMl);
  return refPerMl / dupePerMl;
}

/**
 * valueMultiple as a phrase, because `${multiple.toFixed(1)}x cheaper` is a
 * FALSE PRICE CLAIM whenever the multiple is at or below 1, and both call
 * sites used to render exactly that.
 *
 * It stayed invisible for as long as every listing happened to be several
 * times cheaper than its original. It stopped being invisible on 2026-09-04:
 * AromaPassions' Eros interpretation is $39/50ml against Versace's $75/100ml,
 * a multiple of 0.96 — which the old code would have rounded to the words
 * "1.0x cheaper" on a page whose entire purpose is to get that comparison
 * right, one click from the merchant page that disproves it. Cheap designer
 * originals are where dupe economics stop working, so this will recur.
 *
 * The 0.95–1.05 dead band exists so a fraction of a per cent either way is not
 * announced as a saving or a penalty; inside it the honest answer is neither.
 */
export function describeValueMultiple(multiple: number): string {
  if (multiple >= 1.05) return `${multiple.toFixed(1)}x cheaper`;
  if (multiple <= 0.95) return `${(1 / multiple).toFixed(1)}x more expensive`;
  return "no cheaper";
}

export const RADAR_AXES: { key: keyof FacetScores; label: string }[] = [
  { key: "freshness", label: "Freshness" },
  { key: "sweetness", label: "Sweetness" },
  { key: "warmth", label: "Warmth" },
  { key: "woodyDepth", label: "Woody Depth" },
  { key: "longevity", label: "Longevity" },
  { key: "sillage", label: "Sillage" },
];

export function buildRadarData(reference: FacetScores, dupe: FacetScores) {
  return RADAR_AXES.map(({ key, label }) => ({
    axis: label,
    Reference: reference[key],
    Dupe: dupe[key],
  }));
}
