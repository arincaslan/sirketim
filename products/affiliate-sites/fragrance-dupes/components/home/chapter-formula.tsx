import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/site/reveal";
import { AtomizerSpritz } from "@/components/home/atomizer-spritz";
import { getDupe, getReference } from "@/lib/dupes-data";

const STEPS = [
  {
    number: "1",
    title: "Pick a designer fragrance",
    body: "Start from a scent you already know, like Baccarat Rouge 540 or Bleu de Chanel.",
  },
  {
    number: "2",
    title: "See ranked matches",
    body: "Every candidate we carry data on for that scent, ordered by a disclosed similarity formula.",
  },
  {
    number: "3",
    title: "Compare the real facets",
    body: "A visual note comparison and a grouped spec panel, not a paragraph you have to decode.",
  },
];

/**
 * Chapter 3: how the matching actually works - this is the site's real
 * differentiator (a disclosed, weighted formula) made visible rather than
 * asserted. As of Implementation addendum v3 ("The Atomizer"), the chart
 * doesn't just appear - `AtomizerSpritz` releases an abstract atomizer
 * silhouette's mist first, which leads directly into the Dupe Finder's
 * own "Match Reveal" radar chart, the site's one signature moment tied
 * explicitly to real data rather than left as decoration. Evolved from
 * the original finder-preview.tsx (same three-step list and live chart,
 * same sample pairing) with more chapter-scaled padding and a direct link
 * to the published methodology, since this chapter's whole job is to make
 * that transparency legible.
 */
export function ChapterFormula() {
  const reference = getReference("baccarat-rouge-540")!;
  const dupe = getDupe("dossier-ambrosia")!;

  return (
    <section className="border-b border-border">
      <div className="container grid gap-12 py-20 sm:py-24 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
        <Reveal className="flex flex-col gap-8">
          <h2 className="max-w-[18ch] font-display text-fluid-h2">
            A matcher, not a database dump.
          </h2>
          <ol className="flex flex-col gap-6">
            {STEPS.map((step) => (
              <li key={step.number} className="flex gap-4">
                <span className="font-display text-2xl leading-none text-primary">{step.number}</span>
                <div className="flex flex-col gap-1">
                  <span className="font-semibold">{step.title}</span>
                  <span className="text-sm text-muted-foreground">{step.body}</span>
                </div>
              </li>
            ))}
          </ol>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <Button asChild size="lg" className="w-fit">
              <Link href="/dupe-finder">
                Find your dupe
                <ArrowRight className="ml-1 h-4 w-4" aria-hidden />
              </Link>
            </Button>
            <Link
              href="/about#methodology"
              className="text-sm font-semibold text-primary underline underline-offset-2 hover:no-underline"
            >
              See the full formula
            </Link>
          </div>
        </Reveal>

        <Reveal delay={0.1} className="rounded-frame border border-border bg-card p-6 sm:p-8">
          <p className="mb-6 text-center text-sm text-muted-foreground">
            Live example: {reference.name} vs {dupe.name}
          </p>
          <AtomizerSpritz
            referenceName={reference.name}
            dupeName={dupe.name}
            referenceFacets={reference.facets}
            dupeFacets={dupe.facets}
          />
        </Reveal>
      </div>
    </section>
  );
}
