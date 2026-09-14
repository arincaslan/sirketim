import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/kit/JsonLd";
import { FragranceImage } from "@/components/fragrance/fragrance-image";
import {
  datedListingCount,
  getCatalogCoverage,
  getListingDayCounts,
  getPublishedSimilarity,
  getRecentlyAddedDays,
} from "@/lib/catalog";
import { DUPES } from "@/lib/dupes-data";
import { catalogLastUpdated, formatListingDate } from "@/lib/listing-dates";
import { itemListSchema } from "@/lib/jsonld";
import { formatPricePerMl } from "@/lib/similarity";
import { absoluteUrl } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * What's new — the freshness surface.
 *
 * WHY THIS PAGE EXISTS NOW. Until the producer programme opens, everything in
 * the catalogue arrived in a batch we authored ourselves, so "what changed"
 * was a question only we asked. Once subscribers submit their own listings the
 * catalogue starts growing from outside, on no schedule, and a returning
 * visitor has no way to see it. A site that grows and never says so reads as a
 * site that stopped.
 *
 * WHAT THE DATE MEANS, SAID ON THE PAGE. Every date here is the day a listing
 * first appeared in a build of this site — not the day it was submitted, and
 * not the day it was approved. Those three diverge by days once a review queue
 * exists, and only the third is a claim about what a reader could have seen.
 * The reasoning is in lib/listing-dates.ts; the copy below states it in the
 * one place a reader is looking at the dates.
 *
 * WHAT THIS PAGE DELIBERATELY IS NOT. It is not a popularity chart. The
 * "busiest originals" panel counts LISTINGS, which are facts about the
 * catalogue that only pass through editorial review, and it says so in its own
 * caption. It counts no clicks, no views and no sales: this site is a static
 * export with no per-request server, so it genuinely cannot count a click —
 * and even if it could, a public chart driven by outbound clicks would be a
 * second ranking, purchasable by anyone willing to buy traffic, sitting next
 * to a ranking the site promises is not purchasable. See the report in
 * HANDOFF.md and the independence section of the project CLAUDE.md.
 */

const days = getRecentlyAddedDays(24);
const shown = days.reduce((n, day) => n + day.listings.length, 0);
const dated = datedListingCount();
const lastUpdated = catalogLastUpdated();
const coverage = getCatalogCoverage(8);

export const metadata: Metadata = {
  title: "What's New",
  description: lastUpdated
    ? `The most recent alternatives added to Counterscent — ${dated} dated listings across ${coverage.covered} originals, last updated ${formatListingDate(lastUpdated)}.`
    : "The most recent alternatives added to Counterscent.",
  alternates: { canonical: "/new" },
};

