/**
 * GENERATED FILE. DO NOT EDIT BY HAND.
 *
 * Produced by scripts/generate-constants.mjs on 2026-09-18.
 * Regenerate with `npm run generate`.
 *
 * SOURCE: products/affiliate-sites/fragrance-dupes/lib/plans.ts
 * (PLANS and NEVER_INCLUDED). 3 tiers, 4 never-included lines.
 *
 * WHY THE FIGURES ARE HERE AT ALL. CONSOLE-PLAN 2.4 ruled that the console
 * would show no currency figures, because a hand-typed third copy of 19 and
 * 49 could drift behind lib/plans.ts and behind a payment provider's own
 * price objects with nothing able to catch it. The founder overruled the
 * ruling on 2026-09-16 and upheld the objection: the console shows real
 * figures, and they are generated rather than typed. That is what this file
 * is. If the catalogue's numbers move, this one is stale until somebody
 * regenerates, and `--check` is what says so.
 *
 * THE NUMBERS ARE STILL PLACEHOLDERS AT THE SOURCE. lib/plans.ts says in
 * its own header that 19 and 49 are a considered guess and not a price, and
 * no payment provider is connected to anything. Every surface that renders
 * them has to say so at the point of use.
 */

export interface GeneratedPlan {
  readonly id: string;
  readonly name: string;
  readonly tagline: string;
  /** USD. null on the free tier, which has no figure rather than a zero. */
  readonly priceMonthlyUsd: number | null;
  readonly priceYearlyUsd: number | null;
  /** The allowance as the catalogue words it. */
  readonly listings: string;
  readonly features: readonly string[];
  /** Whether Counterscent earns commission on this tier's sales. */
  readonly takesCommission: boolean;
}

export const PLANS: readonly GeneratedPlan[] = [
  {
    id: "free",
    name: "Free",
    tagline: "Test the channel before paying for it.",
    priceMonthlyUsd: null,
    priceYearlyUsd: null,
    listings: "1 listing",
    features: [
      "Appears in ranked comparisons",
      "We take no commission on your sales",
      "Total click count",
      "Reviewed by a person, never auto-approved",
    ],
    takesCommission: false,
  },
  {
    id: "standard",
    name: "Standard",
    tagline: "For a catalog that covers a range of originals.",
    priceMonthlyUsd: 9.99,
    priceYearlyUsd: 99,
    listings: "12 listings",
    features: [
      "Everything in Free",
      "Per-listing and per-original click data",
      "Request an edit to a published listing",
      "Withdraw a listing yourself, any time",
    ],
    takesCommission: false,
  },
  {
    id: "unlimited",
    name: "Unlimited",
    tagline: "For a full catalog and conversion data.",
    priceMonthlyUsd: 17.99,
    priceYearlyUsd: 179,
    listings: "Unlimited listings",
    features: [
      "Everything in Standard",
      "Conversion data, not just clicks",
      "Priority in the approval queue",
    ],
    takesCommission: false,
  },
];

/** What no tier buys, at any price. */
export const NEVER_INCLUDED: readonly string[] = [
  "A better match score",
  "A higher rank, at any tier",
  "A premium or featured slot in results",
  "Approval over the verdict we write",
];
