import { html } from "../lib/html";
import { page, redirect } from "../lib/http";
import { CATALOGUE, layout } from "../ui/layout";
import {
  button,
  card,
  ENVELOPE_GLYPH,
  field,
  linkButton,
  notShipped,
  PROVIDER_MARKS,
  section,
} from "../ui/components";
import { configuredProviders } from "../lib/providers";
import type { Env } from "../lib/env";
import { db } from "../lib/db";
import {
  createVerificationToken,
  deleteVerificationToken,
  hasActiveVerificationToken,
  isPlausibleEmail,
  normalizeEmail,
} from "../lib/auth";
import { mailConfigured, sendMagicLink } from "../lib/mailer";
import {
  bumpRateLimit,
  SIGN_IN_GLOBAL_KEY,
  SIGN_IN_GLOBAL_MAX_SENDS,
  SIGN_IN_GLOBAL_WINDOW_SECONDS,
  SIGN_IN_IP_MAX_REQUESTS,
  SIGN_IN_IP_WINDOW_SECONDS,
  signInIpKey,
  sweepRateLimits,
  type RateLimitVerdict,
} from "../lib/rate-limit";

/**
 * "/sign-in" - real, as of step 5 (2026-09-16), gated on two secrets rather
 * than on nothing.
 *
 * WHAT CHANGED FROM THE PRE-STEP-5 VERSION. That version had three
 * independent layers making the form impossible to submit: `disabled` on
 * every control, a `<fieldset disabled>` around them, and no `<form>`
 * element at all (plus `form-action 'none'` in the CSP). This is the edit
 * that version's own comment predicted: "a later edit that makes one
 * control live by accident." It is not by accident - it is this file, on
 * purpose, once there was a real account system to submit to. The `<form>`
 * now exists, `form-action` is 'self' for this page only (src/lib/http.ts),
 * and the fields are live.
 *
 * WHAT CHANGED AGAIN, LATER THE SAME DAY: POST /sign-in is rate limited. It
 * shipped without any limit at all, which on an unauthenticated endpoint that
 * mails whatever address is typed into it is not a tuning gap - it is a spam
 * relay pointed at contact@counterscent.com, the mailbox customers actually
 * write to. Three limits now sit in front of the send, each with its reasoning
 * at the point it is applied in signInSubmit() below: one live token per
 * address, five requests per ten minutes per IP, one hundred sends a day
 * across the origin. src/lib/rate-limit.ts holds the storage decision.
 *
 * WHAT DID NOT CHANGE: the honesty rule the old version was built around.
 * `notShipped()` is still the pattern for "this does not work and says so" -
 * it is just conditional now instead of unconditional, driven by whether
 * DATABASE_URL and the Hostinger mail secrets are actually set on this
 * Worker at request time (checked below, not assumed). The brief for this
 * step was explicit that the mail secret might not be set yet when this
 * shipped - that is an expected state, not a bug, and this page has to say
 * so plainly rather than show a form that silently discards what someone
 * typed into it.
 */

type SignInState =
  | { kind: "form" }
  | { kind: "sent"; email: string }
  | { kind: "error"; message: string }
  | { kind: "not-configured"; reason: string };

function readState(url: URL): SignInState {
  const sent = url.searchParams.get("sent");
  if (sent) return { kind: "sent", email: sent };
  const error = url.searchParams.get("error");
  if (error === "invalid-email") {
    return { kind: "error", message: "That does not look like a work email. Check it and try again." };
  }
  if (error === "send-failed") {
    return {
      kind: "error",
      message:
        "The link could not be sent just now - the mail server did not accept it. Nothing was signed in; try again in a minute.",
    };
  }
  return { kind: "form" };
}

