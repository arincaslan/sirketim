import type { Metadata } from "next";
import Link from "next/link";
import { PricingTable } from "@/components/producers/pricing-table";

export const metadata: Metadata = {
  title: "Producer plans",
  description:
    "List your fragrance alternatives on Drydown. Monthly or yearly, with a free tier to test the channel first. No plan buys rank.",
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
        <h2 className="font-display text-lg">Not open yet</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          The producer program has not launched. There are no producer accounts, no billing
          connected to this site, and the prices above are indicative rather than final. Nothing
          here will charge you. If you make fragrances and want to be told when it opens,{" "}
          <Link href="/about" className="underline underline-offset-2 hover:text-primary">
            read our standards first
          </Link>{" "}
          — they are the part most likely to decide whether this is a fit.
        </p>
      </div>
    </div>
  );
}
