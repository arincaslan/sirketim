import { html, type Html } from "../lib/html";
import { page } from "../lib/http";
import { layout } from "../ui/layout";
import { card, linkButton, notShipped, section } from "../ui/components";
import type { Env } from "../lib/env";
import { db } from "../lib/db";
import { getAuthContext, type AuthUser, type Sql } from "../lib/auth";
import { loadProducerConsole, type ProducerConsoleData } from "../lib/producer";
import { isAdminEmail } from "../lib/admin";

/**
 * The gate both `/console/submit` and `/console/withdraw` sit behind, in one
 * place so the two cannot drift.
 *
 * FOUR ANSWERS, NOT TWO, and each is a real state rather than an error branch:
 *
 *   signed out            Anyone who has not clicked a link in an email.
 *   no producer attached  EVERY account at the moment it is created.
 *                         findOrCreateUser() deliberately never creates a
 *                         Producer row, so this is the normal first state and
 *                         not an edge case. Since 2026-09-19 it is also no
 *                         longer a terminal one: the screen carries a single
 *                         action to /console/company, which creates the record
 *                         and sends the producer straight on to the form they
 *                         were trying to reach.
 *   record unreadable     The database did not answer.
 *   attached              The workspace.
 *
 * EACH REFUSAL IS ITS OWN SCREEN, NOT A REDIRECT TO /console. A redirect would
 * land somebody on a page that answers a different question and lose the
 * explanation of why they could not do the thing they clicked. It would also
 * make "you are not signed in" and "you have nothing to withdraw" arrive as the
 * same event.
 *
 * NONE OF THESE PAGES CARRIES A FORM, deliberately, which is why none of them
 * asks for the `allowForms` grant. A sign-out control belongs on /console,
 * where the account card is; repeating it on every refusal would widen the CSP
 * on pages that have nothing to submit.
 */

export type ProducerGate =
  | {
      kind: "ok";
      auth: AuthUser;
      sql: Sql;
      data: ProducerConsoleData;
      /**
       * Whether this producer is also an administrator of the deployment.
       *
       * Computed here so the producer routes cannot disagree about it, and so
       * none of them has to carry `env` into a render function just to ask.
       * It is read from the ADMIN_EMAILS secret, never from the producer
       * record - see the `uncapped` note on quotaGate for why that direction
       * matters.
       *
       * IT GRANTS NOTHING ON ITS OWN. Every administrative ROUTE still calls
       * requireAdmin() for itself. What this flag decides is what the producer
       * console shows an admin and whether the listing cap is applied to them.
       */
      isAdmin: boolean;
    }
  | { kind: "refused"; response: Response };

/** What the reader was trying to do, in a verb phrase that fits after "to".
 *  Used only in copy, so the two routes explain themselves rather than sharing
 *  one vague sentence. */
export interface GateCopy {
  /** "submit a fragrance", "withdraw a listing". */
  verb: string;
  /** The <title> for the refusal pages. */
  title: string;
}

export async function requireProducer(
  request: Request,
  env: Env,
  copy: GateCopy,
): Promise<ProducerGate> {
  const auth = await getAuthContext(request, env);
  if (!auth) return { kind: "refused", response: page(signedOut(copy), 401) };

  if (!auth.producerId) {
    return { kind: "refused", response: page(noProducerAttached(auth, copy), 200) };
  }

  const sql = db(env);
  let data: ProducerConsoleData | null = null;
  try {
    // `sql` cannot be null here in practice - getAuthContext() returns null
    // without a database - but the type admits it, and a thrown TypeError would
    // render as a blank 500 to the one person able to report it.
    if (!sql) throw new Error("no database connection");
    data = await loadProducerConsole(sql, auth.producerId);
  } catch {
    return { kind: "refused", response: page(unreadable(auth, copy), 503) };
  }

  if (!data) return { kind: "refused", response: page(recordMissing(auth), 200) };

  return { kind: "ok", auth, sql: sql as Sql, data, isAdmin: isAdminEmail(auth.email, env) };
}

/* ---------------------------------------------------------------------- *
 * Refusing a write that got past the gate
 * ---------------------------------------------------------------------- */

/**
 * The producer is over the authenticated-write limit.
 *
 * A 429 with a Retry-After, never a silent drop: a request that vanishes
 * teaches a person to press the button again, which is the opposite of what a
 * limit is for. Same shape as the sign-in refusals, deliberately.
 */
