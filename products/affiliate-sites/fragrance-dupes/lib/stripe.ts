import Stripe from "stripe";

/**
 * Stripe client and plan/price mapping.
 *
 * ================== STRIPE IS PROBABLY THE WRONG RAIL ====================
 * Sirketim is Turkey-based, and **Stripe does not support Turkish accounts**.
 * That was already documented in this repo before this file was written
 * (departments/accounting/CLAUDE.md, 2026-08-24, from Gumroad payout
 * research) and re-confirmed in
 * departments/accounting/reports/payment-rails-investigation.md. This file
 * was written against Stripe as "the obvious default" without checking that
 * first - the mistake is recorded here rather than quietly fixed, because the
 * same assumption is easy to make again.
 *
 * Expected replacements: Paddle (merchant of record, also absorbs EU/UK/US
 * VAT liability) or iyzico (Turkish, already the accounting department's
 * recommended rail for firm-side card collection - though whether it supports
 * *recurring* billing is an open question nothing in this repo has verified).
 *
 * What survives a swap: the webhook-driven architecture is provider-agnostic
 * and correct - a hosted checkout redirect, a signed webhook as the only
 * writer of local subscription state, and a local projection of the
 * provider's own subscription object. Roughly the shape below, with different
 * SDK calls. `prisma/schema.prisma` has already been made provider-neutral
 * (`provider`, `providerCustomerId`, ...) so the data model does not need to
 * change again.
 *
 * Do not build more on this file until the rail is decided.
 * =========================================================================
 *
 * NOT LIVE. No Stripe account exists for this project (PRODUCER-PROGRAM.md §8
 * item 4). Every value below reads from env vars that are empty in
 * .env.example. `isStripeConfigured()` is the single gate every route checks
 * before doing anything - the routes return an explicit "not configured"
 * response rather than throwing a stack trace or, worse, appearing to work.
 *
 * Tier names match PRODUCER-PROGRAM.md §3. Prices are NOT set here: they live
 * as Stripe Price objects created in the dashboard, referenced by id. That is
 * deliberate - it keeps the actual money numbers out of a public git repo
 * (this repo is public, see root CLAUDE.md) and lets pricing change without a
 * deploy.
 */

export type PaidTier = "standard" | "featured";
export type BillingInterval = "monthly" | "yearly";

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

let cached: Stripe | null = null;

/** Returns null when Stripe isn't configured, so callers must handle the
 *  unconfigured case explicitly instead of getting a client that fails at the
 *  first API call. */
export function getStripe(): Stripe | null {
  if (!isStripeConfigured()) return null;
  if (!cached) {
    cached = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
      apiVersion: "2024-11-20.acacia",
    });
  }
  return cached;
}

const PRICE_ENV_KEYS: Record<PaidTier, Record<BillingInterval, string>> = {
  standard: {
    monthly: "STRIPE_PRICE_STANDARD_MONTHLY",
    yearly: "STRIPE_PRICE_STANDARD_YEARLY",
  },
  featured: {
    monthly: "STRIPE_PRICE_FEATURED_MONTHLY",
    yearly: "STRIPE_PRICE_FEATURED_YEARLY",
  },
};

/** The Stripe Price id for a tier+interval, or null if that price hasn't been
 *  created in the Stripe dashboard yet. */
export function getPriceId(tier: PaidTier, interval: BillingInterval): string | null {
  const key = PRICE_ENV_KEYS[tier]?.[interval];
  if (!key) return null;
  return process.env[key] || null;
}

export function isPaidTier(value: string): value is PaidTier {
  return value === "standard" || value === "featured";
}

export function isBillingInterval(value: string): value is BillingInterval {
  return value === "monthly" || value === "yearly";
}
