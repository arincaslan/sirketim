import type { Env } from "./env";
import { db } from "./db";

/**
 * ============================================================================
 * DECISION: hand-rolled sessions on the existing schema, NOT `@auth/core`.
 * ============================================================================
 *
 * This is the first of the two architecture calls step 5 was asked to make
 * (the second, raw SQL vs Prisma Client, is in src/lib/db.ts). The schema
 * (prisma/schema.prisma, moved into this project alongside this decision -
 * see that file's header) already carries the standard Auth.js Prisma-
 * adapter shape: User, Account, Session, VerificationToken. That shape was
 * chosen on purpose so this choice would not be foreclosed by the schema -
 * either implementation could read and write those four tables unchanged.
 *
 * `@auth/core` (rejected). It is edge-runtime-friendly in principle - no
 * Node-only APIs, used inside Next middleware elsewhere - so "does it run in
 * a Worker" was not the objection. Two things were:
 *
 *   1. It is built around a framework integration surface (a routes object,
 *      a request/response adapter, provider configuration, callbacks,
 *      pages config) that exists to be *wired into* a framework's own
 *      request lifecycle. This Worker has no framework - src/index.ts's own
 *      REJECTED list is explicit that everything here is a hand-written
 *      `fetch()` and a routing table, on purpose, to keep this project at
 *      "no framework, no build step beyond wrangler's own bundling." Using
 *      `@auth/core` here means hand-building the adapter shim it normally
 *      gets for free from Next/SvelteKit/etc - so most of the value it
 *      offers (the framework glue) would be work this project has to do
 *      anyway, on top of a dependency it did not have before.
 *   2. The actual behaviour needed is five operations: create a single-use
 *      token, consume it once, upsert a user by email, create a session,
 *      read a session. That is a smaller, more legible surface than an
 *      OAuth-capable auth library's Email/Credentials provider path, and
 *      writing it directly against the four tables means every line of
 *      "how a producer gets signed in" lives in this one file rather than
 *      being spread across this project's adapter shim plus `@auth/core`'s
 *      own internals.
 *
 * HAND-ROLLED (chosen). Every function below is a small, auditable operation
 * against a table this project already owns the schema for. It costs
 * hand-maintaining things a library would give for free - CSRF handling for
 * a form that does not need it yet (no cross-origin POST target exists),
 * cookie parsing, token hashing - and each of those is written out plainly
 * below rather than imported. That trade matches this project's stated
 * ethos (src/index.ts, REJECTED choice 2 and 3): explicit and small beats
 * implicit and general at this size, and this Worker had zero runtime
 * dependencies before this step for the same reason.
 *
 * NEITHER OPTION WAS NEON AUTH. That was ruled out in neon.ts before this
 * file existed - Neon Auth would be a second, competing answer to "who is
 * this producer" in the same database. See neon.ts's own comment.
 */

/* ---------------------------------------------------------------------- *
 * Tokens and ids
 * ---------------------------------------------------------------------- */

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** 32 random bytes, hex-encoded - the raw, single-use magic-link token that
 *  goes into the emailed URL. Never stored as-is; see hashToken(). */
export function generateRawToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return toHex(bytes);
}

/** SHA-256 of the raw token, stored in VerificationToken.token instead of the
 *  raw value. The reasoning is the same as a password hash's: a read of this
 *  table (a backup, a misdirected log line, the read-only Neon MCP key this
 *  project already uses elsewhere) should not by itself hand someone a
 *  working sign-in link. The raw token only ever exists in the outbound
 *  email and the one incoming request that consumes it. */
export async function hashToken(raw: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(raw));
  return toHex(new Uint8Array(digest));
}

/** IDs for rows this Worker inserts directly (User, Session - see db.ts's
 *  decision comment for why this is a UUID and not a cuid()). */
export function generateId(): string {
  return crypto.randomUUID();
}

/** 32 random bytes, hex-encoded - the session cookie's value, a *different*
 *  token from the verification one (a session lives for weeks; a
 *  verification token lives for minutes and is deleted on use - reusing one
 *  token type for both would tie their lifetimes together for no reason). */
export function generateSessionToken(): string {
  return generateRawToken();
}

const VERIFICATION_TOKEN_TTL_MINUTES = 15;
const SESSION_TTL_DAYS = 30;

function daysFromNow(days: number): Date {
  return new Date(Date.now() + days * 86_400_000);
}