export function signIn(request: Request, env: Env) {
  const url = new URL(request.url);
  const state = readState(url);
  const configured = Boolean(env.DATABASE_URL) && mailConfigured(env);
  // GATED ON THE DATABASE BUT NOT ON MAIL, which is the honest dependency
  // rather than the convenient one. Signing in with a provider stores a
  // Session row, so without DATABASE_URL it can only ever end in a 503; with
  // no mail secrets it works perfectly. Reusing `configured` above would have
  // hidden these buttons whenever Hostinger was the broken half, which is the
  // exact failure a second way in exists to survive.
  const providers = env.DATABASE_URL ? configuredProviders(env) : [];

  const notConfiguredReason = !env.DATABASE_URL
    ? html`There is no database connection configured on this Worker (the <code>DATABASE_URL</code> secret
        is not set), so a token could not be stored even if the mail could be sent.`
    : html`There is no mail sender configured on this Worker (the Hostinger Email API secrets are not
        set), so a link could not be sent even though the account system itself is connected. This is a
        known, expected gap while that secret is being set up - not a fabricated one.`;

  // NO section() AROUND THE CARD, AND NO HEADING OF ITS OWN. The layout
  // already renders an <h1> saying "Sign in", so a section here repeated the
  // same word as an <h2> directly beneath it, and its standfirst pushed the
  // card 406px down a 732px screen. Both measured in a browser rather than
  // adjusted by eye. The lede it used to carry became the page standfirst,
  // where it says the same thing once.
  // TWO COLUMNS ABOVE 60rem, ONE BELOW. See .auth-layout in console.css
  // for why the leftover desktop width is filled rather than centred away.
  const body = html`
    <div class="auth-layout">
    <div class="stack">
        ${
          !configured
            ? notShipped({
                what: "This does not work right now, and typing in it would not be saved",
                reason: notConfiguredReason,
              })
            : state.kind === "sent"
              ? html`<div class="notice">
                  <p class="notice-title">Check ${state.email}</p>
                  <p>
                    A link is on its way if that address can receive mail. It works once and expires in 15
                    minutes. Nothing else happened yet - no account exists until the link is used.
                  </p>
                  ${
                    // SAID HERE, BEFORE THE LOCKOUT, RATHER THAN ONLY ON THE 429
                    // AFTER IT. While a link minted in the last 15 minutes is
                    // still alive this form deliberately sends no second one and
                    // returns this exact page, byte for byte, so that it cannot
                    // be used to ask "does this address have a live token" - see
                    // the note above hasActiveVerificationToken(). That
                    // anti-enumeration property is worth keeping and this
                    // sentence does not weaken it: it is unconditionally true on
                    // both branches and shown to everyone identically, so it
                    // distinguishes nothing.
                    //
                    // What it fixes is the cost of the silence. A reader who
                    // sees no mail presses the button again, which is the one
                    // response that cannot help: the repeat sends nothing AND
                    // spends one of five per-IP attempts, because that counter
                    // is bumped before the body is even read. The founder hit
                    // exactly this on 2026-09-18 - five presses, one email, and
                    // a lockout - and the advice that would have prevented it
                    // was already written on the 429 page they only reached
                    // afterwards.
                    ""
                  }
                  <p class="muted">
                    If you asked more than once, only the first request sent anything: while a link is
                    still valid we do not send a second, and the first one still works. Check your spam
                    folder before asking again - repeat requests count against a limit of five in ten
                    minutes even when no mail goes out.
                  </p>
                </div>`
              : ""
        }
        ${
          state.kind === "error"
            ? html`<div class="notice"><p class="notice-title">${state.message}</p></div>`
            : ""
        }

        ${card(
          html`
            ${
              // GOOGLE FIRST IN READING ORDER, EMAIL FIRST IN VISUAL WEIGHT.
              // Those are not in conflict and the split is the whole layout
              // decision: Google is one click where email is a round trip
              // through an inbox, so it reads first; but the email route keeps
              // the primary green button, so weight still says which one is
              // the house method and which one is borrowed.
              //
              // RENDERED EVEN WHEN THE MAIL SECRETS ARE MISSING. `configured`
              // is about Hostinger and this button depends on it for nothing.
              // The day mail breaks is precisely the day a second way in earns
              // its keep, so gating it on the first one would throw the benefit
              // away at the only moment it mattered.
              //
              // The mark comes from PROVIDER_MARKS by id rather than being
              // passed directly, so a provider added later cannot inherit
              // Google's logo. See that constant.
              providers.length > 0
                ? html`<div class="auth-providers">
                    ${providers.map((p) =>
                      linkButton(`/auth/${p.id}/start`, `Continue with ${p.label}`, {
                        variant: "google",
                        icon: PROVIDER_MARKS[p.id],
                      }),
                    )}
                  </div>`
                : ""
            }
            ${
              // ONLY WHEN THERE ARE GENUINELY TWO ROUTES. A rule reading
              // "or" above nothing is a promise the card does not keep.
              providers.length > 0 && configured
                ? html`<p class="auth-or"><span>or</span></p>`
                : ""
            }
            ${
              configured
                ? html`<form method="post" action="/sign-in" class="auth-form">
                    ${field({
                      name: "email",
                      label: "Work email",
                      type: "email",
                      placeholder: "you@yourfragrancehouse.com",
                      required: true,
                      // NOT autofocused any more. With Google sitting above it,
                      // stealing focus into the second option on load both
                      // contradicts the reading order and scrolls a small screen
                      // past the first one.
                      autoFocus: false,
                      autoComplete: "email",
                      hint: html`The address at the domain you sell from.`,
                    })}
                    ${button("Email me a sign-in link", { icon: ENVELOPE_GLYPH })}
                  </form>`
                : html`<p class="field-hint">
                    Email sign-in is disabled: the mail secrets are not set on this Worker. The button
                    above is unaffected and works.
                  </p>`
            }
            ${
              // ONE LINE OF FINE PRINT, and it is the only one that survived.
              // Three longer notes moved into "What this actually does" below,
              // which existed already and is where a reader who wants the detail
              // is going anyway. The budget was set deliberately: this card has
              // to fit a 375px screen without scrolling past the submit button.
              configured
                ? html`<p class="auth-fine">
                    No password, ever. A link works once and expires in 15 minutes.
                  </p>`
                : ""
            }
          `,
          "auth-card",
        )}
    </div>

    <div class="auth-aside">
    ${section({
      heading: "What this actually does",
      body: html`
        <ul class="plain-list">
          <li>
            Sends a single-use link that expires in 15 minutes, to the address you typed. No password is
            ever set, so none can be reused, leaked or reset by someone else.
          </li>
          <li>
            Signs you into this origin only, for 30 days. The public catalogue stays cookieless and does
            not know who you are; that property belongs to the catalogue and is not a claim about this
            console, which necessarily knows who is signed in.
          </li>
          <li>
            Creates an account record if one does not exist for that address. It does <strong>not</strong>
            create a producer or attach you to one - that is a separate, editorial step, not something a
            sign-in click does on its own.
          </li>
          <li>
            Puts you in the console, which is real: your listings, submitting a fragrance, withdrawing
            one, and your plan. If no company is attached to your address yet, the first thing it offers
            is creating one.
          </li>
          <li>
            Is not the only way in. Once you are signed in you can connect Google under
            <strong>How you sign in</strong>, and use it next time. The email link keeps working
            whatever else you connect, which is why it can never be switched off.
          </li>
          <li>
            Is interchangeable with Google when the address is the same. If an account already exists
            for the address Google confirms, <strong>Continue with Google</strong> signs you into it
            and connects the two, once. Google saying it has confirmed an address is that mailbox
            vouching for you, which is what an email link proves by sending to it - the same proof by
            a shorter road. A provider that will not confirm an address is refused instead.
          </li>
        </ul>
      `,
    })}

    ${section({
      heading: "If you came here to compare fragrances",
      body: html`
        <p>
          This is the trade side. The comparison tool is on the public site:
          <a href="${CATALOGUE}/dupe-finder">the Dupe Finder</a>, and it needs no account and never will.
        </p>
      `,
    })}
    </div>
    </div>
  `;

  return page(
    layout({
      title: "Sign in",
      heading: "Sign in",
      status: configured
        ? undefined
        : {
            label: "Not fully connected",
            note: html`The sign-in mechanism exists; the secrets it needs to actually send mail are not
              both set on this Worker yet. See the notice below for which one.`,
          },
      standfirst: html`Google, or a one-time link by email. There is no password either way.`,
      body,
    }),
    200,
    { allowForms: configured },
  );
}

