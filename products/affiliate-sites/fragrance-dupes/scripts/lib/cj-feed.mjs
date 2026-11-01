/**
 * Reading a CJ "Shopping (Google Format)" product export, and working out WHICH
 * ADVERTISER each row belongs to.
 *
 * WHY THIS FILE EXISTS
 * --------------------
 * `scripts/ingest-cj-feed.mjs` was written against one subscription delivering
 * one advertiser (FragranceShop, CJ 16941446) and kept its feed reader, its
 * price parser and its link unwrapper as private local functions. A second CJ
 * subscription arrived, then a third, so the reader and the parsers live here,
 * once, and any ingest for any CJ subscription imports them instead of growing
 * a second copy. Same reasoning as scripts/lib/affiliate-link-sources.mjs:
 * when two scripts must agree about a format, the agreement is a shared
 * module, not a comment asserting they match.
 *
 * ALL THREE SUBSCRIPTIONS DELIVERED ONE ADVERTISER EACH, and the founder's call
 * of 2026-10-05 is that we stop generalising past that. An earlier version of
 * this file split a feed's rows into per-advertiser buckets so one export could
 * be ingested as several merchants; nothing ever consumed a bucket, and the
 * speculative case that justified them has not arrived in three deliveries.
 * What SURVIVED that trim is the advertiser CENSUS below — who sent this file,
 * how many rows, under whose publisher id — because that is what the ingest's
 * one-merchant refusal needs in order to say what arrived, and what `--inspect`
 * needs in order to triage a delivery. Reporting identity is not the same job
 * as acting on several identities at once.
 *
 * NOTHING HERE DECIDES ANYTHING. It reports facts off the delivered bytes. The
 * judgement calls a new feed needs — which price column is authoritative,
 * whether its rows are designer stock or the merchant's own house dupe line —
 * are deliberately NOT given defaults, because both have silently produced
 * wrong published data in this project before. See scripts/feeds/README.md.
 *
 * WHERE A LINK-ID PREFIX IS OWNED: scripts/lib/affiliate-link-sources.mjs, and
 * nowhere else. This file briefly carried a CJ_LINK_NAMESPACES table too; it
 * was a second, unread copy of two string constants the ingest hardcodes into
 * its emit templates, which is the "two copies that will drift" shape with the
 * drift already latent. The guard that actually fires — over the ids really
 * emitted, in `prebuild` — is `assertNoDuplicateLinkIds` over there.
 *
 * THE SCHEMA IS READ, NEVER ASSUMED. CJ's own format sample had 66 columns and
 * the real export has 87 (project CLAUDE.md, "THE FEED'S SCHEMA IS NOT WHAT THE
 * SAMPLE SAID"). Every function below works off the delivered header.
 */

import { existsSync, readFileSync } from "node:fs";

/**
 * CJ click URLs carry our publisher id and the advertiser id in the PATH:
 *
 *   https://www.dpbolvw.net/click-101873278-16941446?url=<encoded merchant URL>
 *                                 ^^^^^^^^^ ^^^^^^^^
 *                                 publisher advertiser
 *
 * MATCH THE PATH, NEVER THE HOSTNAME. CJ rotates the click domain: across the
 * 544 CJ links committed in lib/data/*-links.generated.ts the host is
 * dpbolvw.net (403), jdoqocy.com (45), anrdoezrs.net (36), kqzyfj.com (30) and
 * tkqlhce.com (30) — five hosts for two advertisers. Keying on the host would
 * split one advertiser five ways and prove nothing.
 */
const CLICK_PATH = /\/click-(\d+)-(\d+)(?:[/?]|$)/;

