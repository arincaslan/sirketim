/**
 * ============================================================================
 * THE PROVIDER TABLE. Every provider-specific fact on this origin lives here.
 * ============================================================================
 *
 * src/lib/oauth.ts implements one flow and knows nothing about Google; this
 * file is the data it reads. Adding a provider should be an entry in PROVIDERS
 * and nothing else. If one ever needs a change in oauth.ts to work, that is a
 * signal the abstraction is wrong, not an invitation to special-case it there.
 *
 * FOUNDER DECISIONS, 2026-09-20, in the order they were taken. All three of the
 * rejections are recorded because each was priced, not guessed at:
 *
 *   GOOGLE - shipped. The only configured provider.
 *   MICROSOFT - built, then DROPPED the same day before it was ever deployed.
 *     See the note on `canCreateAccount` below: it is the provider that
 *     motivated that rule, and re-adding it is one entry in PROVIDERS plus two
 *     secrets. Nothing else in this codebase assumes a second provider exists.
 *   APPLE - rejected on cost and operations. $99/yr Developer Program, a client
 *     secret that is an ES256 JWT needing regeneration at most every six months
 *     (a recurring chore that breaks sign-in when missed), and Private Relay
 *     addresses that fight both the email-keyed admin check and no-auto-link.
 *   GITHUB - rejected as the wrong audience. A perfume house owner does not
 *     have a GitHub account.
 *
 * Passkeys are the intended second method and are NOT a provider. They need no
 * entry here, no third party, and no recurring credential.
 */

import type { Env } from "./env";
import type { IdTokenClaims } from "./oauth";

export type ProviderId = "google";

/** What a provider tells us about the person who just signed in. Deliberately
 *  four fields: anything else a provider offers is not used, so it is not
 *  collected. */
export interface ProviderProfile {
  /**
   * The provider's STABLE identifier, which is `sub` and is never the email
   * address.
   *
   * This is the single most important line in this file. A provider's email is
   * reassignable - Google Workspace addresses get reused when staff change, and
   * Microsoft's own claims reference states outright that its email claim is
   * mutable and must never be used to identify a user. Keying the Account row
   * on `sub` means a producer who renames their mailbox keeps their account,
   * and an address later reassigned to a different person does not inherit one.
   */
  providerAccountId: string;
  email: string | null;
  /** Whether the PROVIDER asserts it has verified this address. See
   *  `canCreateAccount` for the only thing this is allowed to decide. */
  emailVerified: boolean;
  name: string | null;
}

export interface OAuthProvider {
  id: ProviderId;
  /** Shown on the button. "Continue with Google". */
  label: string;
  authorizeEndpoint: string;
  tokenEndpoint: string;
  scopes: string[];
  extraAuthorizeParams: Record<string, string>;
  clientIdKey: keyof Env;
  clientSecretKey: keyof Env;
  /**
   * MAY THIS PROVIDER CREATE A USER ROW THAT DID NOT EXIST BEFORE?
   *
   * The rule: a provider may sign somebody UP only if it asserts that it has
   * verified the email address. Google does, through `email_verified`.
   *
   * NO CONFIGURED PROVIDER TRIPS THIS TODAY, and it stays anyway. Microsoft was
   * the provider it was written for - Entra publishes no `email_verified` claim
   * for any account type, so nothing it sends could satisfy the rule - and
   * dropping Microsoft did not make the reasoning wrong, only currently unused.
   * The next provider added is exactly the moment it is needed again, and a
   * rule deleted is a rule whose reasoning has to be re-derived under time
   * pressure by whoever adds one. It is a boolean and a branch.
   *
   * THE HOLE IT CLOSES is not the obvious one. "Never auto-link" already stops
   * a provider identity from joining an EXISTING account. Without this, though,
   * somebody could sign up with an address they do not own but that nobody here
   * has registered yet; when the real owner later arrives at the magic link,
   * findOrCreateUser() upserts on email and would drop them into the squatter's
   * account with the squatter's Account row still attached. The refusal has to
   * happen at creation time, because after creation the two are
   * indistinguishable.
   */
  canCreateAccount: boolean;
  /**
   * Whether `iss` is one this provider is allowed to have issued. Takes the
   * whole claim set because a multi-tenant provider's answer can depend on a
   * second claim.
   */
  acceptsIssuer(iss: string, claims: IdTokenClaims): boolean;
  /** Pulls the four fields above out of a validated claim set, or null if the
   *  token is missing something this provider was supposed to send. */
  profileFrom(claims: IdTokenClaims): ProviderProfile | null;
}

function readString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

/* ---------------------------------------------------------------------- *
 * Google
 * ---------------------------------------------------------------------- */

const GOOGLE: OAuthProvider = {
  id: "google",
  label: "Google",
  authorizeEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
  tokenEndpoint: "https://oauth2.googleapis.com/token",
  // `openid` for an id_token at all, `email` for the address and its verified
  // flag, `profile` for a display name. No API scope is requested: this Worker
  // calls no Google API, and a scope we do not use is consent a producer is
  // asked for on our behalf for nothing. These three are also the scopes
  // Google classes as non-sensitive, which is what keeps the consent screen
  // publishable without an app verification review.
  scopes: ["openid", "email", "profile"],
  // ALWAYS SHOW THE ACCOUNT CHOOSER. Without this, a producer with two Google
  // accounts is silently signed in as whichever one their browser prefers,
  // which on this origin decides which company's listings they see. Being
  // asked every time is the lesser cost by a wide margin.
  extraAuthorizeParams: { prompt: "select_account" },
  clientIdKey: "GOOGLE_CLIENT_ID",
  clientSecretKey: "GOOGLE_CLIENT_SECRET",
  canCreateAccount: true,
  // Google documents BOTH forms as valid for the same tokens, and which one
  // arrives is not something we control, so both are accepted explicitly
  // rather than one being picked and the other becoming a mystery outage.
  acceptsIssuer: (iss) => iss === "https://accounts.google.com" || iss === "accounts.google.com",
  profileFrom(claims) {
    const sub = readString(claims.sub);
    if (!sub) return null;
    return {
      providerAccountId: sub,
      email: readString(claims.email),
      // Google sends this as a JSON boolean, but has historically sent the
      // STRING "true" in some responses. Both are accepted and everything else
      // - including absence - is false. Note the direction of the default:
      // unverified is the safe answer, because this flag is what decides
      // whether an account may be created.
      emailVerified: claims.email_verified === true || claims.email_verified === "true",
      name: readString(claims.name),
    };
  },
};

/* ---------------------------------------------------------------------- *
 * The table
 * ---------------------------------------------------------------------- */

export const PROVIDERS: Record<ProviderId, OAuthProvider> = {
  google: GOOGLE,
};

/** Narrows an arbitrary path segment to a known provider. The router needs
 *  this because `/auth/:provider/start` takes its provider from the URL, and
 *  an unknown one must 404 rather than reach any of the code above. */
export function toProviderId(value: string): ProviderId | null {
  return value === "google" ? value : null;
}

/** Only the providers whose BOTH secrets are set, in display order.
 *
 *  This is what the sign-in page and the connected-accounts page both render
 *  from, so an unconfigured provider is invisible rather than a button that
 *  fails when pressed. That is this project's house rule about features whose
 *  backing service is not configured, applied to a button instead of a page. */
export function configuredProviders(env: Env): OAuthProvider[] {
  return [GOOGLE].filter((p) => {
    const id = (env[p.clientIdKey] ?? "").trim();
    const secret = (env[p.clientSecretKey] ?? "").trim();
    return id.length > 0 && secret.length > 0;
  });
}
