/**
 * Ingests an Awin product feed into lib/data/merchant-offers.generated.ts.
 *
 * THE FIRST NON-HAND-WRITTEN DATA SOURCE IN THIS PROJECT
 * -----------------------------------------------------
 * Every other data file here is hand-authored TypeScript, deliberately, because
 * the alternative was inventing product data at scale (see lib/dupes-data.ts).
 * This script is the honest version of catalog growth: it only ever writes what
 * a real merchant feed actually contains, and it writes it to a SEPARATE
 * generated file that is merged over the editorial data at read time. The
 * hand-authored house files stay hand-authored — notes, facets and families are
 * editorial judgements a feed cannot supply.
 *
 * Run: node scripts/ingest-feed.mjs
 * Input: scripts/feeds/my-perfume-shop.csv   (gitignored — see that dir's README)
 * Output: lib/data/merchant-offers.generated.ts  (committed)
 *
 * WHAT THIS FEED CAN AND CANNOT SUPPLY — verified against the file, 2026-09-01
 * ---------------------------------------------------------------------------
 * CAN:  a real product image per product page (6,338 distinct images), a real
 *       tracked deep link, the merchant's own product URL, and a price RANGE.
 *
 * CANNOT: **bottle size**. There is no size/volume column, and the merchant
 *       sells several variants per product at very different prices — "Bleu de
 *       CHANEL EDP" appears 6 times at $15, $189, $199, $229, $229 and $259,
 *       which are plainly a sample vial through to a large bottle. Nothing in
 *       the export says which is which.
 *
 *       This is why `priceUsd` on ReferenceFragrance is NOT touched by this
 *       script. That field feeds the "Nx cheaper per ml" claim shown to buyers,
 *       which needs price AND volume; a price with an unknown volume behind it
 *       would make that claim wrong in a way no disclaimer covers. We record
 *       priceFromUsd/priceToUsd for display as an honest range instead.
 *
 *       To fix properly, re-export the feed from Awin including a size /
 *       dimensions / custom field that carries ml. Then this script can pick
 *       the variant matching each reference's `bottleMl` and priceUsd becomes
 *       real. Until then the hand-maintained prices stand, with their existing
 *       "approximate US retail" caveat in lib/data/references.ts.
 *
 * ALSO NOTE: `description` is the merchant's own marketing copy. It is
 * deliberately NOT ingested — republishing it would be duplicate content we
 * did not write, on a site whose whole pitch is independent analysis.
 */

import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const FEED = resolve(root, "scripts", "feeds", "my-perfume-shop.csv");
const OUT = resolve(root, "lib", "data", "merchant-offers.generated.ts");

const MERCHANT = {
  name: "My Perfume Shop",
  network: "awin",
  merchantId: "106089",
  publisherId: "3064149",
  /** Awin's own status indicator for this programme was RED on 2026-09-01,
   *  meaning conversions may not track yet. lib/affiliate-links.ts gates the
   *  buy buttons on this; flip it when Awin shows the programme green. */
  trackingLive: false,
};

/* ── a small CSV reader; no new dependency for one build-time script ──────── */

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];

    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          quoted = false;
        }
      } else {
        field += c;
      }
      continue;
    }

    if (c === '"') quoted = true;
    else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (c !== "\r") {
      field += c;
    }
  }
  if (field !== "" || row.length) {
    row.push(field);
    rows.push(row);
  }

  const header = rows.shift();
  return rows
    .filter((r) => r.length === header.length)
    .map((r) => Object.fromEntries(header.map((h, i) => [h, r[i]])));
}

/* ── read the editorial catalog out of the hand-authored house files ──────── */

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
      refs.push({
        slug: m[1],
        name,
        brand,
        concentration: pick(/concentration:\s*"([^"]+)"/) ?? "",
        file,
      });
    }
  }

  if (refs.length === 0) {
    throw new Error(
      "ingest-feed: parsed zero references out of lib/data/houses/. The shape of " +
        "those files changed — fix this parser rather than writing an empty offer map."
    );
  }

  // lib/data/references.ts guards duplicate slugs at module load, but that
  // throws at render time; this file keys an object literal by slug, so a
  // duplicate silently becomes a TS1117 "multiple properties with the same
  // name" pointing at generated code, which reads like a generator bug rather
  // than what it is — two house files claiming the same fragrance. Caught for
  // real on 2026-09-01 when the 111 -> 200 expansion re-added four fragrances
  // that already lived in other.ts. Fail here, where the message can say so.
  const bySlug = new Map();
  const duplicates = [];
  for (const ref of refs) {
    const prior = bySlug.get(ref.slug);
    if (prior) duplicates.push(`  "${ref.slug}" in both ${prior.file} and ${ref.file}`);
    else bySlug.set(ref.slug, ref);
  }
  if (duplicates.length) {
    throw new Error(
      `ingest-feed: duplicate reference slugs — each fragrance belongs to exactly one house file:\n${duplicates.join("\n")}`
    );
  }

  return refs;
}

