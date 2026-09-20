/**
 * ============================================================================
 * PROVIDER IDENTITY -> USER. This file decides who a provider just signed in.
 * ============================================================================
 *
 * src/lib/oauth.ts proves a provider said something. This file decides what we
 * do about it.
 *
 * ============================================================================
 * THE RULE CHANGED ON 2026-09-20, THE SAME DAY IT WAS FIRST WRITTEN. Read this
 * before touching anything below, because the earlier rule is still quoted in
 * places and the difference is the whole point of the file.
 * ============================================================================
 *
 * IT WAS: a provider identity NEVER joins an account that already exists. A
 * producer who signed up by magic link and then pressed Continue with Google
 * was refused and told to link it from inside a session instead.
 *
 * IT IS NOW: a provider identity joins an existing account when the provider
 * asserts it has VERIFIED the email and that address already has an account
 * here. Same address, same person, straight in.
 *
 * THE FOUNDER'S ARGUMENT FOR THE CHANGE, which is correct and is the reason
 * this is not a loosening at all:
 *
 *   THE MAGIC LINK IS ALREADY THE FLOOR. Anyone who controls that mailbox can
 *   sign into that account right now, in one step, with no provider involved.
 *   Google asserting `email_verified` for the same address means Google has
 *   itself proved control of that mailbox. So matching on a Google-verified
 *   address grants nothing that was not already reachable through the inbox.
 *   It is the same proof arriving by a different road.
 *
 * WHAT THE OLD RULE WAS ACTUALLY DEFENDING, and why it does not apply: the
 * classic "sign in with X" takeover needs a provider that will assert an
 * address it has NOT verified. Microsoft's Entra is exactly that - it publishes
 * no `email_verified` claim at all, and its own claims reference says the
 * address may be wrong, is mutable, and must not be used for authorization.
 * Against a provider like that, matching on email is a free account takeover.
 * Against a provider that verifies, it is the mailbox proving itself. The old
 * rule refused BOTH because it drew the line in the wrong place - at whether an
 * account exists, rather than at whether the address is proven.
 *
 * SO THE LINE MOVED TO `assertsVerifiedEmail` AND `profile.emailVerified`, and
 * those two now gate three things at once: creating an account, matching an
 * existing one, and nothing else. Both are checked, never one: the per-request
 * claim can be absent on a provider that usually sends it, and the per-provider
 * flag says whether the claim means anything when it does arrive.
 *
 * ----------------------------------------------------------------------------
 * THE ONE RESIDUAL GAP, WHICH IS REAL AND IS NOT CLOSED HERE.
 * ----------------------------------------------------------------------------
 *
 * The two proofs differ in TENSE. A magic link proves control of the inbox NOW.
 * `email_verified` proves Google checked it at SOME POINT, and Google does not
 * re-check afterwards. A consumer Google account created against a non-Gmail
 * address keeps that verified flag indefinitely, so an address that has since
 * changed hands - a lapsed custom domain bought by somebody else, most
 * plausibly - could match an account whose current mailbox holder no longer
 * controls the Google side.
 *
 * It is narrow, it needs the old Google account to survive the handover intact,
 * and ADMIN_EMAILS has the identical exposure already for the identical reason.
 * It is written down rather than fixed because the fix (re-proving the address
 * by mail before matching) would reintroduce the round trip the change exists
 * to remove, and would still be strictly weaker than what the magic link
 * already offers anyone with the inbox.
 *
 * ----------------------------------------------------------------------------
 * WHAT DID NOT CHANGE.
 * ----------------------------------------------------------------------------
 *
 * A provider that does NOT assert a verified email still cannot create an
 * account and still cannot match one. That rule closed a squatting hole rather
 * than a takeover hole - somebody registers an address they do not own but
 * nobody here has claimed yet, then the real owner arrives at the magic link,
 * findOrCreateUser() upserts on email, and drops them into the squatter's
 * account with the squatter's Account row still attached. After creation the
 * two are indistinguishable, so the refusal has to happen before it.
 *
 * Linking from inside a session also still exists, and is still the ONLY way to
 * attach a provider account whose address DIFFERS from the one on the account -
 * a personal Gmail against a business mailbox, which is common. Matching
 * handles the same-address case; linkProviderToUser() handles the rest.
 */

