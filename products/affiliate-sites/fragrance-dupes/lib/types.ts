export type SillageLabel = "Intimate" | "Moderate" | "Strong" | "Beast Mode";

export interface FragranceNotes {
  top: string[];
  heart: string[];
  base: string[];
}

/** 0-10 editorial facet ratings, used for the radar chart. Not lab-measured
 *  data - an editorial estimate, same convention as the quiz-scoring pattern
 *  already used in fragrance-store-3's lib/quiz.ts. */
export interface FacetScores {
  freshness: number;
  sweetness: number;
  warmth: number;
  woodyDepth: number;
  longevity: number;
  sillage: number;
}

export interface ReferenceFragrance {
  slug: string;
  name: string;
  brand: string;
  family: string;
  notes: FragranceNotes;
  facets: FacetScores;
  longevityHoursRange: [number, number];
  sillageLabel: SillageLabel;
  priceUsd: number;
  bottleMl: number;
  concentration: string;
}

export interface DupeCandidate {
  slug: string;
  referenceSlug: string;
  name: string;
  brand: string;
  affiliateLinkId: string;
  notes: FragranceNotes;
  facets: FacetScores;
  longevityHoursRange: [number, number];
  sillageLabel: SillageLabel;
  priceUsd: number;
  bottleMl: number;
  concentration: string;
  verdict: string;
}
