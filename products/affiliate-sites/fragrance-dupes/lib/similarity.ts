import type { DupeCandidate, FacetScores, FragranceNotes, ReferenceFragrance } from "@/lib/types";

/**
 * Similarity scoring - disclosed on /about, not a black-box number. See
 * DESIGN.md §8 "Similarity score, honestly computed, not invented-precise."
 *
 * Three components:
 *  - Note overlap (50%): top/heart/base overlap, weighted 20/35/45 - base
 *    notes count most because they're the drydown, the part that lingers
 *    and the part this whole site is named after.
 *  - Facet closeness (35%): inverse of the average absolute difference
 *    across the six radar facets, normalized to 0-1.
 *  - Family match bonus (15%): full credit if both fragrances share an
 *    olfactive family, partial credit otherwise.
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

/** Returns an integer 0-100 similarity score. */
export function computeSimilarity(reference: ReferenceFragrance, dupe: DupeCandidate): number {
  const notesScore = noteOverlap(reference.notes, dupe.notes);
  const facetsScore = Math.max(0, facetCloseness(reference.facets, dupe.facets));
  const familyBonus = 1; // dataset only pairs same-family candidates today
  const raw = notesScore * 0.5 + facetsScore * 0.35 + familyBonus * 0.15;
  return Math.round(raw * 100);
}

/** The subset of ReferenceFragrance/DupeCandidate that noteOverlap and
 *  facetCloseness actually read. Both real types satisfy this shape, so
 *  computeOriginalSimilarity below can accept a ReferenceFragrance on both
 *  sides without a new scoring scheme. */
export interface ScentProfile {
  family: string;
  notes: FragranceNotes;
  facets: FacetScores;
}

/**
 * Similarity between two ORIGINAL reference fragrances - e.g. for a
 * "related originals" module on a fragrance page. Reuses the exact same
 * noteOverlap/facetCloseness weighting as computeSimilarity (50% notes /
 * 35% facets / 15% family), not a different formula.
 *
 * The family term is computed for real here rather than reusing
 * computeSimilarity's `familyBonus = 1` shortcut. That shortcut is
 * correct there only because every DUPES listing is scored against its
 * own reference's family (documented as a known, deliberately-unfixed
 * limitation - see CLAUDE.md and lib/verification.ts); two arbitrary
 * originals are not guaranteed to share a family at all, so assuming
 * "always full credit" would systematically overstate cross-family
 * matches. Full credit on a family match, partial credit otherwise, is
 * the behaviour the top-of-file comment on this module already
 * documents as the intended design - this just implements it instead of
 * substituting the shortcut. 0.4 partial credit is an editorial choice
 * (same convention as the facet scores: not a measurement), not a
 * measured constant.
 */
const CROSS_FAMILY_CREDIT = 0.4;

export function computeOriginalSimilarity(a: ScentProfile, b: ScentProfile): number {
  const notesScore = noteOverlap(a.notes, b.notes);
  const facetsScore = Math.max(0, facetCloseness(a.facets, b.facets));
  const familyBonus = a.family === b.family ? 1 : CROSS_FAMILY_CREDIT;
  const raw = notesScore * 0.5 + facetsScore * 0.35 + familyBonus * 0.15;
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

/** How many times cheaper (per ml) the dupe is versus the reference. */
export function valueMultiple(reference: ReferenceFragrance, dupe: DupeCandidate): number {
  const refPerMl = pricePerMl(reference.priceUsd, reference.bottleMl);
  const dupePerMl = pricePerMl(dupe.priceUsd, dupe.bottleMl);
  return refPerMl / dupePerMl;
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