/* ------------------------------------------------------------------------ *
 * The refusals
 * ------------------------------------------------------------------------ *
 * Full pages rather than a bare string body, because the only thing that ever
 * reaches one of these is a person who just pressed a button on the page
 * before it. They are also the one place on this origin where a POST answers
 * with a rendering instead of the redirect-after-POST everything else uses:
 * there is no result to be bookmarked or refreshed here, only a reason.
 */

/** Seconds, said the way a person would say them. */
function humanDelay(seconds: number): string {
  if (seconds <= 90) return "a minute";
  const minutes = Math.ceil(seconds / 60);
  if (minutes < 90) return `${minutes} minutes`;
  return `${Math.ceil(minutes / 60)} hours`;
}

/** Over the per-IP burst limit. A 429 with Retry-After, never a silent drop -
 *  a request that vanishes teaches a person to press the button again, which
 *  is the opposite of what a limit is for. */
function tooManyRequests(retryAfterSeconds: number): Response {
  return page(
    layout({
      title: "Too many requests",
      heading: "Too many sign-in requests from this connection",
      body: section({
        heading: `Try again in ${humanDelay(retryAfterSeconds)}`,
        body: html`
          <p>
            This connection has asked for a sign-in link ${SIGN_IN_IP_MAX_REQUESTS} times in the last
            ${SIGN_IN_IP_WINDOW_SECONDS / 60} minutes, which is the limit. Nothing was sent for this
            last one and nothing was saved - there is nothing wrong with your address, your account or
            the link you may already have.
          </p>
          <p>
            If a link did arrive earlier, it is still good: they last 15 minutes and are not cancelled
            by asking again. Check the address you typed, including its spam folder, before requesting
            another.
          </p>
          <p>
            The limit exists because these emails are sent from
            <a href="mailto:contact@counterscent.com">contact@counterscent.com</a> - a real mailbox a
            person reads. Without a cap, this form is a way to send Counterscent sign-in mail to people
            who never asked for it, at the cost of the address our customers write to.
          </p>
        `,
      }),
    }),
    429,
    // Seconds, per the HTTP spec's own form for this header - the sentence
    // above is for the human, this is for anything automated that retries.
    { headers: { "Retry-After": String(Math.max(1, retryAfterSeconds)) } },
  );
}

