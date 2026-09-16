import { readSessionCookie } from "./auth";

/**
 * ============================================================================
 * CSRF TOKENS DERIVED FROM THE SESSION. No new secret, no new table.
 * ============================================================================
 *
 * WHY PHASE 1 DID NOT NEED THIS AND PHASE 2 DOES. Until now this origin
 * accepted two writes: POST /sign-in, which is unauthenticated and therefore
 * has no session for a forgery to ride on, and POST /sign-out, whose worst
 * outcome is an unwanted sign-out. `SameSite=Lax` on the session cookie plus
 * `form-action 'self'` in the CSP plus POST-only handlers was a fair defence
 * for those two. It is not a fair defence for a withdraw: a forged POST there
 * takes a producer's listing off the public catalogue at the next build, and
 * the unique constraint on (producerId, referenceSlug) means they cannot put
 * it back from the console afterwards. That is close enough to irreversible
 * that "probably not reachable" stops being good enough.
 *
 * THE SHAPE, AND WHY IT NEEDS NOTHING NEW. The session token is 32 random
 * bytes, `HttpOnly`, and `__Host-` prefixed, so a page on another origin can
 * neither read it nor overwrite it. A SHA-256 over that token plus a
 * per-purpose string is therefore a value only a page rendered by this origin,
 * for this session, can contain. It needs:
 *
 *   no secret   - the entropy is the session token's own 256 bits, so there is
 *                 nothing for the founder to set before a deploy works, and
 *                 therefore nothing that can be forgotten and 503 the console
 *                 with nobody there to fix it.
 *   no storage  - it is a pure function of the cookie, so there is no table to
 *                 migrate, nothing to expire, and nothing to clean up.
 *   no rotation - rotating the session rotates the token, which is exactly the
 *                 lifetime a per-session CSRF token should have.
 *
 * WHAT THIS IS NOT, STATED SO NOBODY LATER MISREADS IT AS A MAC. It is a plain
 * digest, not a keyed HMAC, so anyone holding the session token can compute it.
 * That costs nothing: anyone holding the session token already has the session
 * and does not need to forge anything. What matters is the other direction, and
 * it holds - the digest does not reveal the token (a 256-bit preimage), so
 * leaking a rendered page does not leak the session.
 *
 * THE PER-PURPOSE STRING is defence in depth rather than the main event: a
 * token minted into the sign-out form cannot be replayed into the withdraw
 * handler, so a page that leaks one form's markup does not hand over every
 * verb on the origin.
 *
 * KNOWN LIMIT, named rather than implied: this defends against cross-origin
 * forgery, which is what CSRF is. It does not defend against an attacker who
 * can already read this origin's HTML, and nothing token-shaped would.
 */

/** Every authenticated write on this origin, and nothing else. Adding a verb
 *  means adding it here, which is deliberate friction: a write that forgot to
 *  pick a purpose would not compile. */
export type CsrfPurpose = "sign-out" | "submit-listing" | "withdraw-listing";

/** The form field the token travels in. One name everywhere, so a handler and
 *  a form cannot disagree about it. */
export const CSRF_FIELD = "csrf";

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function derive(sessionToken: string, purpose: CsrfPurpose): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(`counterscent-csrf:${purpose}:${sessionToken}`),
  );
  return toHex(new Uint8Array(digest));
}

/**
 * The token to embed in a form on this request's page, or null when there is
 * no session cookie to derive one from.
 *
 * Null is not an error case in practice: every form this protects is only
 * rendered to a signed-in reader. A caller that gets null has found a bug in
 * its own gating, and rendering no hidden field is the right failure - the
 * POST would then be refused rather than accepted with a missing token.
 */
export async function csrfToken(request: Request, purpose: CsrfPurpose): Promise<string | null> {
  const session = readSessionCookie(request);
  if (!session) return null;
  return derive(session, purpose);
}

/**
 * Whether the submitted value matches what this session's form should have
 * carried.
 *
 * The comparison is length-safe and does not short-circuit on the first
 * differing character. Timing is not the realistic attack here (the attacker
 * would need the session cookie to make the measurement useful in the first
 * place), but a comparison that leaks position is free to avoid and expensive
 * to retrofit once three handlers call it.
 */
export async function verifyCsrf(
  request: Request,
  purpose: CsrfPurpose,
  submitted: string | null,
): Promise<boolean> {
  if (!submitted) return false;
  const expected = await csrfToken(request, purpose);
  if (!expected) return false;
  if (submitted.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ submitted.charCodeAt(i);
  }
  return diff === 0;
}
