import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "About — Ambre",
  description:
    "The story behind Ambre — small-batch fragrance, twelve scents, no fillers.",
};

export default function AboutPage() {
  return (
    <div className="container grid gap-10 py-16 md:grid-cols-2 md:py-24">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-gold">
          Our story
        </p>
        <h1 className="mt-3 font-serif text-3xl sm:text-4xl">
          Built around restraint, not volume.
        </h1>
        <div className="mt-5 flex flex-col gap-4 text-muted-foreground">
          <p>
            Ambre started with a simple complaint: most fragrance houses
            release dozens of scents a year, and most of them smell like
            variations on the same three ideas. We wanted the opposite — a
            small, fixed collection, each bottle built around one clear idea,
            worth actually finishing before you reach for something new.
          </p>
          <p>
            Every fragrance here is blended in small batches, bottled by
            hand, and tested against one question: does it still hold up on
            day three, not just in the first ten minutes off the strip. If it
            doesn&apos;t, it doesn&apos;t make the collection.
          </p>
          <p>
            We keep the catalog at twelve scents on purpose. No seasonal
            drops, no seventy-SKU wall to get lost in — five families, twelve
            bottles, and enough detail on every product page to know what
            you&apos;re buying before it arrives.
          </p>
        </div>
        <Button size="lg" className="mt-8" asChild>
          <Link href="/products">Shop the collection</Link>
        </Button>
      </div>

      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-secondary">
        <Image
          src="/about.jpg"
          alt="A quiet night sky reflected over still water"
          fill
          sizes="(min-width: 768px) 50vw, 100vw"
          className="object-cover"
        />
      </div>
    </div>
  );
}
