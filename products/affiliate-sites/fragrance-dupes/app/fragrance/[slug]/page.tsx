import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { JsonLd } from "@/components/kit/JsonLd";
import { Breadcrumb } from "@/components/kit/Breadcrumb";
import { FragranceImage } from "@/components/fragrance/fragrance-image";
import { MatchRule } from "@/components/dupe-finder/match-rule";
import { HouseBadge } from "@/components/dupe-finder/house-badge";
import { VerificationBadge } from "@/components/dupe-finder/verification-badge";
import { buttonVariants } from "@/components/ui/button";
import { REFERENCES } from "@/lib/data/references";
import {
  getRankedDupesFor,
  getPublishedSimilarity,
  getNearestCoveredOriginal,
  getRelatedOriginals,
  getOriginalOffers,
  getOriginalPricing,
  isHouseProduct,
} from "@/lib/catalog";
import { getVerificationBadge } from "@/lib/verification";
import { getGuidesLinkingTo } from "@/lib/related-guides";
import { formatPricePerMl } from "@/lib/similarity";
import { breadcrumbSchema } from "@/lib/jsonld";
import { absoluteUrl } from "@/lib/site";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import type { ReferenceFragrance } from "@/lib/types";

/**
 * Per-fragrance pages: the site's indexable catalog surface.
 *
 * Before this route existed, 68 references and every listing produced exactly
 * ZERO indexable URLs - the Dupe Finder is one client-state page, so nothing
 * a search engine could land on described an individual fragrance. This is
 * the single highest-leverage SEO change available to this project, and it is
 * a routing change rather than a content one.
 *
 * Fully static: generateStaticParams enumerates every reference at build time,
 * so these are prerendered HTML, not on-demand renders.
 *
 * Note what this page deliberately does NOT claim. It presents the note
 * pyramid, the facet profile and the price of a real, well-known fragrance,
 * referenced by name (nominative use). It does not assert we have smelled it,
 * and where no alternative is listed it says so plainly rather than padding
 * the page.
 *
 * RESTYLED 2026-09-18. Three substantive changes, in order of how much they
 * were costing:
 *
 * 1. The facet profile was six filled-track progress bars. That is the exact
 *    pattern components/dupe-finder/value-bar.tsx carries a doc comment about
 *    refusing to use, and it made an editorial page read as a dashboard. It is
 *    now the same bare MatchRule the ranked cards use, in the gold reference
 *    tone, so the chart grammar the radar already established (gold is the
 *    original, green is the alternative) now runs across the whole site
 *    instead of stopping at the chart's edge.
 * 2. The price was buried mid-sentence in the lede. It is a figure, and it is
 *    most of why anyone opens this page, so it now sits in a rail with the
 *    other three identity facts. The provenance caveat underneath is unchanged
 *    in substance: which KIND of price this is stays on the page, because a
 *    retailer's price and our own approximate figure are different claims.
 * 3. The alternatives list shared nothing with the ranked card it duplicates.
 *    Same fragrances, same scores, two unrelated visual languages. It now
 *    carries the rank, the never-truncated name, the score over its rule, and
 *    the verification badge, exactly as the finder does.
 *
 * Deliberately NOT added: scroll reveals. Every other editorial surface here
 * uses components/site/reveal.tsx, which renders its children at opacity 0
 * until hydration. On 216 pages that are the site's search asset, and whose
 * whole job is to be read, hiding the content behind a JS entrance is a worse
 * trade than a page that simply does not fade in. The one animated thing on
 * the page is a rule whose value is printed as text beside it, so nothing is
 * hidden if the script never arrives.
 */

const FACET_LABELS: Array<[keyof ReferenceFragrance["facets"], string]> = [
  ["freshness", "Freshness"],
  ["sweetness", "Sweetness"],
  ["warmth", "Warmth"],
  ["woodyDepth", "Woody depth"],
  ["longevity", "Longevity"],
  ["sillage", "Sillage"],
];

export function generateStaticParams() {
  return REFERENCES.map((reference) => ({ slug: reference.slug }));
}

function findReference(slug: string): ReferenceFragrance | undefined {
  return REFERENCES.find((reference) => reference.slug === slug);
}

