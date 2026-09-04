/**
 * Downloads product photographs for the DUPES listings into
 * public/images/dupe/, and writes lib/data/dupe-images.generated.ts.
 *
 * Sibling of fetch-feed-images.mjs, which does the same job for REFERENCES.
 * Rehosting rather than hotlinking is a privacy decision and the reasoning is
 * written out in full there — read that header, it applies here unchanged.
 *
 * WHAT MAKES AN IMAGE USABLE HERE, AND WHY THIS SCRIPT IS A HARDCODED MAP
 * ----------------------------------------------------------------------
 * A perfume bottle is protected trade dress (see lib/types.ts on
 * ReferenceFragrance.imageUrl). The lawful source we are relying on is
 * "imagery supplied by an affiliate programme we are enrolled in, used to
 * promote that programme's merchant" — which means the licence is tied to the
 * link, not to the picture. An image is therefore only taken here when:
 *
 *   1. the product is in a feed from a merchant whose programme actually
 *      TRACKS — Opulensi (Awin 123248) and Clone of Perfume (Awin 117395), but
 *      NOT My Perfume Shop (Awin 106089), which is approved but closed for
 *      tracking — and
 *   2. the listing has an offer with a real affiliateLinkId to that merchant.
 *
 * TWO MERCHANTS AS OF 2026-09-03, and the `feed` field on each SOURCES entry is
 * what keeps them apart. It was already there — this script has always resolved
 * a feed path per entry rather than assuming one global feed — so adding Clone
 * of Perfume needed a second FEED constant and nothing else. Do the same for a
 * third merchant: add a constant, point its entries at it, and leave the loop
 * alone. Do NOT fork this file per merchant; the orphan report at the bottom
 * only works because one script owns the whole directory.
 *
 * Note that being temporarily OUT OF STOCK does not disqualify an image: the
 * affiliate relationship is what the licence rests on, and that is unaffected
 * by whether a particular bottle is on the shelf today. The Armaf entry is
 * exactly this case — `inStock: false` on the offer, image retained.
 *
 * The map below is keyed by dupe slug and holds the merchant's own product id
 * — deliberately the SAME id that appears in the affiliate deep link in
 * lib/affiliate-links.ts (`pclick.php?p=<id>`). That is what makes the pairing
 * checkable by eye: if the picture and the buy button disagree about which
 * product they mean, the two ids will not match.
 *
 * Listings NOT in this map render the generated note-signature mark instead.
 * That is the correct outcome, not a gap to fill: armaf-club-de-nuit-sillage
 * and armaf-club-de-nuit-urban-man are carried only by the closed merchant, so
 * we can neither link them nor justify hosting their photographs.
 *
 * Run: node scripts/fetch-dupe-images.mjs [--force]
 */

