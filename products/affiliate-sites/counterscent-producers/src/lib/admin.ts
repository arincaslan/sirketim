import { html } from "../lib/html";
import { page } from "../lib/http";
import { layout } from "../ui/layout";
import { notShipped, section } from "../ui/components";
import type { Env } from "./env";
import { db } from "./db";
import { getAuthContext, normalizeEmail, type AuthUser, type Sql } from "./auth";

/**
 * Who is allowed to run this site, and the gate every admin route sits behind.
 *
 * ============================================================================
 * ADMIN-NESS LIVES OUTSIDE THE DATABASE, ON PURPOSE.
 * ============================================================================
 *
 * Founder decision 2026-09-18, choosing an environment allowlist over a
 * `User.role` column. The reasoning is not convenience - a column would have
 * been roughly the same amount of code - it is blast radius:
 *
 *   - NOTHING THE APPLICATION DOES CAN GRANT ADMIN. There is no write path,
 *     no injection, no compromised row and no bug in a producer-facing form
 *     that can end with someone holding these powers, because the answer is
 *     not stored anywhere the application can write. A `role` column can be
 *     set by anything that can write to `User`.
 *   - REVOKING IS A CONFIG CHANGE, not a database write. `wrangler secret put
 *     ADMIN_EMAILS` and a redeploy, which works even if the database is the
 *     thing that has gone wrong.
 *   - IT MATCHES THE REALITY. There is one admin. A role model with one row is
 *     a schema pretending to solve a problem nobody has yet.
 *
 * WHEN THIS SHOULD BECOME A COLUMN: the moment a second person needs access
 * with DIFFERENT powers from the founder's. An allowlist is all-or-nothing by
 * construction, so "let this editor approve listings but not change tiers" is
 * the signal that the column has become the right shape. Until then it would
 * be a migration bought with nothing.
 *
 * ============================================================================
 * IT FAILS CLOSED, AND IT FAILS LOUDLY.
 * ============================================================================
 *
 * An unset or empty `ADMIN_EMAILS` does not mean "let everyone in" and it does
 * not mean "let nobody in silently". It answers 503 with the reason, because
 * the realistic cause is a secret that was never set on a new environment, and
 * a blank 403 would send the founder hunting through session code for a bug
 * that is one `wrangler secret put` away. Every other failure - not signed in,
 * signed in as someone else - answers 404 rather than 403. See below.
 */

/** The secret's name, in one place so the code and the error copy cannot
 *  disagree about what to set. */
export const ADMIN_EMAILS_VAR = "ADMIN_EMAILS";

/**
 * Parse the allowlist.
 *
 * Comma-separated, normalised through the SAME normalizeEmail() the sign-in
 * path uses. That matters more than it looks: if sign-in lowercases an address
 * and this did not, an allowlisted "Founder@..." would never match the stored
 * "founder@..." and the founder would be locked out of their own site with
 * every individual piece looking correct.
 */
export function parseAdminEmails(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((e) => normalizeEmail(e.trim()))
    .filter((e) => e.length > 0);
}

export function isAdminEmail(email: string | null | undefined, env: Env): boolean {
  if (!email) return false;
  const allowed = parseAdminEmails(env.ADMIN_EMAILS);
  if (allowed.length === 0) return false;
  return allowed.includes(normalizeEmail(email));
}

export type AdminGate =
  | { kind: "ok"; auth: AuthUser; sql: Sql }
  | { kind: "refused"; response: Response };

/**
 * The gate. Every admin route calls this first and returns the refusal
 * untouched if it gets one.
 *
 * WHY A NON-ADMIN GETS 404 AND NOT 403. A 403 confirms that the URL is a real
 * administrative surface belonging to this site; a 404 says nothing. These
 * routes can approve listings and attach accounts to companies, so the only
 * useful thing an unauthorised visitor should learn from them is that there is
 * nothing here. The founder, who WILL occasionally hit this while signed into
 * the wrong account, is not left guessing: the 404 body names the signed-in
 * address when there is one, which is the single fact that resolves it.
 */
