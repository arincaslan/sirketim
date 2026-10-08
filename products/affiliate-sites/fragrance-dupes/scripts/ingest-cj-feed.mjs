/**
 * Ingests the FragranceShop.com CJ product feed into
 * lib/data/cj-offers.generated.ts.
 *
 * WHY A SECOND INGEST SCRIPT
 * --------------------------
 * scripts/ingest-feed.mjs reads an Awin feed with lowercase snake_case columns
 * (`product_name`, `search_price`, `aw_deep_link`). CJ delivers a Google
 * Shopping export: 87 UPPERCASE columns, TAB-delimited, with the price as a
 * single "8.95 USD" string and the affiliate link already wrapped. Nothing but
 * the product-identity rules is shared, and those now live in
 * scripts/lib/product-matching.mjs, which both networks' notion of "same
 * fragrance" comes from.
 *
 * WHAT THIS FEED CAN SUPPLY THAT THE AWIN ONE COULD NOT — verified 2026-09-07
 * --------------------------------------------------------------------------
 * **BOTTLE SIZE.** 99.4% of titles end in a stated volume ("... Spray 3.4 oz").
 * The Awin feed had no size column at all, which is the documented reason
 * `priceUsd` was never ingested: a price detached from its volume makes the
 * "Nx cheaper per ml" claim wrong on the page rather than merely stale. With a
 * size we can pick the variant matching each reference's own `bottleMl` and
 * record a price that means something. See lib/data/references.ts.
 *
 * Sizes snap to nominal values — a merchant's "3.4 oz" is the 100 ml bottle,
 * and converting literally gives 101. parseNominalMl handles this.
 *
 * WHAT IT STILL CANNOT SUPPLY
 * ---------------------------
 * A trustworthy image for every row. 858 of 5,802 rows point at one of four
 * SHARED stock photographs (a generic oil bottle, a generic flacon, an "image
 * coming soon" placeholder) spread across Dior, Armani, Gucci and Burberry
 * among others. Attaching one of those to a named fragrance would show the
 * visitor a bottle that is not the product. They are rejected by URL below,
 * and a reference that only matched such a row keeps no image rather than a
 * wrong one.
 *
 * `DESCRIPTION` is the merchant's own marketing copy and is deliberately NOT
 * ingested — republishing it would be duplicate content we did not write, on a
 * site whose whole pitch is independent analysis. It is also, on this feed,
 * usually just the title repeated.
 *
 * `--feed` IS A NEW WAY TO GET THIS WRONG, AND THE REFUSAL BELOW IS ITS GUARD
 * ---------------------------------------------------------------------------
 * All three CJ subscriptions delivered here have carried exactly one advertiser
 * ("productlist" = FragranceShop 16941446, "feedparfumania" = Perfumania
 * 17335854, "IRFE PRODUCTS" = IRFE 17213922), and the founder's call of
 * 2026-10-05 is that we stop building for the multi-advertiser case on three
 * consecutive counts of evidence against it. The per-advertiser row splitting
 * that was written for it is gone.
 *
 * The assertion is NOT gone, because it answers a different question, and the
 * question is one this script created for itself. `--feed <path>` lets any
 * export be handed to a configuration that describes ONE merchant: every id
 * emitted below is a hardcoded `original-<referenceSlug>` or `shop-<productSlug>`,
 * FragranceShop's namespace, and the generated files it overwrites are
 * FragranceShop's. So pointing `--feed` at another merchant's export files that
 * merchant's rows under FragranceShop's prefixes and over FragranceShop's data
 * — the `original-`/`pm-` collision that cost 91 of 123 ids with no error
 * anywhere, arriving through the convenience flag rather than through a second
 * merchant. A one-line "this feed is advertiser X, I am configured for Y,
 * nothing was written" refusal is the cheapest possible guard on that, and it
 * is checked before a single row is matched.
 *
 * Advertiser identity is read off the `click-<publisherId>-<advertiserId>`
 * segment of `LINK`, never off `PROGRAM_NAME` and never off `CATALOG_NAME`
 * (which names the SUBSCRIPTION). See scripts/lib/cj-feed.mjs.
 *
 * Run:    node scripts/ingest-cj-feed.mjs [--debug <slug>] [--candidates]
 *         node scripts/ingest-cj-feed.mjs --inspect [--feed <path>]
 *           Reports what a delivered export actually contains — columns, rows,
 *           delimiter integrity, advertisers, BRAND spread, PRICE vs SALE_PRICE,
 *           staleness, shared stock photos, house dupe-oil rows, concentration
 *           parsed from the title. WRITES NOTHING.
 *
 *           WHAT IT IS FOR, stated because the per-advertiser work it was
 *           written alongside is gone: it is the ten-minute checklist run on a
 *           NEW feed before anybody plans work on its assumed contents. THREE
 *           CJ FEEDS IN A ROW HAVE UNBLOCKED NOTHING, each for a reason this
 *           report surfaces in one command — Perfumania's "Like product feed"
 *           was the merchant's own house dupe line (BRAND spread: 9 in-house
 *           brands, zero designer), and IRFE's is a single niche house's own
 *           range (BRAND spread: 1). Every line it prints is a lesson that cost
 *           real time, and it reproduces this project's hand-recorded numbers,
 *           so it doubles as a regression test on scripts/feeds/README.md.
 *         --feed <path> overrides the input for one run. The default is
 *           unchanged, so a no-argument run behaves exactly as before.
 * Input:  scripts/feeds/FragranceShop_com_-CJ_Product_Feed-shopping.txt
 *         (gitignored — licensed merchant data, and this repo is public)
 * Output: lib/data/cj-offers.generated.ts   (committed)
 *         --candidates additionally prints EDP rows over $100 that match no
 *         reference we hold, as a shortlist for catalog expansion. It writes
 *         nothing: a new original needs hand-authored notes and facets, which
 *         a feed cannot supply.
 */

import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  norm,
  scoreCandidate,
  otherReferenceTokens,
  parseNominalMl,
  nameTokenVariants,
  BRAND_SYNONYMS,
  NOISE_WORDS,
} from "./lib/product-matching.mjs";
import {
  advertiserCensus,
  parseCjPrice,
  priceFieldReport,
  readCjFeed,
  unwrapMerchantUrl,
} from "./lib/cj-feed.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");

/** The feed this script's merchant configuration below belongs to. A `--feed`
 *  argument overrides it for one run; the advertiser assertion then decides
 *  whether what arrived is something this configuration may ingest. */
const DEFAULT_FEED = resolve(
  root,
  "scripts",
  "feeds",
  "FragranceShop_com_-CJ_Product_Feed-shopping.txt"
);

