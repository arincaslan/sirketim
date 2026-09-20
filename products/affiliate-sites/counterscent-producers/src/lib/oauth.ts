/**
 * ============================================================================
 * OAUTH / OIDC CORE, provider-agnostic.
 * ============================================================================
 *
 * FOUNDER DECISION 2026-09-20: "having only one way to login is outdated".
 * Correct, and this file is the half of the answer that is not the magic link.
 * Two things were decided with it, and both are load-bearing here rather than
 * merely recorded:
 *
 * 1. NO PASSWORDS, and the reason was measured rather than argued. Cloudflare's
 *    Workers FREE plan allows 10ms of CPU per request (verified against
 *    developers.cloudflare.com/workers/platform/limits, not assumed). Measured
 *    PBKDF2-HMAC-SHA256 through WebCrypto on a desktop CPU faster than the
 *    edge's: 600,000 iterations (OWASP's current figure) costs 103ms, 210,000
 *    costs 37ms, and even 100,000 costs 19ms. A defensible password hash is
 *    between 2x and 10x this Worker's entire per-request budget, so passwords
 *    here would mean either $5/mo for Workers Paid or an iteration count low
 *    enough that the hash is decorative. The founder chose neither.
 *
 *    The deeper reason is not the CPU: a password system needs a reset flow,
 *    and a reset flow IS a magic link. Passwords would not have replaced the
 *    email dependency, only added a stealable credential on top of it.
 *
 * 2. NEVER AUTO-LINK. A provider identity that arrives carrying an email which
 *    already belongs to a User is REFUSED, not signed in. See resolveIdentity()
 *    in src/lib/oauth-account.ts for the whole rule; the short version is that
 *    auto-linking on a provider-asserted email is the classic "sign in with X"
 *    takeover, and this origin's admin check is keyed on email address, so the
 *    prize for winning it is the admin panel.
 *
 * WHAT THIS FILE IS NOT. It is not a general OAuth client and should not grow
 * into one. It implements exactly one flow - authorization code with PKCE, for
 * a confidential client, against providers that publish an OIDC id_token - and
 * every provider-specific fact lives in src/lib/providers.ts instead, so that
 * adding a third provider is a data change there and a code change nowhere.
 */

import type { Env } from "./env";
import type { OAuthProvider, ProviderId } from "./providers";

/* ---------------------------------------------------------------------- *
 * base64url
 * ---------------------------------------------------------------------- */

/** RFC 4648 section 5: base64 with a URL-safe alphabet and no padding. Both
 *  the PKCE challenge and every JWT segment are encoded this way. */
export function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** The inverse. Restores the standard alphabet and the padding `atob` needs.
 *  Throws on anything that is not valid base64, which is the right outcome:
 *  every caller here is decoding a segment a provider just gave us, and a
 *  segment we cannot decode is a token we must not act on. */
export function base64UrlDecode(value: string): Uint8Array {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(padded + "=".repeat((4 - (padded.length % 4)) % 4));
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
  return out;
}

function randomBase64Url(byteLength: number): string {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return base64UrlEncode(bytes);
}

/* ---------------------------------------------------------------------- *
 * PKCE
 * ---------------------------------------------------------------------- */

/**
 * PKCE IS USED EVEN THOUGH THIS IS A CONFIDENTIAL CLIENT, and that is not
 * belt-and-braces for its own sake. Without it, an authorization code that
 * leaks in transit - a Referer header, a proxy log, a shared browser's history,
 * a redirect_uri that some future edit makes less exact - is redeemable by
 * whoever holds it plus the client secret. With it, the code is worthless
 * without the verifier, which never leaves this browser's cookie. OAuth 2.1
 * makes PKCE mandatory for all clients for this reason; we are simply early.
 */
export async function pkceChallenge(verifier: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier));
  return base64UrlEncode(new Uint8Array(digest));
}

/* ---------------------------------------------------------------------- *
 * The in-flight cookie
 * ---------------------------------------------------------------------- */

/**
 * WHY A COOKIE RATHER THAN A DATABASE ROW. The state, the PKCE verifier and
 * the nonce all exist for a single round trip measured in seconds, and all
 * three are meaningless to anyone but the browser that started the flow. A
 * table would mean a write on every click of a sign-in button - including
 * every abandoned one - plus a sweep to clean it up, to store data whose only
 * reader is the same browser that produced it. The cookie is the correct
 * shape, and `__Host-` makes it unspoofable by any other host.
 */
export const OAUTH_FLOW_COOKIE = "__Host-oauth";

