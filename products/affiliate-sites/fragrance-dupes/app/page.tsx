import type { Metadata } from "next";
import { Hero } from "@/components/home/hero";
import { ChapterTrend } from "@/components/home/chapter-trend";
import { ChapterGap } from "@/components/home/chapter-gap";
import { ChapterFormula } from "@/components/home/chapter-formula";
import { ChapterTryIt } from "@/components/home/chapter-try-it";
import { ChapterStandards } from "@/components/home/chapter-standards";
import { LibraryProof } from "@/components/home/library-proof";
import { NewArrivals, type NewArrival } from "@/components/home/new-arrivals";
import { RetailerBand } from "@/components/home/retailer-band";
import { ProducerCta } from "@/components/home/producer-cta";
import { getPublishedSimilarity, getRecentlyAddedListings } from "@/lib/catalog";
import { formatListingDate } from "@/lib/listing-dates";
import { formatPricePerMl } from "@/lib/similarity";

/**
 * The homepage was the only route on the site with no metadata of its own, so
 * it fell back to the layout's default title - which is fine as a title, but
 * meant no page-specific description, canonical, or OpenGraph entry for the
 * one URL most likely to be linked to.
 */
export const metadata: Metadata = {
  // `title.default` from the layout already reads correctly for the homepage,
  // so it is deliberately not overridden here - setting it would push it
  // through the "%s | Counterscent" template and repeat the brand twice.
  description:
    "Compare designer fragrances against their closest alternatives on notes, longevity, sillage and price per ml - scored by one published formula, applied the same way to every bottle.",
  alternates: { canonical: "/" },
};
import { getAllContent } from "@/content/loader";

/**
 * The homepage: a six-chapter scroll narrative (Hero, Trend, Gap, Formula,
 * Try It, Standards) closing on a compact library-proof strip. See
 * DESIGN.md's Implementation addendum v2 for the full redesign rationale -
 * this replaced a conventional stacked-sections landing page with the same
 * design tokens but a much flatter, more generic rhythm.
 */
/**
 * The five newest listings, flattened here rather than in the component.
 *
 * NewArrivals is a client component (it runs a timer and reads
 * prefers-reduced-motion), and everything crossing that boundary is
 * serialised into the HTML. Passing whole DupeCandidate and ReferenceFragrance
 * objects would ship each listing's full note pyramid, verdict prose and offer
 * array to every visitor for five cards that render a name, a price and a
 * number. Flattening keeps the payload to what is drawn.
 *
 * The score comes from getPublishedSimilarity, the same function the Dupe
 * Finder and every comparison page use, so a listing cannot show one number
 * here and another there.
 */
function newestArrivals(limit = 5, maxPerProducer = 2): NewArrival[] {
  // AT MOST TWO PER PRODUCER, and this is not a nicety.
  //
  // The catalogue arrived in four large single-merchant batches, so a plain
  // "newest five" is five AromaPassions listings - verified, that is exactly
  // what it returns today. A strip of five products from one company on the
  // home page reads as a brand feature no matter what the heading says, and
  // the site's position is that it sells no placement. Getting there by
  // accident is no better than selling it.
  //
  // It matters more, not less, once producers submit individually: a
  // subscriber who files ten fragrances in an afternoon would otherwise own
  // the whole strip until someone else published. The cap makes that
  // impossible without anyone having to notice it happening.
  //
  // The extra rows come from further back in time, so the rule stays "newest,
  // spread across producers" rather than becoming a ranking of any kind.
  const seen = new Map<string, number>();
  const picked = [];
  for (const entry of getRecentlyAddedListings(Number.MAX_SAFE_INTEGER)) {
    const used = seen.get(entry.dupe.producerSlug) ?? 0;
    if (used >= maxPerProducer) continue;
    seen.set(entry.dupe.producerSlug, used + 1);
    picked.push(entry);
    if (picked.length === limit) break;
  }

  return picked.map(({ dupe, reference, firstLive }) => ({
    slug: dupe.slug,
    name: dupe.name,
    brand: dupe.brand,
    family: dupe.family,
    imageUrl: dupe.imageUrl,
    facets: dupe.facets,
    pricePerMl: formatPricePerMl(dupe.priceUsd, dupe.bottleMl),
    score: getPublishedSimilarity(reference, dupe),
    referenceSlug: reference.slug,
    referenceName: reference.name,
    referenceBrand: reference.brand,
    firstLive,
    firstLiveLabel: formatListingDate(firstLive),
  }));
}

export default function HomePage() {
  const allContent = getAllContent();
  const latest = allContent.slice(0, 3);

  return (
    <>
      <Hero />
      <ChapterTrend />
      <ChapterGap />
      <ChapterFormula />
      <ChapterTryIt />
      {/* Placed after the reader has seen how the tool works and before the
          standards chapter, so "here is what is newest" lands while the
          catalogue is the subject. It renders nothing at all when no listing
          carries a recorded date - see NewArrivals. */}
      <NewArrivals arrivals={newestArrivals(5)} />
      <ChapterStandards />
      <LibraryProof pieces={latest} />
      <RetailerBand />
      <ProducerCta />
    </>
  );
}