const feedArgIndex = process.argv.indexOf("--feed");
const FEED =
  feedArgIndex >= 0 && process.argv[feedArgIndex + 1]
    ? resolve(process.cwd(), process.argv[feedArgIndex + 1])
    : DEFAULT_FEED;

const OUT = resolve(root, "lib", "data", "cj-offers.generated.ts");
const OUT_LINKS = resolve(root, "lib", "data", "cj-links.generated.ts");

const MERCHANT = {
  name: "FragranceShop.com",
  network: "cj",
  /** CJ advertiser id, from the click URLs in the feed. */
  advertiserId: "16941446",
  /** Our CJ publisher (CID) id, likewise from the click URLs. */
  publisherId: "101873278",
  /** A US discount retailer of GENUINE designer fragrances, trading since
   *  1998. NOT thefragranceshop.com or thefragranceshop.co.uk — two unrelated
   *  companies with near-identical names, one of them a dupe house. Identify a
   *  merchant by the domain in its CJ advertiser record, never a name search. */
  domain: "fragranceshop.com",
  trackingLive: true,
};

/**
 * Images shared across hundreds of unrelated products. Matched on the URL
 * because that is what the feed gives us; each was found by counting repeats
 * (237, 224, 208 and 189 rows respectively on the 2026-07-29 export).
 */
const GENERIC_IMAGE = /(?:\/ics\.png|\/fl\.jpg|perfume_oil(?:_1oz)?-506_1-600x600-1\.jpg)(?:$|\?)/i;

/* ── this merchant's title grammar ────────────────────────────────────────── */

/**
 * CJ titles follow one rigid shape, and parsing it is what keeps flankers out:
 *
 *     <Brand> <Product Name> <Gender tag> - <Format> <Size>
 *     "Creed Viking Cologne for Men - Eau de Parfum Spray 3.3 oz"
 *
 * 5,801 of 5,802 titles end their head segment with a gender tag ("Perfume for
 * Women" 3,127, "Cologne for Men" 2,042, "Perfume for Unisex" 488, and a few
 * bare "for Women"/"for Men").
 *
 * WHY THIS MATTERS MORE THAN IT LOOKS. Because the gender tag contains the
 * word "Cologne", `cologne` sits in the shared NOISE_WORDS — and that silently
 * absorbed it when it was part of a PRODUCT name instead. FragranceShop sells
 * "Creed Viking" ($251.95) and "Creed Viking Cologne" ($202.95) as two separate
 * products, because they ARE two different fragrances; the matcher took the
 * cheaper one and we linked the flanker as the original. Same trap on "Creed
 * Aventus Cologne" and "Eternity Cologne", both flankers of references we hold.
 *
 * Stripping the tag and the format tail first means the leftover rule sees
 * "cologne" as what it is at that point: part of the name, and therefore proof
 * of a different product.
 */
function productNameOf(title) {
  const i = title.lastIndexOf(" - ");
  const head = i < 0 ? title : title.slice(0, i);
  return head
    .replace(/\s*(?:Cologne|Perfume|Fragrance)?\s*for\s+(?:Men|Women|Unisex|Kids|Boys|Girls)\s*$/i, "")
    .trim();
}

/**
 * Noise for a title whose boilerplate has ALREADY been stripped.
 *
 * Once the gender tag and the "- <Format> <Size>" tail are gone, a remaining
 * "cologne", "perfume", "parfum", "eau", "toilette" or "spray" can only be part
 * of the product's real name, so absorbing them would re-open exactly the hole
 * described above. Sizes and units likewise live in the tail.
 */
/** Rows that are not the boxed retail bottle a buyer expects when they click
 *  "buy the original". Matched on the FULL title, because these words live in
 *  the format tail that productNameOf() removes. */
const NOT_RETAIL_BOTTLE =
  /\btester\b|\bunboxed\b|\bgift set\b|\bsample\b|\bvial\b|\bminiature\b|\brefill\b|\btype perfume oil\b/i;

const PRODUCT_NAME_NOISE = new Set(
  [...NOISE_WORDS].filter(
    (w) =>
      ![
        "cologne", "perfume", "parfum", "eau", "toilette", "spray",
        "fragrance", "scent", "ml", "oz", "bottle", "size", "millesime",
      ].includes(w)
  )
);

/* ── feed reading ─────────────────────────────────────────────────────────── */

/** Reading the export, parsing "8.95 USD" and unwrapping CJ's `url=` parameter
 *  all moved to scripts/lib/cj-feed.mjs unchanged — they are facts about the
 *  CJ Shopping format rather than about this merchant, and a second CJ
 *  subscription must not arrive with a second copy of them. */

/** The feed's only HTML entity is `&amp;` (checked across all 5,802 rows). */
const decode = (s) => (s ?? "").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();

/* ── our catalog ──────────────────────────────────────────────────────────── */

function readReferences() {
  const dir = resolve(root, "lib", "data", "houses");
  const refs = [];

  for (const file of readdirSync(dir).filter((f) => f.endsWith(".ts"))) {
    const src = readFileSync(join(dir, file), "utf8");
    for (const m of src.matchAll(/slug:\s*"([^"]+)"/g)) {
      const tail = src.slice(m.index, m.index + 700);
      const pick = (re) => tail.match(re)?.[1];
      const name = pick(/name:\s*"([^"]+)"/);
      const brand = pick(/brand:\s*"([^"]+)"/);
      if (!name || !brand) continue;
      const ml = pick(/bottleMl:\s*(\d+)/);
      const concentration = pick(/concentration:\s*"([^"]+)"/) ?? "";
      /* THE 700-CHARACTER WINDOW ABOVE IS A TRAP, so say so out loud rather
       * than returning a half-parsed reference. A long comment inside an
       * entry pushes its later fields out of range and they come back
       * EMPTY - which is worse than not parsing the reference at all,
       * because an empty concentration makes every candidate row score
       * equally and the cheapest variant wins. That shipped a Mugler Alien
       * EDP page pointing at the EDT on 2026-09-20, found only by reading
       * the generated offer. This file already refuses to write an empty
       * map for the same reason; a PARTIAL parse deserves the same
       * suspicion. */
      if (!concentration || !ml) {
        console.warn(
          `  ingest-cj-feed: "${m[1]}" parsed without ` +
            `${!concentration ? "a concentration" : ""}` +
            `${!concentration && !ml ? " or " : ""}${!ml ? "a bottleMl" : ""}` +
            ` - its fields are probably past the 700-char window. Shorten the` +
            ` comments inside that entry.`
        );
      }
      refs.push({
        slug: m[1],
        name,
        brand,
        concentration,
        bottleMl: ml ? Number.parseInt(ml, 10) : null,
        priceUsd: Number.parseFloat(pick(/priceUsd:\s*([\d.]+)/) ?? "") || null,
        file,
      });
    }
  }

  if (refs.length === 0) {
    throw new Error(
      "ingest-cj-feed: parsed zero references out of lib/data/houses/. The shape " +
        "of those files changed — fix this parser rather than writing an empty map."
    );
  }

  const bySlug = new Map();
  const duplicates = [];
  for (const ref of refs) {
    const prior = bySlug.get(ref.slug);
    if (prior) duplicates.push(`  "${ref.slug}" in both ${prior.file} and ${ref.file}`);
    else bySlug.set(ref.slug, ref);
  }
  if (duplicates.length) {
    throw new Error(
      `ingest-cj-feed: duplicate reference slugs — each fragrance belongs to exactly one house file:\n${duplicates.join("\n")}`
    );
  }
  return refs;
}

