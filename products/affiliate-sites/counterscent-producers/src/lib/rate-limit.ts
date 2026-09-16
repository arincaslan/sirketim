// `Sql` is defined in auth.ts (the first file that needed a name for the
// tagged-template client). Type-only import, no runtime edge, and auth.ts does
// not import this module - nothing circular here.
import type { Sql } from "./auth";

/**
 * ============================================================================
 * DECISION: the counters live in POSTGRES - not KV, not a Durable Object, not
 * process memory.
 * ============================================================================
 *
 * This file exists because POST /sign-in had no limit of any kind. That
 * endpoint is unauthenticated and sends mail to whatever address is typed into
 * it, from contact@counterscent.com - the business's real human inbox, reused
 * deliberately rather than provisioning an auth@ mailbox. So a loop against it
 * is two failures at once: strangers receive "Sign in to Counterscent" mail
 * they never asked for, and Hostinger's shared-mail daily caps and abuse
 * suspension take out the address customers write to. Spam-relay risk and
 * business-inbox risk are the same risk on this origin, which is why this
 * landed before the first deploy rather than after it.
 *
 * 1. REJECTED: Workers KV. It needs a new binding in wrangler.jsonc, and the
 *    stronger objection is that KV is eventually consistent by design - a
 *    write is not guaranteed visible everywhere for up to a minute, reads are
 *    served from a local cache, and a single key tolerates roughly one write a
 *    second. A counter that under-reports during a burst is wrong at exactly
 *    the moment it is being consulted, and a burst is the entire thing this
 *    defends against.
 *
 * 2. REJECTED: a Durable Object. Strongly consistent and genuinely the
 *    purpose-built answer, but it is a new binding PLUS a migration stanza in
 *    wrangler.jsonc PLUS a class with its own storage API and lifecycle - a
 *    second stateful system standing beside the database this same handler
 *    already talks to two lines later. That is a materially bigger change to
 *    defend on a Worker whose stated premise (src/index.ts) is no framework
 *    and a surface the founder can read by hand.
 *
 * 3. REJECTED: a Map in the isolate. Free and instant, and worthless: a Worker
 *    isolate is per-colocation and short-lived, so an attacker who reaches a
 *    second colo - or simply waits for an eviction or our next deploy - gets a
 *    fresh allowance. A limit you can reset by retrying is not a limit.
 *
 *    (Cloudflare's own rate-limiting binding is a fourth option, and also a
 *    binding. Its current availability and beta status were not verifiable
 *    from where this was written, so it is named rather than assessed.)
 *
 * 4. CHOSEN: Postgres, one row per bucket, one atomic upsert per request. No
 *    new binding, no new dependency, strongly consistent, and it reuses the
 *    connection this handler was always going to open to write a verification
 *    token. The costs, named rather than hidden: one extra Neon HTTP round
 *    trip on every POST /sign-in (plus one more on the path that actually
 *    sends mail), and an additive schema change - the `RateLimit` table in
 *    prisma/schema.prisma.
 *
 * WHAT HAPPENS IF THAT TABLE IS NOT THERE. A query against a missing table
 * would otherwise blow up the sign-in path with a generic 500, which is the
 * fake-failure shape notShipped() (src/ui/components.ts) exists to prevent. So
 * every query here is caught, and "the limiter could not answer" is returned
 * as a value - `{ kind: "unavailable" }` - which the route turns into an
 * honest 503 that refuses to send mail. FAIL CLOSED, LOUDLY: the alternative
 * (carry on unthrottled and log something) would quietly restore the exact
 * gap this file was written to close, and the deploy would look fine.
 */

/* ---------------------------------------------------------------------- *
 * The numbers
 * ---------------------------------------------------------------------- */

/**
 * PER IP: five POSTs per ten minutes.
 *
 * Sized against what a real person does, which is not much: ask for a link,
 * not see it arrive, ask again, mistype the address, ask once more. Five
 * covers that with room over, and it covers a small fragrance house whose
 * staff share one office NAT address. The sixth request inside the window is
 * refused with a 429 and a Retry-After.
 *
 * The window is FIXED and starts at the first request of a burst. A refused
 * request still increments the counter but does NOT extend the window, so
 * hammering the endpoint cannot hold someone locked out indefinitely - ten
 * minutes after the first request, the bucket resets to one.
 *
 * What this alone does NOT bound: total mail. Five per ten minutes per IP is
 * still 720 mails a day from ONE address, and an attacker with many addresses
 * is unbounded by it entirely. That is what GLOBAL_* below is for.
 */