export function writeLimited(copy: GateCopy, retryAfterSeconds: number): Response {
  const minutes = Math.max(1, Math.ceil(retryAfterSeconds / 60));
  return page(
    layout({
      title: copy.title,
      heading: "That is more writes than this account is allowed in an hour",
      status: {
        label: "Rate limited",
        tone: "outline",
        note: html`Nothing was saved. No listing changed state.`,
      },
      body: section({
        heading: `Try again in about ${minutes === 1 ? "a minute" : `${minutes} minutes`}`,
        body: html`
          <p>
            This account has submitted or withdrawn more times in the last hour than the console
            allows. The limit is there because these routes write to a shared database and a
            loop against them is the kind of thing that is much easier to stop than to undo.
          </p>
          <p>
            If you genuinely have that much to do at once, write to
            <a href="mailto:contact@counterscent.com">contact@counterscent.com</a> and we will
            take it in one go rather than one form at a time.
          </p>
          <p><a href="/console">Back to the console</a>.</p>
        `,
      }),
    }),
    429,
    { headers: { "Retry-After": String(Math.max(1, retryAfterSeconds)) } },
  );
}

/**
 * The limiter could not answer.
 *
 * FAIL CLOSED, LOUDLY, exactly as POST /sign-in does. Carrying on unthrottled
 * and logging something would quietly restore the gap the limit exists to
 * close, and the deploy would look fine.
 */
export function writeLimiterUnavailable(
  copy: GateCopy,
  reason: "not-migrated" | "query-failed",
): Response {
  return page(
    layout({
      title: copy.title,
      heading: "This cannot be saved right now",
      status: {
        label: "Write unavailable",
        tone: "outline",
        note: html`Nothing was saved and nothing changed state.`,
      },
      body: section({
        heading: "Nothing was written",
        body: html`
          <div class="stack">
            ${notShipped({
              what: "The limit that protects this route could not be checked, so the write was refused",
              reason:
                reason === "not-migrated"
                  ? html`The <code>RateLimit</code> table this route counts against is not in the
                      database. Writes are refused with no working limit in front of them rather
                      than run unthrottled, so this page is that refusal working, not a crash.`
                  : html`The database did not answer the check. Nothing was written; this is
                      usually momentary.`,
            })}
            <p>
              Try again in a few minutes. If it persists, write to
              <a href="mailto:contact@counterscent.com">contact@counterscent.com</a>.
            </p>
            <p><a href="/console">Back to the console</a>.</p>
          </div>
        `,
      }),
    }),
    503,
  );
}

/**
 * The form's CSRF token was missing or wrong.
 *
 * AN HONEST, READABLE REFUSAL, not a 500 and not a silent no-op. The overwhelmingly
 * likely cause is boring - a tab left open across a sign-out and a fresh
 * sign-in, so the page is carrying a token for a session that no longer
 * exists - and saying that is more useful than saying "forbidden". A real
 * forgery attempt reads the same page and learns nothing from it.
 */
export function csrfRefused(copy: GateCopy, retryHref: string): Response {
  return page(
    layout({
      title: copy.title,
      heading: "This form could not be accepted",
      status: {
        label: "Not accepted",
        tone: "outline",
        note: html`Nothing was saved and nothing changed state.`,
      },
      standfirst: html`The page this came from was not carrying a valid token for your current
        session.`,
      body: section({
        heading: "What this usually means",
        body: html`
          <div class="stack">
            <p>
              Almost always: the page had been open since before you last signed in or signed
              out, so it was still carrying a token for a session that has since ended. Loading
              the form again gives it a current one.
            </p>
            <p>
              The check exists because this route changes something on your record. A page on
              somebody else's site can make your browser send a request here; it cannot make it
              carry this token. Refusing a request without one is what stops that.
            </p>
            <p class="door-action">
              <a class="btn btn-primary" href="${retryHref}">Open the form again</a>
            </p>
            <p><a href="/console">Back to the console</a>.</p>
          </div>
        `,
      }),
    }),
    403,
  );
}

/* ---------------------------------------------------------------------- *
 * The refusals
 * ---------------------------------------------------------------------- */