/* ---------------------------------------------------------------------- *
 * Verification tokens (sign-in request -> emailed link)
 * ---------------------------------------------------------------------- */

/** Normalises an email the same way on every path that touches one, so
 *  "Person@X.com" and "person@x.com " are not treated as different
 *  identifiers by one code path and the same identifier by another. */
export function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isPlausibleEmail(email: string): boolean {
  return EMAIL_PATTERN.test(email);
}

export type Sql = NonNullable<ReturnType<typeof db>>;

/** Stores a hashed, expiring, single-use token for `email`. Does NOT create
 *  a Producer, and does not even create the User row yet - that happens at
 *  verification, so a sign-in request that is never followed up leaves
 *  nothing behind but a row that expires in 15 minutes.
 *
 *  It also does not check whether `email` already has a live token: that is
 *  the per-email throttle, and it belongs to the caller that decides whether
 *  to send mail (see hasActiveVerificationToken() below, and its one caller in
 *  src/routes/sign-in.ts). Keeping the check out here means this function
 *  stays the single, unconditional "mint a token" operation.
 *
 *  THE EXPIRY IS COMPUTED BY THE DATABASE, and that is a bug fix, not a
 *  preference. It used to be `new Date(...).toISOString()` from the Worker's
 *  clock. `VerificationToken.expires` is `TIMESTAMP(3)` - no time zone - so
 *  writing a UTC instant into it and then asking `expires > now()` puts a
 *  naive UTC value on one side and the session's local clock on the other.
 *  With the Postgres session TimeZone anywhere EAST of UTC, every token is
 *  born already expired and every magic link answers 410: sign-in dead for
 *  everyone, from a setting nobody would think to look at. Reproduced against
 *  a real Postgres at TimeZone='Europe/Istanbul' before this was changed;
 *  Neon's default is UTC, which is the only reason it worked.
 *
 *  Using `now()` on both sides removes the question - the write and every
 *  comparison (consumeVerificationToken, hasActiveVerificationToken) go
 *  through the same clock, so the 15 minutes are 15 minutes under any zone.
 *  Same pattern as the RateLimit counters, for the same reason: see
 *  src/lib/rate-limit.ts, and createSession() below, which was carrying the
 *  same mistake 30 days wide and was fixed on 2026-09-16 rather than shipped
 *  sitting a hundred lines beneath its own explanation. */
export async function createVerificationToken(sql: Sql, email: string): Promise<string> {
  const raw = generateRawToken();
  const hashed = await hashToken(raw);
  await sql`
    INSERT INTO "VerificationToken" (identifier, token, expires)
    VALUES (${email}, ${hashed}, now() + (${VERIFICATION_TOKEN_TTL_MINUTES}::int * interval '1 minute'))
  `;
  return raw;
}

/**
 * THE PER-EMAIL THROTTLE, and the table's own cleanup, in one statement.
 *
 * Whether `email` already has a token that has not expired. One live token per
 * address at a time caps this origin at one sign-in email per address per 15
 * minutes (VERIFICATION_TOKEN_TTL_MINUTES) - which is the whole of the
 * per-address defence, and it needs no new table because it asks a question
 * about a row this project already writes.
 *
 * WHY THE PURGE RIDES ALONG. Refused and abandoned attempts leave expired rows
 * behind, and nothing else was ever going to delete them. The `WITH` clause is
 * a data-modifying CTE: Postgres runs it exactly once and to completion
 * whether or not the main query reads its output, so the DELETE happens even
 * though nothing selects from `purged`. The two halves cannot interfere - the
 * DELETE touches only rows that have expired, the SELECT only rows that have
 * not, and both see the same pre-statement snapshot either way.
 *
 * Returning rows.length rather than a SELECT EXISTS boolean is deliberate: it
 * depends on nothing about how the driver decodes a Postgres `bool`.
 */
export async function hasActiveVerificationToken(sql: Sql, email: string): Promise<boolean> {
  const rows = (await sql`
    WITH purged AS (
      DELETE FROM "VerificationToken" WHERE expires <= now() RETURNING 1
    )
    SELECT 1 AS present
    FROM "VerificationToken"
    WHERE identifier = ${email} AND expires > now()
    LIMIT 1
  `) as { present: number }[];
  return rows.length > 0;
}