/** Ten minutes. Long enough to read a provider's consent screen and pick an
 *  account; short enough that an abandoned flow leaves nothing usable behind.
 *  It is also the only expiry this flow has - there is no server-side record
 *  to outlive it. */
const FLOW_TTL_SECONDS = 600;

/**
 * `signin` may create a User (subject to the provider asserting a verified
 * email); `link` may not, and attaches the provider identity to the session's
 * existing User instead.
 *
 * THEY ARE SEPARATE MODES RATHER THAN ONE FLOW THAT INFERS ITS INTENT, because
 * inferring it means deciding "is somebody signed in right now?" at callback
 * time, and that is a different question from "what did this flow set out to
 * do?" whenever a session begins or ends mid-flow. Two modes make the callback
 * check the answer it was promised rather than re-derive one.
 */
export type FlowMode = "signin" | "link";

export interface OAuthFlow {
  provider: ProviderId;
  mode: FlowMode;
  state: string;
  verifier: string;
  nonce: string;
  /**
   * For `link` only: the User this flow was started by.
   *
   * THE CALLBACK RE-CHECKS THIS AGAINST THE LIVE SESSION and refuses if they
   * disagree. The case it exists for is mundane rather than exotic: a producer
   * starts a link, signs out (or the session expires, or they sign in as
   * somebody else in another tab), then finishes the flow. Without this, the
   * provider identity would attach to whichever account happened to be signed
   * in at the end, which is a silent mis-link and exactly the kind of thing
   * nobody notices until two people share an account.
   */
  userId?: string;
}

export function newFlow(provider: ProviderId, mode: FlowMode, userId?: string): OAuthFlow {
  return {
    provider,
    mode,
    // 32 bytes each. State and nonce defend different things (state binds the
    // callback to this browser's request, nonce binds the id_token to it), so
    // they are separate values rather than one reused twice.
    state: randomBase64Url(32),
    nonce: randomBase64Url(32),
    // RFC 7636 allows 43 to 128 characters; 32 random bytes encodes to 43.
    verifier: randomBase64Url(32),
    ...(userId ? { userId } : {}),
  };
}

export function serializeFlowCookie(flow: OAuthFlow): string {
  const value = base64UrlEncode(new TextEncoder().encode(JSON.stringify(flow)));
  return [
    OAUTH_FLOW_COOKIE + "=" + value,
    "Max-Age=" + FLOW_TTL_SECONDS,
    "Path=/",
    "HttpOnly",
    "Secure",
    // Lax, NOT Strict, and this one matters: the callback arrives as a
    // top-level GET navigation from the provider's origin. A Strict cookie is
    // withheld on exactly that navigation, so the flow would fail its own
    // state check every time. Lax is sent on top-level GETs, which is the
    // case this cookie exists to serve and the only one it is read on.
    "SameSite=Lax",
  ].join("; ");
}

export function clearFlowCookieHeader(): string {
  return [OAUTH_FLOW_COOKIE + "=", "Max-Age=0", "Path=/", "HttpOnly", "Secure", "SameSite=Lax"].join("; ");
}

/**
 * Reads and structurally validates the flow cookie. Returns null for absent,
 * malformed, or missing-a-required-field - all of which are treated
 * identically by every caller, because there is no useful way to distinguish
 * "you took too long" from "you arrived without ever starting" that does not
 * also tell an attacker which of their guesses was closer.
 */
export function readFlowCookie(request: Request): OAuthFlow | null {
  const header = request.headers.get("Cookie");
  if (!header) return null;
  let encoded: string | null = null;
  for (const part of header.split(";")) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    if (part.slice(0, eq).trim() === OAUTH_FLOW_COOKIE) {
      encoded = part.slice(eq + 1).trim();
      break;
    }
  }
  if (!encoded) return null;
  try {
    const parsed = JSON.parse(new TextDecoder().decode(base64UrlDecode(encoded))) as Partial<OAuthFlow>;
    if (
      typeof parsed.provider !== "string" ||
      typeof parsed.state !== "string" ||
      typeof parsed.verifier !== "string" ||
      typeof parsed.nonce !== "string" ||
      (parsed.mode !== "signin" && parsed.mode !== "link")
    ) {
      return null;
    }
    return parsed as OAuthFlow;
  } catch {
    return null;
  }
}

/**
 * Constant-time-ish string comparison for the state check.
 *
 * Same reasoning as verifyCsrf() in src/lib/csrf.ts, and the same shape on
 * purpose: timing is not the realistic attack (the attacker would have to be
 * able to set the victim's __Host- cookie to make a measurement useful), but a
 * comparison that leaks position is free to avoid here and awkward to retrofit
 * once several callers exist.
 */
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/* ---------------------------------------------------------------------- *
 * The authorization request
 * ---------------------------------------------------------------------- */

