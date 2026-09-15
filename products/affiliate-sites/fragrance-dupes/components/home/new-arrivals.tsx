import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { FragranceImage } from "@/components/fragrance/fragrance-image";
import { Reveal } from "@/components/site/reveal";
import { cn } from "@/lib/utils";

/**
 * The most recently added listings, as a chapter of the home page.
 *
 * WHAT DECIDES WHAT APPEARS HERE, AND WHY IT MATTERS MORE THAN IT LOOKS.
 * Recency, and nothing else. Not score, not price, and above all not whether
 * the producer pays us. The selection itself lives in `newestArrivals()` in
 * app/page.tsx, with the full reasoning; read that before changing an order,
 * a cap, or a slot. The short version is that "newest first, everyone" is an
 * editorial rule a subscriber benefits from, while "subscribers on the home
 * page" is placement sold for money, and /disclosure promises in those words
 * that we sell none.
 *
 * THE LEAD SLOT IS NOT A SLOT. The first entry is drawn larger because it is
 * the newest, which is the same ordering the list already had and the same
 * one a reader is told about in the standfirst above it. Nothing about it can
 * be bought that the first card in the old row could not, and the two-per-
 * producer cap still binds. But it IS a visible hierarchy now, so if the
 * ordering rule ever changes, this is the surface where that becomes obvious
 * to a reader, not a detail buried in a sort.
 *
 * WHY THIS IS NOT A CAROUSEL ANY MORE, 2026-09-15. It was one until today: a
 * scroll-snap track of five identical cards, auto-advancing every six
 * seconds, with dots, a hover/focus pause, a visibility listener and a scroll
 * handler to keep the dots honest. All of that machinery existed to make five
 * items reachable, and five items do not need to be made reachable. Worse, it
 * cost the page the only real thing this section has: five licensed product
 * photographs, rendered at 44px. A carousel is for breadth. This is a short,
 * ordered list, so it is drawn as one: the newest entry at a size that lets
 * its photograph do some work, and the rest as an index beside it.
 *
 * Do not reintroduce auto-advance. Motion that moves content out from under a
 * reader has to earn it by making something reachable that otherwise is not,
 * and nothing here is out of reach.
 *
 * THREE PROPERTIES OF THE OLD COMPONENT THAT ARE KEPT DELIBERATELY:
 *
 *  1. NO CSS KEYFRAME ANIMATION ANYWHERE. app/globals.css sets a global
 *     `animation-iteration-count: 1` under prefers-reduced-motion, which for
 *     a looping animation means it runs to completion instantly and parks
 *     wherever the last frame put it. That is how retailer-band's marquee
 *     ended up half off-screen. Using no CSS animation at all sidesteps the
 *     whole class of bug; entrance motion goes through <Reveal>, which reads
 *     the setting in JS and renders the static element instead.
 *  2. IT RENDERS NOTHING when nothing is dated. No placeholder cards. An
 *     undated listing is a normal listing (see lib/listing-dates.ts) and a
 *     home page inventing five of them would be the one dishonest surface on
 *     a site whose argument is that it does not overclaim.
 *  3. THE SCORE IS getPublishedSimilarity's, passed in already computed, so a
 *     listing cannot show one number here and another on its comparison page.
 *
 * AND ONE THAT CHANGED: this is a server component now. The old one was a
 * client component only because of the timer, the matchMedia sync and the
 * scroll handler. With those gone there is no state left, so the home page
 * ships none of it.
 */

export interface NewArrival {
  slug: string;
  name: string;
  brand: string;
  family: string;
  imageUrl?: string;
  facets: {
    freshness: number;
    sweetness: number;
    warmth: number;
    woodyDepth: number;
    longevity: number;
    sillage: number;
  };
  pricePerMl: string;
  score: number;
  referenceSlug: string;
  referenceName: string;
  referenceBrand: string;
  firstLive: string;
  firstLiveLabel: string;
}

