import { REFERENCES } from "@/lib/data/references";
import { DUPE_IMAGES } from "@/lib/data/dupe-images.generated";
import type { DupeCandidate, ReferenceFragrance } from "@/lib/types";

export { REFERENCES };

/**
 * Producer listings for the Dupe Finder.
 *
 * WAS DELIBERATELY EMPTY 2026-08-27 → 2026-09-01, and the reasoning below is
 * kept in full because it is the standard all twenty-five current listings had
 * to meet, not a superseded note. Read it before adding a twenty-sixth.
 *
 * It previously held 37 listings. They were removed at the founder's
 * instruction ("take out all the gimmick data") once verification showed the
 * problem was worse than stale figures:
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
 * Nothing else changed. REFERENCES (now 200 real, researched originals) is
 * intact, the scoring pipeline is intact, and every component's empty state
 * still renders for the 195 references that have no listing.
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

/**
 * REPOPULATED 2026-09-01 (five listings) and EXTENDED 2026-09-02 (five more).
 * Every rule above was honoured by all ten.
 *
 * The array's own condition for refilling was "ingest an affiliate programme's
 * product feed, which supplies real names and real prices." That happened, from
 * two feeds (see scripts/feeds/README.md): My Perfume Shop (Awin 106089, 9,844
 * rows) and Opulensi (Awin 123248, 610 rows). **Every name here was read off a
 * real retailer's live catalog rather than invented** — the failure that emptied
 * this array. Each entry's `offers` records the exact feed rows, so any claim
 * below is checkable against a third party rather than trusted.
 *
 * WHAT THE FEEDS SUPPLIED, AND WHAT THEY DID NOT:
 *
 * - Names, and the retailer product page: from the feeds. Verified.
 * - Images: from the Opulensi feed, downloaded locally
 *   (scripts/fetch-dupe-images.mjs) and merged in below rather than hand-set.
 *   Three of the five have one; see that script's header for the rule.
 * - Note pyramids: NOT in the feeds. Written from the publicly documented
 *   pyramids, the same standard and the same caveat as REFERENCES.
 * - Facets: NOT in the feeds. Editorial estimates, as disclosed on /about.
 * - `priceUsd`: NOT taken from the feeds, deliberately. See below.
 * - Stock: in the Opulensi feed, and NOT TRUSTED. See the stock note below.
 *
 * WHY A RETAILER'S PRICE IS NOT USED FOR THE COMPARISON. My Perfume Shop lists
 * Club de Nuit Intense Man at $129 and Opulensi's limited edition runs £68.99,
 * when the standard bottle street-prices around $40. Feeding either into the
 * "Nx cheaper per ml" claim would understate the value proposition by two to
 * three times, in the one number this site exists to get right. So `priceUsd`
 * is an approximate street price, hand-maintained, carrying exactly the caveat
 * REFERENCES carries. Each offer's own `price` renders beside it, in that
 * retailer's currency, unconverted — several retailers side by side is also why
 * the UI no longer needs a paragraph explaining why the two figures differ.
 *
 * WHICH OFFERS CAN ACTUALLY BE BOUGHT — three separate conditions, and all
 * three have failed at least once here:
 *
 * 1. **Are we enrolled?** The My Perfume Shop offers have no `affiliateLinkId`.
 *    Its programme (Awin 106089) is CLOSED for tracking — every link redirects
 *    to awin1.com/closedMerchant.html. Being *joined* is not being able to earn.
 * 2. **Does the link track?** Every entry in lib/affiliate-links.ts was traced
 *    end to end before being added: the redirect lands on opulensi.com carrying
 *    our `clickref` and an `awc` cookie.
 * 3. **Is it in stock?** The Armaf offer carries `inStock: false`. The Awin feed
 *    row says `in_stock=1`; the live Opulensi page says `OutOfStock`. **Feed
 *    stock is a snapshot and goes stale — the merchant's page is the truth.**
 *    The link is kept (it tracks, and works the moment stock returns) but no
 *    buy button renders. Re-check with:
 *
 *        node scripts/check-affiliate-links.mjs
 *
 * So today: twenty-five listings across eighteen originals, twenty-six offers,
 * twenty-three with a working programme behind them, twenty-two rendering an
 * actual buy button.
 *
 * The two My Perfume Shop-only listings also have NO IMAGE, for the same reason
 * rather than by coincidence. The licence we rely on for bottle photography is
 * "supplied by an affiliate programme we are enrolled in, to promote that
 * merchant" — which evaporates for a closed programme. They render the
 * generated note-signature mark instead.
 *
 * ALL FIVE ARE `declared`, NOT `verified`. We have not bought or worn any of
 * them. `verified` is earned by editorial review and must never be defaulted
 * to — so all five are capped by getPublishedScore(), which is the intended
 * behaviour, not a limitation to work around.
 *
 * NO HOUSE PRODUCTS. The COO's standing recommendation is to launch with none,
 * and the data-authorship problem at the foot of this project's CLAUDE.md is
 * unresolved. Third-party listings do not carry that conflict: we do not sell
 * these, so we gain nothing from how they rank.
 */
