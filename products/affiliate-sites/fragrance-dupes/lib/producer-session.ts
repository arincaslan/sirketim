import type { PlanId } from "@/lib/plans";

/**
 * Who is the current producer, and may they list?
 *
 * This is the single seam every gated producer surface goes through. It is
 * real logic over a data source that does not exist yet: there is no database
 * and no Auth.js wiring (PRODUCER-PROGRAM.md §8 items 2-3), so in normal
 * operation `getProducerSession()` returns null and every gated page shows
 * the signed-out state. That is correct behaviour, not a stub to route
 * around.
 *
 * When the database lands, exactly one function below changes
 * (`getProducerSession`) - the gate, the subscription check, and every call
 * site stay as they are. The integration point is marked inline.
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
 * TODO(auth): when Auth.js and the database are live, this becomes:
 *   const session = await auth();
 *   if (!session?.user?.producerId) return null;
 *   load Producer + Subscription by that id and return them.
 * Nothing else in the codebase should need to change.
 */
export async function getProducerSession(): Promise<ProducerSession | null> {
  if (isPreviewMode()) return PREVIEW_SESSION;
  return null;
}

/** Active in the sense that matters for listing: currently paid, or in a
 *  trial. `past_due` deliberately still counts - Stripe's dunning retries a
 *  failed card for days, and pulling a producer's access on the first failed
 *  charge is a bad outcome for a recoverable card problem
 *  (see the webhook's matching note in app/api/webhooks/stripe/route.ts). */
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
