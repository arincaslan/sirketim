/**
 * Downloads FragranceShop.com product photography to public/images/fragrance-cj/
 * so the site serves it itself.
 *
 * WHY A SECOND IMAGE DIRECTORY RATHER THAN REUSING fragrance/
 * -----------------------------------------------------------
 * The existing public/images/fragrance/ holds 156 photographs from the My
 * Perfume Shop Awin feed. That programme went CLOSED for tracking on
 * 2026-09-01, and this project's rule is that **the licence rides on the
 * affiliate relationship, not on the picture** — so those images are on weaker
 * footing than any taken from a live programme, and the project CLAUDE.md
 * already flags re-sourcing them as an open question.
 *
 * Writing CJ images into the same directory under the same slug would silently
 * overwrite one merchant's licensed asset with another's and leave nothing on
 * disk to say which is which. A separate directory plus a separate manifest
 * means the provenance of every rendered image is readable from its path, and
 * dropping a merchant is deleting one folder rather than an archaeology
 * exercise.
 *
 * 82 of these duplicate a fragrance we already have a My Perfume Shop photo
 * of. That duplication is the point: it is what lets lib/data/references.ts
 * prefer the live-programme copy while the dead-programme one stays available
 * for the 56 fragrances CJ does not stock.
 *
 * WHAT IS NOT DOWNLOADED
 * ----------------------
 * Rows whose only image was one of this merchant's four shared stock
 * photographs. scripts/ingest-cj-feed.mjs already nulls those out, so a
 * `remoteImageUrl: null` here means "no image", never "fetch a placeholder".
 *
 * Run: node scripts/fetch-cj-images.mjs [--force]
 * Existing files are skipped unless --force.
 */

import { writeFileSync, mkdirSync, existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, resolve, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const OUT_DIR = resolve(root, "public", "images", "fragrance-cj");
const OFFERS = resolve(root, "lib", "data", "cj-offers.generated.ts");
const LINKS = resolve(root, "lib", "data", "cj-links.generated.ts");
const MANIFEST = resolve(root, "lib", "data", "cj-images.generated.ts");

const FORCE = process.argv.includes("--force");
const EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".avif"];

/**
 * THIS SCRIPT SHELLS OUT TO curl, AND THAT IS NOT AN ARBITRARY CHOICE.
 *
 * fragranceshop.com sits behind a WAF that blocks on the client's **TLS
 * fingerprint**, not on anything in the request. Measured 2026-09-07 against
 * the same image URL, seconds apart:
 *
 *   curl, ingest UA .................. 200, 12,435 bytes
 *   node fetch, ingest UA ............ 403
 *   node fetch, real Chrome UA ....... 403
 *   node fetch, no headers ........... 403
 *
 * So no combination of User-Agent, Accept or Referer gets Node's undici
 * through, and every one of the 100 images fails. The first read of this was
 * "rate limiting", because a single hand-run curl succeeded while the batch
 * did not — that was wrong, and it cost a wasted backoff-and-retry pass. There
 * is no delay in here for that reason: curl fetches all 100 back to back
 * without a single refusal.
 *
 * curl is present on both of this project's machines (Git Bash ships it, and
 * Windows 10+ has curl.exe in System32), so the dependency is safe here. If it
 * ever is not, the fix is a TLS-fingerprint-mimicking client, NOT more retries.
 */
const CURL_UA = "counterscent-feed-ingest/1.0 (+https://counterscent.com)";

/** Strict on purpose: a shape change should fail loudly, not silently download
 *  nothing and then rewrite the manifest as empty. */
function readOffers() {
  const src = readFileSync(OFFERS, "utf8");
  const entries = [
    ...src.matchAll(
      /^  "([a-z0-9-]+)": \{[\s\S]*?remoteImageUrl: (?:"([^"]+)"|null)/gm
    ),
  ];
  if (entries.length === 0) {
    throw new Error(
      "fetch-cj-images: found no offers in lib/data/cj-offers.generated.ts. " +
        "Run scripts/ingest-cj-feed.mjs first, or fix this parser if that file's shape changed."
    );
  }
  return entries
    .filter(([, , url]) => Boolean(url))
    .map(([, slug, url]) => ({ slug, url }));
}

/**
 * The licence rides on the affiliate relationship, so an image is only taken
 * for a fragrance we actually hold a live tracking link to. Asserted rather
 * than assumed — if the ingest ever emits an offer without a link, this is
 * where it should stop, not after the bytes are on disk.
 */
