import { CJ_IMAGES } from "@/lib/data/cj-images.generated";
import { CJ_MERCHANT, CJ_OFFERS } from "@/lib/data/cj-offers.generated";
import { PM_MERCHANT, PM_OFFERS } from "@/lib/data/pm-offers.generated";
import { PM_SHOP_ORIGINALS } from "@/lib/data/pm-shop.generated";
import { PM_IMAGES } from "@/lib/data/pm-images.generated";
import { PM_SHOP_IMAGES } from "@/lib/data/pm-shop-images.generated";
import { SHOP_IMAGES } from "@/lib/data/cj-shop-images.generated";
import { SHOP_ORIGINALS, type ShopOriginal } from "@/lib/data/cj-shop.generated";
import { DUPES, REFERENCES } from "@/lib/dupes-data";
import { hasRealAffiliateLink } from "@/lib/affiliate-links";
import { isHouseProducer } from "@/lib/producers";
import { computeSimilarity, getRelatedReferences } from "@/lib/similarity";
import { datedCount, listingFirstLive } from "@/lib/listing-dates";
import { getPreCeilingScore, getPublishedScore, isVerbatimCopy } from "@/lib/verification";
import type { DupeCandidate, ReferenceFragrance } from "@/lib/types";

/**
 * Browse/search helpers for the marketplace comparison surface
 * (MARKETPLACE-PLAN.md §2). The original Dupe Finder rendered all six
 * reference fragrances as a flat six-column grid, which works only at exactly
 * that size - with producers submitting listings the catalog grows past what
 * any flat grid can show, so picking a reference becomes a search-and-browse
 * problem rather than a row of buttons.
 *
 * Everything here is pure and synchronous over the static fixture arrays. It
 * is deliberately shaped like a query layer so that swapping the fixtures for
 * real database reads later (MARKETPLACE-PLAN.md §3) is a change of
 * implementation, not of call sites.
 */

export interface BrandGroup {
  brand: string;
  references: ReferenceFragrance[];
}

/** Reference fragrances grouped by the house that makes the original, brand
 *  A-Z, and alphabetical within each brand. */
export function getReferencesByBrand(references: ReferenceFragrance[] = REFERENCES): BrandGroup[] {
  const byBrand = new Map<string, ReferenceFragrance[]>();
  for (const ref of references) {
    const existing = byBrand.get(ref.brand);
    if (existing) existing.push(ref);
    else byBrand.set(ref.brand, [ref]);
  }
  return [...byBrand.entries()]
    .map(([brand, refs]) => ({
      brand,
      references: [...refs].sort((a, b) => a.name.localeCompare(b.name)),
    }))
    .sort((a, b) => a.brand.localeCompare(b.brand));
}

/** Every distinct olfactive family present in the reference set, A-Z. */
export function getFamilies(references: ReferenceFragrance[] = REFERENCES): string[] {
  return [...new Set(references.map((r) => r.family))].sort((a, b) => a.localeCompare(b));
}

/**
 * Free-text search over reference fragrances. Matches name, brand, family, and
 * individual notes, so "vanilla" or "woody" find something even when the user
 * does not know a fragrance by name. Empty query returns everything.
 */