export async function requireAdmin(request: Request, env: Env): Promise<AdminGate> {
  // NOT CONFIGURED IS ITS OWN ANSWER, and it is checked before the session so
  // that a fresh environment says "set the secret" rather than "sign in", then
  // "not found", which is three screens of misdirection for one missing value.
  if (parseAdminEmails(env.ADMIN_EMAILS).length === 0) {
    return { kind: "refused", response: page(notConfigured(), 503) };
  }

  const auth = await getAuthContext(request, env);
  if (!auth || !isAdminEmail(auth.email, env)) {
    return { kind: "refused", response: page(noSuchPage(auth), 404) };
  }

  const sql = db(env);
  if (!sql) return { kind: "refused", response: page(noDatabase(), 503) };

  return { kind: "ok", auth, sql };
}

/** The actor id written into every AuditEvent an admin action produces.
 *
 *  THE EMAIL, NOT THE USER ID. Audit rows outlive accounts: `User` rows can be
 *  deleted and ids are opaque, so a row reading `actorId: "clx8f2..."` is
 *  unanswerable a year later, which defeats the point of an append-only log.
 *  The address is the thing a human can still resolve. */
export function adminActorId(auth: AuthUser): string {
  return auth.email ?? auth.id;
}

/* ---------------------------------------------------------------------- *
 * The refusals
 * ---------------------------------------------------------------------- */

function notConfigured() {
  return layout({
    title: "Admin",
    heading: "This deployment has no administrators",
    status: {
      label: "Not configured",
      tone: "outline",
      note: html`Nothing was read and nothing can be changed from here until the secret is
        set.`,
    },
    body: section({
      heading: "What to set",
      body: html`
        <div class="stack">
          ${notShipped({
            what: `The ${ADMIN_EMAILS_VAR} secret is unset or empty on this environment`,
            reason: html`Administrative access on this origin is a deployment secret rather
              than a database column, so that nothing the application itself does can grant
              it and revoking it never depends on the database being healthy. With the
              secret unset there is no one to let in, and the honest answer is to say so
              rather than to refuse everybody with no reason or - far worse - to fall back
              to letting anybody in.`,
          })}
          <p>
            Set it with
            <code>npx wrangler secret put ${ADMIN_EMAILS_VAR}</code> and give it a
            comma-separated list of addresses, then redeploy. Locally the same key goes in
            <code>.dev.vars</code>.
          </p>
          <p><a href="/console">Back to the console</a>.</p>
        </div>
      `,
    }),
  });
}

/**
 * The 404 shown to everyone who is not an administrator.
 *
 * It deliberately does NOT say "you are not an admin" or "access denied": that
 * would confirm the surface exists. What it does do is name the signed-in
 * address, because the overwhelmingly likely reader of this page is the
 * founder on the wrong account, and that one fact ends the confusion without
 * telling a stranger anything they did not already supply themselves.
 */
function noSuchPage(auth: AuthUser | null) {
  return layout({
    title: "Not found",
    heading: "There is nothing at this address",
    status: {
      label: "Not found",
      tone: "outline",
      note: html`No page here.`,
    },
    body: section({
      heading: "Where to go instead",
      body: html`
        <div class="stack">
          <p><a href="/console">The producer console</a> is probably what you want.</p>
          ${auth
            ? html`<p class="muted">
                You are signed in as
                <span class="wrap-anywhere">${auth.email ?? ""}</span>. If you expected
                something else here, it is because this address is not the one that has it.
              </p>`
            : html`<p class="muted">
                You are not signed in. <a href="/sign-in">Request a sign-in link</a> if you
                have an account.
              </p>`}
        </div>
      `,
    }),
  });
}

function noDatabase() {
  return layout({
    title: "Admin",
    heading: "The database did not answer",
    status: {
      label: "No database",
      tone: "outline",
      note: html`Nothing was read and nothing was written.`,
    },
    body: section({
      heading: "This is our side",
      body: html`<p>
        The connection string is missing or the database did not respond. No administrative
        action ran. <a href="/console">Back to the console</a>.
      </p>`,
    }),
  });
}