function linkedSlugs() {
  const src = readFileSync(LINKS, "utf8");
  return new Set([...src.matchAll(/^  "original-([a-z0-9-]+)": \{/gm)].map((m) => m[1]));
}

/**
 * One GET via curl, returning the status, content type and raw bytes.
 *
 * The status and content type come back on stderr via `-w`, so they cannot
 * corrupt the image on stdout. `maxBuffer` is generous because these are
 * photographs, and `encoding: "buffer"` is required — the default would decode
 * the bytes as UTF-8 and silently mangle every file.
 */
function curlGet(url) {
  const res = spawnSync(
    "curl",
    [
      "-sS",
      "--max-time", "30",
      "-A", CURL_UA,
      "-H", "Accept: image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
      "-H", "Referer: https://www.fragranceshop.com/",
      "-w", "%{stderr}%{http_code} %{content_type}",
      url,
    ],
    { encoding: "buffer", maxBuffer: 64 * 1024 * 1024 }
  );
  if (res.error) throw res.error;
  const meta = res.stderr.toString("utf8").trim().split(/\s+/);
  return {
    status: Number.parseInt(meta[0], 10),
    contentType: meta[1] ?? "",
    body: res.stdout,
  };
}

function extensionFor(url, contentType) {
  const fromUrl = extname(new URL(url).pathname).toLowerCase();
  if (EXTENSIONS.includes(fromUrl)) return fromUrl;
  if (contentType?.includes("png")) return ".png";
  if (contentType?.includes("webp")) return ".webp";
  return ".jpg";
}

mkdirSync(OUT_DIR, { recursive: true });

const offers = readOffers();
const linked = linkedSlugs();

const unlinked = offers.filter((o) => !linked.has(o.slug));
if (unlinked.length) {
  throw new Error(
    `fetch-cj-images: ${unlinked.length} offer(s) have an image but no affiliate link ` +
      `(${unlinked.map((o) => o.slug).join(", ")}). The licence to host a merchant's ` +
      "photograph rides on the affiliate relationship — fix the ingest rather than " +
      "hosting an image we have no standing to use."
  );
}

let fetched = 0;
let skipped = 0;
const failures = [];

for (const { slug, url } of offers) {
  const already = EXTENSIONS.map((e) => resolve(OUT_DIR, `${slug}${e}`)).find((p) =>
    existsSync(p)
  );
  if (already && !FORCE) {
    skipped++;
    continue;
  }

  try {
    const { status, contentType, body } = curlGet(url);
    if (status !== 200) {
      failures.push(`${slug}: HTTP ${status}`);
      continue;
    }
    // A feed's image URLs decay — CDN paths are content-addressed, so one
    // re-upload 404s the lot. A tiny body is usually an error page served with
    // a 200, which would otherwise land on disk as a broken image.
    if (body.length < 1024) {
      failures.push(`${slug}: suspiciously small (${body.length} bytes)`);
      continue;
    }
    writeFileSync(resolve(OUT_DIR, `${slug}${extensionFor(url, contentType)}`), body);
    fetched++;
    if (fetched % 20 === 0) console.log(`  ...${fetched} downloaded`);
  } catch (err) {
    failures.push(`${slug}: ${err.message}`);
  }
}

/* ── shop-only products ───────────────────────────────────────────────────── */

/**
 * The buy-link scope holds products that are NOT fragrances in our catalogue,
 * so they have no reference slug and their photographs go in their own
 * directory keyed by the merchant's product-path id. Same licence basis: each
 * carries a live `shop-<slug>` affiliate link to the merchant whose photograph
 * it is.
 */
const SHOP = resolve(root, "lib", "data", "cj-shop.generated.ts");
const SHOP_DIR = resolve(root, "public", "images", "originals");
const SHOP_MANIFEST = resolve(root, "lib", "data", "cj-shop-images.generated.ts");

function readShop() {
  if (!existsSync(SHOP)) return [];
  const src = readFileSync(SHOP, "utf8");
  return [
    ...src.matchAll(
      /slug: "([a-z0-9-]+)",[\s\S]*?remoteImageUrl: (?:"([^"]+)"|null),[\s\S]*?referenceSlug: (?:"([a-z0-9-]+)"|null),/g
    ),
  ]
    // Products that ARE references already have their photograph in
    // fragrance-cj/ under the reference slug; don't fetch a second copy.
    .filter(([, , url, refSlug]) => Boolean(url) && !refSlug)
    .map(([, slug, url]) => ({ slug, url }));
}

const shop = readShop();
mkdirSync(SHOP_DIR, { recursive: true });
let shopFetched = 0;
let shopSkipped = 0;