export const SIGN_IN_IP_WINDOW_SECONDS = 600;
export const SIGN_IN_IP_MAX_REQUESTS = 5;

/**
 * GLOBAL: one hundred sign-in emails in twenty-four hours, across the whole
 * origin.
 *
 * This is the one that actually protects contact@counterscent.com, because the
 * per-IP limit above caps a single source and nothing else. It counts SENDS,
 * not requests - it is bumped immediately before the send call, never on a
 * request that was refused earlier - so an attacker cannot exhaust the day's
 * budget with requests that were never going to send anything.
 *
 * WHY ONE HUNDRED. The supply side is still unknown: Hostinger publishes
 * per-plan sending caps and which one applies to this mailbox has not been
 * established. What IS established, measured against the live API on
 * 2026-09-16, is that the `X-Ratelimit-Limit: 300` header the Email API
 * returns is NOT that cap and must not be mistaken for it - the counter was
 * observed resetting between two calls four minutes apart while decrementing
 * 299 -> 298 within four seconds, so it is a short-window budget on API CALLS.
 * It bounds 429s, not mailbox suspension, and at 100 sends a day it is not a
 * binding constraint at all.
 *
 * So the number is argued from the demand side, which we can actually see:
 * there are zero enrolled producers today, and launch traffic is the founder
 * plus a handful of invited companies - single digits a day. One hundred is
 * roughly twenty times any plausible legitimate load, which is headroom enough
 * that tripping this is far better evidence of abuse than of success.
 *
 * REVIEW TRIGGER, so this does not quietly rot into a wrong number: revisit at
 * ~10 active producers, or on the first send rejected by Hostinger, whichever
 * comes first. Note that this constant is rendered into user-facing copy by
 * sendingPaused() in src/routes/sign-in.ts - changing it changes a published
 * claim, not just a guard.
 *
 * THE TRADE, STATED PLAINLY: when this trips, sign-in stops sending for
 * everyone, not just the abuser. That is the intended direction. A paused
 * sign-in is recoverable in hours; a suspended mailbox takes down the address
 * customers write to AND sign-in together, and is recoverable at Hostinger's
 * pace, not ours. The route answers a tripped global cap with an honest 503
 * that says nothing was sent - never the "check your inbox" page, which would
 * be a fake success.
 */
export const SIGN_IN_GLOBAL_WINDOW_SECONDS = 86_400;
export const SIGN_IN_GLOBAL_MAX_SENDS = 100;

/**
 * AUTHENTICATED WRITES: twenty per hour, per producer.
 *
 * Covers POST /console/submit and POST /console/withdraw together, in one
 * bucket, because what needs bounding is "writes from this producer" and not
 * either verb on its own.
 *
 * KEYED ON THE PRODUCER, NOT THE IP. The writer here is authenticated, and
 * there is no anonymous path to either route: both require a session, which
 * requires a link followed from a verified inbox. An IP key would be strictly
 * worse in both directions - a fragrance house whose staff share one office
 * NAT address would share one allowance, and a single producer on a dynamic
 * address could reset theirs by reconnecting.
 *
 * WHY TWENTY. Argued from the demand side, because that is the side anybody
 * can actually see. There are zero enrolled producers today. The free tier
 * covers one active listing, the largest paid tier that exists covers 25, and
 * every write here is a person filling in a form about a real product they
 * make: a submission is a deliberate act that happens a handful of times in
 * the life of an account, and a withdrawal is rarer still. Twenty an hour is
 * well past any honest use and still low enough that a loop stops quickly.
 *
 * NO GLOBAL BUCKET HERE, and that is not an oversight. The global cap on
 * POST /sign-in exists because that endpoint is unauthenticated and spends a
 * shared, exhaustible resource: mail from the business's own inbox. These
 * routes spend neither. Reaching them at all requires a session, which
 * requires a verified email, which is already bounded by
 * SIGN_IN_GLOBAL_MAX_SENDS above - so the number of distinct producers who can
 * be hammering this in a day is capped upstream by a limit that already exists.
 * A second global counter would add a shared failure mode (one abuser pausing
 * submissions for everybody) to defend a resource that is not shared.
 *
 * FAIL CLOSED, exactly as sign-in does: if the limiter cannot answer, the write
 * is refused with an honest 503 that says nothing was saved. Carrying on
 * unthrottled would restore the gap this exists to close while looking fine.
 *
 * REVIEW TRIGGER, so this cannot quietly rot into a wrong number: revisit at
 * the first producer who trips it without doing anything wrong, or when any
 * tier's allowance goes above 25, or at ~10 active producers, whichever comes
 * first. Unlike SIGN_IN_GLOBAL_MAX_SENDS, this constant is NOT rendered into
 * user-facing copy, so changing it changes a guard and not a published claim.
 */