export function searchReferences(
  query: string,
  references: ReferenceFragrance[] = REFERENCES
): ReferenceFragrance[] {
  const q = query.trim().toLowerCase();
  if (!q) return references;

  return references.filter((ref) => {
    const haystack = [
      ref.name,
      ref.brand,
      ref.family,
      ...ref.notes.top,
      ...ref.notes.heart,
      ...ref.notes.base,
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
}

/**
 * Dupes for one reference, ranked by similarity, highest first.
 *
 * House products are ranked by exactly the same formula as every producer's
 * listing and are NOT floated to the top - a site that sells its own bottle
 * inside a comparison it calls independent cannot also quietly weight itself
 * first. Ties break toward the cheaper price per ml, not toward us.
 *
 * House listings are additionally barred from publishing above the unverified
 * score cap, however their status field reads - we grant "verified", so we
 * cannot grant it to ourselves. See getPublishedScore.
 *
 * A listing whose declared notes and facets are a verbatim copy of the
 * reference's (lib/verification.ts's isVerbatimCopy) never appears here at
 * all - that is the specific abuse pattern the anti-copy-cheat standard
 * exists to catch, and it is a publish gate, not a rank penalty.
 *
 * Ranking sorts on the PUBLISHED score first and the pre-ceiling score second.
 * The published key stops the list ever showing a higher-ranked listing at a
 * lower percentage than the one beneath it; the second key keeps order
 * meaningful among the listings that display the same capped number.
 *
 * That second key is getPreCeilingScore, NOT the bare formula output: it
 * carries the imputed-pyramid penalty, so a listing whose tier split we
 * invented cannot break a tie against an honestly-tiered one purely because
 * our own split happened to maximise its overlap. See lib/verification.ts.
 */
export function getRankedDupesFor(reference: ReferenceFragrance): DupeCandidate[] {
  return DUPES.filter((d) => d.referenceSlug === reference.slug && !isVerbatimCopy(reference, d))
    .map((dupe) => {
      const rawScore = computeSimilarity(reference, dupe);
      return {
        dupe,
        published: getPublishedScore(rawScore, dupe),
        raw: getPreCeilingScore(rawScore, dupe),
      };
    })
    .sort((a, b) => {
      // Published score first, so the list can never show #1 at a LOWER
      // percentage than #2. That inversion is reachable: two listings can have
      // the same raw score while only one of them is allowed past the cap, and
      // it read worst in exactly the case that matters - our own bottle at #1
      // showing 90% above a third party's 92%, which looks like the ranking is
      // hiding something. Found by probe listings during the board-review fix.
      if (b.published !== a.published) return b.published - a.published;
      // Raw score still breaks ties among listings that display the same
      // number, so ordering stays meaningful where several sit at the cap.
      if (b.raw !== a.raw) return b.raw - a.raw;
      const aPerMl = a.dupe.priceUsd / a.dupe.bottleMl;
      const bPerMl = b.dupe.priceUsd / b.dupe.bottleMl;
      return aPerMl - bPerMl;
    })
    .map((entry) => entry.dupe);
}

/**
 * The score a buyer sees for one comparison: the raw formula output, passed
 * through the unverified-submission cap. Every component that displays a
 * match percentage should call this rather than computeSimilarity directly -
 * see lib/verification.ts's module doc for why the raw number alone is not
 * safe to publish.
 */
export function getPublishedSimilarity(reference: ReferenceFragrance, dupe: DupeCandidate): number {
  return getPublishedScore(computeSimilarity(reference, dupe), dupe);
}

/**
 * The N most similar OTHER originals in the catalog to `reference` - the
 * "Related originals" module on a fragrance page. This is a different
 * question from getRankedDupesFor: that ranks third-party dupes against one
 * original; this ranks originals against each other, which is why it goes
 * through computeOriginalSimilarity (lib/similarity.ts) rather than the
 * DUPES-shaped computeSimilarity/getPublishedScore pipeline above - there is
 * no submission to cap here, just two pieces of our own editorial data.
 */
export function getRelatedOriginals(
  reference: ReferenceFragrance,
  limit = 6,
  references: ReferenceFragrance[] = REFERENCES
): (ReferenceFragrance & { similarity: number })[] {
  return getRelatedReferences(reference, references, limit);
}

/** Filter a ranked dupe list down to one producer. Empty slug means "all". */
export function filterDupesByProducer(dupes: DupeCandidate[], producerSlug: string): DupeCandidate[] {
  if (!producerSlug) return dupes;
  return dupes.filter((d) => d.producerSlug === producerSlug);
}

/** Producer slugs that actually list something against this reference, so the
 *  filter UI never offers an option that would return nothing. */
export function getProducerSlugsFor(reference: ReferenceFragrance): string[] {
  return [...new Set(DUPES.filter((d) => d.referenceSlug === reference.slug).map((d) => d.producerSlug))];
}

/** True when this listing is COUNTERSCENT's own product rather than a third
 *  party's. Drives the house-product disclosure shown wherever it appears.
 *
 *  Delegates to lib/producers.ts so this and the scoring constraint in
 *  lib/verification.ts can never disagree about which listings are ours - see
 *  isHouseProducer's doc comment. */
export function isHouseProduct(dupe: DupeCandidate): boolean {
  return isHouseProducer(dupe.producerSlug);
}

/** Every listing by one producer, for a producer-branded browse page. */
export function getDupesByProducer(producerSlug: string): DupeCandidate[] {
  return DUPES.filter((d) => d.producerSlug === producerSlug);
}

/**
 * How many listings exist against each reference, keyed by slug.
 *
 * Built once rather than filtering DUPES per card: the picker renders this for
 * every reference in the catalog, and that is now dozens of cards.
 *
 * A zero here is the marketplace's own inventory gap - an original people
 * search for that nobody has listed against yet is exactly the slot a
 * subscribing producer would want to fill, so it is worth showing plainly
 * rather than hiding the fragrance.
 */
export function getListingCounts(): Map<string, number> {
  const counts = new Map<string, number>();
  for (const dupe of DUPES) {
    counts.set(dupe.referenceSlug, (counts.get(dupe.referenceSlug) ?? 0) + 1);
  }
  return counts;
}

/** References that have at least one listing against them. */
export function hasListings(referenceSlug: string): boolean {
  return DUPES.some((d) => d.referenceSlug === referenceSlug);
}

/** One listing paired with the reference it alternates and the day it went live. */
export interface DatedListing {
  dupe: DupeCandidate;
  reference: ReferenceFragrance;
  /** ISO YYYY-MM-DD. See lib/listing-dates.ts for which moment this is. */
  firstLive: string;
}

/**
 * Listings that went live most recently, newest first.
 *
 * UNDATED LISTINGS ARE EXCLUDED, NOT GUESSED. lib/data/listing-dates.generated.ts
 * is committed rather than regenerated at build time, so a listing added
 * without re-running the generator is simply absent here. That is the correct
 * direction to fail: the surface under-reports rather than printing a date
 * nobody derived. Callers should render `datedCount` alongside so a partial
 * list never reads as the whole catalogue.
 *
 * Ties inside a day break on the reference name and then the listing slug,
 * never on score. Ranking "new" by quality would quietly turn a freshness
 * surface into a second, unexplained leaderboard - the site already has
 * exactly one ranked list and it publishes its formula.
 *
 * A listing whose reference is missing is dropped rather than rendered
 * bare: every surface here states what a listing is an alternative TO, and a
 * card that cannot say so is not a card we can publish.
 */
export function getRecentlyAddedListings(limit = 12): DatedListing[] {
  const bySlug = new Map(REFERENCES.map((r) => [r.slug, r]));

  return DUPES.map((dupe) => {
    const firstLive = listingFirstLive(dupe.slug);
    const reference = bySlug.get(dupe.referenceSlug);
    if (!firstLive || !reference) return null;
    if (isVerbatimCopy(reference, dupe)) return null;
    return { dupe, reference, firstLive };
  })
    .filter((entry): entry is DatedListing => entry !== null)
    .sort((a, b) => {
      if (a.firstLive !== b.firstLive) return b.firstLive.localeCompare(a.firstLive);
      const byRef = a.reference.name.localeCompare(b.reference.name);
      return byRef !== 0 ? byRef : a.dupe.slug.localeCompare(b.dupe.slug);
    })
    .slice(0, limit);
}

/** Everything that went live on one day. */
export interface ListingDay {
  /** ISO YYYY-MM-DD. */
  date: string;
  listings: DatedListing[];
}

/**
 * The most recent days on which anything went live, newest first.
 *
 * WHOLE DAYS ONLY, AND THAT IS THE POINT. A flat "most recent 24" cuts through
 * the middle of a day, and a heading that then reports how many it is showing
 * ("16 added") states a false fact about that day - the site published 23.
 * Taking whole days makes every count on the page a real count. It is exactly
 * the failure mode of a partial data source stated as a total, in miniature.
 *
 * The catalogue arrived in four large batches, so a flat cap either shows one
 * day or nearly everything. Once producers submit one at a time, days get
 * small, and a soft target on listings with a hard cap on days keeps the page
 * a sensible length under both shapes without a second tuning pass.
 */
export function getRecentlyAddedDays(targetListings = 24, maxDays = 8): ListingDay[] {
  const all = getRecentlyAddedListings(Number.MAX_SAFE_INTEGER);

  const byDate: ListingDay[] = [];
  for (const entry of all) {
    const last = byDate[byDate.length - 1];
    if (last && last.date === entry.firstLive) last.listings.push(entry);
    else byDate.push({ date: entry.firstLive, listings: [entry] });
  }

  const taken: ListingDay[] = [];
  let count = 0;
  for (const day of byDate) {
    // Always take the first day whatever its size, or a single large batch
    // would render an empty page.
    if (taken.length > 0 && (count >= targetListings || taken.length >= maxDays)) break;
    taken.push(day);
    count += day.listings.length;
  }
  return taken;
}

/**
 * Every day anything went live, with its full count, newest first.
 *
 * The spine of the changelog. Rendering only the newest few days as cards
 * would leave the page with no history at all on a catalogue that arrived in
 * four large batches - this is the cheap, honest remainder: real dates, real
 * totals, no cards.
 */
export function getListingDayCounts(): { date: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const entry of getRecentlyAddedListings(Number.MAX_SAFE_INTEGER)) {
    counts.set(entry.firstLive, (counts.get(entry.firstLive) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => b.date.localeCompare(a.date));
}

/** How many listings the "recently added" surface is able to date at all. */
export function datedListingCount(): number {
  return datedCount(DUPES.map((d) => d.slug));
}

/** One reference and how many alternatives are listed against it. */
export interface CoverageEntry {
  reference: ReferenceFragrance;
  listingCount: number;
}

/**
 * How the catalogue divides into covered and uncovered originals.
 *
 * This is the single most useful fact the site holds and has never rendered.
 * It answers a buyer's real question ("has anyone made one of these?"),
 * including when the answer is no - which is most of the time, and is a
 * finding rather than a hole, because dupe houses clone bestsellers and
 * roughly half this catalogue is outside that target list (see the project
 * CLAUDE.md, "COVERAGE IS CAPPED BY WHAT THE DUPE INDUSTRY MAKES").
 *
 * It is also the only popularity-shaped signal on this site that cannot be
 * bought or clicked into existence. The only way a producer moves their
 * reference up `mostCovered` is by publishing a real listing that passed
 * review, which is precisely the behaviour the programme is for.
 */
export interface CatalogCoverage {
  total: number;
  covered: number;
  uncovered: number;
  /** Covered by exactly one listing, so nothing to compare against. */
  singleListing: number;
  /**
   * References with MORE THAN ONE alternative, most first, then A-Z.
   *
   * The threshold is two, not one, and it is load-bearing rather than a
   * display preference. 59 of the 65 covered references currently have
   * exactly one listing, so a plain "top N by listing count" spends most of
   * its rows on an alphabetical tie-break among 59 equals - an arbitrary
   * order rendered as a ranking, which is the same failure as a top-5 built
   * from click counts too small to separate anything. Cutting at two means
   * every row on the list is genuinely ahead of every row that is not.
   */
  mostCovered: CoverageEntry[];
}

export function getCatalogCoverage(limit = 8): CatalogCoverage {
  const counts = getListingCounts();
  const covered: CoverageEntry[] = [];

  for (const reference of REFERENCES) {
    const listingCount = counts.get(reference.slug) ?? 0;
    if (listingCount > 0) covered.push({ reference, listingCount });
  }

  const mostCovered = covered
    .filter((entry) => entry.listingCount > 1)
    .sort((a, b) =>
      b.listingCount !== a.listingCount
        ? b.listingCount - a.listingCount
        : a.reference.name.localeCompare(b.reference.name)
    )
    .slice(0, limit);

  return {
    total: REFERENCES.length,
    covered: covered.length,
    uncovered: REFERENCES.length - covered.length,
    singleListing: covered.filter((entry) => entry.listingCount === 1).length,
    mostCovered,
  };
}

/**
 * The nearest original to `reference` that actually HAS an alternative listed.
 *
 * Most of the catalogue is uncovered, so most /fragrance/<slug> pages end on
 * an honest empty state and then a "Related originals" list whose entries are
 * mostly uncovered too - a dead end two clicks deep. This finds the closest
 * neighbour a reader can actually use.
 *
 * It reuses getRelatedOriginals, so the notion of "closest" is the same one
 * that page already publishes, rather than a second similarity idea invented
 * for this module. Widen rather than deepen: the limit is raised until a
 * covered neighbour turns up or the catalogue runs out, because in a sparse
 * family the nearest covered original can sit well down the list.
 *
 * Returns null when nothing in the catalogue is both related and covered.
 * That is a real outcome and the caller must render the empty state, not a
 * consolation link to something unrelated.
 */
export function getNearestCoveredOriginal(
  reference: ReferenceFragrance
): (ReferenceFragrance & { similarity: number }) | null {
  const related = getRelatedOriginals(reference, REFERENCES.length);
  return related.find((candidate) => hasListings(candidate.slug)) ?? null;
}

export interface OriginalOffer {
  /** The affiliate id to link this retailer through, or null when we hold no
   *  working link for it. A row with no id still renders - knowing who stocks
   *  a bottle is true information whether or not we earn from it. */
  affiliateLinkId: string | null;
  /** The retailer, named on screen — never "the merchant". */
  merchantName: string;
  /** What THEY charge, for a bottle size we actually know. Null when no
   *  variant matched our own bottleMl; see below for why that matters. */
  priceUsd: number | null;
  priceMl: number | null;
  /** Their product title, so a wrong match is visible to a reader, not just
   *  to whoever next reads the generated file. */
  matchedName: string;
}

/**
 * The retailer we can actually send someone to for the ORIGINAL, if any.
 *
 * WHY THIS EXISTS RATHER THAN COMPONENTS READING `reference.priceUsd`.
 * `priceUsd` on a ReferenceFragrance is an approximate US RETAIL figure we
 * maintain by hand, and the retailer's own price is frequently well below it —
 * 34 of the 80 prices we can compare are more than 40% apart. So the button
 * that used to read "Buy the original - $76" would have sent a reader to a
 * page charging $21.95, which is a false price claim attached to a link we
 * earn from. Whatever a surface shows next to a buy button has to be the price
 * at the far end of that button.
 *
 * The UI states the retailer's price plainly and does NOT characterise it —
 * founder's call, 2026-09-07. We are not a price commentator; we show what the
 * shop charges and let the reader compare.
 *
 * `priceUsd` is deliberately NOT overwritten with this. It feeds the "Nx
 * cheaper per ml" comparison, which is a claim about what the original costs
 * at retail, not about what one discounter charges this week — and swapping in
 * a single merchant's price would silently redefine the field the moment a
 * second originals merchant is added. The two numbers coexist, each labelled
 * with where it came from.
 *
 * A null `priceUsd` here means the retailer stocks it but not in our reference
 * bottle size, so we can name the shop without quoting a figure. It is never a
 * guess across sizes: that is exactly what made the earlier Awin prices
 * unusable (see scripts/ingest-feed.mjs).
 */
export interface ShopBrandGroup {
  brand: string;
  products: ShopListing[];
}

/**
 * The buy-link catalogue, grouped by house.
 *
 * DELIBERATELY SEPARATE FROM `getReferencesByBrand()`. These are products we
 * can send a buyer to, not fragrances we have analysed — there is no note
 * pyramid, facet profile or family behind them, because the merchant feed
 * carries none. The surface that renders this must not imply otherwise.
 *
 * A product whose `referenceSlug` is set IS in our catalogue; the shop surface
 * links to its comparison page instead of to the shop, so a reader who can get
 * the full analysis always does.
 *
 * `imageUrl` resolves the same way references do: a locally-hosted copy, never
 * a hotlink to the merchant's CDN, so no visitor request reaches them.
 */
export function getShopOriginalsByBrand(): ShopBrandGroup[] {
  const byBrand = new Map<string, ShopBrandGroup["products"]>();
  for (const { product, merchantName, image } of allShopListings()) {
    const entry = { ...product, merchantName, ...(image ? { imageUrl: image } : {}) };
    const existing = byBrand.get(product.brand);
    if (existing) existing.push(entry);
    else byBrand.set(product.brand, [entry]);
  }
  return [...byBrand.entries()]
    .map(([brand, products]) => ({
      brand,
      products: [...products].sort((a, b) => a.name.localeCompare(b.name)),
    }))
    .sort((a, b) => a.brand.localeCompare(b.brand));
}

/** Every shop product, flat — for counts and structured data. */
export function getShopOriginals(): ShopListing[] {
  return allShopListings().map(({ product, merchantName }) => ({ ...product, merchantName }));
}

/** A shop product plus the retailer it is stocked at. Two merchants supply this
 *  surface now, so a card that does not name its own shop is a card whose price
 *  belongs to nobody. */
export type ShopListing = ShopOriginal & { merchantName: string; imageUrl?: string };

/**
 * Both merchants' shop stock, in one list.
 *
 * FragranceShop first, then Perfumania, and NOT interleaved by price - the same
 * rule as getOriginalOffers(). They are separate retailers quoting separate
 * bottle sizes; ordering them against each other would imply a comparison the
 * data does not support.
 *
 * A product that is one of our references already has its photograph under the
 * reference slug; a shop-only one has its own.
 */
/**
 * Merchant brand strings that are simply misspelt, mapped to the spelling the
 * rest of the catalogue uses. Without this the page grows a second heading for
 * the same house - FragranceShop files two products under "Maison Francis
 * Kurkdijan" and one under the correct "Maison Francis Kurkdjian", so the brand
 * index listed both, three products split across two sections of one perfumer.
 *
 * Keep this to provable typos of a house we already carry. It is NOT a synonym
 * table: merging two brands that are actually different companies is the
 * fragranceshop.com / thefragranceshop.com mistake in another costume.
 */
const BRAND_TYPOS: Record<string, string> = {
  "Maison Francis Kurkdijan": "Maison Francis Kurkdjian",
};

function allShopListings(): { product: ShopOriginal; merchantName: string; image?: string }[] {
  const out: { product: ShopOriginal; merchantName: string; image?: string }[] = [];
  for (const raw of SHOP_ORIGINALS) {
    const product = BRAND_TYPOS[raw.brand] ? { ...raw, brand: BRAND_TYPOS[raw.brand] } : raw;
    out.push({
      product,
      merchantName: CJ_MERCHANT.name,
      image: product.referenceSlug ? CJ_IMAGES[product.referenceSlug] : SHOP_IMAGES[product.slug],
    });
  }
  for (const raw of PM_SHOP_ORIGINALS) {
    const product = BRAND_TYPOS[raw.brand] ? { ...raw, brand: BRAND_TYPOS[raw.brand] } : raw;
    out.push({
      product,
      merchantName: PM_MERCHANT.name,
      image: product.referenceSlug ? PM_IMAGES[product.referenceSlug] : PM_SHOP_IMAGES[product.slug],
    });
  }
  return out;
}

export interface OriginalPricingResolved {
  priceUsd: number;
  bottleMl: number;
  /** "retailer" when this is a real shop price for a known bottle size;
   *  "editorial" when it is our hand-maintained approximate retail figure. */
  source: "retailer" | "editorial";
  /** Set only when source is "retailer". */
  merchantName?: string;
}

/**
 * The price of the ORIGINAL that every comparison on the site runs against.
 *
 * Prefers the retailer's own listed price for a bottle whose size we actually
 * know, and falls back to the hand-maintained editorial figure otherwise.
 * Founder's call, 2026-09-07: show what the shop charges and compare against
 * that, rather than carrying two prices for one bottle and explaining the gap.
 *
 * The fallback is not a rare edge case — 21 of the 101 stocked references have
 * no variant matching our own `bottleMl`, and every reference the retailer
 * does not stock at all (99 of them) has no shop price by definition. Those
 * keep the editorial figure and are labelled as approximate where shown.
 *
 * Some dupes stop being cheaper under this. That is the correct outcome and
 * `describeValueMultiple()` already says "no cheaper" or "Nx more expensive"
 * in words; two listings flip today (AromaPassions BLOSSOM against Gucci
 * Bloom, HARMONY against Terre d'Hermès). Do not compensate for it in the
 * scoring or by reinstating the higher baseline.
 */
export function getOriginalPricing(reference: ReferenceFragrance): OriginalPricingResolved {
  const offer = CJ_OFFERS[reference.slug];
  if (offer?.priceUsd != null && offer.priceMl != null) {
    return {
      priceUsd: offer.priceUsd,
      bottleMl: offer.priceMl,
      source: "retailer",
      merchantName: CJ_MERCHANT.name,
    };
  }
  return { priceUsd: reference.priceUsd, bottleMl: reference.bottleMl, source: "editorial" };
}

export function getOriginalOffer(reference: ReferenceFragrance): OriginalOffer | null {
  const offer = CJ_OFFERS[reference.slug];
  if (!offer) return null;
  return {
    merchantName: CJ_MERCHANT.name,
    affiliateLinkId: `original-${reference.slug}`,
    priceUsd: offer.priceUsd,
    priceMl: offer.priceMl,
    matchedName: offer.matchedName,
  };
}

/**
 * EVERY retailer we can send someone to for the original, not just the first.
 *
 * Two merchants now stock most of this catalogue - FragranceShop.com (CJ
 * 16941446) and Perfumania.com (CJ 17335854) - and 91 references are carried by
 * both. Picking one for the reader would be picking their price for them, so
 * both are returned and the buy surface lists them side by side.
 *
 * NOT SORTED BY PRICE, and that is deliberate rather than an omission. A price
 * is only comparable when both retailers quote the SAME bottle, and they often
 * do not: `priceUsd` is null wherever no variant matched our `bottleMl`.
 * Ordering a $98 bottle against a null ranks on nothing, and ordering the
 * spread figures would compare a 30ml against a 100ml. Retailers render in a
 * fixed order and nothing is labelled cheapest - the same rule the dupe-side
 * offers already follow, for the same reason. See BuyActions.
 */
export function getOriginalOffers(reference: ReferenceFragrance): OriginalOffer[] {
  const offers: OriginalOffer[] = [];

  const cj = CJ_OFFERS[reference.slug];
  if (cj) {
    offers.push({
      merchantName: CJ_MERCHANT.name,
      affiliateLinkId: `original-${reference.slug}`,
      priceUsd: cj.priceUsd,
      priceMl: cj.priceMl,
      matchedName: cj.matchedName,
    });
  }

  const pm = PM_OFFERS[reference.slug];
  if (pm) {
    offers.push({
      merchantName: PM_MERCHANT.name,
      affiliateLinkId: `pm-${reference.slug}`,
      priceUsd: pm.priceUsd,
      priceMl: pm.priceMl,
      // Their title verbatim, so a wrong match is visible to a reader rather
      // than only to whoever next opens the generated file. This merchant's
      // grammar puts a gender tag where a format looks like it should be
      // ("Percival Cologne" is an EDP), which is exactly the kind of thing a
      // reader should be able to catch us on.
      matchedName: pm.title,
    });
  }

  return offers.filter((o) => hasRealAffiliateLink(o.affiliateLinkId ?? undefined));
}