import { writeFileSync, mkdirSync, existsSync, readFileSync, readdirSync, unlinkSync } from "node:fs";
import { dirname, resolve, extname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const OUT_DIR = resolve(root, "public", "images", "dupe");
/** Awin 123248 — Opulensi Perfumes, a reseller. 610 rows, GBP. */
const FEED = resolve(here, "feeds", "opulensi.csv");
/** Awin 117395 — Clone of Perfume, the brand's own store. 11 rows, USD. */
const CLONE_FEED = resolve(here, "feeds", "clone-of-perfume.csv");
/** Awin 34989 — AromaPassions, the brand's own store. 230 rows, USD. */
const AROMAPASSIONS_FEED = resolve(here, "feeds", "aromapassions.csv");

const FORCE = process.argv.includes("--force");

/** dupe slug -> { feed, productId }. See the header for the rule these obey. */
const SOURCES = {
  "lattafa-khamrah": { feed: FEED, productId: "43494950528" },
  "lattafa-asad": { feed: FEED, productId: "43494950525" },
  "armaf-club-de-nuit-intense-man": { feed: FEED, productId: "43494950249" },
  // Added 2026-09-02 with the second batch of listings.
  "lattafa-oud-for-glory": { feed: FEED, productId: "43494950479" },
  "fragrance-world-barakkat-rouge-540": { feed: FEED, productId: "43494950481" },
  "lattafa-ana-abiyedh-rouge": { feed: FEED, productId: "43494950688" },
  "ard-al-zaafaran-bint-hooran": { feed: FEED, productId: "43494950527" },
  "maison-alhambra-leonie": { feed: FEED, productId: "43494950698" },
  // Editorially-paired batch, 2026-09-02.
  "lattafa-khamrah-qahwa": { feed: FEED, productId: "43494950597" },
  "maison-alhambra-maitre-de-blue": { feed: FEED, productId: "43494950729" },
  "lattafa-velvet-oud": { feed: FEED, productId: "43494950501" },
  "lattafa-qaed-al-fursan-unlimited": { feed: FEED, productId: "43494950532" },
  "lattafa-mayar-cherry-intense": { feed: FEED, productId: "43494950258" },
  // Low-scoring-but-real batch, 2026-09-02.
  "maison-alhambra-jean-lowe-matiere": { feed: FEED, productId: "43494950201" },
  "lattafa-maahir-black-edition": { feed: FEED, productId: "43494950568" },
  // Coverage batch, 2026-09-02.
  "afnan-embassy-royal-extrait": { feed: FEED, productId: "43494950604" },
  "french-avenue-royal-blend-extrait": { feed: FEED, productId: "43494950211" },
  "fragrance-world-mocha-wood": { feed: FEED, productId: "43494950722" },
  "lattafa-al-areeq-gold": { feed: FEED, productId: "43494950601" },
  "maison-alhambra-sceptre-amazonite": { feed: FEED, productId: "43494950225" },
  "lattafa-velvet-rose": { feed: FEED, productId: "43494950547" },
  "rasasi-hawas-black": { feed: FEED, productId: "44072471577" },
  "afnan-supremacy-not-only-intense": { feed: FEED, productId: "43494950550" },
  // Added 2026-09-03.
  "fragrance-world-neroli-riviera": { feed: FEED, productId: "43494950190" },
  "ard-al-zaafaran-oud-orchid": { feed: FEED, productId: "43494950500" },
  "lattafa-qaed": { feed: FEED, productId: "43494950511" },
  "lattafa-mohra": { feed: FEED, productId: "43494950593" },
  // Added 2026-09-03, final batch from this feed.
  "fragrance-world-vanille-en-tobacco": { feed: FEED, productId: "43494950250" },
  "lattafa-ameer-al-oudh-intense-oud": { feed: FEED, productId: "43494950497" },
  "zimaya-oud-is-great": { feed: FEED, productId: "43494950652" },

  // ── Clone of Perfume (Awin 117395), added 2026-09-03. First entries here
  // from a second merchant. Same two conditions as everything above: the
  // programme tracks, and each of these listings carries a real
  // affiliateLinkId to it in lib/dupes-data.ts.
  //
  // The product ids are the `p=` values from the same feed rows that produced
  // the deep links in lib/affiliate-links.ts, which is what makes a photograph
  // and a buy button provably the same product.
  "the-clone-rouge-veil-no-13": { feed: CLONE_FEED, productId: "44269697233" },
  "the-clone-thunderstorm-no-93": { feed: CLONE_FEED, productId: "44269697235" },
  "the-clone-ultimatum-no-53": { feed: CLONE_FEED, productId: "44269697236" },
  "the-clone-naked-cherry-no-33": { feed: CLONE_FEED, productId: "44269697231" },
  "the-clone-whisper-no-43": { feed: CLONE_FEED, productId: "44269697237" },
  "the-clone-lady-on-fire-no-23": { feed: CLONE_FEED, productId: "44269697229" },
  "the-clone-pleasure-noir-no-63": { feed: CLONE_FEED, productId: "44269697232" },
  "the-clone-brave-in-love-no-37": { feed: CLONE_FEED, productId: "44269697227" },
  "the-clone-brutal-story-no-73": { feed: CLONE_FEED, productId: "44269697228" },

  // ── AromaPassions (Awin 34989), added 2026-09-04. Third merchant, and it
  // needed exactly what the header promised: one new FEED constant and a block
  // of entries. The loop was not touched.
  //
  // Same two conditions as everything above — the programme tracks (all
  // fourteen links traced 2026-09-04), and each listing carries a real
  // affiliateLinkId to it.
  //
  // The ids are the same `p=` values as the deep links in
  // lib/affiliate-links.ts, so a photograph and a buy button are provably the
  // same product. That includes MASCULINITY, whose id 41943775357 is the
  // DISCONTINUED 30ml row — the only row this product has. The bottle in that
  // row's photograph is the same bottle at a different size, and the link is
  // product-level, so both remain correct; it is noted because "the feed row
  // exists" and "you can buy that variant" came apart here.
  "aromapassions-spark": { feed: AROMAPASSIONS_FEED, productId: "41943775349" },
  "aromapassions-heavenly": { feed: AROMAPASSIONS_FEED, productId: "41943775170" },
  "aromapassions-freedom": { feed: AROMAPASSIONS_FEED, productId: "41943775182" },
  "aromapassions-virility": { feed: AROMAPASSIONS_FEED, productId: "41943775222" },
  "aromapassions-bittersweet": { feed: AROMAPASSIONS_FEED, productId: "41943775168" },
  "aromapassions-glamorous": { feed: AROMAPASSIONS_FEED, productId: "41943775355" },
  "aromapassions-sparkle": { feed: AROMAPASSIONS_FEED, productId: "41943775224" },
  "aromapassions-admire": { feed: AROMAPASSIONS_FEED, productId: "41943775346" },
  "aromapassions-sensual": { feed: AROMAPASSIONS_FEED, productId: "41943775156" },
  "aromapassions-erotic": { feed: AROMAPASSIONS_FEED, productId: "41943775352" },
  "aromapassions-masculinity": { feed: AROMAPASSIONS_FEED, productId: "41943775357" },
  "aromapassions-mystical": { feed: AROMAPASSIONS_FEED, productId: "41943775371" },
  "aromapassions-blooming": { feed: AROMAPASSIONS_FEED, productId: "41943775162" },
  "aromapassions-revive": { feed: AROMAPASSIONS_FEED, productId: "41943775220" },
};

/* ── feed reading ──────────────────────────────────────────────────────────
 * A real CSV parse, not a split on commas: these feeds carry quoted fields
 * with embedded commas in the description, and a naive split silently shifts
 * every column after the first one that contains prose.
 */
function parseCsv(text) {
  const rows = [];
  let row = [];
  let cur = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          cur += '"';
          i++;
        } else quoted = false;
      } else cur += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") {
      row.push(cur);
      cur = "";
    } else if (c === "\n") {
      row.push(cur);
      rows.push(row);
      row = [];
      cur = "";
    } else if (c !== "\r") cur += c;
  }
  if (cur || row.length) {
    row.push(cur);
    rows.push(row);
  }
  return rows;
}

