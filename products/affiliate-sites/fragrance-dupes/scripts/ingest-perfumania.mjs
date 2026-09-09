/**
 * Ingests Perfumania.com (CJ advertiser 17335854) into
 *   lib/data/pm-links.generated.ts   - deep links, keyed by `pm-<slug>`
 *   lib/data/pm-offers.generated.ts  - price, product type, remote image URL
 *
 * WHY THIS READS THE STOREFRONT AND NOT A FEED
 * --------------------------------------------
 * The CJ feed we hold ("Like product feed", 66 rows) is Perfumania's in-house
 * dupe line and carries ZERO designer stock. The storefront carries 4,380
 * products across 480 vendors, so the feed is 1.5% of the shop and none of the
 * part we need. Measurement in scripts/feeds/README.md.
 *
 * Perfumania runs Shopify and three endpoints behave differently. This cost a
 * pass to work out, so do not "simplify" the crawl:
 *
 *   /products.json ................ caps at 250 and SILENTLY IGNORES since_id,
 *                                   so paginating with it returns the same 250
 *                                   rows forever while looking like it works.
 *   /collections/all/products.json  paginates correctly with ?page=N. Use this.
 *                                   18 pages, 4,380 products, matching
 *                                   sitemap_products_*.xml exactly.
 *   /search/suggest.json .......... FUZZY AND UNSTABLE. It returned Armani Code
 *                                   Profumo for a query about YSL Tuxedo, then
 *                                   omitted it from a query for its own name.
 *                                   Never conclude "not stocked" from it.
 *
 * An empty page happens under throttling and does NOT mean the catalogue ended,
 * so the crawl retries before believing one.
 *
 * DEEP LINKS ARE BUILT HERE, NOT DELIVERED
 * ----------------------------------------
 * Unlike the FragranceShop feed where CJ pre-wrapped every link, nothing here
 * arrives wrapped. The click URL is assembled as
 *   https://www.dpbolvw.net/click-101873278-17335854?url=<encoded product URL>
 * Verified 2026-09-09 against a product that is NOT in the CJ feed: the hop
 * lands on the product page carrying AID=17335854, PID=101873278, our SID and a
 * cjevent token, so attribution rides both the URL and the cookie. That the
 * click is STAMPED is proven. That the programme PAYS on deep links is a
 * dashboard question and stays a founder check, exactly as for CJ 16941446.
 *
 * MATCHING IS DELIBERATELY STRICT - READ BEFORE LOOSENING IT
 * ----------------------------------------------------------
 * Format words are stripped only from the END of a title, and what remains must
 * match the reference name EXACTLY. Substring matching, or stripping formats
 * anywhere, silently links flankers: "The Most Wanted Parfum" reduces to "the
 * most wanted" and would be linked as the base Azzaro EDP, which Perfumania
 * does not stock at all. That is the same class of bug that once linked Viking
 * Cologne as Viking and Le Male Le Parfum as Le Male.
 *
 * Run: node scripts/ingest-perfumania.mjs [--refresh]
 */

import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from "node:fs";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");

const MERCHANT = {
  name: "Perfumania.com",
  /** CJ advertiser id, taken from the click URLs in this merchant's own feed.
   *  Identify a merchant by the DOMAIN in its account record, never by a name
   *  search - perfumania.com is the domain on the CJ approval. */
  advertiserId: "17335854",
  publisherId: "101873278",
  domain: "perfumania.com",
};

const CACHE = resolve(root, "scripts", "feeds", "perfumania-storefront.json");
const LINKS_OUT = resolve(root, "lib", "data", "pm-links.generated.ts");
const OFFERS_OUT = resolve(root, "lib", "data", "pm-offers.generated.ts");
const SHOP_OUT = resolve(root, "lib", "data", "pm-shop.generated.ts");
const SHOP_LINKS_OUT = resolve(root, "lib", "data", "pm-shop-links.generated.ts");
const REFRESH = process.argv.includes("--refresh");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ------------------------------------------------------------------ crawl */

