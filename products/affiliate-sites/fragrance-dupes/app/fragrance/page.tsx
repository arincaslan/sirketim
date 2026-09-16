import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/kit/JsonLd";
import { FragranceImage } from "@/components/fragrance/fragrance-image";
import { REFERENCES } from "@/lib/data/references";
import { getCatalogCoverage, getListingCounts, getReferencesByBrand } from "@/lib/catalog";
import { catalogLastUpdated, formatListingDate } from "@/lib/listing-dates";
import { itemListSchema } from "@/lib/jsonld";
import { absoluteUrl } from "@/lib/site";

/**
 * The catalog index - the page that was missing entirely (CLAUDE.md: "There
 * is no catalog index at all"). Before this route existed, nothing on the
 * site linked to a `/fragrance/[slug]` page except the 12 guides (49 links,
 * into 31 of the then-68 references), so 37 references were reachable only
 * via sitemap.xml, and one guide's own link to `/fragrance` 404'd because
 * there was nothing at that path to land on.
 *
 * Grouped by house via getReferencesByBrand() - the same grouping
 * components/dupe-finder/reference-picker.tsx already uses, reused rather
 * than re-derived.
 */

function slugifyBrand(brand: string): string {
  return brand
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const metadata: Metadata = {
  title: "The Fragrance Catalog",
  description: `Every original fragrance in our catalog, browsable by house - ${REFERENCES.length} researched entries across ${getReferencesByBrand().length} houses, each with its full note pyramid, facet profile, and price per ml.`,
  alternates: { canonical: "/fragrance" },
};

export default function FragranceCatalogPage() {
  const groups = getReferencesByBrand();
  // Which originals actually have an alternative, rendered on the cards.
  // getListingCounts() has existed since the picker was built and its own doc
  // comment says a zero is "the marketplace's own inventory gap" worth showing
  // plainly - nothing had ever rendered it. A reader browsing 216 originals
  // cannot otherwise tell which of them this site can actually compare, which
  // is the single question the catalogue exists to answer.
  const listingCounts = getListingCounts();
  const coverage = getCatalogCoverage(0);
  const lastUpdated = catalogLastUpdated();

  const itemList = itemListSchema(
    REFERENCES.map((ref, i) => ({
      name: `${ref.name} by ${ref.brand}`,
      url: absoluteUrl(`/fragrance/${ref.slug}`),
      position: i + 1,
    }))
  );

  return (
    <div className="container py-14 sm:py-16">
      <JsonLd data={itemList} />

      <div className="mb-10 flex flex-col gap-4">
        <h1 className="font-display text-fluid-h1">The Fragrance Catalog</h1>
        <p className="max-w-[60ch] text-lg text-muted-foreground">
          {REFERENCES.length} originals we&apos;ve researched, across {groups.length} houses -
          full note pyramid, facet profile, and price per ml for each. Already know which
          one you&apos;re comparing?{" "}
          <Link href="/dupe-finder/" className="text-primary underline underline-offset-4">
            Go straight to the Dupe Finder
          </Link>
          .
        </p>
        {/* Coverage, stated up front. Most of this catalogue has no alternative
            listed against it and never will - dupe houses clone bestsellers.
            Saying so here stops a reader discovering it one disappointing card
            at a time, and it is a fact about our own data rather than a claim
            about anyone's product. */}
        <p className="max-w-[60ch] text-sm text-muted-foreground">
          <span className="font-semibold text-foreground/85">
            {coverage.covered} of {coverage.total}
          </span>{" "}
          have at least one alternative listed against them; the other {coverage.uncovered}{" "}
          have none yet.
          {lastUpdated && (
            <>
              {" "}
              Last added to{" "}
              <Link href="/new/" className="text-primary underline underline-offset-4">
                <time dateTime={lastUpdated}>{formatListingDate(lastUpdated)}</time>
              </Link>
              .
            </>
          )}
        </p>
      </div>

      {/* Quick jump: 111 entries in one scroll is exactly the wall-of-cards
          problem reference-picker.tsx's doc comment already describes for
          the Dupe Finder - here there's no client-side step-through, so a
          static anchor row is the equivalent fix at zero JS cost. */}
      <nav aria-label="Jump to a house" className="mb-10 flex flex-wrap gap-2">
        {groups.map((group) => (
          <a
            key={group.brand}
            href={`#${slugifyBrand(group.brand)}`}
            className="rounded-full border border-border px-3.5 py-1.5 text-sm font-semibold text-foreground/75 transition-colors duration-150 hover:border-primary/50 hover:text-foreground"
          >
            {group.brand}
            <span className="ml-1.5 text-xs text-muted-foreground">
              {group.references.length}
            </span>
          </a>
        ))}
      </nav>

      <div className="flex flex-col gap-14">
        {groups.map((group) => (
          <section key={group.brand} id={slugifyBrand(group.brand)} className="scroll-mt-24">
            <h2 className="font-display text-2xl">
              {group.brand}
              <span className="ml-2 text-base font-normal text-muted-foreground">
                {group.references.length}
              </span>
            </h2>
            <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {group.references.map((ref) => (
                <li key={ref.slug}>
                  <Link
                    href={`/fragrance/${ref.slug}`}
                    data-cursor="view"
                    className="group flex items-center gap-3 rounded-frame border border-border bg-card p-4 transition-[border-color,transform] duration-150 ease-out hover:border-primary/50 active:scale-[0.99]"
                  >
                    <FragranceImage fragrance={ref} className="h-11 w-11 shrink-0 text-sm" />
                    <div className="flex min-w-0 flex-col">
                      {/* The name is the one thing on this card that must stay
                          fully readable - line-clamp (wrap, don't clip) rather
                          than truncate, so a longer real name (e.g. "Flora
                          Gorgeous Gardenia") never loses a word to an ellipsis. */}
                      <span className="line-clamp-2 font-semibold transition-colors group-hover:text-primary">
                        {ref.name}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {ref.family} &middot; {ref.concentration}
                      </span>
                      {/* Absence is stated, not implied by a missing badge. A
                          card that simply lacks a count reads as "we have not
                          checked"; this says we have, and the answer is none. */}
                      <span className="mt-1 truncate text-xs">
                        {(listingCounts.get(ref.slug) ?? 0) > 0 ? (
                          /* Weight, not hue, carries the emphasis: --series-dupe
                             is a chart-mark token and measures 4.03:1 at 12px
                             in dark mode, under the 4.5:1 floor for normal
                             text. Its own comment in globals.css claims it
                             clears 4.5:1, which holds in light mode only. */
                          <span className="font-semibold text-foreground">
                            {listingCounts.get(ref.slug)}{" "}
                            {listingCounts.get(ref.slug) === 1 ? "alternative" : "alternatives"}
                          </span>
                        ) : (
                          /* Plain muted-foreground, NOT a dimmed variant: at
                             /70 this measured 3.36:1 on a 12px label, under
                             the 4.5:1 floor. The green count beside it already
                             carries the emphasis difference, so dimming this
                             bought nothing and cost legibility. */
                          <span className="text-muted-foreground">No alternative listed</span>
                        )}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <p className="mt-14 border-t border-border pt-6 text-sm text-muted-foreground">
        Every name above is a trade mark of its own owner. We name each fragrance in order to
        compare it - see{" "}
        <Link href="/about#methodology" className="underline underline-offset-4">
          our standards
        </Link>{" "}
        for how every score on this site is calculated.
      </p>
    </div>
  );
}