/**
 * Who published this row, by every channel the delivered feed offers.
 *
 * `advertiserId` is the one to KEY ON: it is CJ's own numeric id, it is the
 * number the affiliate relationship is recorded under, and it cannot be
 * restyled by a merchant renaming its storefront. `programName` is for humans
 * and for reports — a merchant can and does trade under names that differ by a
 * leading "the" (project CLAUDE.md: fragranceshop.com vs thefragranceshop.com
 * vs thefragranceshop.co.uk are three different companies), so a name match is
 * not an identity.
 *
 * The three header columns read here carry PROGRAMME identity, and their
 * meanings were taken off real exports on disk rather than CJ's documentation:
 *
 *   col 1  PROGRAM_NAME   "Perfumania.com" / "IRFE"      the advertiser
 *   col 2  PROGRAM_URL    "http://www.perfumania.com"    the advertiser's site
 *   col 3  CATALOG_NAME   "Like product feed - Aug 2026" the SUBSCRIPTION, not
 *                         / "IRFE PRODUCTS"               the advertiser
 *
 * CATALOG_NAME is the trap of the three, and the IRFE delivery of 2026-10-04 is
 * why it is worth restating: there PROGRAM_NAME is "IRFE" and CATALOG_NAME is
 * "IRFE PRODUCTS", so the two nearly agree and reading one for the other costs
 * nothing — which is exactly how the habit forms. On the Perfumania export the
 * same mistake names a feed, not a company. Never identify an advertiser by it;
 * `advertiserId` off the click path is the only identity here.
 *
 * @param {Record<string,string>} row a parsed feed row
 * @returns {{advertiserId: string|null, publisherId: string|null,
 *            programName: string, programUrl: string, catalogName: string}}
 */
export function advertiserOf(row) {
  const m = CLICK_PATH.exec(row.LINK ?? "");
  return {
    publisherId: m?.[1] ?? null,
    advertiserId: m?.[2] ?? null,
    programName: (row.PROGRAM_NAME ?? "").trim(),
    programUrl: (row.PROGRAM_URL ?? "").trim(),
    catalogName: (row.CATALOG_NAME ?? "").trim(),
  };
}

/**
 * WHICH advertisers a delivered feed carries, and how many rows each sent.
 *
 * A CENSUS, NOT A SPLIT, and the difference is the whole of the 2026-10-05
 * trim. The earlier `groupByAdvertiser` returned each advertiser's ROWS so a
 * caller could ingest an export as several merchants. No caller ever read a
 * row array — both readers wanted `.length` — and the founder has dropped the
 * multi-advertiser generalisation that justified them, so the arrays are gone
 * and the count stays. Keeping rows nobody reads is how a dropped plan goes on
 * costing: the next reader assumes the buckets are load-bearing and builds on
 * them.
 *
 * Rows whose `LINK` carries no parseable `click-<PID>-<AID>` are counted under
 * the key `"unknown"` and reported rather than dropped: a row we cannot
 * attribute is a fact about the delivery, and silently discarding it is how a
 * whole advertiser goes missing without an error (the shape of the 91-key link
 * collision, arriving one step earlier).
 *
 * @param {Record<string,string>[]} rows
 * @returns {Map<string, {identity: ReturnType<typeof advertiserOf>, rowCount: number}>}
 */
export function advertiserCensus(rows) {
  /** @type {Map<string, {identity: any, rowCount: number}>} */
  const census = new Map();
  for (const row of rows) {
    const identity = advertiserOf(row);
    const key = identity.advertiserId ?? "unknown";
    const seen = census.get(key);
    if (seen) seen.rowCount++;
    else census.set(key, { identity, rowCount: 1 });
  }
  return census;
}

/**
 * Read a CJ shopping export off disk.
 *
 * SPLIT ON TABS, AND DO NOT PARSE QUOTES — but the reason is narrower than it
 * was first written down, and the IRFE export of 2026-10-04 is what narrowed it.
 *
 * The original claim here was "TAB-SEPARATED WITH NO QUOTING", verified on the
 * FragranceShop export as zero fields containing a double-quote. That held for
 * that feed and was then generalised to CJ. **It is false in general.** IRFE's
 * export carries four rows whose `DESCRIPTION` is wrapped in double quotes,
 * CSV-style, because the description contains commas — a merchant exporting
 * through a CSV writer that quotes on comma and then emitting tabs.
 *
 * `split("\t")` is still correct, and for a reason that survives the
 * correction: what would break it is a TAB inside a quoted field, not a quote.
 * No delivered export has one, which is checkable and is checked — the ragged
 * count below is exactly that test, since a tab inside a quoted field lengthens
 * its row. A CSV parser would be wrong for the opposite reason it was first
 * given: not because quotes never appear, but because an unquoted apostrophe or
 * comma is ordinary data in a fragrance title and a note list is dense with
 * commas, so a comma-splitting parser shreds rows no tab-splitter touches.
 *
 * The durable form: VERIFY THE DELIMITER PER FEED, never per network. A quote
 * count is evidence about one export; the field-count check is the invariant.
 *
 * Ragged rows are counted and skipped rather than coerced — a short row read
 * positionally silently shifts every later column.
 *
 * @param {string} path absolute path to the .txt export
 * @param {{caller?: string}} [opts]
 * @returns {{rows: Record<string,string>[], ragged: number[], columns: number, header: string[]}}
 */
