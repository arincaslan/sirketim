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

/** Currencies merchants quote in. Never converted between — see MerchantOffer.price. */
export type Currency = "USD" | "GBP" | "EUR" | "AUD";

/**
 * One retailer's offer of one product: their price, their link, their name for
 * it. A listing carries an array of these because the same fragrance is sold
 * by several retailers at several prices, and the buyer picks.
 *
 * REPLACED the singular `merchantListing` + a listing-level `affiliateLinkId`
 * on 2026-09-01. The old shape allowed exactly one retailer, which forced the
 * UI to explain in prose why the one price it showed differed from the per-ml
 * figure beside it. With several offers on screen that explanation is
 * unnecessary: prices obviously differ between retailers, so showing them side
 * by side says it without a paragraph.
 *
 * `price` is the retailer's own figure in the retailer's own currency and is
 * NEVER converted. A hardcoded FX rate would be unsourced and would go stale
 * silently — and on a buy button it would be stale one click away from the page
 * that disproves it. This is also why offers are not sorted by price: ranking
 * £19.99 against $34.00 is an FX claim, and we do not have a sourced rate to
 * make it with. They render in authored order and nothing is labelled cheapest.
 *
 * `affiliateLinkId` is optional and its absence is meaningful: it means we are
 * not enrolled with that retailer, or are enrolled but their programme does not
 * track. Such an offer still renders — as a price with no button — because
 * "three retailers sell this, we can only link one" is useful and honest.
 */
export interface MerchantOffer {
  /** Retailer's display name, as a buyer would recognise it. */
  merchant: string;
  /** The retailer's own product title, verbatim from their feed. Kept
   *  unedited: it is what identifies which variant the price belongs to. */
  productName: string;
  /** The retailer's product page. Recorded so the claim is checkable; it is
   *  NOT what we link to — outbound clicks go through the affiliate network. */
  productUrl: string;
  price: number;
  currency: Currency;
  /**
   * Key into `affiliateLinks`. Absent = no working programme with this
   * retailer, so no buy button. Never point this at a merchant whose links
   * have not been traced end to end (see scripts/feeds/README.md).
   */
  affiliateLinkId?: string;
  /**
   * Whether the retailer had it in stock when last checked. `false` suppresses
   * the buy button; the row still renders, saying it is out of stock.
   *
   * Set from `node scripts/check-affiliate-links.mjs`, which reads the
   * merchant's own schema.org availability. **Do not take this from a product
   * feed.** The Awin feed said `in_stock=1` for the Armaf limited edition while
   * the live Opulensi page said `OutOfStock` — feed stock is a snapshot and
   * goes stale, the product page is the truth.
   *
   * Undefined means unchecked, and renders a button: we cannot re-verify every
   * offer continuously, and a link that is merely unchecked is not known-broken.
   * That is a deliberate trade — re-run the checker when it matters.
   */
  inStock?: boolean;
}

export interface DupeCandidate {
  slug: string;
  referenceSlug: string;
  name: string;
  brand: string;
  /** Which Producer lists this. See `PRODUCERS` in lib/producers.ts. */
  producerSlug: string;
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
   * Licensed product photograph, when one exists. Same constraint as
   * ReferenceFragrance.imageUrl above — a bottle is protected trade dress, so
   * this may only hold imagery supplied by an affiliate programme we are
   * enrolled in, or a photo of a bottle we own.
   *
   * Do NOT set this by hand. It is merged in from
   * lib/data/dupe-images.generated.ts, written by scripts/fetch-dupe-images.mjs,
   * which will only take an image for a listing whose merchant programme
   * actually tracks — because the licence rides on the affiliate relationship,
   * not on the picture. Hand-setting it is how a photograph from a closed
   * programme, or from a retailer we have no relationship with at all, ends up
   * shipped with nothing in the diff to say where it came from.
   */
  imageUrl?: string;
  /**
   * Why this listing is presented as an alternative to `referenceSlug` at all.
   *
   * The pairing is the single most consequential editorial claim on the page —
   * everything else (the score, the note diff, the price-per-ml) is downstream
   * of "these two are comparable". Until 2026-09-02 that claim rested entirely
   * on our own say-so, which is the weakest possible footing for the one thing
   * a reader is here to check.
   *
   * It turns out most of it does not have to. Retailers state the pairing
   * themselves — Opulensi sells Barakkat Rouge 540 at a URL ending
   * `inspired-by-baccarat-rouge-540`, and describes Bint Hooran as
   * `Inspired by "Good Girl"`. Quoting that is both stronger evidence and more
   * honest: it shows the reader who is claiming what.
   *
   * Recording it also makes disagreement visible. Bint Hooran is the case that
   * proves the point — the retailer claims the pairing and then publishes a
   * note list for it that shares almost nothing with Good Girl. That
   * contradiction is worth surfacing, and it can only be surfaced if the claim
   * and its source are stored rather than silently absorbed into our own voice.
   *
   * Absent means the pairing is our own editorial judgement, which is
   * legitimate but weaker. Say so rather than inventing a citation.
   */
  pairingBasis?: {
    /** Who makes the claim, e.g. "Opulensi product listing". */
    source: string;
    /** Their words, verbatim and short enough to be quoted in the UI. */
    quote: string;
    /** Where a reader can check it. */
    url?: string;
  };
  /**
   * Where this can actually be bought, one entry per retailer.
   *
   * At least one entry is expected on every third-party listing and it is how
   * the listing's existence is checkable: this array was once emptied because
   * it held product names that did not exist, attributed to real companies.
   * The fix was not "be more careful" — it was to require a third-party source
   * per listing and record it in the data, so a reviewer can verify a name
   * without taking our word for it. Each offer's `productName` and
   * `productUrl` are that record.
   *
   * An offer's `price` is a retailer's price for one presentation and is a
   * different figure from the listing's `priceUsd`, which is a typical street
   * price driving the per-ml comparison. They are deliberately separate: My
   * Perfume Shop lists Club de Nuit Intense Man at $129 and Opulensi's limited
   * edition runs GBP 68.99, against a street price near $40. Feeding a
   * retailer's price into "Nx cheaper per ml" would corrupt that claim.
   *
   * House products have no offers — they route to our own buy flow, which does
   * not exist yet, and say so rather than rendering a button.
   */
  offers?: MerchantOffer[];
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