const LISTINGS: DupeCandidate[] = [
  {
    slug: "armaf-club-de-nuit-intense-man",
    referenceSlug: "aventus",
    name: "Club de Nuit Intense Man",
    brand: "Armaf",
    producerSlug: "armaf",
    notes: {
      top: ["Pineapple", "Blackcurrant", "Apple", "Lemon", "Bergamot"],
      heart: ["Birch", "Jasmine", "Rose"],
      base: ["Musk", "Ambergris", "Patchouli", "Vanilla"],
    },
    facets: { freshness: 7, sweetness: 7, warmth: 5, woodyDepth: 6, longevity: 8, sillage: 9 },
    longevityHoursRange: [8, 10],
    sillageLabel: "Beast Mode",
    priceUsd: 40,
    bottleMl: 105,
    concentration: "Eau de Toilette",
    verdict:
      "The most-cited Aventus alternative there is, and it earns the comparison on the opening: the same smoky pineapple accord, projecting harder than the original. It parts company in the dry-down, where Aventus keeps developing and this settles into a flatter sweet musk. Batch variation is real here, as it is with Aventus itself.",
    // Two retailers, one linkable. Product names are verbatim from each feed
    // rather than tidied to a common "Club de Nuit Intense Man EDP", because
    // the name is what explains the price: Opulensi's row is a limited-edition
    // cufflinks set, My Perfume Shop's is the plain bottle at a designer
    // retailer's markup. Showing both prices is the honest version of what a
    // single price plus a paragraph of explanation used to do.
    offers: [
      {
        merchant: "Opulensi Perfumes",
        productName: "ARMAF club de nuit INTENSE MAN Limited Edition with CUFF LINKS V4 105ml",
        productUrl:
          "https://www.opulensi.com/products/armaf-club-de-nuit-intense-man-limited-edition-with-cuff-links-v4-105ml",
        price: 68.99,
        currency: "GBP",
        affiliateLinkId: "dupe-armaf-club-de-nuit-intense-man",
        // Checked 2026-09-01 with scripts/check-affiliate-links.mjs: the
        // Opulensi page says OutOfStock while the Awin feed row says
        // `in_stock=1`. The feed is stale; the merchant's page is the truth.
        // The link itself is fine — it tracks, and it is kept so it works the
        // moment stock returns — but no buy button renders meanwhile.
        inStock: false,
      },
      {
        merchant: "My Perfume Shop",
        productName: "Armaf Club De Nuit Intense Man EDP",
        productUrl: "https://www.myperfumeshop.com.au/products/armaf-club-de-nuit-intense-man-edp",
        price: 129,
        currency: "USD",
        // No affiliateLinkId: programme 106089 is closed for tracking, so a
        // link here would earn nothing and land the buyer on an Awin error
        // page. The price still renders — "sold here too, we just cannot link
        // it" is useful to a buyer and true.
      },
    ],
    verificationStatus: "declared",
  },
  {
    slug: "lattafa-asad",
    referenceSlug: "aventus",
    name: "Asad",
    brand: "Lattafa",
    producerSlug: "lattafa",
    notes: {
      top: ["Pineapple", "Blackcurrant", "Bergamot"],
      heart: ["Patchouli", "Violet Leaf", "Jasmine"],
      base: ["Vanilla", "Ambroxan", "Tobacco", "Musk"],
    },
    facets: { freshness: 6, sweetness: 8, warmth: 6, woodyDepth: 5, longevity: 7, sillage: 8 },
    longevityHoursRange: [6, 9],
    sillageLabel: "Strong",
    priceUsd: 30,
    bottleMl: 100,
    concentration: "Eau de Parfum",
    verdict:
      "Takes the fruity-smoky idea somewhere sweeter and more tobacco-leaning rather than tracking Aventus note for note. Read it as an interpretation, not a match — which is also why it is worth smelling if the Armaf reads too sharp.",
    offers: [
      {
        merchant: "Opulensi Perfumes",
        productName: "Lattafa Asad Eau De Parfum 100ml For Men",
        productUrl:
          "https://www.opulensi.com/products/asad-perfume-eau-de-parfum-100ml-for-men-long-lasting-luxury-fragrance",
        price: 19.99,
        currency: "GBP",
        affiliateLinkId: "dupe-lattafa-asad",
        // In stock, checked 2026-09-01 (scripts/check-affiliate-links.mjs).
        inStock: true,
      },
    ],
    verificationStatus: "declared",
  },
  {
    slug: "lattafa-khamrah",
    referenceSlug: "angels-share",
    name: "Khamrah",
    brand: "Lattafa",
    producerSlug: "lattafa",
    notes: {
      top: ["Cinnamon", "Nutmeg", "Bergamot"],
      heart: ["Dates", "Praline", "Tuberose", "Mahonial"],
      base: ["Vanilla", "Tonka Bean", "Amberwood", "Benzoin", "Myrrh", "Palisander"],
    },
    facets: { freshness: 2, sweetness: 9, warmth: 8, woodyDepth: 5, longevity: 8, sillage: 8 },
    longevityHoursRange: [8, 10],
    sillageLabel: "Beast Mode",
    priceUsd: 35,
    bottleMl: 100,
    concentration: "Eau de Parfum",
    verdict:
      "Shares Angels' Share's boozy-cinnamon-praline territory and pushes the date and spice further, which makes it sweeter and heavier-handed. The cognac accord that gives the Kilian its lift is the part that does not carry over.",
    offers: [
      {
        merchant: "Opulensi Perfumes",
        productName: "Khamrah EDP - EDP 100ml by Lattafa Unisex",
        productUrl:
          "https://www.opulensi.com/products/khamrah-edp-eau-de-parfum-unisex-100ml-vanilla-sweet-warm-spicy-woody-by-lattafa-perfumes",
        price: 29.99,
        currency: "GBP",
        affiliateLinkId: "dupe-lattafa-khamrah",
        // In stock, checked 2026-09-01 (scripts/check-affiliate-links.mjs).
        inStock: true,
      },
    ],
    verificationStatus: "declared",
  },
  {
    slug: "armaf-club-de-nuit-sillage",
    referenceSlug: "silver-mountain-water",
    name: "Club de Nuit Sillage",
    brand: "Armaf",
    producerSlug: "armaf",
    notes: {
      top: ["Bergamot", "Green Notes", "Pineapple"],
      heart: ["Blackcurrant", "Tea", "Jasmine"],
      base: ["Musk", "Sandalwood", "Ambergris"],
    },
    facets: { freshness: 8, sweetness: 4, warmth: 3, woodyDepth: 5, longevity: 7, sillage: 7 },
    longevityHoursRange: [6, 8],
    sillageLabel: "Strong",
    priceUsd: 45,
    bottleMl: 105,
    concentration: "Eau de Parfum",
    verdict:
      "Aims at Silver Mountain Water's blackcurrant-and-tea freshness and lands close on the opening, with more projection and less of the cool mineral quality that makes the original read expensive.",
    offers: [
      {
        merchant: "My Perfume Shop",
        productName: "Armaf Club De Nuit Sillage EDP",
        productUrl: "https://www.myperfumeshop.com.au/products/armaf-club-de-nuit-sillage-edp",
        price: 69,
        currency: "USD",
        // Closed programme — see the Intense Man entry above.
      },
    ],
    verificationStatus: "declared",
  },
  {
    slug: "armaf-club-de-nuit-urban-man",
    referenceSlug: "millesime-imperial",
    name: "Club de Nuit Urban Man",
    brand: "Armaf",
    producerSlug: "armaf",
    notes: {
      top: ["Bergamot", "Lemon", "Sea Notes"],
      heart: ["Iris", "Jasmine"],
      base: ["Musk", "Sandalwood", "Ambergris"],
    },
    facets: { freshness: 8, sweetness: 4, warmth: 3, woodyDepth: 4, longevity: 6, sillage: 6 },
    longevityHoursRange: [5, 7],
    sillageLabel: "Moderate",
    priceUsd: 35,
    bottleMl: 105,
    concentration: "Eau de Parfum",
    verdict:
      "Gets the salty-citrus outline of Millesime Imperial at a tenth of the price. The original's melon-and-sea-spray richness is thinner here, and it does not last as long.",
    offers: [
      {
        merchant: "My Perfume Shop",
        productName: "Armaf Club De Nuit Urban Man EDP",
        productUrl: "https://www.myperfumeshop.com.au/products/armaf-club-de-nuit-urban-man-edp",
        price: 49,
        currency: "USD",
        // Closed programme — see the Intense Man entry above.
      },
    ],
    verificationStatus: "declared",
  },

  /* -- Added 2026-09-02 -------------------------------------------------
   * Five more, all from the Opulensi feed, all in stock at the time of
   * writing, all with a working tracked link.
   *
   * WHAT IS DIFFERENT ABOUT THESE FIVE: the pairing is cited, not asserted.
   * Scanning the feed's URLs and descriptions for "inspired by" turned up 70
   * rows where the retailer names the Western release themselves. That is
   * better evidence than our own recall, and `pairingBasis` records it so a
   * reader can check who is claiming what.
   *
   * HOW THEY WERE PICKED, in this order:
   *   1. Retailer states the pairing explicitly.
   *   2. The named original already exists in REFERENCES.
   *   3. The link traces to opulensi.com with the sub-ID intact.
   *   4. The merchant's own page says InStock.
   *
   * Step 4 eliminated eight of thirteen candidates - including four Maison
   * Alhambra products that would otherwise have been the strongest additions
   * (Jean Lowe Ombre / Ombre Leather, Salvo / Sauvage Elixir, Delilah /
   * Delina, Kismet Magic / Angel). **Every one of them is marked `in_stock=1`
   * in the feed.** Feed stock here is close to meaningless; re-run
   * scripts/check-affiliate-links.mjs and add them when they return.
   */
  {
    slug: "lattafa-oud-for-glory",
    referenceSlug: "oud-for-greatness",
    name: "Bade'e Al Oud Oud For Glory",
    brand: "Lattafa",
    producerSlug: "lattafa",
    pairingBasis: {
      source: "Opulensi product listing",
      quote: "inspired by initio oud for greatness",
      url: "https://www.opulensi.com/products/badee-al-oud-oud-for-glory-perfume-eau-de-parfum-inspired-by-initio-oud-for-greatness-1",
    },
    notes: {
      top: ["Lavender", "Saffron", "Nutmeg"],
      heart: ["Oud", "Patchouli"],
      base: ["Oud", "Patchouli", "Musk"],
    },
    facets: { freshness: 3, sweetness: 5, warmth: 8, woodyDepth: 8, longevity: 8, sillage: 9 },
    longevityHoursRange: [8, 10],
    sillageLabel: "Beast Mode",
    priceUsd: 32,
    bottleMl: 100,
    concentration: "Eau de Parfum",
    verdict:
      "The closest thing the category has to a straight substitution: the saffron-lavender opening and the smoky oud-patchouli heart track Oud for Greatness note for note, and it projects just as hard. What it gives up is the sandalwood in the base, which is where the Initio turns creamy and this stays dry and smoky throughout.",
    offers: [
      {
        merchant: "Opulensi Perfumes",
        productName: "Lattafa Badee Al Oud Oud For Glory 100ml EDP Unisex",
        productUrl:
          "https://www.opulensi.com/products/badee-al-oud-oud-for-glory-perfume-eau-de-parfum-inspired-by-initio-oud-for-greatness-1",
        price: 25.99,
        currency: "GBP",
        affiliateLinkId: "dupe-lattafa-oud-for-glory",
        inStock: true,
      },
    ],
    verificationStatus: "declared",
  },
  {
    slug: "fragrance-world-barakkat-rouge-540",
    referenceSlug: "baccarat-rouge-540",
    name: "Barakkat Rouge 540",
    brand: "Fragrance World",
    producerSlug: "fragrance-world",
    pairingBasis: {
      source: "Opulensi product listing",
      quote: "Inspired by the iconic Baccarat Rouge 540, it offers an irresistible alternative",
      url: "https://www.opulensi.com/products/barakkat-rouge-540-100ml-edp-perfume-spray-for-women-inspired-by-baccarat-rouge-540",
    },
    notes: {
      top: ["Jasmine", "Saffron"],
      heart: ["Amberwood", "Spruce Resin", "Bulgarian Rose"],
      base: ["Ambergris", "Cedar", "Vanilla"],
    },
    facets: { freshness: 2, sweetness: 8, warmth: 7, woodyDepth: 6, longevity: 7, sillage: 8 },
    longevityHoursRange: [6, 9],
    sillageLabel: "Beast Mode",
    priceUsd: 25,
    bottleMl: 100,
    concentration: "Eau de Parfum",
    verdict:
      "Reproduces the saffron-and-jasmine opening and the amberwood core closely enough that most people will not separate them in the first hour. The differences are additions rather than omissions: a rose in the heart and a vanilla in the base that Baccarat Rouge 540 does not have, which make it read sweeter and less airy. It also fades noticeably sooner, and the original's much-discussed skin-scent phase is not really there.",
    offers: [
      {
        merchant: "Opulensi Perfumes",
        productName: "Barakkat Rouge 540 EDP Perfume",
        productUrl:
          "https://www.opulensi.com/products/barakkat-rouge-540-100ml-edp-perfume-spray-for-women-inspired-by-baccarat-rouge-540",
        price: 18.99,
        currency: "GBP",
        affiliateLinkId: "dupe-fragrance-world-barakkat-rouge-540",
        inStock: true,
      },
    ],
    verificationStatus: "declared",
  },
  {
    slug: "lattafa-ana-abiyedh-rouge",
    referenceSlug: "baccarat-rouge-540",
    name: "Ana Abiyedh Rouge",
    brand: "Lattafa",
    producerSlug: "lattafa",
    pairingBasis: {
      source: "Opulensi product listing",
      quote: "inspired by Rouge 540, with a unique twist of additional musk and saffron",
      url: "https://www.opulensi.com/products/ana-abiyedh-rouge-60ml-by-lattafa-eau-de-parfum-long-last",
    },
    notes: {
      top: ["Bitter Almond", "Saffron"],
      heart: ["Jasmine", "Cedar"],
      base: ["Musk", "Amber", "Ambergris"],
    },
    facets: { freshness: 3, sweetness: 6, warmth: 7, woodyDepth: 5, longevity: 7, sillage: 6 },
    longevityHoursRange: [5, 8],
    sillageLabel: "Strong",
    priceUsd: 22,
    bottleMl: 60,
    concentration: "Eau de Parfum",
    verdict:
      "The retailer's own description is the fair summary: inspired by Rouge 540 rather than aimed at it. The saffron and the amber-musk drydown are recognisably in the same family, but the bitter almond up top is this fragrance's own idea and it pulls the whole thing towards marzipan. Worth smelling on its own terms; the wrong pick if you specifically want the Baccarat accord.",
    offers: [
      {
        merchant: "Opulensi Perfumes",
        productName: "Ana Abiyedh Rouge 60ml by Lattafa Eau De Parfum",
        productUrl:
          "https://www.opulensi.com/products/ana-abiyedh-rouge-60ml-by-lattafa-eau-de-parfum-long-last",
        price: 17.74,
        currency: "GBP",
        affiliateLinkId: "dupe-lattafa-ana-abiyedh-rouge",
        inStock: true,
      },
    ],
    verificationStatus: "declared",
  },
  {
    slug: "ard-al-zaafaran-bint-hooran",
    referenceSlug: "good-girl",
    name: "Bint Hooran",
    brand: "Ard Al Zaafaran",
    producerSlug: "ard-al-zaafaran",
    pairingBasis: {
      source: "Opulensi product listing",
      quote: 'Inspired by "Good Girl" ... The notes of this perfume are similar to those of Good Girl',
      url: "https://www.opulensi.com/products/bint-hooran-100ml-eau-de-parfum-ard-al-zaafaran",
    },
    // Notes taken verbatim from the retailer's own published pyramid for this
    // product - which is exactly why the comparison lands where it does. See
    // the verdict: their two claims about this bottle do not agree with each
    // other, and the note diff is what shows it.
    notes: {
      top: ["Coriander", "Cypress", "Mandarin", "Lemon"],
      heart: ["Nutmeg", "Saffron", "Lily of the Valley", "Blue Lotus"],
      base: ["Vetiver", "Musk", "Sandalwood", "Cedar"],
    },
    facets: { freshness: 5, sweetness: 4, warmth: 5, woodyDepth: 6, longevity: 6, sillage: 5 },
    longevityHoursRange: [5, 7],
    sillageLabel: "Moderate",
    priceUsd: 19,
    bottleMl: 100,
    concentration: "Eau de Parfum",
    verdict:
      "This one is a warning about taking a retailer's word for it. The listing calls it a Good Girl alternative and says the notes are similar - then publishes a note pyramid for it built on coriander, cypress, citrus and vetiver, which shares nothing with Good Girl's almond, coffee, tuberose and cacao. On the retailer's own published data these are not the same kind of fragrance, and the match score below reflects that rather than the claim above it. It may well be a pleasant citrus-woody scent; we have no evidence it is a Good Girl substitute.",
    offers: [
      {
        merchant: "Opulensi Perfumes",
        productName: "Bint Hooran 100ml Eau de Parfum - for Women - Ard Al Zaafaran",
        productUrl:
          "https://www.opulensi.com/products/bint-hooran-100ml-eau-de-parfum-ard-al-zaafaran",
        price: 14.99,
        currency: "GBP",
        affiliateLinkId: "dupe-ard-al-zaafaran-bint-hooran",
        inStock: true,
      },
    ],
    verificationStatus: "declared",
  },
  {
    slug: "maison-alhambra-leonie",
    referenceSlug: "libre",
    name: "Léonie",
    brand: "Maison Alhambra",
    producerSlug: "maison-alhambra",
    pairingBasis: {
      source: "Opulensi product listing",
      quote: 'formerly known as Libbra and inspired by "Libre for women"',
      url: "https://www.opulensi.com/products/leonie-100ml-edp-by-maison-alhambra",
    },
    notes: {
      top: ["Mandarin Orange", "Neroli"],
      heart: ["Lavender", "Orange Blossom"],
      base: ["Ambergris", "Vanilla"],
    },
    facets: { freshness: 5, sweetness: 6, warmth: 6, woodyDepth: 2, longevity: 6, sillage: 6 },
    longevityHoursRange: [5, 8],
    sillageLabel: "Strong",
    priceUsd: 23,
    bottleMl: 100,
    concentration: "Eau de Parfum",
    verdict:
      "Gets the part of Libre that people actually buy it for - the lavender-and-orange-blossom accord over a vanilla base - and gets it close. It is a simpler build: no jasmine in the heart, no cedar underneath, so it reads softer and rounder where Libre has an edge to it. It also sits closer to the skin and gives up an hour or two.",
    offers: [
      {
        merchant: "Opulensi Perfumes",
        productName: "Léonie 100ml EDP by Maison Alhambra - Women",
        productUrl: "https://www.opulensi.com/products/leonie-100ml-edp-by-maison-alhambra",
        price: 18.39,
        currency: "GBP",
        affiliateLinkId: "dupe-maison-alhambra-leonie",
        inStock: true,
      },
    ],
    verificationStatus: "declared",
  },

  /* -- Added 2026-09-02, second batch: EDITORIALLY PAIRED ----------------
   * These five differ from everything above in one important way and it is
   * recorded rather than glossed: **no retailer states these pairings. We do.**
   * They carry no `pairingBasis`, which is exactly what its absence means.
   *
   * The products, prices, links and note pyramids are still real - read off
   * the Opulensi feed and its storefront like every other listing. Only the
   * judgement "this is an alternative to that" is ours.
   *
   * HOW EACH ONE WAS CHECKED, because recall alone is not good enough here:
   * a pairing was proposed from documented reputation, then tested against the
   * retailer's own published note pyramid. Several proposals FAILED that test
   * and were dropped rather than shipped:
   *   - Maison Alhambra Jean Lowe Matiere, proposed against Tom Ford Oud Wood
   *     because the Jean Lowe line is known to target Tom Ford. Its actual
   *     pyramid is blackcurrant / rose, cyclamen, narcissus / oud, incense -
   *     a rose-oud, sharing only "oud" with Oud Wood. Dropped.
   *   - Lattafa Maahir Black Edition against Parfums de Marly Layton. Layton
   *     is apple, lavender, vanilla; Maahir Black is pepper, saffron, leather,
   *     guaiac. Not the same fragrance at all. Dropped.
   *   - Al Areeq Gold, Fakhar Platin, Sceptre Amazonite, Opulent Oud Black,
   *     Jazzab Silver, Mocha Wood, Velvet Rose: no original could be named
   *     with confidence, so none was invented. Dropped.
   *
   * A CAVEAT ON THEIR SCORES THAT DOES NOT APPLY ABOVE. Because the note
   * pyramid was used to confirm the pairing, these five are mildly selected
   * for note overlap - so a high score here is partly a consequence of how
   * they were chosen, not an independent finding. The cited-pairing listings
   * above have no such bias: they were selected by what the retailer said, and
   * their scores range from 44% to 82% precisely because nothing pre-filtered
   * them. Read an editorially-paired score as "consistent with" rather than
   * "confirms". Do not close that gap by pairing on note overlap alone -
   * selecting on the metric and then publishing the metric is circular.
   */
  {
    slug: "lattafa-khamrah-qahwa",
    referenceSlug: "angels-share",
    name: "Khamrah Qahwa",
    brand: "Lattafa",
    producerSlug: "lattafa",
    notes: {
      top: ["Ginger", "Cinnamon", "Cardamom"],
      heart: ["Praline", "Candied Fruits", "White Flowers"],
      base: ["Vanilla", "Musk", "Benzoin", "Coffee", "Tonka Bean"],
    },
    facets: { freshness: 2, sweetness: 9, warmth: 8, woodyDepth: 4, longevity: 8, sillage: 8 },
    longevityHoursRange: [7, 10],
    sillageLabel: "Beast Mode",
    priceUsd: 36,
    bottleMl: 100,
    concentration: "Eau de Parfum",
    verdict:
      "The coffee flanker of Khamrah, and the coffee is the whole point of it: same cinnamon-praline-vanilla spine as its parent, with a roasted bitterness laid over the top. Against Angels' Share that cuts both ways - the coffee stands in for some of the cognac's boozy depth, but it also pulls the sweetness in a breakfast direction the Kilian never goes.",
    offers: [
      {
        merchant: "Opulensi Perfumes",
        productName: "Lattafa Khamrah Qahwa 100ml EDP",
        productUrl: "https://www.opulensi.com/products/khamrah-qahwa-100ml-edp-by-lattafa",
        price: 29.99,
        currency: "GBP",
        affiliateLinkId: "dupe-lattafa-khamrah-qahwa",
        inStock: true,
      },
    ],
    verificationStatus: "declared",
  },
  {
    slug: "maison-alhambra-maitre-de-blue",
    referenceSlug: "bleu-de-chanel",
    name: "Maitre De Blue",
    brand: "Maison Alhambra",
    producerSlug: "maison-alhambra",
    notes: {
      top: ["Grapefruit", "Lemon", "Mint", "Pink Pepper"],
      heart: ["Ginger", "Nutmeg", "Jasmine", "Melon"],
      base: ["Incense", "Amber", "Labdanum", "Agarwood", "Patchouli"],
    },
    facets: { freshness: 7, sweetness: 3, warmth: 5, woodyDepth: 6, longevity: 6, sillage: 6 },
    longevityHoursRange: [5, 8],
    sillageLabel: "Strong",
    priceUsd: 18,
    bottleMl: 100,
    concentration: "Eau de Parfum",
    verdict:
      "The closest structural match in this batch: citrus and pink pepper up top, the ginger-nutmeg-jasmine heart, incense underneath - that is Bleu de Chanel's skeleton, note for note. Where it parts company is the base, which swaps the original's dry vetiver and cedar for amber, labdanum and agarwood, so it lands warmer and heavier rather than crisp. At a tenth of the price the trade is easy to accept.",
    offers: [
      {
        merchant: "Opulensi Perfumes",
        productName: "Maitre De Blue Eau De Parfum 100ml by Maison Alhambra",
        productUrl:
          "https://www.opulensi.com/products/maitre-de-blue-eau-de-parfum-100ml-by-maison-alhambra",
        price: 14.6,
        currency: "GBP",
        affiliateLinkId: "dupe-maison-alhambra-maitre-de-blue",
        inStock: true,
      },
    ],
    verificationStatus: "declared",
  },
  {
    slug: "lattafa-velvet-oud",
    referenceSlug: "ombre-leather",
    name: "Velvet Oud",
    brand: "Lattafa",
    producerSlug: "lattafa",
    notes: {
      top: ["Cardamom", "Bergamot"],
      heart: ["Violet Leaf", "Patchouli"],
      base: ["Suede", "Oud", "Amber", "Musk"],
    },
    facets: { freshness: 3, sweetness: 3, warmth: 7, woodyDepth: 7, longevity: 7, sillage: 7 },
    longevityHoursRange: [6, 9],
    sillageLabel: "Strong",
    priceUsd: 28,
    bottleMl: 100,
    concentration: "Eau de Parfum",
    verdict:
      "Cardamom over violet leaf into suede and patchouli is the Ombre Leather outline, and this follows it closely enough to be recognisable within a minute. The difference is oud, which the Tom Ford does not have: it adds a dry, slightly medicinal edge under the leather that makes this read more Middle Eastern and less like a leather jacket. It is also lighter, and does not have the original's wall of projection.",
    offers: [
      {
        merchant: "Opulensi Perfumes",
        productName: "Velvet Oud Perfume 100ml EDP by Lattafa",
        productUrl: "https://www.opulensi.com/products/velvet-oud-perfume-100ml-edp",
        price: 22.99,
        currency: "GBP",
        affiliateLinkId: "dupe-lattafa-velvet-oud",
        inStock: true,
      },
    ],
    verificationStatus: "declared",
  },
  {
    slug: "lattafa-qaed-al-fursan-unlimited",
    referenceSlug: "aventus",
    name: "Qaed Al Fursan Unlimited",
    brand: "Lattafa",
    producerSlug: "lattafa",
    notes: {
      top: ["Bergamot", "Berries", "Apple", "Black Birch"],
      heart: ["Woody Notes", "Jasmine", "Patchouli"],
      base: ["Vanilla", "Oakmoss", "Ambergris", "Musk"],
    },
    facets: { freshness: 6, sweetness: 6, warmth: 5, woodyDepth: 6, longevity: 7, sillage: 7 },
    longevityHoursRange: [6, 8],
    sillageLabel: "Strong",
    priceUsd: 24,
    bottleMl: 90,
    concentration: "Eau de Parfum",
    verdict:
      "A third route at Aventus, and a different one from the two above it: where Club de Nuit chases the smoky pineapple and Asad goes sweeter, this keeps the fruit-and-birch structure but softens it with oakmoss and vanilla. That makes it the most wearable of the three and the least dramatic - it will not turn heads the way the Armaf does, and the birch smoke that gives Aventus its signature is much quieter here.",
    offers: [
      {
        merchant: "Opulensi Perfumes",
        productName: "Qaed Al Fursan Unlimited Perfume 90ml EDP by Lattafa",
        productUrl:
          "https://www.opulensi.com/products/qaed-al-fursan-unlimited-perfume-90ml-edp-by-lattafa",
        price: 16.99,
        currency: "GBP",
        affiliateLinkId: "dupe-lattafa-qaed-al-fursan-unlimited",
        inStock: true,
      },
    ],
    verificationStatus: "declared",
  },
  {
    slug: "lattafa-mayar-cherry-intense",
    referenceSlug: "lost-cherry",
    name: "Mayar Cherry Intense",
    brand: "Lattafa",
    producerSlug: "lattafa",
    notes: {
      top: ["Strawberry", "Bergamot"],
      heart: ["Cherry Jam", "Cacao"],
      base: ["Vanilla", "Patchouli"],
    },
    facets: { freshness: 2, sweetness: 9, warmth: 6, woodyDepth: 3, longevity: 7, sillage: 7 },
    longevityHoursRange: [6, 9],
    sillageLabel: "Strong",
    priceUsd: 32,
    bottleMl: 100,
    concentration: "Eau de Parfum",
    verdict:
      "The weakest pairing of these five and worth being plain about. Both are cherry gourmands and both use patchouli underneath, but Lost Cherry is built on a sour, almond-tinged black cherry with rose and plum in the heart, and this is jam - strawberry, cacao and vanilla, sweet the whole way through. If you want the idea of an expensive cherry fragrance it delivers; if you specifically want Lost Cherry's bitter-almond edge, it is not here.",
    offers: [
      {
        merchant: "Opulensi Perfumes",
        productName: "Mayar Cherry Intense 100ml Eau de Parfum by Lattafa",
        productUrl:
          "https://www.opulensi.com/products/mayar-cherry-intense-100ml-eau-de-parfum-by-lattafa",
        price: 26.99,
        currency: "GBP",
        affiliateLinkId: "dupe-lattafa-mayar-cherry-intense",
        inStock: true,
      },
    ],
    verificationStatus: "declared",
  },

  /* -- Added 2026-09-02, third batch: THE LOW-SCORING ONES ---------------
   * These two were WRONGLY REJECTED an hour earlier, and the reason they were
   * rejected was a misreading of what this site is for.
   *
   * They had been proposed, checked against the retailer's note pyramid,
   * found to diverge, and dropped as "not the same fragrance". The founder
   * pushed back, correctly: a listing does not have to be a close match to
   * earn its place. The Dupe Finder ranks candidates and shows where each one
   * matches and where it does not — a 50% comparison is a *result*, not a
   * failure, and Bint Hooran at 44% was already proof of that.
   *
   * The distinction that actually matters is NOT "does it score well". It is:
   *   - Is the product real? (feed) — yes.
   *   - Are the notes real? (retailer's own pyramid) — yes.
   *   - Is this a comparison a buyer would actually make? — yes for both;
   *     Maison Alhambra's Jean Lowe line is its Tom Ford line, and Lattafa's
   *     Maahir line is routinely shelved against Parfums de Marly.
   * A pairing fails only when the last question is no — which is why Anfar's
   * and Adyan's own compositions are still absent, and should stay absent.
   *
   * One correction worth recording: the rejection note claimed Maahir Black
   * and Layton were "not remotely the same". That overstated it. They share
   * bergamot, vanilla, sandalwood, guaiac wood and pepper — most of Layton's
   * base. They diverge at the top, not throughout.
   */
  {
    slug: "maison-alhambra-jean-lowe-matiere",
    referenceSlug: "oud-wood",
    name: "Jean Lowe Matiere",
    brand: "Maison Alhambra",
    producerSlug: "maison-alhambra",
    notes: {
      top: ["Blackcurrant", "Watery Notes"],
      heart: ["Rose", "Cyclamen", "Narcissus", "Jasmine Sambac"],
      base: ["Oud", "Patchouli", "Incense", "Benzoin"],
    },
    facets: { freshness: 4, sweetness: 5, warmth: 7, woodyDepth: 7, longevity: 7, sillage: 7 },
    longevityHoursRange: [6, 9],
    sillageLabel: "Strong",
    priceUsd: 32,
    bottleMl: 100,
    concentration: "Eau de Parfum",
    verdict:
      "Sold as part of Maison Alhambra's Tom Ford line, and the score is the honest answer to whether it substitutes for Oud Wood: not really. Both are built on oud, but Oud Wood surrounds it with rosewood, cardamom and a creamy sandalwood-vanilla drydown, while this one is a rose-oud — blackcurrant and florals up front, patchouli and incense underneath. If you want the Tom Ford this is the wrong bottle. If you like oud with rose over it, it is a lot of fragrance for the money, and Noir de Noir is the closer bottle in our catalog.",
    offers: [
      {
        merchant: "Opulensi Perfumes",
        productName: "Jean Lowe Matiere 100ml EDP By Maison Alhambra",
        productUrl:
          "https://www.opulensi.com/products/jean-lowe-matiere-100ml-edp-by-maison-alhambra",
        price: 26.08,
        currency: "GBP",
        affiliateLinkId: "dupe-maison-alhambra-jean-lowe-matiere",
        inStock: true,
      },
    ],
    verificationStatus: "declared",
  },
  {
    slug: "lattafa-maahir-black-edition",
    referenceSlug: "layton",
    name: "Maahir Black Edition",
    brand: "Lattafa",
    producerSlug: "lattafa",
    notes: {
      top: ["Bergamot", "Pink Pepper", "Black Pepper", "Saffron"],
      heart: ["Cade", "Labdanum", "Gurjum Balsam", "Vanilla", "Frankincense", "Amber"],
      base: ["Leather", "Agarwood", "Sandalwood", "Cedarwood", "Patchouli", "Guaiac Wood"],
    },
    facets: { freshness: 3, sweetness: 5, warmth: 8, woodyDepth: 8, longevity: 8, sillage: 8 },
    longevityHoursRange: [8, 11],
    sillageLabel: "Beast Mode",
    priceUsd: 30,
    bottleMl: 100,
    concentration: "Eau de Parfum",
    verdict:
      "The overlap is real but it is all at the bottom: vanilla, sandalwood, guaiac wood and pepper are Layton's base and they are here too, which is why the two can read similarly three hours in. The openings could not be less alike. Layton starts on apple and lavender and stays creamy and sweet; this starts on black pepper and saffron and goes into smoke, leather and cade. Buy it if the part of Layton you want is the warm woody drydown. Do not expect the first twenty minutes to resemble it at all.",
    offers: [
      {
        merchant: "Opulensi Perfumes",
        productName: "Maahir BLACK EDITION 100ml Eau de Parfum Lattafa",
        productUrl:
          "https://www.opulensi.com/products/maahir-black-edition-100ml-eau-de-parfum-lattafa-spicy-sweet-amber-woody",
        price: 24.99,
        currency: "GBP",
        affiliateLinkId: "dupe-lattafa-maahir-black-edition",
        inStock: true,
      },
    ],
    verificationStatus: "declared",
  },

  /* -- Added 2026-09-02, coverage batch ---------------------------------
   * Eight more, chosen to widen which ORIGINALS have an alternative rather
   * than to pile more listings onto the ones already covered. Five of the
   * references below had nothing against them before: Sauvage Elixir,
   * Intense Cafe, Tuscan Leather, Interlude Man, Rose 31.
   *
   * All eight come from houses that actually build designer alternatives -
   * Lattafa, Maison Alhambra, Fragrance World, French Avenue, Afnan, Rasasi.
   * That filter is doing real work: it excludes Anfar (33 in-stock products),
   * Adyan (21) and Al-Rehab (23), whose ranges are their own compositions.
   * Nobody shelves an Al-Rehab roll-on against a designer bottle, so pairing
   * one would be inventing a comparison rather than reporting it.
   *
   * An automated matcher was tried first and thrown away. Scoring feed names
   * against reference names produced "Al-Rehab" -> Initio *Rehab* and every
   * product containing the word "oud" -> Gucci *Intense Oud*. Name similarity
   * is not evidence. These were picked by reading the pyramids.
   */
  {
    slug: "afnan-embassy-royal-extrait",
    referenceSlug: "sauvage-elixir",
    name: "Embassy Royal Extrait",
    brand: "Afnan",
    producerSlug: "afnan",
    notes: {
      top: ["Nutmeg", "Cinnamon", "Cardamom", "Grapefruit"],
      heart: ["Lavender"],
      base: ["Sandalwood", "Amber", "Patchouli", "Vetiver"],
    },
    facets: { freshness: 5, sweetness: 4, warmth: 8, woodyDepth: 8, longevity: 8, sillage: 8 },
    longevityHoursRange: [7, 10],
    sillageLabel: "Beast Mode",
    priceUsd: 42,
    bottleMl: 100,
    concentration: "Extrait de Parfum",
    verdict:
      "The closest match in the whole catalog, and it is not subtle about it: nutmeg, cinnamon, cardamom and grapefruit over lavender, landing on sandalwood, amber, patchouli and vetiver, is Sauvage Elixir's pyramid almost note for note. What the Dior has that this does not is the licorice in the heart, which is where its odd sweet-anise character comes from. Without it this reads as a more straightforward spicy-woody, and slightly less strange.",
    offers: [
      {
        merchant: "Opulensi Perfumes",
        productName: "Embassy Royal Extrait 100ml Eau De Parfum by Miguel Mara by Afnan",
        productUrl:
          "https://www.opulensi.com/products/embassy-royal-extrait-100ml-eau-de-parfum-miguel-mara-by-afnan",
        price: 32.99,
        currency: "GBP",
        affiliateLinkId: "dupe-afnan-embassy-royal-extrait",
        inStock: true,
      },
    ],
    verificationStatus: "declared",
  },
  {
    slug: "french-avenue-royal-blend-extrait",
    referenceSlug: "angels-share",
    name: "Royal Blend Extrait",
    brand: "French Avenue",
    producerSlug: "french-avenue",
    notes: {
      top: ["Cognac", "Cinnamon", "Plum"],
      heart: ["Iris", "Myrrh"],
      base: ["Tonka Bean", "Vanilla"],
    },
    facets: { freshness: 2, sweetness: 8, warmth: 8, woodyDepth: 4, longevity: 8, sillage: 7 },
    longevityHoursRange: [7, 10],
    sillageLabel: "Strong",
    priceUsd: 35,
    bottleMl: 100,
    concentration: "Extrait de Parfum",
    verdict:
      "The only alternative here that opens on actual cognac, which is the note Khamrah and its flankers never attempt - so on the thing that makes Angels' Share what it is, this gets closer than the better-known options. It is drier, though: iris and myrrh in the heart where the Kilian has praline, so it loses the dessert quality and reads more like a spirit and less like a pudding.",
    offers: [
      {
        merchant: "Opulensi Perfumes",
        productName: "Royal Blend Extrait 100ml EDP by French Avenue",
        productUrl: "https://www.opulensi.com/products/royal-blend-extrait-100ml-edp-by-french-avenue",
        price: 27.99,
        currency: "GBP",
        affiliateLinkId: "dupe-french-avenue-royal-blend-extrait",
        inStock: true,
      },
    ],
    verificationStatus: "declared",
  },
  {
    slug: "fragrance-world-mocha-wood",
    referenceSlug: "intense-cafe",
    name: "Mocha Wood",
    brand: "Fragrance World",
    producerSlug: "fragrance-world",
    notes: {
      top: ["Bergamot", "Hazelnut", "Saffron", "Ylang-Ylang", "Rhubarb"],
      heart: ["Coffee", "Rose", "Mocha", "Tobacco", "Tonka Bean"],
      base: ["Patchouli", "Amber", "Musk"],
    },
    facets: { freshness: 2, sweetness: 8, warmth: 8, woodyDepth: 4, longevity: 7, sillage: 7 },
    longevityHoursRange: [6, 9],
    sillageLabel: "Strong",
    priceUsd: 17,
    bottleMl: 100,
    concentration: "Eau de Parfum",
    verdict:
      "Coffee and rose together is Intense Cafe's whole signature, and this has both in the heart, so the comparison is fair. It builds them differently: chocolate, tobacco and hazelnut make this a fuller gourmand where the Montale keeps the coffee bitter and lets the rose stay sharp against it. Cheapest listing in the catalog by some distance, and the least like its original in texture rather than in idea.",
    offers: [
      {
        merchant: "Opulensi Perfumes",
        productName: "Mocha Wood Perfume 100ml EDP by Fragrance World",
        productUrl: "https://www.opulensi.com/products/mocha-wood-perfume-100ml-edp-by-fragrance-world",
        price: 13.1,
        currency: "GBP",
        affiliateLinkId: "dupe-fragrance-world-mocha-wood",
        inStock: true,
      },
    ],
    verificationStatus: "declared",
  },
  {
    slug: "lattafa-al-areeq-gold",
    referenceSlug: "tuscan-leather",
    name: "Al Areeq Gold",
    brand: "Lattafa",
    producerSlug: "lattafa",
    notes: {
      top: ["Saffron", "Black Tea"],
      heart: ["Incense", "Suede"],
      base: ["Amberwood", "Vanilla", "Musk"],
    },
    facets: { freshness: 3, sweetness: 5, warmth: 8, woodyDepth: 6, longevity: 8, sillage: 7 },
    longevityHoursRange: [7, 10],
    sillageLabel: "Strong",
    priceUsd: 38,
    bottleMl: 100,
    concentration: "Eau de Parfum",
    verdict:
      "Saffron over suede with incense underneath is the spine of Tuscan Leather, and this has all three. The missing piece is the raspberry, which is the note that gives the Tom Ford its odd fruity-bloody quality and the reason people either love it or cannot wear it. Black tea stands in its place here, which makes this drier, more conventional, and considerably easier to wear to work.",
    offers: [
      {
        merchant: "Opulensi Perfumes",
        productName: "Al Areeq Gold Perfume 100ml EDP by Lattafa Pride",
        productUrl:
          "https://www.opulensi.com/products/al-areeq-gold-perfume-100ml-edp-arabian-fragrance-safron-leather-black-tea-vanilla-musk",
        price: 29.99,
        currency: "GBP",
        affiliateLinkId: "dupe-lattafa-al-areeq-gold",
        inStock: true,
      },
    ],
    verificationStatus: "declared",
  },
  {
    slug: "maison-alhambra-sceptre-amazonite",
    referenceSlug: "interlude-man",
    name: "Sceptre Amazonite",
    brand: "Maison Alhambra",
    producerSlug: "maison-alhambra",
    notes: {
      top: ["Nutmeg", "Cinnamon"],
      heart: ["Cypriol", "Olibanum"],
      base: ["Oud", "Saffron", "Amber"],
    },
    facets: { freshness: 2, sweetness: 3, warmth: 8, woodyDepth: 8, longevity: 8, sillage: 8 },
    longevityHoursRange: [7, 10],
    sillageLabel: "Beast Mode",
    priceUsd: 26,
    bottleMl: 100,
    concentration: "Eau de Parfum",
    verdict:
      "Aims at the smoky-incense territory Interlude Man owns, and gets the general shape: frankincense and cypriol over oud, dense and dry. What it does not attempt is the Amouage's opoponax-and-oregano weirdness, the part that makes Interlude smell like burning resin in a church rather than like a woody fragrance. Treat this as a much cheaper way into the genre, not as a replacement.",
    offers: [
      {
        merchant: "Opulensi Perfumes",
        productName: "Sceptre Amazonite 100ml EDP by Maison Alhambra",
        productUrl: "https://www.opulensi.com/products/sceptre-amazonite-100ml-edp-by-maison-alhambra",
        price: 19.99,
        currency: "GBP",
        affiliateLinkId: "dupe-maison-alhambra-sceptre-amazonite",
        inStock: true,
      },
    ],
    verificationStatus: "declared",
  },
  {
    slug: "lattafa-velvet-rose",
    referenceSlug: "rose-31",
    name: "Velvet Rose",
    brand: "Lattafa",
    producerSlug: "lattafa",
    notes: {
      top: ["Rose", "Patchouli"],
      heart: ["Labdanum", "Musk"],
      base: ["Musk", "Amber"],
    },
    facets: { freshness: 2, sweetness: 6, warmth: 6, woodyDepth: 4, longevity: 6, sillage: 6 },
    longevityHoursRange: [5, 8],
    sillageLabel: "Strong",
    priceUsd: 25,
    bottleMl: 100,
    concentration: "Eau de Parfum",
    verdict:
      "A loose comparison and the score says so. Both are rose fragrances built to be worn by anyone, but Rose 31 surrounds its rose with cumin, olibanum and vetiver until the flower is almost incidental - dry, spiky, faintly savoury. This is a sweet rose on musk and amber with nothing sharp in it. Same flower, opposite intention.",
    offers: [
      {
        merchant: "Opulensi Perfumes",
        productName: "Velvet Rose Perfume 100ml EDP by Lattafa",
        productUrl:
          "https://www.opulensi.com/products/velvet-rose-perfume-100ml-edp-by-lattafa-sweet-floral-musky-and-amber",
        price: 19.99,
        currency: "GBP",
        affiliateLinkId: "dupe-lattafa-velvet-rose",
        inStock: true,
      },
    ],
    verificationStatus: "declared",
  },
  {
    slug: "rasasi-hawas-black",
    referenceSlug: "aventus",
    name: "Hawas Black",
    brand: "Rasasi",
    producerSlug: "rasasi",
    notes: {
      top: ["Bergamot", "Pineapple", "Grapefruit"],
      heart: ["Patchouli", "Cedarwood", "Jasmine"],
      base: ["Oakmoss", "Woody Notes", "Amber"],
    },
    facets: { freshness: 7, sweetness: 5, warmth: 5, woodyDepth: 7, longevity: 8, sillage: 7 },
    longevityHoursRange: [7, 10],
    sillageLabel: "Strong",
    priceUsd: 55,
    bottleMl: 100,
    concentration: "Eau de Parfum",
    verdict:
      "The fourth Aventus alternative in this catalog and the most restrained. Pineapple, patchouli and oakmoss is the right skeleton, and Rasasi build it with better materials than the budget end of the category - it smells expensive in a way Club de Nuit does not. What it lacks is the birch smoke, so the part of Aventus that reads as charred and slightly harsh is simply absent. Also the most expensive listing here, which narrows the point of it.",
    offers: [
      {
        merchant: "Opulensi Perfumes",
        productName: "Rasasi Hawas Black Eau de Parfum 100ml",
        productUrl: "https://www.opulensi.com/products/rasasi-hawas-black-eau-de-parfum-100ml",
        price: 44.99,
        currency: "GBP",
        affiliateLinkId: "dupe-rasasi-hawas-black",
        inStock: true,
      },
    ],
    verificationStatus: "declared",
  },
  {
    slug: "afnan-supremacy-not-only-intense",
    referenceSlug: "aventus",
    name: "Supremacy Not Only Intense",
    brand: "Afnan",
    producerSlug: "afnan",
    notes: {
      top: ["Bergamot", "Apple", "Black Currant"],
      heart: ["Lavender", "Patchouli", "Oakmoss"],
      base: ["Saffron", "Musk", "Patchouli"],
    },
    facets: { freshness: 6, sweetness: 5, warmth: 6, woodyDepth: 7, longevity: 8, sillage: 8 },
    longevityHoursRange: [8, 11],
    sillageLabel: "Beast Mode",
    priceUsd: 60,
    bottleMl: 100,
    concentration: "Extrait de Parfum",
    verdict:
      "Takes Aventus's fruit-and-oakmoss frame and pushes it somewhere darker with lavender and saffron, so it is less a copy than a reading of it. Blackcurrant and apple are there, oakmoss and patchouli are there, and at extrait strength it lasts longer than the original does. The pineapple is not, which is the single note most people identify Aventus by - so it will not fool anyone who knows the Creed.",
    offers: [
      {
        merchant: "Opulensi Perfumes",
        productName: "Supremacy Not Only Intense 100ml Extrait De Parfum by Afnan",
        productUrl:
          "https://www.opulensi.com/products/supremacy-not-only-intense-extrait-de-parfum-100ml-by-afnan",
        price: 48.99,
        currency: "GBP",
        affiliateLinkId: "dupe-afnan-supremacy-not-only-intense",
        inStock: true,
      },
    ],
    verificationStatus: "declared",
  },
];

