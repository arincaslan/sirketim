import type { Metadata } from "next";
import { Hero } from "@/components/home/hero";
import { ChapterTrend } from "@/components/home/chapter-trend";
import { ChapterGap } from "@/components/home/chapter-gap";
import { ChapterFormula } from "@/components/home/chapter-formula";
import { ChapterTryIt } from "@/components/home/chapter-try-it";
import { ChapterStandards } from "@/components/home/chapter-standards";
import { LibraryProof } from "@/components/home/library-proof";
import { ProducerCta } from "@/components/home/producer-cta";

/**
 * The homepage was the only route on the site with no metadata of its own, so
 * it fell back to the layout's default title - which is fine as a title, but
 * meant no page-specific description, canonical, or OpenGraph entry for the
 * one URL most likely to be linked to.
 */
export const metadata: Metadata = {
  // `title.default` from the layout already reads correctly for the homepage,
  // so it is deliberately not overridden here - setting it would push it
  // through the "%s | Parfumoza" template and repeat the brand twice.
  description:
    "Compare designer fragrances against their closest alternatives on notes, longevity, sillage and price per ml - scored by one published formula, applied the same way to every bottle.",
  alternates: { canonical: "/" },
};
import { getAllContent } from "@/content/loader";

/**
 * The homepage: a six-chapter scroll narrative (Hero, Trend, Gap, Formula,
 * Try It, Standards) closing on a compact library-proof strip. See
 * DESIGN.md's Implementation addendum v2 for the full redesign rationale -
 * this replaced a conventional stacked-sections landing page with the same
 * design tokens but a much flatter, more generic rhythm.
 */
export default function HomePage() {
  const allContent = getAllContent();
  const latest = allContent.slice(0, 3);

  return (
    <>
      <Hero />
      <ChapterTrend />
      <ChapterGap />
      <ChapterFormula />
      <ChapterTryIt />
      <ChapterStandards />
      <LibraryProof pieces={latest} />
      <ProducerCta />
    </>
  );
}
