import { ARMANI } from "@/lib/data/houses/armani";
import { CHANEL } from "@/lib/data/houses/chanel";
import { CREED } from "@/lib/data/houses/creed";
import { DIOR } from "@/lib/data/houses/dior";
import { GUCCI } from "@/lib/data/houses/gucci";
import { JEAN_PAUL_GAULTIER } from "@/lib/data/houses/jean-paul-gaultier";
import { OTHER_HOUSES } from "@/lib/data/houses/other";
import { PARFUMS_DE_MARLY } from "@/lib/data/houses/parfums-de-marly";
import type { ReferenceFragrance } from "@/lib/types";

/**
 * The reference (original) fragrance catalog, one file per house.
 *
 * ================= READ BEFORE THIS GOES LIVE =========================
 *
 * SCOPE. This is deliberately NOT every release from these houses. Chanel and
 * Dior alone have hundreds of flankers, and writing note pyramids for ones
 * nobody has ever duped would mean inventing data - the same failure mode the
 * house-product note in lib/dupes-data.ts warns about. What is here is the
 * widely-duped flagships: the fragrances producers actually make alternatives
 * to, which are the only ones a dupe comparison has any use for. Extending a
 * house means adding to its file, not restructuring anything.
 *
 * NOTES are drawn from the publicly documented pyramids these houses and the
 * major fragrance databases publish. They are reliable for the classics and
 * should still be spot-checked against a current source before launch,
 * because reformulations do change them (Fahrenheit, Eau Sauvage, and the
 * older Chanels have all been reformulated at least once).
 *
 * FACET SCORES (0-10) are editorial estimates, not measurements - the same
 * convention the original fixture set used and the /about methodology page
 * discloses. They drive the radar chart and part of the similarity score.
 *
 * PRICES ARE APPROXIMATE US RETAIL and will drift. They feed the "Nx cheaper
 * per ml" value claim shown to buyers, which makes a stale price here a
 * misleading claim on the page, not just untidy data. Before launch these
 * need to come from a real price source (a retailer feed or the affiliate
 * network's own product data), not a hand-maintained constant.
 *
 * AFFILIATE LINK IDS follow the `original-<slug>` convention and currently
 * resolve to clearly-marked placeholders - no retailer program is enrolled.
 * See lib/affiliate-links.ts.
 * ======================================================================
 */
export const REFERENCES: ReferenceFragrance[] = [
  ...CHANEL,
  ...DIOR,
  ...CREED,
  ...ARMANI,
  ...GUCCI,
  ...JEAN_PAUL_GAULTIER,
  ...PARFUMS_DE_MARLY,
  ...OTHER_HOUSES,
];

/** Guards against a copy-paste duplicate slug silently shadowing a fragrance:
 *  two entries with the same slug would make getReference ambiguous and break
 *  deep links. Cheap to check at module load, and it fails loudly at build
 *  time rather than rendering the wrong bottle. */
const seen = new Set<string>();
for (const ref of REFERENCES) {
  if (seen.has(ref.slug)) {
    throw new Error(`Duplicate reference slug in catalog: "${ref.slug}"`);
  }
  seen.add(ref.slug);
}
