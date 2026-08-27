import Image from "next/image";
import { Reveal } from "@/components/site/reveal";

/**
 * Chapter 1 of the homepage narrative: what a dupe actually is, and why the
 * culture around them is real rather than a bootleg-market punchline. Sets
 * up chapter 2's turn (the gap Counterscent exists to close) without naming a
 * competitor - see chapter-gap.tsx's own note on why this site never names
 * Fragrantica in on-page copy.
 */
export function ChapterTrend() {
  return (
    <section className="border-b border-border">
      <div className="container grid gap-12 py-20 sm:py-24 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <Reveal className="flex flex-col gap-5">
          <h2 className="max-w-[16ch] font-display text-fluid-h2">
            A dupe is not a knockoff.
          </h2>
          <p className="max-w-[50ch] text-lg text-muted-foreground">
            The better ones come from the same contract perfumers who supply
            the luxury houses, using similar raw materials at a fraction of
            the markup. That conversation has moved from niche forums to the
            biggest short-video platforms, but the actual matching still
            gets decided by vibes and comment threads.
          </p>
        </Reveal>

        <Reveal
          delay={0.1}
          className="relative aspect-[4/3] w-full overflow-hidden rounded-frame border border-border lg:aspect-[5/4]"
        >
          <Image
            src="/generated/dupe-comparison-2-support.png"
            alt="Dew-covered petals beside a freshly cut citrus peel, in close macro"
            fill
            sizes="(min-width: 1024px) 45vw, 90vw"
            className="object-cover"
          />
        </Reveal>
      </div>
    </section>
  );
}
