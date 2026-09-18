/**
 * Billing vocabulary. These lived in lib/stripe.ts until that file was deleted
 * on 2026-08-27 - Stripe cannot serve a Turkey-based business, so a payment
 * processor had no business owning the pricing page's type layer. They are
 * provider-neutral and survive whichever rail is chosen (Paddle is the current
 * expectation; see FINALIZATION-GUIDE.md phase 5 and prisma/schema.prisma's
 * PaymentProvider enum).
 */
/**
 * RENAMED 2026-09-18: the top tier was `featured`, and it is now `unlimited`.
 *
 * The old name was the one thing the programme promises the tier does NOT buy.
 * NEVER_INCLUDED at the foot of this file still reads "A premium or featured
 * slot in results" - that line is the promise and it does not move - so the
 * tier and the disclaimer were using the same word for opposite things, and
 * every honest explanation of the tier had to open by untangling it.
 *
 * `unlimited` names what the tier actually buys, which is the allowance, and
 * cannot be misread as placement. FINALIZATION-GUIDE 3.6b already uses the word
 * in exactly this sense: unlimited ORIGINALS COVERED, one listing per
 * (producer, reference) pair, never unlimited rows.
 *
 * This is the tier ID, not just a label, so it is stored in `Producer.plan` and
 * switched on in the Worker. Zero producers exist, so there is no data to
 * migrate - which is why it was cheap today and would not have been later.
 */
export type PaidTier = "standard" | "unlimited";
export type BillingInterval = "monthly" | "yearly";

