import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { JsonLd } from "@/components/kit/JsonLd";
import { Breadcrumb } from "@/components/kit/Breadcrumb";
import { FragranceImage } from "@/components/fragrance/fragrance-image";
import { buttonVariants } from "@/components/ui/button";
import { REFERENCES } from "@/lib/data/references";
import { getRankedDupesFor, getPublishedSimilarity, getRelatedOriginals } from "@/lib/catalog";
import { getGuidesLinkingTo } from "@/lib/related-guides";
import { hasRealAffiliateLink } from "@/lib/affiliate-links";
import { formatPricePerMl } from "@/lib/similarity";
import { breadcrumbSchema } from "@/lib/jsonld";
import { absoluteUrl } from "@/lib/site";
import { cn } from "@/lib/utils";
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

export default function FragrancePage({ params }: { params: { slug: string } }) {
  const reference = findReference(params.slug);
  if (!reference) notFound();

  const dupes = getRankedDupesFor(reference);
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
    <div className="container max-w-4xl py-14 sm:py-16">
      <JsonLd
        data={breadcrumbSchema(breadcrumbItems.map((i) => ({ name: i.name, url: absoluteUrl(i.path) })))}
      />

      <Breadcrumb items={breadcrumbItems} />

      <header className="flex flex-col gap-8 sm:flex-row sm:items-start">
        <FragranceImage fragrance={reference} className="h-32 w-32 shrink-0" />
        <div className="flex flex-col gap-3">
          <p className="text-sm uppercase tracking-[0.14em] text-muted-foreground">
            {reference.brand}
          </p>
          <h1 className="font-display text-fluid-h1">{reference.name}</h1>
          <p className="max-w-[58ch] text-lg text-muted-foreground">
            {reference.concentration} in the {reference.family.toLowerCase()} family.{" "}
            {formatPricePerMl(reference.priceUsd, reference.bottleMl)} at $
            {reference.priceUsd} for {reference.bottleMl}ml.
          </p>
          <p className="max-w-[58ch] text-xs text-muted-foreground">
            That price is an approximate US retail figure we maintain by hand, not a
            live feed from a retailer &mdash; it drifts, and the per-ml figure is
            derived from it. Check the retailer for what it costs today.
          </p>

          {hasRealAffiliateLink(reference.affiliateLinkId) && (
            <a
              href={`/go/${reference.affiliateLinkId}`}
              rel="sponsored nofollow noopener"
              target="_blank"
              className={cn(buttonVariants({ variant: "default" }), "mt-2 w-fit gap-2")}
            >
              Buy {reference.name}
              <ArrowUpRight className="h-4 w-4" aria-hidden />
            </a>
          )}
        </div>
      </header>

      <section className="mt-14">
        <h2 className="font-display text-2xl">The note pyramid</h2>
        <dl className="mt-5 grid gap-px overflow-hidden rounded-frame border border-border bg-border sm:grid-cols-3">
          {(
            [
              ["Top", reference.notes.top],
              ["Heart", reference.notes.heart],
              ["Base", reference.notes.base],
            ] as const
          ).map(([layer, notes]) => (
            <div key={layer} className="bg-background p-5">
              <dt className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                {layer}
              </dt>
              <dd className="mt-2 text-base">{notes.join(", ")}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-xs text-muted-foreground">
          Base notes carry the most weight in our match score, at 45% of note overlap, because
          that is the part still on skin at the end of a day.
        </p>
      </section>

      <section className="mt-14">
        <h2 className="font-display text-2xl">Profile</h2>
        <dl className="mt-5 flex flex-col gap-4">
          {FACET_LABELS.map(([key, label]) => {
            const value = reference.facets[key];
            return (
              <div key={key} className="flex items-center gap-4">
                <dt className="w-32 shrink-0 text-sm text-muted-foreground">{label}</dt>
                <dd className="flex flex-1 items-center gap-3">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${(value / 10) * 100}%` }}
                    />
                  </div>
                  <span className="w-8 shrink-0 text-right text-sm tabular-nums">{value}</span>
                </dd>
              </div>
            );
          })}
        </dl>
        <div className="mt-6 flex flex-wrap gap-x-8 gap-y-2 text-sm text-muted-foreground">
          <p>
            Longevity: {minHours}&ndash;{maxHours} hours
          </p>
          <p>Sillage: {reference.sillageLabel}</p>
        </div>
      </section>

      <section className="mt-14">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
          <h2 className="font-display text-2xl">Alternatives</h2>
          <Link
            href={`/dupe-finder?ref=${reference.slug}`}
            className="text-sm font-semibold text-primary underline-offset-4 hover:underline"
          >
            Compare in the Dupe Finder &rarr;
          </Link>
        </div>
        {dupes.length === 0 ? (
          <div className="mt-5 rounded-frame border border-dashed border-border p-8">
            <p className="max-w-[60ch] text-muted-foreground">
              Nothing is listed against {reference.name} yet. We only publish an alternative
              once we have its real specification from the producer, scored by the same
              formula as everything else on this site &mdash; so this space stays empty rather
              than filled with guesses.
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              Make a fragrance you think belongs here?{" "}
              <Link href="/producers" className="text-primary underline underline-offset-4">
                List it with us
              </Link>
              .
            </p>
          </div>
        ) : (
          <ul className="mt-5 flex flex-col gap-3">
            {dupes.map((dupe) => (
              <li
                key={dupe.slug}
                className="flex flex-wrap items-center justify-between gap-4 rounded-frame border border-border p-5"
              >
                <div>
                  <p className="font-semibold">
                    {dupe.name} <span className="text-muted-foreground">by {dupe.brand}</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    ${dupe.priceUsd} / {dupe.bottleMl}ml &middot;{" "}
                    {formatPricePerMl(dupe.priceUsd, dupe.bottleMl)}
                  </p>
                </div>
                <p className="font-display text-2xl tabular-nums">
                  {getPublishedSimilarity(reference, dupe)}%
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {relatedOriginals.length > 0 && (
        <section className="mt-14">
          <h2 className="font-display text-2xl">Related originals</h2>
          <p className="mt-2 max-w-[60ch] text-sm text-muted-foreground">
            Other fragrances in our catalog closest to {reference.name} by note overlap, facet
            profile, and olfactive family &mdash; not a ranked list of dupes, just other originals
            worth knowing about if you like this one.
          </p>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {relatedOriginals.map((related) => (
              <li key={related.slug}>
                <Link
                  href={`/fragrance/${related.slug}`}
                  data-cursor="view"
                  className="group flex items-center gap-3 rounded-frame border border-border bg-card p-4 transition-[border-color,transform] duration-150 ease-out hover:border-primary/50 active:scale-[0.99]"
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
                  <span className="shrink-0 font-display text-lg tabular-nums text-muted-foreground">
                    {related.similarity}%
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {relatedGuides.length > 0 && (
        <section className="mt-14">
          <h2 className="font-display text-2xl">Related reading</h2>
          <p className="mt-2 max-w-[60ch] text-sm text-muted-foreground">
            Guides that mention {reference.name}.
          </p>
          <ul className="mt-5 flex flex-col gap-3">
            {relatedGuides.map((guide) => (
              <li key={guide.slug}>
                <Link
                  href={`/guide/${guide.slug}`}
                  className="flex items-center justify-between gap-4 rounded-frame border border-border p-4 transition-colors duration-150 hover:border-primary/50"
                >
                  <span className="font-semibold">{guide.title}</span>
                  <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="mt-14 border-t border-border pt-6 text-sm text-muted-foreground">
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
