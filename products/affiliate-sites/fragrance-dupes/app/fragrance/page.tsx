import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/kit/JsonLd";
import { FragranceImage } from "@/components/fragrance/fragrance-image";
import { REFERENCES } from "@/lib/data/references";
import { getReferencesByBrand } from "@/lib/catalog";
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
          <Link href="/dupe-finder" className="text-primary underline underline-offset-4">
            Go straight to the Dupe Finder
          </Link>
          .
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
