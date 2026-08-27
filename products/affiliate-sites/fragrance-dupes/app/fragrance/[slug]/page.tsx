import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { JsonLd } from "@/components/kit/JsonLd";
import { FragranceImage } from "@/components/fragrance/fragrance-image";
import { buttonVariants } from "@/components/ui/button";
import { REFERENCES } from "@/lib/data/references";
import { getRankedDupesFor, getPublishedSimilarity } from "@/lib/catalog";
import { hasRealAffiliateLink } from "@/lib/affiliate-links";
import { formatPricePerMl } from "@/lib/similarity";
import { siteUrl } from "@/lib/site";
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
      url: `${siteUrl()}${path}`,
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default function FragrancePage({ params }: { params: { slug: string } }) {
  const reference = findReference(params.slug);
  if (!reference) notFound();

  const dupes = getRankedDupesFor(reference);
  const [minHours, maxHours] = reference.longevityHoursRange;
  const path = `/fragrance/${reference.slug}`;

  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl() },
      { "@type": "ListItem", position: 2, name: "Dupe Finder", item: `${siteUrl()}/dupe-finder` },
      { "@type": "ListItem", position: 3, name: reference.name, item: `${siteUrl()}${path}` },
    ],
  };

  return (
    <div className="container max-w-4xl py-14 sm:py-16">
      <JsonLd data={breadcrumbs} />

      <nav aria-label="Breadcrumb" className="mb-8 text-sm text-muted-foreground">
        <Link href="/dupe-finder" className="underline-offset-4 hover:underline">
          Dupe Finder
        </Link>
        <span aria-hidden> / </span>
        <span className="text-foreground">{reference.name}</span>
      </nav>

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
        <h2 className="font-display text-2xl">Alternatives</h2>
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
