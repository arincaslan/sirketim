import type { Sql } from "./auth";
import { PLANS } from "../generated/plans";

/**
 * Everything /console needs to read about an attached producer, in two
 * queries, plus the two domain rules that reading it requires.
 *
 * WHY THIS IS NOT IN src/routes/console.ts. The route renders three screens
 * and is long enough already, but the real reason is the second caller: the
 * submit route (Phase 2) has to count the same listings by the same rule
 * before it accepts anything, and quota enforcement that lives in a page is
 * quota enforcement the server does not do. The counting rule below is the
 * one the console's own copy promises, so a second, slightly different count
 * written next to the form would be a promise broken by arithmetic.
 *
 * Reads only. Nothing in this file writes, and nothing in Phase 1 writes
 * anywhere except the session tables.
 */

/* ---------------------------------------------------------------------- *
 * Plan allowance
 * ---------------------------------------------------------------------- */

/**
 * How many listings a tier covers.
 *
 * THIS IS A COPY OF A CAPABILITY, AND THE COPY IS THE RISK. Source of truth:
 * products/affiliate-sites/fragrance-dupes/lib/plans.ts, the `listings` field
 * on each plan ("1 listing", "12 listings", "Unlimited listings"). This is a
 * separate project with no import path to that file, so this mapping is
 * hand-written and can drift. It is deliberately the only thing copied:
 * prices are NOT copied here and must not be, because a third hand-typed copy
 * of a number that a payment provider will eventually also hold is a mismatch
 * nothing in any build could catch. An allowance is a capability we enforce
 * ourselves; a price is a figure somebody else will charge.
 *
 * "unknown" IS A REAL ANSWER AND NOT A FALLBACK TO BE TIDIED AWAY.
 * Subscription.tier is a free string in the schema, on purpose, because tier
 * names are a business decision still open. So a tier this console has never
 * heard of is reachable by somebody renaming a plan, not only by a bug, and
 * the honest response is to say we do not know the allowance rather than to
 * quietly grant one. Defaulting an unrecognised tier to 1 would tell a paying
 * producer they are full; defaulting it to unlimited would let them past a
 * limit they are paying to have raised.
 */
export type Allowance = number | "uncapped" | "unknown";

export function allowanceForTier(tier: string): Allowance {
  switch (tier) {
    case "free":
      return 1;
    // 25 -> 12 on 2026-09-18, in lockstep with the price cut to $9.99.
    //
    // THIS NUMBER AND THE CATALOGUE'S "12 listings" STRING ARE TWO COPIES AND
    // NOTHING CHECKS THEM AGAINST EACH OTHER. `npm run generate` copies the
    // plans' COPY across from fragrance-dupes/lib/plans.ts - names, taglines,
    // prices, and the `listings` string - but it cannot generate this switch,
    // because "12 listings" is a sentence and an allowance is an integer the
    // gate compares against. So the pricing page's promise and the quota that
    // enforces it are kept in step by hand, in two repositories' worth of
    // distance, and the failure is silent in the worst direction: a page that
    // sells twelve while the gate grants twenty-five costs us money quietly.
    //
    // If this drifts once, parse it instead of trusting the pair.
    case "standard":
      return 12;
    // Renamed from "featured" on 2026-09-18. Deliberately NOT accepting the old
    // id as an alias: zero producers exist, so no stored row can carry it, and
    // an alias here would be the one thing keeping a retired name alive. If a
    // "featured" ever arrives it falls to "unknown", which refuses to guess an
    // allowance rather than granting one, and that is the correct answer to a
    // tier we no longer recognise.
    case "unlimited":
      return "uncapped";
    default:
      return "unknown";
  }
}

/* ---------------------------------------------------------------------- *
 * Reading a producer
 * ---------------------------------------------------------------------- */