export function NewArrivals({ arrivals }: { arrivals: NewArrival[] }) {
  if (arrivals.length === 0) return null;

  const [lead, ...rest] = arrivals;

  return (
    <section aria-labelledby="new-arrivals-heading" className="border-b border-border">
      <div className="container py-16 sm:py-20">
        {/* A grid rather than a wrapping flex row. Above sm the link sits on
            the headline's baseline, the way library-proof does it; below it,
            a wrapping row put the link BETWEEN the headline and the sentence
            explaining the section, which is the wrong reading order. Explicit
            row/column placement at sm+, source order on mobile. */}
        <Reveal className="mb-9 grid gap-x-10 gap-y-3 sm:mb-11 sm:grid-cols-[1fr_auto]">
          <h2
            id="new-arrivals-heading"
            className="font-display text-fluid-h2 sm:col-start-1 sm:row-start-1"
          >
            Newest in the catalogue
          </h2>
          <p className="max-w-[52ch] text-muted-foreground sm:col-start-1 sm:row-start-2">
            The most recent alternatives to go live, newest first, and never more than two
            from any one producer.
          </p>
          <Link
            href="/new"
            className="inline-flex items-center gap-1.5 justify-self-start text-sm font-semibold text-primary hover:underline sm:col-start-2 sm:row-start-1 sm:self-end sm:justify-self-end"
          >
            See everything added
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </Reveal>

        <div
          className={cn(
            "grid gap-8 xl:gap-12",
            // Exactly as many cells as there are entries: with a single dated
            // listing there is no index column, so the lead is never left
            // sitting beside an empty half.
            //
            // Two columns from md rather than lg. Between 768 and 1023 a
            // full-width lead card is 705px holding about 270px of content,
            // and justify-between then throws the score a clear 470px from the
            // name it belongs to. Measured at that width, not guessed.
            rest.length > 0 && "md:grid-cols-[1.05fr_0.95fr]"
          )}
        >
          {/* min-w-0 on both cells: a grid item's default min-width is auto,
              so a long fragrance name would widen its track past the
              container rather than wrap. */}
          <Reveal className="min-w-0">
            <Link
              href={`/dupe-finder?ref=${lead.referenceSlug}`}
              data-cursor="view"
              // max-w below md for the same reason the grid splits at md: a
              // single-column card any wider is mostly empty. Tighter still
              // below sm, where the photograph runs the full width of the
              // card and the cap is what stops it becoming a poster.
              className="group flex h-full max-w-[24rem] flex-col rounded-frame border border-border bg-card p-5 transition-[border-color,transform] duration-150 ease-out hover:border-primary/50 active:scale-[0.99] sm:max-w-[30rem] md:max-w-none xl:p-7"
            >
              {/* Stacked below sm. Side by side at 320px the text column is
                  108px wide, and a 24px name next to a 30px score simply does
                  not fit in it: "Luminous" and "52%" overlapped, and the
                  producer line ran past the card edge. Measured at 320, not
                  assumed from 390 looking fine. */}
              <div className="flex flex-1 flex-col gap-5 sm:flex-row xl:gap-7">
                {/* Square, and `self-start` so it stays square: a flex child
                    stretches by default, which silently overrides aspect-square
                    and crops a centred bottle at the sides. Square rather than
                    a taller editorial crop because the shots are heterogeneous
                    (some square studio, some portrait, one lifestyle frame) and
                    a tall crop takes the cap off whichever one is widest.
                    object-cover rather than contain: these are white-ground
                    merchant photographs, and letterboxing one on a dark card
                    prints a white rectangle with bars. */}
                <div className="aspect-square w-full shrink-0 self-start overflow-hidden rounded-frame border border-border sm:w-[9rem] md:w-[7.5rem] lg:w-[9rem] xl:w-[11rem]">
                  <FragranceImage
                    fragrance={{
                      name: lead.name,
                      brand: lead.brand,
                      family: lead.family,
                      facets: lead.facets,
                      imageUrl: lead.imageUrl,
                    }}
                    className="h-full w-full text-2xl"
                  />
                </div>

                {/* justify-between so the pairing line settles onto the
                    photograph's bottom edge instead of leaving a pocket of
                    empty card under it. */}
                <div className="flex min-w-0 flex-1 flex-col justify-between gap-5">
                  <div className="min-w-0">
                    {/* The producer sits on its own line above the pair, not
                        beside the score. Inline, its min-content width plus the
                        score's pushed the whole card 9px past the container at
                        390px, because a grid item's default min-width is auto. */}
                    <p className="break-words text-xs uppercase tracking-[0.14em] text-muted-foreground">
                      {lead.brand}
                    </p>
                    {/* Name left, score right, the same reading order the index
                        rows use, so the eye lands in the same two places whether
                        it is on the lead or three rows down. */}
                    <div className="mt-1.5 flex items-start justify-between gap-4 xl:gap-6">
                      {/* A span, not an h3. The four index entries are list
                          items rather than headings, and heading-marking only the
                          lead would tell a screen reader the other four sit
                          underneath it. The section's own h2 names the region.
                          Same call /new and library-proof already make. */}
                      <span className="min-w-0 break-words font-display text-2xl leading-tight transition-colors group-hover:text-primary group-active:text-primary xl:text-3xl">
                        {lead.name}
                      </span>
                      {/* Deliberately NOT text-dupe. That token is a chart-series
                          mark for separating two series, it carries no meaning on
                          a number standing alone, and it measures 4.03:1 in dark
                          mode, under AA. */}
                      <p className="shrink-0 text-right leading-none">
                        {/* lining-nums: Cormorant Garamond defaults to
                            OLD-STYLE figures, so 51% renders with the 5
                            descending below the baseline and the 1 at x-height.
                            Fine in prose, wrong for a measured value. The font
                            ships real lnum and tnum, verified in the browser
                            rather than assumed. */}
                        <span className="block font-display text-3xl leading-none lining-nums transition-colors group-hover:text-primary group-active:text-primary xl:text-5xl">
                          {lead.score}%
                        </span>
                        <span className="mt-1.5 block text-xs text-muted-foreground">match</span>
                      </p>
                    </div>
                  </div>

                  {/* "against X" and the house on its own line, never "by
                      <brand>": several houses here are called "By Kilian" and
                      "by By Kilian" reads as a typo. */}
                  <p className="text-sm text-muted-foreground">
                    {"against "}
                    <span className="font-semibold text-foreground">{lead.referenceName}</span>
                    <br />
                    {lead.referenceBrand}
                  </p>
                </div>
              </div>

              <p className="mt-5 border-t border-border pt-4 text-xs text-muted-foreground xl:mt-7">
                {`${lead.pricePerMl} `}
                <span aria-hidden>&middot;</span>
                {" added "}
                <time dateTime={lead.firstLive}>{lead.firstLiveLabel}</time>
              </p>
            </Link>
          </Reveal>

          {rest.length > 0 && (
            <ul className="flex min-w-0 flex-col divide-y divide-border md:border-l md:border-border md:pl-8 xl:pl-10 [&>li:first-child>a]:pt-0">
              {/* Staggered 50ms apart: long enough to read as a sequence,
                  short enough that the last row is not still arriving a
                  quarter of a second after the first. Reveal reads
                  prefers-reduced-motion itself and renders the plain <li>. */}
              {rest.map((arrival, i) => (
                <Reveal as="li" key={arrival.slug} delay={0.05 * (i + 1)}>
                  <Link
                    href={`/dupe-finder?ref=${arrival.referenceSlug}`}
                    className="group flex items-baseline justify-between gap-5 py-4 transition-colors duration-150 ease-out"
                  >
                    <span className="flex min-w-0 flex-col gap-1">
                      <span className="break-words font-display text-lg leading-tight transition-colors group-hover:text-primary group-active:text-primary">
                        {arrival.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {`${arrival.brand} `}
                        <span aria-hidden>&middot;</span>
                        {" against "}
                        <span className="text-foreground">{arrival.referenceName}</span>
                      </span>
                    </span>
                    {/* tabular as well as lining here: these four sit in a
                        right-aligned column, so the digits have to line up. */}
                    <span className="shrink-0 font-display text-xl leading-none lining-nums tabular-nums transition-colors group-hover:text-primary group-active:text-primary">
                      {arrival.score}%<span className="sr-only"> match</span>
                    </span>
                  </Link>
                </Reveal>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
