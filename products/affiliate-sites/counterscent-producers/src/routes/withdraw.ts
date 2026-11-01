import { html } from "../lib/html";
import { page, redirect } from "../lib/http";
import { layout } from "../ui/layout";
import {
  button,
  card,
  csrfInput,
  emptyState,
  listingStateFor,
  section,
  stateBadge,
} from "../ui/components";
import type { Env } from "../lib/env";
import { CSRF_FIELD, csrfToken, verifyCsrf } from "../lib/csrf";
import { effectiveTier, mayWithdrawSelf, type ListingRow } from "../lib/producer";
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
 * EVERY PLAN MAY USE THIS, THE FREE ONE INCLUDED - 2026-11-01. The history is
 * worth keeping because the question has now been settled three times. On 16
 * Sep the founder ruled the free tier MAY withdraw; on 18 Sep that was reversed
 * and self-serve withdrawal became a paid feature; on 1 Nov it was reversed
 * again during the legal-compliance pass, as a dark pattern: one click to put a
 * listing up and an email to take it down is the "easy in, hard out" asymmetry
 * consumer law treats as an obstruction, and the listing is the producer's own
 * content. lib/producer.ts mayWithdrawSelf() carries the reasoning and the
 * revert instructions; the catalogue's lib/plans.ts moved the feature to the
 * free tier in the same change, so the pricing page and this gate agree.
 *
 * The tier gate below is kept because mayWithdrawSelf() still refuses a tier
 * string this build does not recognise - an irreversible action is not taken
 * on a plan we cannot identify. askUsInstead() is now that case's answer only.
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
  if (!listing) return page(notYours(gate.auth.email, gate.isAdmin), 404);

  if (!withdrawable(listing)) return page(alreadyGone(gate.auth.email, listing, gate.isAdmin), 409);

  // TIER GATE, CHECKED ON BOTH VERBS. Here it stops us rendering a form the
  // producer is not allowed to submit; the identical check in the POST below is
  // the one that actually enforces it, because this screen is not the only way
  // to reach that handler.
  // THE ADMIN BYPASS IS THE SAME SHAPE AS quotaGate's `uncapped`. Since
  // 2026-11-01 every known plan may withdraw, so this only matters for a tier
  // string the build does not recognise - an administrator must still be able
  // to take their own listing down ("every ability", founder, 2026-09-18).
  // Read from ADMIN_EMAILS, never from the producer record.
  if (!gate.isAdmin && !mayWithdrawSelf(effectiveTier(gate.data.producer))) {
    return page(askUsInstead(gate.auth.email, listing), 403);
  }

  const token = await csrfToken(request, "withdraw-listing");
  // A null token means no session cookie to bind against, which requireProducer
  // has already ruled out. Treated as a refusal rather than rendered as a form
  // that cannot submit.
  if (!token) return csrfRefused(COPY, "/console");

  return page(confirm(gate.auth.email, listing, token, gate.isAdmin), 200, { allowForms: true });
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
  if (!listing) return page(notYours(gate.auth.email, gate.isAdmin), 404);
  if (!withdrawable(listing)) return page(alreadyGone(gate.auth.email, listing, gate.isAdmin), 409);

  // THE ENFORCEMENT. The GET refuses too, but a hidden button is not a control:
  // this handler is reachable by a direct POST with a valid CSRF token, which a
  // free producer's own browser can mint from any console page. Checked before
  // the rate limiter so a refused attempt cannot spend the producer's write
  // budget, and before any write so nothing is half-done.
  // THE ADMIN BYPASS IS THE SAME SHAPE AS quotaGate's `uncapped`. Since
  // 2026-11-01 every known plan may withdraw, so this only matters for a tier
  // string the build does not recognise - an administrator must still be able
  // to take their own listing down ("every ability", founder, 2026-09-18).
  // Read from ADMIN_EMAILS, never from the producer record.
  if (!gate.isAdmin && !mayWithdrawSelf(effectiveTier(gate.data.producer))) {
    return page(askUsInstead(gate.auth.email, listing), 403);
  }

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
    return page(writeFailed(gate.auth.email, gate.isAdmin), 503);
  }

  // FALSE MEANS THE GUARDED UPDATE MATCHED NOTHING - two confirmations racing,
  // or an editor removing it a second earlier. Reported honestly rather than
  // as a success, because "withdrawn" would be a claim about a row this
  // request did not move.
  if (!moved) return page(alreadyGone(gate.auth.email, listing, gate.isAdmin), 409);

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

function confirm(email: string, listing: ListingRow, token: string, isAdmin = false) {
  return layout({
    title: COPY.title,
    heading: "Withdraw this listing?",
    nav: { current: "listings", showAdmin: isAdmin },
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
          ${stateBadge(listingStateFor(listing))}`,
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

function notYours(email: string, isAdmin = false) {
  return layout({
    title: COPY.title,
    heading: "No such listing",
    nav: { current: "listings", showAdmin: isAdmin },
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

/**
 * The answer for a plan this console does not recognise: not a locked door, a
 * different door.
 *
 * Since 2026-11-01 every known plan may withdraw, the free one included, so
 * this is reachable only when the producer's recorded tier matches no plan in
 * this build (see mayWithdrawSelf). We refuse an irreversible action on a plan
 * we cannot identify and let a person do it instead.
 *
 * 403 RATHER THAN 404 OR A REDIRECT, on purpose. The listing exists and it is
 * theirs; answering 404 would lie about their own data, and bouncing them to
 * /console would leave them pressing the same button again, having learned
 * nothing. It names the listing and gives them a prefilled mail link.
 */
function askUsInstead(email: string, listing: ListingRow) {
  const subject = `Withdraw listing: ${listing.brand} ${listing.name}`;
  return layout({
    title: COPY.title,
    heading: "We will withdraw this for you",
    nav: { current: "listings" },
    status: {
      label: "Nothing was changed",
      tone: "outline",
      note: html`Your listing is still published. We could not identify your plan, so this one
        goes through a person instead.`,
    },
    standfirst: html`You are signed in as ${email}.`,
    body: html`
      ${emptyState({
        headline: `${listing.brand} ${listing.name} is still live.`,
        because: html`Your account records a plan this console does not recognise, and we do not
          take an irreversible step on a plan we cannot identify. Write to
          <a href="mailto:contact@counterscent.com?subject=${encodeURIComponent(subject)}"
            >contact@counterscent.com</a
          >
          and a person will take it down. You do not have to give a reason.
          <a href="/console">Back to your listings</a>.`,
      })}
      ${card(html`
        <h3>Why it comes down rather than disappearing</h3>
        <p class="muted">
          Whoever withdraws it, the row is kept and marked withdrawn rather than deleted.
          A click inside a network's cookie window can still pay out after a listing is
          gone, and a record that can be erased by the party it describes is not a record.
          That is the same for every plan.
        </p>
      `)}
    `,
  });
}

function alreadyGone(email: string, listing: ListingRow, isAdmin = false) {
  return layout({
    title: COPY.title,
    heading: "Already withdrawn",
    nav: { current: "listings", showAdmin: isAdmin },
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

function writeFailed(email: string, isAdmin = false) {
  return layout({
    title: COPY.title,
    heading: "We could not withdraw it",
    nav: { current: "listings", showAdmin: isAdmin },
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