export interface ProducerRecord {
  id: string;
  name: string;
  slug: string;
  contactEmail: string | null;
  /** THE TIER THE ROW STORES, which is not necessarily the tier in force.
   *  Null when no Subscription row exists. Absence of a row is NOT the free
   *  tier - see quotaLine() for why the console must never render one as the
   *  other. Every GATE must read effectiveTier() rather than this. */
  tier: string | null;
  status: string | null;
  /**
   * Whether `currentPeriodEnd` is set, and whether it has passed.
   *
   * BOTH ARE COMPUTED IN SQL, NEVER IN JAVASCRIPT, and that is the repo's
   * hardest-won database lesson applied to a second column. `currentPeriodEnd`
   * is a zoneless TIMESTAMP; comparing one against a JavaScript clock is
   * exactly the coercion that once made every magic link on this origin be
   * born already expired. Let `now()` do it, on the one clock that owns the
   * column, and carry the answer as a boolean.
   */
  periodKnown: boolean;
  periodExpired: boolean;
  cancelAtPeriodEnd: boolean;
}

/* ---------------------------------------------------------------------- *
 * Entitlement
 * ---------------------------------------------------------------------- */

/**
 * ============================================================================
 * WHAT A SUBSCRIPTION ACTUALLY ENTITLES A PRODUCER TO, RIGHT NOW.
 * ============================================================================
 *
 * ADDED 2026-09-20, AND IT IS THE FIX FOR THE ONE THING THAT MADE THIS CONSOLE
 * UNSAFE TO ATTACH MONEY TO. Every gate here used to read `tier` and nothing
 * else - not `status`, not `currentPeriodEnd`, not `cancelAtPeriodEnd`. That
 * was verified against the live Worker rather than argued: a subscription set
 * to CANCELED, and then to PAST_DUE with its period ended thirty days ago,
 * kept its uncapped listing allowance both times. A webhook writing an
 * accurate status into a column no gate reads is not enforcement, it is
 * paperwork.
 *
 * THE RULES, and why each one is where it is:
 *
 *   ACTIVE / TRIALING  in force, unless the period has demonstrably ended.
 *                      Trialing is included deliberately: a trial is a
 *                      promise we made, and breaking it early to be safe
 *                      would be the wrong kind of caution.
 *
 *   PAST_DUE           in force ONLY while we can SEE an unexpired period.
 *                      A card that failed once is usually retried and
 *                      succeeds, so cutting a paying producer off the same
 *                      hour is both hostile and usually wrong. But with no
 *                      period on the row we cannot show they are paid up for
 *                      anything, and the status already says the payment
 *                      failed - so the honest answer there is no.
 *
 *   CANCELED           never in force. A provider that supports
 *                      cancel-at-period-end keeps the row ACTIVE until the
 *                      period actually ends and only then writes CANCELED,
 *                      so this status means over rather than leaving.
 *                      `cancelAtPeriodEnd` on an ACTIVE row is therefore
 *                      NOT a reason to withhold anything - they paid for
 *                      this period and they get it.
 *
 *   INCOMPLETE         never in force. It never started.
 *
 *   anything else      never in force. An unrecognised status is not a
 *                      licence; it is a thing to go and look at.
 *
 * WHAT LAPSING DOES NOT DO: it does not close the account, delete listings,
 * or refuse the console. It drops the producer to the same enforcement every
 * producer without a row already gets - one listing. Their existing listings
 * stay up; they simply cannot add more until the subscription is good again.
 * Taking published work down over a failed card would be a punishment the
 * programme never promised.
 */
export type Entitlement =
  /** No Subscription row at all. Every producer on the origin today. */
  | { kind: "none" }
  /** A row, and it is good right now. */
  | { kind: "in-force"; tier: string }
  /** A row that is not currently good. Carries the stored tier and status so
   *  the console can say which plan lapsed and why, rather than silently
   *  behaving as though the producer never subscribed. */
  | { kind: "lapsed"; tier: string; status: string };

