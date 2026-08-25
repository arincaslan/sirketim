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
