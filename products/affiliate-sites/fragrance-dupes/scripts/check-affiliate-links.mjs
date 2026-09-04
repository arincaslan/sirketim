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
 *      and that cannot be reconstructed afterwards. **How this is detected
 *      changed on 2026-09-03 — see "Checking the sub-ID" below. It is the one
 *      check here that produced a false failure.**
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
 * CHECKING THE SUB-ID — and the false failure that forced a rewrite
 * ------------------------------------------------------------------
 * Until 2026-09-03 this script asserted the sub-ID appeared in the FINAL URL,
 * on the reasoning that Opulensi echoes it back as `utm_id=<affid>_<subId>`.
 *
 * That was never an Awin guarantee. It is Opulensi's own Shopify theme copying
 * a query parameter through, and a merchant that does not do it is not
 * dropping our attribution — it simply does not restate it. Clone of Perfume
 * (Awin 117395) is such a merchant, so all nine of its links were reported as
 * "clicks would be unattributable" when they track perfectly well.
 *
 * The right place to look is Awin's own click cookie, set on `.awin1.com` at
 * the FIRST hop of the chain, before any merchant is involved:
 *
 *     aw<merchantId>=<affiliateId>|0|0|<timestamp>|<our subId>|aw|<productId>
 *
 * Both merchants set it, identically shaped (`aw123248=…`, `aw117395=…`), which
 * is what identifies it as the network-level record and the URL echo as the
 * merchant-specific extra. That cookie is the attribution.
 *
 * The old code could not see it for a structural reason worth remembering:
 * with `redirect: "follow"`, undici exposes only the FINAL response's headers,
 * so every cookie set earlier in the chain is invisible. The script's own
 * comment admitted this and then drew no conclusion from it. traceChain()
 * below follows the redirects by hand so each hop's Set-Cookie is readable.
 *
 * So the sub-ID now passes on EITHER of two channels, and the output says which:
 *
 *   awin-cookie  the Awin click cookie carries it  (authoritative)
 *   dest-url     the merchant echoed it into the destination URL  (a bonus)
 *
 * **The check is not weakened.** A link that genuinely loses the sub-ID fails
 * both channels and still fails hard — that failure is invisible in the
 * codebase and unrecoverable after the fact, which is why it must stay loud.
 * What changed is that it now reads the channel that decides attribution
 * instead of one merchant's side effect.
 *
 * MERCHANT_NOTES below records per-advertiser facts that a network check cannot
 * establish on its own, such as a confirmed sighting in the Awin dashboard.
 * They are printed, never used to skip a check.
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

/** How many redirects to follow before giving up. Awin chains are 1-3 hops. */
const MAX_HOPS = 12;

/**
 * Statuses that mean "ask again later", not "this link is broken". A merchant
 * rate-limiting us is a fact about our request rate, not about the link.
 */
const RETRYABLE_STATUS = new Set([408, 425, 429, 500, 502, 503, 504]);

/**
 * Pause between links. Two full passes of this script inside a few minutes was
 * enough for opulensi.com to start returning 429s, so it is a courtesy to the
 * merchant as much as it is accuracy for us — 39 links at 700ms is under a
 * minute of added wall time and this is not a build step.
 */
const DELAY_MS = 700;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Per-advertiser facts this script cannot determine from one request, keyed by
 * the merchantId in lib/affiliate-links.ts.
 *
 * These are DOCUMENTATION AND CONTEXT ONLY. Nothing here suppresses a check or
 * turns a failure into a pass — a merchant listed as not echoing the sub-ID
 * still has to produce it in the Awin click cookie or it fails like any other.
 * The purpose is that the next person reading a report knows an expected
 * behaviour from a regression without re-deriving it.
 */
const MERCHANT_NOTES = {
  123248: {
    name: "Opulensi Perfumes",
    echoesSubIdInUrl: true,
    note: "Shopify theme echoes our clickref as utm_id=<affid>_<subId>. Convenient, not required.",
  },
  117395: {
    name: "Clone of Perfume",
    echoesSubIdInUrl: false,
    note:
      "Does NOT echo the sub-ID into the destination URL, and that is expected rather than broken. " +
      "Attribution verified two independent ways on 2026-09-03: (a) the Awin click cookie " +
      "aw117395=3064149|0|0|<ts>|<clickref>|aw|<pid> is set on .awin1.com at hop 0, which this " +
      "script now reads directly; (b) the founder confirmed in the Awin Click Report dashboard " +
      "that a probe click with clickref=probe was recorded against advertiser 117395.",
  },
  34989: {
    name: "AromaPassions",
    echoesSubIdInUrl: false,
    note:
      "Does NOT echo the sub-ID into the destination URL — observed 2026-09-04, not assumed. " +
      "It appends its OWN tracking params instead (`sv1=affiliate&sv_campaign_id=3064149&sscid=" +
      "34989_<ts>_<hash>&awc=34989_<ts>_<hash>`), which look like attribution but carry the " +
      "advertiser/click id, never our clickref. Our sub-ID arrives on the other channel only: " +
      "aw34989=3064149|0|0|<ts>|<clickref>|aw|<pid>, set on .awin1.com at hop 0. Note this " +
      "merchant also sets NO `awc` cookie — it puts awc in the query string — so the 'awc cookie " +
      "set in the chain' note is absent here and that is expected. " +
      "SECOND FACT, and it changes how a link is built: the pclick deep link is PRODUCT-level, " +
      "not variant-level. All three of EROTIC's feed rows (30/50/100 ml) redirect to the same " +
      "product page, so a row whose variant has since been discontinued still lands correctly. " +
      "That is why Eros Flame can be linked from aw_product_id 41943775357 even though that id " +
      "is the delisted 30 ml. Do not read a working link as proof its variant still exists.",
  },
  106089: {
    name: "My Perfume Shop",
    echoesSubIdInUrl: null,
    note: "Programme CLOSED for tracking — every link lands on awin1.com/closedMerchant.html. No links ship from this merchant.",
  },
};