export function entitlementOf(sub: {
  tier: string | null;
  status: string | null;
  periodKnown: boolean;
  periodExpired: boolean;
}): Entitlement {
  if (sub.tier === null) return { kind: "none" };
  const status = (sub.status ?? "").toUpperCase();

  let live: boolean;
  if (status === "ACTIVE" || status === "TRIALING") live = !sub.periodExpired;
  else if (status === "PAST_DUE") live = sub.periodKnown && !sub.periodExpired;
  else live = false;

  return live
    ? { kind: "in-force", tier: sub.tier }
    : { kind: "lapsed", tier: sub.tier, status: status || "UNKNOWN" };
}

/**
 * The tier every GATE must use. Null means "enforce the free allowance",
 * which is what both `none` and `lapsed` collapse to.
 *
 * COLLAPSING `lapsed` TO NULL RATHER THAN TO "unknown-tier" IS DELIBERATE. A
 * lapsed subscription is not a mystery - we know exactly what it is and that
 * it is not paid for. The refuse-to-guess path exists for a tier STRING we do
 * not recognise, which is a different problem and still reachable: a row
 * reading tier "gold" with status ACTIVE still refuses rather than guessing.
 */
export function effectiveTier(sub: {
  tier: string | null;
  status: string | null;
  periodKnown: boolean;
  periodExpired: boolean;
}): string | null {
  const e = entitlementOf(sub);
  return e.kind === "in-force" ? e.tier : null;
}

export interface ListingRow {
  id: string;
  name: string;
  brand: string;
  /** The derived, per-producer-unique listing slug. Read so the withdraw
   *  confirmation can name the exact `/go/` identifier that stops resolving,
   *  rather than describing one in the abstract. */
  slug: string;
  referenceSlug: string;
  approvalStatus: string;
  publishState: string;
  /** The published score frozen at removal. The ONLY score this database
   *  holds: the live match score is computed by the catalogue's build from a
   *  formula that lives in the other project, so a listing that has not been
   *  removed has no number here to show. */
  scoreAtRemoval: number | null;
  /**
   * The listing's product photograph, or null.
   *
   * NULL IS THE ONLY VALUE THIS COLUMN HAS EVER HELD, and it is selected anyway
   * on purpose. Photograph upload is not built, so nothing writes it; the point
   * of reading it now is that the render path, the fallback and the layout are
   * exercised and proven BEFORE the first real producer supplies an image,
   * rather than discovered to be broken on the day one arrives.
   *
   * The console does not decide what a valid image is. It renders what is
   * stored or, far more often, the fallback tile.
   */
  imageUrl: string | null;
  /** Both from the last AuditEvent, null when nothing has been recorded
   *  against this listing yet. Rendered as text by the database rather than
   *  parsed into a Date here: the column is a zoneless TIMESTAMP, and every
   *  coercion between it and a JavaScript clock is an opportunity for the
   *  timezone bug that once expired every magic link on this origin. */
  lastAction: string | null;
  lastActionOn: string | null;
}

export interface ProducerConsoleData {
  producer: ProducerRecord;
  listings: ListingRow[];
  /** Listings counting against the allowance. */
  inUse: number;
}

/**
 * THE COUNTING RULE: a withdrawn or removed listing frees its slot.
 *
 * Stated in the console's own copy, so it is a commitment rather than an
 * implementation detail. It also decides what the exhausted-allowance screen
 * is allowed to say: with this rule there is an action a producer can take on
 * their own (withdraw something), and without it the only honest thing on
 * that screen would be an email address.
 */
/**
 * REJECTED LISTINGS STOPPED COUNTING ON 2026-09-20, and the reason is the
 * dead end they created rather than tidiness.
 *
 * Rejecting leaves `publishState` at PENDING, so under the old rule a refused
 * listing went on holding its slot forever. On the free tier that is one slot,
 * there is no edit-and-resubmit route on this origin, and free producers may
 * not withdraw their own listings - so the first producer we ever said no to
 * became permanently unable to submit anything again, by any route open to
 * them. Reproduced against the live Worker before it was changed.
 *
 * The allowance is what a producer BUYS. A listing we refused is not something
 * they are getting; charging them a slot for our own no is indefensible the
 * moment the slot is paid for.
 *
 * CHANGES_REQUESTED STILL COUNTS, and that asymmetry is the point. Changes
 * requested means the listing is alive and the ball is with the producer; it
 * is work in flight, not a refusal. Rejected is final.
 */