function signedOut(copy: GateCopy): Html {
  return layout({
    title: copy.title,
    heading: `Sign in to ${copy.verb}`,
    status: {
      label: "Sign-in required",
      tone: "outline",
      note: html`This address belongs to a signed-in producer. Nothing is hidden from you here
        beyond your own listings.`,
    },
    standfirst: html`This is the part of the console that acts on your own record, so it needs
      to know whose record it is.`,
    body: html`
      <div class="grid-2">
        ${card(html`
          <h3>You already have an account</h3>
          <p class="muted">
            We email you a link. It works once, for fifteen minutes, and there is no password
            to lose or to be stolen from us.
          </p>
          <p class="door-action">
            <a class="btn btn-primary" href="/sign-in">Request a sign-in link</a>
          </p>
        `)}
        ${card(html`
          <h3>You do not</h3>
          <p class="muted">
            Request a link for your address anyway - signing in is what creates the account.
            You name your company on the next screen, and the free tier covers one listing.
          </p>
          <p class="door-action">
            <a class="btn btn-ghost" href="mailto:contact@counterscent.com"
              >Or ask us first</a
            >
          </p>
        `)}
      </div>
      ${section({
        heading: "What this page does once you are signed in",
        body: html`<p>
          <a href="/console">The console</a> explains the programme in full, including what
          every tier covers and what no tier buys. It is the same page for everyone who is not
          signed in, so you can read it first.
        </p>`,
      })}
    `,
  });
}

function noProducerAttached(auth: AuthUser, copy: GateCopy): Html {
  return layout({
    title: copy.title,
    heading: "One step first: your company",
    status: {
      label: "Almost there",
      tone: "outline",
      note: html`Nothing is billed, and this takes a minute.`,
    },
    standfirst: html`A listing belongs to a company rather than to an inbox, and this account
      does not have one yet. Set it up and you can ${copy.verb} straight away.`,
    body: html`
      <p>${linkButton("/console/company", "Set up your company")}</p>
      <p class="muted">
        You are signed in as <span class="wrap-anywhere">${auth.email}</span>. The free tier
        includes one listing, with no card and no trial clock. Everything you submit is read by
        a person before it reaches
        <a href="https://counterscent.com">counterscent.com</a>.
      </p>
    `,
  });
}

function unreadable(auth: AuthUser, copy: GateCopy): Html {
  return layout({
    title: copy.title,
    heading: "We could not read your record",
    status: {
      label: "Read failed",
      tone: "outline",
      note: html`This is our side, not yours. Your account and your listings are untouched.`,
    },
    standfirst: html`You are signed in as
      <span class="wrap-anywhere">${auth.email}</span>, and the query behind this screen did
      not come back.`,
    body: section({
      heading: "Nothing was written and nothing was lost",
      body: html`
        <div class="stack">
          ${notShipped({
            what: "The check that has to run before this page can do anything did not answer",
            reason: html`Every write here reads your producer record first, to know which plan
              you are on and how many listings count against it. That read failed, so nothing
              further ran. No listing changed state, and loading a page never changes one.`,
          })}
          <p>
            Reloading is worth one try. If it keeps happening, tell us at
            <a href="mailto:contact@counterscent.com">contact@counterscent.com</a> and say
            roughly when, which is enough for us to find it in the logs.
          </p>
          <p><a href="/console">Back to the console</a>.</p>
        </div>
      `,
    }),
  });
}

function recordMissing(auth: AuthUser): Html {
  return layout({
    title: "Producer console",
    heading: "This account points at a record we cannot find",
    status: {
      label: "Producer record missing",
      tone: "outline",
      note: html`An unusual state, and ours to fix rather than yours.`,
    },
    standfirst: html`You are signed in as
      <span class="wrap-anywhere">${auth.email}</span>, and the producer record this address is
      attached to did not come back from the database.`,
    body: section({
      heading: "What to do",
      body: html`
        <div class="stack">
          <p>
            Write to <a href="mailto:contact@counterscent.com">contact@counterscent.com</a> from
            this address and say you saw this. It is specific enough to find, and it is not
            something you can clear from your side.
          </p>
          <p class="muted">
            Listings are never deleted here, so this is not what a removed listing looks like. A
            removal is a change of state and the record stays.
          </p>
          <p><a href="/console">Back to the console</a>.</p>
        </div>
      `,
    }),
  });
}
