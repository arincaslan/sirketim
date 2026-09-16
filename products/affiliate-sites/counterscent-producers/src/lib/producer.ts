import type { Sql } from "./auth";

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
 * on each plan ("1 listing", "25 listings", "Unlimited listings"). This is a
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
    case "standard":
      return 25;
    case "featured":
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
  /** Null when no Subscription row exists, which is every producer today.
   *  Absence of a row is NOT the free tier - see quotaLine() for why the
   *  console must never render one as the other. */
  tier: string | null;
  status: string | null;
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
export function countsAgainstAllowance(publishState: string): boolean {
  return publishState !== "WITHDRAWN_BY_PRODUCER" && publishState !== "REMOVED_BY_EDITOR";
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
export function quotaGate(opts: { tier: string | null; inUse: number }): QuotaVerdict {
  const allowance: Allowance = opts.tier === null ? 1 : allowanceForTier(opts.tier);

  if (allowance === "unknown") return { kind: "unknown-tier", tier: opts.tier ?? "" };
  if (allowance === "uncapped") return { kind: "ok" };
  if (opts.inUse >= allowance) return { kind: "at-allowance", allowance };
  return { kind: "ok" };
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
           sub.status::text AS "status"
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
    inUse: listings.filter((l) => countsAgainstAllowance(l.publishState)).length,
  };
}