/**
 * THE RULE, AS DATA, so that the SQL backstop and this function cannot drift.
 *
 * The database now enforces the allowance too (see insertSubmission), which
 * means the rule had to exist in SQL as well as here - and "the same rule
 * written twice" is the exact shape this repo has already been bitten by,
 * where a checker drifted two files behind its generator and reported a clean
 * pass over hundreds of unchecked links. These two arrays are the single
 * definition: the function below reads them, and the SQL receives them as
 * parameters rather than repeating the literals.
 */
export const ALLOWANCE_EXEMPT_PUBLISH_STATES = ["WITHDRAWN_BY_PRODUCER", "REMOVED_BY_EDITOR"] as const;
export const ALLOWANCE_EXEMPT_APPROVAL_STATUSES = ["REJECTED"] as const;

export function countsAgainstAllowance(publishState: string, approvalStatus: string): boolean {
  if ((ALLOWANCE_EXEMPT_APPROVAL_STATUSES as readonly string[]).includes(approvalStatus)) return false;
  return !(ALLOWANCE_EXEMPT_PUBLISH_STATES as readonly string[]).includes(publishState);
}

/**
 * The number the DATABASE holds a producer to at write time.
 *
 * A cap of this size is "no limit": it is the largest 32-bit signed integer,
 * so the comparison is always true and the statement behaves exactly as the
 * unconditional insert did. Used for an admin and for the unlimited tier,
 * both of which are genuinely uncapped rather than very large.
 */
export const NO_CAP = 2_147_483_647;

export function allowanceCap(tier: string | null, uncapped: boolean): number {
  if (uncapped) return NO_CAP;
  const allowance = enforcedAllowance(tier);
  // "unknown" cannot reach a write - quotaGate refuses it first - and
  // "uncapped" is genuinely unlimited. Both answer NO_CAP so this function is
  // total, and neither is the reason the backstop exists.
  return typeof allowance === "number" ? allowance : NO_CAP;
}

/* ---------------------------------------------------------------------- *
 * The gate
 * ---------------------------------------------------------------------- */

export type QuotaVerdict =
  | { kind: "ok" }
  | { kind: "at-allowance"; allowance: number }
  | { kind: "unknown-tier"; tier: string };

/**
 * ============================================================================
 * WHETHER THIS PRODUCER MAY ADD ANOTHER LISTING. SERVER SIDE, ON THE ROUTE.
 * ============================================================================
 *
 * Never in the UI alone. The GET uses this to decide whether to render a form
 * at all and the POST uses it again before it writes, because a stale tab, a
 * second window, or a request that never came from our form would otherwise
 * walk straight past a decision made only at render time.
 *
 * It counts with countsAgainstAllowance() above and nothing else. The console's
 * own copy promises that rule ("a withdrawn listing frees its slot"), so a
 * second, slightly different count written next to the form would be a promise
 * broken by arithmetic.
 *
 * THE TWO AWKWARD CASES, DECIDED RATHER THAN DEFAULTED. allowanceForTier()
 * returns "unknown" for a tier string this console does not recognise, and
 * `tier: null` means there is no Subscription row at all. Neither may be
 * silently treated as free, and neither may be treated as unlimited.
 *
 *   "unknown"  REFUSES THE WRITE. There is a subscription on file and we do not
 *              know what it covers. Guessing low tells a paying producer they
 *              are full; guessing high lets them past a limit they are paying to
 *              have raised. The honest answer is that we will not guess, and it
 *              is a state a person has to clear.
 *
 *   null       IS ENFORCED AS THE FREE ALLOWANCE OF ONE, and that is a
 *              narrower statement than it looks. It is an enforcement decision
 *              only: the UI still renders "No plan on file", because absence of
 *              a row is not a free plan and printing one asserts a record that
 *              is not there. The reason for enforcing rather than refusing is
 *              that this is EVERY producer's state at launch - there are zero
 *              Subscription rows - so refusing all of them would make the form
 *              unreachable by everyone, which is a broken console rather than a
 *              cautious one. The direction of the error also matters: enforcing
 *              one is the tightest allowance any tier has, so nobody gets more
 *              than they are entitled to out of it.
 */
