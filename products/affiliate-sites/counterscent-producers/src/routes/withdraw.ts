import { html } from "../lib/html";
import { page, redirect } from "../lib/http";
import { layout } from "../ui/layout";
import { button, card, csrfInput, emptyState, section, stateBadge } from "../ui/components";
import type { Env } from "../lib/env";
import { CSRF_FIELD, csrfToken, verifyCsrf } from "../lib/csrf";
import type { ListingRow } from "../lib/producer";
import {
  bumpRateLimit,
  PRODUCER_WRITE_MAX,
  PRODUCER_WRITE_WINDOW_SECONDS,
  producerWriteKey,
} from "../lib/rate-limit";
import { withdrawListing, type ActorContext } from "../lib/submission";
import {
  csrfRefused,
  requireProducer,
  writeLimited,
  writeLimiterUnavailable,
  type GateCopy,
} from "./producer-gate";

/**
 * ============================================================================
 * WITHDRAW - the producer-facing removal, which is NOT a delete.
 * ============================================================================
 *
 * The founder's word was "delete listings". This route deliberately does not
 * delete: it sets `publishState = WITHDRAWN_BY_PRODUCER` and keeps the row.
 * CONSOLE-PLAN.md section 4.1 settles why, and PRODUCER-TERMS section 10
 * states it to the producer as a term, so deleting here would break something
 * they agreed to. The short version is that a row delete destroys ClickEvent
 * history that may still pay inside a network's cookie window, destroys the
 * record of a listing pulled after a complaint, and hides the one pattern most
 * worth being able to see - withdrawal straight after a bad score.
 *
 * THE PAGE SAYS SO IN THOSE WORDS. A button labelled one thing that does
 * another is the shape this project treats as a fake success, and "delete"
 * that silently retains the row would be exactly that. The confirmation names
 * the `/go/` identifier that stops resolving, because that is the part a
 * producer can actually observe.
 *
 * WHY A CONFIRMATION SCREEN AND NOT A ONE-CLICK BUTTON. Withdrawal is not
 * reversible from this console - the unique constraint on
 * (producerId, referenceSlug) means resubmitting against the same original
 * collides with the withdrawn row, by design, so that withdraw-and-resubmit is
 * detectable rather than merely disapproved of. A verb a producer cannot undo
 * for themselves earns one screen.
 *
 * THE FREE TIER MAY USE THIS. Founder decision, 2026-09-16, which also settled
 * a contradiction between lib/plans.ts and PRODUCER-TERMS section 10 about
 * whether it could: it can, and because countsAgainstAllowance() excludes
 * withdrawn listings, doing so frees the slot. That is what makes the free
 * tier's single listing a choice a producer can revisit rather than one
 * irreversible shot.
 */

const COPY: GateCopy = { verb: "withdraw a listing", title: "Withdraw a listing" };

/* ======================================================================== *
 * GET - the confirmation
 * ======================================================================== */

export async function withdrawPage(request: Request, env: Env): Promise<Response> {
  const gate = await requireProducer(request, env, COPY);
  if (gate.kind === "refused") return gate.response;

  const id = new URL(request.url).searchParams.get("id");
  const listing = id ? gate.data.listings.find((l) => l.id === id) : undefined;

  // NOT FOUND AND NOT YOURS ARE THE SAME ANSWER. `gate.data.listings` holds
  // only this producer's rows, so a listing belonging to somebody else simply
  // is not in it - and answering "that is not yours" would confirm it exists.
  if (!listing) return page(notYours(gate.auth.email), 404);

  if (!withdrawable(listing)) return page(alreadyGone(gate.auth.email, listing), 409);

  const token = await csrfToken(request, "withdraw-listing");
  // A null token means no session cookie to bind against, which requireProducer
  // has already ruled out. Treated as a refusal rather than rendered as a form
  // that cannot submit.
  if (!token) return csrfRefused(COPY, "/console");

  return page(confirm(gate.auth.email, listing, token), 200, { allowForms: true });
}

/* ======================================================================== *
 * POST - the act
 * ======================================================================== */