export default function WhatsNewPage() {
  const undated = DUPES.length - dated;
  const flat = days.flatMap((day) => day.listings);
  const shownDates = new Set(days.map((day) => day.date));
  const earlier = getListingDayCounts().filter((day) => !shownDates.has(day.date));

  const itemList = itemListSchema(
    flat.map((entry, i) => ({
      name: `${entry.dupe.name} by ${entry.dupe.brand}`,
      url: absoluteUrl(`/fragrance/${entry.reference.slug}`),
      position: i + 1,
    }))
  );

  return (
    <div className="container py-14 sm:py-16">
      {flat.length > 0 && <JsonLd data={itemList} />}

      <div className="mb-10 flex flex-col gap-4">
        <h1 className="font-display text-fluid-h1">What&apos;s new</h1>
        <p className="max-w-[62ch] text-lg text-muted-foreground">
          Every alternative added to the catalogue, newest first. Each date is the day
          the listing first went live on this site &mdash; not the day it was submitted
          to us, and not the day we approved it. Those are different days, and only the
          last one is something you could have seen.
        </p>
        {lastUpdated && (
          <p className="text-sm text-muted-foreground">
            Catalogue last added to{" "}
            <time dateTime={lastUpdated} className="font-semibold text-foreground">
              {formatListingDate(lastUpdated)}
            </time>
            .
          </p>
        )}
      </div>

      {flat.length === 0 ? (
        /* Not a decorative empty state. lib/data/listing-dates.generated.ts is
           committed rather than built, so it can legitimately be empty or out
           of date, and this page must say which rather than render nothing and
           look like the catalogue is empty. */
        <div className="rounded-frame border border-dashed border-border p-8">
          <p className="max-w-[60ch] text-muted-foreground">
            No listing on this site carries a recorded publication date yet, so there is
            nothing honest to show here. {DUPES.length} alternatives are live and
            comparable in the{" "}
            <Link href="/dupe-finder" className="text-primary underline underline-offset-4">
              Dupe Finder
            </Link>{" "}
            &mdash; they are simply undated, and we would rather show nothing than invent
            a date for them.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-12">
          {days.map((day) => (
            <section key={day.date}>
              <h2 className="font-display text-2xl">
                <time dateTime={day.date}>{formatListingDate(day.date)}</time>
                {/* A complete count for that day, which is only true because
                    getRecentlyAddedDays never returns a partial one. */}
                <span className="ml-3 text-base font-normal text-muted-foreground">
                  {day.listings.length} added
                </span>
              </h2>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {day.listings.map(({ dupe, reference }) => (
                  <li key={dupe.slug}>
                    <Link
                      href={`/dupe-finder?ref=${reference.slug}`}
                      data-cursor="view"
                      className="group flex h-full items-start gap-3 rounded-frame border border-border bg-card p-4 transition-[border-color,transform] duration-150 ease-out hover:border-primary/50 active:scale-[0.99]"
                    >
                      <FragranceImage
                        fragrance={{
                          name: dupe.name,
                          brand: dupe.brand,
                          family: dupe.family,
                          facets: dupe.facets,
                          imageUrl: dupe.imageUrl,
                        }}
                        className="h-11 w-11 shrink-0 text-sm"
                      />
                      <span className="flex min-w-0 flex-1 flex-col gap-1">
                        <span className="line-clamp-2 font-semibold transition-colors group-hover:text-primary">
                          {dupe.name}
                        </span>
                        <span className="truncate text-xs text-muted-foreground">
                          {dupe.brand} &middot; {formatPricePerMl(dupe.priceUsd, dupe.bottleMl)}
                        </span>
                        {/* Parenthesised rather than "by <brand>" - several
                            houses in the catalogue are named "By Kilian", and
                            "by By Kilian" reads as a typo. */}
                        <span className="mt-1 text-xs text-muted-foreground">
                          Listed against{" "}
                          <span className="font-semibold text-foreground/85">
                            {reference.name}
                          </span>{" "}
                          ({reference.brand})
                        </span>
                      </span>
                      {/* Deliberately NOT text-dupe, for two reasons that
                          point the same way. The dupe green exists to separate
                          the dupe series from the reference series in a
                          two-series comparison; here the number stands alone
                          and the hue carries no meaning. And measured in dark
                          mode it is 4.03:1 at this size - under AA for normal
                          text - because --series-dupe is a chart-mark token.
                          See the report: four existing components use it as
                          small text and have the same problem. */}
                      <span className="shrink-0 font-display text-lg leading-none">
                        {getPublishedSimilarity(reference, dupe)}%
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      {/* The rest of the history, as dates and totals rather than cards. Four
          large authored batches make a card list either one day long or
          seventy-nine; this keeps the record complete at the cost of a line
          per day. */}
      {earlier.length > 0 && (
        <section className="mt-14">
          <h2 className="font-display text-2xl">Earlier</h2>
          <ul className="mt-4 flex flex-col divide-y divide-border border-y border-border">
            {earlier.map((day) => (
              <li
                key={day.date}
                className="flex items-baseline justify-between gap-4 py-2.5 text-sm"
              >
                <time dateTime={day.date} className="text-foreground/85">
                  {formatListingDate(day.date)}
                </time>
                <span className="tabular-nums text-muted-foreground">
                  {day.count} added
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Say what the list leaves out. A surface that shows 24 of 79 without
          saying so reads as the whole catalogue, which is the flattering
          direction and therefore the one to guard against. */}
      {(shown < dated || undated > 0) && (
        <p className="mt-10 border-t border-border pt-6 text-sm text-muted-foreground">
          Showing the {days.length === 1 ? "most recent day" : `last ${days.length} days`} on
          which anything was added &mdash; {shown} of {dated} dated listings.
          {undated > 0 && (
            <>
              {" "}
              {undated} further {undated === 1 ? "listing carries" : "listings carry"} no
              recorded publication date and {undated === 1 ? "is" : "are"} left out of
              this list rather than given an invented one &mdash;{" "}
              {undated === 1 ? "it is" : "they are"} live and comparable like any other.
            </>
          )}
        </p>
      )}

      <section className="mt-16 rounded-frame border border-border bg-card p-6 sm:p-8">
        {/* Hidden entirely rather than rendered as a heading over nothing: it
            is legitimately empty whenever no original has two alternatives,
            which was true of this catalogue until 2026-09-02. */}
        {coverage.mostCovered.length > 0 && (
          <>
            <h2 className="font-display text-2xl">Where the dupe market is busiest</h2>
            <p className="mt-2 max-w-[64ch] text-sm text-muted-foreground">
              The {coverage.mostCovered.length} originals with more than one alternative
              listed against them &mdash; the only ones where there is a choice to make.
              This counts{" "}
              <strong className="font-semibold text-foreground/85">
                listings, not clicks
              </strong>{" "}
              &mdash; we do not track what you click, and a chart of outbound clicks would
              be a second ranking that anyone could buy their way up. A fragrance moves up
              this one only when someone publishes a real alternative that passes review.
            </p>

            <ul className="mt-6 flex flex-col divide-y divide-border">
              {coverage.mostCovered.map(({ reference, listingCount }) => (
                <li key={reference.slug}>
                  <Link
                    href={`/dupe-finder?ref=${reference.slug}`}
                    className="group flex items-center justify-between gap-4 py-3"
                  >
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate font-semibold transition-colors group-hover:text-primary">
                        {reference.name}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {reference.brand} &middot; {reference.family}
                      </span>
                    </span>
                    <span className="shrink-0 text-sm tabular-nums text-muted-foreground">
                      {listingCount} alternatives
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}

        <p
          className={cn(
            "text-sm text-muted-foreground",
            coverage.mostCovered.length > 0 && "mt-6 border-t border-border pt-5"
          )}
        >
          {coverage.covered} of {coverage.total} originals in the catalogue have at least one
          alternative: {coverage.singleListing} have exactly one, and {coverage.uncovered} have
          none at all. Dupe houses clone bestsellers, so a large part of any serious fragrance
          catalogue will never have one, and we would rather say that than pad the page.{" "}
          <Link href="/producers" className="text-primary underline underline-offset-4">
            Make one that belongs here?
          </Link>
        </p>
      </section>
    </div>
  );
}
