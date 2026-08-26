import { NextRequest, NextResponse } from "next/server";
import {
  getPriceId,
  getStripe,
  isBillingInterval,
  isPaidTier,
  isStripeConfigured,
} from "@/lib/stripe";

/**
 * Starts a Stripe Checkout session for a producer subscription.
 *
 * NOT LIVE - no Stripe account is configured (PRODUCER-PROGRAM.md §8). When
 * unconfigured this returns 503 with an explicit message rather than
 * pretending to work: the repo convention is to say what is missing, not to
 * fake a success path.
 *
 * Checkout (Stripe-hosted) rather than a custom payment form, deliberately:
 * it keeps card data entirely off this site, which removes essentially all of
 * the PCI surface a solo operator should not be taking on.
 *
 * Note this route does NOT write a Subscription row. Stripe is the source of
 * truth and the webhook is what projects it locally - writing here would
 * create a row for a checkout the user might abandon, and then a cancelled
 * customer keeps their listings live. See app/api/webhooks/stripe/route.ts.
 */
export async function POST(req: NextRequest) {
  if (!isStripeConfigured()) {
    return NextResponse.json(
      {
        error: "not_configured",
        message:
          "Subscription billing is not live yet. No Stripe account is connected to this site, so nothing was charged and no subscription was created.",
      },
      { status: 503 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const { tier, interval, producerId, email } = (body ?? {}) as Record<string, unknown>;

  if (typeof tier !== "string" || !isPaidTier(tier)) {
    return NextResponse.json({ error: "invalid_tier" }, { status: 400 });
  }
  if (typeof interval !== "string" || !isBillingInterval(interval)) {
    return NextResponse.json({ error: "invalid_interval" }, { status: 400 });
  }
  if (typeof producerId !== "string" || producerId.length === 0) {
    return NextResponse.json({ error: "missing_producer" }, { status: 400 });
  }

  const priceId = getPriceId(tier, interval);
  if (!priceId) {
    return NextResponse.json(
      {
        error: "price_not_configured",
        message: `No Stripe Price is configured for the ${tier} ${interval} plan.`,
      },
      { status: 503 }
    );
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: typeof email === "string" && email ? email : undefined,
      success_url: `${siteUrl}/producers/welcome?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/producers/join?canceled=1`,
      // Carried through to the webhook, which is where the local Subscription
      // row is actually written. Without this the webhook receives a Stripe
      // customer with no way to tell which producer it belongs to.
      metadata: { producerId, tier, interval },
      subscription_data: { metadata: { producerId, tier, interval } },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown error";
    return NextResponse.json({ error: "stripe_error", message }, { status: 502 });
  }
}
