/**
 * Maison IRFE product photographs, hosted locally. CJ advertiser 17213922.
 *
 * HAND-WRITTEN, NOT `.generated.ts` - nothing writes it, same as the other two
 * IRFE files. Eight images for eight references, fetched 2026-10-08.
 *
 * LICENCE POSITION. lib/types.ts names exactly two lawful sources for perfume
 * bottle imagery: supplied by an affiliate programme we are enrolled in, or a
 * bottle we own and photograph. We are enrolled in IRFE's own CJ programme, and
 * every image here is IRFE's own photograph of IRFE's own product.
 *
 * FIVE CAME FROM THE FEED, THREE DID NOT, and the difference is recorded rather
 * than blurred:
 *
 *   patchouli-forever-worn, marshmallow-musk, smoldering-pepper,
 *   saffron-leather, centifolia-rose
 *     - the `IMAGE_LINK` column of the CJ feed of 2026-10-04. The programme
 *       supplied these directly.
 *
 *   ma-france-folie-parisienne, my-st-moritz-lakeside-bliss,
 *   my-britain-lord-and-lady
 *     - the product page gallery on irfe.com, read through its public
 *       WooCommerce Store API. The feed's own primary image for these three is
 *       a STYLED shot: the bottle on coloured fabric among dried flowers,
 *       cinnamon and orchids. It is genuinely the product, and it was rejected
 *       anyway, because the catalogue's existing photographs are white-ground
 *       packshots and three lifestyle frames in that grid read as a different
 *       site. The gallery carries the plain packshot of the same bottle and box
 *       (`Paris1`, `St.Moritz1`, `London1`), so the chosen image is the same
 *       merchant's photograph of the same product, picked for consistency.
 *       There is precedent for reading this merchant's storefront rather than
 *       only its feed: scripts/fetch-pm-shop-images.mjs does it for Perfumania.
 *
 * EVERY ONE WAS LOOKED AT BEFORE IT WAS USED, not inferred from its file name -
 * and the earlier guess made from file names was WRONG, which is the reason to
 * write this down. `white502`, `silver502`, `gold502`, `black502` and `red502`
 * read like generic packaging shots and were nearly skipped on that basis. They
 * are not generic: IRFE's Maison line gives each fragrance its own bottle
 * colour, and each frame carries that fragrance's own named box. The colour IS
 * the product identity here.
 *
 * All eight are 1067x1600 portrait masters re-encoded to progressive JPEG at
 * q88. The sources are a mix of WebP and JPEG served from `.jpg` URLs -
 * WordPress rewrites the format, so read the content type, never the extension.
 */

export const IRFE_IMAGES: Record<string, string> = {
  "ma-france-folie-parisienne": "/images/fragrance-irfe/ma-france-folie-parisienne.jpg",
  "my-st-moritz-lakeside-bliss": "/images/fragrance-irfe/my-st-moritz-lakeside-bliss.jpg",
  "my-britain-lord-and-lady": "/images/fragrance-irfe/my-britain-lord-and-lady.jpg",
  "patchouli-forever-worn": "/images/fragrance-irfe/patchouli-forever-worn.jpg",
  "marshmallow-musk": "/images/fragrance-irfe/marshmallow-musk.jpg",
  "smoldering-pepper": "/images/fragrance-irfe/smoldering-pepper.jpg",
  "saffron-leather": "/images/fragrance-irfe/saffron-leather.jpg",
  "centifolia-rose": "/images/fragrance-irfe/centifolia-rose.jpg",
};
