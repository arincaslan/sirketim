import { REFERENCES } from "@/lib/data/references";
import type { DupeCandidate, ReferenceFragrance } from "@/lib/types";

export { REFERENCES };

/**
 * Producer listings for the Dupe Finder.
 *
 * DELIBERATELY EMPTY as of 2026-08-27. This array previously held 37 listings.
 * They were removed at the founder's instruction ("take out all the gimmick
 * data") once verification showed the problem was worse than stale figures:
 *
 *   The product names themselves were invented and attributed to real,
 *   currently-operating companies.
 *
 * Checked live against the producers' own storefronts before deleting:
 *   - "Ambrosia" (Dossier)          -> does not exist. Dossier's actual
 *                                      Baccarat Rouge 540 product is
 *                                      "Ambery Saffron"; their whole range is
 *                                      named descriptively (Ambery Vanilla,
 *                                      Woody Sandalwood, Floral Marshmallow).
 *   - "Bright", "Blue Cedar" (ALT.) -> do not exist. ALT. Fragrances' real
 *                                      range is Crystal, Executive, Farouche,
 *                                      Fleur Noire, Agar Gold, Simply Santal,
 *                                      Duchess, Mistress, Halo Heat, ...
 *
 * That is not a data-freshness problem and it could not be fixed by editing
 * prices - publishing invented products under a real business's name is false
 * on its face and damaging to that business. The file header used to call
 * this "illustrative fixture data", which was true of the numbers and quietly
 * untrue of the names.
 *
 * The five "Counterscent Atelier" house listings went with them: that line is real
 * and planned ($8.51/55ml production cost, see MARKETPLACE-PLAN.md §1) but has
 * no launched products and no measured specifications yet, and leaving only
 * our own listings on a site branded "Independent Fragrance Comparisons" would
 * be its own credibility problem.
 *
 * Nothing else changed. REFERENCES (68 real, researched originals) is intact,
 * the scoring pipeline is intact, and every component's empty state renders.
 * The Dupe Finder is a working tool with no listings to rank yet.
 *
 * HOW REAL LISTINGS ARRIVE - and it is not by hand:
 *   1. Enrol in an affiliate programme (FINALIZATION-GUIDE.md phase 3).
 *   2. Ingest that programme's product feed, which supplies real names, real
 *      prices, and legally usable product imagery (phase 4).
 * A producer's own submission through /producers/submit is the other lawful
 * source, and it arrives labelled as a supplier claim, not our measurement.
 *
 * DO NOT hand-write listings back into this array. If a name cannot be
 * verified on the producer's own storefront right now, it does not go in.
 */

export const DUPES: DupeCandidate[] = [];

export function getReference(slug: string): ReferenceFragrance | undefined {
  return REFERENCES.find((r) => r.slug === slug);
}

export function getDupesFor(referenceSlug: string): DupeCandidate[] {
  return DUPES.filter((d) => d.referenceSlug === referenceSlug);
}

export function getDupe(slug: string): DupeCandidate | undefined {
  return DUPES.find((d) => d.slug === slug);
}