export async function withdrawSubmit(request: Request, env: Env): Promise<Response> {
  const gate = await requireProducer(request, env, COPY);
  if (gate.kind === "refused") return gate.response;

  // Same try/catch as POST /sign-in and POST /console/submit: formData()
  // throws on a body it cannot read, and unguarded that is a generic 500.
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return csrfRefused(COPY, "/console");
  }

  // CSRF before the rate limiter, so a forged request cannot spend somebody
  // else's allowance.
  const token = form.get(CSRF_FIELD);
  if (!(await verifyCsrf(request, "withdraw-listing", typeof token === "string" ? token : null))) {
    return csrfRefused(COPY, "/console");
  }

  const rawId = form.get("id");
  const id = typeof rawId === "string" ? rawId : null;
  const listing = id ? gate.data.listings.find((l) => l.id === id) : undefined;
  if (!listing) return page(notYours(gate.auth.email), 404);
  if (!withdrawable(listing)) return page(alreadyGone(gate.auth.email, listing), 409);

  const limit = await bumpRateLimit(gate.sql, {
    key: producerWriteKey(gate.data.producer.id),
    windowSeconds: PRODUCER_WRITE_WINDOW_SECONDS,
    limit: PRODUCER_WRITE_MAX,
  });
  if (limit.kind === "unavailable") return writeLimiterUnavailable(COPY, limit.reason);
  if (limit.kind === "limited") return writeLimited(COPY, limit.retryAfterSeconds);

  const actor: ActorContext = {
    userId: gate.auth.id,
    producerId: gate.data.producer.id,
    tier: gate.data.producer.tier,
    status: gate.data.producer.status,
  };

  let moved: boolean;
  try {
    moved = await withdrawListing(gate.sql, actor, { id: listing.id, publishState: listing.publishState });
  } catch (err) {
    console.error("withdrawSubmit failed", err instanceof Error ? err.message : err);
    return page(writeFailed(gate.auth.email), 503);
  }

  // FALSE MEANS THE GUARDED UPDATE MATCHED NOTHING - two confirmations racing,
  // or an editor removing it a second earlier. Reported honestly rather than
  // as a success, because "withdrawn" would be a claim about a row this
  // request did not move.
  if (!moved) return page(alreadyGone(gate.auth.email, listing), 409);

  // PRG with a 303, matching POST /console/submit: refreshing the console
  // afterwards can never replay the withdrawal.
  return redirect(`/console?withdrew=${encodeURIComponent(listing.slug)}`, { status: 303 });
}

/* ======================================================================== *
 * Helpers and screens
 * ======================================================================== */

/** The same rule countsAgainstAllowance() uses, asked the other way round. */
function withdrawable(listing: ListingRow): boolean {
  return (
    listing.publishState !== "WITHDRAWN_BY_PRODUCER" && listing.publishState !== "REMOVED_BY_EDITOR"
  );
}

function confirm(email: string, listing: ListingRow, token: string) {
  return layout({
    title: COPY.title,
    heading: "Withdraw this listing?",
    status: {
      label: "Nothing has happened yet",
      tone: "outline",
      note: html`This page has changed nothing. The listing is still exactly as it was.`,
    },
    standfirst: html`You are signed in as ${email}.`,
    body: html`
      ${section({
        heading: `${listing.brand} ${listing.name}`,
        lede: html`Against <strong>${listing.referenceSlug}</strong> &middot;
          ${stateBadge(listing.publishState as never)}`,
        body: html`
          ${card(html`
            <h3>What withdrawing does</h3>
            <ul>
              <li>
                The listing stops being published, and
                <code>/go/${listing.slug}</code> stops resolving at our next build.
                That identifier is never reissued.
              </li>
              <li>
                <strong>The record is kept.</strong> We do not delete it. Click history is
                retained, because a click inside a network's cookie window can still pay out
                after the listing is gone, and because the history of what was listed and when
                is the honest answer to a later question about it.
              </li>
              <li>
                <strong>It frees your slot.</strong> A withdrawn listing does not count against
                your allowance, so you can submit something else.
              </li>
              <li>
                <strong>You cannot undo this here, and you cannot relist against
                ${listing.referenceSlug} yourself.</strong> One listing per original per
                producer is enforced by the database, and a withdrawn one still holds that
                pairing. Write to us if you need it back.
              </li>
            </ul>
          `)}
          <form method="post" action="/console/withdraw">
            ${csrfInput(CSRF_FIELD, token)}
            <input type="hidden" name="id" value="${listing.id}">
            <div class="btn-row">
              ${button("Withdraw this listing", { variant: "primary" })}
              <a class="btn btn-ghost" href="/console">Keep it, take me back</a>
            </div>
          </form>
        `,
      })}
    `,
  });
}

function notYours(email: string) {
  return layout({
    title: COPY.title,
    heading: "No such listing",
    status: {
      label: "Nothing was changed",
      tone: "outline",
      note: html`Nothing was withdrawn and nothing was saved.`,
    },
    standfirst: html`You are signed in as ${email}.`,
    body: emptyState({
      headline: "We cannot find that listing on your record.",
      because: html`The link may be stale, or it may point at a listing that is not yours. Your
        own listings are on <a href="/console">the console</a>.`,
    }),
  });
}

function alreadyGone(email: string, listing: ListingRow) {
  return layout({
    title: COPY.title,
    heading: "Already withdrawn",
    status: {
      label: "Nothing was changed",
      tone: "outline",
      note: html`This request changed nothing, because there was nothing left to change.`,
    },
    standfirst: html`You are signed in as ${email}.`,
    body: emptyState({
      headline: `${listing.brand} ${listing.name} is no longer published.`,
      because: html`It is already withdrawn or was removed by an editor, so there was nothing to
        withdraw. Its slot is not counting against your allowance.
        <a href="/console">Back to the console</a>.`,
    }),
  });
}

function writeFailed(email: string) {
  return layout({
    title: COPY.title,
    heading: "We could not withdraw it",
    status: {
      label: "Nothing was changed",
      tone: "outline",
      note: html`The database refused the write, so the listing is still published.`,
    },
    standfirst: html`You are signed in as ${email}.`,
    body: emptyState({
      headline: "Nothing was withdrawn.",
      because: html`Something went wrong on our side and we would rather say so than show you a
        confirmation for something that did not happen. Try again from
        <a href="/console">the console</a>; if it keeps failing, write to us.`,
    }),
  });
}