function loadFeed(path) {
  if (!existsSync(path)) {
    throw new Error(
      `fetch-dupe-images: feed not found at ${path}. Feeds are gitignored — ` +
        "re-download it from Awin, see scripts/feeds/README.md."
    );
  }
  const rows = parseCsv(readFileSync(path, "utf8"));
  const header = rows[0];
  return rows
    .slice(1)
    .filter((r) => r.length > 10)
    .map((r) => Object.fromEntries(header.map((k, i) => [k, r[i]])));
}

function extensionFor(url, contentType) {
  const fromUrl = extname(new URL(url).pathname).toLowerCase();
  if ([".jpg", ".jpeg", ".png", ".webp", ".avif"].includes(fromUrl)) return fromUrl;
  if (contentType?.includes("png")) return ".png";
  if (contentType?.includes("webp")) return ".webp";
  return ".jpg";
}

const EXTS = [".jpg", ".jpeg", ".png", ".webp", ".avif"];

const UA = "counterscent-feed-ingest/1.0 (+https://counterscent.com)";

/**
 * The merchant's CURRENT image for a product, read off its own Shopify page.
 *
 * A FEED'S IMAGE URL DECAYS LIKE EVERY OTHER FEED FIELD, and on 2026-09-04 all
 * fourteen AromaPassions rows proved it: every `merchant_image_url` in that
 * export returns 404, because the shop re-uploaded its photography and Shopify
 * CDN paths are content-addressed rather than stable. The prices and the stock
 * flags in the same rows were stale too. This is the same doctrine already
 * applied to those two — the feed is a snapshot, the merchant's own page is the
 * truth — extended to the one field that had not needed it yet.
 *
 * The licence is unaffected and that is the point: it rests on the affiliate
 * relationship, not on which of the merchant's own URLs the bytes came from.
 * This is still the enrolled merchant's own photograph of the exact product
 * whose id the affiliate link is built from.
 *
 * Only reachable for a feed row that carries a `merchant_deep_link` on the
 * merchant's own storefront; `.js` on a Shopify product URL returns its JSON.
 * Returns null rather than throwing, so a failure here is reported as a
 * failure rather than crashing the run.
 */
async function liveImageUrl(productUrl) {
  if (!productUrl) return null;
  try {
    const res = await fetch(`${productUrl.split("?")[0]}.js`, { headers: { "user-agent": UA } });
    if (!res.ok) return null;
    const json = await res.json();
    const found = json.featured_image ?? json.images?.[0];
    if (!found) return null;
    // Shopify returns protocol-relative URLs here (`//cdn.shopify.com/...`).
    return found.startsWith("//") ? `https:${found}` : found;
  } catch {
    return null;
  }
}

mkdirSync(OUT_DIR, { recursive: true });

const feeds = new Map();
const failures = [];
/** Slugs whose picture came from the live page because the feed's URL was dead. */
const rescued = [];
let fetched = 0;
let skipped = 0;