export function authorizeUrl(
  provider: OAuthProvider,
  clientId: string,
  redirectUri: string,
  flow: OAuthFlow,
  challenge: string,
): string {
  const url = new URL(provider.authorizeEndpoint);
  const params: Record<string, string> = {
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: provider.scopes.join(" "),
    state: flow.state,
    nonce: flow.nonce,
    code_challenge: challenge,
    code_challenge_method: "S256",
    ...provider.extraAuthorizeParams,
  };
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  return url.toString();
}

/**
 * THE PROVIDER COMPARES THIS AS A STRING, byte for byte, against what is
 * registered in its console. That is what makes the scheme below a real bug
 * rather than a detail, and it was caught by reading an actual redirect rather
 * than by reasoning about the code.
 *
 * The host is taken from the request because this Worker is bound to exactly
 * one hostname (wrangler.jsonc, custom_domain: true), so deriving it and
 * hardcoding it are the same value in production, and deriving it keeps the
 * two from drifting if the domain ever changes. IF A SECOND HOSTNAME IS EVER
 * BOUND TO THIS WORKER, this becomes wrong: it would send whichever host the
 * request arrived on, and only one of them is registered. Pin it to a secret
 * at that point.
 *
 * THE SCHEME IS FORCED TO HTTPS off localhost, and is not simply taken from
 * the request. Under `wrangler dev` the URL arrives as
 * http://producers.counterscent.com/... - wrangler rewrites the host to the
 * configured custom domain while leaving the scheme plain - so a derived
 * origin produces an http:// URI for a host that only ever serves https. Every
 * provider rejects that, and Google additionally refuses http for any host but
 * localhost. Localhost keeps http because that is the one case providers
 * permit it and the one case it is true.
 */
export function redirectUriFor(request: Request, provider: ProviderId): string {
  const url = new URL(request.url);
  const local = url.hostname === "localhost" || url.hostname === "127.0.0.1";
  const scheme = local ? url.protocol : "https:";
  return scheme + "//" + url.host + "/auth/" + provider + "/callback";
}

/* ---------------------------------------------------------------------- *
 * The code exchange
 * ---------------------------------------------------------------------- */

export type ExchangeResult =
  | { ok: true; idToken: string; accessToken: string | null }
  | { ok: false; reason: "network" | "rejected" | "no-id-token" };

/**
 * Trades the authorization code for tokens, server to server.
 *
 * `client_secret_post` rather than HTTP Basic: Google accepts it, it is the
 * form Google documents first, and it avoids a second
 * encoding rule (Basic requires the id and secret to be form-urlencoded
 * BEFORE base64, a step that is easy to omit and works fine right up until a
 * secret contains a character that needs it).
 *
 * EVERY FAILURE IS COARSE ON PURPOSE. The caller turns all three into the same
 * user-facing sentence. A provider's error body is never useful to the person
 * looking at the screen, and echoing a token endpoint's response into our own
 * output is how a client secret ends up somewhere it was never meant to be.
 */
export async function exchangeCode(
  provider: OAuthProvider,
  clientId: string,
  clientSecret: string,
  redirectUri: string,
  code: string,
  verifier: string,
): Promise<ExchangeResult> {
  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    code,
    code_verifier: verifier,
    grant_type: "authorization_code",
    redirect_uri: redirectUri,
  });

  let response: Response;
  try {
    response = await fetch(provider.tokenEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
      body,
    });
  } catch {
    return { ok: false, reason: "network" };
  }

  if (!response.ok) return { ok: false, reason: "rejected" };

  let payload: { id_token?: unknown; access_token?: unknown };
  try {
    payload = (await response.json()) as typeof payload;
  } catch {
    return { ok: false, reason: "rejected" };
  }

  if (typeof payload.id_token !== "string" || payload.id_token.length === 0) {
    return { ok: false, reason: "no-id-token" };
  }
  return {
    ok: true,
    idToken: payload.id_token,
    accessToken: typeof payload.access_token === "string" ? payload.access_token : null,
  };
}

/* ---------------------------------------------------------------------- *
 * The id_token
 * ---------------------------------------------------------------------- */

export interface IdTokenClaims {
  iss?: unknown;
  aud?: unknown;
  sub?: unknown;
  exp?: unknown;
  nonce?: unknown;
  email?: unknown;
  email_verified?: unknown;
  name?: unknown;
  preferred_username?: unknown;
  tid?: unknown;
  [key: string]: unknown;
}

