import type { Metadata } from "next";
import Link from "next/link";
import { PricingTable } from "@/components/producers/pricing-table";
import { PRODUCER_CONSOLE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Producer plans",
  description:
    "List your fragrance alternatives on Counterscent. Monthly or yearly, with a free tier to test the channel first. No plan buys rank.",
  alternates: { canonical: "/producers/pricing" },
};

export default function PricingPage() {
  return (
    <div className="container py-14 sm:py-16">
      <div className="mx-auto mb-12 flex max-w-[60ch] flex-col items-center gap-4 text-center">
        <h1 className="font-display text-fluid-h1">Producer plans</h1>
        <p className="text-lg text-muted-foreground">
          Get your bottle in front of someone who has already named the expensive fragrance they
          want and is looking for an alternative. Start free, pay when the traffic proves itself.
        </p>
      </div>

      <PricingTable />

      <div className="mx-auto mt-14 max-w-[68ch] rounded-frame border border-dashed border-border p-6">
        <h2 className="font-display text-lg">The free tier is open. The paid tiers cannot be bought yet.</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Accounts, listings and review all work today, and the free tier needs no card. What is
          not built is the checkout: there is no payment provider connected to this site, so
          nothing above can be paid for and nothing here will charge you. Before you weigh the
          prices,{" "}
          <Link href="/about/" className="underline underline-offset-2 hover:text-primary">
            read our standards
          </Link>{" "}
          — they are the part most likely to decide whether this is a fit.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          The console a subscriber would work in is on its own address,{" "}
          <a
            href={PRODUCER_CONSOLE}
            className="underline underline-offset-2 hover:text-primary"
          >
            producers.counterscent.com
          </a>
          , where you sign in, register your company and manage your listings. The plan page
          there shows what your tier covers; it cannot take a payment.
        </p>
      </div>
    </div>
  );
}
