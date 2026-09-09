import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { JsonLd } from "@/components/kit/JsonLd";
import { getShopOriginals, getShopOriginalsByBrand } from "@/lib/catalog";
import { CJ_MERCHANT } from "@/lib/data/cj-offers.generated";
import { PM_MERCHANT } from "@/lib/data/pm-offers.generated";
import { hasRealAffiliateLink } from "@/lib/affiliate-links";
import { itemListSchema } from "@/lib/jsonld";
import { formatPricePerMl } from "@/lib/similarity";
import { absoluteUrl } from "@/lib/site";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

/**
 * Where to buy the originals — the buy-link surface for expensive genuine
 * designer fragrances at FragranceShop.com.
 *
 * WHAT THIS PAGE IS NOT, AND WHY THAT MATTERS
 * -------------------------------------------
 * It is not part of the comparison catalogue and must never grow into a
 * lookalike of it. `/fragrance` lists originals we have RESEARCHED — note
 * pyramid, facet profile, olfactive family, all hand-authored, all feeding a
 * published similarity formula. This page lists originals we can LINK TO, and
 * the merchant feed behind it carries no note data whatsoever (its DESCRIPTION
 * column is byte-identical to TITLE on all 5,802 rows).
 *
 * So every card here shows only things the merchant actually stated: name,
 * house, concentration, bottle size, price, photograph. There is no match
 * score, no note pyramid and no "closest dupe" — inventing any of that for a
 * real, named product is the exact failure this project has already had to
 * undo once (see lib/dupes-data.ts and lib/reviews.ts).
 *
 * Where a product IS in our catalogue, the card links to its comparison page
 * instead of straight out to the shop, so a reader who can get the full
 * analysis always gets it.
 *
 * Scope is the founder's, 2026-09-07: EDP and Parfum only - never EDT or EDC -
 * and over $100. Testers, gift sets and each merchant's own private-label line
 * are excluded upstream, in scripts/ingest-cj-feed.mjs and
 * scripts/ingest-perfumania.mjs respectively.
 *
 * TWO RETAILERS SUPPLY THIS PAGE since 2026-09-09, so every card names its own
 * shop. Perfumania is additionally restricted to houses our reference catalogue
 * already covers: its catalogue runs to 4,380 products and includes obscure
 * private-label brands we cannot tell from small real perfumers without
 * research we have not done, and this page calls its contents genuine designer
 * fragrances. That merchant DOES publish note tags, and they are deliberately
 * unused - against the 90 fragrances where we hold a researched pyramid and it
 * publishes one, the two agree on only 0.57 of the materials named.
 */

