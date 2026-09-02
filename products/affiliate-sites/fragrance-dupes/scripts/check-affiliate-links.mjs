/**
 * Checks every entry in lib/affiliate-links.ts against reality.
 *
 * WHY THIS EXISTS
 * ---------------
 * An affiliate link can be broken in four ways that all look identical in the
 * codebase, and three of them are invisible to `tsc`, `lint`, and a local
 * render:
 *
 *   1. The programme is closed. My Perfume Shop (Awin 106089) is approved,
 *      ships a 9,844-row feed and shows payment status green — and every link
 *      it issues redirects to awin1.com/closedMerchant.html.
 *   2. The sub-ID is dropped in the redirect chain. The click still works and
 *      the commission still pays, but nothing records which page earned it,
 *      and that cannot be reconstructed afterwards.
 *   3. The product is out of stock. Found the hard way on 2026-09-01: the
 *      Opulensi feed said `in_stock=1` for the Armaf limited edition and the
 *      live page said `OutOfStock`. **Feed stock data is a snapshot and goes
 *      stale; the product page is the truth.** A buy button to a sold-out page
 *      is a broken promise that earns nothing.
 *   4. The product is delisted entirely — 404, or a redirect to a category.
 *
 * So this follows each link the whole way and reports what it finds. It is a
 * network check, not a build step: it needs the internet, it is slow, and a
 * merchant being briefly down should not fail a deploy. Run it before shipping
 * a link change, and periodically after.
 *
 * Run: node scripts/check-affiliate-links.mjs
 * Exit code is 1 if any link fails a hard check (1, 2 or 4 above), 0 otherwise.
 * Out-of-stock is reported but does NOT fail: stock is transient, and the right
 * response is to set `inStock: false` on the offer, not to delete the link.
 */

import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");

/** Must match SUB_ID_PARAM in lib/affiliate-links.ts. */
const SUB_ID_PARAM = { awin: "clickref", cj: "sid" };

const UA = "Mozilla/5.0 (compatible; counterscent-link-check/1.0; +https://counterscent.com)";

/** Parse the affiliate map out of the TS file, same approach as
 *  generate-redirects.mjs — strict, so a shape change fails loudly. */
function readAffiliateLinks() {
  const src = readFileSync(resolve(root, "lib", "affiliate-links.ts"), "utf8");
  const match = src.match(
    /export const affiliateLinks\s*:[^=]*=\s*(\{\s*\}|\{[\s\S]*?^\});/m
  );
  if (!match) {
    throw new Error(
      "check-affiliate-links: could not find the `affiliateLinks` literal in " +
        "lib/affiliate-links.ts. Update this parser rather than letting the check " +
        "silently pass on zero links."
    );
  }
  const body = match[1].trim();
  if (/^\{\s*\}$/.test(body)) return [];

  return [...body.matchAll(/["']?([\w-]+)["']?\s*:\s*\{([^}]*)\}/g)].map(([, id, fields]) => ({
    id,
    network: fields.match(/network:\s*["']([^"']+)["']/)?.[1],
    merchantId: fields.match(/merchantId:\s*["']([^"']+)["']/)?.[1],
    deepLink: fields.match(/deepLink:\s*["']([^"']+)["']/)?.[1],
    subId: fields.match(/subId:\s*["']([^"']+)["']/)?.[1],
    label: fields.match(/label:\s*["']([^"']+)["']/)?.[1],
  }));
}

async function check(entry) {
  const problems = [];
  const notes = [];

  const param = SUB_ID_PARAM[entry.network];
  if (!param) return { ...entry, problems: [`unknown network "${entry.network}"`], notes };

  const joiner = entry.deepLink.includes("?") ? "&" : "?";
  const url = `${entry.deepLink}${joiner}${param}=${encodeURIComponent(entry.subId)}`;

  let res;
  try {
    res = await fetch(url, { redirect: "follow", headers: { "user-agent": UA } });
  } catch (err) {
    return { ...entry, problems: [`request failed: ${err.message}`], notes };
  }

  const final = res.url;
  const host = new URL(final).hostname;

  // 1. Did we land on a merchant, or on the network's error page?
  if (/(^|\.)awin1\.com$/.test(host) || /closedMerchant/i.test(final)) {
    problems.push(`landed on ${host} — programme is closed for tracking, this link cannot earn`);
  }
  if (!res.ok) problems.push(`destination returned HTTP ${res.status}`);

  // 2. Did our sub-ID survive? Networks pass it through in their own way —
  //    Awin merchants commonly echo it as utm_id=<affid>_<subId> — so look for
  //    the raw value anywhere in the final URL rather than for one parameter.
  const subIdSurvived = final.includes(entry.subId);
  if (!subIdSurvived) {
    problems.push("sub-ID did not survive the redirect — clicks would be unattributable");
  }

  // 3. Was a tracking cookie set anywhere in the chain? undici exposes only the
  //    final response's headers, so absence here is weak evidence, not proof.
  const setCookie = res.headers.getSetCookie?.() ?? [];
  if (setCookie.some((c) => /^awc=/.test(c))) notes.push("awc cookie set on final response");

  // 4. Stock. schema.org availability is what the merchant's own page asserts,
  //    and it disagreed with the Awin feed the first time it was checked.
  let inStock = null;
  try {
    const page = await fetch(final, { headers: { "user-agent": UA } });
    const html = await page.text();
    // The FIRST availability in the document is the page's own product; later
    // ones belong to "you may also like" cards and must not be read as this
    // product's stock.
    const m = html.match(/"availability"\s*:\s*"[^"]*?(InStock|OutOfStock|SoldOut|PreOrder)"/);
    if (m) inStock = m[1] === "InStock" || m[1] === "PreOrder";
  } catch {
    notes.push("could not re-fetch destination for a stock check");
  }
  if (inStock === false) notes.push("OUT OF STOCK on the merchant's page");
  if (inStock === null) notes.push("stock unknown (no schema.org availability found)");

  return { ...entry, final, host, subIdSurvived, inStock, problems, notes };
}

const entries = readAffiliateLinks().filter((e) => e.network && e.network !== "placeholder");

if (entries.length === 0) {
  console.log("check-affiliate-links: no real entries to check.");
  process.exit(0);
}

console.log(`check-affiliate-links: checking ${entries.length} link(s)\n`);

let failed = 0;
for (const entry of entries) {
  const r = await check(entry);
  const ok = r.problems.length === 0;
  if (!ok) failed++;

  console.log(`${ok ? "PASS" : "FAIL"}  ${r.id}`);
  console.log(`      ${r.label ?? ""}`);
  if (r.final) console.log(`      -> ${r.host}`);
  if (r.subIdSurvived) console.log(`      sub-ID "${r.subId}" survived`);
  for (const p of r.problems) console.log(`      PROBLEM: ${p}`);
  for (const n of r.notes) console.log(`      note: ${n}`);
  console.log();
}

console.log(
  failed === 0
    ? `check-affiliate-links: all ${entries.length} link(s) reach a merchant with attribution intact.`
    : `check-affiliate-links: ${failed} of ${entries.length} link(s) FAILED.`
);
console.log(
  "Out-of-stock is a note, not a failure — set `inStock: false` on that offer in\n" +
    "lib/dupes-data.ts so the row renders without a buy button, rather than deleting the link."
);

process.exit(failed === 0 ? 0 : 1);
