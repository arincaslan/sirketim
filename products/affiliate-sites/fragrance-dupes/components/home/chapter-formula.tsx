import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/site/reveal";
import { AtomizerSpritz } from "@/components/home/atomizer-spritz";
import { getReference } from "@/lib/dupes-data";
import { getRankedDupesFor } from "@/lib/catalog";

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
/**
 * The formula's real weights, from lib/similarity.ts. Shown when there is no
 * listing to demonstrate against, which is more honest than a worked example
 * with invented inputs - and arguably a better fit for a chapter whose whole
 * job is disclosing how the score is computed.
 */
const WEIGHTS = [
  { label: "Note overlap", value: "50%", detail: "Base 45% · heart 35% · top 20%" },
  { label: "Facet closeness", value: "35%", detail: "Six facets, scored 0–10" },
  { label: "Same family", value: "15%", detail: "A shared olfactive family" },
];

export function ChapterFormula() {
  // No non-null assertions here. An earlier version used `getDupe("...")!` for
  // a hardcoded sample pairing; when that listing was removed the assertion
  // hid the breakage from the typechecker and the homepage failed at
  // prerender instead. Resolve real data, then branch on what actually exists.
  const reference = getReference("baccarat-rouge-540");
  const dupe = reference ? getRankedDupesFor(reference)[0] : undefined;

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
          {reference && dupe ? (
            <>
              <p className="mb-6 text-center text-sm text-muted-foreground">
                Live example: {reference.name} vs {dupe.name}
              </p>
              <AtomizerSpritz
                referenceName={reference.name}
                dupeName={dupe.name}
                referenceFacets={reference.facets}
                dupeFacets={dupe.facets}
              />
            </>
          ) : (
            <>
              <p className="mb-6 text-sm text-muted-foreground">
                The whole formula, in three numbers:
              </p>
              <dl className="flex flex-col gap-5">
                {WEIGHTS.map((weight) => (
                  <div key={weight.label} className="flex items-baseline gap-4">
                    <dd className="w-16 shrink-0 font-display text-3xl tabular-nums text-primary">
                      {weight.value}
                    </dd>
                    <div className="flex flex-col">
                      <dt className="font-semibold">{weight.label}</dt>
                      <span className="text-sm text-muted-foreground">{weight.detail}</span>
                    </div>
                  </div>
                ))}
              </dl>
              <p className="mt-6 border-t border-border pt-5 text-sm text-muted-foreground">
                No alternatives are listed yet, so there is nothing real to demonstrate on.
                Rather than score an invented example, here is the formula itself &mdash; the
                same one every listing will be measured by.
              </p>
            </>
          )}
        </Reveal>
      </div>
    </section>
  );
}