async function crawlStorefront() {
  const seen = new Map();
  let page = 1;
  let consecutiveEmpty = 0;

  while (page <= 60) {
    let got = 0;
    for (let attempt = 1; attempt <= 4; attempt++) {
      try {
        const res = await fetch(
          `https://${MERCHANT.domain}/collections/all/products.json?limit=250&page=${page}`,
          { headers: { "user-agent": "Mozilla/5.0 (compatible; counterscent-ingest/1.0)" } }
        );
        if (!res.ok) {
          await sleep(1500 * attempt);
          continue;
        }
        const list = (await res.json())?.products ?? [];
        got = list.length;
        for (const p of list) seen.set(p.id, p);
        if (got > 0) break;
        await sleep(1500 * attempt); // an empty page may be throttling, not the end
      } catch {
        await sleep(1500 * attempt);
      }
    }
    process.stdout.write(
      `  page ${String(page).padStart(2)} -> ${String(got).padStart(3)} (total ${seen.size})\n`
    );
    if (got === 0) {
      if (++consecutiveEmpty >= 2) break;
    } else consecutiveEmpty = 0;
    page += 1;
    await sleep(800);
  }

  if (seen.size < 1000) {
    throw new Error(
      `ingest-perfumania: crawled only ${seen.size} products. The storefront held 4,380 on ` +
        `2026-09-09 - a collapse this large means the endpoint changed, not that stock did. ` +
        `Fix the crawl rather than shipping a truncated catalogue.`
    );
  }
  return [...seen.values()];
}

/* --------------------------------------------------------- our references */

/** Parses lib/data/houses/*.ts, the same way scripts/ingest-cj-feed.mjs does.
 *  These scripts are plain .mjs and the catalogue is TypeScript, so there is no
 *  import path that does not add a build step. */
function loadReferences() {
  const dir = resolve(root, "lib", "data", "houses");
  const refs = [];
  for (const file of readdirSync(dir).filter((f) => f.endsWith(".ts"))) {
    const src = readFileSync(join(dir, file), "utf8");
    for (const m of src.matchAll(/slug:\s*"([^"]+)"/g)) {
      const tail = src.slice(m.index, m.index + 900);
      const pick = (re) => tail.match(re)?.[1];
      const name = pick(/name:\s*"([^"]+)"/);
      const brand = pick(/brand:\s*"([^"]+)"/);
      if (!name || !brand) continue;
      refs.push({
        slug: m[1],
        name,
        brand,
        concentration: pick(/concentration:\s*"([^"]+)"/) ?? "",
        bottleMl: Number(pick(/bottleMl:\s*(\d+)/) ?? 0) || null,
        priceUsd: Number(pick(/priceUsd:\s*([\d.]+)/) ?? 0) || null,
        file,
      });
    }
  }
  if (!refs.length) {
    throw new Error(
      "ingest-perfumania: parsed zero references out of lib/data/houses/. The shape of " +
        "those files changed - fix this parser rather than writing an empty map."
    );
  }
  return refs;
}

/* ---------------------------------------------------------------- matching */

