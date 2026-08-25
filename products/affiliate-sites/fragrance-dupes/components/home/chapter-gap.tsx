import { Reveal } from "@/components/site/reveal";

/**
 * Chapter 2: why Drydown exists. Replaces the old mission.tsx (same core
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
          <p className="text-lg text-muted-foreground">
            We buy the bottles, rate them on the same six facets every time,
            and publish the formula behind every match score. If a dupe
            falls short, we say so, next to the ones that don&apos;t.
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
