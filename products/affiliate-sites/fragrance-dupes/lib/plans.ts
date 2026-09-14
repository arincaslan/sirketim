/**
 * Billing vocabulary. These lived in lib/stripe.ts until that file was deleted
 * on 2026-08-27 - Stripe cannot serve a Turkey-based business, so a payment
 * processor had no business owning the pricing page's type layer. They are
 * provider-neutral and survive whichever rail is chosen (Paddle is the current
 * expectation; see FINALIZATION-GUIDE.md phase 5 and prisma/schema.prisma's
 * PaymentProvider enum).
 */
export type PaidTier = "standard" | "featured";
export type BillingInterval = "monthly" | "yearly";

export function isPaidTier(value: string): value is PaidTier {
  return value === "standard" || value === "featured";
}

export function isBillingInterval(value: string): value is BillingInterval {
  return value === "monthly" || value === "yearly";
}

/**
 * Producer plan definitions, from PRODUCER-PROGRAM.md §3.
 *
 * THE REVENUE MODEL IS NOW DECIDED - founder, 2026-09-10, after a board round.
 * Free tier of ONE listing, paid upgrade above it, and NO COMMISSION ON ANY
 * PAID TIER. See `takesCommission` below for why that last part is the load-
 * bearing one. This settles PRODUCER-PROGRAM.md §8 item 1, which had gated
 * every other item in that list.
 *
 * ====================== THE NUMBERS ARE STILL PLACEHOLDERS ===============
 * The founder set the SHAPE and asked for the paid tiers to come down; the
 * board's recommendation on model was accepted with that one change. What
 * nobody has done is §3's actual research into what these houses currently
 * spend on customer acquisition, so 19/49 are a considered guess, not a price.
 *
 * They must not be shown to a real producer as final. Today that risk is
 * contained because the programme is not open and every producer page says so
 * - but the day it opens, these become invented prices quoted to real
 * businesses, which is the placeholder-data rule in the root CLAUDE.md.
 * Real prices will live as price objects in whichever provider is chosen
 * (Paddle is the board's recommendation; NOT iyzico for a US-billed
 * subscription - see departments/accounting/reports/payment-rails-investigation.md),
 * referenced by id from env, and these numbers must be kept in step with them.
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
  /**
   * Whether COUNTERSCENT earns affiliate commission on sales from this tier's
   * listings.
   *
   * FOUNDER DECISION, 2026-09-10: false on every PAID tier. A subscriber pays
   * a fee and we take nothing on their sales; the free tier is commission-only.
   * This is the "subscription instead of commission, not alongside" option from
   * PRODUCER-PROGRAM.md §2, applied to the paid tiers.
   *
   * It is not only a pricing choice, it is the strongest integrity property the
   * programme has. §2 names it directly: it "decouples our revenue from ranking
   * outcomes". Once we earn nothing per click or per sale from a paying
   * producer, we have no financial interest in where their listing ranks or how
   * much traffic it gets — which is exactly the conflict a marketplace that
   * charges AND takes commission has to keep explaining away. Do not quietly
   * reintroduce commission on a paid tier to lift revenue; it would cost the
   * one claim that makes the rest of §7 believable.
   */
  takesCommission: boolean;
}

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    tagline: "Test the channel before paying for it.",
    priceMonthly: null,
    priceYearly: null,
    // One, not two — founder decision 2026-09-10. The free tier is a taste of
    // the channel, not a way to run a small catalogue indefinitely for nothing.
    // One listing is enough to see real click data on a real comparison, which
    // is the whole sales argument; it is not enough to cover a range.
    listings: "1 listing",
    features: [
      "Appears in ranked comparisons",
      "Total click count",
      // NOT a review-time promise. This said "Reviewed within 3 business
      // days", which nobody measured - no submission has ever been reviewed,
      // so there is no figure, and PRODUCER-TERMS §5 commits us to publishing
      // a review time only once real ones exist. It was live on
      // /producers/pricing, which is where a producer reads it before paying.
      //
      // What replaces it is the fact that actually matters and is true today:
      // a person decides, and nothing is auto-approved. That is the control
      // floor of the whole programme, not a service level.
      "Reviewed by a person, never auto-approved",
    ],
    // The free tier is how the site earns from a non-subscriber: their listing
    // carries our affiliate link and we take commission on sales.
    takesCommission: true,
  },
  {
    id: "standard",
    name: "Standard",
    tagline: "For a catalog that covers a range of originals.",
    priceMonthly: 19,
    priceYearly: 190,
    listings: "25 listings",
    // TWO FEATURES WERE REMOVED HERE, and both were being SOLD on a live
    // pricing page for things the repo has decided not to build.
    //
    // "Your own producer page" is a public producer directory, which is on
    // HANDOFF's do-not-build list for a specific reason: lib/producers.ts is
    // fixture data naming eighteen real, operating companies, none of which
    // signed up. A browse-by-producer surface would assert a commercial
    // relationship with every one of them.
    //
    // "Reply to customer reviews" promised a review system that does not
    // exist and was deliberately dismantled. lib/reviews.ts is empty because
    // it once carried six invented reviews about real named companies, which
    // is FTC Fake Reviews Rule and trade-libel territory rather than a
    // tidiness problem. Selling replies to reviews we do not have would be
    // the first step back toward inventing them.
    //
    // What replaces them are two things the schema already models and the
    // terms already commit to: SubmissionRevision (PRODUCER-TERMS §4) and
    // publishState WITHDRAWN_BY_PRODUCER (§10).
    features: [
      "Everything in Free",
      "We take no commission on your sales",
      "Per-listing and per-original click data",
      "Request an edit to a published listing",
      "Withdraw a listing yourself, any time",
    ],
    highlighted: true,
    takesCommission: false,
  },
  {
    id: "featured",
    name: "Featured",
    tagline: "For a full catalog and conversion data.",
    priceMonthly: 49,
    priceYearly: 490,
    listings: "Unlimited listings",
    features: [
      "Everything in Standard",
      "Conversion data, not just clicks",
      "Priority in the approval queue",
    ],
    takesCommission: false,
  },
];

/**
 * Tiers on which we take no commission. Exported so a page can state the fact
 * rather than a component hardcoding which tiers those are — the set is a
 * business decision and it will be read back by the publish path, which has to
 * know whether a listing gets an affiliate link or a direct store link.
 */
export function tiersWithoutCommission(): PlanId[] {
  return PLANS.filter((p) => !p.takesCommission).map((p) => p.id);
}

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
  // Was "Removal of a customer review", which quietly implied this site has
  // customer reviews. It does not - lib/reviews.ts is empty on purpose. A
  // "you cannot buy this" list has to name things that exist, or the reader
  // learns the wrong thing about the product from the disclaimer.
  //
  // What stands here instead is the strongest of the four and the one a
  // paying producer is most likely to ask for: the verdict is written in our
  // voice, it will say where their fragrance falls short, and they do not get
  // approval over it. PRODUCER-TERMS §4.
  "Approval over the verdict we write",
];