/**
 * The allowance we ACTUALLY ENFORCE for a tier, including the no-record case.
 *
 * `allowanceForTier` takes a tier string and cannot answer for `null`, so
 * every caller that has a nullable tier has had to write
 * `tier === null ? 1 : allowanceForTier(tier)` for itself. That expression was
 * in two places and about to be in a third, which is exactly how the console
 * once told a producer there was nothing to be full of while the submit form
 * said "1 of 1": two branches of the same rule, drifting.
 *
 * NO Subscription ROW IS ENFORCED AS ONE LISTING. That is not the same claim
 * as "this producer is on the free plan" - the row genuinely does not exist,
 * and quotaLine and the console's plan panel both still say so in words. This
 * function answers the narrower question of what number we hold them to, and
 * every surface that shows a remaining count must read it from here so the
 * count and the dead Submit button cannot disagree.
 */
export function enforcedAllowance(tier: string | null): Allowance {
  return tier === null ? 1 : allowanceForTier(tier);
}

export function quotaGate(opts: {
  tier: string | null;
  inUse: number;
  /**
   * Skip the allowance entirely. Set ONLY from `isAdminEmail`, never from
   * anything a producer's own record can say.
   *
   * WHY THIS IS AN ARGUMENT RATHER THAN A TIER. Founder instruction
   * 2026-09-18: an administrator has every ability, including listing their
   * own fragrance from the console. The tempting implementation is a fourth
   * tier, or an "admin" string in Producer.tier - and both are wrong in the
   * same way, because they put the answer to "may this account ignore the
   * cap" inside data the application writes. Administrative access on this
   * origin is a deployment secret precisely so that nothing writable can
   * grant it (see src/lib/admin.ts), and a tier that unlocked the cap would
   * be a second, weaker door into the same room.
   *
   * It is also deliberately narrow: this removes a COMMERCIAL limit and
   * nothing else. An admin's submission is still created PENDING and still
   * waits for a decision, because no route on this origin writes LIVE.
   */
  uncapped?: boolean;
}): QuotaVerdict {
  if (opts.uncapped) return { kind: "ok" };
  const allowance: Allowance = enforcedAllowance(opts.tier);

  if (allowance === "unknown") return { kind: "unknown-tier", tier: opts.tier ?? "" };
  if (allowance === "uncapped") return { kind: "ok" };
  if (opts.inUse >= allowance) return { kind: "at-allowance", allowance };
  return { kind: "ok" };
}

/**
 * Whether this tier may withdraw its own listing from the console.
 *
 * FOUNDER DECISION, 2026-09-18, reversing the one from 2026-09-16. Self-serve
 * withdrawal is a paid feature; a free producer asks us and we do it. The cost
 * was accepted deliberately: a free producer's single listing stops being a
 * choice they can revisit alone, so the refusal has to explain itself and give
 * them the way through rather than just saying no.
 *
 * DERIVED FROM THE PRICE, NOT FROM A TIER LIST, so it cannot drift the way a
 * hardcoded ["standard", "unlimited"] would. A paid tier is one with a monthly
 * figure; free is the only plan with a null price. That also means the
 * 2026-09-18 rename of "featured" to "unlimited" needed no change here.
 *
 * FAILS CLOSED on purpose. tier === null is a producer with no Subscription
 * row, which every other rule in this file already treats as free (see
 * quotaGate). A tier string that matches no known plan also returns false: the
 * honest answer to "we do not recognise your plan" is to refuse a destructive,
 * irreversible action and let a person sort it out, not to allow it.
 */