/* ── matching ─────────────────────────────────────────────────────────────── */

/**
 * Fold to comparable words.
 *
 * The diacritic strip is load-bearing, not cosmetic: the merchant writes
 * "HERMÈS" and we write "Hermes". Without folding, dropping non-ASCII turns
 * that into "herm s" — two tokens, neither of which is "hermes" — and every
 * Hermès, Chloé and Privé reference silently fails to match.
 */
const norm = (s) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

/** Our long-form concentration -> the short forms the merchant puts in a name. */
const CONCENTRATION_ALIASES = {
  "eau de parfum": ["edp", "eau de parfum"],
  "eau de toilette": ["edt", "eau de toilette"],
  "eau de cologne": ["edc", "eau de cologne", "cologne"],
  "eau fraiche": ["eau fraiche"],
  parfum: ["parfum", "extrait"],
  "extrait de parfum": ["extrait", "parfum"],
  "parfum concentration": ["parfum", "extrait"],
};

/** Words carrying no product identity: gendering, articles, and packaging
 *  wording a merchant adds freely. Safe to ignore when deciding whether two
 *  names denote the same fragrance. */
const NOISE_WORDS = new Set([
  "for", "men", "mens", "man", "women", "womens", "woman", "unisex",
  "pour", "homme", "femme", "him", "her", "his", "hers",
  "the", "and", "with", "new", "by", "de", "du", "des", "la", "le", "les", "el",
  "spray", "perfume", "fragrance", "scent", "cologne", "eau", "toilette", "parfum",
  "ml", "oz", "bottle", "size", "authentic", "original", "genuine",
  // Line/collection wording that names a range rather than a fragrance:
  // "Maison Margiela 'Replica' Jazz Club" is Jazz Club.
  "replica", "collection", "edition", "limited", "refillable",
]);

/**
 * Extra words a merchant may put in a brand that our catalog spells shorter.
 * We say "Armani"; the merchant says "Giorgio Armani". The brand check has
 * already passed by the time these are used, so treating them as accounted is
 * safe — they identify the same house, not a different product.
 *
 * Keyed by our own brand string, normalised.
 */
const BRAND_EXTRA_WORDS = {
  armani: ["giorgio", "emporio"],
  "by kilian": ["kilian"],
  mugler: ["thierry"],
  dior: ["christian"],
  "yves saint laurent": ["ysl"],
  "maison francis kurkdjian": ["mfk"],
  "maison margiela": ["margiela", "maison"],
  "jo malone london": ["jo", "malone", "london"],
  hermes: ["hermes"],
  chloe: ["chloe"],
  montblanc: ["mont", "blanc"],
  "parfums de marly": ["parfums", "marly"],
  "louis vuitton": ["louis", "vuitton"],
  "narciso rodriguez": ["narciso", "rodriguez"],
  "carolina herrera": ["carolina", "herrera"],
  "viktor&rolf": ["viktor", "rolf"],
  "ralph lauren": ["ralph", "lauren"],
  "paco rabanne": ["paco", "rabanne"],
  "tom ford": ["tom", "ford"],
  "le labo": ["le", "labo"],
};

/**
 * Every fragrance name our catalog holds, so a candidate can be rejected for
 * being a DIFFERENT reference we also list. Filled in below, before matching.
 */
let OTHER_REFERENCE_TOKENS = new Set();