for (const [slug, { feed, productId }] of Object.entries(SOURCES)) {
  if (!feeds.has(feed)) feeds.set(feed, loadFeed(feed));
  const row = feeds.get(feed).find((r) => r.aw_product_id === productId);
  if (!row) {
    // Loud, not silent: a product id that is no longer in the feed usually
    // means the merchant delisted it, which also means the affiliate link
    // built from that same id is now dead.
    failures.push(`${slug}: product id ${productId} is not in ${feed}`);
    continue;
  }

  const already = EXTS.map((e) => resolve(OUT_DIR, `${slug}${e}`)).find((p) => existsSync(p));
  if (already && !FORCE) {
    skipped++;
    continue;
  }

  let url = row.merchant_image_url;
  let res = null;
  if (url) {
    try {
      res = await fetch(url, { headers: { "user-agent": UA } });
    } catch {
      res = null;
    }
  }

  // Feed image missing or dead -> ask the merchant's own product page. See
  // liveImageUrl above for why this is the same licence, not a looser one.
  if (!res?.ok) {
    const live = await liveImageUrl(row.merchant_deep_link);
    if (live) {
      try {
        const liveRes = await fetch(live, { headers: { "user-agent": UA } });
        if (liveRes.ok) {
          res = liveRes;
          url = live;
          rescued.push(slug);
        }
      } catch {
        /* fall through to the failure below */
      }
    }
  }

  if (!url) {
    failures.push(`${slug}: feed row ${productId} has no merchant_image_url and no live fallback`);
    continue;
  }

  try {
    if (!res?.ok) {
      failures.push(`${slug}: HTTP ${res ? res.status : "request failed"} (feed URL and live page both)`);
      continue;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 1024) {
      failures.push(`${slug}: suspiciously small (${buf.length} bytes)`);
      continue;
    }
    // Drop any earlier copy under a different extension first, so --force
    // cannot leave two files whose only difference is the extension the
    // manifest happens to pick up.
    for (const e of EXTS) {
      const p = resolve(OUT_DIR, `${slug}${e}`);
      if (existsSync(p)) unlinkSync(p);
    }
    writeFileSync(resolve(OUT_DIR, `${slug}${extensionFor(url, res.headers.get("content-type"))}`), buf);
    fetched++;
  } catch (err) {
    failures.push(`${slug}: ${err.message}`);
  }
}

/* ── stale files ───────────────────────────────────────────────────────────
 * Anything in the directory that SOURCES no longer claims is reported rather
 * than deleted. These files came from somewhere, and quietly removing them
 * would hide the fact that a listing lost its licensable image — which is
 * exactly the condition someone needs to know about.
 */
const known = new Set(Object.keys(SOURCES));
const orphans = readdirSync(OUT_DIR).filter((f) => !known.has(f.replace(extname(f), "")));

const manifest = {};
for (const slug of Object.keys(SOURCES)) {
  for (const ext of EXTS) {
    if (existsSync(resolve(OUT_DIR, `${slug}${ext}`))) {
      manifest[slug] = `/images/dupe/${slug}${ext}`;
      break;
    }
  }
}

writeFileSync(
  resolve(root, "lib", "data", "dupe-images.generated.ts"),
  `/**
 * GENERATED FILE — do not edit by hand.
 * Written by scripts/fetch-dupe-images.mjs. Maps a DUPES listing slug to the
 * locally-hosted copy of the merchant's product photograph.
 *
 * Every entry here is an image from a merchant whose affiliate programme we
 * are enrolled in AND whose links actually track, for a listing that carries a
 * real affiliateLinkId to that merchant. A listing absent from this map renders
 * the generated note-signature mark instead. See the script header for why the
 * licence is tied to the link rather than to the picture.
 *
 * Generated: ${new Date().toISOString()}
 * Images:    ${Object.keys(manifest).length}
 */

export const DUPE_IMAGES: Record<string, string> = ${JSON.stringify(manifest, null, 2)};
`,
  "utf8"
);

console.log(`fetch-dupe-images: ${fetched} downloaded, ${skipped} already present`);
console.log(`fetch-dupe-images: manifest lists ${Object.keys(manifest).length} images`);
if (rescued.length) {
  console.log(
    `fetch-dupe-images: ${rescued.length} image(s) came from the merchant's live product page ` +
      "because the feed's own merchant_image_url was dead — the feed has gone stale on imagery too:"
  );
  for (const r of rescued) console.log(`  ${r}`);
}
if (orphans.length) {
  console.log(
    `fetch-dupe-images: ${orphans.length} file(s) in public/images/dupe/ are not claimed by SOURCES ` +
      "— check where they came from before keeping them:"
  );
  for (const o of orphans) console.log(`  ${o}`);
}
if (failures.length) {
  console.log(`fetch-dupe-images: ${failures.length} failed`);
  for (const f of failures) console.log(`  ${f}`);
}