/* ── the shop scope: which products get a buy link at all ─────────────────── */

const SHOP_MIN_USD = 100;
const SHOP_SCOPE_LABEL = `EDP or Parfum, over $${SHOP_MIN_USD}`;

/**
 * The concentration, read from the FORMAT SEGMENT — everything after the last
 * " - " in the title.
 *
 * THIS MERCHANT USES "Cologne for Men" AS A GENDER TAG, NOT A CONCENTRATION.
 * "Creed Viking Cologne for Men - Eau de Parfum Spray 3.3 oz" is an EDP, and
 * reading the whole title would file it as a cologne. That single mistake
 * would misclassify hundreds of rows and silently drop most of the scope the
 * founder actually asked for.
 */
function concentrationOf(title) {
  const i = title.lastIndexOf(" - ");
  const f = (i < 0 ? "" : title.slice(i + 3)).toLowerCase();
  if (!f) return "unstated";
  if (/type perfume oil/.test(f)) return "type-oil";
  if (/eau de parfum|\bedp\b/.test(f)) return "EDP";
  if (/eau de toilette|\bedt\b/.test(f)) return "EDT";
  if (/eau de cologne|\bedc\b|^cologne\b/.test(f)) return "EDC";
  if (/eau fraiche/.test(f)) return "Eau Fraiche";
  if (/pure perfume|extrait|parfum/.test(f)) return "Parfum";
  if (/millesime/.test(f)) return "Millesime";
  return "other";
}

/**
 * Does the merchant's stated format agree with the reference's concentration?
 *
 * Judged on the format tail, because productNameOf() has by then removed it
 * from what the matcher sees. Only used to PREFER one variant over another —
 * a disagreement is not a rejection, since a house often sells the same
 * fragrance in several concentrations and the merchant's wording is loose.
 */
function concentrationMatches(refConcentration, title) {
  const ours = norm(refConcentration);
  const theirs = concentrationOf(title);
  if (theirs === "EDP") return ours === "eau de parfum";
  if (theirs === "EDT") return ours === "eau de toilette";
  if (theirs === "EDC") return ours === "eau de cologne";
  if (theirs === "Eau Fraiche") return ours === "eau fraiche";
  if (theirs === "Parfum" || theirs === "Millesime") {
    return ours === "parfum" || ours === "extrait de parfum" || ours === "parfum concentration";
  }
  return false;
}

/**
 * A stable id for a shop product, taken from the merchant's own product path
 * (".../product/creed-viking-for-men/" -> "creed-viking-for-men").
 *
 * Derived from the URL rather than the title because the URL is what the
 * merchant treats as the product's identity: two titles differing only in
 * punctuation share one page, and a title-derived slug would split them.
 */