/**
 * Decide whether a feed row denotes the same fragrance as one of our
 * references — strictly.
 *
 * The rule that matters: after accounting for the brand, our fragrance name,
 * the concentration, and pure noise words, **anything left over means it is a
 * different product.** "Mugler Angel Stars EDP" leaves "stars"; "Sauvage
 * Elixir" leaves "elixir"; "Baccarat Rouge 540 Hair Mist" leaves "hair mist".
 * Each of those is a real, separately-sold fragrance or an ancillary product,
 * and pointing a buyer at one while calling it the other is exactly the class
 * of error this project has already had to undo once.
 *
 * Scoring alone was tried first and was not safe enough: a flanker with a
 * short name beat the real thing whenever the real listing happened to carry
 * "For Women". Rejection on leftover words does not have that failure mode.
 */
function scoreCandidate(ref, row) {
  const rowName = norm(row.product_name);
  const rowTokens = rowName.split(" ").filter(Boolean);
  const brandTokens = norm(ref.brand).split(" ").filter((t) => t.length > 1);
  const nameTokens = norm(ref.name)
    .split(" ")
    .filter((t) => t.length > 1 && !brandTokens.includes(t));

  // Brand and every distinctive word of our name must be present.
  if (brandTokens.length && !brandTokens.every((t) => rowTokens.includes(t))) return null;
  if (nameTokens.length && !nameTokens.every((t) => rowTokens.includes(t))) return null;

  const aliases = CONCENTRATION_ALIASES[norm(ref.concentration)] ?? [];
  const concentrationWords = new Set(
    Object.values(CONCENTRATION_ALIASES).flat().flatMap((a) => a.split(" "))
  );

  const accounted = new Set([
    ...brandTokens,
    ...nameTokens,
    ...(BRAND_EXTRA_WORDS[norm(ref.brand)] ?? []),
  ]);
  const leftover = rowTokens.filter(
    (t) =>
      !accounted.has(t) &&
      !NOISE_WORDS.has(t) &&
      !concentrationWords.has(t) &&
      !/^\d+$/.test(t) &&
      // Single letters are apostrophe debris — "J'adore" folds to "j adore",
      // and "j" identifies nothing.
      t.length > 1
  );

  // Anything unexplained means a different product.
  if (leftover.length > 0) return { rejected: "leftover: " + leftover.join(" ") };

  // And a leftover-free name that happens to be another reference we list is
  // still wrong — belt and braces for names that nest ("Angel" / "Angel Nova").
  if (rowTokens.some((t) => OTHER_REFERENCE_TOKENS.has(t) && !accounted.has(t))) return null;

  const hasConcentration = aliases.some((a) =>
    a.split(" ").every((w) => rowTokens.includes(w))
  );

  // Among survivors, prefer the one whose concentration matches ours.
  return { score: hasConcentration ? 100 : 50, hasConcentration };
}

/* ── run ──────────────────────────────────────────────────────────────────── */

/** `node scripts/ingest-feed.mjs --debug <slug>` prints why each candidate row
 *  was rejected for that reference. The matcher is strict by design, so a
 *  missing offer is usually a naming quirk worth seeing rather than a bug. */
const DEBUG_SLUG = process.argv.includes("--debug")
  ? process.argv[process.argv.indexOf("--debug") + 1]
  : null;

const feed = parseCsv(readFileSync(FEED, "utf8"));
const references = readReferences();

const offers = [];
const unmatched = [];

for (const ref of references) {
  // Distinctive words belonging to OTHER references, so "Angel" cannot match a
  // row that is really "Angel Nova" when we list Nova separately.
  OTHER_REFERENCE_TOKENS = new Set(
    references
      .filter((r) => r.slug !== ref.slug)
      .flatMap((r) => norm(r.name).split(" "))
      .filter((t) => t.length > 2)
  );
  for (const t of norm(ref.name).split(" ")) OTHER_REFERENCE_TOKENS.delete(t);
  for (const t of norm(ref.brand).split(" ")) OTHER_REFERENCE_TOKENS.delete(t);

  const scored = [];
  for (const row of feed) {
    const s = scoreCandidate(ref, row);
    if (!s) continue;
    if (s.rejected) {
      if (DEBUG_SLUG === ref.slug) console.log(`    reject "${row.product_name}" — ${s.rejected}`);
      continue;
    }
    scored.push({ row, ...s });
  }

  if (scored.length === 0) {
    unmatched.push(ref);
    continue;
  }

  const best = Math.max(...scored.map((s) => s.score));
  const winners = scored.filter((s) => s.score === best);

  // All variants of one product share a product page and an image; they differ
  // only in price. Group by page so the range is per product, not per match.
  const page = winners[0].row.merchant_deep_link;
  const samePage = winners.filter((s) => s.row.merchant_deep_link === page);
  const prices = samePage
    .map((s) => Number.parseFloat(s.row.search_price))
    .filter((n) => Number.isFinite(n))
    .sort((a, b) => a - b);

  // Link at the product page, not a variant: the variant ids carry no meaning
  // we can show a visitor, and the page lets them pick their own size.
  const representative = samePage[samePage.length - 1].row;

  offers.push({
    slug: ref.slug,
    name: ref.name,
    brand: ref.brand,
    matchedName: representative.product_name,
    concentrationMatched: winners[0].hasConcentration,
    productUrl: representative.merchant_deep_link,
    deepLink: representative.aw_deep_link,
    imageUrl: representative.merchant_image_url,
    priceFromUsd: prices[0] ?? null,
    priceToUsd: prices[prices.length - 1] ?? null,
    variantCount: samePage.length,
    currency: representative.currency,
  });
}

