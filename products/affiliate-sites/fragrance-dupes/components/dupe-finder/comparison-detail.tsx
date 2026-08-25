import Image from "next/image";
import { Quotes } from "@phosphor-icons/react/dist/ssr";
import { RadarChart } from "@/components/dupe-finder/radar-chart";
import { DataTableFallback } from "@/components/dupe-finder/data-table-fallback";
import { SpecPanel } from "@/components/dupe-finder/spec-panel";
import { computeSimilarity } from "@/lib/similarity";
import type { DupeCandidate, ReferenceFragrance } from "@/lib/types";

/**
 * Full comparison view: radar (+ table fallback) on one side, grouped spec
 * panel on the other, verdict beneath. Reused by both the interactive Dupe
 * Finder tool and the written comparison articles (see DESIGN.md §8/§9),
 * so the same component drives both surfaces from the same dataset.
 *
 * Typography/imagery polish pass (Implementation addendum v2): the verdict
 * moved from small sans body text to the display serif at pull-quote scale
 * - this is the one place on the tool that reads as a human, editorial
 * conclusion rather than computed output, so it earns the same register the
 * site's long-form articles use. It also carries a low-opacity texture
 * image behind it (one of the four existing site-shell generations, not a
 * new one - see DESIGN.md's asset manifest) for warmth, kept well clear of
 * the radar/spec-panel functional area above so the actual comparison data
 * stays undistracted.
 */
export function ComparisonDetail({
  reference,
  dupe,
}: {
  reference: ReferenceFragrance;
  dupe: DupeCandidate;
}) {
  const score = computeSimilarity(reference, dupe);

  return (
    <div className="flex flex-col gap-10 rounded-frame border border-border bg-card p-6 sm:p-8">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm text-muted-foreground">
            {reference.name} <span className="text-foreground/40">vs</span> {dupe.name} by {dupe.brand}
          </p>
          <p className="mt-1 font-display text-2xl">{score}% note and facet match</p>
        </div>
        <p className="max-w-[26ch] text-right text-xs text-muted-foreground">
          Computed from shared notes and facet ratings.{" "}
          <a href="/about#methodology" className="underline underline-offset-2 hover:text-primary">
            How we calculate this
          </a>
        </p>
      </div>

      <div className="grid gap-10 lg:grid-cols-2">
        <div className="flex flex-col items-center gap-4">
          <RadarChart
            referenceName={reference.name}
            dupeName={dupe.name}
            referenceFacets={reference.facets}
            dupeFacets={dupe.facets}
          />
          <DataTableFallback
            referenceName={reference.name}
            dupeName={dupe.name}
            referenceFacets={reference.facets}
            dupeFacets={dupe.facets}
          />
        </div>

        <SpecPanel reference={reference} dupe={dupe} />
      </div>

      <div className="relative overflow-hidden rounded-frame border border-primary/25">
        <Image
          src="/generated/dupe-comparison-1-support.png"
          alt=""
          fill
          aria-hidden="true"
          className="object-cover opacity-[0.14]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-card via-card/90 to-card/60"
        />
        <div className="relative flex gap-4 p-6 sm:p-8">
          <Quotes weight="fill" className="mt-1 h-5 w-5 shrink-0 text-primary" aria-hidden />
          <p className="font-display text-xl leading-relaxed text-foreground/90 sm:text-2xl">
            {dupe.verdict}
          </p>
        </div>
      </div>
    </div>
  );
}
