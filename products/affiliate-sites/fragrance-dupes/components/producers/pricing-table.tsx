"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Check, X } from "@phosphor-icons/react/dist/ssr";
import { Button, buttonVariants } from "@/components/ui/button";
import { NEVER_INCLUDED, PLANS, priceFor, yearlySavingMonths } from "@/lib/plans";
import { cn } from "@/lib/utils";
import type { BillingInterval } from "@/lib/plans";

/**
 * Plan chooser. The monthly/yearly switch is the founder's "monthly or
 * yearly" requirement at the point of purchase; the same choice is stored on
 * Subscription.interval (prisma/schema.prisma) rather than derived from the
 * price id, so a later price change cannot silently reinterpret existing
 * rows.
 *
 * Checkout is wired to POST /api/subscribe, which currently answers 503
 * because no Stripe account is connected. The button surfaces that response
 * verbatim rather than failing silently or pretending to redirect.
 */
export function PricingTable() {
  const [interval, setInterval] = useState<BillingInterval>("monthly");
  const [pending, setPending] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function startCheckout(planId: string) {
    setPending(planId);
    setNotice(null);
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier: planId, interval, producerId: "pending-signup" }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.url) {
        window.location.href = data.url as string;
        return;
      }
      setNotice(
        data.message ??
          "Checkout could not be started. Subscription billing is not connected to this site yet."
      );
    } catch {
      setNotice("Checkout could not be reached. Subscription billing is not connected yet.");
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col items-center gap-3">
        <div
          role="radiogroup"
          aria-label="Billing interval"
          className="inline-flex rounded-full border border-border bg-card p-1"
        >
          {(["monthly", "yearly"] as const).map((value) => {
            const active = interval === value;
            return (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setInterval(value)}
                className={cn(
                  "relative rounded-full px-5 py-2 text-sm font-semibold transition-colors duration-150",
                  active ? "text-primary-foreground" : "text-foreground/70 hover:text-foreground"
                )}
              >
                {active && (
                  <motion.span
                    layoutId="interval-pill"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    className="absolute inset-0 rounded-full bg-primary"
                    aria-hidden
                  />
                )}
                <span className="relative z-10 capitalize">{value}</span>
              </button>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground">
          Yearly bills once and works out cheaper. Cancel any time; your listings stay live to the
          end of the period you paid for.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {PLANS.map((plan) => {
          const price = priceFor(plan, interval);
          const saving = interval === "yearly" ? yearlySavingMonths(plan) : null;
          const isFree = plan.id === "free";

          return (
            <div
              key={plan.id}
              className={cn(
                "flex flex-col gap-6 rounded-frame border p-6",
                plan.highlighted ? "border-primary bg-secondary/40" : "border-border bg-card"
              )}
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-display text-xl">{plan.name}</h3>
                  {plan.highlighted && (
                    <span className="rounded-full bg-primary px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-primary-foreground">
                      Most producers
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{plan.tagline}</p>
              </div>

              <div className="flex flex-col gap-1">
                <p className="font-display text-3xl tabular-nums">
                  {isFree ? "Free" : `$${price}`}
                  {!isFree && (
                    <span className="ml-1 text-sm font-normal text-muted-foreground">
                      /{interval === "yearly" ? "year" : "month"}
                    </span>
                  )}
                </p>
                {saving != null && (
                  <p className="text-xs text-primary">
                    About {saving} {saving === 1 ? "month" : "months"} free versus monthly
                  </p>
                )}
                <p className="mt-1 text-sm font-semibold text-foreground/80">{plan.listings}</p>
              </div>

              <ul className="flex flex-1 flex-col gap-2.5">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-2.5 text-sm text-foreground/85">
                    <Check weight="bold" className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                    {feature}
                  </li>
                ))}
              </ul>

              {isFree ? (
                <Link href="/producers/login" className={cn(buttonVariants({ variant: "outline" }), "w-full")}>
                  Create a free account
                </Link>
              ) : (
                <Button
                  variant={plan.highlighted ? "default" : "outline"}
                  className="w-full"
                  disabled={pending !== null}
                  onClick={() => startCheckout(plan.id)}
                >
                  {pending === plan.id ? "Starting checkout..." : `Choose ${plan.name}`}
                </Button>
              )}
            </div>
          );
        })}
      </div>

      {notice && (
        <div role="status" className="rounded-frame border border-primary/30 bg-secondary/50 p-4">
          <p className="text-sm leading-relaxed text-foreground/85">{notice}</p>
        </div>
      )}

      <div className="rounded-frame border border-border bg-card p-6">
        <h3 className="font-display text-lg">What no plan buys, at any price</h3>
        <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
          {NEVER_INCLUDED.map((item) => (
            <li key={item} className="flex gap-2.5 text-sm text-foreground/85">
              <X weight="bold" className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
              {item}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
          The ranking formula is published on our{" "}
          <Link href="/about#methodology" className="underline underline-offset-2 hover:text-primary">
            methodology page
          </Link>{" "}
          and takes no input related to whether you pay us. Our own fragrance line is ranked by it
          too, and does not get floated to the top. That is the whole reason a listing here is
          worth having.
        </p>
      </div>
    </div>
  );
}