export function isPaidTier(value: string): value is PaidTier {
  return value === "standard" || value === "unlimited";
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
 * AMENDED 2026-09-18, founder: THE FREE TIER TOO. There is now no commission
 * anywhere in the producer programme, so `takesCommission` is false on all
 * three tiers and the subscription is the only thing a producer ever pays us.
 * What that costs and what it buys is argued at `takesCommission`. The one
 * consequence to carry everywhere else: the free tier is now a funnel with no
 * revenue of its own, so "how many free listings do we carry" is a cost
 * question, not a revenue-mix question, and the answer stays ONE listing.
 *
 * ====================== THE NUMBERS ARE STILL PLACEHOLDERS ===============
 * The founder set the SHAPE and asked for the paid tiers to come down; the
 * board's recommendation on model was accepted with that one change. What
 * nobody has done is §3's actual research into what these houses currently
 * spend on customer acquisition, so 12/49 are a considered guess, not a price.
 * (Standard was 19 until 2026-09-18; the founder cut it to 12 because the jump
 * from one listing to twenty-five is a large first step to ask money for.)
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
   * IT IS FALSE ON ALL THREE TIERS AND THAT IS THE POINT. The field survives as
   * a field, rather than collapsing into a constant, because the publish path
   * reads it to decide whether a listing gets an affiliate link or a direct
   * store link — and because a per-tier flag is where someone would reach first
   * to reintroduce commission quietly. Leaving it visible per tier makes that
   * a diff somebody can see.
   *
   * FOUNDER DECISION, 2026-09-10: false on every PAID tier. A subscriber pays a
   * fee and we take nothing on their sales. This is the "subscription instead
   * of commission, not alongside" option from PRODUCER-PROGRAM.md §2.
   *
   * FOUNDER DECISION, 2026-09-18: false on the FREE tier as well. The earlier
   * split left the claim needing an asterisk — "we take no commission" was true
   * of subscribers and false of everyone else, which is the version a producer
   * on the free tier reads as a bait. It also put us in the position the whole
   * policy exists to avoid: on the free tier our revenue rose with a listing's
   * traffic, so the tier with the LEAST scrutiny was the only one we had a
   * financial reason to favour. Now the sentence is unqualified, and the
   * ranking formula has nothing behind it to be suspicious of at any tier.
   *
   * WHAT IT COSTS, stated plainly so nobody rediscovers it as a surprise: the
   * free tier now earns nothing at all. It is a funnel and a cost, justified by
   * conversion to a paid tier, not by its own sales. If that conversion never
   * materialises, the answer is to change the free ALLOWANCE or close the tier
   * — not to put commission back on it. Reintroducing it would cost the one
   * claim that makes the rest of PRODUCER-PROGRAM §7 believable, and it would
   * now be a visible reversal of a published promise rather than a tweak.
   *
   * None of this touches the catalogue's OWN affiliate revenue from merchants
   * (FragranceShop, Perfumania, the dupe houses). That is a different
   * counterparty and it is what funds the site; see app/disclosure.
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
      // MOVED HERE FROM STANDARD on 2026-09-18, when it stopped being an
      // upgrade. Leaving it on Standard under "Everything in Free" would have
      // gone on selling, as a $19 benefit, something the free tier now has.
      "We take no commission on your sales",
      "Total click count",
      // SELF-SERVE WITHDRAWAL IS NOT A FREE-TIER FEATURE. Founder decision,
      // 2026-09-18, which reverses the 2026-09-16 ruling that it was.
      //
      // The history matters because the contradiction has now been settled in
      // both directions and someone will find the older note. On 16 Sep the
      // founder ruled the free tier MAY withdraw, and src/routes/withdraw.ts
      // was written to say so in its header; lib/plans.ts was never updated to
      // match, so for two days the pricing page sold it as a paid feature while
      // the code gave it away. Today the founder resolved the mismatch the
      // other way: the feature is Standard's, and the CODE is what changes.
      //
      // The cost, which is real and was accepted: a free producer's single
      // listing is no longer a choice they can revisit on their own. They ask
      // us. That has to be said where they would otherwise press a button and
      // find out, which is why /console/withdraw refuses with an explanation
      // and a mail link rather than hiding the control.
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
    // FALSE SINCE 2026-09-18. This said "the free tier is how the site earns
    // from a non-subscriber: their listing carries our affiliate link and we
    // take commission on sales" - which was the whole revenue case for the
    // tier, and the founder has withdrawn it. A free listing now links straight
    // to the producer's own store, with no network in the middle, exactly like
    // a subscriber's.
    takesCommission: false,
  },
  {
    id: "standard",
    name: "Standard",
    tagline: "For a catalog that covers a range of originals.",
    // PRICE CUT 19 -> 12 -> 9.99, founder, 2026-09-18, twice in one day. The
    // second cut came with a stated goal that the first did not have - "i want
    // lots of subscribers" - so this tier is now priced for volume rather than
    // for margin, and the ladder was reshaped to match rather than just
    // discounted: the allowance came DOWN from twenty-five to twelve at the
    // same time.
    //
    // THE ALLOWANCE CUT IS THE DELIBERATE HALF. Dropping the price while
    // leaving twenty-five listings would have made Unlimited nearly
    // unsellable, because twenty-five covers almost any real dupe house's
    // catalogue - the top tier would have been buying a number nobody reaches.
    // Twelve is a catalogue a producer can actually outgrow, which is what
    // makes the step above it mean something.
    //
    // THE .99 IS CHARM PRICING AND NOTHING MORE. The founder asked for 9.99
    // over 10 explicitly ("would be more appealing"). It is worth recording
    // that this is the first number on this page chosen for how it reads
    // rather than for what it recovers.
    //
    // YEARLY IS 99, WHICH BREAKS THE OLD RATIO ON PURPOSE. Every previous pair
    // was exactly ten months for twelve (190/19, 120/12). 99/9.99 is 9.91
    // months, so the annual deal is now slightly BETTER than the old one, and
    // the "12 months for the price of N" line stops rendering because N is no
    // longer whole. That is the honest outcome: 99 reads better than 99.90 and
    // the saving is real either way. See yearlySavingMonths(), which is derived
    // and still correct.
    //
    // STILL A PLACEHOLDER. Section 3's research into what these houses actually
    // spend on acquisition has not been done, and the header's warning applies
    // to 9.99 exactly as it applied to 19.
    priceMonthly: 9.99,
    priceYearly: 99,
    // MIRRORED BY HAND IN THE WORKER. counterscent-producers'
    // src/lib/producer.ts has its own allowanceForTier() switch with this
    // number written into it, because a string like "12 listings" is copy and
    // an allowance is a capability - the Worker will not parse one out of the
    // other. `npm run generate` copies this STRING and does not touch that
    // switch, so changing the number here without changing it there ships a
    // page that promises twelve and a gate that enforces twenty-five.
    listings: "12 listings",
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
    // "We take no commission on your sales" WAS HERE and moved to Free on
    // 2026-09-18. It is now true at every tier, so as a Standard bullet sitting
    // above "Everything in Free" it would have been charging for it twice.
    features: [
      "Everything in Free",
      "Per-listing and per-original click data",
      // Does not exist yet at any tier. The console's own button says so.
      "Request an edit to a published listing",
      // A REAL PAID FEATURE AS OF 2026-09-18, not an aspirational one: the
      // free tier is now gated out of it in withdraw.ts, so this line and the
      // code agree. That was not true for the two days the line sat here
      // unenforced.
      "Withdraw a listing yourself, any time",
    ],
    highlighted: true,
    takesCommission: false,
  },
  {
    id: "unlimited",
    name: "Unlimited",
    tagline: "For a full catalog and conversion data.",
    // PRICE CUT 49 -> 17.99, founder, 2026-09-18, same instruction and same
    // reasoning as Standard's: priced for subscriber volume, and charm-priced
    // on the founder's explicit preference.
    //
    // THE GAP BETWEEN THE TIERS NARROWED FROM 4.1x TO 1.8x, which is the part
    // worth watching. At 12 and 49 the top tier was a different decision; at
    // 9.99 and 17.99 it is an easy upsell, and that is presumably the point
    // given the volume goal. The risk is the mirror image: a producer who
    // would have paid 9.99 happily may now anchor on 17.99 and decide the
    // whole programme is cheap. Nothing here can settle that - it needs a
    // price nobody has tested on a population that does not yet exist.
    priceMonthly: 17.99,
    priceYearly: 179,
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
