import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe, isStripeConfigured } from "@/lib/stripe";

/**
 * Stripe webhook: the only writer of local Subscription state.
 *
 * NOT LIVE - no Stripe account, and no database to write to
 * (PRODUCER-PROGRAM.md §8). The signature verification and event handling
 * below are real; the persistence calls are marked TODO against the Prisma
 * models in prisma/schema.prisma, which are defined but never migrated.
 *
 * Why this route exists rather than writing subscription rows at checkout
 * time: Stripe owns billing state. Renewals, failed payments, card expiry,
 * dunning, and cancellations all happen without the user ever visiting this
 * site, so a local row written once at checkout goes stale immediately and a
 * lapsed producer's listings would stay live. This route is what keeps the
 * projection honest.
 *
 * `runtime = "nodejs"` is required: signature verification needs the raw
 * request body, which the edge runtime does not provide the same way.
 */
export const runtime = "nodejs";

/** Events that actually change local state. Anything else is acknowledged
 *  and ignored - Stripe retries on non-2xx, so silently 200-ing unknown
 *  events is correct rather than lazy. */
const HANDLED = new Set<Stripe.Event.Type>([
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "invoice.payment_failed",
]);

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!isStripeConfigured() || !stripe || !webhookSecret) {
    return NextResponse.json(
      {
        error: "not_configured",
        message: "Stripe is not connected to this site, so no webhook can be verified.",
      },
      { status: 503 }
    );
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "missing_signature" }, { status: 400 });
  }

  // Raw body, not req.json(): the signature is computed over the exact bytes
  // Stripe sent, so any parse-and-restringify breaks verification.
  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (error) {
    // A failure here means the payload is not from Stripe (or the secret is
    // wrong). Never process an unverified event - this endpoint is public and
    // would otherwise let anyone grant themselves a subscription.
    const message = error instanceof Error ? error.message : "unknown error";
    return NextResponse.json({ error: "invalid_signature", message }, { status: 400 });
  }

  if (!HANDLED.has(event.type)) {
    return NextResponse.json({ received: true, handled: false });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const producerId = session.metadata?.producerId;
      const tier = session.metadata?.tier;
      const interval = session.metadata?.interval;
      if (!producerId) break;

      // TODO(db): upsert Subscription for producerId with
      // stripeCustomerId: session.customer, stripeSubscriptionId:
      // session.subscription, tier, interval, status: ACTIVE.
      void tier;
      void interval;
      break;
    }

    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      // TODO(db): update the Subscription row keyed by
      // stripeSubscriptionId: subscription.id - status, currentPeriodStart,
      // currentPeriodEnd, cancelAtPeriodEnd, stripePriceId.
      void subscription;
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      // TODO(db): set status CANCELED and canceledAt. Listings belonging to
      // this producer must stop rendering - that check belongs in the query
      // layer (lib/catalog.ts), not here, so a missed webhook cannot leave
      // paid-tier listings live indefinitely.
      void subscription;
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      // TODO(db): set status PAST_DUE. Deliberately does not immediately
      // unpublish - Stripe's own dunning retries for days, and pulling a
      // producer's listings on a first failed charge would be a bad
      // experience for a recoverable card problem.
      void invoice;
      break;
    }
  }

  return NextResponse.json({ received: true, handled: true });
}
