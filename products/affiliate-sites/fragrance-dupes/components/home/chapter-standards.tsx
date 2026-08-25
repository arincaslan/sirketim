import Link from "next/link";
import { Flask, ChatCircleText, Scales, ArrowClockwise, ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/site/reveal";

const PRINCIPLES = [
  {
    icon: Flask,
    title: "We buy every bottle",
    body: "Ratings come from bottles we purchased ourselves, not samples sent by a brand.",
  },
  {
    icon: Scales,
    title: "Rated the same six ways",
    body: "Every fragrance is scored on the same facets, so numbers across pairs actually compare.",
  },
  {
    icon: ChatCircleText,
    title: "The formula is public",
    body: "Similarity scores come from a disclosed formula, not an unexplained number.",
  },
  {
    icon: ArrowClockwise,
    title: "Rechecked over time",
    body: "Formulas change. We note when a rating was last verified against the current batch.",
  },
];

/**
 * Chapter 5: editorial trust and standards, before the closing CTA -
 * evolved from the old trust-strip.tsx. The four principles are unchanged;
 * the layout moved from four equal icon-topped cards in a grid (the AI-tell
 * the taste skill flags directly - Section 9.C) to a single divided list,
 * which also reads more like the closing movement of a chapter than a
 * fifth instance of "boxed feature cards" on the page.
 */
export function ChapterStandards() {
  return (
    <section className="border-b border-border bg-secondary/40">
      <div className="container py-20 sm:py-24">
        <div className="mx-auto max-w-[68ch] divide-y divide-border">
          {PRINCIPLES.map((principle, i) => (
            <Reveal
              key={principle.title}
              delay={i * 0.05}
              className="flex items-start gap-5 py-6 first:pt-0 last:pb-0"
            >
              <principle.icon
                weight="light"
                className="mt-1 h-7 w-7 shrink-0 text-primary"
                aria-hidden
              />
              <div className="flex flex-col gap-1">
                <span className="font-display text-xl">{principle.title}</span>
                <span className="text-muted-foreground">{principle.body}</span>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal
          delay={0.2}
          className="mx-auto mt-12 flex max-w-[68ch] flex-wrap items-center justify-between gap-4 border-t border-border pt-10"
        >
          <p className="max-w-[40ch] text-lg text-muted-foreground">
            Every rating is a bottle we bought and a formula we&apos;ll show
            you.
          </p>
          <Button asChild variant="link" size="lg" className="px-0">
            <Link href="/dupe-finder">
              Find your dupe
              <ArrowRight className="ml-1 h-4 w-4" aria-hidden />
            </Link>
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