export function mayWithdrawSelf(tier: string | null): boolean {
  if (tier === null) return false;
  const plan = PLANS.find((p) => p.id === tier);
  return plan != null && plan.priceMonthlyUsd != null;
}

/**
 * The generated plan record a stored tier string points at, or null.
 *
 * NULL HAS TWO CAUSES AND THE CALLER MUST NOT MERGE THEM. `tier === null` is a
 * producer with no Subscription row, which is every producer at launch and is
 * enforced at the free allowance. A non-null tier that matches no plan is a
 * recorded value this build does not know - a tier renamed in the catalogue
 * and not regenerated here, or a hand-edited row - and the honest response is
 * to say the plan is unrecognised rather than to silently draw it as free.
 * quotaLine() already makes exactly that distinction, and this returning one
 * value for both would undo it.
 *
 * Reads the same generated PLANS as mayWithdrawSelf and the console's own
 * comparison table, so a tier's display name has one source here rather than
 * being title-cased out of the database column at each call site.
 */
export function planFor(tier: string | null): (typeof PLANS)[number] | null {
  if (tier === null) return null;
  return PLANS.find((p) => p.id === tier) ?? null;
}

/**
 * Returns null when `producerId` points at no Producer row. That is not
 * impossible: User.producerId is SetNull on delete, so it can only happen
 * mid-flight, but a console that threw on it would turn an unusual state into
 * a blank 500 for the one person best placed to tell us about it.
 */
export async function loadProducerConsole(
  sql: Sql,
  producerId: string,
): Promise<ProducerConsoleData | null> {
  const producerRows = (await sql`
    SELECT p.id, p.name, p.slug, p."contactEmail",
           sub.tier AS "tier",
           sub.status::text AS "status",
           -- BOTH COMPARISONS HAPPEN HERE, on the database's clock, because
           -- "currentPeriodEnd" is a zoneless TIMESTAMP and every coercion
           -- between one of those and a Worker's clock is the bug that once
           -- expired every magic link on this origin at birth.
           (sub."currentPeriodEnd" IS NOT NULL) AS "periodKnown",
           (sub."currentPeriodEnd" IS NOT NULL AND sub."currentPeriodEnd" <= now()) AS "periodExpired",
           COALESCE(sub."cancelAtPeriodEnd", false) AS "cancelAtPeriodEnd"
    FROM "Producer" p
    LEFT JOIN "Subscription" sub ON sub."producerId" = p.id
    WHERE p.id = ${producerId}
  `) as {
    id: string;
    name: string;
    slug: string;
    contactEmail: string | null;
    tier: string | null;
    status: string | null;
    periodKnown: boolean;
    periodExpired: boolean;
    cancelAtPeriodEnd: boolean;
  }[];

  const producer = producerRows[0];
  if (!producer) return null;

  // LEFT JOIN LATERAL rather than a second round trip per listing: one query
  // whatever the row count, and the ORDER BY ... LIMIT 1 inside it is exactly
  // what the ("submissionId", "createdAt") index on AuditEvent is for.
  const listings = (await sql`
    SELECT s.id, s.name, s.brand, s.slug, s."referenceSlug",
           s."approvalStatus"::text AS "approvalStatus",
           s."publishState"::text   AS "publishState",
           s."scoreAtRemoval",
           s."imageUrl",
           ae.action AS "lastAction",
           to_char(ae."createdAt", 'YYYY-MM-DD') AS "lastActionOn"
    FROM "Submission" s
    LEFT JOIN LATERAL (
      SELECT a.action, a."createdAt"
      FROM "AuditEvent" a
      WHERE a."submissionId" = s.id
      ORDER BY a."createdAt" DESC
      LIMIT 1
    ) ae ON true
    WHERE s."producerId" = ${producerId}
    ORDER BY s."updatedAt" DESC
  `) as ListingRow[];

  return {
    producer,
    listings,
    inUse: listings.filter((l) => countsAgainstAllowance(l.publishState, l.approvalStatus)).length,
  };
}
