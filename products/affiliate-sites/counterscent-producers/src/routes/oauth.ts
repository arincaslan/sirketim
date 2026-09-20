/**
 * ============================================================================
 * /auth/<provider>/start and /auth/<provider>/callback
 * ============================================================================
 *
 * The two HTTP endpoints of the OAuth flow. All of the reasoning about what is
 * safe lives in src/lib/oauth.ts and src/lib/oauth-account.ts; this file is
 * request handling and the sentences a person reads when something is refused.
 *
 * WHY START IS A GET LINK AND DISCONNECT IS A POST WITH CSRF, since the pair
 * looks inconsistent until the constraint is written down.
 *
 * A form POST that ends in a redirect to ANOTHER ORIGIN sits on a genuine
 * browser disagreement: whether `form-action` is re-checked against the
 * redirect target is not settled between engines, and this origin's CSP sets
 * `form-action 'self'`. A "Connect Google" button built as a form would
 * therefore work in some browsers and be blocked in others, with nothing in
 * our own code to point at. A link navigation is not governed by
 * `form-action` at all, so the question does not arise.
 *
 * That is only acceptable because the flow does not depend on the start being
 * unforgeable. The attack a CSRF token would stop here is an attacker causing
 * a signed-in producer to begin a link, and the end of that flow is the
 * producer authenticating as THEMSELVES at Google, which links their own
 * identity to their own account. The attack that actually matters - the
 * attacker getting THEIR provider identity onto the victim's account - has to
 * come back through the callback carrying a `state` that matches a `__Host-`
 * cookie they cannot set. The state check is the defence, and it is in place
 * whichever verb started the flow.
 *
 * Disconnect is a POST with a CSRF token because it is a same-origin state
 * change with no external redirect, so none of the above applies and the
 * ordinary rule does.
 */

import type { Env } from "../lib/env";
import { db } from "../lib/db";
import { html } from "../lib/html";
import { page, redirect } from "../lib/http";
import { layout } from "../ui/layout";
import { card, linkButton, section } from "../ui/components";
import {
  authorizeUrl,
  clearFlowCookieHeader,
  exchangeCode,
  newFlow,
  parseIdToken,
  pkceChallenge,
  providerCredentials,
  readFlowCookie,
  redirectUriFor,
  safeEqual,
  serializeFlowCookie,
  type FlowMode,
} from "../lib/oauth";
import { PROVIDERS, type ProviderId } from "../lib/providers";
import { linkProviderToUser, resolveSignIn } from "../lib/oauth-account";
import { createSession, getAuthContext, setSessionCookieHeader } from "../lib/auth";
import { bumpRateLimit } from "../lib/rate-limit";

/**
 * The callback's own IP bucket, separate from the magic link's.
 *
 * SEPARATE BECAUSE THE TWO COST DIFFERENT THINGS. The sign-in bucket exists to
 * stop a stranger sending mail from the business's inbox; this one exists to
 * stop an unauthenticated endpoint doing a database round trip and an outbound
 * HTTPS request per hit. Sharing one bucket would mean a burst of failed
 * callbacks could exhaust the allowance that protects the mailbox, which is
 * the more valuable of the two.
 *
 * Twenty in ten minutes is deliberately loose: a person retrying a flow that
 * keeps failing is the normal case here, and they should hit a clear refusal
 * page rather than a rate limit that looks like a second, different fault.
 */
const CALLBACK_WINDOW_SECONDS = 600;
const CALLBACK_MAX = 20;

function callbackIpKey(request: Request): string {
  const ip = request.headers.get("CF-Connecting-IP")?.trim();
  return "oauth-callback-ip:" + (ip || "unknown");
}

/* ---------------------------------------------------------------------- *
 * Start
 * ---------------------------------------------------------------------- */

export async function oauthStart(
  request: Request,
  env: Env,
  providerId: ProviderId,
  mode: FlowMode,
): Promise<Response> {
  const provider = PROVIDERS[providerId];
  const credentials = providerCredentials(env, provider);

  // NOT CONFIGURED IS A 404, NOT A 503, and the difference is deliberate. An
  // unconfigured provider renders no button anywhere on this origin, so the
  // only way to reach this line is by typing the URL. Answering 404 says the
  // truthful thing - there is no such sign-in method here - where a 503 would
  // advertise that one is half-built and invite a retry.
  if (!credentials) return notFound();

  let userId: string | undefined;
  if (mode === "link") {
    const auth = await getAuthContext(request, env);
    // Linking is an action on an existing account, so it requires one. Sent to
    // sign-in rather than refused, because a producer whose session simply
    // expired while reading the page is the overwhelmingly likely case.
    if (!auth) return redirect("/sign-in");
    userId = auth.id;
  }

  const flow = newFlow(providerId, mode, userId);
  const challenge = await pkceChallenge(flow.verifier);
  const target = authorizeUrl(provider, credentials.clientId, redirectUriFor(request, providerId), flow, challenge);

  return redirect(target, { setCookie: serializeFlowCookie(flow) });
}

