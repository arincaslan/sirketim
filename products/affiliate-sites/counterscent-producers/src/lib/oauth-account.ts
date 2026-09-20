/**
 * ============================================================================
 * PROVIDER IDENTITY -> USER. This file is where "never auto-link" is enforced.
 * ============================================================================
 *
 * src/lib/oauth.ts proves a provider said something. This file decides what we
 * do about it, and every refusal below is deliberate rather than a missing
 * feature.
 *
 * THE RULE, decided by the founder on 2026-09-20 (and it is stricter than the
 * one that was recommended, which is worth recording because the stricter
 * choice is the one that survives contact with the admin panel):
 *
 *   A provider identity NEVER joins an account it is not already attached to.
 *
 * Not "unless the email matches", not "unless the provider says the email is
 * verified". Never. A producer who signed up by magic link and then presses
 * Continue with Google is REFUSED, and links Google from inside an already
 * signed-in session instead. The flow is one extra step exactly once, and in
 * exchange there is no code path anywhere on this origin where a claim made by
 * a third party grants access to an account that already exists.
 *
 * WHY THAT MATTERS MORE HERE THAN ON A TYPICAL SITE: admin access on this
 * origin is the ADMIN_EMAILS deployment secret, checked by email ADDRESS (see
 * src/lib/admin.ts). So the prize for winning an email-based auto-link is not
 * one producer's listings, it is /admin/queue. The founder's admin address is
 * a Gmail, which is precisely the address an attacker would aim a provider
 * identity at.
 *
 * THE SECOND RULE, which closes a hole the first one does not: a provider may
 * CREATE a User only if it asserts the email is verified (OAuthProvider
 * .canCreateAccount). Without it, somebody signs up with an address they do
 * not own but nobody here has registered yet; the real owner later arrives at
 * the magic link, findOrCreateUser() upserts on email, and lands in the
 * squatter's account with the squatter's Account row still attached. After
 * creation the two are indistinguishable, so the refusal has to happen here.
 */

import type { AuthUser, Sql } from "./auth";
import { generateId } from "./auth";
import type { OAuthProvider, ProviderProfile } from "./providers";
import { toProviderId, type ProviderId } from "./providers";

/**
 * WE STORE NO TOKENS. The Account table has columns for access_token,
 * refresh_token and id_token because it carries the standard Auth.js shape,
 * and all three stay NULL here on purpose.
 *
 * This Worker calls no provider API. It asks the provider one question, at
 * sign-in, and never speaks to it again. A stored access token would
 * therefore be a live credential kept for no reader - the definition of a
 * liability rather than an asset - and a stored refresh token would be a
 * long-lived one. What we keep is the minimum that answers "is this the same
 * person as last time": the provider and its stable subject id.
 */
const ACCOUNT_TYPE = "oidc";

/* ---------------------------------------------------------------------- *
 * Sign-in
 * ---------------------------------------------------------------------- */

export type SignInOutcome =
  /** The provider identity is already attached to a User. The ordinary path. */
  | { kind: "signed-in"; user: AuthUser }
  /** First arrival, verified email, address unused: a new account exists now. */
  | { kind: "created"; user: AuthUser }
  /**
   * Refused, with a reason the route turns into a sentence. Every one of these
   * is a deliberate no rather than an error, which is why they are named for
   * the rule they enforce rather than for an HTTP status.
   */
  | {
      kind: "refused";
      reason:
        /** The provider does not assert verified emails, so it may not create
         *  an account. No configured provider does this today - see
         *  OAuthProvider.canCreateAccount for why the rule stays. */
        | "provider-cannot-create"
        /** The provider would not say the address is verified. */
        | "email-unverified"
        /** The provider sent no usable address at all. */
        | "email-missing"
        /** THE NO-AUTO-LINK REFUSAL. Somebody already owns this address here. */
        | "email-taken";
      email: string | null;
    };

/**
 * Resolves a provider identity at SIGN-IN time.
 *
 * Reading order matters and is the rule itself: look for an existing link
 * first, and only then consider creating anything. A provider identity we have
 * seen before is signed in without the email being consulted at all, which is
 * what makes a producer's later mailbox rename harmless.
 */
