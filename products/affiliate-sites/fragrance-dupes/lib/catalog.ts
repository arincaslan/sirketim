import { DUPES, REFERENCES } from "@/lib/dupes-data";
import { isHouseProducer } from "@/lib/producers";
import { computeSimilarity, getRelatedReferences } from "@/lib/similarity";
import { getPublishedScore, isVerbatimCopy } from "@/lib/verification";
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
 * Ranking sorts on the PUBLISHED score first and the raw score second. The
 * published key stops the list ever showing a higher-ranked listing at a lower
 * percentage than the one beneath it; the raw key keeps order meaningful among
 * the listings that display the same capped number.
 */
export function getRankedDupesFor(reference: ReferenceFragrance): DupeCandidate[] {
  return DUPES.filter((d) => d.referenceSlug === reference.slug && !isVerbatimCopy(reference, d))
    .map((dupe) => ({
      dupe,
      published: getPublishedScore(computeSimilarity(reference, dupe), dupe),
      raw: computeSimilarity(reference, dupe),
    }))
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