export type ClaimsResult =
  | { ok: true; claims: IdTokenClaims }
  | { ok: false; reason: "malformed" | "issuer" | "audience" | "expired" | "nonce" };

/** Sixty seconds, applied only to `exp`. Clock skew between a provider's
 *  signing host and a Cloudflare edge is real and small; this absorbs it
 *  without meaningfully extending a token's life. */
const CLOCK_SKEW_SECONDS = 60;

/**
 * WHY THE SIGNATURE IS NOT VERIFIED, stated plainly because "we skipped the
 * signature check" is the kind of line that should never pass review silently.
 *
 * OpenID Connect Core section 3.1.3.7 clause 6: when the ID Token is received
 * directly from the Token Endpoint over a TLS connection the client has
 * validated, the client MAY use that TLS server validation in place of
 * checking the token signature. That is exactly this path - the token arrives
 * in the response body of a POST this Worker made to a hardcoded https://
 * endpoint in src/lib/providers.ts, not via the browser, not from any URL an
 * attacker influences. There is no untrusted hop to forge on, so a JWKS fetch,
 * a key cache and an RS256 verify would add three moving parts and defend
 * nothing. If an id_token is ever accepted from anywhere OTHER than a direct
 * token-endpoint response, this reasoning evaporates and the signature must be
 * checked - that is the condition to watch, not the passage of time.
 *
 * WHAT IS STILL CHECKED, because none of it follows from TLS: the issuer is
 * who we expect, the audience is OUR client id (a token minted for a different
 * application is not usable here), it has not expired, and the nonce matches
 * the one this browser's flow generated. Those four are the actual content of
 * "this token is for us, and for this sign-in attempt".
 */
export function parseIdToken(
  provider: OAuthProvider,
  idToken: string,
  clientId: string,
  expectedNonce: string,
): ClaimsResult {
  const segments = idToken.split(".");
  if (segments.length !== 3) return { ok: false, reason: "malformed" };

  const payloadSegment = segments[1];
  if (!payloadSegment) return { ok: false, reason: "malformed" };

  let claims: IdTokenClaims;
  try {
    claims = JSON.parse(new TextDecoder().decode(base64UrlDecode(payloadSegment))) as IdTokenClaims;
  } catch {
    return { ok: false, reason: "malformed" };
  }

  if (typeof claims.sub !== "string" || claims.sub.length === 0) return { ok: false, reason: "malformed" };

  if (typeof claims.iss !== "string" || !provider.acceptsIssuer(claims.iss, claims)) {
    return { ok: false, reason: "issuer" };
  }

  // `aud` is a string or an array of strings per RFC 7519. Both are handled
  // rather than assuming the string form, because assuming it would fail OPEN
  // if a provider ever sent the array: an array is not equal to any string, so
  // the comparison would be false and the token rejected - safe here, but the
  // explicit branch is what makes that a decision rather than an accident.
  const audOk = Array.isArray(claims.aud) ? claims.aud.some((a) => a === clientId) : claims.aud === clientId;
  if (!audOk) return { ok: false, reason: "audience" };

  if (typeof claims.exp !== "number" || claims.exp + CLOCK_SKEW_SECONDS < Math.floor(Date.now() / 1000)) {
    return { ok: false, reason: "expired" };
  }

  if (typeof claims.nonce !== "string" || !safeEqual(claims.nonce, expectedNonce)) {
    return { ok: false, reason: "nonce" };
  }

  return { ok: true, claims };
}

/* ---------------------------------------------------------------------- *
 * Configuration
 * ---------------------------------------------------------------------- */

export interface ProviderCredentials {
  clientId: string;
  clientSecret: string;
}

/**
 * A provider's credentials, or null when either half is missing.
 *
 * ALL OR NOTHING, and the `.trim()` is not cosmetic: `wrangler secret put`
 * reads a value that has been pasted into a terminal, and a trailing newline
 * in a client id produces a redirect_uri_mismatch-shaped failure at the
 * provider with nothing in our own logs to explain it. Treating whitespace as
 * absent turns a silent, remote, confusing failure into a button that does not
 * render, which is the failure this project prefers everywhere else too.
 */
export function providerCredentials(env: Env, provider: OAuthProvider): ProviderCredentials | null {
  const clientId = (env[provider.clientIdKey] ?? "").trim();
  const clientSecret = (env[provider.clientSecretKey] ?? "").trim();
  if (!clientId || !clientSecret) return null;
  return { clientId, clientSecret };
}