import type { AuthUser, Sql } from "./auth";
import { generateId, normalizeEmail } from "./auth";
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
  /** The provider identity is already attached to a User. The ordinary path,
   *  and the one every sign-in after the first takes. */
  | { kind: "signed-in"; user: AuthUser }
  /** First arrival, verified email, address unused: a new account exists now. */
  | { kind: "created"; user: AuthUser }
  /**
   * First arrival, verified email, address ALREADY HAS AN ACCOUNT: the identity
   * was attached to it and that account is now signed in. This is the outcome
   * the 2026-09-20 rule change created, and it happens exactly once per
   * account - afterwards the link exists and `signed-in` is what returns.
   *
   * It is a separate kind rather than folded into `signed-in` because the
   * caller has something to say about it. Joining two identities is a change to
   * how an account can be accessed, and doing it silently is the part of
   * auto-linking that is genuinely worth objecting to. See routes/oauth.ts:
   * this outcome lands on "How you sign in" with a notice, not on the console.
   */
  | { kind: "matched"; user: AuthUser }
  /**
   * Refused, with a reason the route turns into a sentence. Every one of these
   * is a deliberate no rather than an error, which is why they are named for
   * the rule they enforce rather than for an HTTP status.
   */
  | {
      kind: "refused";
      reason:
        /** The provider does not assert verified emails, so its address means
         *  nothing here: it may neither create an account nor match one. No
         *  configured provider trips this today - see `assertsVerifiedEmail`
         *  for why the rule stays. */
        | "provider-email-untrusted"
        /** The provider would not say THIS address is verified. */
        | "email-unverified"
        /** The provider sent no usable address at all. */
        | "email-missing"
        /** Neither created nor matched, because the write did not land. A race
         *  with a concurrent sign-in of the same identity, and effectively
         *  unreachable - see resolveSignIn. Kept because the alternative is
         *  reporting a success that did not happen. */
        | "could-not-attach";
      email: string | null;
    };

/** The (provider, sub) -> account lookup, in one place because resolveSignIn
 *  runs it twice: once as the fast path, once to settle a lost race. */
async function ownerOf(
  sql: Sql,
  provider: ProviderId,
  providerAccountId: string,
): Promise<AuthUser | null> {
  const rows = (await sql`
    SELECT u.id, u.email, u."producerId"
    FROM "Account" a
    JOIN "User" u ON u.id = a."userId"
    WHERE a.provider = ${provider} AND a."providerAccountId" = ${providerAccountId}
  `) as { id: string; email: string | null; producerId: string | null }[];

  const row = rows[0];
  if (!row || !row.email) return null;
  return { id: row.id, email: row.email, producerId: row.producerId };
}

/**
 * Resolves a provider identity at SIGN-IN time.
 *
 * Reading order matters and is the rule itself: look for an existing link
 * first, and only then consider the email. A provider identity we have seen
 * before is signed in without the address being consulted at all, which is what
 * makes a producer's later mailbox rename harmless - and it is also why the
 * residual gap in the header cannot widen over time. The address is read once,
 * on the day the link is made, and never again.
 */