export async function resolveSignIn(
  sql: Sql,
  provider: OAuthProvider,
  profile: ProviderProfile,
): Promise<SignInOutcome> {
  const existing = (await sql`
    SELECT u.id, u.email, u."producerId"
    FROM "Account" a
    JOIN "User" u ON u.id = a."userId"
    WHERE a.provider = ${provider.id} AND a."providerAccountId" = ${profile.providerAccountId}
  `) as { id: string; email: string | null; producerId: string | null }[];

  const row = existing[0];
  if (row && row.email) {
    return { kind: "signed-in", user: { id: row.id, email: row.email, producerId: row.producerId } };
  }

  // From here on this is a provider identity we have never seen. Creating an
  // account is the ONLY thing left that could happen, so every guard the two
  // rules impose is checked before a single write.
  if (!provider.canCreateAccount) {
    return { kind: "refused", reason: "provider-cannot-create", email: profile.email };
  }
  if (!profile.email) {
    return { kind: "refused", reason: "email-missing", email: null };
  }
  if (!profile.emailVerified) {
    return { kind: "refused", reason: "email-unverified", email: profile.email };
  }

  const email = profile.email.trim().toLowerCase();

  /**
   * ON CONFLICT DO NOTHING IS THE NO-AUTO-LINK CHECK, and it is written as one
   * statement rather than SELECT-then-INSERT on purpose. The two-statement
   * form has a window: two requests both find the address free, both insert,
   * and the loser gets a constraint violation that reads like a crash instead
   * of like a refusal. Asking the unique index to arbitrate makes "is this
   * address taken" and "take it" the same atomic act - the same shape
   * company.ts uses for slug uniqueness, for the same reason.
   *
   * No rows back therefore means exactly one thing: a User already holds this
   * address. That is the refusal, and it is the whole of never-auto-link.
   */
  const created = (await sql`
    INSERT INTO "User" (id, email, "emailVerified", name)
    VALUES (${generateId()}, ${email}, now(), ${profile.name})
    ON CONFLICT (email) DO NOTHING
    RETURNING id, "producerId"
  `) as { id: string; producerId: string | null }[];

  const fresh = created[0];
  if (!fresh) {
    return { kind: "refused", reason: "email-taken", email };
  }

  await sql`
    INSERT INTO "Account" (id, "userId", type, provider, "providerAccountId")
    VALUES (${generateId()}, ${fresh.id}, ${ACCOUNT_TYPE}, ${provider.id}, ${profile.providerAccountId})
    ON CONFLICT (provider, "providerAccountId") DO NOTHING
  `;

  return {
    kind: "created",
    user: { id: fresh.id, email, producerId: fresh.producerId },
  };
}

/* ---------------------------------------------------------------------- *
 * Linking, from inside a session
 * ---------------------------------------------------------------------- */

export type LinkOutcome =
  | { kind: "linked" }
  /** Already attached to THIS user. Pressing connect twice is not an error. */
  | { kind: "already-linked" }
  /**
   * Attached to a DIFFERENT user. Refused, and deliberately not explained in
   * the UI beyond "already connected to another account": naming which account
   * would confirm to a stranger that a given Google identity has registered
   * here, which is not ours to disclose.
   */
  | { kind: "claimed-elsewhere" };

export async function linkProviderToUser(
  sql: Sql,
  user: AuthUser,
  provider: OAuthProvider,
  profile: ProviderProfile,
): Promise<LinkOutcome> {
  const existing = (await sql`
    SELECT "userId" FROM "Account"
    WHERE provider = ${provider.id} AND "providerAccountId" = ${profile.providerAccountId}
  `) as { userId: string }[];

  const owner = existing[0];
  if (owner) {
    return owner.userId === user.id ? { kind: "already-linked" } : { kind: "claimed-elsewhere" };
  }

  // NOTE THAT THE PROFILE'S EMAIL IS NOT CONSULTED HERE, AT ALL. Linking is
  // authorised by the live session, not by an address matching: a producer may
  // connect a Google account whose address differs from the one they sign in
  // with, which is both common (a personal Gmail against a business mailbox)
  // and harmless, because the session already proved who they are. Requiring
  // the addresses to match would be a check that looks like security and is
  // really just an obstacle.
  const inserted = (await sql`
    INSERT INTO "Account" (id, "userId", type, provider, "providerAccountId")
    VALUES (${generateId()}, ${user.id}, ${ACCOUNT_TYPE}, ${provider.id}, ${profile.providerAccountId})
    ON CONFLICT (provider, "providerAccountId") DO NOTHING
    RETURNING id
  `) as { id: string }[];

  // Lost a race against another tab or another account claiming the same
  // identity between the SELECT above and this INSERT. Reported as the refusal
  // rather than as success, because nothing was written.
  if (!inserted[0]) return { kind: "claimed-elsewhere" };

  await recordAccountEvent(sql, user, "account.provider_linked", provider.id);
  return { kind: "linked" };
}

