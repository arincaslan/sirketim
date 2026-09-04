import { REFERENCES } from "@/lib/data/references";
import { DUPE_IMAGES } from "@/lib/data/dupe-images.generated";
import type { DupeCandidate, ReferenceFragrance } from "@/lib/types";

export { REFERENCES };

/**
 * Producer listings for the Dupe Finder.
 *
 * WAS DELIBERATELY EMPTY 2026-08-27 → 2026-09-01, and the reasoning below is
 * kept in full because it is the standard all twenty-nine current listings had
 * to meet, not a superseded note. Read it before adding a thirtieth.
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
 * So as of 2026-09-01/02: twenty-five listings across eighteen originals,
 * twenty-six offers, twenty-three with a working programme behind them,
 * twenty-two rendering an actual buy button. EXTENDED 2026-09-03 (four more,
 * all cited pairings, two of them landing on originals that previously had no
 * alternative at all - Neroli Portofino and Black Orchid): twenty-nine
 * listings across twenty originals, thirty offers, twenty-seven with a
 * working programme behind them, twenty-three rendering an actual buy button.
 * EXTENDED AGAIN the same day, the FINAL batch from this feed (three more,
 * found by hand-scanning the feed a second time for retailer-stated pairings
 * the first pass missed; two land on originals that previously had no
 * alternative at all - Tobacco Vanille and By the Fireplace): thirty-two
 * listings across twenty-two originals, thirty-three offers, thirty with a
 * working programme behind them, still twenty-three rendering an actual buy
 * button - all three of those offers are OUT OF STOCK on the merchant's own
 * page despite the feed marking them `in_stock=1`, the same pattern as every
 * batch before it, checked the same way (scripts/check-affiliate-links.mjs).
 *
 * **THE OPULENSI FEED IS EXHAUSTED AT THAT POINT AND STILL IS. THE SITE IS NOT.**
 * Two passes over its 610 rows found nothing further, and the fix was never
 * more scanning - it was a second dupe-side merchant, which arrived on
 * 2026-09-03: The CLONE, via Clone of Perfume (Awin 117395), nine listings from
 * an 11-row feed. So "this merchant tops out at 32/22" remains true of Opulensi
 * and is no longer a statement about the catalog.
 *
 * CURRENT TOTAL, 2026-09-03, across BOTH merchants: **forty-one listings across
 * twenty-seven originals**, forty-two offers, thirty-nine with a working
 * programme behind them, **thirty-two rendering an actual buy button**. The
 * jump in buyable listings is larger than the jump in listings because all nine
 * new offers are genuinely in stock, which had not happened before.
 *
 * Recompute rather than trusting any of this before adding a forty-second.
 * `grep -c "^  {$"` undercounts (nested objects share that shape); count
 * top-level slugs instead:
 *
 *     grep -c '^    slug: "' lib/dupes-data.ts
 *
 * The two My Perfume Shop-only listings also have NO IMAGE, for the same reason
 * rather than by coincidence. The licence we rely on for bottle photography is
 * "supplied by an affiliate programme we are enrolled in, to promote that
 * merchant" — which evaporates for a closed programme. They render the
 * generated note-signature mark instead.
 *
 * EVERY LISTING IS `declared`, NOT `verified`. We have not bought or worn any of
 * them. `verified` is earned by editorial review and must never be defaulted
 * to — so all of them are capped by getPublishedScore(), which is the intended
 * behaviour, not a limitation to work around. Three of the nine Clone of Perfume
 * listings actually reach that cap; the batch comment above them explains why
 * that is a warning sign about the merchant's data rather than a compliment.
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

  /* -- Added 2026-09-03 ---------------------------------------------------
   * Four more from the Opulensi feed, all cited pairings (the retailer names
   * the Western original itself, in the product URL or its own description).
   * Two new originals get their first alternative: Neroli Portofino and
   * Black Orchid. The other two land on Oud Wood, which already had one
   * listing (Jean Lowe Matiere), taking it to three.
   *
   * STOCK, CHECKED LIVE 2026-09-03 against each product's own schema.org
   * availability (not the feed, which marks all four `in_stock=1` the same
   * way it did for the Armaf listing before this project learned not to trust
   * it): Neroli Riviera, Oud Orchid and Qaa'ed are OutOfStock; Mohra is
   * InStock. All four links still trace correctly end to end (curl -L with
   * clickref=probe lands on opulensi.com with utm_id=..._probe and an awc
   * cookie), so all four are kept per the standing rule - the link earns the
   * moment stock returns, deleting it would only have to be redone.
   *
   * Qaa'ed's bottle size was a genuine conflict worth resolving rather than
   * guessing: the feed's product_name says "100ml" but the URL slug says
   * "30ml". The live page's own schema.org Product name resolves it -
   * "Lattafa Qaa'ed Eau de Parfum 100ml Lattafa" - so bottleMl is 100, and the
   * URL slug is simply stale.
   *
   * Mohra is the weakest citation of the four and the verdict says so. The
   * retailer's description calls it "reminiscent of Tom Ford's Oud Wood," but
   * its own published note pyramid lists no oud at all - the real overlap
   * with Oud Wood is one shared base note (sandalwood) and a pepper note
   * (black pepper vs. Oud Wood's Chinese pepper). Same posture as Bint
   * Hooran: quote the claim, show the note diff, let the score say what it
   * says.
   */
  {
    slug: "fragrance-world-neroli-riviera",
    referenceSlug: "neroli-portofino",
    name: "Neroli Riviera",
    brand: "Fragrance World",
    producerSlug: "fragrance-world",
    pairingBasis: {
      source: "Opulensi product listing",
      quote: "Inspired by the freshness of Neroli Portofino",
      url: "https://www.opulensi.com/products/neroli-riviera-80ml-edp-by-fragrance-world",
    },
    notes: {
      top: ["Bergamot", "Mandarin Orange", "Lemon", "Bitter Orange", "Lavender", "Rosemary", "Myrtle"],
      heart: ["African Orange Flower", "Neroli", "Jasmine", "Pittosporum"],
      base: ["Amber", "Ambrette Seed", "Angelica"],
    },
    facets: { freshness: 8, sweetness: 3, warmth: 4, woodyDepth: 2, longevity: 6, sillage: 6 },
    longevityHoursRange: [5, 7],
    sillageLabel: "Strong",
    priceUsd: 18,
    bottleMl: 80,
    concentration: "Eau de Parfum",
    verdict:
      "Gets the core outline right: bergamot and lemon up top, angelica and amber in the base, and neroli itself carried through to the heart rather than dropped. It is a busier build than the original - rosemary and myrtle add an herbal edge Neroli Portofino does not have - and the base swaps Tom Ford's sandalwood-and-musk warmth for a drier ambrette seed, so it reads a shade greener and less skin-close.",
    offers: [
      {
        merchant: "Opulensi Perfumes",
        productName: "Neroli Riviera 80ml EDP by Fragrance World",
        productUrl: "https://www.opulensi.com/products/neroli-riviera-80ml-edp-by-fragrance-world",
        price: 13.79,
        currency: "GBP",
        affiliateLinkId: "dupe-fragrance-world-neroli-riviera",
        // Checked 2026-09-03: live page's schema.org availability is
        // OutOfStock; the Awin feed row says in_stock=1. Feed is stale, the
        // merchant's page is the truth - see scripts/check-affiliate-links.mjs.
        inStock: false,
      },
    ],
    verificationStatus: "declared",
  },
  {
    slug: "ard-al-zaafaran-oud-orchid",
    referenceSlug: "black-orchid",
    name: "Oud Orchid",
    brand: "Ard Al Zaafaran",
    producerSlug: "ard-al-zaafaran",
    pairingBasis: {
      source: "Opulensi product listing",
      quote: "inspired by tom ford black orchid",
      url: "https://www.opulensi.com/products/oud-orchid-edp-100ml-by-ard-al-zaafaran-inspired-by-tom-ford-black-orchid",
    },
    notes: {
      top: ["Oudh", "Dark Chocolate", "Tuber", "Orchids", "Vanilla"],
      heart: ["Patchouli", "Ylang-Ylang", "Sandalwood", "White Musk", "Citrus"],
      base: ["Jasmine", "Incense"],
    },
    facets: { freshness: 2, sweetness: 6, warmth: 8, woodyDepth: 8, longevity: 8, sillage: 8 },
    longevityHoursRange: [7, 10],
    sillageLabel: "Beast Mode",
    priceUsd: 22,
    bottleMl: 100,
    concentration: "Eau de Parfum",
    verdict:
      "Shares more of Black Orchid's unusual architecture than the name change suggests: dark chocolate, orchid, vanilla, patchouli, sandalwood and incense all carry over. What it adds is oud up top, which Black Orchid does not have at all, pulling the opening in a smokier direction; what it drops is the black truffle and black currant that give the original its odd fruity-earthy signature. Worth trying if you want the gourmand-woody heart without the truffle.",
    offers: [
      {
        merchant: "Opulensi Perfumes",
        productName: "Oud Orchid EDP 100ml by Ard Al Zaafaran",
        productUrl:
          "https://www.opulensi.com/products/oud-orchid-edp-100ml-by-ard-al-zaafaran-inspired-by-tom-ford-black-orchid",
        price: 17.99,
        currency: "GBP",
        affiliateLinkId: "dupe-ard-al-zaafaran-oud-orchid",
        // Checked 2026-09-03: live page's schema.org availability is
        // OutOfStock; the Awin feed row says in_stock=1.
        inStock: false,
      },
    ],
    verificationStatus: "declared",
  },
  {
    slug: "lattafa-qaed",
    referenceSlug: "oud-wood",
    name: "Qaa'ed",
    brand: "Lattafa",
    producerSlug: "lattafa",
    pairingBasis: {
      source: "Opulensi product listing",
      quote: "inspired by tf oud wood",
      url: "https://www.opulensi.com/products/qaa-ed-eau-de-parfum-30ml-lattafa-inspired-by-tf-oud-wood",
    },
    notes: {
      top: ["Saffron", "Nutmeg", "Cinnamon Bark", "Cardamom"],
      heart: ["Oud Wood", "Sandalwood"],
      base: ["Vanilla", "Amber", "Leather"],
    },
    facets: { freshness: 2, sweetness: 5, warmth: 7, woodyDepth: 8, longevity: 8, sillage: 7 },
    longevityHoursRange: [7, 10],
    sillageLabel: "Strong",
    priceUsd: 26,
    // Bottle size conflict in the feed: product_name says "100ml", the URL
    // slug says "30ml". Resolved 2026-09-03 against the live page's own
    // schema.org Product name ("Lattafa Qaa'ed Eau de Parfum 100ml Lattafa") -
    // the slug is stale, the bottle is 100ml.
    bottleMl: 100,
    concentration: "Eau de Parfum",
    verdict:
      "The heart is an exact note-for-note match - oud and sandalwood, nothing else - which is unusual even among the closer alternatives here. It diverges at both ends: the top trades Oud Wood's rosewood-and-Chinese-pepper for a warmer saffron-cinnamon-cardamom spice mix, and the base swaps tonka bean for leather, so the drydown reads more oriental-leathery than the original's creamy sandalwood-vanilla finish. A second, spicier route to the same original alongside Jean Lowe Matiere.",
    offers: [
      {
        merchant: "Opulensi Perfumes",
        productName: "Lattafa Qaa'ed Eau de Parfum 100ml Lattafa",
        productUrl:
          "https://www.opulensi.com/products/qaa-ed-eau-de-parfum-30ml-lattafa-inspired-by-tf-oud-wood",
        price: 17.99,
        currency: "GBP",
        affiliateLinkId: "dupe-lattafa-qaed",
        // Checked 2026-09-03: live page's schema.org availability is
        // OutOfStock; the Awin feed row says in_stock=1.
        inStock: false,
      },
    ],
    verificationStatus: "declared",
  },
  {
    slug: "lattafa-mohra",
    referenceSlug: "oud-wood",
    name: "Mohra",
    brand: "Lattafa",
    producerSlug: "lattafa",
    pairingBasis: {
      source: "Opulensi product listing",
      quote: "reminiscent of Tom Ford's Oud Wood",
      url: "https://www.opulensi.com/products/mohra-eau-de-parfum-100ml-by-lattafa",
    },
    notes: {
      top: ["Bergamot", "Blood Orange", "Lavender", "Saffron"],
      heart: ["Rose", "Black Pepper", "Cashmeran"],
      base: ["Cedarwood", "Sandalwood", "Patchouli", "Cistus Labdanum", "Musk"],
    },
    facets: { freshness: 3, sweetness: 4, warmth: 7, woodyDepth: 6, longevity: 7, sillage: 7 },
    longevityHoursRange: [6, 9],
    sillageLabel: "Strong",
    priceUsd: 25,
    bottleMl: 100,
    concentration: "Eau de Parfum",
    verdict:
      "The retailer's own copy calls this 'reminiscent of Tom Ford's Oud Wood,' but its published note pyramid barely supports that: there is no oud listed at all, and the real overlap is one shared base note (sandalwood) plus a pepper note that is black pepper here against Oud Wood's Chinese pepper. What Mohra actually is, by its own notes, is a rose-pepper-cedarwood fragrance with cashmeran and labdanum - closer to a modern woody-spicy than to Oud Wood's rosewood-and-cardamom opening or its tonka-vanilla base. Buy it as its own thing rather than expecting Oud Wood in a different bottle.",
    offers: [
      {
        merchant: "Opulensi Perfumes",
        productName: "Mohra Eau De Parfum 100ml by Lattafa",
        productUrl: "https://www.opulensi.com/products/mohra-eau-de-parfum-100ml-by-lattafa",
        price: 19.79,
        currency: "GBP",
        affiliateLinkId: "dupe-lattafa-mohra",
        // Checked 2026-09-03 (scripts/check-affiliate-links.mjs and schema.org
        // availability): InStock.
        inStock: true,
      },
    ],
    verificationStatus: "declared",
  },
  /**
   * FINAL BATCH FROM THIS FEED, added 2026-09-03. Found by hand-scanning the
   * same 610-row Opulensi feed for retailer-stated pairings the earlier passes
   * missed. This is the realistic end of what this merchant supports - see the
   * "COVERAGE IS CAPPED" note at the top of this file. All three checked with
   * scripts/check-affiliate-links.mjs: links track, but all three are
   * OUT OF STOCK on the live merchant page despite the feed marking them
   * `in_stock=1` - the same pattern as every prior batch here. That brings
   * the running total to 7 of the 30 linked offers in this file where the
   * feed's `in_stock=1` disagreed with the live page; treat the flag as
   * decorative and always re-check live.
   */
  {
    slug: "fragrance-world-vanille-en-tobacco",
    referenceSlug: "tobacco-vanille",
    name: "Vanille En Tobacco",
    brand: "Fragrance World",
    producerSlug: "fragrance-world",
    pairingBasis: {
      source: "Opulensi product listing",
      quote: "Inspired by Tobacco Vanilla",
      url: "https://www.opulensi.com/products/vanille-en-tobacco-80ml-edp-by-fragrance-world",
    },
    notes: {
      top: ["Black Pepper", "Spicy Notes"],
      heart: ["Vanilla", "Tobacco", "Tonka Beans"],
      base: ["Dry Fruit", "Sugary Wood Sap"],
    },
    facets: { freshness: 1, sweetness: 9, warmth: 8, woodyDepth: 5, longevity: 7, sillage: 7 },
    longevityHoursRange: [6, 8],
    sillageLabel: "Strong",
    priceUsd: 22,
    bottleMl: 80,
    concentration: "Eau de Parfum",
    verdict:
      "Keeps Tobacco Vanille's actual core - vanilla and tonka bean in the heart, dried fruit in the base - and simplifies everything else. The Tom Ford original opens on tobacco leaf itself and layers in cacao and a mix of woods underneath; this opens on black pepper instead, folds tobacco down into the heart rather than the top, and reduces the base to one gourmand woody-sap note. Reads sweeter and less complex, not a flaw for a fifth of the price, but the opening is a genuinely different note.",
    offers: [
      {
        merchant: "Opulensi Perfumes",
        productName: "Vanille En Tobacco 80ml EDP by Fragrance World",
        productUrl: "https://www.opulensi.com/products/vanille-en-tobacco-80ml-edp-by-fragrance-world",
        price: 14.3,
        currency: "GBP",
        affiliateLinkId: "dupe-fragrance-world-vanille-en-tobacco",
        // Checked 2026-09-03 (scripts/check-affiliate-links.mjs): live page's
        // schema.org availability is OutOfStock; the Awin feed row says
        // in_stock=1.
        inStock: false,
      },
    ],
    verificationStatus: "declared",
  },
  {
    slug: "lattafa-ameer-al-oudh-intense-oud",
    referenceSlug: "by-the-fireplace",
    name: "Ameer Al Oudh Intense Oud",
    brand: "Lattafa",
    producerSlug: "lattafa",
    pairingBasis: {
      source: "Opulensi product listing",
      quote: "An aroma of sweet smoky woody notes makes you feel a cozy vibe of being By The Fireplace",
      url: "https://www.opulensi.com/products/ameer-al-oudh-intense-oud-100ml",
    },
    // The feed's description repeats the pyramid twice with a discrepancy in
    // the heart - "Geranium, Woody Notes, Labdanum" the first time, "Geranium,
    // Woody Notes, Sugar and Labdanum" the second. Using the fuller version,
    // per the founder's instruction.
    notes: {
      top: ["Saffron", "Nutmeg"],
      heart: ["Geranium", "Woody Notes", "Sugar", "Labdanum"],
      base: ["Oud", "Vanilla", "Leather"],
    },
    facets: { freshness: 1, sweetness: 6, warmth: 8, woodyDepth: 8, longevity: 8, sillage: 8 },
    longevityHoursRange: [7, 10],
    sillageLabel: "Beast Mode",
    priceUsd: 30,
    bottleMl: 100,
    concentration: "Eau de Parfum",
    verdict:
      "The retailer's own copy names By the Fireplace outright, but the published pyramid barely backs it up. The two share one note - vanilla, sitting in both bases - and nothing else: Maison Margiela's pink pepper, clove and chestnut are entirely absent here, and this fragrance's saffron, nutmeg, oud and leather are entirely absent from the original. What both share is a general warm-woody-sweet register, which is a fair reason a retailer would use the name, but it is an oud fragrance being sold against a gourmand-woody one, not a close match.",
    offers: [
      {
        merchant: "Opulensi Perfumes",
        productName: "Ameer Al Oudh Intense Oud 100ml EDP by Lattafa",
        productUrl: "https://www.opulensi.com/products/ameer-al-oudh-intense-oud-100ml",
        price: 18.99,
        currency: "GBP",
        affiliateLinkId: "dupe-lattafa-ameer-al-oudh-intense-oud",
        // Checked 2026-09-03 (scripts/check-affiliate-links.mjs): live page's
        // schema.org availability is OutOfStock; the Awin feed row says
        // in_stock=1. There is also a separate 200ml deodorant row for this
        // same fragrance (feed id 43494950631) - not a separate listing,
        // deliberately excluded.
        inStock: false,
      },
    ],
    verificationStatus: "declared",
  },
  {
    slug: "zimaya-oud-is-great",
    referenceSlug: "oud-for-greatness",
    name: "Oud Is Great",
    brand: "Zimaya",
    producerSlug: "zimaya",
    // No "inspired by"/"alternative to" phrasing anywhere in the retailer's
    // copy, but the feed's full product description - longer than what a
    // first read of the CSV shows - does name Initio directly, once you read
    // past the note pyramid: "Zimaya Oud Is Great captures the essence of
    // luxury and refinement of the renowned Initio Oud for Greatness, with
    // its own twist, focusing on patchouli and nutmeg." Found and verified
    // live on the merchant page 2026-09-03; this listing was proposed as an
    // "our own judgement" candidate and upgraded to a cited pairing once this
    // sentence turned up.
    pairingBasis: {
      source: "Opulensi product listing",
      quote:
        "captures the essence of luxury and refinement of the renowned Initio Oud for Greatness, with its own twist, focusing on patchouli and nutmeg",
      url: "https://www.opulensi.com/products/oud-is-great-extrait-de-parfum-100ml-by-zimaya-afnan",
    },
    notes: {
      top: ["Saffron", "Nutmeg", "Lavender"],
      heart: ["Agarwood", "Oud"],
      base: ["Patchouli", "Musk"],
    },
    facets: { freshness: 2, sweetness: 5, warmth: 8, woodyDepth: 8, longevity: 9, sillage: 8 },
    longevityHoursRange: [8, 11],
    sillageLabel: "Beast Mode",
    priceUsd: 35,
    bottleMl: 100,
    concentration: "Extrait de Parfum",
    verdict:
      "The closest match in this whole batch: all three of Initio's top notes - saffron, nutmeg, lavender - carry over exactly, and oud and musk both run into the base on both sides. What thins out is the middle of the formula - Initio's sandalwood drops entirely, and this shifts patchouli down from the heart into the base rather than keeping it alongside oud - so the dry-down reads as a more linear oud-patchouli-musk where Oud for Greatness has an extra woody layer holding it up. At extrait concentration it should at least match the original on projection and staying power.",
    offers: [
      {
        merchant: "Opulensi Perfumes",
        productName: "Oud Is Great Extrait De Parfum 100ml by Zimaya (Afnan)",
        productUrl: "https://www.opulensi.com/products/oud-is-great-extrait-de-parfum-100ml-by-zimaya-afnan",
        price: 25.99,
        currency: "GBP",
        affiliateLinkId: "dupe-zimaya-oud-is-great",
        // Checked 2026-09-03 (scripts/check-affiliate-links.mjs): live page's
        // schema.org availability is OutOfStock; the Awin feed row says
        // in_stock=1.
        inStock: false,
      },
    ],
    verificationStatus: "declared",
  },

  /* ══ SECOND MERCHANT, 2026-09-03 — The CLONE, via Clone of Perfume (Awin 117395)
   *
   * The thirty-two listings above are all Opulensi (Awin 123248) and that feed
   * is exhausted. These nine come from a different advertiser, approved
   * 2026-09-03, and they are different in kind rather than just in source:
   *
   *   Opulensi is a RESELLER — it stocks Lattafa, Armaf, Afnan and so on, so
   *   producer and merchant are separate companies. The CLONE is a DUPE HOUSE
   *   SELLING DIRECT: the brand and the shop are one company under two names
   *   ("The CLONE" on the bottle, "Clone of Perfume" on Awin and the domain).
   *
   * Five of the nine land on originals that had NO listing at all before today
   * — Sauvage, Black Opium, Santal 33, Love Don't Be Shy and Fucking Fabulous —
   * so this is reach, not depth, which is the number that matters (see the
   * "COVERAGE IS CAPPED" section in this project's CLAUDE.md).
   *
   * ── priceUsd IS THE MERCHANT'S PRICE HERE, AND ONLY HERE ──────────────────
   *
   * Every listing above hand-maintains `priceUsd` as an approximate street
   * price, deliberately ignoring the merchant's figure, because Opulensi is a
   * discounter quoting one presentation: its only Armaf row is a GBP 68.99
   * limited edition of a fragrance that street-prices near $40, and feeding
   * that into "Nx cheaper per ml" would corrupt the one number this site
   * exists to get right.
   *
   * That reasoning does not apply to a brand's own direct store. There is no
   * other place to buy The CLONE No. 13; the price on cloneofperfume.com IS
   * the street price, so inventing a separate one would be less accurate, not
   * more careful. `priceUsd` below is therefore the merchant's own current
   * selling price — the same figure as `offers[0].price`, which is expected
   * here and would be a mistake anywhere above.
   *
   * ── AND IT IS THE LIVE PRICE, NOT THE FEED'S ──────────────────────────────
   *
   * The feed was stale on two of eleven rows when checked against the product
   * pages on 2026-09-03: Naked Cherry ($39.99 in the feed, $45.00 live) and
   * Brave in Love ($34.99 in the feed, $39.99 live). Both are recorded live.
   * Same rule as stock — a feed describes what was true at export.
   *
   * ── bottleMl AND concentration CAME OFF THE PRODUCT PAGES ─────────────────
   *
   * This feed has NO size field. `dimensions`, `specifications`, `product_model`
   * and `colour` are empty on all 11 rows and no ml or oz figure appears in any
   * description — the same gap that stopped ingest-feed.mjs deriving a price-per-ml
   * from the My Perfume Shop feed. Both were read off the live pages instead,
   * where each states "Size: 50ML / 1.7 OZ" and "Extrait de Parfum" in the buy
   * block. All nine are 50ml extrait. Rouge Veil also offers a 100ml at $54.99,
   * which is NOT what the feed row or the affiliate link point at; the 50ml is.
   * No size had to be guessed and none is missing.
   *
   * ── HOW THE NOTES BELOW WERE TRANSCRIBED ──────────────────────────────────
   *
   * Unusually for a feed, this one publishes a full note pyramid per product in
   * its `description`, so these are the MERCHANT'S declared notes rather than
   * ours — the same standing as every listing above. One editorial step is
   * applied and it only ever moves in one direction:
   *
   *   A merchant note is renamed to the reference catalog's spelling when the
   *   two denote the same material and the merchant's extra word is a
   *   geographic or processing qualifier carrying no compositional information
   *   — "Blackcurrant" -> "Black Currant", "Cedarwood" -> "Cedar",
   *   "Calabrian Bergamot" -> "Bergamot", "Black Coffee" -> "Coffee",
   *   "Violet Accord" -> "Violet", "Ambrox" -> "Ambroxan".
   *
   *   A qualifier is NEVER ADDED. Where the merchant says plain "Vanilla" and
   *   our catalog says "Vanilla Bourbon" (Kilian), the merchant's plainer word
   *   stands and the diff shows them as different notes. That understates the
   *   match, which is the safe direction.
   *
   * Why bother: getNoteDiff() compares strings, so "Blackcurrant" against
   * "Black Currant" would render to a reader as "the dupe does not contain
   * blackcurrant", which is false. Note that this is a pre-existing gap and NOT
   * retrofitted here — armaf-club-de-nuit-intense-man above declares
   * "Blackcurrant" against Aventus's "Black Currant" and scores lower for it.
   * Fixing that changes an existing published score, so it belongs in its own
   * considered change, like the familyBonus bug.
   *
   * ── THREE OF THESE HIT THE UNVERIFIED CAP, AND THAT IS THE SYSTEM WORKING ─
   *
   * Rouge Veil raw-scores 99, Whisper and Lady on Fire 93; all three publish at
   * 90 via getPublishedSimilarity(). The reason is not that they are unusually
   * good matches — it is that this merchant, unlike Opulensi, tends to publish
   * the ORIGINAL'S pyramid as its own. Rouge Veil's declared notes are Baccarat
   * Rouge 540's note for note, and Lady on Fire's top and heart are Black
   * Opium's unchanged. That is a marketing claim, not an independent analysis
   * of what is in the bottle, and each of those three verdicts says so on the
   * page rather than letting a big number speak for itself.
   *
   * None of the nine trips isVerbatimCopy(), which needs notes AND facets to
   * match: the facets are our editorial estimates and were written from the
   * declared differences (extrait vs EDT/EDP concentration, notes added or
   * missing), not tuned against the flag threshold. Had one flagged, it would
   * have been left flagged.
   */
  {
    slug: "the-clone-rouge-veil-no-13",
    referenceSlug: "baccarat-rouge-540",
    name: "Rouge Veil No. 13",
    brand: "The CLONE",
    producerSlug: "the-clone",
    pairingBasis: {
      source: "Clone of Perfume product listing",
      quote:
        "This compelling interpretation of Baccarat Rouge 540 bursts into life with the fiery intensity of saffron",
      url: "https://cloneofperfume.com/products/the-clone-13-rouge-veil-inspired-by-baccarat-rouge",
    },
    // Identical to baccarat-rouge-540's pyramid, note for note. Transcribed as
    // published rather than adjusted - see the batch header on why that inflates
    // the note half of the score and what the verdict does about it.
    notes: {
      top: ["Saffron", "Jasmine"],
      heart: ["Amberwood", "Ambergris"],
      base: ["Fir Resin", "Cedar"],
    },
    facets: { freshness: 2, sweetness: 7, warmth: 8, woodyDepth: 6, longevity: 8, sillage: 8 },
    longevityHoursRange: [7, 10],
    sillageLabel: "Beast Mode",
    priceUsd: 39.99,
    bottleMl: 50,
    concentration: "Extrait de Parfum",
    verdict:
      "Read the two note lists before reading the percentage. The CLONE publishes Baccarat Rouge 540's pyramid for this bottle unchanged - saffron and jasmine, amberwood and ambergris, fir resin and cedar - so the note half of this score is the retailer restating the original's own answer, not an independent account of what is in the bottle. That is why it publishes at our 90% cap rather than the 99% it computes to, and the cap is the honest number here. What can be said without taking the merchant's word for it: this is an extrait against MFK's extrait, so the concentration really is comparable, and Baccarat Rouge 540 is among the most-copied formulas in the category because its core is a widely available amberwood material rather than anything rare. The usual result is an opening that lands and a drydown that flattens, where the original keeps developing.",
    offers: [
      {
        merchant: "Clone of Perfume",
        productName: "Rouge Veil No. 13 Unisex",
        // The feed's merchant_deep_link ends "-baccarat-rouge-540" and 301s to
        // this canonical handle; the resolved URL is recorded so a reader is
        // not sent through a redirect to check the claim.
        productUrl: "https://cloneofperfume.com/products/the-clone-13-rouge-veil-inspired-by-baccarat-rouge",
        // 50ml. A 100ml exists at $54.99 and is a different variant; the feed
        // row, this price and the affiliate link are all the 50ml.
        price: 39.99,
        currency: "USD",
        affiliateLinkId: "dupe-the-clone-rouge-veil-no-13",
        inStock: true,
      },
    ],
    verificationStatus: "declared",
  },
  {
    slug: "the-clone-thunderstorm-no-93",
    referenceSlug: "aventus",
    name: "Thunderstorm No. 93",
    brand: "The CLONE",
    producerSlug: "the-clone",
    pairingBasis: {
      source: "Clone of Perfume product listing",
      quote:
        "The CLONE No. 93 - Thunderstorm is a modern clone fragrance inspired by Aventus: bright fruits up top, a refined floral-woody heart, and a smooth long-lasting base",
      url: "https://cloneofperfume.com/products/the-clone-93-thunderstorm-inspiredby-aventus",
    },
    // Merchant writes "Blackcurrant"; recorded as the catalog's "Black Currant".
    notes: {
      top: ["Bergamot", "Black Currant", "Apple", "Pineapple"],
      heart: ["Rose", "Jasmine", "Patchouli"],
      base: ["Oakmoss", "Ambergris", "Vanilla"],
    },
    facets: { freshness: 7, sweetness: 7, warmth: 6, woodyDepth: 6, longevity: 8, sillage: 8 },
    longevityHoursRange: [7, 10],
    sillageLabel: "Beast Mode",
    priceUsd: 39.99,
    bottleMl: 50,
    concentration: "Extrait de Parfum",
    verdict:
      "The whole Aventus opening is declared here - pineapple, bergamot, blackcurrant and apple, all four of them - and the base keeps oakmoss, ambergris and vanilla. Two absences do the damage and both are load-bearing. Birch is the first: it is where Aventus gets its smoke, and it is the reason the fruit reads dry rather than jammy. Musk is the second. Without birch this should sit sweeter and more linear than the original, which is the standard shortcoming of a cheap Aventus interpretation rather than something specific to this one. Against Creed's eau de parfum it is an extrait, so expect it to outlast the original while smelling progressively less like it as the hours pass - the opposite of the trade most buyers assume they are making.",
    offers: [
      {
        merchant: "Clone of Perfume",
        productName: "Thunderstorm No. 93 Male",
        productUrl: "https://cloneofperfume.com/products/the-clone-93-thunderstorm-inspiredby-aventus",
        price: 39.99,
        currency: "USD",
        affiliateLinkId: "dupe-the-clone-thunderstorm-no-93",
        inStock: true,
      },
    ],
    verificationStatus: "declared",
  },
  {
    slug: "the-clone-ultimatum-no-53",
    referenceSlug: "oud-wood",
    name: "Ultimatum No. 53",
    brand: "The CLONE",
    producerSlug: "the-clone",
    pairingBasis: {
      source: "Clone of Perfume product listing",
      quote: "The CLONE No. 53 - Ultimatum (Inspired by Tom Ford Oud Wood)",
      url: "https://cloneofperfume.com/products/the-clone-53-ultimatum-oud-wood",
    },
    notes: {
      top: ["Cardamom"],
      heart: ["Oud", "Sandalwood", "Vetiver"],
      base: ["Tonka Bean", "Amber", "Vanilla"],
    },
    facets: { freshness: 2, sweetness: 5, warmth: 7, woodyDepth: 8, longevity: 8, sillage: 7 },
    longevityHoursRange: [7, 9],
    sillageLabel: "Strong",
    priceUsd: 45,
    bottleMl: 50,
    concentration: "Extrait de Parfum",
    verdict:
      "The base is Tom Ford's exactly - tonka bean, amber, vanilla - and the heart keeps both oud and sandalwood, which between them are most of what anyone means by Oud Wood. The top is where it thins out: Tom Ford opens on rosewood and Chinese pepper alongside the cardamom, and this declares only the cardamom, so the bright, faintly medicinal first few minutes should be missing. It adds vetiver to the heart, pulling the middle drier and earthier than the original's creamier reading. One inconsistency worth knowing about, since it cuts in our favour and we did not use it: the merchant's own prose mentions rosewood while its published pyramid does not, and we scored the pyramid, which is the structured claim. At extrait strength this should also project harder than Tom Ford's notoriously quiet eau de parfum, which for some buyers is the point.",
    offers: [
      {
        merchant: "Clone of Perfume",
        productName: "Ultimatum No. 53 Unisex",
        productUrl: "https://cloneofperfume.com/products/the-clone-53-ultimatum-oud-wood",
        price: 45,
        currency: "USD",
        affiliateLinkId: "dupe-the-clone-ultimatum-no-53",
        inStock: true,
      },
    ],
    verificationStatus: "declared",
  },
  {
    slug: "the-clone-naked-cherry-no-33",
    referenceSlug: "lost-cherry",
    name: "Naked Cherry No. 33",
    brand: "The CLONE",
    producerSlug: "the-clone",
    pairingBasis: {
      source: "Clone of Perfume product listing",
      quote: "The CLONE No. 33 - Naked Cherry (Inspired by Lost Cherry)",
      url: "https://cloneofperfume.com/products/the-clone-33-inspired-by-lost-cherry",
    },
    // "Roasted Tonka Bean" -> "Tonka Bean" and "Cedarwood" -> "Cedar" per the
    // batch header's rule. "Cherry Liqueur" and "Griotte Syrup" are kept: those
    // name genuinely different materials from black cherry, not the same one
    // with a qualifier.
    notes: {
      top: ["Black Cherry", "Cherry Liqueur", "Bitter Almond"],
      heart: ["Griotte Syrup", "Turkish Rose", "Jasmine Sambac"],
      base: ["Peru Balsam", "Tonka Bean", "Sandalwood", "Vetiver", "Cedar", "Clove"],
    },
    facets: { freshness: 2, sweetness: 9, warmth: 7, woodyDepth: 6, longevity: 8, sillage: 8 },
    longevityHoursRange: [7, 10],
    sillageLabel: "Beast Mode",
    priceUsd: 45,
    bottleMl: 50,
    concentration: "Extrait de Parfum",
    verdict:
      "The skeleton is genuinely shared: black cherry and bitter almond over Turkish rose and jasmine sambac, on peru balsam, tonka, sandalwood and vetiver. What differs is how the cherry is drawn. Tom Ford pairs black cherry with sour cherry and plum; this pairs it with cherry liqueur and griotte syrup, which is a boozier, more candied reading of the same idea rather than a different idea. The base swaps Lost Cherry's patchouli for cedar and clove, so expect it spicier and less earthy underneath. Seventy-five per cent reflects real substitutions across every layer, not a bad pairing - this is exactly the comparison a Lost Cherry buyer makes, and the differences are the useful part of the answer.",
    offers: [
      {
        merchant: "Clone of Perfume",
        productName: "Naked Cherry No.33 Unisex",
        productUrl: "https://cloneofperfume.com/products/the-clone-33-inspired-by-lost-cherry",
        // FEED WAS STALE: the row says $39.99, the live page says $45.00
        // (checked 2026-09-03). Live price recorded.
        price: 45,
        currency: "USD",
        affiliateLinkId: "dupe-the-clone-naked-cherry-no-33",
        inStock: true,
      },
    ],
    verificationStatus: "declared",
  },
  {
    slug: "the-clone-whisper-no-43",
    referenceSlug: "sauvage",
    name: "Whisper No. 43",
    brand: "The CLONE",
    producerSlug: "the-clone",
    pairingBasis: {
      source: "Clone of Perfume product listing",
      quote: "The CLONE No. 43 - Whisper, inspired by the iconic Sauvage",
      url: "https://cloneofperfume.com/products/the-clone-43-inspired-by-sauvage",
    },
    // "Calabrian Bergamot" -> "Bergamot", "Cedarwood" -> "Cedar".
    notes: {
      top: ["Bergamot", "Pepper"],
      heart: ["Sichuan Pepper", "Lavender", "Pink Pepper", "Vetiver", "Patchouli", "Geranium", "Elemi"],
      base: ["Ambroxan", "Cedar", "Labdanum"],
    },
    facets: { freshness: 7, sweetness: 2, warmth: 5, woodyDepth: 7, longevity: 9, sillage: 8 },
    longevityHoursRange: [8, 11],
    sillageLabel: "Beast Mode",
    priceUsd: 45,
    bottleMl: 50,
    concentration: "Extrait de Parfum",
    verdict:
      "Structurally about as close as a Sauvage interpretation gets: the same bergamot-and-pepper opening, the same ambroxan, cedar and labdanum base, and five of the original's heart notes intact. It adds vetiver and patchouli, which should make the middle earthier and a shade less bright than Dior's. Note that the top and base are declared identical to Sauvage's, so as with our other listings from this merchant a chunk of the 90% is the retailer restating the original rather than describing its own juice. The thing actually worth weighing here is price, not similarity. Sauvage is a cheap designer fragrance, and $45 for 50ml works out barely a fifth cheaper per millilitre than a $110 100ml bottle of the real thing. What you are buying is concentration, an extrait against an eau de toilette, not a discount. If cost was the reason for wanting a Sauvage alternative, this is not one. (This was the smallest saving on the site when it was written; the AromaPassions batch added two smaller ones, including an Eros interpretation that is fractionally MORE expensive per millilitre than the Versace. Cheap originals are where the dupe economics stop working, and that is a pattern rather than a one-off.)",
    offers: [
      {
        merchant: "Clone of Perfume",
        productName: "Whisper No. 43 Male",
        productUrl: "https://cloneofperfume.com/products/the-clone-43-inspired-by-sauvage",
        price: 45,
        currency: "USD",
        affiliateLinkId: "dupe-the-clone-whisper-no-43",
        inStock: true,
      },
    ],
    verificationStatus: "declared",
  },
  {
    slug: "the-clone-lady-on-fire-no-23",
    referenceSlug: "black-opium",
    name: "Lady on Fire No. 23",
    brand: "The CLONE",
    producerSlug: "the-clone",
    pairingBasis: {
      source: "Clone of Perfume product listing",
      quote: "The CLONE No. 23 Lady on Fire (Inspired by Black Opium)",
      url: "https://cloneofperfume.com/products/the-clone-23-lady-on-fire-black-opium-dupe",
    },
    // "Black Coffee" -> "Coffee" per the batch header's rule.
    notes: {
      top: ["Pear", "Pink Pepper", "Orange Blossom"],
      heart: ["Coffee", "Jasmine", "Bitter Almond"],
      base: ["Vanilla", "Patchouli", "Cashmere Wood", "Cedar"],
    },
    facets: { freshness: 3, sweetness: 8, warmth: 7, woodyDepth: 4, longevity: 9, sillage: 8 },
    longevityHoursRange: [8, 11],
    sillageLabel: "Beast Mode",
    priceUsd: 34.99,
    bottleMl: 50,
    concentration: "Extrait de Parfum",
    verdict:
      "The merchant publishes Black Opium's top and heart unchanged - pear, pink pepper and orange blossom, then coffee, jasmine and bitter almond - so as with Rouge Veil a large part of this score is the retailer repeating the original's own pyramid rather than describing its bottle independently. The 90% cap is doing its job; treat it as a claim, not a measurement. The one declared difference is real and plausible: cashmere wood added alongside YSL's vanilla, patchouli and cedar, which would give a softer and slightly woodier close than the original's fairly thin base. It is an extrait against YSL's eau de parfum, so longer wear is the reasonable expectation and is usually the actual reason to buy one of these rather than any claim about smelling identical.",
    offers: [
      {
        merchant: "Clone of Perfume",
        productName: "Lady on Fire No. 23 Female",
        productUrl: "https://cloneofperfume.com/products/the-clone-23-lady-on-fire-black-opium-dupe",
        price: 34.99,
        currency: "USD",
        affiliateLinkId: "dupe-the-clone-lady-on-fire-no-23",
        inStock: true,
      },
    ],
    verificationStatus: "declared",
  },
  {
    slug: "the-clone-pleasure-noir-no-63",
    referenceSlug: "santal-33",
    name: "Pleasure Noir No. 63",
    brand: "The CLONE",
    producerSlug: "the-clone",
    pairingBasis: {
      source: "Clone of Perfume product listing",
      quote:
        "The CLONE No. 63 - Pleasure Noir is a modern clone fragrance inspired by Santal 33, blending dry woods, soft florals, and a clean leather finish",
      url: "https://cloneofperfume.com/products/the-clone-63-pleasure-noir-santal",
    },
    // "Violet Accord" -> "Violet", "Ambrox" -> "Ambroxan". Cedarwood is left as
    // "Cedarwood" here because santal-33's own reference entry spells it that
    // way - this is the one case where matching the catalog means NOT shortening.
    notes: {
      top: ["Violet", "Cardamom"],
      heart: ["Iris", "Ambroxan", "Papyrus"],
      base: ["Cedarwood", "Leather", "Sandalwood"],
    },
    facets: { freshness: 4, sweetness: 3, warmth: 5, woodyDepth: 8, longevity: 8, sillage: 7 },
    longevityHoursRange: [7, 9],
    sillageLabel: "Strong",
    priceUsd: 40,
    bottleMl: 50,
    concentration: "Extrait de Parfum",
    verdict:
      "Every one of Santal 33's signature materials is here - cardamom, violet, iris, papyrus, sandalwood, cedarwood and leather - and almost nothing is missing except musk. What the 71% is picking up is not absence but rearrangement. Le Labo puts iris in the opening and sandalwood in the heart; this pushes iris down into the heart and sandalwood all the way into the base, and adds ambroxan where Le Labo has none. That matters more than it sounds: a base sandalwood arrives later and sits closer to the skin than a heart sandalwood, so the creamy woody accord that is the whole point of Santal 33 should show up on a different schedule. This is the first Santal 33 alternative this site lists, and it is a re-stacking of the same materials rather than a copy - which is a fair thing to want, provided you know that is what you are buying.",
    offers: [
      {
        merchant: "Clone of Perfume",
        productName: "Pleasure Noir No. 63 Unisex",
        productUrl: "https://cloneofperfume.com/products/the-clone-63-pleasure-noir-santal",
        price: 40,
        currency: "USD",
        affiliateLinkId: "dupe-the-clone-pleasure-noir-no-63",
        inStock: true,
      },
    ],
    verificationStatus: "declared",
  },
  {
    slug: "the-clone-brave-in-love-no-37",
    referenceSlug: "love-dont-be-shy",
    name: "Brave in Love No. 37",
    brand: "The CLONE",
    producerSlug: "the-clone",
    pairingBasis: {
      source: "Clone of Perfume product listing",
      quote:
        "Inspired by the cult favorite Love, Don't Be Shy, this perfume wraps you in a creamy cloud of warm florals and decadent gourmand notes",
      url: "https://cloneofperfume.com/products/the-clone-no-37-brave-in-love",
    },
    // Merchant declares plain "Vanilla"; the reference records "Vanilla Bourbon".
    // Left as declared - the batch header's rule never adds a qualifier, so the
    // diff shows these as different notes and the score is understated.
    notes: {
      top: ["Neroli", "Bergamot", "Pink Pepper", "Coriander"],
      heart: ["Orange Blossom", "Jasmine", "Honeysuckle", "Iris", "Rose"],
      base: ["Marshmallow", "Vanilla", "Musk", "Caramel", "Labdanum"],
    },
    facets: { freshness: 3, sweetness: 9, warmth: 7, woodyDepth: 2, longevity: 8, sillage: 7 },
    longevityHoursRange: [7, 9],
    sillageLabel: "Strong",
    priceUsd: 39.99,
    bottleMl: 50,
    concentration: "Extrait de Parfum",
    verdict:
      "A far bigger and busier fragrance than the one it names. Kilian's is deliberately spare - bergamot, then orange blossom, jasmine and marshmallow, then vanilla and musk - and most of its effect comes from that restraint. This adds neroli, pink pepper and coriander to the opening, honeysuckle, iris and rose to the heart, and caramel and labdanum to the base, keeping marshmallow and vanilla but crowding them. Sixty per cent is the honest figure for that: the same gourmand-floral idea executed with roughly twice the material. Whether it works as an alternative depends on why you liked Love, Don't Be Shy - if it was the sweetness, this delivers it; if it was how little else was in the bottle, this is the wrong direction entirely. One caveat on the number itself: the merchant declares plain vanilla where our catalog records Kilian's as bourbon vanilla, and we count those separately rather than assume, so the real overlap is a little higher than 60%.",
    offers: [
      {
        merchant: "Clone of Perfume",
        productName: "Brave in Love No. 37 Female",
        productUrl: "https://cloneofperfume.com/products/the-clone-no-37-brave-in-love",
        // FEED WAS STALE: the row says $34.99, the live page says $39.99
        // (checked 2026-09-03). Live price recorded.
        price: 39.99,
        currency: "USD",
        affiliateLinkId: "dupe-the-clone-brave-in-love-no-37",
        inStock: true,
      },
    ],
    verificationStatus: "declared",
  },
  {
    slug: "the-clone-brutal-story-no-73",
    referenceSlug: "fucking-fabulous",
    name: "Brutal Story No. 73",
    brand: "The CLONE",
    producerSlug: "the-clone",
    // The feed description only manages "If you love the vibe of Fabulous Tom
    // Ford but want a more accessible option" - the original's name mangled,
    // and weaker than the URL slug (".../brutal-story-fabulous-tom-ford")
    // suggests. The live product page states it outright in three places: the
    // browser title, the buy block, and the Shopify product type field. Quoted
    // from the page rather than the feed for that reason.
    pairingBasis: {
      source: "Clone of Perfume product page",
      quote: "Inspired by Tom Ford's Fucking Fabulous",
      url: "https://cloneofperfume.com/products/the-clone-73-brutal-story-fabulous-tom-ford",
    },
    notes: {
      top: ["Lavender", "Clary Sage"],
      heart: ["Bitter Almond", "Vanilla", "Leather"],
      base: ["Tonka Bean", "Amber", "Woods"],
    },
    facets: { freshness: 4, sweetness: 5, warmth: 7, woodyDepth: 6, longevity: 8, sillage: 7 },
    longevityHoursRange: [7, 9],
    sillageLabel: "Strong",
    priceUsd: 45,
    bottleMl: 50,
    concentration: "Extrait de Parfum",
    verdict:
      "Much the same materials, a different architecture. Tom Ford opens on bitter almond and lavender, hearts on leather and tonka, and settles into vanilla, vetiver, amber and musk. This opens on lavender and clary sage, moves bitter almond and vanilla up into the heart beside the leather, and finishes on tonka, amber and an unhelpfully vague 'woods'. Almost nothing has been left out - it has been re-stacked, and where a note sits is most of what a fragrance's development actually is, which is why 60% is lower than the shared ingredient list suggests. Expect the almond later and the leather in roughly the same place. Clary sage is the one genuinely new material and should make the opening more aromatic and less sweet than the original's. Credit where it is due: the merchant's own page is unusually candid about this, pointing buyers who like Lost Cherry or Black Orchid toward it rather than claiming a one-to-one match.",
    offers: [
      {
        merchant: "Clone of Perfume",
        productName: "Brutal Story No. 73 Unisex",
        productUrl: "https://cloneofperfume.com/products/the-clone-73-brutal-story-fabulous-tom-ford",
        price: 45,
        currency: "USD",
        affiliateLinkId: "dupe-the-clone-brutal-story-no-73",
        inStock: true,
      },
    ],
    verificationStatus: "declared",
  },

  /* ══ AromaPassions (Awin 34989), added 2026-09-04 ═══════════════════════════
   *
   * A THIRD MERCHANT, and the second dupe house selling its own line direct.
   * Fourteen listings, every one landing on an original that had NO alternative
   * at all — the largest single jump in reach this catalogue has had.
   *
   * WHAT THIS FEED IS GOOD AT. Every product states its inspiration in the
   * TITLE ("SPARK | Inspired by CHANEL ALLURE HOMME SPORT | …"), so all fourteen
   * pairings are cited rather than editorial — better even than Clone of
   * Perfume, where the claim had to be read out of the description. Each row
   * also carries a full top/heart/base pyramid.
   *
   * WHAT IT IS BAD AT, AND WHY NOTHING BELOW TAKES A PRICE FROM IT. The feed is
   * a stale snapshot of a store that has since dropped an entire size. Seven of
   * these products ship three feed rows each at $29/$45/$79 (30/50/100ml); the
   * live store offers only 50ml and 100ml at $39/$69 — so for those seven ALL
   * THREE feed prices are wrong and one row describes something that cannot be
   * bought. Bright Crystal is the one product priced differently ($29/$59).
   * Every price below was read off `/products/<handle>.js`, whose `variants[]`
   * gives the title, the price in cents and a real `available` flag; that
   * endpoint is the cheapest truth source found for any merchant here.
   * All fourteen were confirmed live and in stock on 2026-09-04.
   *
   * TWO SELLER CLAIMS THAT ARE NOT REPEATED IN OUR VOICE ANYWHERE BELOW:
   *
   * 1. **"Pheromone Perfume."** Every product is marketed this way. There is no
   *    sound evidence for human pheromone attraction effects, so we compare the
   *    scent and nothing else. The word appears in no `name`, no `verdict`, and
   *    not inside a quoted `pairingBasis` — only the "Inspired by X" half of
   *    each title is quoted. It DOES survive verbatim inside each offer's
   *    `productName`, and that is deliberate: that field reproduces the
   *    merchant's own title unedited so a reader can confirm the product is
   *    real, and quoting a seller's title under the seller's name is not the
   *    same as asserting it. Editing it would break the one field that makes
   *    the listing checkable. (Flagged as an open call for the founder: if a
   *    visible rebuttal is wanted, the place for it is the UI, not this data.)
   *
   * 2. **"Concentration | 20%", labelled Extrait de Parfum.** Recorded as the
   *    `concentration` string only, exactly as The CLONE's was, and the 20%
   *    figure is used nowhere as evidence. Concentration is not similarity, and
   *    a higher stated percentage is not a closer match. Where a verdict
   *    mentions it at all it is attributed to AromaPassions and framed as
   *    unverified.
   *
   * THE "ESSENTIAL OIL" TRAP, WHICH THESE LISTINGS DELIBERATELY DO NOT FALL
   * INTO. Every title contains "Essential Oil Fragrance" and the body copy says
   * the formula is "Scented using … Essential Oils". Read quickly that says
   * *oil concentrate* — a format that would project less than an alcohol spray
   * and would deserve marked-down sillage plus a format disclosure. It is
   * wrong. Five of these fifteen products publish an ingredient list and all
   * five begin `alcohol, aqua, …` (verified on the live pages 2026-09-04:
   * Costa Azzurra, Bitter Peach, Another 13, Angel, Flowerbomb). Nothing on any
   * page says roll-on, oil-based or alcohol-free, and all are sold in
   * conventional 50/100ml bottles. **These are ordinary alcohol-based sprays**,
   * and "essential oil" describes the aromatic materials, as it does for most
   * perfumery. So there is NO format field, NO oil framing and NO score
   * adjustment: facets are rated on notes and character alone, exactly as for
   * every other spray. Writing them as oil concentrates would have put an
   * invented format claim about a real company's product into published copy,
   * contradicted by that company's own live ingredient list.
   *
   * ONE OF THE FIFTEEN CANDIDATES IS DELIBERATELY ABSENT: **ILLUMINATE
   * (Versace Crystal Noir).** AromaPassions declares Crystal Noir's pyramid
   * back, note for note, in all three layers — ginger/cardamom/pepper, then
   * gardenia/coconut/peony/orange blossom, then sandalwood/amber/musk — and
   * publishes no ingredient list and nothing else of its own. `isVerbatimCopy()`
   * needs notes AND facets to match, so the only two ways to publish it would
   * have been to invent facet differences we have no basis for, purely to clear
   * the copy-detection threshold, or to ship a listing that `getRankedDupesFor()`
   * correctly hides everywhere while its affiliate link and photograph sit in
   * the tree pointing at nothing. Both are worse than its absence. Crystal Noir
   * therefore still has no alternative, and the reason is on the record.
   *
   * GLAMOROUS (Bright Crystal) IS THE SAME SITUATION ONE ORTHOGRAPHIC HAIR
   * SHORT OF IT, and it ships. Its declared pyramid is Versace's too; it clears
   * the copy check only because the merchant writes "Ice" and "Lotus" where the
   * catalogue records "Ice Accord" and "Lotus Flower", and our normalising rule
   * never ADDS a qualifier. Its verdict says so on the page. **If someone later
   * "tidies" those two notes to match the catalogue's spelling, this listing
   * will silently flag and vanish** — that is the copy gate working, not a
   * regression, but know it before editing those two strings.
   *
   * The wider point, unchanged from the Clone of Perfume batch and still
   * unresolved: **a high score here can be a fact about the merchant's
   * copywriting rather than about the fragrance.** Spark (87), Glamorous (86),
   * Erotic (86), Mystical (86) and Admire (85) all rest on pyramids that
   * largely restate the original's. That is a scoring-formula question, not a
   * data question, and it belongs in its own considered change alongside the
   * `familyBonus` bug — not in a listings batch. The mitigation actually
   * shipped is the same one: the verdict says it on the page.
   *
   * NOTE NORMALISATION, same rule as previous batches: a purely geographic or
   * part qualifier on an identically-named material is dropped so the diff is
   * not noise ("Amalfi Lemon" -> "Lemon", "Virginia Cedar" -> "Cedar",
   * "Madagascar Vanilla" -> "Vanilla", "Italian Mandarin" -> "Mandarin",
   * "Elemi resin" -> "Elemi", "myrtle oil" -> "Myrtle"). A qualifier is NEVER
   * ADDED: the merchant's plain "Musk" is not promoted to the catalogue's
   * "White Musk", its "Orchid" is not promoted to "Cattleya Orchid", and its
   * "Ice"/"Lotus" are not promoted to "Ice Accord"/"Lotus Flower". That
   * direction always understates the score, which is the safe direction. Two
   * distinct cedars ("Virginian Cedar" and "Atlas Cedar" on EROTIC) are kept
   * distinct rather than collapsed into one, because collapsing them would
   * merge two declared materials into one.
   *
   * `priceUsd` COMES FROM THE MERCHANT, for the same single reason it does for
   * The CLONE and for no other: this is the brand's own direct store and there
   * is nowhere else to buy AromaPassions, so its price IS the street price.
   * The 50ml figure is used (with `bottleMl: 50`) because that is the size each
   * listing's affiliate link is built from, and because it is the more
   * conservative of the two — the 100ml works out cheaper per ml, so quoting
   * the 50ml understates the saving rather than overstating it. This is NOT a
   * general licence to take prices from feeds; the test is "is this the only
   * seller of this product?", applied per merchant.
   * ═══════════════════════════════════════════════════════════════════════ */
  {
    slug: "aromapassions-spark",
    referenceSlug: "allure-homme-sport",
    name: "Spark",
    brand: "AromaPassions",
    producerSlug: "aromapassions",
    pairingBasis: {
      source: "AromaPassions product title",
      quote: "SPARK | Inspired by CHANEL ALLURE HOMME SPORT",
      url: "https://aromapassions.com/products/spark-inspired-by-chanel-allure-homme-sport-dupe-perfume",
    },
    // "Elemi resin" -> "Elemi".
    notes: {
      top: ["Orange", "Sea Notes", "Aldehydes", "Blood Mandarin"],
      heart: ["Pepper", "Neroli", "Cedar"],
      base: ["Tonka Bean", "Vanilla", "White Musk", "Amber", "Vetiver", "Elemi"],
    },
    facets: { freshness: 7, sweetness: 4, warmth: 6, woodyDepth: 6, longevity: 7, sillage: 6 },
    longevityHoursRange: [6, 8],
    sillageLabel: "Strong",
    priceUsd: 39,
    bottleMl: 50,
    concentration: "Extrait de Parfum",
    verdict:
      "Read the number carefully on this one. AromaPassions has declared Chanel's heart unchanged - pepper, neroli, cedar - and Chanel's opening plus blood mandarin, which is a merchant restating the original's pyramid rather than describing its own juice, and half of any score here is declared-note overlap. Treat 87% as their claim, not our finding. What the declaration does add is genuinely directional: amber and elemi resin sit alongside Chanel's tonka, vanilla, musk and vetiver, and both are warm resinous materials that the original's very airy, aldehydic base does not have. So the reasonable expectation is Allure Homme Sport's shape with a heavier, sweeter close, losing some of the clean sea-spray quality that is the whole appeal of the Chanel. Note also that Allure Homme Sport is one of the cheaper designer bottles going, so the per-ml saving here is modest.",
    offers: [
      {
        merchant: "AromaPassions",
        productName:
          "SPARK | Inspired by CHANEL ALLURE HOMME SPORT | Allure Homme Sport Dupe Pheromone Perfume - 50 ml",
        productUrl:
          "https://aromapassions.com/products/spark-inspired-by-chanel-allure-homme-sport-dupe-perfume",
        // FEED WAS STALE: its 50ml row says $45. The live page says $39 and the
        // $29 30ml row it also ships no longer exists at all.
        price: 39,
        currency: "USD",
        affiliateLinkId: "dupe-aromapassions-spark",
        inStock: true,
      },
      {
        merchant: "AromaPassions",
        productName:
          "SPARK | Inspired by CHANEL ALLURE HOMME SPORT | Allure Homme Sport Dupe Pheromone Perfume - 100 ml",
        productUrl:
          "https://aromapassions.com/products/spark-inspired-by-chanel-allure-homme-sport-dupe-perfume",
        price: 69,
        currency: "USD",
        affiliateLinkId: "dupe-aromapassions-spark",
        inStock: true,
      },
    ],
    verificationStatus: "declared",
  },
  {
    slug: "aromapassions-heavenly",
    referenceSlug: "angel",
    name: "Heavenly",
    brand: "AromaPassions",
    producerSlug: "aromapassions",
    pairingBasis: {
      source: "AromaPassions product title",
      quote: "HEAVENLY | Inspired by MUGLER ANGEL",
      url: "https://aromapassions.com/products/heavenly-mugler-angel-perfume-women-essential-oils-cheap-perfume-dupe-shop",
    },
    // "Black Currant" -> "Blackcurrant", the catalogue's spelling of the same
    // material. Nothing else changed.
    notes: {
      top: ["Bergamot", "Blackcurrant", "Jasmine", "Pineapple"],
      heart: ["Apricot", "Honey", "Nutmeg", "Rose"],
      base: ["Amber", "Musk", "Patchouli", "Sandalwood"],
    },
    facets: { freshness: 4, sweetness: 7, warmth: 6, woodyDepth: 4, longevity: 7, sillage: 7 },
    longevityHoursRange: [6, 8],
    sillageLabel: "Strong",
    priceUsd: 39,
    bottleMl: 50,
    concentration: "Extrait de Parfum",
    verdict:
      "The lowest-scoring listing in this batch and the number is doing real work: what AromaPassions declares is not Angel. Angel is chocolate, caramel, cotton candy and patchouli, a gourmand so dense it created its own category; this declares a fruity floral - bergamot, blackcurrant, pineapple over apricot, honey and rose, on amber, musk, patchouli and sandalwood. Only bergamot, apricot, honey and patchouli are shared, and the chocolate-and-caramel accord that makes Angel recognisable across a room is simply absent from the declaration. One genuine complication worth knowing before you write it off: this is one of the five products here that publishes an ingredient list, and that list contains patchouli, vanilla and ethyl maltol - the caramel-and-candyfloss material that is the backbone of Angel - none of which appears in the note pyramid the same page publishes. The merchant contradicts itself, and we score what is declared. If it smells closer to Angel than 52% suggests, the ingredient list is why, and the seller has given us no basis to say so.",
    offers: [
      {
        merchant: "AromaPassions",
        productName:
          "HEAVENLY | Inspired by MUGLER ANGEL | Mugler Angel Shooting Star Dupe Pheromone Perfume | Vanilla Patchouli Bergamot Currant Jasmine Nutmeg Orange Essential Oils - 50 ml / 1.7 Oz",
        productUrl:
          "https://aromapassions.com/products/heavenly-mugler-angel-perfume-women-essential-oils-cheap-perfume-dupe-shop",
        price: 39,
        currency: "USD",
        affiliateLinkId: "dupe-aromapassions-heavenly",
        inStock: true,
      },
      {
        merchant: "AromaPassions",
        productName:
          "HEAVENLY | Inspired by MUGLER ANGEL | Mugler Angel Shooting Star Dupe Pheromone Perfume | Vanilla Patchouli Bergamot Currant Jasmine Nutmeg Orange Essential Oils - 100 ml / 3.4 Oz",
        productUrl:
          "https://aromapassions.com/products/heavenly-mugler-angel-perfume-women-essential-oils-cheap-perfume-dupe-shop",
        price: 69,
        currency: "USD",
        affiliateLinkId: "dupe-aromapassions-heavenly",
        inStock: true,
      },
    ],
    verificationStatus: "declared",
  },
  {
    slug: "aromapassions-freedom",
    referenceSlug: "another-13",
    name: "Freedom",
    brand: "AromaPassions",
    producerSlug: "aromapassions",
    pairingBasis: {
      source: "AromaPassions product title",
      quote: "FREEDOM | Inspired by LE LABO ANOTHER 13",
      url: "https://aromapassions.com/products/freedom-le-labos-another-13-pheromone-perfume-dupe-shop",
    },
    // "Cedarwood" -> "Cedar", the catalogue's spelling for this reference.
    notes: {
      top: ["Pear", "Ambrette"],
      heart: ["Jasmine", "Cedar"],
      base: ["Oakmoss", "Amber", "Musk"],
    },
    facets: { freshness: 4, sweetness: 4, warmth: 5, woodyDepth: 5, longevity: 6, sillage: 5 },
    longevityHoursRange: [5, 7],
    sillageLabel: "Moderate",
    priceUsd: 39,
    bottleMl: 50,
    concentration: "Extrait de Parfum",
    verdict:
      "Fifty-six per cent on the declared pyramids, and this is a case where the pyramid is the wrong place to look. Another 13 is famously not about its note list - it is ambroxan and musk doing almost all the work, a soft skin-scent with jasmine and orange blossom floating over it. What AromaPassions declares here shares only jasmine and musk, and adds pear, ambrette and oakmoss the original does not have. But this is one of the five products that publishes an ingredient list, and that list is almost nothing but amber and musk molecules - ambercore, sylvamber, amberwood, dextramber, muscenone, isomuscone, helvetolide - which is a materially closer description of what Another 13 actually is than the note pyramid on the same page manages. Two of the seller's own documents disagree, and the score can only reflect the one that is comparable. Treat 56% as the floor rather than the estimate. The price gap is not in doubt either way: Le Labo's 50ml is $196 against $39 for the same size here, a bit over five times cheaper per millilitre.",
    offers: [
      {
        merchant: "AromaPassions",
        productName:
          "FREEDOM | Inspired by LE LABO ANOTHER 13 | Another 13 Dupe Pheromone Perfume - 50 ml / 1.7 Oz",
        productUrl:
          "https://aromapassions.com/products/freedom-le-labos-another-13-pheromone-perfume-dupe-shop",
        price: 39,
        currency: "USD",
        affiliateLinkId: "dupe-aromapassions-freedom",
        inStock: true,
      },
      {
        merchant: "AromaPassions",
        productName:
          "FREEDOM | Inspired by LE LABO ANOTHER 13 | Another 13 Dupe Pheromone Perfume - 100 ml / 3.4 Oz",
        productUrl:
          "https://aromapassions.com/products/freedom-le-labos-another-13-pheromone-perfume-dupe-shop",
        price: 69,
        currency: "USD",
        affiliateLinkId: "dupe-aromapassions-freedom",
        inStock: true,
      },
    ],
    verificationStatus: "declared",
  },
  {
    slug: "aromapassions-virility",
    referenceSlug: "antaeus",
    name: "Virility",
    brand: "AromaPassions",
    producerSlug: "aromapassions",
    pairingBasis: {
      source: "AromaPassions product title",
      quote: "VIRILITY | Inspired by CHANEL ANTAEUS",
      url: "https://aromapassions.com/products/virility-chanel-antaeus-dupe-perfume-essential-oils",
    },
    // "Myrhh" is the merchant's typo for Myrrh. "Amalfi Lemon" -> "Lemon" and
    // "French labdanum" -> "Labdanum": geographic qualifiers on materials the
    // catalogue already records under the plain name.
    notes: {
      top: ["Myrrh", "Clary Sage", "Coriander", "Bergamot", "Lime", "Lemon"],
      heart: ["Rose", "Thyme", "Basil", "Jasmine"],
      base: ["Castoreum", "Oakmoss", "Patchouli", "Labdanum"],
    },
    facets: { freshness: 5, sweetness: 2, warmth: 6, woodyDepth: 7, longevity: 7, sillage: 6 },
    longevityHoursRange: [6, 9],
    sillageLabel: "Strong",
    priceUsd: 39,
    bottleMl: 50,
    concentration: "Extrait de Parfum",
    verdict:
      "Antaeus is a 1981 leather chypre and one of the harder things on this site to interpret cheaply, because its character is castoreum and oakmoss over labdanum - animalic materials that are expensive, restricted, or both. Credit where it is due: this declaration keeps castoreum, oakmoss, patchouli and labdanum, which is most of what makes Antaeus what it is, and it is the only reason the pairing is worth making at all. The differences are in the middle. Chanel's heart is labdanum, patchouli, jasmine and clary sage; this moves labdanum and patchouli to the base and fills the heart with rose, thyme and basil instead, and moves clary sage up into the opening. So expect a brighter, herbier, more citrus-led first hour - lime and lemon where the original has myrtle and basil - before it settles somewhere recognisably close. Sixty-one per cent is a fair reading of 'same destination, different route'. Notably, Antaeus has no leather note declared here at all, and leather is the note most people would name first if asked what Antaeus smells like.",
    offers: [
      {
        merchant: "AromaPassions",
        productName:
          "VIRILITY | Inspired by CHANEL ANTAEUS | Antaeus Dupe Pheromone Perfume - 50 ml",
        productUrl: "https://aromapassions.com/products/virility-chanel-antaeus-dupe-perfume-essential-oils",
        price: 39,
        currency: "USD",
        affiliateLinkId: "dupe-aromapassions-virility",
        inStock: true,
      },
      {
        merchant: "AromaPassions",
        productName:
          "VIRILITY | Inspired by CHANEL ANTAEUS | Antaeus Dupe Pheromone Perfume - 100 ml",
        productUrl: "https://aromapassions.com/products/virility-chanel-antaeus-dupe-perfume-essential-oils",
        price: 69,
        currency: "USD",
        affiliateLinkId: "dupe-aromapassions-virility",
        inStock: true,
      },
    ],
    verificationStatus: "declared",
  },
  {
    slug: "aromapassions-bittersweet",
    referenceSlug: "bitter-peach",
    name: "Bittersweet",
    brand: "AromaPassions",
    producerSlug: "aromapassions",
    pairingBasis: {
      source: "AromaPassions product title",
      quote: "BITTERSWEET | Inspired by TOM FORD BITTER PEACH",
      url: "https://aromapassions.com/products/bittersweet-tom-ford-bitter-peach-men-women-perfume-essential-oils-cheap-perfume-dupe-shop",
    },
    // "Cognac" and "Rum Absolute" are genuinely different materials and are
    // kept apart, as are "Blood Orange" and plain orange.
    notes: {
      top: ["Peach", "Blood Orange", "Cardamom"],
      heart: ["Cognac", "Davana", "Jasmine"],
      base: ["Patchouli", "Vanilla", "Tonka Bean", "Sandalwood"],
    },
    facets: { freshness: 3, sweetness: 8, warmth: 7, woodyDepth: 5, longevity: 7, sillage: 7 },
    longevityHoursRange: [6, 9],
    sillageLabel: "Strong",
    priceUsd: 39,
    bottleMl: 50,
    concentration: "Extrait de Parfum",
    verdict:
      "The two materials that actually decide whether a Bitter Peach interpretation works are peach and davana, and both are declared here - davana especially, which is the apricot-and-rum smelling oil that gives the Tom Ford its overripe, slightly fermented quality and is the reason cheap peach fragrances usually miss. The booze is present too, as cognac where Tom Ford uses rum absolute; different material, same job. What is missing is osmanthus, which supplies the leathery-apricot facet, and benzoin, which is a good part of the original's sweetness. In their place go jasmine, patchouli and tonka bean, so expect a rounder, more conventionally gourmand drydown and less of the strange dryness underneath. Sixty-one per cent understates how close the opening should be and reflects real divergence later. It is also the second-biggest per-ml gap in this batch: Tom Ford's 50ml is $265, the same size here is $39.",
    offers: [
      {
        merchant: "AromaPassions",
        productName:
          "BITTERSWEET | Inspired by TOM FORD BITTER PEACH | Bitter Peach Dupe Pheromone Perfume | Peach Davana Scent Notes | Cardamom Nutmeg Jasmine Patchouli Sandalwood Essential Oils - 50 ml / 1.7 Oz",
        productUrl:
          "https://aromapassions.com/products/bittersweet-tom-ford-bitter-peach-men-women-perfume-essential-oils-cheap-perfume-dupe-shop",
        price: 39,
        currency: "USD",
        affiliateLinkId: "dupe-aromapassions-bittersweet",
        inStock: true,
      },
      {
        merchant: "AromaPassions",
        productName:
          "BITTERSWEET | Inspired by TOM FORD BITTER PEACH | Bitter Peach Dupe Pheromone Perfume | Peach Davana Scent Notes | Cardamom Nutmeg Jasmine Patchouli Sandalwood Essential Oils - 100 ml / 3.4 Oz",
        productUrl:
          "https://aromapassions.com/products/bittersweet-tom-ford-bitter-peach-men-women-perfume-essential-oils-cheap-perfume-dupe-shop",
        price: 69,
        currency: "USD",
        affiliateLinkId: "dupe-aromapassions-bittersweet",
        inStock: true,
      },
    ],
    verificationStatus: "declared",
  },
  {
    slug: "aromapassions-glamorous",
    referenceSlug: "bright-crystal",
    name: "Glamorous",
    brand: "AromaPassions",
    producerSlug: "aromapassions",
    pairingBasis: {
      source: "AromaPassions product title",
      quote: "GLAMOROUS | Inspired by VERSACE BRIGHT CRYSTAL",
      url: "https://aromapassions.com/products/glamorous-inspired-by-versace-bright-crystal-dupe-perfume",
    },
    // DECLARED AS-IS AND THIS MATTERS. The merchant writes "Ice" and "Lotus"
    // where the catalogue records "Ice Accord" and "Lotus Flower". They are not
    // promoted to the catalogue's spelling, because the normalising rule never
    // ADDS a qualifier - and those two strings are the only thing keeping this
    // listing clear of isVerbatimCopy(). Change them to match the reference and
    // this listing flags and stops rendering anywhere. See the batch header.
    notes: {
      top: ["Yuzu", "Pomegranate", "Ice"],
      heart: ["Peony", "Lotus", "Magnolia"],
      base: ["Musk", "Mahogany", "Amber"],
    },
    // Identical to the reference's, and deliberately so: the merchant has
    // declared Versace's own pyramid with nothing added, subtracted or
    // reordered, so there is no declared difference for a facet estimate to be
    // based on. Writing invented differences here to make the listing look
    // independently assessed would be the exact dishonesty the copy check
    // exists to catch.
    facets: { freshness: 6, sweetness: 5, warmth: 3, woodyDepth: 2, longevity: 5, sillage: 5 },
    longevityHoursRange: [4, 6],
    sillageLabel: "Moderate",
    priceUsd: 29,
    bottleMl: 50,
    concentration: "Extrait de Parfum",
    verdict:
      "Do not read 86% as evidence. AromaPassions has published Bright Crystal's own note pyramid as this product's - yuzu, pomegranate and an icy accord, then peony, lotus and magnolia, then musk, mahogany and amber - in all three layers, with nothing added and nothing left out, and no ingredient list to check it against. That means the score is measuring how closely the seller's marketing copy tracks Versace's, which is not the same question as how closely the liquid does, and we have nothing independent to answer the second one with. Our facet ratings say the same thing by being identical to the original's: there is no declared difference for them to reflect. The one solid observation is about money rather than smell, and it points the other way. Bright Crystal is among the cheapest designer bottles in this catalogue at roughly $0.76 per ml; at $29 for 50ml this is about $0.58, so the saving is around a quarter, not the several-fold gap most listings here show. If you want Bright Crystal, the real thing is close enough in price to be worth the difference.",
    offers: [
      {
        merchant: "AromaPassions",
        productName:
          "GLAMOROUS | Inspired by VERSACE BRIGHT CRYSTAL | Bright Crystal Dupe Pheromone Perfume - 50 ml",
        productUrl:
          "https://aromapassions.com/products/glamorous-inspired-by-versace-bright-crystal-dupe-perfume",
        // The one product in this batch priced differently from the rest, live
        // as well as in the feed. Feed rows say $29/$45/$79; live is $29/$59.
        price: 29,
        currency: "USD",
        affiliateLinkId: "dupe-aromapassions-glamorous",
        inStock: true,
      },
      {
        merchant: "AromaPassions",
        productName:
          "GLAMOROUS | Inspired by VERSACE BRIGHT CRYSTAL | Bright Crystal Dupe Pheromone Perfume - 100 ml",
        productUrl:
          "https://aromapassions.com/products/glamorous-inspired-by-versace-bright-crystal-dupe-perfume",
        price: 59,
        currency: "USD",
        affiliateLinkId: "dupe-aromapassions-glamorous",
        inStock: true,
      },
    ],
    verificationStatus: "declared",
  },
  {
    slug: "aromapassions-sparkle",
    referenceSlug: "cedrat-boise",
    name: "Sparkle",
    brand: "AromaPassions",
    producerSlug: "aromapassions",
    pairingBasis: {
      source: "AromaPassions product title",
      quote: "SPARKLE | Inspired by MANCERA CEDRAT BOISE",
      url: "https://aromapassions.com/products/sparkle-mancera-cedrat-boise-dupe-perfume",
    },
    // "Sicilian Lemon" -> "Lemon", "Patchouli Leaf" -> "Patchouli",
    // "Black Currant" -> "Blackcurrant". The merchant's own placeholder notes
    // ("Spicy Notes", "Fruity Notes") are left exactly as declared rather than
    // matched to the catalogue's "Spices": neither is a material, and pairing
    // vague labels to inflate the overlap is not normalisation.
    notes: {
      top: ["Lemon", "Blackcurrant", "Bergamot", "Spicy Notes"],
      heart: ["Fruity Notes", "Patchouli", "Water Jasmine"],
      base: ["Cedar", "Leather", "Sandalwood", "Vanilla", "White Musk", "Moss"],
    },
    facets: { freshness: 7, sweetness: 6, warmth: 6, woodyDepth: 7, longevity: 7, sillage: 7 },
    longevityHoursRange: [6, 9],
    sillageLabel: "Strong",
    priceUsd: 39,
    bottleMl: 50,
    concentration: "Extrait de Parfum",
    verdict:
      "Sixty per cent is lower than this pairing deserves and the reason is a wording problem rather than a formulation one. The base is where Cedrat Boise lives - vanilla, white musk, sandalwood and patchouli under a lemon opening - and three of those four are declared here, with cedar, leather and moss added. That is a credible reading of the same fragrance, a bit drier and more leathery. The score is dragged down by the heart, where Mancera's is recorded as spices and leather and this declares 'Fruity Notes' and 'Water Jasmine'; we count 'Spicy Notes' and 'Spices' as different because neither names a material, and matching up vague labels to raise a percentage is how a score stops meaning anything. The honest summary is that the opening and the drydown should track reasonably and the middle is a guess for both of us. Worth knowing that Cedrat Boise is a 120ml bottle, which makes its per-ml price much closer to this than the sticker suggests.",
    offers: [
      {
        merchant: "AromaPassions",
        productName:
          "SPARKLE | Inspired by MANCERA CEDRAT BOISE | Cedrat Boise Dupe Pheromone Perfume - 50 ml",
        productUrl: "https://aromapassions.com/products/sparkle-mancera-cedrat-boise-dupe-perfume",
        price: 39,
        currency: "USD",
        affiliateLinkId: "dupe-aromapassions-sparkle",
        inStock: true,
      },
      {
        merchant: "AromaPassions",
        productName:
          "SPARKLE | Inspired by MANCERA CEDRAT BOISE | Cedrat Boise Dupe Pheromone Perfume - 100 ml",
        productUrl: "https://aromapassions.com/products/sparkle-mancera-cedrat-boise-dupe-perfume",
        price: 69,
        currency: "USD",
        affiliateLinkId: "dupe-aromapassions-sparkle",
        inStock: true,
      },
    ],
    verificationStatus: "declared",
  },
  {
    slug: "aromapassions-admire",
    referenceSlug: "chance-eau-tendre",
    name: "Admire",
    brand: "AromaPassions",
    producerSlug: "aromapassions",
    pairingBasis: {
      source: "AromaPassions product title",
      quote: "ADMIRE | Inspired by CHANEL CHANCE EAU TENDRE",
      url: "https://aromapassions.com/products/admire-inspired-by-chanel-chance-eau-tendre-dupe-perfume",
    },
    // "Virginia Cedar" -> "Cedar". The merchant's plain "Musk" is NOT promoted
    // to the catalogue's "White Musk" - a qualifier is never added - so the
    // base diff shows them as different notes and the score is understated.
    notes: {
      top: ["Quince", "Grapefruit"],
      heart: ["Hyacinth", "Jasmine"],
      base: ["Musk", "Iris", "Cedar", "Amber"],
    },
    facets: { freshness: 7, sweetness: 5, warmth: 4, woodyDepth: 4, longevity: 6, sillage: 5 },
    longevityHoursRange: [5, 7],
    sillageLabel: "Moderate",
    priceUsd: 39,
    bottleMl: 50,
    concentration: "Extrait de Parfum",
    verdict:
      "Another one where the merchant has declared the original's own top and heart back - quince and grapefruit, then hyacinth and jasmine, Chance Eau Tendre exactly - so a good part of 85% is their copywriting rather than our finding. The base is where there is anything of their own, and it is a real difference: Chanel's is amber, white musk and cedar, and this adds iris. Iris is powdery and slightly cool, and it tends to pull a soft fruity-floral toward something drier and more grown-up, so the reasonable expectation is Chance Eau Tendre with a chalkier finish rather than a copy of it. The seller declares plain musk where our catalogue records Chanel's as white musk, and we count those separately rather than assume, so the true overlap is a shade higher than the number. Chance Eau Tendre is a $150 bottle and this is $39 for a third less liquid, which is a genuine saving without being a dramatic one.",
    offers: [
      {
        merchant: "AromaPassions",
        productName:
          "ADMIRE | Inspired by CHANEL CHANCE EAU TENDRE | Chance Eau Tendre Dupe Pheromone Perfume - 50 ml",
        productUrl:
          "https://aromapassions.com/products/admire-inspired-by-chanel-chance-eau-tendre-dupe-perfume",
        price: 39,
        currency: "USD",
        affiliateLinkId: "dupe-aromapassions-admire",
        inStock: true,
      },
      {
        merchant: "AromaPassions",
        productName:
          "ADMIRE | Inspired by CHANEL CHANCE EAU TENDRE | Chance Eau Tendre Dupe Pheromone Perfume - 100 ml",
        productUrl:
          "https://aromapassions.com/products/admire-inspired-by-chanel-chance-eau-tendre-dupe-perfume",
        price: 69,
        currency: "USD",
        affiliateLinkId: "dupe-aromapassions-admire",
        inStock: true,
      },
    ],
    verificationStatus: "declared",
  },
  {
    slug: "aromapassions-sensual",
    referenceSlug: "costa-azzurra",
    name: "Sensual",
    brand: "AromaPassions",
    producerSlug: "aromapassions",
    pairingBasis: {
      source: "AromaPassions product title",
      quote: "SENSUAL | Inspired by Tom Ford COSTA AZZURRA",
      url: "https://aromapassions.com/products/sensual-tom-ford-costa-azzura-perfume-men-women-essential-oils-cheap-perfume-dupe-shop",
    },
    // "myrtle oil" -> "Myrtle", "juniper berries" -> "Juniper", "cypress oil"
    // -> "Cypress". Mastic and lentisque come from the same plant and the
    // merchant lists both; both are kept, because merging two declared entries
    // into one would be editing their declaration rather than normalising it.
    notes: {
      top: ["Lemon", "Juniper", "Myrtle"],
      heart: ["Cypress", "Pine Needles"],
      base: ["Labdanum", "Amber", "Mastic", "Lentisque"],
    },
    facets: { freshness: 7, sweetness: 2, warmth: 5, woodyDepth: 7, longevity: 6, sillage: 5 },
    longevityHoursRange: [5, 7],
    sillageLabel: "Moderate",
    priceUsd: 39,
    bottleMl: 50,
    concentration: "Extrait de Parfum",
    verdict:
      "The lowest note overlap of anything in this batch - myrtle is the only note both pyramids name in the same layer - and yet this is one of the more defensible pairings here, which is exactly the sort of thing the number cannot tell you. Costa Azzurra is a Mediterranean coastal idea: driftwood, seaweed and myrtle over juniper, oakmoss and vetiver, finishing on agarwood and frankincense. This declares the same idea built from different plants - lemon, juniper and myrtle over cypress and pine needles, on labdanum, amber and mastic. Mastic in particular is the resin of the same Mediterranean shrub the Tom Ford's whole character is built around. Its ingredient list, which it does publish, includes olibanum - frankincense, the original's own base note - alongside cedarwood, rosemary, pine and Sicilian lemon. So read 50% as 'same landscape, different plants', not as a bad match. It is also the biggest per-ml gap in this batch by a distance: $320 for Tom Ford's 50ml against $39 for the same size here.",
    offers: [
      {
        merchant: "AromaPassions",
        productName:
          "SENSUAL | Inspired by Tom Ford COSTA AZZURRA | Costa Azzurra Eau De Parfum Dupe Pheromone Perfume | Lemon Rosemary Essential Oils - 50 ml / 1.7 Oz",
        productUrl:
          "https://aromapassions.com/products/sensual-tom-ford-costa-azzura-perfume-men-women-essential-oils-cheap-perfume-dupe-shop",
        price: 39,
        currency: "USD",
        affiliateLinkId: "dupe-aromapassions-sensual",
        inStock: true,
      },
      {
        merchant: "AromaPassions",
        productName:
          "SENSUAL | Inspired by Tom Ford COSTA AZZURRA | Costa Azzurra Eau De Parfum Dupe Pheromone Perfume | Lemon Rosemary Essential Oils - 100 ml / 3.4 Oz",
        productUrl:
          "https://aromapassions.com/products/sensual-tom-ford-costa-azzura-perfume-men-women-essential-oils-cheap-perfume-dupe-shop",
        price: 69,
        currency: "USD",
        affiliateLinkId: "dupe-aromapassions-sensual",
        inStock: true,
      },
    ],
    verificationStatus: "declared",
  },
  {
    slug: "aromapassions-erotic",
    referenceSlug: "eros",
    name: "Erotic",
    brand: "AromaPassions",
    producerSlug: "aromapassions",
    pairingBasis: {
      source: "AromaPassions product title",
      quote: "EROTIC | Inspired by VERSACE EROS",
      url: "https://aromapassions.com/products/erotic-inspired-by-versace-eros-dupe-perfume",
    },
    // "Madagascar Vanilla" -> "Vanilla". "Virginian Cedar" and "Atlas Cedar"
    // are kept apart and neither is collapsed onto the reference's
    // "Cedarwood": they are two distinct materials the merchant declares
    // separately, and merging them would invent a single note it did not name.
    notes: {
      top: ["Mint", "Green Apple", "Lemon"],
      heart: ["Tonka Bean", "Ambroxan", "Geranium"],
      base: ["Vanilla", "Virginian Cedar", "Atlas Cedar", "Vetiver", "Oakmoss"],
    },
    facets: { freshness: 6, sweetness: 6, warmth: 5, woodyDepth: 6, longevity: 7, sillage: 7 },
    longevityHoursRange: [6, 9],
    sillageLabel: "Strong",
    priceUsd: 39,
    bottleMl: 50,
    concentration: "Extrait de Parfum",
    verdict:
      "The declared top and heart are Versace's unchanged - mint, green apple and lemon, then tonka, ambroxan and geranium - which is most of why this reads 86%, so treat the number as the merchant's claim rather than our measurement. The base is the one place it describes itself: two named cedars, Virginian and Atlas, in place of Eros's generic cedarwood, which should make the drydown woodier and a little drier than the original's fairly sweet finish. The thing actually worth weighing here is the price, and it does not favour this bottle. Eros is a cheap designer fragrance - about $0.75 per millilitre for a 100ml bottle - and 50ml here is $39, or roughly $0.78. That is not a saving; per millilitre it is fractionally more than the real thing, and the 100ml at $69 only just goes the other way. AromaPassions states a 20% concentration it calls Extrait de Parfum, which we have not verified and which would not make it a closer match in any case - a higher percentage is a claim about strength, not about similarity. If a discount on Eros is what you came for, this is not one.",
    offers: [
      {
        merchant: "AromaPassions",
        productName: "EROTIC | Inspired by VERSACE EROS | Eros Dupe Pheromone Perfume - 50 ml",
        productUrl: "https://aromapassions.com/products/erotic-inspired-by-versace-eros-dupe-perfume",
        price: 39,
        currency: "USD",
        affiliateLinkId: "dupe-aromapassions-erotic",
        inStock: true,
      },
      {
        merchant: "AromaPassions",
        productName: "EROTIC | Inspired by VERSACE EROS | Eros Dupe Pheromone Perfume - 100 ml",
        productUrl: "https://aromapassions.com/products/erotic-inspired-by-versace-eros-dupe-perfume",
        price: 69,
        currency: "USD",
        affiliateLinkId: "dupe-aromapassions-erotic",
        inStock: true,
      },
    ],
    verificationStatus: "declared",
  },
  {
    slug: "aromapassions-masculinity",
    referenceSlug: "eros-flame",
    name: "Masculinity",
    brand: "AromaPassions",
    producerSlug: "aromapassions",
    pairingBasis: {
      source: "AromaPassions product title",
      quote: "MASCULINITY | Inspired by VERSACE EROS FLAME",
      url: "https://aromapassions.com/products/masculinity-inspired-by-versace-eros-flame-dupe-perfume",
    },
    // "Mandarin Orange" -> "Mandarin", "Texas Cedar" -> "Cedar". A single
    // geographically-qualified cedar is collapsed onto the catalogue's plain
    // name; two distinct cedars are not (see EROTIC above). The merchant's
    // plain "Pepper" is left as declared rather than matched to the
    // reference's "Pepperwood", which is a different material.
    notes: {
      top: ["Mandarin", "Black Pepper", "Lemon", "Chinotto", "Rosemary"],
      heart: ["Pepper", "Geranium", "Rose"],
      base: ["Vanilla", "Tonka Bean", "Sandalwood", "Cedar", "Patchouli", "Oakmoss"],
    },
    facets: { freshness: 6, sweetness: 6, warmth: 7, woodyDepth: 7, longevity: 7, sillage: 7 },
    longevityHoursRange: [6, 9],
    sillageLabel: "Strong",
    priceUsd: 39,
    bottleMl: 50,
    concentration: "Extrait de Parfum",
    verdict:
      "Eros Flame's whole base is declared here intact - vanilla, tonka, sandalwood, cedar and patchouli - with oakmoss added, and four of its five top notes as well. The two real differences are chinotto in the opening, a bitter citrus that should cut the sweetness Eros Flame is often criticised for, and plain pepper in the heart where Versace uses pepperwood, which is a woodier material than the spice. So the shape is close and the reading is slightly drier and less syrupy. Eighty-three per cent is a fair number for that, with the usual caveat that a good part of it is the merchant restating Versace's own list. One thing to know that is not about the fragrance: this is the only product in this batch whose affiliate link is built from a discontinued 30ml feed row, because AromaPassions dropped that size and never published a feed row for the 50ml. The link still lands on the right product page - the merchant's links are product-level, not variant-level - and both sizes below are live and in stock, checked on the store itself rather than in the feed.",
    offers: [
      {
        merchant: "AromaPassions",
        productName:
          "MASCULINITY | Inspired by VERSACE EROS FLAME | Eros Flame Dupe Pheromone Perfume - 50 ml",
        productUrl:
          "https://aromapassions.com/products/masculinity-inspired-by-versace-eros-flame-dupe-perfume",
        // NOT FROM THE FEED, AND IT COULD NOT HAVE BEEN. This product's only
        // feed row is the delisted 30ml at $29. Both figures below were read
        // off the live variant list (sku VRF-093-X / VRF-093-XC) on 2026-09-04.
        price: 39,
        currency: "USD",
        affiliateLinkId: "dupe-aromapassions-masculinity",
        inStock: true,
      },
      {
        merchant: "AromaPassions",
        productName:
          "MASCULINITY | Inspired by VERSACE EROS FLAME | Eros Flame Dupe Pheromone Perfume - 100 ml",
        productUrl:
          "https://aromapassions.com/products/masculinity-inspired-by-versace-eros-flame-dupe-perfume",
        price: 69,
        currency: "USD",
        affiliateLinkId: "dupe-aromapassions-masculinity",
        inStock: true,
      },
    ],
    verificationStatus: "declared",
  },
  {
    slug: "aromapassions-mystical",
    referenceSlug: "flora-gorgeous-gardenia",
    name: "Mystical",
    brand: "AromaPassions",
    producerSlug: "aromapassions",
    pairingBasis: {
      source: "AromaPassions product title",
      quote: "MYSTICAL | Inspired by GUCCI FLORA GORGEOUS GARDENIA",
      url: "https://aromapassions.com/products/mystical-inspired-by-gucci-flora-gorgeous-gardenia-dupe-perfume",
    },
    // "Italian Mandarin" -> "Mandarin". "Pear Blossom" is NOT shortened to the
    // catalogue's "Pear": the blossom and the fruit are different notes, and
    // collapsing them would be adding an overlap the merchant did not declare.
    notes: {
      top: ["Pear Blossom", "Red Berries", "Mandarin"],
      heart: ["Gardenia", "Jasmine", "Frangipani"],
      base: ["Brown Sugar", "Patchouli"],
    },
    facets: { freshness: 5, sweetness: 7, warmth: 5, woodyDepth: 3, longevity: 6, sillage: 6 },
    longevityHoursRange: [5, 7],
    sillageLabel: "Strong",
    priceUsd: 39,
    bottleMl: 50,
    concentration: "Extrait de Parfum",
    verdict:
      "Flora Gorgeous Gardenia is a short fragrance - six notes, with brown sugar and patchouli carrying the whole base - and this declares that base back exactly, which is most of the 86%. Read it as their claim rather than our finding. The heart adds jasmine to Gucci's gardenia and frangipani, which is a sensible move rather than a lazy one: jasmine and gardenia share materials and jasmine is the cheaper of the two, so a low-cost interpretation leaning on it is what you would expect, and it should read a shade greener and less creamy than the original. Mandarin in the opening adds a citrus lift Gucci does not have. The one genuine question the data cannot answer is the gardenia itself, which is the entire point of the original and the hardest thing in this pyramid to do cheaply. Everything around it looks right; whether the middle of it does is not something a note list can tell you.",
    offers: [
      {
        merchant: "AromaPassions",
        productName:
          "MYSTICAL | Inspired by GUCCI FLORA GORGEOUS GARDENIA | Flora Gorgeous Gardenia Dupe Pheromone Perfume - 50 ml",
        productUrl:
          "https://aromapassions.com/products/mystical-inspired-by-gucci-flora-gorgeous-gardenia-dupe-perfume",
        price: 39,
        currency: "USD",
        affiliateLinkId: "dupe-aromapassions-mystical",
        inStock: true,
      },
      {
        merchant: "AromaPassions",
        productName:
          "MYSTICAL | Inspired by GUCCI FLORA GORGEOUS GARDENIA | Flora Gorgeous Gardenia Dupe Pheromone Perfume - 100 ml",
        productUrl:
          "https://aromapassions.com/products/mystical-inspired-by-gucci-flora-gorgeous-gardenia-dupe-perfume",
        price: 69,
        currency: "USD",
        affiliateLinkId: "dupe-aromapassions-mystical",
        inStock: true,
      },
    ],
    verificationStatus: "declared",
  },
  {
    slug: "aromapassions-blooming",
    referenceSlug: "flowerbomb",
    name: "Blooming",
    brand: "AromaPassions",
    producerSlug: "aromapassions",
    pairingBasis: {
      source: "AromaPassions product title",
      quote: "BLOOMING | Inspired by VIKTOR ROLF FLOWERBOMB",
      url: "https://aromapassions.com/products/blooming-flowerbomb-viktor-rolf-perfume-women-essential-oils-cheap-perfume-dupe-shop",
    },
    // The merchant's plain "Orchid" is left as declared rather than promoted to
    // the catalogue's "Cattleya Orchid" - a qualifier is never added - so the
    // heart diff shows them as different notes and the score is understated.
    notes: {
      top: ["Tea", "Bergamot", "Osmanthus"],
      heart: ["Orchid", "Jasmine", "Rose", "African Orange"],
      base: ["Patchouli", "Musk", "Vanilla"],
    },
    facets: { freshness: 3, sweetness: 8, warmth: 6, woodyDepth: 2, longevity: 7, sillage: 7 },
    longevityHoursRange: [6, 9],
    sillageLabel: "Strong",
    priceUsd: 39,
    bottleMl: 50,
    concentration: "Extrait de Parfum",
    verdict:
      "The opening is declared identical - tea, bergamot and osmanthus, which is an unusual and quite specific trio to get right - and Flowerbomb's patchouli-and-musk base is kept with vanilla added, so the two ends should track well. The middle is where it diverges: Viktor & Rolf's freesia is dropped, African orange flower is added, and the orchid is declared as plain orchid rather than the cattleya the original names, which we count as a different note rather than assume they mean the same thing. Added vanilla on top of a base that is already patchouli and musk should push the drydown sweeter and more obviously gourmand than Flowerbomb's, which stays floral longer than people expect. Seventy-nine per cent is a fair reading. Flowerbomb is a $108 50ml bottle, so at $39 for the same size the saving here is real without being one of the extremes on this site.",
    offers: [
      {
        merchant: "AromaPassions",
        productName:
          "BLOOMING | Inspired by VIKTOR ROLF FLOWERBOMB | Flowerbomb Dupe Pheromone Eau De Parfum | Bergamot Jasmine Patchouli Vanilla Rose Essential Oils - 50 ml / 1.7 Oz",
        productUrl:
          "https://aromapassions.com/products/blooming-flowerbomb-viktor-rolf-perfume-women-essential-oils-cheap-perfume-dupe-shop",
        price: 39,
        currency: "USD",
        affiliateLinkId: "dupe-aromapassions-blooming",
        inStock: true,
      },
      {
        merchant: "AromaPassions",
        productName:
          "BLOOMING | Inspired by VIKTOR ROLF FLOWERBOMB | Flowerbomb Dupe Pheromone Eau De Parfum | Bergamot Jasmine Patchouli Vanilla Rose Essential Oils - 100 ml / 3.4 Oz",
        productUrl:
          "https://aromapassions.com/products/blooming-flowerbomb-viktor-rolf-perfume-women-essential-oils-cheap-perfume-dupe-shop",
        price: 69,
        currency: "USD",
        affiliateLinkId: "dupe-aromapassions-blooming",
        inStock: true,
      },
    ],
    verificationStatus: "declared",
  },
  {
    slug: "aromapassions-revive",
    referenceSlug: "green-irish-tweed",
    name: "Revive",
    brand: "AromaPassions",
    producerSlug: "aromapassions",
    pairingBasis: {
      source: "AromaPassions product title",
      quote: "REVIVE | Inspired by CREED GREEN IRISH TWEED",
      url: "https://aromapassions.com/products/revive-creed-green-irish-tweed-dupe-perfume-men",
    },
    notes: {
      top: ["Lemon Verbena", "Iris"],
      heart: ["Violet Leaf"],
      base: ["Ambergris", "Sandalwood"],
    },
    facets: { freshness: 8, sweetness: 3, warmth: 3, woodyDepth: 6, longevity: 6, sillage: 6 },
    longevityHoursRange: [5, 8],
    sillageLabel: "Strong",
    priceUsd: 39,
    bottleMl: 50,
    concentration: "Extrait de Parfum",
    verdict:
      "The shortest declaration in this batch - five notes against Green Irish Tweed's six - and it names four of the original's, including the ambergris-and-sandalwood base that gives the Creed its salty, slightly powdery finish. Two differences, and the smaller one is not what it looks like: iris is declared in the top here rather than the heart, which mostly changes when its powderiness shows up rather than whether it does. The larger one is that peppermint is absent, and peppermint is a good part of why Green Irish Tweed reads as cold and green rather than merely fresh - without it the violet leaf has to carry that alone, so expect something softer and less bracing in the first ten minutes. Eighty-three per cent is a defensible reading of a genuinely spare fragrance being interpreted spare. Green Irish Tweed is $400 for 100ml against $39 for 50ml here, about five times cheaper per millilitre - and Creed's price is a large part of why anyone looks for an alternative to this one in the first place.",
    offers: [
      {
        merchant: "AromaPassions",
        productName:
          "REVIVE | Inspired by CREED GREEN IRISH TWEED | Green Irish Tweed Dupe Pheromone Perfume - 50 ml",
        productUrl:
          "https://aromapassions.com/products/revive-creed-green-irish-tweed-dupe-perfume-men",
        price: 39,
        currency: "USD",
        affiliateLinkId: "dupe-aromapassions-revive",
        inStock: true,
      },
      {
        merchant: "AromaPassions",
        productName:
          "REVIVE | Inspired by CREED GREEN IRISH TWEED | Green Irish Tweed Dupe Pheromone Perfume - 100 ml",
        productUrl:
          "https://aromapassions.com/products/revive-creed-green-irish-tweed-dupe-perfume-men",
        price: 69,
        currency: "USD",
        affiliateLinkId: "dupe-aromapassions-revive",
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