export const PRODUCER_WRITE_WINDOW_SECONDS = 3_600;
export const PRODUCER_WRITE_MAX = 20;

/** The bucket a producer's writes count against. Prefixed, like every other
 *  key in this table: `RateLimit.key` is an opaque string by design, so a new
 *  limit is a new prefix rather than a new table. */
export function producerWriteKey(producerId: string): string {
  return `producer-write:${producerId}`;
}

/**
 * How long a bucket row survives after its window opened, before the sweep
 * below deletes it.
 *
 * MUST BE GREATER THAN THE LONGEST WINDOW IN USE, or the sweep would delete a
 * counter that is still inside its own window and silently reset it - a
 * cleanup job quietly handing out a fresh allowance. Twice the global window
 * is the margin.
 */
export const RATE_LIMIT_SWEEP_AFTER_SECONDS = SIGN_IN_GLOBAL_WINDOW_SECONDS * 2;

/** Bucket keys. Prefixed, because this table is generic by design - a later
 *  limit on some other endpoint belongs in it rather than in a second table. */
export const SIGN_IN_GLOBAL_KEY = "signin-send:global";

/**
 * The bucket a request counts against.
 *
 * `CF-Connecting-IP` carries the real client address and is written by
 * Cloudflare's own edge, which OVERWRITES whatever the client sent - so it
 * cannot be spoofed from outside, and this Worker is only reachable through
 * that edge (wrangler.jsonc binds one custom domain, no workers.dev in play).
 *
 * WHEN IT IS ABSENT - `wrangler dev` locally, or some future path that does
 * not come through the edge - the request goes into ONE SHARED BUCKET rather
 * than being waved through. Neither of the two obvious alternatives is
 * acceptable: crashing on a missing header turns a header change into an
 * outage, and skipping the limit turns it into a silent hole that looks fine
 * in production. A shared bucket fails closed and stays visible: locally you
 * get five tries and then a 429 (send `-H 'CF-Connecting-IP: ...'` to exercise
 * separate buckets), and in production every affected request throttles
 * against one another instead of against nothing.
 *
 * KNOWN LIMITATION, stated rather than papered over: this keys on the exact
 * address, so an IPv6 client holding a routed /64 can present many addresses
 * and get a fresh allowance for each. Grouping IPv6 by prefix needs the
 * address expanded first (`2a02:c7f::1` and `2a02:c7f:0:0:1::1` are the same
 * /64 written two ways, and comparing the strings says otherwise), which is
 * fiddly code that could not be tested against real Cloudflare traffic from
 * here. The global send cap is what bounds that case today.
 */
export function signInIpKey(request: Request): string {
  const ip = request.headers.get("CF-Connecting-IP")?.trim();
  return `signin-ip:${ip || "unknown"}`;
}

/* ---------------------------------------------------------------------- *
 * The counter
 * ---------------------------------------------------------------------- */

export type RateLimitVerdict =
  | { kind: "allowed"; count: number }
  | { kind: "limited"; count: number; retryAfterSeconds: number }
  | { kind: "unavailable"; reason: "not-migrated" | "query-failed" };

/**
 * Postgres error 42P01, `undefined_table`. Checked by code AND by message
 * because the HTTP driver's error shape is not something this project pins:
 * `@neondatabase/serverless` copies the server's fields onto its error object,
 * but a thrown value that is merely Error-shaped would lose `.code`, and
 * getting this wrong in the quiet direction (treating a missing table as some
 * other failure) is harmless here - both answers refuse to send mail. It is
 * only the wording of the 503 that depends on telling them apart.
 */
function isUndefinedTable(err: unknown): boolean {
  const code = (err as { code?: unknown } | null | undefined)?.code;
  if (code === "42P01") return true;
  const message = err instanceof Error ? err.message : String(err);
  return /relation\s+"?RateLimit"?\s+does not exist/i.test(message);
}