/* ---------------------------------------------------------------------- *
 * Reading and unlinking
 * ---------------------------------------------------------------------- */

export interface LinkedProvider {
  provider: ProviderId;
  linkedAt: Date | null;
}

export async function listLinkedProviders(sql: Sql, userId: string): Promise<LinkedProvider[]> {
  const rows = (await sql`
    SELECT provider FROM "Account" WHERE "userId" = ${userId} ORDER BY provider
  `) as { provider: string }[];
  // Narrowed through toProviderId rather than a hardcoded list, so a provider
  // added to or removed from the table cannot leave a stale literal here. A row
  // naming a provider this build does not know is skipped rather than rendered.
  return rows
    .map((r) => toProviderId(r.provider))
    .filter((p): p is ProviderId => p !== null)
    .map((provider) => ({ provider, linkedAt: null }));
}

/**
 * Removes a provider link.
 *
 * THERE IS NO "YOU CANNOT REMOVE YOUR LAST SIGN-IN METHOD" GUARD, and its
 * absence is correct rather than an oversight. Every User on this origin has
 * an email address (User.email is what getSessionUser reads, and a row without
 * one cannot sign in at all), and the magic link works for any address with no
 * setup whatsoever. So the magic link is a floor that cannot be removed from
 * the console, and disconnecting every provider leaves a producer with exactly
 * the way in they had before any of this was built. A lockout is not reachable
 * from this button, so a guard against one would be guarding nothing.
 */
export async function unlinkProvider(sql: Sql, user: AuthUser, provider: ProviderId): Promise<boolean> {
  // Audit BEFORE the change, which is this origin's ordering everywhere: if
  // only one of the two survives a failure, a logged change that did not
  // happen is visible and correctable, an unlogged one that did is neither.
  await recordAccountEvent(sql, user, "account.provider_unlinked", provider);

  const removed = (await sql`
    DELETE FROM "Account"
    WHERE "userId" = ${user.id} AND provider = ${provider}
    RETURNING id
  `) as { id: string }[];
  return removed.length > 0;
}

/* ---------------------------------------------------------------------- *
 * Audit
 * ---------------------------------------------------------------------- */

/**
 * CONDITIONAL ON THE USER HAVING A PRODUCER, and that is a real limitation
 * rather than a choice, stated here so nobody reads the absence of a row as
 * evidence nothing happened.
 *
 * `AuditEvent.producerId` is NOT NULL. The table's documented scope is "things
 * that happened, to a producer" - it widened from submissions to accounts on
 * 2026-09-18 precisely because attaching an account to a company was going
 * unrecorded. An account with no producer attached has nothing to hang an
 * event on, and inventing a sentinel producer id to satisfy the column would
 * put fiction in the one table whose value is that it contains none.
 *
 * The events that are missed are the least consequential ones: connecting
 * Google to an account that controls no listings changes nobody's access to
 * anything. The moment that account is attached to a producer, every
 * subsequent link and unlink is recorded. If that stops being good enough, the
 * fix is a migration making producerId nullable, not a fake id here.
 */
async function recordAccountEvent(
  sql: Sql,
  user: AuthUser,
  action: string,
  provider: ProviderId,
): Promise<void> {
  if (!user.producerId) return;
  await sql`
    INSERT INTO "AuditEvent" (
      id, "submissionId", "producerId", action, "actorType", "actorId",
      channel, before, after, reason
    ) VALUES (
      ${generateId()}, NULL, ${user.producerId}, ${action},
      'PRODUCER', ${user.id},
      'producer-console',
      NULL,
      ${JSON.stringify({ userId: user.id, email: user.email, provider })}::jsonb,
      NULL
    )
  `;
}