/**
 * Listings with their product photographs merged in, mirroring how
 * lib/data/references.ts merges FEED_IMAGES into REFERENCES.
 *
 * Only `imageUrl` is merged. Nothing else from the feed touches a listing:
 * prices in particular stay hand-maintained here, because `priceUsd` is a
 * typical street price for a standard bottle while the feed quotes one
 * merchant's price for one presentation, in their currency. Those are
 * different claims and the "Nx cheaper per ml" line depends on not confusing
 * them — see merchantListing in lib/types.ts.
 *
 * A listing with no entry in DUPE_IMAGES keeps `imageUrl` undefined and
 * renders the generated note-signature mark, which is the correct outcome for
 * anything we cannot license an image for.
 */
export const DUPES: DupeCandidate[] = LISTINGS.map((dupe) => {
  const image = DUPE_IMAGES[dupe.slug];
  return image ? { ...dupe, imageUrl: image } : dupe;
});

export function getReference(slug: string): ReferenceFragrance | undefined {
  return REFERENCES.find((r) => r.slug === slug);
}

export function getDupesFor(referenceSlug: string): DupeCandidate[] {
  return DUPES.filter((d) => d.referenceSlug === referenceSlug);
}

export function getDupe(slug: string): DupeCandidate | undefined {
  return DUPES.find((d) => d.slug === slug);
}