const norm = (s) =>
  String(s ?? "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/** Trailing merchant grammar only. This merchant writes
 *  "<Name> <Gender-ish> <Format>", so "Cologne" and "Perfume" are gender tags
 *  at the END and real name words anywhere else. Stripping them globally is the
 *  Viking/Aventus/Eternity mis-link. */
const TAIL =
  /\b(cologne|perfume|unisex fragrance|fragrance|spray|for (?:men|women|unisex)|men|women|unisex)\s*$/;

function core(title) {
  let x = norm(title);
  let prev;
  do {
    prev = x;
    x = x.replace(TAIL, "").trim();
  } while (x !== prev);
  return x;
}

/** Anything that is not the bottle itself. A gift set's price is not the
 *  fragrance's price and its photograph is of a box. */
const NOT_A_BOTTLE =
  /\b(gift set|\d+\s*(?:pc|piece)|tester|deodorant|body lotion|shower gel|body wash|body cream|rollerball|refill|candle|soap|hair mist|after ?shave|balm|bundle)\b/;

/** Our brand string vs the merchant's vendor string. */
const VENDOR_ALIAS = {
  armani: "giorgio armani",
  "by kilian": "kilian",
  dior: "christian dior",
  "jo malone london": "jo malone",
  mugler: "thierry mugler",
};

/**
 * Names the strict matcher cannot reach, each with the evidence that settles it.
 * Keep this small and keep the evidence - an entry here is a hand-made claim
 * that two names are the same product.
 */
const MANUAL_MATCHES = {
  // Amouage sells Interlude Man and Interlude Woman. Perfumania lists exactly one
  // "Interlude Cologne" and tags it GENDER_Men, which is what identifies it as the
  // Man. Verified in the product JSON 2026-09-09.
  "interlude-man": "interlude-cologne",
};

function buildDeepLink(handle) {
  const dest = `https://${MERCHANT.domain}/products/${handle}`;
  return (
    `https://www.dpbolvw.net/click-${MERCHANT.publisherId}-${MERCHANT.advertiserId}` +
    `?url=${encodeURIComponent(dest)}`
  );
}

/**
 * Perfumania states bottle size in the VARIANT title, as US fluid ounces
 * ("3.4 oz.", "1.7 oz."), never in ml. Converted at 29.5735 ml/oz and rounded
 * to the nearest 5 ml, because the trade rounds too: 3.4 oz is sold as 100 ml,
 * 1.7 oz as 50 ml, 4.2 oz as 125 ml. Rounding to 1 ml would make 100.55 fail to
 * equal our 100 and quietly drop the price.
 */
function variantMl(title) {
  const oz = String(title ?? "").match(/([\d.]+)\s*oz/i);
  if (!oz) return null;
  const ml = Number(oz[1]) * 29.5735;
  return Number.isFinite(ml) ? Math.round(ml / 5) * 5 : null;
}

/**
 * The price for the size OUR reference records, or null - never a guess across
 * sizes. Same rule as scripts/ingest-cj-feed.mjs: a price shown beside a buy
 * button has to be the price of the bottle we are comparing, or the comparison
 * is fiction. Also returns the observed spread, so the UI can say "from $X"
 * honestly where no size matched.
 */
function priceForSize(product, wantMl) {
  const variants = (product.variants ?? [])
    .map((v) => ({ ml: variantMl(v.title), price: Number(v.price) }))
    .filter((v) => Number.isFinite(v.price) && v.price > 0);
  const prices = variants.map((v) => v.price).sort((a, b) => a - b);
  const hit = wantMl ? variants.find((v) => v.ml === wantMl) : null;
  return {
    priceUsd: hit ? hit.price : null,
    priceMl: hit ? hit.ml : null,
    priceFromUsd: prices[0] ?? null,
    priceToUsd: prices[prices.length - 1] ?? null,
    variantCount: variants.length,
  };
}

function concAgrees(product, wantNorm) {
  if (!wantNorm) return false;
  const t = norm(product.product_type);
  return t === wantNorm || t.startsWith(wantNorm) || wantNorm.startsWith(t);
}

/**
 * The storefront tags carry a real three-tier pyramid - `topnote_*`,
 * `middlenote_*`, `basenote_*` - on 1,829 of the 4,380 products. This is the
 * SELLER'S OWN DATA about a product the seller did not make: attributable, not
 * verified. It is captured here so a later pass can use it, and it is
 * deliberately NOT written into any reference's note pyramid by this script.
 * Tag spacing is inconsistent ("topnote_ Sea" vs "topnote_Bergamot"), hence the trim.
 */
function pyramid(product) {
  const tags = Array.isArray(product.tags)
    ? product.tags
    : String(product.tags ?? "").split(",");
  const tier = (prefix) =>
    tags
      .map((t) => String(t).trim())
      .filter((t) => t.toLowerCase().startsWith(prefix))
      .map((t) => t.slice(prefix.length).trim())
      .filter(Boolean);
  const top = tier("topnote_");
  const heart = tier("middlenote_");
  const base = tier("basenote_");
  return top.length && heart.length && base.length ? { top, heart, base } : null;
}

function match(references, catalog) {
  const byVendor = new Map();
  for (const p of catalog) {
    const v = norm(p.vendor);
    if (!byVendor.has(v)) byVendor.set(v, []);
    byVendor.get(v).push(p);
  }
  const byHandle = new Map(catalog.map((p) => [p.handle, p]));

  const matched = [];
  const skipped = { brandAbsent: [], productAbsent: [] };

  for (const ref of references) {
    const manual = MANUAL_MATCHES[ref.slug];
    let pick = manual ? byHandle.get(manual) : null;
    let alternatives = 0;

    if (!pick) {
      const nb = norm(ref.brand);
      const pool = byVendor.get(VENDOR_ALIAS[nb] ?? nb) ?? [];
      if (!pool.length) {
        skipped.brandAbsent.push(ref.slug);
        continue;
      }
      const target = core(ref.name);
      const exact = pool.filter(
        (p) => !NOT_A_BOTTLE.test(norm(p.title)) && core(p.title) === target
      );
      if (!exact.length) {
        skipped.productAbsent.push(ref.slug);
        continue;
      }
      alternatives = exact.length;
      // Prefer the SKU whose concentration agrees with what our catalogue records.
      const wantC = norm(ref.concentration);
      exact.sort((a, b) => Number(concAgrees(b, wantC)) - Number(concAgrees(a, wantC)));
      pick = exact[0];
    }

    const image = pick.images?.[0];
    const pricing = priceForSize(pick, ref.bottleMl);
    matched.push({
      slug: ref.slug,
      brand: ref.brand,
      name: ref.name,
      ourConcentration: ref.concentration,
      ourBottleMl: ref.bottleMl,
      theirTitle: pick.title,
      theirVendor: pick.vendor,
      theirType: pick.product_type ?? "",
      handle: pick.handle,
      ...pricing,
      remoteImageUrl: image?.src ?? null,
      imageWidth: image?.width ?? null,
      imageHeight: image?.height ?? null,
      notes: pyramid(pick),
      concentrationAgrees: concAgrees(pick, norm(ref.concentration)),
      alternatives,
      viaManualMatch: Boolean(manual),
    });
  }
  return { matched, skipped };
}

/* ------------------------------------------------------------- shop scope */

/**
 * The founder's buy-link scope, 2026-09-07, applied unchanged to this merchant:
 * EDP or Parfum only - never EDT or EDC - and over $100.
 *
 * Perfumania states the concentration in `product_type`, so unlike the
 * FragranceShop feed there is no title parsing to get wrong here. That merchant
 * writes "Cologne for Men" as a GENDER tag and its concentration hides in the
 * format tail; this one keeps them in separate fields.
 */
const SHOP_MIN_USD = 100;

/**
 * TWO EXCLUSIONS THIS SURFACE CANNOT SHIP WITHOUT.
 *
 * 1. THE MERCHANT'S OWN HOUSE BRANDS. Perfumania sells a private-label dupe
 *    line beside its genuine stock, exactly as FragranceShop sells "type"
 *    perfume oils beside its own. Listing those on a page headed "genuine
 *    designer fragrances" would be a false claim about a real product. The nine
 *    names below are not a guess: they are every BRAND in Perfumania's own
 *    "Like product feed", which IS their dupe line, so each is proven in-house
 *    by the merchant's own data.
 *
 *    The catalogue holds other names that LOOK private-label - Michael Malul,
 *    Daniel Josier, Camille Rochelle, NOTEZ, Patek Maison, Thauy, 93 Mil - and
 *    they are deliberately NOT listed here, because we cannot prove it and
 *    guessing a real company is a house brand is its own false claim. They are
 *    excluded by the brand rule below instead, which needs no such judgement.
 *
 * 2. "Bundle & Save", the two-bottle sets. A bundle's price is not one
 *    fragrance's price and its photograph is of two boxes.
 */
const HOUSE_BRANDS = new Set([
  "Adrian Costa", "Bon Vivant", "Desiree Celeste", "Dylan Jeffries", "Emotions Elixir",
  "Gia Lucca", "Luka Milano", "Marc Olivetti", "Mi Vida",
]);
const BUNDLE_VENDOR = "Bundle & Save";

/**
 * ONLY HOUSES OUR OWN CATALOGUE ALREADY COVERS.
 *
 * 413 products clear the price and concentration scope; 193 of them come from a
 * house we have already researched. The rest are brands we have never covered,
 * many of them obscure enough that we cannot tell a small real perfumer from a
 * retailer's private label without research we have not done - and this page
 * calls its contents "genuine designer fragrances".
 *
 * So the rule is: we list other bottles from houses we already vouch for. It
 * needs no judgement about any individual brand, it keeps the page connected to
 * the catalogue, and widening it later is a decision with evidence behind it
 * rather than a default nobody chose.
 */
function shopCandidates(catalog, references, matchedBySlug) {
  const ourBrands = new Set(references.map((r) => VENDOR_ALIAS[norm(r.brand)] ?? norm(r.brand)));
  const refByHandle = new Map(matchedBySlug.map((m) => [m.handle, m.slug]));
  const rows = [];

  for (const p of catalog) {
    const vendor = p.vendor ?? "";
    if (HOUSE_BRANDS.has(vendor) || vendor === BUNDLE_VENDOR) continue;
    if (NOT_A_BOTTLE.test(norm(p.title))) continue;
    if (!ourBrands.has(norm(vendor))) continue;

    const type = norm(p.product_type);
    const isEdp = type.includes("eau de parfum");
    const isParfum = type.includes("parfum") && !type.includes("eau de");
    if (!isEdp && !isParfum) continue;

    // Price and bottle size must come from the SAME variant, or the card quotes
    // one bottle's price beside another bottle's size.
    //
    // The scope test is the CHEAPEST variant, not the cheapest one ABOVE $100.
    // Those differ: a bottle sold at $80 and $120 passes the second test and
    // would then be shown at $120, quoting a higher price than the shop's own
    // entry price for the same fragrance. "Over $100" has to mean the product
    // costs over $100, not that one of its sizes does.
    const variants = (p.variants ?? [])
      .map((v) => ({ ml: variantMl(v.title), price: Number(v.price) }))
      .filter((v) => Number.isFinite(v.price) && v.price > 0)
      .sort((a, b) => a.price - b.price);
    if (!variants.length) continue;
    const pick = variants[0];
    if (pick.price <= SHOP_MIN_USD) continue;

    rows.push({
      slug: p.handle,
      name: displayName(p.title),
      brand: vendor,
      concentration: isParfum ? "Parfum" : "EDP",
      priceUsd: pick.price,
      bottleMl: pick.ml,
      remoteImageUrl: p.images?.[0]?.src ?? null,
      productUrl: `https://${MERCHANT.domain}/products/${p.handle}`,
      referenceSlug: refByHandle.get(p.handle) ?? null,
      affiliateLinkId: `pmshop-${p.handle}`,
    });
  }
  rows.sort((a, b) => a.slug.localeCompare(b.slug));
  return rows;
}

/** The title with the merchant's trailing gender/format grammar removed, but
 *  its own casing kept. `core()` lowercases for comparison; this is for display. */
function displayName(title) {
  const target = core(title);
  const words = String(title).trim().split(/\s+/);
  while (words.length > 1 && core(words.join(" ")) !== target) words.pop();
  return words.join(" ") || String(title);
}

/* ----------------------------------------------------------------- output */

const lit = (v) => (v === null || v === undefined ? "null" : JSON.stringify(v));

function writeLinks(matched) {
  const body = matched
    .map(
      (m) => `  "pm-${m.slug}": {
    network: "cj",
    merchantId: ${lit(MERCHANT.advertiserId)},
    deepLink: ${lit(buildDeepLink(m.handle))},
    subId: ${lit(`pm__${m.slug}`)},
    label: ${lit(`${MERCHANT.name} - ${m.theirVendor} ${m.theirTitle}`)},
  },`
    )
    .join("\n");

  writeFileSync(
    LINKS_OUT,
    `/**
 * GENERATED FILE - do not edit by hand.
 * Written by scripts/ingest-perfumania.mjs. One entry per reference fragrance
 * Perfumania.com actually stocks, keyed by the \`original-<slug>\` id the
 * reference already declares in lib/data/houses/.
 *
 * Generated: ${new Date().toISOString()}
 * Entries:   ${matched.length}
 *
 * KEYED \`pm-<slug>\`, NOT \`original-<slug>\`, AND THAT IS LOAD-BEARING.
 * FragranceShop already owns \`original-<slug>\` for 116 references, and 91 of
 * them are fragrances Perfumania also stocks. Sharing the prefix would put two
 * retailers on one key in \`affiliateLinks\`, where the spread order decides
 * which survives - one merchant's links silently replaced by the other's, with
 * nothing to show for it at the edge. Two retailers for one bottle is the point
 * here, so each needs its own id.
 *
 * UNLIKE THE FRAGRANCESHOP LINKS, THESE ARE BUILT, NOT DELIVERED. CJ pre-wraps
 * links inside a feed; this merchant's usable catalogue is not in its feed at
 * all, so the click URL is assembled from the advertiser id and the product
 * URL. The shape was verified against a live hop on 2026-09-09 - see the
 * script header. affiliateDestination() appends our sub-ID as \`sid\`.
 */

import type { AffiliateLinkEntry } from "@/lib/affiliate-links";

export const PM_ORIGINAL_LINKS: Record<string, AffiliateLinkEntry> = {
${body}
};
`,
    "utf8"
  );
}

function writeOffers(matched) {
  const body = matched
    .map(
      (m) => `  "${m.slug}": {
    title: ${lit(m.theirTitle)},
    vendor: ${lit(m.theirVendor)},
    handle: ${lit(m.handle)},
    priceUsd: ${lit(m.priceUsd)},
    priceMl: ${lit(m.priceMl)},
    priceFromUsd: ${lit(m.priceFromUsd)},
    priceToUsd: ${lit(m.priceToUsd)},
    variantCount: ${m.variantCount},
    merchantConcentration: ${lit(m.theirType)},
    concentrationAgrees: ${m.concentrationAgrees},
    remoteImageUrl: ${lit(m.remoteImageUrl)},
    imageWidth: ${lit(m.imageWidth)},
    imageHeight: ${lit(m.imageHeight)},
    declaredNotes: ${m.notes ? JSON.stringify(m.notes) : "null"},
  },`
    )
    .join("\n");

  const disagreeing = matched.filter((m) => !m.concentrationAgrees).length;

  writeFileSync(
    OFFERS_OUT,
    `/**
 * GENERATED FILE - do not edit by hand.
 * Written by scripts/ingest-perfumania.mjs.
 *
 * Generated: ${new Date().toISOString()}
 * Offers:    ${matched.length}   (${disagreeing} where the merchant's concentration
 *            differs from ours - those are FLAGGED, not corrected, because which
 *            of the two is right is a research question, not a parsing one)
 *
 * \`declaredNotes\` is the merchant's own \`topnote_/middlenote_/basenote_\` tags.
 * It is the SELLER'S data about a product the seller did not make - attributable,
 * not verified - and nothing here writes it into a reference's pyramid. A null
 * means the product carried no note tags, never "look one up".
 *
 * \`remoteImageUrl: null\` means "no image", never "use a placeholder".
 */

export interface PerfumaniaOffer {
  title: string;
  vendor: string;
  handle: string;
  /** What THEY charge for the bottle size OUR reference records, or null when
   *  no variant matched it. Never a price guessed across sizes. */
  priceUsd: number | null;
  priceMl: number | null;
  /** The full observed spread, for an honest "from $X" where priceUsd is null. */
  priceFromUsd: number | null;
  priceToUsd: number | null;
  variantCount: number;
  merchantConcentration: string;
  concentrationAgrees: boolean;
  remoteImageUrl: string | null;
  imageWidth: number | null;
  imageHeight: number | null;
  declaredNotes: { top: string[]; heart: string[]; base: string[] } | null;
}

export const PM_MERCHANT = {
  name: ${lit(MERCHANT.name)},
  advertiserId: ${lit(MERCHANT.advertiserId)},
  domain: ${lit(MERCHANT.domain)},
} as const;

export const PM_OFFERS: Record<string, PerfumaniaOffer> = {
${body}
};
`,
    "utf8"
  );
}

function writeShop(rows) {
  const lit2 = (v) => (v === null || v === undefined ? "null" : JSON.stringify(v));
  const withRef = rows.filter((r) => r.referenceSlug).length;
  const body = rows
    .map(
      (r) => `  {
    slug: ${lit2(r.slug)},
    name: ${lit2(r.name)},
    brand: ${lit2(r.brand)},
    concentration: ${lit2(r.concentration)},
    priceUsd: ${r.priceUsd},
    bottleMl: ${lit2(r.bottleMl)},
    remoteImageUrl: ${lit2(r.remoteImageUrl)},
    productUrl: ${lit2(r.productUrl)},
    referenceSlug: ${lit2(r.referenceSlug)},
    affiliateLinkId: ${lit2(r.affiliateLinkId)},
  },`
    )
    .join("\n");

  const links = rows
    .map(
      (r) => `  ${lit2(r.affiliateLinkId)}: {
    network: "cj",
    merchantId: ${lit2(MERCHANT.advertiserId)},
    deepLink: ${lit2(buildDeepLink(r.slug))},
    subId: ${lit2(`pmshop__${r.slug}`)},
    label: ${lit2(`${MERCHANT.name} - ${r.brand} ${r.name}`)},
  },`
    )
    .join("\n");

  writeFileSync(
    SHOP_OUT,
    `/**
 * GENERATED FILE - do not edit by hand.
 * Written by scripts/ingest-perfumania.mjs from the Perfumania.com storefront.
 *
 * Generated: ${new Date().toISOString()}
 * Products:  ${rows.length}  (${withRef} are references we hold, ${rows.length - withRef} shop-only)
 * Scope:     EDP or Parfum, over $100, from a house our own catalogue already
 *            covers, excluding testers, sets, bundles and the merchant's own
 *            private-label brands.
 *
 * THESE ARE NOT REFERENCE FRAGRANCES. There is no note pyramid, facet profile
 * or olfactive family here. The merchant DOES publish note tags, and they are
 * deliberately not used: measured against the 90 fragrances where we hold a
 * researched pyramid AND they publish one, the two agree on only 0.57 of the
 * materials named - before you even ask which tier they sit in. 19 of those 90
 * fall below 0.4 and one shares nothing at all. A fragrance that earns a note
 * pyramid earns a place in lib/data/houses/ instead, hand-authored.
 *
 * \`remoteImageUrl: null\` means "no image", never "use a placeholder".
 */

import type { ShopOriginal } from "@/lib/data/cj-shop.generated";

export const PM_SHOP_ORIGINALS: ShopOriginal[] = [
${body}
];
`,
    "utf8"
  );

  writeFileSync(
    SHOP_LINKS_OUT,
    `/**
 * GENERATED FILE - do not edit by hand.
 * Written by scripts/ingest-perfumania.mjs. One entry per shop product on
 * /originals, keyed \`pmshop-<handle>\`.
 *
 * Generated: ${new Date().toISOString()}
 * Entries:   ${rows.length}
 *
 * Keyed apart from both \`original-\` (FragranceShop) and \`pm-\` (Perfumania's
 * reference-matched links) so no merchant's links can overwrite another's in
 * the flat \`affiliateLinks\` map. scripts/generate-redirects.mjs must read this
 * file too, or these resolve in the UI and 404 at the edge.
 */

import type { AffiliateLinkEntry } from "@/lib/affiliate-links";

export const PM_SHOP_LINKS: Record<string, AffiliateLinkEntry> = {
${links}
};
`,
    "utf8"
  );
}

/* ------------------------------------------------------------------- main */

let catalog;
if (!REFRESH && existsSync(CACHE)) {
  catalog = JSON.parse(readFileSync(CACHE, "utf8"));
  console.log(`Using cached storefront: ${catalog.length} products (--refresh to re-crawl)`);
} else {
  console.log(`Crawling ${MERCHANT.domain} ...`);
  catalog = await crawlStorefront();
  mkdirSync(dirname(CACHE), { recursive: true });
  writeFileSync(CACHE, JSON.stringify(catalog), "utf8");
  console.log(`Cached ${catalog.length} products -> scripts/feeds/perfumania-storefront.json`);
}

const references = loadReferences();
const { matched, skipped } = match(references, catalog);

writeLinks(matched);
writeOffers(matched);

const shop = shopCandidates(catalog, references, matched);
writeShop(shop);

const sized = matched.filter((m) => m.priceUsd != null).length;
const noImage = matched.filter((m) => !m.remoteImageUrl).length;
const withNotes = matched.filter((m) => m.notes).length;
const disagree = matched.filter((m) => !m.concentrationAgrees);

console.log(`
references              ${references.length}
matched                 ${matched.length}
  priced at OUR size    ${sized}   (the rest carry a from/to spread only)
  with a photograph     ${matched.length - noImage}
  with note tags        ${withNotes}
  concentration differs ${disagree.length}  ${disagree.map((d) => d.slug).join(", ")}
brand stocked, no SKU   ${skipped.productAbsent.length}
brand not carried       ${skipped.brandAbsent.length}

shop surface           ${shop.length}   (${shop.filter((r) => r.referenceSlug).length} link to a comparison page)

wrote lib/data/pm-links.generated.ts
wrote lib/data/pm-offers.generated.ts
wrote lib/data/pm-shop.generated.ts
wrote lib/data/pm-shop-links.generated.ts`);
