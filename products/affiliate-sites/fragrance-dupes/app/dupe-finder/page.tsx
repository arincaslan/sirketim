import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { DupeFinderWithQuery } from "@/components/dupe-finder/dupe-finder-query";
import { FragranceImage } from "@/components/fragrance/fragrance-image";
import { REFERENCES } from "@/lib/dupes-data";
import { getListingCounts, getReferencesByBrand } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Dupe Finder",
  description:
    "Pick a designer fragrance and see ranked dupe candidates with a visual note comparison, a grouped spec panel, and an honest verdict.",
  alternates: { canonical: "/dupe-finder" },
};

export default function DupeFinderPage() {
  const counts = getListingCounts();
  const covered = counts.size;
  const listings = [...counts.values()].reduce((sum, n) => sum + n, 0);
  const houses = getReferencesByBrand().length;

  return (
    <div className="container py-14 sm:py-16">
      {/* Masthead. Left-aligned and type-led rather than a centred title block,
          and the three figures below it are a dateline of record, not a stat
          row: they are the scope of the thing you are about to operate, and a
          reader who learns here that most of the catalogue has no alternative
          does not have to discover it one empty result at a time. Every figure
          is counted off our own data at build time. */}
      <header className="flex flex-col gap-5">
        <h1 className="max-w-[16ch] text-balance font-display text-fluid-h1">The Dupe Finder</h1>
        <p className="max-w-[58ch] text-lg leading-relaxed text-muted-foreground">
          Pick a fragrance you already know. We rank every candidate we have
          data on, from a formula we publish, then show you exactly where
          each one matches and where it doesn&apos;t.
        </p>
      </header>

      <dl className="mt-10 grid grid-cols-2 border-y border-border sm:grid-cols-4">
        <ScopeFigure value={REFERENCES.length} label="originals researched" />
        <ScopeFigure value={covered} label="with an alternative" />
        <ScopeFigure value={listings} label="listings ranked" />
        <ScopeFigure value={houses} label="fragrance houses" />
      </dl>

      <div className="mt-12">
        <DupeFinderWithQuery />
      </div>

      <BrowseAllFragrances counts={counts} />
    </div>
  );
}

/**
 * One figure in the masthead rail. The numeral takes the display serif at a
 * size the label cannot compete with, so the rail reads at a glance and the
 * words are there for whoever wants them. One rail, hairline top and bottom,
 * rather than a border under every row.
 */
function ScopeFigure({ value, label }: { value: number; label: string }) {
  return (
    // flex-col-reverse so the numeral reads above its label while the markup
    // keeps the term-then-definition order a <dl> requires.
    <div className="flex flex-col-reverse gap-1 border-border px-1 py-5 sm:border-l sm:px-6 sm:first:border-l-0 sm:first:pl-0">
      <dt className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{label}</dt>
      <dd className="font-display text-3xl leading-none tabular-nums lining-nums sm:text-4xl">{value}</dd>
    </div>
  );
}

/**
 * A server-rendered index of every fragrance, split by whether we can actually
 * compare it.
 *
 * The Dupe Finder above is entirely client state, so nothing inside it is a
 * link a crawler can follow. Listing every reference in the sitemap gets those
 * pages discovered; linking to them from a real page is what makes them look
 * like part of the site rather than orphans, and it is also genuinely useful to
 * a visitor who would rather scan a list than operate a widget.
 *
 * REBUILT 2026-09-18. It was one flat wrap of every name under a house
 * heading, which meant the page's own subject was invisible in it: the tool
 * above can only compare the minority of originals that have a listing, and
 * nothing in a wall of identical links told you which ones those were. So the
 * covered originals are now cards carrying their listing count, and the rest
 * flow as a proper multi-column index under their houses instead of forty
 * stacked rows.
 *
 * EVERY reference still renders exactly one link here. That is deliberate and
 * is the constraint this rebuild was designed around: dropping a hundred and
 * fifty internal links off this page to tidy it up would be an SEO change
 * wearing a styling change's clothes, on the surface that carries most of this
 * site's search value.
 */
function BrowseAllFragrances({ counts }: { counts: Map<string, number> }) {
  const groups = getReferencesByBrand();
  const withListings = REFERENCES.filter((r) => (counts.get(r.slug) ?? 0) > 0).sort((a, b) => {
    const diff = (counts.get(b.slug) ?? 0) - (counts.get(a.slug) ?? 0);
    return diff !== 0 ? diff : a.name.localeCompare(b.name);
  });

  const remaining = groups
    .map((group) => ({
      brand: group.brand,
      references: group.references.filter((r) => (counts.get(r.slug) ?? 0) === 0),
    }))
    .filter((group) => group.references.length > 0);

  return (
    <section className="mt-24">
      <div className="flex flex-col gap-3 border-t border-border pt-12">
        <h2 className="font-display text-fluid-h3">Originals we can compare</h2>
        <p className="max-w-[62ch] text-muted-foreground">
          The {withListings.length} fragrances with at least one alternative listed against them.
          Dupe houses clone bestsellers, so this is a small slice of the catalogue and always
          will be. The figure on each card is how many alternatives it carries.
        </p>
      </div>

      <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {withListings.map((reference) => {
          const count = counts.get(reference.slug) ?? 0;
          return (
            <li key={reference.slug}>
              <Link
                href={`/fragrance/${reference.slug}`}
                data-cursor="view"
                className="group flex h-full items-center gap-3 rounded-frame border border-border bg-card p-3.5 transition-[border-color,background-color,transform] duration-150 ease-out hover:border-primary/45 hover:bg-secondary/25 active:scale-[0.99]"
              >
                <FragranceImage fragrance={reference} className="h-10 w-10 shrink-0 text-sm" />
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm font-semibold transition-colors group-hover:text-primary">
                    {reference.name}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">{reference.brand}</span>
                </span>
                <span className="shrink-0 font-display text-lg tabular-nums lining-nums text-foreground/60">
                  {count}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="mt-20 flex flex-col gap-3 border-t border-border pt-12">
        <h2 className="font-display text-fluid-h3">The rest of the catalogue</h2>
        <p className="max-w-[62ch] text-muted-foreground">
          The other {REFERENCES.length - withListings.length} originals we have researched. Each
          has its own page with the full note pyramid, profile and price per ml. Nothing is listed
          against them yet, which is the normal case rather than a gap we are hiding.
        </p>
        <Link
          href="/fragrance/"
          className="inline-flex w-fit items-center gap-1.5 py-1 text-sm font-semibold text-primary underline-offset-4 hover:underline"
        >
          Browse the full catalogue by house
          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </div>

      {/* CSS columns rather than a stack: forty house blocks down a single
          column is the wall this section used to be. Flowing them into three
          keeps the grouping and quarters the scroll. break-inside-avoid stops
          a house's name being orphaned from its fragrances at a column edge. */}
      <div className="mt-8 gap-x-10 sm:columns-2 lg:columns-3">
        {remaining.map(({ brand, references }) => (
          <div key={brand} className="mb-7 break-inside-avoid">
            <h3 className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{brand}</h3>
            <ul className="mt-1 flex flex-col">
              {references.map((reference) => (
                <li key={reference.slug}>
                  <Link
                    href={`/fragrance/${reference.slug}`}
                    className="block py-1 text-sm text-foreground/80 underline-offset-4 transition-colors hover:text-primary hover:underline"
                  >
                    {reference.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
