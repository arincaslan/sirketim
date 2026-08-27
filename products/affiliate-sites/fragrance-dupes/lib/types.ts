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
  /** Buy-the-original link. Added for the marketplace pivot (MARKETPLACE-PLAN.md
   *  §1): COUNTERSCENT earns on originals too, not just dupes, so every reference
   *  needs its own outbound link. Optional - a reference with no enrolled
   *  program simply renders no buy action. */
  affiliateLinkId?: string;
  /**
   * Licensed product photograph, when one exists.
   *
   * Deliberately empty for every entry right now. A perfume bottle is
   * protected trade dress, so there are exactly two lawful ways to fill this
   * and neither is available yet: imagery supplied by the affiliate program
   * we enrol in (the normal route - networks provide product shots to
   * affiliates for this purpose), or a photo we take ourselves of a bottle we
   * own. Generating a bottle render is not a third option and is ruled out by
   * departments/web-development/CLAUDE.md's trademark caution; nor is reusing
   * a retailer's photo without a licence.
   *
   * Until then components fall back to a generated note signature - see
   * lib/fragrance-visual.ts and components/fragrance/fragrance-image.tsx.
   */
  imageUrl?: string;
}

/**
 * A seller listing dupes on COUNTERSCENT. Producers are first-class as of the
 * marketplace pivot (MARKETPLACE-PLAN.md §3) - previously a dupe's `brand`
 * string was the only trace of who made it, which cannot carry subscription
 * state, an approval queue, or a producer-branded browse page.
 *
 * `isHouse` marks COUNTERSCENT's own fragrance line: no subscription, no approval
 * workflow, and it sells on margin rather than affiliate commission.
 */
export interface Producer {
  slug: string;
  name: string;
  blurb: string;
  isHouse?: boolean;
}

/**
 * How much independent checking stands behind a listing's declared data.
 *
 * Added because the comparison score is computed from data the producer
 * self-reports (notes, facets) - see lib/verification.ts for the standard
 * this drives. "verified" is earned by editorial review, never defaulted to,
 * and "flagged" is a hard gate: a flagged listing cannot render live
 * regardless of subscription tier.
 */
export type VerificationStatus = "declared" | "verified" | "flagged";

export interface DupeCandidate {
  slug: string;
  referenceSlug: string;
  name: string;
  brand: string;
  /** Which Producer lists this. See `PRODUCERS` in lib/producers.ts. */
  producerSlug: string;
  /** Absent for house products, which route to our own buy flow rather than
   *  an outbound affiliate redirect. */
  affiliateLinkId?: string;
  notes: FragranceNotes;
  facets: FacetScores;
  longevityHoursRange: [number, number];
  sillageLabel: SillageLabel;
  priceUsd: number;
  bottleMl: number;
  concentration: string;
  /** House products only: real production cost per bottle, used for margin
   *  reporting. Never rendered to buyers. */
  costUsd?: number;
  verdict: string;
  /**
   * Defaults to "declared" when absent - see lib/verification.ts. Every
   * fixture listing in lib/dupes-data.ts is implicitly "declared" (none of
   * this data has actually been independently checked against a real
   * product), which is honest: this field exists to stop unverified
   * self-report from silently reading as more trustworthy than it is, not to
   * retroactively certify demo data as verified.
   */
  verificationStatus?: VerificationStatus;
}

/**
 * A review written by a buyer, distinct from the editorial `review` MDX
 * content type (content/review/*.mdx) which the content department writes.
 * See MARKETPLACE-PLAN.md §2/§3.
 *
 * `status` exists because moderation policy is still an open question
 * (MARKETPLACE-PLAN.md §5) - the type supports a pre-moderation queue whether
 * or not the eventual policy uses one. Only `approved` reviews render.
 */
export type ReviewStatus = "pending" | "approved" | "rejected";

export interface CustomerReview {
  id: string;
  /** Slug of the dupe or reference fragrance being reviewed. */
  targetSlug: string;
  author: string;
  /** 1-5 whole stars. */
  rating: number;
  body: string;
  /** ISO date. */
  createdAt: string;
  /** Whether the purchase behind this review could be confirmed. Always false
   *  today: the site only redirects to someone else's checkout, so it cannot
   *  yet verify a purchase happened (MARKETPLACE-PLAN.md §5). */
  verifiedPurchase: boolean;
  status: ReviewStatus;
}