/**
 * Deletes ONE token by its raw value - the rollback for a mail that could not
 * be sent.
 *
 * Deliberately keyed on the exact token rather than on the identifier, so it
 * can only ever remove the row the calling request just minted and never a
 * concurrently-issued good one. That is what makes it safe to call after an
 * send failure: the raw value exists nowhere except that request's own memory
 * (it never reached an inbox), so the row it points at is unusable by anyone
 * and deleting it destroys nothing a producer could still click. See the
 * failure branch in src/routes/sign-in.ts for why leaving it in place became
 * the wrong answer once the throttle above existed.
 */
export async function deleteVerificationToken(sql: Sql, rawToken: string): Promise<void> {
  const hashed = await hashToken(rawToken);
  await sql`DELETE FROM "VerificationToken" WHERE token = ${hashed}`;
}

/**
 * Consumes a token: one atomic DELETE ... RETURNING, so "does the token
 * exist and is it still valid" and "invalidate it" happen in the same round
 * trip. That matters under a double-click or an email client that prefetches
 * links - two concurrent requests for the same token can both run this
 * statement, but only one of them can delete the row, so only one gets an
 * `identifier` back. Returns null for missing, expired, or already-used.
 */
export async function consumeVerificationToken(sql: Sql, rawToken: string): Promise<string | null> {
  const hashed = await hashToken(rawToken);
  // `sql` is @neondatabase/serverless's tagged-template form, which has no
  // per-call generic slot - it always resolves to `Record<string, any>[]`
  // (see src/lib/db.ts's decision comment for why this project is on the
  // driver's plain SQL client rather than Prisma Client). The `as` cast
  // below is the one place that shape gets a name; every query in this file
  // follows the same pattern.
  const rows = (await sql`
    DELETE FROM "VerificationToken"
    WHERE token = ${hashed} AND expires > now()
    RETURNING identifier
  `) as { identifier: string }[];
  return rows[0]?.identifier ?? null;
}

/* ---------------------------------------------------------------------- *
 * Users and sessions
 * ---------------------------------------------------------------------- */

export interface AuthUser {
  id: string;
  email: string;
  producerId: string | null;
}

/**
 * Finds or creates the User row for `email`. NEVER creates a Producer row -
 * that is the whole point this function exists to get right rather than
 * leaving to whichever caller happens to run first.
 *
 * WHY THIS IS SAFE AGAINST THE SCHEMA AS MIGRATED (checked before writing
 * this, per the brief for this step): User.producerId is nullable
 * (`producerId String?`) with no NOT NULL constraint and no default that
 * would require a Producer to exist, and User.email carries its own
 * `@unique` index, which is what makes `ON CONFLICT (email)` a valid upsert
 * target below. Nothing in the migrated schema requires a User to be
 * attached to a Producer at creation time - attaching one is a later,
 * editorial action (associating a signed-in inbox with a real company,
 * which is a decision about identity, not something a sign-in click should
 * do on its own), not part of this function. Confirmed against
 * prisma/migrations/20260914092338_init_producer_programme/migration.sql
 * directly rather than assumed from the schema comment alone.
 */
export async function findOrCreateUser(sql: Sql, email: string): Promise<AuthUser> {
  const id = generateId();
  const rows = (await sql`
    INSERT INTO "User" (id, email, "emailVerified")
    VALUES (${id}, ${email}, now())
    ON CONFLICT (email) DO UPDATE SET "emailVerified" = now()
    RETURNING id, "producerId"
  `) as { id: string; producerId: string | null }[];
  const row = rows[0];
  if (!row) throw new Error("findOrCreateUser: insert returned no row");
  return { id: row.id, email, producerId: row.producerId };
}

/** THE DATABASE COMPUTES THE ROW'S EXPIRY; THE WORKER COMPUTES THE COOKIE'S.
 *  That is deliberate, and the two are not redundant - they are read by two
 *  different clocks and each is correct in its own.
 *
 *  `Session.expires` is `TIMESTAMP(3)`, no time zone, and getSessionUser()
 *  below compares it against `now()`. Writing a UTC instant from the Worker
 *  into it put a naive UTC value on one side and Postgres's session TimeZone
 *  on the other - the identical mistake that was killing every magic link
 *  before createVerificationToken() was fixed above, and for the same reason.
 *  It survived here only because 30 days is wide enough that a zone offset
 *  shifts a session by hours instead of destroying it: east of UTC it expired
 *  sessions early, silently. `now() + interval` on both sides removes the
 *  question entirely.
 *
 *  The cookie keeps the Worker-computed Date because a cookie's Expires is
 *  evaluated by the BROWSER, against its own clock, so feeding it a value read
 *  back out of a zoneless column would reintroduce exactly the coercion this
 *  fix removes. Both mean "thirty days from now"; they just have to be said
 *  in the language of whoever is listening. */
