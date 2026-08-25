import { Hero } from "@/components/home/hero";
import { ChapterTrend } from "@/components/home/chapter-trend";
import { ChapterGap } from "@/components/home/chapter-gap";
import { ChapterFormula } from "@/components/home/chapter-formula";
import { ChapterTryIt } from "@/components/home/chapter-try-it";
import { ChapterStandards } from "@/components/home/chapter-standards";
import { LibraryProof } from "@/components/home/library-proof";
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
    </>
  );
}
