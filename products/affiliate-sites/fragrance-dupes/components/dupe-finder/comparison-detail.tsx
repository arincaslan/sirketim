import Image from "next/image";
import { Quotes } from "@phosphor-icons/react/dist/ssr";
import { RadarChart } from "@/components/dupe-finder/radar-chart";
import { DataTableFallback } from "@/components/dupe-finder/data-table-fallback";
import { SpecPanel } from "@/components/dupe-finder/spec-panel";
import { BuyActions } from "@/components/dupe-finder/buy-actions";
import { HouseBadge } from "@/components/dupe-finder/house-badge";
import { VerificationBadge } from "@/components/dupe-finder/verification-badge";
import { NoteDiff } from "@/components/dupe-finder/note-diff";
import { ReviewList } from "@/components/reviews/review-list";
import { AddReviewForm } from "@/components/reviews/add-review-form";
import { FragranceImage } from "@/components/fragrance/fragrance-image";
import { getPublishedSimilarity, isHouseProduct } from "@/lib/catalog";
import { getVerificationBadge } from "@/lib/verification";
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
  const score = getPublishedSimilarity(reference, dupe);
  const house = isHouseProduct(dupe);
  const verification = getVerificationBadge(reference, dupe);

  return (
    <div className="flex flex-col gap-10 rounded-frame border border-border bg-card p-6 sm:p-8">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <span className="mb-3 flex items-center gap-2">
            <FragranceImage fragrance={reference} className="h-11 w-11 text-base" />
            <span className="text-foreground/30" aria-hidden>
              vs
            </span>
            <FragranceImage
              fragrance={{
                name: dupe.name,
                brand: dupe.brand,
                family: reference.family,
                facets: dupe.facets,
                imageUrl: dupe.imageUrl,
              }}
              className="h-11 w-11 text-base"
            />
          </span>
          <p className="text-sm text-muted-foreground">
            {reference.name} <span className="text-foreground/40">vs</span> {dupe.name} by {dupe.brand}
          </p>
          <p className="mt-1 font-display text-2xl">{score}% note and facet match</p>
          <span className="mt-3 flex flex-wrap items-center gap-2">
            <VerificationBadge info={verification} />
            {house && <HouseBadge />}
            {house && (
              <span className="text-xs text-muted-foreground">
                Ranked by the same formula as every other listing, not floated to the top.
              </span>
            )}
          </span>
        </div>
        <p className="max-w-[30ch] text-right text-xs text-muted-foreground">
          {verification.description}{" "}
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

      {/* Who says these two are comparable at all. The pairing is the claim
          every other number on this page depends on, and for most listings it
          is the retailer's claim rather than ours — so it is shown as a quote
          with a link, not absorbed into our own voice. Absent means the pairing
          is our own editorial judgement. See DupeCandidate.pairingBasis. */}
      {!house && (
        <div className="flex flex-col gap-1 rounded-frame border border-border bg-background/40 p-4 text-xs">
          <span className="font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Why these are compared
          </span>
          {dupe.pairingBasis ? (
            <>
              <p className="text-foreground/80">
                {dupe.pairingBasis.source} describes {dupe.name} as{" "}
                <q className="italic">{dupe.pairingBasis.quote}</q>.{" "}
                {dupe.pairingBasis.url && (
                  <a
                    href={dupe.pairingBasis.url}
                    rel="nofollow noopener"
                    target="_blank"
                    className="underline underline-offset-2 hover:text-primary"
                  >
                    Check it
                  </a>
                )}
              </p>
              <p className="text-muted-foreground">
                That is their claim, not our finding. The score above is computed from notes and
                facets independently of it.
              </p>
            </>
          ) : (
            // The absent-basis branch is NOT a blank. A reader cannot otherwise
            // tell "the retailer says this" from "we decided this", and those
            // are very different claims — the second is the weaker one and is
            // ours. Saying nothing would quietly let our judgement borrow the
            // credibility of the cited listings sitting next to it.
            <>
              <p className="text-foreground/80">
                Our own judgement. No retailer describes {dupe.name} as an alternative to{" "}
                {reference.name} — we paired them, based on how the two are composed and on how{" "}
                {dupe.name} is generally regarded.
              </p>
              <p className="text-muted-foreground">
                That is weaker evidence than a pairing the seller states themselves. The note
                comparison below is the thing to judge it on.
              </p>
            </>
          )}
        </div>
      )}

      <div className="border-t border-border/70 pt-8">
        <NoteDiff reference={reference} dupe={dupe} />
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

      <BuyActions reference={reference} dupe={dupe} />

      <section className="flex flex-col gap-6 border-t border-border/70 pt-8">
        <div>
          <h3 className="font-display text-xl">What buyers say</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Reviews from people who bought {dupe.name}, separate from our own verdict above.
          </p>
        </div>

        <ReviewList targetSlug={dupe.slug} />

        <details className="group rounded-frame border border-border bg-background/40 p-5">
          <summary className="cursor-pointer list-none text-sm font-semibold marker:content-none">
            <span className="group-open:hidden">Add your review</span>
            <span className="hidden group-open:inline">Close</span>
          </summary>
          <div className="mt-5">
            <AddReviewForm productName={dupe.name} />
          </div>
        </details>
      </section>
    </div>
  );
}