/* ---------------------------------------------------------------------- *
 * Callback
 * ---------------------------------------------------------------------- */

export async function oauthCallback(request: Request, env: Env, providerId: ProviderId): Promise<Response> {
  const provider = PROVIDERS[providerId];
  const url = new URL(request.url);
  const flow = readFlowCookie(request);

  // EVERY EXIT FROM HERE CLEARS THE FLOW COOKIE. It has served its single round
  // trip by the time any of these branches is reached, and a stale one left
  // behind is a cookie whose state would be checked against a later, unrelated
  // callback. Failing to clear it is not exploitable, but it turns one
  // confusing retry into two.
  const clear = clearFlowCookieHeader();

  if (!flow || flow.provider !== providerId) return incomplete(provider.label, clear);

  // The provider itself refused or the person pressed cancel. `error` is part
  // of the OAuth response and is not an exceptional case: it is what "no"
  // looks like, so it gets its own page rather than the generic failure.
  if (url.searchParams.get("error")) return declined(provider.label, flow.mode, clear);

  const state = url.searchParams.get("state");
  if (!state || !safeEqual(state, flow.state)) return incomplete(provider.label, clear);

  const code = url.searchParams.get("code");
  if (!code) return incomplete(provider.label, clear);

  const credentials = providerCredentials(env, provider);
  if (!credentials) return notFound(clear);

  const sql = db(env);
  if (!sql) return unavailable(clear);

  const limit = await bumpRateLimit(sql, {
    key: callbackIpKey(request),
    windowSeconds: CALLBACK_WINDOW_SECONDS,
    limit: CALLBACK_MAX,
  });
  // `unavailable` from the limiter means the RateLimit table could not be read.
  // Treated as a refusal rather than waved through, matching the fails-closed
  // choice the magic-link endpoint already makes for the same table.
  if (limit.kind === "limited" || limit.kind === "unavailable") return tooMany(clear);

  const exchanged = await exchangeCode(
    provider,
    credentials.clientId,
    credentials.clientSecret,
    redirectUriFor(request, providerId),
    code,
    flow.verifier,
  );
  if (!exchanged.ok) return incomplete(provider.label, clear);

  const parsed = parseIdToken(provider, exchanged.idToken, credentials.clientId, flow.nonce);
  if (!parsed.ok) return incomplete(provider.label, clear);

  const profile = provider.profileFrom(parsed.claims);
  if (!profile) return incomplete(provider.label, clear);

  /* -- Link mode --------------------------------------------------------- */

  if (flow.mode === "link") {
    const auth = await getAuthContext(request, env);
    if (!auth) return redirect("/sign-in", { setCookie: clear });
    // THE SESSION CHANGED MID-FLOW. See OAuthFlow.userId: without this check
    // the identity would attach to whoever is signed in at the END of the
    // flow, which is a silent mis-link rather than a visible error.
    if (flow.userId !== auth.id) return sessionChanged(clear);

    const outcome = await linkProviderToUser(sql, auth, provider, profile);
    return redirect("/console/accounts?result=" + outcome.kind, { setCookie: clear });
  }

  /* -- Sign-in mode ------------------------------------------------------ */

  const outcome = await resolveSignIn(sql, provider, profile);
  if (outcome.kind === "refused") return refusedPage(provider.label, outcome.reason, clear);

  const session = await createSession(sql, outcome.user.id);
  return redirect("/console", {
    setCookie: [setSessionCookieHeader(session.token, session.expires), clear],
  });
}