export async function createSession(sql: Sql, userId: string): Promise<{ token: string; expires: Date }> {
  const token = generateSessionToken();
  const id = generateId();
  await sql`
    INSERT INTO "Session" (id, "sessionToken", "userId", expires)
    VALUES (${id}, ${token}, ${userId}, now() + (${SESSION_TTL_DAYS}::int * interval '1 day'))
  `;

  // EXPIRED ROWS ARE SWEPT HERE, opportunistically, which is the same shape
  // VerificationToken and RateLimit already use rather than a new mechanism.
  // Session was the one table with no cleanup at all: deleteSession() is
  // called only by sign-out, so every session a producer simply abandons - the
  // overwhelmingly common case at a 30-day TTL - stayed forever. Not a hole,
  // because getSessionUser() filters on `expires > now()`, but unbounded
  // growth in a table every authenticated request reads.
  //
  // ON CREATION, NOT ON READ, and that is the whole reason this is safe. A
  // sweep in getSessionUser() would turn every page load into a write, which
  // is the shape the root CLAUDE.md prohibits outright; sign-in already writes
  // and is rare. It deletes only rows that are already dead, never the row
  // just inserted, and it is caught because a failed tidy-up must never fail a
  // sign-in that has otherwise succeeded.
  try {
    await sql`DELETE FROM "Session" WHERE expires < now()`;
  } catch {
    // Swept next time. Nothing downstream depends on it having run.
  }

  return { token, expires: daysFromNow(SESSION_TTL_DAYS) };
}

export async function deleteSession(sql: Sql, sessionToken: string): Promise<void> {
  await sql`DELETE FROM "Session" WHERE "sessionToken" = ${sessionToken}`;
}

export async function getSessionUser(sql: Sql, sessionToken: string): Promise<AuthUser | null> {
  const rows = (await sql`
    SELECT u.id, u.email, u."producerId"
    FROM "Session" s
    JOIN "User" u ON u.id = s."userId"
    WHERE s."sessionToken" = ${sessionToken} AND s.expires > now()
  `) as { id: string; email: string | null; producerId: string | null }[];
  const row = rows[0];
  if (!row || !row.email) return null;
  return { id: row.id, email: row.email, producerId: row.producerId };
}

/* ---------------------------------------------------------------------- *
 * Cookies
 * ---------------------------------------------------------------------- */

/** __Host- prefixed: the browser enforces Secure, Path=/ and "no Domain
 *  attribute" itself for any cookie with this prefix, which is exactly the
 *  "scoped to this origin only" property the brief asked for - not just
 *  documented, but unspoofable by a cookie set from a different host. */
export const SESSION_COOKIE_NAME = "__Host-session";

export function readSessionCookie(request: Request): string | null {
  const header = request.headers.get("Cookie");
  if (!header) return null;
  for (const part of header.split(";")) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    const name = part.slice(0, eq).trim();
    if (name === SESSION_COOKIE_NAME) return decodeURIComponent(part.slice(eq + 1).trim());
  }
  return null;
}

export function setSessionCookieHeader(token: string, expires: Date): string {
  return [
    `${SESSION_COOKIE_NAME}=${encodeURIComponent(token)}`,
    `Expires=${expires.toUTCString()}`,
    `Path=/`,
    `HttpOnly`,
    `Secure`,
    `SameSite=Lax`,
  ].join("; ");
}

export function clearSessionCookieHeader(): string {
  return [`${SESSION_COOKIE_NAME}=`, `Max-Age=0`, `Path=/`, `HttpOnly`, `Secure`, `SameSite=Lax`].join("; ");
}

/* ---------------------------------------------------------------------- *
 * The gate primitive for later steps
 * ---------------------------------------------------------------------- */

/**
 * Whether this request is signed in, and as whom. This is the "minimal
 * session-check helper usable by /console and /review LATER" from the step-5
 * brief - deliberately just a read, with no opinion about what a caller
 * should do with the answer. /console and /review do not call this yet (see
 * their own files); wiring it in is step 6/7's job, not this one's.
 */
export async function getAuthContext(request: Request, env: Env): Promise<AuthUser | null> {
  const token = readSessionCookie(request);
  if (!token) return null;
  const sql = db(env);
  if (!sql) return null;
  return getSessionUser(sql, token);
}