/** The origin-wide daily send cap is spent. NOT the "check your inbox" page:
 *  nothing was sent, so saying otherwise would be exactly the fake success
 *  this project's notShipped() ethos exists to prevent. */
function sendingPaused(retryAfterSeconds: number): Response {
  return page(
    layout({
      title: "Sign-in paused",
      heading: "Sign-in links are paused right now",
      body: section({
        heading: "Nothing was sent, and nothing was saved",
        body: html`
          <p>
            This origin has reached the maximum number of sign-in emails it will send in a day
            (${SIGN_IN_GLOBAL_MAX_SENDS}), so it stopped sending rather than carry on. That is a
            deliberate stop, not a fault: the mail comes from a shared mailbox with its own provider
            limits, and a mailbox suspended for volume would take down both sign-in and the address
            customers write to, for as long as the provider took to restore it.
          </p>
          <p>
            It clears in about ${humanDelay(retryAfterSeconds)}. If this is blocking you, write to
            <a href="mailto:contact@counterscent.com">contact@counterscent.com</a> - that inbox is read
            by a person and receiving mail is not affected by this limit.
          </p>
        `,
      }),
    }),
    503,
    { headers: { "Retry-After": String(Math.max(1, retryAfterSeconds)) } },
  );
}

/** The limiter itself could not answer. Fail closed: no limit means no send.
 *  See src/lib/rate-limit.ts for why this is the chosen direction. */
function limiterUnavailable(reason: "not-migrated" | "query-failed"): Response {
  return page(
    layout({
      title: "Sign-in unavailable",
      heading: "Sign-in cannot run right now",
      body: section({
        heading: "Nothing was sent, and nothing was saved",
        body: html`
          ${notShipped({
            what: "The limit that protects this form could not be checked, so no link was sent",
            reason:
              reason === "not-migrated"
                ? html`The <code>RateLimit</code> table this endpoint counts against does not exist in
                    the database yet - the migration that adds it has not been applied. Sign-in refuses
                    to send mail with no working limit in front of it rather than sending unthrottled,
                    so this page is that refusal working, not a crash.`
                : html`The database did not answer the check. Nothing was written and no mail was
                    sent; this is usually momentary.`,
          })}
          <p>
            Try again in a few minutes. If it persists, write to
            <a href="mailto:contact@counterscent.com">contact@counterscent.com</a>.
          </p>
        `,
      }),
    }),
    503,
  );
}

/** Both limits answer with the same two failure shapes; this keeps the route
 *  from repeating the mapping and quietly letting them drift apart. */
function refusal(verdict: Extract<RateLimitVerdict, { kind: "limited" | "unavailable" }>, over: "ip" | "global") {
  if (verdict.kind === "unavailable") return limiterUnavailable(verdict.reason);
  return over === "ip" ? tooManyRequests(verdict.retryAfterSeconds) : sendingPaused(verdict.retryAfterSeconds);
}

