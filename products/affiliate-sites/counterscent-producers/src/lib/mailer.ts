import type { Env } from "./env";

/**
 * The one email this origin sends: a sign-in link.
 *
 * WHY THIS IS AN HTTP CALL AND NOT SMTP. Until 2026-09-16 this file drove a
 * hand-written SMTP client (src/lib/smtp.ts, since deleted) over
 * `cloudflare:sockets`, justified in its own header by the claim that
 * "Hostinger's mailbox is SMTP-only - there is no HTTP transactional mail API
 * behind it." That claim was wrong. Hostinger publishes
 * `POST /api/v1/mailboxes/{id}/send`, confirmed live against this very mailbox
 * before this file was rewritten.
 *
 * The deciding argument was not elegance and not security - it was what can be
 * verified before shipping. The SMTP path rested on an assumption nobody had
 * tested, that outbound TCP 465 is permitted on this Workers plan, and the
 * only way to test it was to deploy. Every other part of the auth step was
 * verified against a real Postgres by importing the shipped functions; the
 * mail send was the single exception, and it was also the largest piece of
 * unproven code. An HTTP call's failure modes can be exercised from a laptop
 * with curl before a secret is set. See the root CLAUDE.md: "Before
 * hand-rolling a wire protocol, check whether the vendor publishes an HTTP
 * API."
 *
 * The old client was deleted rather than kept as a fallback, deliberately.
 * Two rails would mean both credentials live on this Worker - doubling the
 * exposure that choosing between them was supposed to be about - and would
 * keep an untested code path alive that gets reached precisely when things are
 * already going wrong.
 *
 * WHAT DID NOT IMPROVE: a leak of the API token reaches read, delete and
 * webhook management on contact@counterscent.com, and SMTP credentials (the
 * mailbox's own password, so IMAP and webmail too) were no narrower. Neither
 * rail is send-scoped, because Hostinger's API has no such scope. src/lib/env.ts
 * carries the full statement of what a leak costs.
 */

/** Hostinger's Email API. Same host the hostinger-email MCP server talks to. */
const MAIL_API_BASE = "https://api.mail.hostinger.com";

/** The From display name. The From *address* is not ours to choose here: the
 *  API sends as whichever mailbox HOSTINGER_MAILBOX_ID identifies, which is
 *  why there is no from field in the payload below. */
const FROM_NAME = "Counterscent";

/** Bounds a hung upstream rather than letting it consume the request's whole
 *  budget. Hostinger documents 502/504 for its own upstream failures, so a
 *  slow path here is an anticipated state, not a surprise. */
const SEND_TIMEOUT_MS = 10_000;

export type MailResult = { sent: true } | { sent: false; reason: "not-configured" | "send-failed" };

/**
 * Whether this Worker can currently send mail at all, checked at request time
 * rather than assumed. The house rule (`notShipped()`, src/ui/components.ts)
 * is that a feature whose backing secret is missing has to say so rather than
 * fail silently or lie about success, and both callers in
 * src/routes/sign-in.ts check this before rendering a live form.
 */
export function mailConfigured(env: Env): boolean {
  return Boolean(env.HOSTINGER_MAIL_API_TOKEN && env.HOSTINGER_MAILBOX_ID);
}

/**
 * Sends the sign-in link. Returns a result rather than throwing, because every
 * caller is a route handler deciding which page state to render next, never a
 * place that wants an unhandled exception turning into a generic 500.
 */
export async function sendMagicLink(env: Env, to: string, verifyUrl: string): Promise<MailResult> {
  if (!mailConfigured(env)) return { sent: false, reason: "not-configured" };

  const text = [
    `Sign in to the Counterscent producer console.`,
    ``,
    `${verifyUrl}`,
    ``,
    `This link works once and expires in 15 minutes. If you did not request`,
    `it, nothing happens if you ignore it - no account exists until this link`,
    `is used, and this one email is the only trace of the request.`,
    ``,
    `Counterscent`,
  ].join("\n");

  const url = `${MAIL_API_BASE}/api/v1/mailboxes/${encodeURIComponent(env.HOSTINGER_MAILBOX_ID!)}/send`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.HOSTINGER_MAIL_API_TOKEN}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ to: [to], subject: "Sign in to Counterscent", text, displayName: FROM_NAME }),
      signal: AbortSignal.timeout(SEND_TIMEOUT_MS),
    });
  } catch (err) {
    // Network failure or the timeout above. Logged for `wrangler tail`
    // (observability is enabled in wrangler.jsonc), never shown to the
    // requester - see src/routes/sign-in.ts for why the failure page stays
    // generic regardless of cause.
    console.error("sendMagicLink: request failed", err instanceof Error ? err.message : err);
    return { sent: false, reason: "send-failed" };
  }

  // 204 No Content is the documented success, and it carries no body - so
  // this must not parse JSON on the happy path. A copy of every message sent
  // this way is saved to the mailbox's INBOX.Sent by the API itself, which
  // SMTP-from-a-Worker would not have done: magic links accumulate in the
  // business mailbox. Harmless at present (quota is 100,000 messages against
  // 4 in use) but it is real, and it is where to look to confirm a send.
  if (response.status === 204) return { sent: true };

  // Everything else is a failure with a documented envelope: {code, error,
  // params}. `code` is the machine-readable one - ERR_UNAUTHORIZED,
  // ERR_FORBIDDEN, ERR_VALIDATION_FAILED, ERR_UPSTREAM_UNAVAILABLE,
  // ERR_GATEWAY_TIMEOUT - and is what this logs, because `error` is
  // human-facing prose the vendor may reword. Parsing is best-effort: a 502
  // from an edge in front of the API may not be JSON at all.
  let code = "unparsed";
  try {
    const body = (await response.json()) as { code?: unknown };
    if (typeof body?.code === "string") code = body.code;
  } catch {
    // Left as "unparsed" on purpose. The status is the useful signal here and
    // it is logged either way; swallowing this must not cost the log line.
  }
  console.error(`sendMagicLink: HTTP ${response.status} ${code}`);
  return { sent: false, reason: "send-failed" };
}