function shopSlugOf(pageUrl) {
  const m = pageUrl.match(/\/product\/([^/?#]+)/);
  return m ? m[1].toLowerCase() : norm(pageUrl).replace(/\s+/g, "-");
}

/** EDP and Parfum only — never EDT or EDC. Founder's scope, 2026-09-07. */
const SHOP_CONCENTRATIONS = new Set(["EDP", "Parfum", "Millesime"]);

/** Presentations that are not the boxed retail bottle a buyer expects. */
const SHOP_EXCLUDE =
  /\btester\b|\bunboxed\b|\bgift set\b|\bset\b|\bsample\b|\bvial\b|\bminiature\b|\brefill\b|\bdiffuser\b/i;

/**
 * Every product in scope for a buy link, one entry per merchant product page.
 *
 * `referenceSlug` is set when the product belongs to a fragrance already in our
 * catalog — those already have an `original-<slug>` link and a full comparison
 * page, so the shop surface links there rather than duplicating them.
 *
 * Grouped by the merchant's own product URL rather than by a normalised title:
 * one page sells several sizes, and the founder's scope is per PRODUCT.
 */
function shopCandidates(rows, matchedIds) {
  const slugFor = new Map();
  for (const o of offers) slugFor.set(o.deepLink, o.slug);

  const byPage = new Map();
  for (const row of rows) {
    if (row.price == null || row.price <= SHOP_MIN_USD) continue;
    if (!SHOP_CONCENTRATIONS.has(concentrationOf(row.title))) continue;
    if (SHOP_EXCLUDE.test(row.title)) continue;
    const page = (row.merchantUrl ?? row.link).split("?")[0];
    const prior = byPage.get(page);
    // Cheapest variant on the page is the one we quote and link.
    if (!prior || row.price < prior.price) {
      byPage.set(page, { ...row, page, slug: shopSlugOf(page), referenceSlug: null });
    }
  }

  // A page belongs to a reference if ANY of its rows matched one.
  const pageOfMatched = new Map();
  for (const row of rows) {
    if (!matchedIds.has(row.id)) continue;
    const page = (row.merchantUrl ?? row.link).split("?")[0];
    const slug = slugFor.get(row.link);
    if (slug) pageOfMatched.set(page, slug);
  }
  // Fall back to matching by page across every winning row, since the offer we
  // stored kept only one variant's link.
  for (const o of offers) {
    const page = (o.productUrl ?? "").split("?")[0];
    if (page) pageOfMatched.set(page, o.slug);
  }

  for (const [page, entry] of byPage) {
    entry.referenceSlug = pageOfMatched.get(page) ?? null;
  }
  return [...byPage.values()];
}

/* ── run ──────────────────────────────────────────────────────────────────── */

const DEBUG_SLUG = process.argv.includes("--debug")
  ? process.argv[process.argv.indexOf("--debug") + 1]
  : null;
const WANT_CANDIDATES = process.argv.includes("--candidates");
const WANT_INSPECT = process.argv.includes("--inspect");

const { rows, ragged, columns, header } = readCjFeed(FEED, { caller: "ingest-cj-feed" });

/* ── who sent this, and may we ingest it? ─────────────────────────────────── */

/**
 * Who sent the rows that just got read, and how many each sent.
 *
 * A census, not a split — nothing downstream ingests per advertiser, and the
 * per-advertiser row buckets that used to exist for that were removed on
 * 2026-10-05 with the multi-advertiser plan they served. What this is for is
 * the refusal immediately below and the `--inspect` triage: both need to NAME
 * what arrived, which is a reporting job, not a routing one.
 */
const advertisers = advertiserCensus(rows);

function describeAdvertisers() {
  return [...advertisers]
    .sort((a, b) => b[1].rowCount - a[1].rowCount)
    .map(
      ([id, { identity }]) =>
        `  ${String(id).padEnd(10)} ${String(advertisers.get(id).rowCount).padStart(6)} rows  ` +
        `${(identity.programName || "(no PROGRAM_NAME)").padEnd(28)} ${identity.programUrl || ""}`
    )
    .join("\n");
}

if (!WANT_INSPECT) {
  /**
   * THE ONE MERCHANT ASSERTION.
   *
   * This is the guard on `--feed`, not a bet that a subscription might one day
   * carry two advertisers (three deliveries say it does not). The flag lets any
   * export reach a configuration that hardcodes ONE merchant's link namespace
   * and overwrites ONE merchant's generated files, so handing it a stranger's
   * feed emits that stranger's rows as `original-<slug>`/`shop-<slug>` and over
   * FragranceShop's own data. That is the `original-`/`pm-` prefix collision —
   * 91 of 123 ids lost, no error anywhere — reached through a convenience
   * argument. Checked before a single row is matched.
   */
  const unexpected = [...advertisers.keys()].filter((id) => id !== MERCHANT.advertiserId);
  if (unexpected.length > 0) {
    throw new Error(
      `ingest-cj-feed: this feed carries ${advertisers.size} advertiser(s), and ` +
        `${unexpected.length} of them\nis not the one this script is configured for ` +
        `(${MERCHANT.name}, CJ ${MERCHANT.advertiserId}).\n\n` +
        `${describeAdvertisers()}\n\n` +
        "Nothing was written. This is a decision, not a parse failure:\n" +
        "  - Every id this script emits is hardcoded to one advertiser's namespace\n" +
        "    (`original-<slug>`, `shop-<slug>`) and it overwrites that advertiser's\n" +
        "    generated files. A different advertiser needs its OWN prefix and its OWN\n" +
        "    generated file, registered in scripts/lib/affiliate-link-sources.mjs,\n" +
        "    which is where prefix ownership lives and where `prebuild` enforces it.\n" +
        "  - Its merchant facts (is it a genuine-originals retailer or a house dupe\n" +
        "    line? is its price in PRICE or SALE_PRICE? does its title grammar put a\n" +
        "    format word inside a product name — or no format tail at all, as IRFE's\n" +
        "    does not?) are per-merchant and have each produced wrong published data\n" +
        "    here before.\n\n" +
        "Run `--inspect` on this feed first. Then give the advertiser its own ingest\n" +
        "configuration and its own prefix; do not widen this one to cover two."
    );
  }
}

/* ── --inspect: what did they actually send us? writes nothing ────────────── */

if (WANT_INSPECT) {
  /**
   * The ten-minute triage every delivered feed needs before anyone plans work
   * against its assumed contents. Every item here is a lesson that cost real
   * time in this project; scripts/feeds/README.md carries the long form.
   */
  console.log(`feed:    ${FEED}`);
  console.log(`rows:    ${rows.length}${ragged.length ? `  (${ragged.length} ragged, skipped)` : ""}`);
  console.log(`columns: ${columns}  — CJ's own format sample said 66 and the real exports carry 87;`);
  console.log(`         the delivered header is the only evidence. First four: ${header.slice(0, 4).join(", ")}`);

  /* DELIMITER INTEGRITY, measured rather than remembered. The FragranceShop
   * export had zero double-quotes anywhere, that was written down, and it got
   * generalised to "CJ feeds are tab-separated with no quoting" — which IRFE's
   * export falsified with four CSV-quoted DESCRIPTION fields. What makes
   * split("\t") safe is not the absence of quotes but the absence of TABS
   * inside them, and that shows up as a ragged row. So both are printed: the
   * quote count as a per-feed fact nobody should carry forward, the ragged
   * count as the invariant that actually decides the parser. */
  const rawLines = readFileSync(FEED, "utf8")
    .split(/\r?\n/)
    .filter((l) => l.trim() !== "")
    .slice(1);
  const quoted = rawLines.filter((l) => l.includes('"')).length;
  console.log(`\ndelimiter: TAB. ${quoted} of ${rawLines.length} data row(s) contain a double quote,`);
  console.log(`  ${ragged.length} row(s) ragged (a field count other than the header's).`);
  console.log(`  A quote is harmless; a TAB inside a quoted field is not, and it would show up`);
  console.log(`  as a ragged row. Ragged 0 is what licenses split("\\t") — not a quote count.`);
  console.log(`  (FragranceShop: 0 quotes. IRFE: 4, each opening DESCRIPTION. Both split fine.)`);

  console.log(`\nadvertisers (${advertisers.size}) — keyed on click-<publisherId>-<advertiserId> in LINK,`);
  console.log(`  never on the click HOSTNAME, which CJ rotates across five domains:`);
  console.log(describeAdvertisers());
  /* Our own CID should be the only one here. A SECOND publisher id would mean
   * someone else's tracking links are in our feed, which is worth seeing. */
  const pubs = new Set(
    [...advertisers.values()].map((g) => g.identity.publisherId).filter(Boolean)
  );
  console.log(`  publisher id(s) in the links: ${[...pubs].join(", ") || "(none parsed)"}`);
  const unknown = advertisers.get("unknown");
  if (unknown) {
    console.log(
      `  ${unknown.rowCount} row(s) carry no parseable click-<PID>-<AID> — counted as` +
        ` "unknown" and\n  reported rather than dropped: an unattributable row is a fact` +
        ` about the delivery.`
    );
  }
  const catalogs = new Set(rows.map((r) => (r.CATALOG_NAME ?? "").trim()));
  console.log(`  CATALOG_NAME (the SUBSCRIPTION, not the advertiser): ${[...catalogs].join(" | ")}`);

  const price = priceFieldReport(rows);
  console.log(`\nprice columns — the ingest reads PRICE; on the Perfumania export PRICE was`);
  console.log(`  0.00 or empty on 53 of 66 rows and the real figure was in SALE_PRICE:`);
  console.log(`  PRICE usable (>0):      ${price.priceUsable} of ${price.rows}`);
  console.log(`  SALE_PRICE usable (>0): ${price.salePriceUsable} of ${price.rows}`);
  console.log(`  neither usable:         ${price.neither}`);
  console.log(`  both set and differing: ${price.disagree}  (a promotion, not a correction — decide, do not default)`);

  const updated = rows.map((r) => (r.LAST_UPDATED ?? "").slice(0, 10)).filter(Boolean).sort();
  console.log(`\nLAST_UPDATED: ${updated[0] ?? "(absent)"} .. ${updated[updated.length - 1] ?? "(absent)"}`);
  console.log(`  FragranceShop's arrived six weeks stale. Only the ids are durable.`);

  const brands = new Map();
  for (const r of rows) {
    const b = decode(r.BRAND) || "(empty)";
    brands.set(b, (brands.get(b) ?? 0) + 1);
  }
  const brandList = [...brands].sort((a, b) => b[1] - a[1]);
  console.log(`\nBRAND: ${brands.size} distinct. READ THIS BEFORE PLANNING ANY CATALOGUE WORK —`);
  console.log(`  Perfumania was queued as our second originals merchant and its feed turned`);
  console.log(`  out to be its own house dupe line with zero designer stock.`);
  for (const [b, n] of brandList.slice(0, 25)) console.log(`  ${String(n).padStart(5)}  ${b}`);
  if (brandList.length > 25) console.log(`  ... and ${brandList.length - 25} more brands`);

  const imageCounts = new Map();
  for (const r of rows) {
    const u = (r.IMAGE_LINK ?? "").trim();
    if (u) imageCounts.set(u, (imageCounts.get(u) ?? 0) + 1);
  }
  const shared = [...imageCounts].filter(([, n]) => n > 1).sort((a, b) => b[1] - a[1]);
  const sharedRows = shared.reduce((a, [, n]) => a + n, 0);
  const noImage = rows.filter((r) => !(r.IMAGE_LINK ?? "").trim()).length;
  console.log(`\nimages: ${imageCounts.size} distinct URL(s), ${noImage} row(s) with none.`);
  console.log(`  SHARED stock photographs: ${shared.length} URL(s) covering ${sharedRows} rows`);
  console.log(`  (858 FragranceShop rows shared four images across Dior, Armani, Gucci and`);
  console.log(`  Burberry. Attaching one to a named fragrance shows a bottle that is not the`);
  console.log(`  product — null means "no image", never "use a placeholder".)`);
  for (const [u, n] of shared.slice(0, 6)) console.log(`  ${String(n).padStart(5)}  ${u.slice(0, 110)}`);

  const typeOil = rows.filter((r) => /type perfume oil/i.test(r.TITLE ?? "")).length;
  const notRetail = rows.filter((r) => NOT_RETAIL_BOTTLE.test(r.TITLE ?? "")).length;
  const inspired = rows.filter((r) =>
    /inspired by|impression of|reminiscent of|\bdupe\b|\bclone\b/i.test(
      `${r.TITLE ?? ""} ${r.DESCRIPTION ?? ""}`
    )
  ).length;
  const descIsTitle = rows.filter(
    (r) => decode(r.DESCRIPTION) !== "" && decode(r.DESCRIPTION) === decode(r.TITLE)
  ).length;
  console.log(`\nrow kinds:`);
  console.log(`  "type perfume oil" (the dupe trade's own word):    ${typeOil}`);
  console.log(`  tester/unboxed/set/sample/vial (not retail bottles): ${notRetail}`);
  console.log(`  citing an inspiration in TITLE or DESCRIPTION:       ${inspired}`);
  console.log(`    (CHECK EVERY HIT BY HAND — all five on the Perfumania feed were false`);
  console.log(`     positives like "Inspired by the romance of Rome".)`);
  console.log(`  DESCRIPTION byte-identical to TITLE:                 ${descIsTitle} of ${rows.length}`);
  console.log(`    (5,802 of 5,802 on FragranceShop, which is why that feed supplied no notes.)`);

  const concentrations = new Map();
  for (const r of rows) {
    const c = concentrationOf(decode(r.TITLE));
    concentrations.set(c, (concentrations.get(c) ?? 0) + 1);
  }
  console.log(`\nconcentration parsed from the format tail (founder's buy-link scope is EDP or Parfum, over $100):`);
  for (const [c, n] of [...concentrations].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${String(n).padStart(6)}  ${c}`);
  }

  console.log(`\nNOTHING WAS WRITTEN. --inspect reports; it does not ingest.`);
  process.exit(0);
}

const references = readReferences();

/** Pre-compute the per-row facts every reference will test against. */
const feed = rows.map((r) => {
  const title = decode(r.TITLE);
  const { amount, currency } = parseCjPrice(r.PRICE);
  const image = (r.IMAGE_LINK ?? "").trim();
  return {
    id: r.ID,
    title,
    /** The title with the gender tag and "- <Format> <Size>" tail removed —
     *  what actually names the product. Matching runs on this, never the raw
     *  title; see productNameOf. */
    productName: productNameOf(title),
    brand: decode(r.BRAND),
    link: (r.LINK ?? "").trim(),
    merchantUrl: unwrapMerchantUrl(r.LINK),
    image: image && !GENERIC_IMAGE.test(image) ? image : null,
    imageWasGeneric: Boolean(image) && GENERIC_IMAGE.test(image),
    price: amount,
    currency,
    ml: parseNominalMl(title),
    availability: (r.AVAILABILITY ?? "").trim(),
  };
});

const matchedRowIds = new Set();
const offers = [];
const unmatched = [];

for (const ref of references) {
  const others = otherReferenceTokens(references, ref);
  const scored = [];

  for (const row of feed) {
    // Presentations that are not the boxed retail bottle. This used to fall out
    // of the leftover rule, but productNameOf() strips the tail these words live
    // in, so it has to be an explicit guard now — without it Eternity matched a
    // TESTER row.
    // Silent: this guard runs before any identity check, so logging it would
    // print every tester and sample in the feed against whichever slug is being
    // debugged, burying the rejections that actually explain a missing match.
    if (NOT_RETAIL_BOTTLE.test(row.title)) continue;
    const s = scoreCandidate(ref, row.productName, row.brand, others, {
      noiseWords: PRODUCT_NAME_NOISE,
      // Nothing in a stripped product name is concentration wording.
      concentrationWords: new Set(),
    });
    if (!s) continue;
    if (s.rejected) {
      if (DEBUG_SLUG === ref.slug) console.log(`    reject "${row.title}" — ${s.rejected}`);
      continue;
    }
    // The concentration lives in the format tail we just stripped, so it has
    // to be judged there rather than by scoreCandidate's own token scan.
    const hasConcentration = concentrationMatches(ref.concentration, row.title);
    scored.push({ row, ...s, hasConcentration, score: hasConcentration ? 100 : 50 });
  }

  if (scored.length === 0) {
    unmatched.push(ref);
    continue;
  }

  const best = Math.max(...scored.map((s) => s.score));
  const winners = scored.filter((s) => s.score === best);
  for (const w of winners) matchedRowIds.add(w.row.id);

  /* Pick the variant whose bottle matches ours. This is the whole reason the
   * CJ feed is worth more than the Awin one: `priceUsd` drives the "Nx cheaper
   * per ml" claim, so the price we record has to belong to a known volume. If
   * no variant matches our size we record the price as null rather than guess
   * — a range across unknown sizes is exactly what made the Awin prices
   * unusable. */
  const priced = winners.filter((w) => w.row.price != null);
  const sizeMatch = priced.filter((w) => ref.bottleMl != null && w.row.ml === ref.bottleMl);
  const chosen =
    sizeMatch.sort((a, b) => a.row.price - b.row.price)[0] ??
    priced.sort((a, b) => a.row.price - b.row.price)[0] ??
    winners[0];

  /* An image can come from any winning variant, since variants of one product
   * share a bottle — but only a non-generic one. */
  const withImage = winners.find((w) => w.row.image) ?? null;

  const allPrices = priced.map((w) => w.row.price).sort((a, b) => a - b);

  offers.push({
    slug: ref.slug,
    matchedName: chosen.row.title,
    matchedBrand: chosen.row.brand,
    concentrationMatched: chosen.hasConcentration,
    productUrl: chosen.row.merchantUrl,
    deepLink: chosen.row.link,
    remoteImageUrl: withImage?.row.image ?? null,
    imageSuppressedAsGeneric: !withImage && winners.some((w) => w.row.imageWasGeneric),
    /** The price of the variant whose volume equals our bottleMl, when one
     *  exists — otherwise null, never a guess across unknown sizes. */
    priceUsd: sizeMatch.length > 0 ? chosen.row.price : null,
    /** The volume that price belongs to. Null whenever priceUsd is null. */
    priceMl: sizeMatch.length > 0 ? chosen.row.ml : null,
    /** The full observed spread, for display as an honest "from $X" range. */
    priceFromUsd: allPrices[0] ?? null,
    priceToUsd: allPrices[allPrices.length - 1] ?? null,
    variantCount: winners.length,
    currency: chosen.row.currency ?? "USD",
    /** Our own hand-maintained price, carried through so a drift check can
     *  compare without re-reading the house files. */
    editorialPriceUsd: ref.priceUsd,
    editorialBottleMl: ref.bottleMl,
  });
}

offers.sort((a, b) => a.slug.localeCompare(b.slug));

/* ── report ───────────────────────────────────────────────────────────────── */

const withImage = offers.filter((o) => o.remoteImageUrl).length;
const withRealPrice = offers.filter((o) => o.priceUsd != null).length;
const suppressed = offers.filter((o) => o.imageSuppressedAsGeneric).length;

console.log(`feed:       ${rows.length} rows, ${columns} columns${ragged.length ? `, ${ragged.length} ragged (skipped)` : ""}`);
console.log(`references: ${references.length}`);
console.log(`matched:    ${offers.length}  (unmatched ${unmatched.length})`);
console.log(`  with a usable image:        ${withImage}`);
console.log(`  image suppressed (generic): ${suppressed}`);
console.log(`  with a size-matched price:  ${withRealPrice}`);

/* Where our hand-typed price and the merchant's disagree sharply, say so. The
 * editorial prices are "approximate US retail" and this merchant discounts, so
 * a gap is expected — but a large one changes the "Nx cheaper" arithmetic the
 * whole site rests on, and should be looked at rather than silently ingested. */
const drift = offers
  .filter((o) => o.priceUsd != null && o.editorialPriceUsd)
  .map((o) => ({ ...o, ratio: o.priceUsd / o.editorialPriceUsd }))
  .filter((o) => o.ratio < 0.6 || o.ratio > 1.4)
  .sort((a, b) => a.ratio - b.ratio);

if (drift.length) {
  console.log(`\nprice drift vs our editorial figure (${drift.length} of ${withRealPrice}):`);
  for (const d of drift.slice(0, 20)) {
    console.log(
      `  ${d.slug.padEnd(28)} ours $${String(d.editorialPriceUsd).padEnd(6)} merchant $${String(d.priceUsd).padEnd(7)} @${d.priceMl}ml  (${d.ratio.toFixed(2)}x)`
    );
  }
  if (drift.length > 20) console.log(`  ... and ${drift.length - 20} more`);
}

/* Unmatched references split by cause. A reference whose house this merchant
 * simply does not carry is not a bug and never will be; one whose house IS
 * carried is either genuinely out of stock, or a matcher gap worth seeing.
 * Printing them together made 62 "nothing to do" rows drown out the 42 worth
 * reading. */
if (unmatched.length) {
  const feedBrands = new Set(feed.map((r) => norm(r.brand)).filter(Boolean));
  const brandCarried = (ref) => {
    const ours = norm(ref.brand);
    if (feedBrands.has(ours)) return true;
    for (const fb of feedBrands) {
      const mapped = BRAND_SYNONYMS[fb] ?? fb;
      if (mapped === ours) return true;
      const bt = ours.split(" ");
      const ft = fb.split(" ");
      if (bt.every((t) => ft.includes(t)) || ft.every((t) => bt.includes(t))) return true;
    }
    return false;
  };

  const notCarried = unmatched.filter((r) => !brandCarried(r));
  const carried = unmatched.filter((r) => brandCarried(r));

  const byBrand = (list) => {
    const g = new Map();
    for (const r of list) g.set(r.brand, [...(g.get(r.brand) ?? []), r.slug]);
    return [...g].sort((a, b) => b[1].length - a[1].length);
  };

  console.log(`\nunmatched: ${unmatched.length}`);
  console.log(`\n  ── house not carried by this merchant (${notCarried.length} refs) — nothing to fix:`);
  for (const [brand, slugs] of byBrand(notCarried)) {
    console.log(`     ${String(slugs.length).padStart(2)}  ${brand}`);
  }

  console.log(`\n  ── house IS carried, reference still unmatched (${carried.length} refs):`);
  for (const ref of carried) {
    const variants = nameTokenVariants(ref.name).map((t) => t.filter((x) => x.length > 1));
    const near = feed.filter((row) => {
      const rt = norm(row.title).split(" ");
      return variants.some((v) => v.length > 0 && v.every((t) => rt.includes(t)));
    });
    let why = "not stocked";
    if (near.length > 0) {
      const allOil = near.every((n) => /type perfume oil/i.test(n.title));
      const allTester = near.every((n) => /\btester\b|\bunboxed\b/i.test(n.title));
      why = allOil
        ? `${near.length} row(s), ALL "type" dupe oils — correctly refused`
        : allTester
          ? `${near.length} row(s), all tester/unboxed — correctly refused`
          : `${near.length} row(s) mention it; likely flankers — check with --debug ${ref.slug}`;
    }
    console.log(`     ${ref.slug.padEnd(24)} ${ref.brand.padEnd(18)} ${why}`);
  }
}

/* ── --candidates: EDP over $100 that we do not already list ──────────────── */

if (WANT_CANDIDATES) {
  const candidates = shopCandidates(feed, matchedRowIds).filter((c) => !c.referenceSlug);
  console.log(`\n── catalog candidates: ${SHOP_SCOPE_LABEL}, matching no reference we hold (${candidates.length})`);
  console.log("   Nothing is written from this list. A new original needs hand-authored");
  console.log("   notes, facets and a family — a feed supplies none of those.\n");
  for (const c of candidates.sort((a, b) => b.price - a.price)) {
    console.log(`   $${String(c.price).padEnd(8)} ${String(c.ml ?? "?").padStart(4)}ml  ${c.brand.padEnd(24)} ${c.title.slice(0, 70)}`);
  }
}

/* ── emit ─────────────────────────────────────────────────────────────────── */

const lit = (v) =>
  v === null || v === undefined ? "null" : typeof v === "number" ? String(v) : JSON.stringify(v);

const body = offers
  .map(
    (o) => `  ${JSON.stringify(o.slug)}: {
    slug: ${lit(o.slug)},
    matchedName: ${lit(o.matchedName)},
    matchedBrand: ${lit(o.matchedBrand)},
    concentrationMatched: ${o.concentrationMatched},
    productUrl: ${lit(o.productUrl)},
    deepLink: ${lit(o.deepLink)},
    remoteImageUrl: ${lit(o.remoteImageUrl)},
    imageSuppressedAsGeneric: ${o.imageSuppressedAsGeneric},
    priceUsd: ${lit(o.priceUsd)},
    priceMl: ${lit(o.priceMl)},
    priceFromUsd: ${lit(o.priceFromUsd)},
    priceToUsd: ${lit(o.priceToUsd)},
    variantCount: ${o.variantCount},
    currency: ${lit(o.currency)},
  },`
  )
  .join("\n");

const generated = `/**
 * GENERATED FILE — do not edit by hand.
 * Written by scripts/ingest-cj-feed.mjs from the ${MERCHANT.name} CJ product
 * feed. Re-run that script to refresh; see scripts/feeds/README.md for how the
 * feed gets here and what it does and does not contain.
 *
 * Generated:  ${new Date().toISOString()}
 * Feed rows:  ${rows.length}
 * References: ${references.length}  (matched ${offers.length}, unmatched ${unmatched.length})
 * Images:     ${withImage} usable, ${suppressed} suppressed as a shared stock photo
 * Prices:     ${withRealPrice} tied to a volume equal to our own bottleMl
 *
 * UNLIKE THE AWIN FEED, PRICE HERE HAS A KNOWN VOLUME. \`priceUsd\` is the
 * merchant's price for the variant whose bottle size equals the reference's
 * own \`bottleMl\`, and \`priceMl\` records that size. Where no variant matched
 * our size both are null — deliberately, rather than a figure spanning a
 * sample vial to a large bottle, which is what made the Awin prices unusable
 * for the "Nx cheaper per ml" claim. \`priceFromUsd\`/\`priceToUsd\` remain a
 * display-only range across all variants and must never be divided by a volume.
 *
 * \`remoteImageUrl\` is null when the only images on offer were one of the four
 * shared stock photographs this merchant uses across hundreds of products; see
 * the header of the ingest script. A null here means "no image", never "use a
 * placeholder".
 */

export interface CjOffer {
  /** Reference fragrance slug this offer belongs to. */
  slug: string;
  /** The merchant's own product title, kept so a mismatch is auditable. */
  matchedName: string;
  /** The merchant's own brand string, likewise. */
  matchedBrand: string;
  /** Whether the merchant's title confirmed our concentration. */
  concentrationMatched: boolean;
  /** The merchant's product page, unwrapped from the click URL, for display. */
  productUrl: string | null;
  /** CJ tracked link, as delivered. A sid is appended at redirect-generation
   *  time — see SUB_ID_PARAM in lib/affiliate-links.ts. */
  deepLink: string;
  /** Merchant image URL, or null when only a shared stock photo was on offer.
   *  Downloaded locally by scripts/fetch-cj-images.mjs so no visitor request
   *  ever reaches the merchant's CDN. */
  remoteImageUrl: string | null;
  /** True when an image existed but was rejected as a shared stock photo. */
  imageSuppressedAsGeneric: boolean;
  /** Merchant price for the variant matching our bottleMl, else null. */
  priceUsd: number | null;
  /** The volume priceUsd belongs to. Null whenever priceUsd is null. */
  priceMl: number | null;
  /** Observed spread across all matched variants — display only. */
  priceFromUsd: number | null;
  priceToUsd: number | null;
  variantCount: number;
  currency: string;
}

export const CJ_MERCHANT = ${JSON.stringify(MERCHANT, null, 2).replace(/\n/g, "\n")} as const;

export const CJ_OFFERS: Record<string, CjOffer> = {
${body}
};
`;

writeFileSync(OUT, generated);
console.log(`\nwrote ${OUT} (${offers.length} offers)`);

/* ── emit the shop catalogue ──────────────────────────────────────────────── */

/**
 * Every product in the founder's buy-link scope — EDP or Parfum, over $100.
 *
 * This is NOT the comparison catalogue and must never be confused with it.
 * A ReferenceFragrance carries a note pyramid, six facet scores and an
 * olfactive family, all hand-authored; this feed supplies none of that
 * (DESCRIPTION is byte-identical to TITLE on all 5,802 rows). So these entries
 * carry only what the merchant actually told us — name, brand, price, size,
 * photograph, link — and the surface that renders them claims nothing more.
 *
 * `referenceSlug` is set where the product IS a fragrance we hold. Those keep
 * their existing `original-<slug>` link and their full comparison page; the
 * shop surface points at that page rather than duplicating it.
 */
const shop = shopCandidates(feed, matchedRowIds).sort(
  (a, b) => a.brand.localeCompare(b.brand) || a.productName.localeCompare(b.productName)
);
const shopLinked = shop.filter((s) => s.referenceSlug);
const shopOnly = shop.filter((s) => !s.referenceSlug);

console.log(`\nshop scope (${SHOP_SCOPE_LABEL}): ${shop.length} products`);
console.log(`  already a reference we hold: ${shopLinked.length}`);
console.log(`  shop-only (no comparison page): ${shopOnly.length}`);

const shopBody = shop
  .map(
    (p) => `  {
    slug: ${lit(p.slug)},
    name: ${lit(p.productName)},
    brand: ${lit(p.brand)},
    concentration: ${lit(concentrationOf(p.title))},
    priceUsd: ${lit(p.price)},
    bottleMl: ${lit(p.ml)},
    remoteImageUrl: ${lit(p.image)},
    productUrl: ${lit(p.merchantUrl)},
    referenceSlug: ${lit(p.referenceSlug)},
    affiliateLinkId: ${lit(p.referenceSlug ? `original-${p.referenceSlug}` : `shop-${p.slug}`)},
  },`
  )
  .join("\n");

writeFileSync(
  resolve(root, "lib", "data", "cj-shop.generated.ts"),
  `/**
 * GENERATED FILE — do not edit by hand.
 * Written by scripts/ingest-cj-feed.mjs from the ${MERCHANT.name} CJ feed.
 *
 * Generated: ${new Date().toISOString()}
 * Products:  ${shop.length}  (${shopLinked.length} are references we hold, ${shopOnly.length} shop-only)
 * Scope:     ${SHOP_SCOPE_LABEL}, excluding testers, sets and the merchant's own
 *            "type" dupe oils.
 *
 * THESE ARE NOT REFERENCE FRAGRANCES. There is no note pyramid, no facet
 * profile and no olfactive family here, because the feed contains none —
 * DESCRIPTION is byte-identical to TITLE on all 5,802 rows. Every field below
 * is something the merchant actually stated. Do not add editorial fields to
 * this file: a fragrance that earns a note pyramid earns a place in
 * lib/data/houses/ instead, hand-authored, and then \`referenceSlug\` points at
 * it and the shop surface links to its comparison page.
 */

export interface ShopOriginal {
  /** The merchant's own product-path id, e.g. "creed-viking-for-men". */
  slug: string;
  /** Product name with the merchant's gender tag and format tail removed. */
  name: string;
  brand: string;
  concentration: string;
  priceUsd: number;
  /** Nominal bottle size in ml, or null where the title stated none. */
  bottleMl: number | null;
  /** Null when the only image on offer was one of this merchant's shared stock
   *  photographs. Null means "no image", never "use a placeholder". */
  remoteImageUrl: string | null;
  productUrl: string | null;
  /** Set when this product is a fragrance in our own catalogue. */
  referenceSlug: string | null;
  affiliateLinkId: string;
}

export const SHOP_ORIGINALS: ShopOriginal[] = [
${shopBody}
];
`
);
console.log(`wrote lib/data/cj-shop.generated.ts (${shop.length} products)`);

/* ── emit the affiliate link entries ──────────────────────────────────────── */

/**
 * These are the `original-<slug>` ids every ReferenceFragrance already declares
 * in lib/data/houses/. Until now not one of them resolved, so
 * hasRealAffiliateLink() was false everywhere and the "buy the original"
 * button was suppressed site-wide.
 *
 * Written to their own file rather than into lib/affiliate-links.ts because
 * that file is hand-maintained and these are regenerated on every feed
 * refresh; mixing the two would mean a re-run silently rewriting hand-written
 * entries. lib/affiliate-links.ts spreads this in, and
 * scripts/generate-redirects.mjs reads both.
 */
const linkEntry = (id, deepLink, subId, label) => `  ${JSON.stringify(id)}: {
    network: "cj",
    merchantId: ${lit(MERCHANT.advertiserId)},
    deepLink: ${lit(deepLink)},
    subId: ${lit(subId)},
    label: ${lit(label)},
  },`;

const linkBody = [
  ...offers.map((o) =>
    linkEntry(
      `original-${o.slug}`,
      o.deepLink,
      `original__${o.slug}`,
      `FragranceShop.com — ${o.matchedName}`
    )
  ),
  // Shop-only products: inside the founder's buy-link scope but not fragrances
  // we hold a comparison page for. A separate sub-ID prefix keeps originals-,
  // shop- and dupe-side clicks separable in CJ's own reporting.
  ...shopOnly.map((p) =>
    linkEntry(
      `shop-${p.slug}`,
      p.link,
      `shop__${p.slug}`,
      `FragranceShop.com — ${p.brand} ${p.productName}`
    )
  ),
].join("\n");

const linksGenerated = `/**
 * GENERATED FILE — do not edit by hand.
 * Written by scripts/ingest-cj-feed.mjs. One entry per reference fragrance
 * that ${MERCHANT.name} actually stocks, keyed by the \`original-<slug>\`
 * id the reference already declares in lib/data/houses/.
 *
 * Generated: ${new Date().toISOString()}
 * Entries:   ${offers.length + shopOnly.length}  (${offers.length} original-*, ${shopOnly.length} shop-*)
 *
 * The deep link is CJ's own click URL exactly as delivered in the feed — CJ
 * pre-wraps it, so unlike Awin there is no link to build. affiliateDestination()
 * appends our sub-ID as \`sid\`; see SUB_ID_PARAM in lib/affiliate-links.ts.
 *
 * SUB-ID SHAPE. Dupe listings use \`<listingSlug>__<referenceSlug>\`. An original
 * has no listing, so these read \`original__<referenceSlug>\` — which keeps
 * originals-side clicks separable from dupe-side clicks in CJ's own reporting
 * without needing a second report to tell them apart.
 */

import type { AffiliateLinkEntry } from "@/lib/affiliate-links";

export const CJ_ORIGINAL_LINKS: Record<string, AffiliateLinkEntry> = {
${linkBody}
};
`;

writeFileSync(OUT_LINKS, linksGenerated);
console.log(`wrote ${OUT_LINKS} (${offers.length} original-* + ${shopOnly.length} shop-* link entries)`);