export async function signInSubmit(request: Request, env: Env): Promise<Response> {
  const sql = db(env);
  if (!sql || !mailConfigured(env)) {
    // Nothing was typed into a form that could not accept it - see signIn()
    // above, which would have shown notShipped() instead of a live form in
    // this state. A POST arriving anyway (a stale tab, a replayed request)
    // gets the same honest answer rather than a generic error.
    return redirect("/sign-in");
  }

  // LIMIT 1 OF 3: the per-IP burst limit, first, before the body is even
  // read. A request refused here costs one database round trip and nothing
  // else - no form parsing, no token, no call to the mail API. It counts every
  // POST, including ones carrying a malformed address, because "type garbage
  // to get a free attempt" would be a hole rather than a nicety.
  const ip = await bumpRateLimit(sql, {
    key: signInIpKey(request),
    windowSeconds: SIGN_IN_IP_WINDOW_SECONDS,
    limit: SIGN_IN_IP_MAX_REQUESTS,
  });
  if (ip.kind !== "allowed") return refusal(ip, "ip");

  // Housekeeping, on the far side of that check so flood traffic never pays
  // for it. Safe to call here specifically because the check above has just
  // proven the table exists; it is also written never to throw.
  await sweepRateLimits(sql);

  // PARSED IN A try/catch BECAUSE formData() THROWS ON A BODY IT CANNOT READ.
  // Unguarded, this line answered a POST with an absent or unparseable body
  // with a generic 500 - reproduced twice against the live origin on
  // 2026-09-16, the day this shipped. That is precisely the fake-failure shape
  // notShipped() and the honest-503 handling above exist to prevent, and it is
  // reachable by anyone, unauthenticated, with a one-line curl.
  //
  // A browser submitting the form on the other side of this route cannot
  // produce it; only a non-browser client can. So it is treated as exactly
  // what it is - a request carrying no usable address - and given the SAME
  // answer as a malformed address below, deliberately rather than a distinct
  // status. Two shapes here would be two things to keep in step for no gain,
  // and the rate-limit slot has already been spent either way (the bump above
  // runs before the body is read, so "send garbage to get a free attempt" is
  // not a hole this opens).
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return redirect("/sign-in?error=invalid-email");
  }

  const rawEmail = String(form.get("email") ?? "");
  const email = normalizeEmail(rawEmail);

  if (!isPlausibleEmail(email)) {
    return redirect("/sign-in?error=invalid-email");
  }

  // LIMIT 2 OF 3: one live token per address. An address with an unexpired
  // token gets no second email, which caps this origin at one sign-in mail
  // per address per 15 minutes without needing any state beyond the token row
  // it already writes. (This call also purges expired rows - see
  // hasActiveVerificationToken.)
  //
  // THE RESPONSE IS THE SUCCESS RESPONSE, BYTE FOR BYTE. Not politeness: a
  // refusal that looked different from a send would turn this form into an
  // oracle for "does this address have a live token here", which is a step
  // towards "does this address have an account". The existing copy on the
  // other side of this redirect already does the careful thing - "a link is
  // on its way IF that address can receive mail" - and it stays true here,
  // because a link genuinely is on its way: one was sent within the last 15
  // minutes and still works.
  //
  // The timing differs (this returns without calling the mail API) and that
  // is accepted rather than overlooked. What the difference reveals is "a
  // link was requested for this address recently", which is not account
  // existence - tokens are minted for any address at all, subscriber or
  // stranger, and no User row exists until a link is actually followed.
  if (await hasActiveVerificationToken(sql, email)) {
    return redirect(`/sign-in?sent=${encodeURIComponent(email)}`);
  }

  // LIMIT 3 OF 3: the origin-wide daily send cap, bumped here rather than at
  // the top of the handler so it counts SENDS and not requests. Anything
  // refused above never reaches this line, so an attacker cannot burn the
  // day's budget with requests that were never going to send anything.
  const globalSends = await bumpRateLimit(sql, {
    key: SIGN_IN_GLOBAL_KEY,
    windowSeconds: SIGN_IN_GLOBAL_WINDOW_SECONDS,
    limit: SIGN_IN_GLOBAL_MAX_SENDS,
  });
  if (globalSends.kind !== "allowed") return refusal(globalSends, "global");

  const rawToken = await createVerificationToken(sql, email);
  const verifyUrl = new URL("/verify", new URL(request.url).origin);
  verifyUrl.searchParams.set("token", rawToken);

  const result = await sendMagicLink(env, email, verifyUrl.toString());
  if (!result.sent) {
    // THE TOKEN ROW IS DELETED, and this is a reversal of what this comment
    // said before the throttle above existed. It used to argue the row could
    // be left in place because "a producer who retries after a transient send
    // failure gets a fresh token on the next attempt" - true then, false the
    // moment limit 2 started refusing a second mail while a live token
    // exists. Left alone, a single transient send failure would lock a real
    // producer out for the full 15 minutes, with the page telling them a link
    // was on its way that will never arrive.
    //
    // Deleting it destroys nothing: the raw token never left this request, so
    // the row it points at is already unusable by anybody. deleteVerification-
    // Token keys on that exact token rather than on the address, so it cannot
    // take a different request's live token with it.
    //
    // The global counter above is NOT decremented. An attempted send is what
    // the mail provider sees, and a failure that costs nothing is a failure
    // worth retrying in a loop.
    await deleteVerificationToken(sql, rawToken);
    return redirect("/sign-in?error=send-failed");
  }

  return redirect(`/sign-in?sent=${encodeURIComponent(email)}`);
}