function slugifyBrand(brand: string): string {
  return brand
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const products = getShopOriginals();
const withComparison = products.filter((p) => p.referenceSlug).length;

export const metadata: Metadata = {
  title: "Where to Buy the Originals",
  description: `${products.length} genuine designer fragrances — eau de parfum and parfum, over $100 — with the retailer's own current price for each. ${withComparison} of them also have a full note-by-note comparison on this site.`,
  alternates: { canonical: "/originals" },
};

export default function OriginalsPage() {
  const groups = getShopOriginalsByBrand();

  const itemList = itemListSchema(
    products.map((p, i) => ({
      name: `${p.name} by ${p.brand}`,
      url: p.referenceSlug
        ? absoluteUrl(`/fragrance/${p.referenceSlug}`)
        : absoluteUrl("/originals"),
      position: i + 1,
    }))
  );

  return (
    <div className="container py-14 sm:py-16">
      <JsonLd data={itemList} />

      <div className="mb-10 flex flex-col gap-4">
        <h1 className="font-display text-fluid-h1">Where to Buy the Originals</h1>
        <p className="max-w-[62ch] text-lg text-muted-foreground">
          {products.length} genuine designer fragrances stocked at {CJ_MERCHANT.name} and{" "}
          {PM_MERCHANT.name} &mdash; eau de parfum and parfum only, over $100 &mdash; each
          with its own shop&rsquo;s listed price.{" "}
          <strong className="font-semibold text-foreground">
            {withComparison} of them also have a full comparison here
          </strong>
          ; those cards link to it instead of straight to the shop.
        </p>
        {/* The honesty line this page needs most: a reader arriving from a
            comparison page will expect the same depth, and it is not here. */}
        <p className="max-w-[62ch] text-sm text-muted-foreground">
          The rest are listed for price and availability only. We have not analysed them
          &mdash; there is no note pyramid, profile or match score for a fragrance we
          have not researched, and we would rather say so than publish one we invented.
          Everything on this page is what the retailer states about its own stock.{" "}
          <Link href="/fragrance" className="text-primary underline underline-offset-4">
            Browse the researched catalog
          </Link>{" "}
          for the comparisons.
        </p>
      </div>

      <nav aria-label="Jump to a house" className="mb-10 flex flex-wrap gap-2">
        {groups.map((group) => (
          <a
            key={group.brand}
            href={`#${slugifyBrand(group.brand)}`}
            className="rounded-full border border-border px-3.5 py-1.5 text-sm font-semibold text-foreground/75 transition-colors duration-150 hover:border-primary/50 hover:text-foreground"
          >
            {group.brand}
            <span className="ml-1.5 text-xs text-muted-foreground">{group.products.length}</span>
          </a>
        ))}
      </nav>

      <div className="flex flex-col gap-14">
        {groups.map((group) => (
          <section key={group.brand} id={slugifyBrand(group.brand)} className="scroll-mt-24">
            <h2 className="font-display text-2xl">
              {group.brand}
              <span className="ml-2 text-base font-normal text-muted-foreground">
                {group.products.length}
              </span>
            </h2>
            <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {group.products.map((product) => {
                const linked = hasRealAffiliateLink(product.affiliateLinkId);
                return (
                  <li
                    key={`${product.merchantName}-${product.slug}`}
                    className="flex flex-col gap-3 rounded-frame border border-border bg-card p-4"
                  >
                    <div className="flex items-start gap-3">
                      {product.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={product.imageUrl}
                          alt={`${product.name} by ${product.brand}`}
                          loading="lazy"
                          className="h-14 w-14 shrink-0 rounded-[0.375rem] object-cover"
                        />
                      ) : (
                        <span
                          aria-hidden
                          className="h-14 w-14 shrink-0 rounded-[0.375rem] bg-muted"
                        />
                      )}
                      <div className="flex min-w-0 flex-col">
                        <span className="line-clamp-2 font-semibold">{product.name}</span>
                        <span className="truncate text-xs text-muted-foreground">
                          {product.concentration}
                          {product.bottleMl ? ` · ${product.bottleMl}ml` : ""}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-baseline gap-2">
                      <span className="font-display text-lg tabular-nums">
                        ${product.priceUsd}
                      </span>
                      {product.bottleMl && (
                        <span className="text-xs text-muted-foreground">
                          {formatPricePerMl(product.priceUsd, product.bottleMl)}
                        </span>
                      )}
                    </div>

                    <div className="mt-auto flex flex-col gap-2">
                      {product.referenceSlug && (
                        <Link
                          href={`/fragrance/${product.referenceSlug}`}
                          className="text-sm font-semibold text-primary underline-offset-4 hover:underline"
                        >
                          See the full comparison &rarr;
                        </Link>
                      )}
                      {linked && (
                        <a
                          href={`/go/${product.affiliateLinkId}`}
                          rel="sponsored nofollow noopener"
                          target="_blank"
                          className={cn(
                            buttonVariants({
                              variant: product.referenceSlug ? "outline" : "default",
                              size: "sm",
                            }),
                            "w-fit gap-1.5"
                          )}
                        >
                          Buy at {product.merchantName}
                          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                        </a>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>

      <div className="mt-14 flex flex-col gap-3 border-t border-border pt-6 text-sm text-muted-foreground">
        <p>
          The buy buttons are affiliate links: we may earn a commission if you use one. That
          does not affect any match score on this site, which is computed from notes and
          facets alone.
        </p>
        <p>
          Prices are {CJ_MERCHANT.name}&rsquo;s own and were current when their product feed
          was published &mdash; check the shop for what it costs today. Every name above is a
          trade mark of its own owner; we name each fragrance in order to list it.
        </p>
      </div>
    </div>
  );
}