export async function resolveSignIn(
  sql: Sql,
  provider: OAuthProvider,
  profile: ProviderProfile,
): Promise<SignInOutcome> {
  const linked = await ownerOf(sql, provider.id, profile.providerAccountId);
  if (linked) return { kind: "signed-in", user: linked };

  // From here on this is a provider identity we have never seen, so the address
  // is about to decide something. Both halves of the trust test are checked
  // before a single write, and before the address is even normalised.
  if (!provider.assertsVerifiedEmail) {
    return { kind: "refused", reason: "provider-email-untrusted", email: profile.email };
  }
  if (!profile.email) {
    return { kind: "refused", reason: "email-missing", email: null };
  }
  if (!profile.emailVerified) {
    return { kind: "refused", reason: "email-unverified", email: profile.email };
  }

  // The SAME normalizeEmail() the magic link and the admin allowlist use. This
  // is not tidiness: matching is now a comparison against rows written by the
  // sign-in path, so a second lowercasing rule here would mean an address that
  // matched on one path and not the other, with every individual piece looking
  // correct. admin.ts carries the same note for the same reason.
  const email = normalizeEmail(profile.email);

  /**
   * ONE STATEMENT, NOT SELECT-THEN-INSERT, and that is still load-bearing after
   * the rule change even though a taken address is no longer a refusal. The
   * two-statement form has a window: two requests both find the address free,
   * both insert, and the loser gets a constraint violation that reads like a
   * crash. Asking the unique index to arbitrate makes "is this address free"
   * and "take it" the same atomic act - the shape company.ts uses for slug
   * uniqueness, for the same reason.
   *
   * No rows back means exactly one thing: a User already holds this address.
   * That used to be the refusal. It is now the match.
   */
  const created = (await sql`
    INSERT INTO "User" (id, email, "emailVerified", name)
    VALUES (${generateId()}, ${email}, now(), ${profile.name})
    ON CONFLICT (email) DO NOTHING
    RETURNING id, "producerId"
  `) as { id: string; producerId: string | null }[];

  const fresh = created[0];
  if (fresh) {
    await sql`
      INSERT INTO "Account" (id, "userId", type, provider, "providerAccountId")
      VALUES (${generateId()}, ${fresh.id}, ${ACCOUNT_TYPE}, ${provider.id}, ${profile.providerAccountId})
      ON CONFLICT (provider, "providerAccountId") DO NOTHING
    `;
    return { kind: "created", user: { id: fresh.id, email, producerId: fresh.producerId } };
  }

  /* -- The match ------------------------------------------------------- *
   *
   * The address is taken by an account this identity is not attached to yet.
   * Attach it.
   *
   * INSERT ... SELECT rather than a read followed by a write, for the same
   * atomicity reason as above: the userId comes out of the same statement that
   * writes it, so there is no window in which the row we read stops being the
   * row we write against.
   *
   * NOTHING ON THE EXISTING USER ROW IS OVERWRITTEN - not the name, not
   * emailVerified, nothing. A provider that has just met this account does not
   * get to rewrite what the account already says about itself. It is being
   * recognised, not consulted.
   */
  const attached = (await sql`
    INSERT INTO "Account" (id, "userId", type, provider, "providerAccountId")
    SELECT ${generateId()}, u.id, ${ACCOUNT_TYPE}, ${provider.id}, ${profile.providerAccountId}
    FROM "User" u
    WHERE u.email = ${email}
    ON CONFLICT (provider, "providerAccountId") DO NOTHING
    RETURNING "userId"
  `) as { userId: string }[];

  if (!attached[0]) {
    // Nothing was written, which has one plausible cause: a concurrent sign-in
    // of this same identity attached it between our first lookup and this
    // insert. Both requests resolve through the same address to the same row,
    // so re-reading settles it and signs in exactly the account the race
    // created. The refusal below is for the case that re-read also comes back
    // empty, which should not be reachable and is reported rather than guessed.
    const owner = await ownerOf(sql, provider.id, profile.providerAccountId);
    if (owner) return { kind: "signed-in", user: owner };
    return { kind: "refused", reason: "could-not-attach", email };
  }

  const rows = (await sql`
    SELECT id, email, "producerId" FROM "User" WHERE id = ${attached[0].userId}
  `) as { id: string; email: string | null; producerId: string | null }[];

  const row = rows[0];
  if (!row || !row.email) return { kind: "refused", reason: "could-not-attach", email };

  const user: AuthUser = { id: row.id, email: row.email, producerId: row.producerId };

  // THE MOST CONSEQUENTIAL OF THE THREE ACCOUNT EVENTS, because it is the only
  // one that changes how an account can be reached without the account holder
  // having pressed anything from inside a session. Subject to the producerId
  // limitation documented on recordAccountEvent, which bites hardest here.
  await recordAccountEvent(sql, user, "account.provider_matched", provider.id);

  return { kind: "matched", user };
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

/**
 * THIS STILL EXISTS AFTER THE RULE CHANGE, and it is not redundant.
 *
 * Matching handles one case: the provider's address is the same as the
 * account's. Everything else is here. A producer signing in as
 * `orders@house.com` who wants to use their personal Gmail is the common one,
 * and no amount of address matching will ever join those two - only a live
 * session can, because only a live session proves the same person holds both.
 */
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
 *
 * ONE CONSEQUENCE OF THE 2026-09-20 MATCHING RULE, worth stating because it
 * looks like a bug the first time it happens: disconnecting Google from an
 * account whose address IS the Google address does not make Continue with
 * Google stop working. It removes the row, and the next press matches the same
 * verified address and writes it again. That is the rule behaving correctly -
 * the mailbox has not changed hands, so the proof has not stopped being true -
 * but somebody expecting disconnect to mean "refuse this from now on" will read
 * it as one. Refusing a verified address permanently would need a per-account
 * denial the console does not have and nobody has asked for.
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
 * THE 2026-09-20 MATCHING RULE MADE THIS LIMITATION WORSE, and that is recorded
 * rather than quietly accepted. `account.provider_matched` is the one event
 * here that fires without the account holder having pressed anything from
 * inside a session, so it is the one most worth having a row for - and it is
 * also the event most likely to happen to an account with no producer yet,
 * because matching happens on a producer's FIRST press of the Google button.
 * The two facts compound: the least-covered case is the most interesting one.
 * The fix is a migration making producerId nullable, not a fake id here, and it
 * is now the strongest argument on the table for doing that migration.
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
