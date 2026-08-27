import { Reveal } from "@/components/site/reveal";

/**
 * Chapter 2: why Counterscent exists. Replaces the old mission.tsx (same core
 * copy, since it already earned its place - see DESIGN.md's redesign audit
 * in the Implementation addendum v2), restaged from a centered text block
 * into an asymmetric single-column flow with an indented contrast aside, so
 * it breaks the two-column split rhythm sitting between chapter-trend.tsx
 * and chapter-formula.tsx rather than repeating it a third time (the taste
 * skill's zigzag-alternation cap).
 *
 * Deliberately never names a competitor by name - "a decade-old table",
 * "a brand blog picking its own winner" describe the real, well-documented
 * problem (see departments/sales/affiliate-niche-research.md) without
 * calling out Fragrantica specifically, matching the voice already
 * established on /about, which makes the same case the same way.
 */
export function ChapterGap() {
  return (
    <section className="border-b border-border bg-secondary/40">
      <div className="container py-20 sm:py-24">
        <Reveal className="flex max-w-[62ch] flex-col gap-5 lg:ml-[6vw]">
          <p className="font-display text-fluid-h2">
            Most dupe roundups are either a decade-old table or a brand blog
            picking its own winner.
          </p>
          {/* Do not reintroduce "we buy the bottles" here. It was removed once
              in the Phase 0 honesty pass and had survived in this file and the
              footer, which is how a false claim outlives its own correction:
              we own no bottles, and lib/types.ts states plainly that the facet
              ratings are an editorial estimate rather than measurement. What is
              actually true is the sentence below - one formula, published, applied
              identically to every listing including our own. */}
          <p className="text-lg text-muted-foreground">
            One formula, published in full, applied the same way to every
            bottle &mdash; including our own, which is capped exactly like
            anyone else&apos;s. If a dupe falls short, we say so, next to the
            ones that don&apos;t.
          </p>

          <div className="mt-4 border-l-2 border-border pl-6">
            <p className="text-sm text-muted-foreground">
              A cluttered database. An ad-heavy homepage. Whoever pays the
              highest commission wins the top spot.
            </p>
            <p className="mt-3 font-display text-xl italic leading-[1.15] text-primary">
              One matcher. One public formula. The notes decide, not the
              commission.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