/**
 * Counts one hit against `key` and says whether it is over `limit`.
 *
 * ONE STATEMENT, ON PURPOSE. Read-then-write would be two round trips with a
 * race between them - two concurrent requests both read 4, both write 5, and
 * six get through a limit of five. `INSERT ... ON CONFLICT DO UPDATE` takes a
 * row lock on the conflicting row, so concurrent callers serialise on it and
 * each sees its own increment.
 *
 * The CASE pair is the window: if the stored window is still open, add one and
 * leave `windowStart` where it is; if it has lapsed, start a new window at one.
 * That makes a lapsed bucket reset itself on next use, with no scheduled job.
 *
 * TIMESTAMP HANDLING. `windowStart` is `TIMESTAMP(3)` (no time zone), and both
 * the value written and every comparison against it go through `now()`, which
 * Postgres coerces with the session time zone in both directions. The two
 * coercions are exact inverses, so this arithmetic is correct whatever that
 * zone is set to - it does not quietly depend on Neon defaulting to UTC.
 */
export async function bumpRateLimit(
  sql: Sql,
  opts: { key: string; windowSeconds: number; limit: number },
): Promise<RateLimitVerdict> {
  const { key, windowSeconds, limit } = opts;
  try {
    const rows = (await sql`
      INSERT INTO "RateLimit" ("key", "count", "windowStart")
      VALUES (${key}, 1, now())
      ON CONFLICT ("key") DO UPDATE SET
        "count" = CASE
          WHEN "RateLimit"."windowStart" > now() - (${windowSeconds}::int * interval '1 second')
          THEN "RateLimit"."count" + 1
          ELSE 1
        END,
        "windowStart" = CASE
          WHEN "RateLimit"."windowStart" > now() - (${windowSeconds}::int * interval '1 second')
          THEN "RateLimit"."windowStart"
          ELSE now()
        END
      RETURNING
        "count",
        GREATEST(
          0,
          CEIL(EXTRACT(EPOCH FROM ("windowStart" + (${windowSeconds}::int * interval '1 second')) - now()))
        )::int AS "retryAfterSeconds"
    `) as { count: number; retryAfterSeconds: number }[];

    const row = rows[0];
    // No row back from an INSERT ... RETURNING is not a state Postgres
    // produces; treating it as a failed query rather than an allowance is the
    // safe reading of an impossible answer.
    if (!row) return { kind: "unavailable", reason: "query-failed" };

    if (row.count > limit) {
      return { kind: "limited", count: row.count, retryAfterSeconds: row.retryAfterSeconds };
    }
    return { kind: "allowed", count: row.count };
  } catch (err) {
    const reason = isUndefinedTable(err) ? "not-migrated" : "query-failed";
    // Logged for `wrangler tail`. The requester gets a 503 that says which of
    // the two it was, in words - see src/routes/sign-in.ts.
    console.error(`bumpRateLimit(${key}) failed [${reason}]`, err instanceof Error ? err.message : err);
    return { kind: "unavailable", reason };
  }
}

/**
 * Deletes bucket rows whose window closed long ago, so the table cannot grow
 * without bound off refused attempts. One row per distinct client address is
 * small; one row per distinct client address forever is not.
 *
 * NO CRON TRIGGER, and no `[triggers]` block in wrangler.jsonc. A scheduled
 * Worker would be a second entry point to deploy, secure and reason about for
 * a DELETE that costs nothing to run on a request that is already talking to
 * this database. It is called on the sign-in path, after the per-IP check has
 * passed - which means flood traffic, refused at that check, never pays for
 * the sweep, and the rows a flood creates get cleared by the next request that
 * gets through.
 *
 * NEVER FATAL. Housekeeping failing is not a reason to refuse somebody a
 * sign-in link, so this swallows its error where bumpRateLimit() reports one.
 * That difference is the reason this is a separate statement from the caller's
 * other queries rather than folded into one of them: folded in, a failed
 * cleanup would take authentication down with it.
 */
export async function sweepRateLimits(sql: Sql): Promise<void> {
  try {
    await sql`
      DELETE FROM "RateLimit"
      WHERE "windowStart" < now() - (${RATE_LIMIT_SWEEP_AFTER_SECONDS}::int * interval '1 second')
    `;
  } catch (err) {
    console.error("sweepRateLimits failed (ignored)", err instanceof Error ? err.message : err);
  }
}