export function readCjFeed(path, opts = {}) {
  const caller = opts.caller ?? "cj-feed";
  if (!existsSync(path)) {
    throw new Error(
      `${caller}: no feed at ${path}\n` +
        "Download it from CJ (Account -> Subscriptions), unzip it into " +
        "scripts/feeds/, and keep it there — that directory is gitignored and " +
        "this repository is public."
    );
  }
  const lines = readFileSync(path, "utf8")
    .split(/\r?\n/)
    .filter((l) => l.trim() !== "");
  const header = lines[0].split("\t");
  const ragged = [];
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = lines[i].split("\t");
    if (cells.length !== header.length) {
      ragged.push(i + 1);
      continue;
    }
    rows.push(Object.fromEntries(header.map((h, j) => [h, cells[j]])));
  }
  if (rows.length === 0) {
    throw new Error(`${caller}: parsed zero rows — check the delimiter and header.`);
  }
  return { rows, ragged, columns: header.length, header };
}

/**
 * "8.95 USD" -> { amount: 8.95, currency: "USD" }
 *
 * CJ delivers price as a single string with the currency inside it, unlike
 * Awin's separate `search_price` + `currency`. A value that does not match is
 * returned as nulls, never as 0 — a zero price divides into a per-ml figure and
 * publishes as a real number, which is the exact failure the PRICE/SALE_PRICE
 * report below exists to surface.
 *
 * @param {string|undefined} raw
 * @returns {{amount: number|null, currency: string|null}}
 */
export function parseCjPrice(raw) {
  const m = (raw ?? "").trim().match(/^([\d.]+)\s*([A-Z]{3})$/);
  if (!m) return { amount: null, currency: null };
  const amount = Number.parseFloat(m[1]);
  return { amount: Number.isFinite(amount) ? amount : null, currency: m[2] };
}

/** CJ wraps the merchant's own URL inside the click link as `url=`. Kept
 *  separately from the click URL so a match is auditable against the page a
 *  buyer actually lands on. */
export function unwrapMerchantUrl(link) {
  try {
    return new URL(link).searchParams.get("url");
  } catch {
    return null;
  }
}

/**
 * Which of `PRICE` / `SALE_PRICE` actually carries a usable figure, counted.
 *
 * THIS IS A MEASUREMENT, NOT A FALLBACK, and the distinction is the point.
 * `ingest-cj-feed.mjs` reads `parsePrice(r.PRICE)`, which is right for
 * FragranceShop and wrong for Perfumania, where `PRICE` is `0.00 USD` or empty
 * on 53 of 66 rows and the real figure is in `SALE_PRICE`. Pointing the
 * existing ingest at such a feed prices 80% of the catalogue at $0.00, and this
 * site computes "Nx cheaper" from price — so the wrong column does not fail, it
 * publishes a false saving.
 *
 * A silent `PRICE ?? SALE_PRICE` fallback is NOT the fix either: on a feed where
 * `PRICE` is list and `SALE_PRICE` is a promotion, quietly preferring one
 * changes every price on the site with nothing in the diff to say so. So this
 * reports and the caller decides.
 *
 * @param {Record<string,string>[]} rows
 * @returns {{rows: number, priceUsable: number, salePriceUsable: number,
 *            neither: number, disagree: number}}
 */
export function priceFieldReport(rows) {
  let priceUsable = 0;
  let salePriceUsable = 0;
  let neither = 0;
  let disagree = 0;
  for (const row of rows) {
    const p = parseCjPrice(row.PRICE).amount;
    const s = parseCjPrice(row.SALE_PRICE).amount;
    const pOk = p != null && p > 0;
    const sOk = s != null && s > 0;
    if (pOk) priceUsable++;
    if (sOk) salePriceUsable++;
    if (!pOk && !sOk) neither++;
    if (pOk && sOk && p !== s) disagree++;
  }
  return { rows: rows.length, priceUsable, salePriceUsable, neither, disagree };
}