offers.sort((a, b) => a.slug.localeCompare(b.slug));

const generated = `/**
 * GENERATED FILE — do not edit by hand.
 * Written by scripts/ingest-feed.mjs from the ${MERCHANT.name} Awin product
 * feed. Re-run that script to refresh; see scripts/feeds/README.md for how the
 * feed gets here and what it does and does not contain.
 *
 * Generated:  ${new Date().toISOString()}
 * Feed rows:  ${feed.length}
 * References: ${references.length}  (matched ${offers.length}, unmatched ${unmatched.length})
 *
 * PRICE IS A RANGE ACROSS UNKNOWN BOTTLE SIZES. The feed carries no size
 * column, so priceFromUsd/priceToUsd span everything from a sample vial to a
 * large bottle. Render it as "from $X at <merchant>" and never as the
 * fragrance's price, and never divide it by a volume — see the header of
 * scripts/ingest-feed.mjs for the full reasoning.
 */

export interface MerchantOffer {
  /** Reference fragrance slug this offer belongs to. */
  slug: string;
  /** The merchant's own product name, kept so a mismatch is auditable. */
  matchedName: string;
  /** Whether the merchant's name confirmed our concentration. */
  concentrationMatched: boolean;
  /** The merchant's product page, for display and for checking a match. */
  productUrl: string;
  /** Awin tracked link. A clickref is appended at redirect-generation time. */
  deepLink: string;
  /** Merchant image URL, as delivered. Downloaded locally by
   *  scripts/fetch-feed-images.mjs — components use the local copy so no
   *  visitor request ever reaches the merchant's CDN. */
  remoteImageUrl: string;
  priceFromUsd: number | null;
  priceToUsd: number | null;
  variantCount: number;
  currency: string;
}

export const MERCHANT = ${JSON.stringify(MERCHANT, null, 2)} as const;

export const MERCHANT_OFFERS: Record<string, MerchantOffer> = {
${offers
  .map(
    (o) => `  ${JSON.stringify(o.slug)}: {
    slug: ${JSON.stringify(o.slug)},
    matchedName: ${JSON.stringify(o.matchedName)},
    concentrationMatched: ${o.concentrationMatched},
    productUrl: ${JSON.stringify(o.productUrl)},
    deepLink: ${JSON.stringify(o.deepLink)},
    remoteImageUrl: ${JSON.stringify(o.imageUrl)},
    priceFromUsd: ${o.priceFromUsd},
    priceToUsd: ${o.priceToUsd},
    variantCount: ${o.variantCount},
    currency: ${JSON.stringify(o.currency)},
  },`
  )
  .join("\n")}
};

/** Reference slugs this merchant does not carry. Kept so the gap is visible in
 *  code review rather than silently absent. */
export const UNMATCHED_SLUGS: readonly string[] = ${JSON.stringify(
  unmatched.map((u) => u.slug),
  null,
  2
)};
`;

writeFileSync(OUT, generated, "utf8");

console.log(`ingest-feed: ${feed.length} feed rows, ${references.length} references`);
console.log(`ingest-feed: matched ${offers.length}, unmatched ${unmatched.length}`);
for (const u of unmatched) console.log(`  no offer: ${u.brand} — ${u.name} (${u.slug})`);
console.log(`ingest-feed: wrote ${OUT.replace(root, ".")}`);