/** Parse a Set-Cookie header line into { name, value }. */
function parseCookie(line) {
  const eq = line.indexOf("=");
  if (eq < 0) return null;
  const semi = line.indexOf(";");
  return {
    name: line.slice(0, eq).trim(),
    value: line.slice(eq + 1, semi < 0 ? undefined : semi).trim(),
  };
}

function setCookiesOf(res) {
  const list = res.headers.getSetCookie?.();
  if (list?.length) return list;
  const single = res.headers.get("set-cookie");
  return single ? [single] : [];
}

/**
 * Follow a redirect chain by hand, recording every hop's Set-Cookie.
 *
 * `redirect: "follow"` would be shorter and is what this used to do — but it
 * throws away the intermediate responses, and the Awin click cookie is set on
 * the very first one. The whole sub-ID check depends on seeing it.
 */
async function traceChain(url) {
  const cookies = [];
  const hosts = [];
  let current = url;
  let res;

  for (let i = 0; i < MAX_HOPS; i++) {
    res = await fetch(current, { redirect: "manual", headers: { "user-agent": UA } });
    const host = new URL(current).hostname;
    hosts.push(host);
    for (const line of setCookiesOf(res)) {
      const c = parseCookie(line);
      if (c) cookies.push({ ...c, host });
    }
    const location = res.headers.get("location");
    if (!location) return { final: current, status: res.status, cookies, hosts };
    current = new URL(location, current).href;
  }
  return { final: current, status: res?.status ?? 0, cookies, hosts, truncated: true };
}

/**
 * Did our sub-ID reach Awin's click record?
 *
 * The cookie's value is pipe-delimited and the sub-ID is one of the fields;
 * this checks membership rather than a fixed index, so a change in Awin's
 * field order degrades to "still found" instead of a false failure.
 */
