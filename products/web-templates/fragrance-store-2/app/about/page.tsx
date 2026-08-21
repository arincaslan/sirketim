import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "About — Nocturne",
  description: "The story behind Nocturne — eleven fragrances built for after dark.",
};

const RITUAL_STEPS = [
  {
    number: "01",
    title: "One idea per bottle",
    body: "No forty-note pyramids. Every Nocturne scent is built around a single clear idea and tested until it holds up on day three, not just the first ten minutes.",
  },
  {
    number: "02",
    title: "Small batch, no reformulation",
    body: "We blend in small runs and don't quietly change a formula between them. What you reorder is what you bought the first time.",
  },
  {
    number: "03",
    title: "Built for after dark",
    body: "Every fragrance in this collection is calibrated to project — worn best once the lights are low, not diluted for an office at noon.",
  },
];

export default function AboutPage() {
  return (
    <div>
      <div className="container py-20 md:py-28">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
          Our story
        </p>
        <h1 className="font-display mt-5 max-w-4xl text-fluid-hero font-semibold leading-[0.95] text-balance">
          Built for the hours{" "}
          <span className="text-primary">after the sun goes down.</span>
        </h1>
      </div>

      <div className="container grid gap-10 border-t border-border py-16 md:grid-cols-2">
        <div className="flex flex-col gap-4 text-muted-foreground">
          <p>
            Nocturne started with a complaint: most fragrance houses release
            dozens of scents a year, and most of them smell like variations
            on the same three ideas, diluted to be inoffensive at any hour.
            We wanted the opposite — a small, fixed collection, each bottle
            built to be worn once, deliberately, after dark.
          </p>
          <p>
            Every fragrance here is blended in small batches, bottled by
            hand, and tested against one question: does it still hold up on
            day three. If it doesn&apos;t, it doesn&apos;t make the
            collection.
          </p>
          <p>
            We keep the catalog at eleven scents on purpose. Five families,
            eleven bottles, no seasonal drops — and enough detail on every
            product page to know exactly what you&apos;re buying before it
            arrives.
          </p>
          <Button size="lg" className="mt-4 w-fit" asChild>
            <Link href="/products">Shop the collection</Link>
          </Button>
        </div>

        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-sm border border-border">
          <Image
            src="/about.jpg"
            alt="A night sky thick with stars, reflected in still water"
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      </div>

      <div className="border-t border-border bg-card py-20">
        <div className="container">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
            The ritual
          </p>
          <div className="mt-10 grid gap-10 md:grid-cols-3">
            {RITUAL_STEPS.map((step) => (
              <div key={step.number} className="border-t border-foil/30 pt-5">
                <span className="font-display text-3xl font-semibold text-foil">
                  {step.number}
                </span>
                <p className="font-display mt-3 text-lg font-semibold">
                  {step.title}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-border py-20 text-center">
        <div className="container flex flex-col items-center">
          <p className="font-display text-fluid-h2 font-semibold">
            Eleven scents. Start anywhere.
          </p>
          <Button size="lg" className="mt-8" asChild>
            <Link href="/products">Browse the collection</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
