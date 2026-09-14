import type { PlanId } from "@/lib/plans";

/**
 * ============================================================================
 * THERE IS NEVER A SESSION ON THIS ORIGIN. DO NOT IMPLEMENT AUTH HERE.
 * ============================================================================
 *
 * As of 2026-09-14 this file has **zero call sites**. Sign-in and everything
 * behind it moved to `producers.counterscent.com`
 * (products/affiliate-sites/counterscent-producers/), and the pages that used
 * to gate on it - /producers/login and /producers/submit - are hand-offs
 * pointing at that origin.
 *
 * That makes the `TODO(auth)` below an active trap rather than a plan, which
 * is why this notice is here instead of the previous "when the database lands,
 * exactly one function changes" framing. This project is `output: "export"`:
 * it has no server, no route handlers and no request at render time. Wiring
 * `auth()` into it does not fail in review, it fails at **deploy**, because a
 * static export cannot read a cookie. Anyone following that TODO would get a
 * green typecheck, a green lint, and a broken build - on the deploy that also
 * carries 620 affiliate redirects.
 *
 * Auth belongs in the Worker on the other origin, where there is a request to
 * read it from. See HANDOFF.md, "What must NOT be built".
 *
 * WHY THE FILE STILL EXISTS. The types below (`ProducerSession`,
 * `ProducerSubscription`, `SubscriptionStatus`) are the shape the console will
 * need, and they are already in step with prisma/schema.prisma. Deleting them
 * would mean rewriting the same three interfaces from the schema in a week.
 * `isPreviewMode()` currently previews nothing, because nothing calls it.
 */

export type SubscriptionStatus = "trialing" | "active" | "past_due" | "canceled" | "incomplete";

export interface ProducerSubscription {
  tier: PlanId;
  interval: "monthly" | "yearly";
  status: SubscriptionStatus;
  /** ISO date. */
  currentPeriodEnd: string | null;
}

export interface ProducerSession {
  producer: { id: string; name: string; slug: string };
  subscription: ProducerSubscription | null;
}

/**
 * Local preview of gated pages, so the founder can see behind the gate before
 * auth exists.
 *
 * Double-gated on purpose, and the first condition is the important one:
 * `NODE_ENV === "development"` is inlined by the bundler at build time, so a
 * production build cannot enable this no matter how the environment is set.
 * An env var alone would be a real auth-bypass vulnerability the day this
 * deploys; this cannot be one.
 *
 * Any page using it must render `PreviewBanner` so a preview session is never
 * mistaken for a real one.
 */
export function isPreviewMode(): boolean {
  return process.env.NODE_ENV === "development" && process.env.PRODUCER_PREVIEW === "1";
}

const PREVIEW_SESSION: ProducerSession = {
  producer: { id: "preview", name: "Preview Producer", slug: "preview-producer" },
  subscription: {
    tier: "standard",
    interval: "monthly",
    status: "active",
    currentPeriodEnd: null,
  },
};

/**
 * The current producer session, or null when signed out.
 *
 * NOT A TODO FOR THIS FILE. The obvious body - call `auth()`, load the
 * Producer and Subscription by id - belongs in the producer Worker, which has
 * a request to read a cookie from. Writing it here compiles, lints, and then
 * breaks the static export at deploy time. See the notice at the top.
 */
export async function getProducerSession(): Promise<ProducerSession | null> {
  if (isPreviewMode()) return PREVIEW_SESSION;
  return null;
}

/** Active in the sense that matters for listing: currently paid, or in a
 *  trial. `past_due` deliberately still counts - a provider's dunning retries
 *  a failed card for days, and pulling a producer's access on the first failed
 *  charge is a bad outcome for a recoverable card problem.
 *
 *  The reverse case needs deciding when billing lands and is NOT handled here:
 *  a producer who CANCELS must not have their listings vanish mid-comparison,
 *  which reads as retaliation and implies we sell continued presence.
 *  Cancellation should end submission rights and let approved listings run to
 *  the end of the paid period.
 *
 *  This used to cite app/api/webhooks/stripe/route.ts. That route was deleted
 *  2026-08-27 and this project has no API routes at all; the provider will be
 *  Paddle, on the producer origin. */
export function isSubscriptionActive(subscription: ProducerSubscription | null): boolean {
  if (!subscription) return false;
  return (
    subscription.status === "active" ||
    subscription.status === "trialing" ||
    subscription.status === "past_due"
  );
}

export type GateResult =
  | { allowed: true; session: ProducerSession }
  | { allowed: false; reason: "signed-out" | "no-subscription" };

/**
 * The gate itself. Distinguishes signed-out from signed-in-but-unsubscribed
 * because they need different pages: one is "log in", the other is "choose a
 * plan", and collapsing them into a single 403 makes for a confusing dead
 * end.
 *
 * Note the free tier counts as a subscription here - a free-tier producer can
 * submit their two listings. The gate is about having an account in good
 * standing, not about having paid.
 */
export async function gateProducerAccess(): Promise<GateResult> {
  const session = await getProducerSession();
  if (!session) return { allowed: false, reason: "signed-out" };
  if (!isSubscriptionActive(session.subscription)) {
    return { allowed: false, reason: "no-subscription" };
  }
  return { allowed: true, session };
}
