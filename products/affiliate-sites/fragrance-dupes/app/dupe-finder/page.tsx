import type { Metadata } from "next";
import Link from "next/link";
import { DupeFinderWithQuery } from "@/components/dupe-finder/dupe-finder-query";
import { REFERENCES } from "@/lib/dupes-data";
import { getReferencesByBrand } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Dupe Finder",
  description:
    "Pick a designer fragrance and see ranked dupe candidates with a visual note comparison, a grouped spec panel, and an honest verdict.",
  alternates: { canonical: "/dupe-finder" },
};

export default function DupeFinderPage() {
  return (
    <div className="container py-14 sm:py-16">
      <div className="mb-10 flex flex-col gap-4">
        <h1 className="max-w-[20ch] font-display text-fluid-h1">The Dupe Finder</h1>
        <p className="max-w-[62ch] text-lg text-muted-foreground">
          Pick a fragrance you already know. We rank every candidate we have
          data on, from a formula we publish, then show you exactly where
          each one matches and where it doesn&apos;t.
        </p>
      </div>

      <DupeFinderWithQuery />

      <BrowseAllFragrances />
    </div>
  );
}

/**
 * A plain, server-rendered index of every fragrance, grouped by house.
 *
 * The Dupe Finder above is entirely client state, so nothing inside it is a
 * link a crawler can follow. Listing every reference in the sitemap gets those
 * 68 pages discovered; linking to them from a real page is what makes them
 * look like part of the site rather than orphans, and it is also genuinely
 * useful to a visitor who would rather scan a list than operate a widget.
 */
function BrowseAllFragrances() {
  const byBrand = getReferencesByBrand();

  return (
    <section className="mt-20 border-t border-border pt-12">
      <h2 className="font-display text-2xl">Browse every fragrance</h2>
      <p className="mt-2 max-w-[62ch] text-muted-foreground">
        All {REFERENCES.length} originals in our catalog, by house. Each has its own page with
        the full note pyramid, profile, and any alternatives listed against it.
      </p>

      <div className="mt-8 flex flex-col gap-8">
        {byBrand.map(({ brand, references }) => (
          <div key={brand}>
            <h3 className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
              {brand}
            </h3>
            <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
              {references.map((reference) => (
                <li key={reference.slug}>
                  <Link
                    href={`/fragrance/${reference.slug}`}
                    className="text-sm underline-offset-4 hover:text-primary hover:underline"
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