/* ---------------------------------------------------------------------- *
 * The pages
 * ---------------------------------------------------------------------- *
 * Full pages rather than a query parameter on /sign-in, for the same reason
 * routes/sign-in.ts renders its own refusals: the only thing that ever reaches
 * one of these is a person who pressed a button one screen ago, and the answer
 * they need is a paragraph, not a badge.
 *
 * NONE OF THEM ARE STYLED AS ERRORS. Every refusal below is this origin's
 * policy working correctly, not a fault the reader caused or that we should
 * apologise for. Treating a deliberate rule as a red alert teaches people that
 * the rule is a bug, and the next thing they ask is how to get around it.
 */

function refusalPage(opts: {
  title: string;
  heading: string;
  body: ReturnType<typeof html>;
  status?: number;
  clearCookie?: string;
}): Response {
  return page(
    layout({
      title: opts.title,
      heading: opts.heading,
      standfirst: html`For fragrance producers listing on Counterscent.`,
      body: opts.body,
    }),
    opts.status ?? 200,
    opts.clearCookie ? { headers: { "Set-Cookie": opts.clearCookie } } : {},
  );
}

/** The two-step every refusal below eventually points at. Written once so the
 *  instructions cannot drift apart between pages. */
const CONNECT_STEPS = html`
  <ol class="plain-list">
    <li>Sign in with an email link, the way you normally do.</li>
    <li>Open <strong>How you sign in</strong> from your account panel.</li>
    <li>Connect the account there. After that it works from the sign-in page.</li>
  </ol>
`;

function signInAgain(): ReturnType<typeof html> {
  return html`<div class="btn-row">${linkButton("/sign-in", "Sign in with an email link")}</div>`;
}

function notFound(clearCookie?: string): Response {
  return refusalPage({
    title: "Not found",
    heading: "There is no such sign-in method here",
    status: 404,
    clearCookie,
    body: section({
      heading: "Nothing to see",
      body: html`<p>
        This origin offers an email link, and whichever other sign-in methods are switched on. This one is
        not among them. <a href="/sign-in">Go to the sign-in page</a> to see what is.
      </p>`,
    }),
  });
}

function unavailable(clearCookie?: string): Response {
  return refusalPage({
    title: "Temporarily unavailable",
    heading: "The account system is not reachable right now",
    status: 503,
    clearCookie,
    body: section({
      heading: "Nothing was saved",
      body: html`
        <p>
          The database this console reads is not answering, so we could not finish signing you in. Nothing
          was created, changed or connected, and nothing about your account has been altered.
        </p>
        <p>Try again in a few minutes. If it keeps happening, write to
          <a href="mailto:contact@counterscent.com">contact@counterscent.com</a>.</p>
      `,
    }),
  });
}

function tooMany(clearCookie?: string): Response {
  return refusalPage({
    title: "Too many attempts",
    heading: "Too many sign-in attempts from this connection",
    status: 429,
    clearCookie,
    body: section({
      heading: "Wait a few minutes",
      body: html`
        <p>
          This connection has tried to finish a sign-in ${CALLBACK_MAX} times in the last
          ${CALLBACK_WINDOW_SECONDS / 60} minutes. Nothing was saved for this one, and nothing about your
          account has changed.
        </p>
        <p>The email link is unaffected and works now: ${""}<a href="/sign-in">request one</a>.</p>
      `,
    }),
  });
}

function incomplete(providerLabel: string, clearCookie?: string): Response {
  return refusalPage({
    title: "Sign-in did not complete",
    heading: "That sign-in did not complete",
    clearCookie,
    body: html`
      ${section({
        heading: "Nothing was saved",
        body: html`
          <p>
            The round trip to ${providerLabel} did not come back in a state we could verify, so it was
            stopped. Nothing was created, connected or changed.
          </p>
          <p>
            This is usually harmless: the commonest causes are leaving the ${providerLabel} screen open for
            more than ten minutes, pressing the back button partway through, or starting the sign-in in one
            tab and finishing it in another. Starting again normally works.
          </p>
          ${signInAgain()}
        `,
      })}
    `,
  });
}

function declined(providerLabel: string, mode: FlowMode, clearCookie?: string): Response {
  return refusalPage({
    title: "Cancelled",
    heading: "That was cancelled at " + providerLabel,
    clearCookie,
    body: section({
      heading: "Nothing was saved",
      body: html`
        <p>
          ${providerLabel} did not give us an answer, which is what happens when the request is declined or
          the window is closed. Nothing was ${mode === "link" ? "connected" : "created or changed"}.
        </p>
        ${mode === "link"
          ? html`<div class="btn-row">${linkButton("/console/accounts", "Back to how you sign in")}</div>`
          : signInAgain()}
      `,
    }),
  });
}