function describe(reference: ReferenceFragrance): string {
  const top = reference.notes.top.slice(0, 2).join(" and ");
  const base = reference.notes.base.slice(0, 2).join(" and ");
  return `${reference.name} by ${reference.brand} is an ${reference.concentration.toLowerCase()} in the ${reference.family.toLowerCase()} family, opening on ${top} and drying down to ${base}. Notes, longevity, sillage and price per ml, plus any alternatives listed against it.`;
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const reference = findReference(params.slug);
  if (!reference) return { title: "Fragrance not found" };

  const title = `${reference.name} by ${reference.brand}`;
  const description = describe(reference);
  const path = `/fragrance/${reference.slug}`;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "article",
      title,
      description,
      url: absoluteUrl(path),
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

/**
 * One fact in the identity rail. Label above figure, the figure in the display
 * serif so the rail can be read without reading it. One rule top and bottom
 * around the whole rail rather than a hairline under every fact.
 */
function IdentityFact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="border-border px-1 py-4 sm:border-l sm:px-5 sm:first:border-l-0 sm:first:pl-0">
      <dt className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">{label}</dt>
      <dd className="mt-1.5 font-display text-xl leading-tight lining-nums">{children}</dd>
    </div>
  );
}

export default function FragrancePage({ params }: { params: { slug: string } }) {
  const reference = findReference(params.slug);
  if (!reference) notFound();

  const dupes = getRankedDupesFor(reference);
  // Most of the catalogue has nothing listed against it, so most of these
  // pages ended on an honest empty state and then a "Related originals" list
  // that is mostly uncovered too - a dead end two clicks deep. This is the
  // closest original a reader can actually use, by the same similarity measure
  // that page already publishes. Null when the catalogue holds none.
  const nearestCovered = dupes.length === 0 ? getNearestCoveredOriginal(reference) : null;
  const originalOffers = getOriginalOffers(reference);
  const pricing = getOriginalPricing(reference);
  const relatedOriginals = getRelatedOriginals(reference);
  const relatedGuides = getGuidesLinkingTo(reference.slug);
  const [minHours, maxHours] = reference.longevityHoursRange;
  const path = `/fragrance/${reference.slug}`;

  // Routes through the catalog index rather than straight to "Dupe Finder" -
  // that used to be the only step 2, before /fragrance existed as a real
  // index page. Dupe Finder is still one click away (see the header CTA and
  // the "Compare it" link below), just no longer the breadcrumb's only path
  // back up.
  const breadcrumbItems = [
    { name: "Home", path: "/" },
    { name: "Fragrances", path: "/fragrance" },
    { name: reference.name, path },
  ];

  return (
    <div className="container max-w-5xl py-14 sm:py-16">
      <JsonLd
        data={breadcrumbSchema(breadcrumbItems.map((i) => ({ name: i.name, url: absoluteUrl(i.path) })))}
      />

      <Breadcrumb items={breadcrumbItems} />

      <header className="flex flex-col gap-7 sm:flex-row sm:items-start sm:gap-9">
        <FragranceImage
          fragrance={reference}
          className="h-24 w-24 shrink-0 sm:h-32 sm:w-32"
        />
        <div className="flex min-w-0 flex-col gap-3">
          <p className="text-sm uppercase tracking-[0.14em] text-muted-foreground">
            {reference.brand}
          </p>
          <h1 className="max-w-[16ch] text-balance font-display text-fluid-h1 leading-[1.05]">{reference.name}</h1>
          <p className="max-w-[52ch] text-lg leading-relaxed text-muted-foreground">
            {reference.concentration} in the {reference.family.toLowerCase()} family. Full note
            pyramid, facet profile and price per ml below.
          </p>
        </div>
      </header>

      {/* ONE price for this bottle, not two. It is the retailer's wherever we
          have one for a size we know, and our own approximate figure otherwise,
          and the caption says which, because those are different kinds of
          claim. Every comparison further down the page runs off this same
          number via getOriginalPricing(). */}
      <dl className="mt-10 grid grid-cols-2 border-y border-border sm:grid-cols-4">
        <IdentityFact label="Concentration">{reference.concentration}</IdentityFact>
        <IdentityFact label="Family">{reference.family}</IdentityFact>
        <IdentityFact label="Bottle">
          ${pricing.priceUsd}{" "}
          <span className="text-sm text-muted-foreground">/ {pricing.bottleMl}ml</span>
        </IdentityFact>
        <IdentityFact label="Per ml">
          {formatPricePerMl(pricing.priceUsd, pricing.bottleMl)}
        </IdentityFact>
      </dl>

      <p className="mt-3 max-w-[64ch] text-xs leading-relaxed text-muted-foreground">
        {pricing.source === "retailer" ? (
          <>
            {pricing.merchantName}&rsquo;s listed price for the {pricing.bottleMl}ml bottle.
            Prices change, so check the shop for what it costs today.
          </>
        ) : (
          <>
            That price is an approximate US retail figure we maintain by hand, not a live feed
            from a retailer. It drifts, and the per-ml figure is derived from it. Check the
            retailer for what it costs today.
          </>
        )}
      </p>

      {originalOffers.length > 0 && (
        <div className="mt-6 flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            {originalOffers.map((offer, i) => (
              <a
                key={offer.affiliateLinkId!}
                href={`/go/${offer.affiliateLinkId}`}
                rel="sponsored nofollow noopener"
                target="_blank"
                className={cn(
                  /* The first retailer carries the primary button and the rest
                     are outlines. That is visual order, not a recommendation -
                     the retailers are unranked (see getOriginalOffers) and the
                     caption below says so wherever there is more than one. */
                  buttonVariants({ variant: i === 0 ? "default" : "outline" }),
                  /* THE LABEL HAS TO BE ALLOWED TO WRAP, since the size was
                     added to it. buttonVariants is whitespace-nowrap with a
                     fixed h-11, and "Buy for $77.95 / 100ml at
                     FragranceShop.com" measures 390px - wider than a 375px
                     phone, so the page grew a horizontal scrollbar rather
                     than the button growing a second line. max-w-full and
                     min-h-11 keep it one line wherever it fits and two lines
                     where it does not. */
                  "h-auto min-h-11 w-fit max-w-full gap-2 whitespace-normal py-2.5 text-center"
                )}
              >
                {/* The retailer's own price, which is also what the rail above
                    quotes - a button must never name a price its own
                    destination contradicts.

                    THE SIZE TRAVELS WITH THE PRICE, added 2026-09-19. A bare
                    "Buy for $349.95" is a number with no unit: the reader has
                    to look back up to the rail to learn what it buys, and when
                    the rail is showing our own editorial figure ($325) rather
                    than a retailer's, the two numbers differ and the button
                    looks wrong rather than merely unlabelled. `priceMl` is
                    non-null exactly when `priceUsd` is (checked across all 216
                    references: zero cases of one without the other), so this
                    never renders a dangling separator. */}
                {offer.priceUsd != null
                  ? `Buy for $${offer.priceUsd} / ${offer.priceMl}ml at ${offer.merchantName}`
                  : `Buy at ${offer.merchantName}`}
                <ArrowUpRight className="h-4 w-4" aria-hidden />
              </a>
            ))}
          </div>
          {originalOffers.length > 1 && (
            <p className="max-w-[64ch] text-xs leading-relaxed text-muted-foreground">
              Two retailers stock this and we are enrolled with both, so both are here with
              their own prices. They are not ranked: a price is only comparable when both quote
              the same bottle size, and they do not always.
            </p>
          )}
          {/* Only the no-price case needs saying; when we do have a retailer
              price the rail above already gave it, and repeating it reads like
              two different prices. */}
          {originalOffers.some((o) => o.priceUsd == null) && (
            <p className="max-w-[64ch] text-xs leading-relaxed text-muted-foreground">
              Where no price is shown, that retailer stocks this but not in a{" "}
              {reference.bottleMl}ml bottle we can price against, so we link the shop without
              quoting a figure rather than guess across sizes.
            </p>
          )}
        </div>
      )}

      {/* The identity cluster: what this fragrance is. Deliberately carries no
          section rules, so it reads as one block under the masthead and the
          ruled sections further down read as a separate, outward-looking half
          of the page. */}
      <section className="mt-16">
        <h2 className="font-display text-fluid-h3">The note pyramid</h2>
        <dl className="mt-6 grid gap-px overflow-hidden rounded-frame border border-border bg-border sm:grid-cols-3">
          {(
            [
              ["Top", reference.notes.top],
              ["Heart", reference.notes.heart],
              ["Base", reference.notes.base],
            ] as const
          ).map(([layer, notes]) => (
            <div key={layer} className="flex flex-col gap-3 bg-background p-5 sm:p-6">
              <dt className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                {layer}
              </dt>
              <dd className="font-display text-lg leading-snug">{notes.join(", ")}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 max-w-[64ch] text-xs leading-relaxed text-muted-foreground">
          Base notes carry the most weight in our match score, at 45% of note overlap, because
          that is the part still on skin at the end of a day.
        </p>
      </section>

      <section className="mt-16">
        <h2 className="font-display text-fluid-h3">Profile</h2>
        <div className="mt-6 grid gap-10 md:grid-cols-[minmax(0,1fr)_14rem] md:gap-12">
          {/* Bare rules, no filled track. A track with a partial fill on top is
              dashboard chrome; six rules sharing one column width compare
              perfectly well against each other without one, and the figure is
              printed beside every rule so nothing depends on reading a length. */}
          <dl className="flex flex-col gap-5">
            {FACET_LABELS.map(([key, label], i) => {
              const value = reference.facets[key];
              return (
                <div key={key} className="flex items-center gap-4">
                  <dt className="w-28 shrink-0 text-sm text-muted-foreground">{label}</dt>
                  <dd className="flex flex-1 items-center gap-4">
                    <span className="flex-1">
                      <MatchRule
                        score={value}
                        max={10}
                        tone="reference"
                        thickness="bold"
                        delay={i * 0.05}
                      />
                    </span>
                    <span className="w-10 shrink-0 text-right font-display text-lg leading-none tabular-nums lining-nums">
                      {value}
                      <span className="text-xs text-muted-foreground">/10</span>
                    </span>
                  </dd>
                </div>
              );
            })}
          </dl>

          <aside className="flex flex-col gap-5 rounded-frame border border-border bg-card p-5">
            <div>
              <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                On skin
              </p>
              <p className="mt-1.5 font-display text-xl leading-tight lining-nums">
                {minHours}-{maxHours} hours
              </p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                Sillage
              </p>
              <p className="mt-1.5 font-display text-xl leading-tight">
                {reference.sillageLabel}
              </p>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Facet ratings are our own editorial estimates on a 0 to 10 scale, not lab
              measurements.
            </p>
          </aside>
        </div>
      </section>

      <section className="mt-20 border-t border-border pt-12">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
          <h2 className="font-display text-fluid-h3">Alternatives</h2>
          <Link
            href={`/dupe-finder?ref=${reference.slug}`}
            className="inline-flex items-center gap-1.5 py-1 text-sm font-semibold text-primary underline-offset-4 hover:underline"
          >
            Compare in the Dupe Finder
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </div>
        {dupes.length === 0 ? (
          <div className="mt-6 flex flex-col gap-4 rounded-frame border border-dashed border-border bg-card/40 p-7 sm:p-9">
            <p className="max-w-[60ch] leading-relaxed text-muted-foreground">
              Nothing is listed against {reference.name} yet. We only publish an alternative
              once we have its real specification from the producer, scored by the same
              formula as everything else on this site, so this space stays empty rather
              than filled with guesses.
            </p>
            {nearestCovered && (
              <p className="max-w-[60ch] leading-relaxed text-muted-foreground">
                The closest fragrance in our catalogue that does have one is{" "}
                <Link
                  href={`/dupe-finder?ref=${nearestCovered.slug}`}
                  className="font-semibold text-primary underline underline-offset-4"
                >
                  {nearestCovered.name}
                </Link>{" "}
                {/* Parenthesised rather than "by <brand>": several houses here
                    are named "By Kilian", and "by By Kilian" reads as a typo. */}
                ({nearestCovered.brand}), at {nearestCovered.similarity}% on the
                original-to-original measure used in &ldquo;Related originals&rdquo; below.
                That is a different calculation from a dupe match score and a weaker
                claim: it says these two originals resemble each other, not that one
                replaces the other.
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              Make a fragrance you think belongs here?{" "}
              <Link href="/producers/" className="text-primary underline underline-offset-4">
                List it with us
              </Link>
              .
            </p>
          </div>
        ) : (
          <>
            {/* The same three bands as components/dupe-finder/dupe-result-card.tsx
                - identity, score over its rule, then what it costs - so the two
                surfaces that publish these numbers look like one site. The rows
                are deliberately NOT links: there is no per-dupe URL (picking a
                candidate is React state inside the finder, see this project's
                CLAUDE.md), so linking every row at the same href would be N
                identical links wearing an affordance none of them has. The one
                real route through is the section link above. */}
            <ol className="mt-6 flex flex-col gap-3">
              {dupes.map((dupe, index) => {
                const score = getPublishedSimilarity(reference, dupe);
                const verification = getVerificationBadge(reference, dupe);
                return (
                  <li
                    key={dupe.slug}
                    className="relative overflow-hidden rounded-frame border border-border bg-card py-4 pl-5 pr-4"
                  >
                    {/* Green seam: this row is a dupe-series item, the same way
                        the gold rules above describe the original. Non-text
                        mark, which is what -mark tokens are for. */}
                    <span
                      aria-hidden
                      className="absolute inset-y-0 left-0 w-[3px] bg-dupe-mark/60"
                    />

                    <div className="flex items-start gap-4">
                      <FragranceImage
                        fragrance={{
                          name: dupe.name,
                          brand: dupe.brand,
                          family: reference.family,
                          facets: dupe.facets,
                          imageUrl: dupe.imageUrl,
                        }}
                        className="h-12 w-12 shrink-0 text-sm"
                      />
                      <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <p className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="font-semibold tabular-nums text-foreground/70">
                            #{index + 1}
                          </span>
                          <span className="truncate">{dupe.brand}</span>
                        </p>
                        {/* Never truncated. The name is the only field a reader
                            needs in order to go and look the product up. */}
                        <p className="break-words font-display text-lg leading-tight">{dupe.name}</p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end leading-none">
                        <span className="font-display text-3xl tabular-nums lining-nums text-dupe">
                          {score}
                          <span className="align-top text-base">%</span>
                        </span>
                        <span className="mt-1 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                          match
                        </span>
                      </div>
                    </div>

                    <MatchRule score={score} delay={0.1 + index * 0.06} className="mt-4" />

                    <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
                      <span className="text-sm font-semibold tabular-nums">
                        {formatPricePerMl(dupe.priceUsd, dupe.bottleMl)}
                      </span>
                      <span className="text-sm text-muted-foreground tabular-nums">
                        ${dupe.priceUsd} / {dupe.bottleMl}ml
                      </span>
                      <VerificationBadge info={verification} compact className="ml-auto" />
                      {isHouseProduct(dupe) && <HouseBadge />}
                    </div>
                  </li>
                );
              })}
            </ol>
            <p className="mt-4 text-xs text-muted-foreground">
              Ordered by published match score, highest first.{" "}
              <Link
                href="/about#methodology"
                className="underline underline-offset-2 hover:text-primary"
              >
                How we calculate it
              </Link>
            </p>
          </>
        )}
      </section>

      {relatedOriginals.length > 0 && (
        <section className="mt-20 border-t border-border pt-12">
          <h2 className="font-display text-fluid-h3">Related originals</h2>
          <p className="mt-2 max-w-[60ch] text-sm leading-relaxed text-muted-foreground">
            Other fragrances in our catalog closest to {reference.name} by note overlap, facet
            profile, and olfactive family. Not a ranked list of dupes, just other originals
            worth knowing about if you like this one.
          </p>
          {/* No match rule on these figures, on purpose. A rule is the site's
              mark for a published dupe score, and this is a different
              calculation with a weaker claim behind it (see
              computeOriginalSimilarity). Giving both the same visual would say
              they are the same measure. */}
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {relatedOriginals.map((related) => (
              <li key={related.slug}>
                <Link
                  href={`/fragrance/${related.slug}`}
                  data-cursor="view"
                  className="group flex h-full items-center gap-3 rounded-frame border border-border bg-card p-4 transition-[border-color,background-color,transform] duration-150 ease-out hover:border-primary/45 hover:bg-secondary/25 active:scale-[0.99]"
                >
                  <FragranceImage fragrance={related} className="h-11 w-11 shrink-0 text-sm" />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="line-clamp-2 font-semibold transition-colors group-hover:text-primary">
                      {related.name}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {related.brand} &middot; {related.family}
                    </span>
                  </div>
                  <span className="shrink-0 font-display text-lg tabular-nums lining-nums text-muted-foreground">
                    {related.similarity}%
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {relatedGuides.length > 0 && (
        <section className="mt-20 border-t border-border pt-12">
          <h2 className="font-display text-fluid-h3">Related reading</h2>
          <p className="mt-2 max-w-[60ch] text-sm text-muted-foreground">
            Guides that mention {reference.name}.
          </p>
          <ul className="mt-6 flex flex-col gap-3">
            {relatedGuides.map((guide) => (
              <li key={guide.slug}>
                <Link
                  href={`/guide/${guide.slug}`}
                  data-cursor="view"
                  className="group flex items-center justify-between gap-4 rounded-frame border border-border bg-card p-4 transition-[border-color,background-color] duration-150 ease-out hover:border-primary/45 hover:bg-secondary/25"
                >
                  <span className="font-display text-lg leading-tight transition-colors group-hover:text-primary">
                    {guide.title}
                  </span>
                  <ArrowUpRight
                    className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary"
                    aria-hidden
                  />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="mt-20 border-t border-border pt-6 text-sm leading-relaxed text-muted-foreground">
        {reference.name} and {reference.brand} are trade marks of their owner. Counterscent is not
        affiliated with or endorsed by them; we name the fragrance in order to compare it. See{" "}
        <Link href="/about#methodology" className="underline underline-offset-4">
          our standards
        </Link>{" "}
        for how every score on this site is calculated.
      </p>
    </div>
  );
}
