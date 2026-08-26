import type { BillingInterval, PaidTier } from "@/lib/stripe";

/**
 * Producer plan definitions, from PRODUCER-PROGRAM.md §3.
 *
 * ============================ PRICES ARE PLACEHOLDERS ====================
 * The founder has not set pricing. PRODUCER-PROGRAM.md §2 leaves the revenue
 * model itself open (the standing recommendation is free tier + paid upgrade
 * with commission on all tiers, rather than the subscription-AND-commission
 * double-dip, because a small dupe house with thin margins may simply not
 * sign up). §3 says the numbers need real research into what these houses
 * currently spend on customer acquisition.
 *
 * The values below are plausible-but-invented so the pricing page has
 * something to render. They must not be published to real producers before
 * the founder sets them. Real prices ultimately live as Stripe Price objects
 * (lib/stripe.ts reads their ids from env) - these numbers are only for
 * display and must be kept in step with whatever is configured there.
 * =========================================================================
 *
 * The hard rule from §7, encoded in what these tiers may contain: no tier
 * buys rank, score, or placement. "Priority in the approval queue" is the
 * only defensible paid advantage over another producer, because it affects
 * how fast we look at a submission, not where it lands in a comparison.
 */

export type PlanId = "free" | PaidTier;

export interface Plan {
  id: PlanId;
  name: string;
  tagline: string;
  /** USD. null for the free tier. Placeholder values - see the header. */
  priceMonthly: number | null;
  priceYearly: number | null;
  listings: string;
  features: string[];
  /** Rendered as the emphasised option on the pricing page. */
  highlighted?: boolean;
}

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    tagline: "Test the channel before paying for it.",
    priceMonthly: null,
    priceYearly: null,
    listings: "2 listings",
    features: [
      "Appears in ranked comparisons",
      "Total click count",
      "Reviewed within 3 business days",
    ],
  },
  {
    id: "standard",
    name: "Standard",
    tagline: "For a catalog that covers a range of originals.",
    priceMonthly: 29,
    priceYearly: 290,
    listings: "25 listings",
    features: [
      "Everything in Free",
      "Your own producer page",
      "Per-listing and per-original click data",
      "Reply to customer reviews",
    ],
    highlighted: true,
  },
  {
    id: "featured",
    name: "Featured",
    tagline: "For a full catalog and conversion data.",
    priceMonthly: 79,
    priceYearly: 790,
    listings: "Unlimited listings",
    features: [
      "Everything in Standard",
      "Conversion data, not just clicks",
      "Priority in the approval queue",
    ],
  },
];

export function getPlan(id: PlanId): Plan | undefined {
  return PLANS.find((p) => p.id === id);
}

export function priceFor(plan: Plan, interval: BillingInterval): number | null {
  return interval === "yearly" ? plan.priceYearly : plan.priceMonthly;
}

/** Months of an annual plan effectively free, for the "save" badge. Derived
 *  rather than hardcoded so it stays true if either price changes. */
export function yearlySavingMonths(plan: Plan): number | null {
  if (plan.priceMonthly == null || plan.priceYearly == null) return null;
  const monthsPaid = plan.priceYearly / plan.priceMonthly;
  const saved = 12 - monthsPaid;
  return saved > 0 ? Math.round(saved * 10) / 10 : null;
}

/**
 * What every tier explicitly does NOT buy. Rendered on the pricing page as a
 * shared row beneath the tiers rather than repeated per-plan, because it is
 * the same for all of them - which is the point (PRODUCER-PROGRAM.md §7).
 */
export const NEVER_INCLUDED = [
  "A better match score",
  "A higher rank, at any tier",
  "A premium or featured slot in results",
  "Removal of a customer review",
];
