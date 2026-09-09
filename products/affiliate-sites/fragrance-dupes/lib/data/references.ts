import { ARMANI } from "@/lib/data/houses/armani";
import { AZZARO } from "@/lib/data/houses/azzaro";
import { BYREDO } from "@/lib/data/houses/byredo";
import { CALVIN_KLEIN } from "@/lib/data/houses/calvin-klein";
import { CAROLINA_HERRERA } from "@/lib/data/houses/carolina-herrera";
import { CHANEL } from "@/lib/data/houses/chanel";
import { CREED } from "@/lib/data/houses/creed";
import { DIOR } from "@/lib/data/houses/dior";
import { GUCCI } from "@/lib/data/houses/gucci";
import { GUERLAIN } from "@/lib/data/houses/guerlain";
import { INITIO } from "@/lib/data/houses/initio";
import { JEAN_PAUL_GAULTIER } from "@/lib/data/houses/jean-paul-gaultier";
import { KILIAN } from "@/lib/data/houses/kilian";
import { LE_LABO } from "@/lib/data/houses/le-labo";
import { MAISON_MARGIELA } from "@/lib/data/houses/maison-margiela";
import { OTHER_HOUSES } from "@/lib/data/houses/other";
import { PACO_RABANNE } from "@/lib/data/houses/paco-rabanne";
import { PARFUMS_DE_MARLY } from "@/lib/data/houses/parfums-de-marly";
import { TOM_FORD } from "@/lib/data/houses/tom-ford";
import { VALENTINO } from "@/lib/data/houses/valentino";
import { VERSACE } from "@/lib/data/houses/versace";
import { XERJOFF } from "@/lib/data/houses/xerjoff";
import { YSL } from "@/lib/data/houses/ysl";
import { CJ_IMAGES } from "@/lib/data/cj-images.generated";
import { PM_IMAGES } from "@/lib/data/pm-images.generated";
import { FEED_IMAGES } from "@/lib/data/feed-images.generated";
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
/**
 * The hand-authored catalog, before merchant data is merged over it.
 *
 * Kept separate from the exported REFERENCES so the editorial layer stays
 * obviously editorial: notes, facets, families and prices are written by a
 * person and reviewed as prose. Nothing generated is ever written back into
 * lib/data/houses/*.ts.
 */
const EDITORIAL: ReferenceFragrance[] = [
  ...CHANEL,
  ...DIOR,
  ...CREED,
  ...ARMANI,
  ...GUCCI,
  ...JEAN_PAUL_GAULTIER,
  ...PARFUMS_DE_MARLY,
  ...TOM_FORD,
  ...YSL,
  ...KILIAN,
  ...BYREDO,
  ...MAISON_MARGIELA,
  ...LE_LABO,
  ...VERSACE,
  // Added 2026-09-01 in the 111 -> 200 expansion. Every one was checked against
  // the merchant feed by scripts/check-candidates.mjs before its note pyramid
  // was written — a page for a fragrance no merchant carries can never hold a
  // listing or earn a commission, which is the lesson of the 68 -> 111 pass.
  ...PACO_RABANNE,
  ...CAROLINA_HERRERA,
  ...XERJOFF,
  ...INITIO,
  ...GUERLAIN,
  ...CALVIN_KLEIN,
  ...AZZARO,
  ...VALENTINO,
  ...OTHER_HOUSES,
];

/**
 * The catalog as the site sees it: editorial data with locally-hosted merchant
 * product photography merged in where a real affiliate feed supplied one.
 *
 * ONLY `imageUrl` IS MERGED, and that is a deliberate limit rather than a
 * first step. The obvious next candidate — `priceUsd` — is not taken from the
 * feed, because the feed carries no bottle size. My Perfume Shop lists "Bleu
 * de CHANEL EDP" six times between $15 and $259, plainly a sample vial through
 * to a large bottle, with nothing saying which is which. `priceUsd` feeds the
 * "Nx cheaper per ml" claim, which needs price AND volume; a price detached
 * from its size would make that claim wrong on the page rather than merely
 * stale. So the hand-maintained approximate prices above still stand, and the
 * merchant's real price is shown separately as a range, attributed to them.
 *
 * Re-run `node scripts/ingest-feed.mjs && node scripts/fetch-feed-images.mjs`
 * after a feed refresh.
 */
/**
 * THREE IMAGE SOURCES, AND THE ORDER IS A LICENSING DECISION.
 *
 * The rule this project works to is that **the licence rides on the affiliate
 * relationship, not on the picture**. So the order is by how live the
 * relationship is, not by which picture is nicer:
 *
 *   1. `CJ_IMAGES`   FragranceShop.com, CJ 16941446 — live, and every
 *                    fragrance it covers carries a working `original-<slug>`
 *                    link to it.
 *   2. `PM_IMAGES`   Perfumania.com, CJ 17335854 — live (approved), added
 *                    2026-09-09. Six photographs, and every one of them is a
 *                    house FragranceShop does not carry at all: Giorgio Armani
 *                    Code Profumo, Parfums de Marly Percival, Kilian Angels'
 *                    Share, Xerjoff Naxos, Jo Malone Wood Sage & Sea Salt,
 *                    Amouage Interlude Man. It ranks below CJ_IMAGES only
 *                    because that merchant is already ingested and confirmed;
 *                    both programmes are live, so nothing overlaps in practice.
 *   3. `FEED_IMAGES` My Perfume Shop, Awin 106089 — programme went CLOSED for
 *                    tracking on 2026-09-01, so these are hosted on the
 *                    strength of an enrolment that no longer earns. Last
 *                    resort, still flagged as the open question they were.
 *
 * CJ_IMAGES beats FEED_IMAGES on 82 bottles both cover, which is why that swap
 * was worth the duplicated bytes on disk. PM_IMAGES duplicates nothing — it
 * fills gaps neither of the others can, which is why fetch-pm-images.mjs
 * downloads only the gaps by default.
 *
 * `wood-sage-sea-salt` is a 250x383 master, well below this merchant's usual
 * 1200-2048px. It cannot be upscaled. It ships because a small real photograph
 * of the right bottle beats no photograph, but it is the one to replace first
 * if another live programme carries Jo Malone.
 */
export const REFERENCES: ReferenceFragrance[] = EDITORIAL.map((ref) => {
  const image = CJ_IMAGES[ref.slug] ?? PM_IMAGES[ref.slug] ?? FEED_IMAGES[ref.slug];
  return image ? { ...ref, imageUrl: image } : ref;
});

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