function sessionChanged(clearCookie?: string): Response {
  return refusalPage({
    title: "Session changed",
    heading: "You are not signed in as the same account any more",
    clearCookie,
    body: section({
      heading: "Nothing was connected",
      body: html`
        <p>
          This connection was started by one account and finished while a different one was signed in, so it
          was stopped rather than guessed at. Nothing was connected to either account.
        </p>
        <p>
          That normally means the session expired while the provider's screen was open, or a second tab
          signed in as somebody else. Open
          <a href="/console/accounts">How you sign in</a> again and start it from there.
        </p>
      `,
    }),
  });
}

/**
 * THE FOUR REFUSALS THAT ARE POLICY RATHER THAN FAILURE.
 *
 * Each says what happened, why the rule exists, and the exact way forward. The
 * "why" is not decoration: a person told only "you cannot do that" assumes a
 * bug and tries again, and the commonest of these refusals - email-taken - is
 * one a legitimate producer will hit on their very first attempt.
 */
function refusedPage(
  providerLabel: string,
  reason: "provider-cannot-create" | "email-unverified" | "email-missing" | "email-taken",
  clearCookie?: string,
): Response {
  if (reason === "email-taken") {
    return refusalPage({
      title: "Account already exists",
      heading: "That address already has an account here",
      clearCookie,
      body: html`
        ${card(html`
          <h3>Connect ${providerLabel} from inside your account, not from the sign-in page</h3>
          <p>
            An account already exists for the address ${providerLabel} gave us, and it is not connected to
            ${providerLabel} yet. We never join the two from this page, even when the address matches
            exactly.
          </p>
          ${CONNECT_STEPS} ${signInAgain()}
        `)}
        ${section({
          heading: "Why it works this way",
          body: html`
            <p>
              Letting a matching address sign you straight in would mean anyone who could get
              ${providerLabel} to assert your address would inherit your account and everything it controls.
              Requiring you to be signed in first proves the connection is being made by the person who
              already holds the account, which is the one thing an address by itself cannot prove.
            </p>
            <p>
              It costs one extra step, once. After that ${providerLabel} signs you in directly, and your
              email link keeps working alongside it.
            </p>
          `,
        })}
      `,
    });
  }

  if (reason === "provider-cannot-create") {
    return refusalPage({
      title: "Cannot create an account",
      heading: providerLabel + " can sign you in, but cannot create an account",
      clearCookie,
      body: html`
        ${card(html`
          <h3>Create the account first, then connect ${providerLabel}</h3>
          <p>
            There is no account here yet for the address ${providerLabel} gave us, and ${providerLabel} is
            not a method we allow to open one.
          </p>
          ${CONNECT_STEPS} ${signInAgain()}
        `)}
        ${section({
          heading: "Why it works this way",
          body: html`
            <p>
              ${providerLabel} does not tell us whether it has confirmed that the address belongs to the
              person signing in. Its own documentation says the address it sends can be wrong and can
              change, and asks that it not be used to identify anyone. We take that at its word, so it is
              allowed to recognise an account you have already connected it to, and not to create one.
            </p>
            <p>
              An email link proves the address by sending something to it. That is why the account starts
              there.
            </p>
          `,
        })}
      `,
    });
  }

  if (reason === "email-unverified") {
    return refusalPage({
      title: "Address not confirmed",
      heading: providerLabel + " did not confirm that address",
      clearCookie,
      body: html`
        ${card(html`
          <h3>Confirm it with ${providerLabel}, or use an email link</h3>
          <p>
            ${providerLabel} signed you in but told us the address on the account has not been verified, so
            we did not create an account from it.
          </p>
          <p>
            Either confirm the address in your ${providerLabel} account settings and try again, or sign in
            with an email link, which proves it by sending to it.
          </p>
          ${signInAgain()}
        `)}
      `,
    });
  }

  return refusalPage({
    title: "No address",
    heading: providerLabel + " sent no email address",
    clearCookie,
    body: html`
      ${card(html`
        <h3>We need an address to create an account</h3>
        <p>
          ${providerLabel} completed the sign-in but sent no email address with it, usually because the
          permission covering it was not granted. An account here is identified by its address, so there was
          nothing to create one from.
        </p>
        <p>Sign in with an email link instead, then connect ${providerLabel} from inside your account.</p>
        ${signInAgain()}
      `)}
    `,
  });
}