function subIdInAwinCookie(cookies, merchantId, subId) {
  const hit = cookies.find((c) => c.name === `aw${merchantId}`);
  if (!hit) return null;
  const value = (() => {
    try {
      return decodeURIComponent(hit.value);
    } catch {
      return hit.value;
    }
  })();
  return value.split("|").some((f) => f === subId) ? hit.name : null;
}

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

  let chain;
  try {
    chain = await traceChain(url);
  } catch (err) {
    return { ...entry, problems: [`request failed: ${err.message}`], notes };
  }

  const { final, status, cookies } = chain;
  const host = new URL(final).hostname;
  const merchant = MERCHANT_NOTES[entry.merchantId];

  // 1. Did we land on a merchant, or on the network's error page?
  if (/(^|\.)awin1\.com$/.test(host) || /closedMerchant/i.test(final)) {
    problems.push(`landed on ${host} — programme is closed for tracking, this link cannot earn`);
  }
  // A merchant throttling or briefly falling over says nothing about whether
  // the LINK works, so it must not read as a broken link. Observed for real on
  // 2026-09-03: running this checker several times in a few minutes had
  // opulensi.com returning 429 to a different handful of links on each run,
  // which reported as "destination returned HTTP 429" — indistinguishable in
  // the output from a genuinely dead product. Retry-worthy statuses are a note;
  // everything else outside 2xx stays a hard failure.
  if (RETRYABLE_STATUS.has(status)) {
    notes.push(`merchant returned HTTP ${status} (throttled or briefly down) — inconclusive, re-run later`);
  } else if (status < 200 || status >= 300) {
    problems.push(`destination returned HTTP ${status}`);
  }

  // 2. Did our sub-ID survive? Two independent channels — see the header. The
  //    Awin click cookie is the one that decides attribution; the destination
  //    URL echo is a merchant-specific convenience that many merchants, quite
  //    legitimately, do not provide.
  const cookieChannel = subIdInAwinCookie(cookies, entry.merchantId, entry.subId);
  const urlChannel = final.includes(entry.subId);
  const channels = [];
  if (cookieChannel) channels.push(`Awin click cookie ${cookieChannel}`);
  if (urlChannel) channels.push("destination URL");

  if (channels.length === 0) {
    problems.push(
      "sub-ID reached NEITHER the Awin click cookie NOR the destination URL — clicks would be unattributable"
    );
  } else if (!urlChannel && merchant?.echoesSubIdInUrl === false) {
    notes.push("no sub-ID in the destination URL — expected for this merchant, see MERCHANT_NOTES");
  } else if (!cookieChannel) {
    // Attribution held via the URL only. Not a failure, but the authoritative
    // channel went missing, so say so rather than printing a bare PASS.
    notes.push(
      `no aw${entry.merchantId} click cookie seen in the chain — attribution rests on the URL echo alone`
    );
  }

  // 3. The merchant-side tracking cookie, now visible on every hop rather than
  //    only the last one.
  if (cookies.some((c) => c.name === "awc")) notes.push("awc cookie set in the chain");

  // 4. Stock. schema.org availability is what the merchant's own page asserts,
  //    and it disagreed with the Awin feed the first time it was checked.
  //
  //    Skipped entirely when the chain was throttled: a 429 page has no
  //    availability markup, which would otherwise read as "stock unknown" and
  //    invite someone to go looking for a problem that is not there.
  let inStock = null;
  if (RETRYABLE_STATUS.has(status)) {
    return { ...entry, final, host, channels, merchantName: merchant?.name, inStock, problems, notes };
  }
  try {
    const page = await fetch(final, { headers: { "user-agent": UA } });
    if (RETRYABLE_STATUS.has(page.status)) {
      notes.push(`stock check throttled (HTTP ${page.status}) — inconclusive, re-run later`);
      return { ...entry, final, host, channels, merchantName: merchant?.name, inStock, problems, notes };
    }
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

  return { ...entry, final, host, channels, merchantName: merchant?.name, inStock, problems, notes };
}

const entries = readAffiliateLinks().filter((e) => e.network && e.network !== "placeholder");

if (entries.length === 0) {
  console.log("check-affiliate-links: no real entries to check.");
  process.exit(0);
}

const byMerchant = entries.reduce((acc, e) => {
  (acc[e.merchantId] ??= []).push(e);
  return acc;
}, {});

console.log(`check-affiliate-links: checking ${entries.length} link(s) across ${Object.keys(byMerchant).length} merchant(s)`);
for (const [mid, list] of Object.entries(byMerchant)) {
  const m = MERCHANT_NOTES[mid];
  console.log(`  ${mid}  ${m?.name ?? "(unknown advertiser — add it to MERCHANT_NOTES)"}  ${list.length} link(s)`);
  if (m?.echoesSubIdInUrl === false) console.log(`        sub-ID is verified via the Awin click cookie, not the URL`);
}
console.log();

let failed = 0;
const outOfStock = [];
const inconclusive = [];
let first = true;
for (const entry of entries) {
  if (!first) await sleep(DELAY_MS);
  first = false;
  const r = await check(entry);
  if (r.notes?.some((n) => /throttled/.test(n))) inconclusive.push(r.id);
  const ok = r.problems.length === 0;
  if (!ok) failed++;
  if (r.inStock === false) outOfStock.push(r.id);

  console.log(`${ok ? "PASS" : "FAIL"}  ${r.id}`);
  console.log(`      ${r.label ?? ""}`);
  if (r.final) console.log(`      -> ${r.host}`);
  if (r.channels?.length) {
    console.log(`      sub-ID "${r.subId}" survived via: ${r.channels.join(" + ")}`);
  }
  for (const p of r.problems) console.log(`      PROBLEM: ${p}`);
  for (const n of r.notes) console.log(`      note: ${n}`);
  console.log();
}

console.log(
  failed === 0
    ? `check-affiliate-links: all ${entries.length} link(s) reach a merchant with attribution intact.`
    : `check-affiliate-links: ${failed} of ${entries.length} link(s) FAILED.`
);
if (outOfStock.length) {
  console.log(`check-affiliate-links: ${outOfStock.length} out of stock — ${outOfStock.join(", ")}`);
}
if (inconclusive.length) {
  console.log(
    `check-affiliate-links: ${inconclusive.length} INCONCLUSIVE (merchant throttled us) — ${inconclusive.join(", ")}\n` +
      "  Their stock reading is unreliable this run. Re-run in a few minutes before changing any `inStock`."
  );
}
console.log(
  "Out-of-stock is a note, not a failure — set `inStock: false` on that offer in\n" +
    "lib/dupes-data.ts so the row renders without a buy button, rather than deleting the link."
);

process.exit(failed === 0 ? 0 : 1);