for (const { slug, url } of shop) {
  const already = EXTENSIONS.map((e) => resolve(SHOP_DIR, `${slug}${e}`)).find((p) =>
    existsSync(p)
  );
  if (already && !FORCE) {
    shopSkipped++;
    continue;
  }
  try {
    const { status, contentType, body } = curlGet(url);
    if (status !== 200) {
      failures.push(`shop/${slug}: HTTP ${status}`);
      continue;
    }
    if (body.length < 1024) {
      failures.push(`shop/${slug}: suspiciously small (${body.length} bytes)`);
      continue;
    }
    writeFileSync(resolve(SHOP_DIR, `${slug}${extensionFor(url, contentType)}`), body);
    shopFetched++;
    if (shopFetched % 20 === 0) console.log(`  ...${shopFetched} shop images downloaded`);
  } catch (err) {
    failures.push(`shop/${slug}: ${err.message}`);
  }
}

const shopManifest = {};
for (const { slug } of shop) {
  for (const ext of EXTENSIONS) {
    if (existsSync(resolve(SHOP_DIR, `${slug}${ext}`))) {
      shopManifest[slug] = `/images/originals/${slug}${ext}`;
      break;
    }
  }
}

writeFileSync(
  SHOP_MANIFEST,
  `/**
 * GENERATED FILE — do not edit by hand.
 * Written by scripts/fetch-cj-images.mjs. Maps a SHOP product slug (the
 * merchant's own product-path id) to the locally-hosted copy of its
 * photograph. See cj-shop.generated.ts — these are not reference fragrances.
 *
 * Generated: ${new Date().toISOString()}
 * Images:    ${Object.keys(shopManifest).length} of ${shop.length}
 */

export const SHOP_IMAGES: Record<string, string> = ${JSON.stringify(shopManifest, null, 2)};
`,
  "utf8"
);
console.log(`fetch-cj-images: shop — ${shopFetched} downloaded, ${shopSkipped} already present, manifest lists ${Object.keys(shopManifest).length}`);

/* Files this run did not claim. The commonest cause is a good one: a shop
 * product became a REFERENCE, so its photograph moved to fragrance-cj/ under
 * the reference slug and the copy here is now a duplicate. Reported rather
 * than deleted, the same posture as scripts/fetch-dupe-images.mjs — an
 * unexpected orphan should be visible, not silently removed. */
const claimed = new Set(Object.keys(shopManifest).map((s) => s));
const orphans = readdirSync(SHOP_DIR).filter(
  (f) => !claimed.has(f.replace(/\.[a-z0-9]+$/i, ""))
);
if (orphans.length) {
  console.log(
    `fetch-cj-images: ${orphans.length} file(s) in public/images/originals/ are no longer ` +
      "referenced — usually because the product became a catalogue reference and its image " +
      "now lives in fragrance-cj/. Delete them once you have checked:"
  );
  for (const f of orphans) console.log(`  ${f}`);
}

/* The manifest records the real on-disk filename, extension included — only
 * this script knows it, because the extension comes from the response rather
 * than the feed. Inferring it at render time would be a broken image nobody
 * notices. */
const manifest = {};
for (const { slug } of offers) {
  for (const ext of EXTENSIONS) {
    if (existsSync(resolve(OUT_DIR, `${slug}${ext}`))) {
      manifest[slug] = `/images/fragrance-cj/${slug}${ext}`;
      break;
    }
  }
}

writeFileSync(
  MANIFEST,
  `/**
 * GENERATED FILE — do not edit by hand.
 * Written by scripts/fetch-cj-images.mjs. Maps a reference slug to the
 * locally-hosted copy of FragranceShop.com's product photograph.
 *
 * These are licensed product images supplied through an affiliate feed — one
 * of exactly two lawful sources for perfume bottle imagery (the other being a
 * bottle we own and photograph). See lib/types.ts on ReferenceFragrance.imageUrl.
 *
 * Unlike FEED_IMAGES, these come from a programme that is CURRENTLY TRACKING,
 * which is why lib/data/references.ts prefers them. See the header of the
 * fetch script for why they live in their own directory.
 *
 * Generated: ${new Date().toISOString()}
 * Images:    ${Object.keys(manifest).length}
 */

export const CJ_IMAGES: Record<string, string> = ${JSON.stringify(manifest, null, 2)};
`,
  "utf8"
);

console.log(`fetch-cj-images: ${fetched} downloaded, ${skipped} already present`);
console.log(`fetch-cj-images: manifest lists ${Object.keys(manifest).length} images`);
if (failures.length) {
  console.log(`fetch-cj-images: ${failures.length} failed`);
  for (const f of failures) console.log(`  ${f}`);
}
