/**
 * Downloads Perfumania.com product photography to public/images/fragrance-pm/
 * and writes lib/data/pm-images.generated.ts.
 *
 * Reads lib/data/pm-offers.generated.ts, so run scripts/ingest-perfumania.mjs first.
 *
 * BY DEFAULT THIS FETCHES ONLY THE GAPS, AND THAT IS THE POINT
 * ------------------------------------------------------------
 * Perfumania stocks 123 of our 216 references, but we already hold a
 * photograph for all but a handful of them - FragranceShop (CJ 16941446) and
 * My Perfume Shop between them cover 190. Downloading all 123 would duplicate
 * ~117 pictures we already serve, for no gain: both CJ programmes are live, so
 * neither copy sits on firmer licensing ground than the other.
 *
 * The reason fetch-cj-images.mjs DOES duplicate is specific to that case - it
 * was moving images off the CLOSED My Perfume Shop programme onto a live one,
 * which is a licensing upgrade. There is no equivalent upgrade here.
 *
 * Pass --all to fetch every matched reference anyway. The honest use for it is
 * a second copy against FragranceShop's programme closing, which is
 * speculative, so it is not the default.
 *
 * WHY THIS DOES NOT SHELL OUT TO curl
 * -----------------------------------
 * fetch-cj-images.mjs must use curl because fragranceshop.com blocks on the
 * client's TLS fingerprint and Node's undici gets a 403 no matter what headers
 * it sends. Perfumania serves its images from Shopify's CDN, which has no such
 * WAF - measured 2026-09-09, node fetch returns 200 on the same URL curl does.
 * Do not copy the curl machinery over here; it would be cargo cult.
 *
 * THE ACCEPT HEADER IS LOAD-BEARING, NOT BOILERPLATE
 * --------------------------------------------------
 * Several of this merchant's masters are 2000x2000 PNGs of ~1.9 MB. The
 * existing fragrance-cj corpus averages 33 KB and peaks at 148 KB, so shipping
 * those raw would be a 13x page-weight regression on exactly the pages we just
 * fixed. Shopify's CDN does content negotiation, and it is the ONLY lever that
 * works here - measured on the same 1,953 KB PNG:
 *
 *   no Accept header ............................ 1,953 KB image/png
 *   ?width=900 .................................. 1,283 KB image/png
 *   ?format=jpg / ?fm=jpg / _900x in the path ... 1,283 KB image/png  (ignored)
 *   .png -> .jpg in the path .................... 404
 *   Accept: image/webp ..........................   145 KB image/webp
 *
 * So the format parameters Shopify documents elsewhere do nothing on this
 * endpoint and the Accept header does everything. There is no local re-encode
 * fallback because this project has no image library installed (no sharp, no
 * PIL, no ImageMagick) and adding one to save six files is not worth it.
 *
 * LICENSING. These are licensed product images supplied under a live affiliate
 * relationship (CJ advertiser 17335854, approved) - one of exactly two lawful
 * sources for perfume bottle imagery, the other being a bottle we own and
 * photograph. The licence rides on the affiliate relationship, not on the
 * picture, so if that programme ever closes these images are on the same
 * weakened footing the My Perfume Shop ones are.
 *
 * Run: node scripts/fetch-pm-images.mjs [--all] [--force]
 *   --all    fetch every matched reference, not just the ones we lack
 *   --force  re-download files that already exist
 */

import { writeFileSync, mkdirSync, existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, resolve, extname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");

const OUT_DIR = resolve(root, "public", "images", "fragrance-pm");
const OFFERS = resolve(root, "lib", "data", "pm-offers.generated.ts");
const MANIFEST = resolve(root, "lib", "data", "pm-images.generated.ts");
const CJ_IMAGES_FILE = resolve(root, "lib", "data", "cj-images.generated.ts");
const FEED_IMAGES_FILE = resolve(root, "lib", "data", "feed-images.generated.ts");

const ALL = process.argv.includes("--all");
const FORCE = process.argv.includes("--force");
const EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".avif"];

/** Slugs already covered by an existing manifest, so we know what "a gap" is. */
function slugsIn(file) {
  if (!existsSync(file)) return new Set();
  const src = readFileSync(file, "utf8");
  const body = src.slice(src.indexOf("= {"));
  return new Set([...body.matchAll(/^\s*"([^"]+)":\s*"/gm)].map((m) => m[1]));
}

/** Offers, parsed out of the generated TypeScript. Same reason as the ingest:
 *  these are .mjs scripts and the data is .ts, with no build step in between. */
function loadOffers() {
  if (!existsSync(OFFERS)) {
    throw new Error(
      "fetch-pm-images: lib/data/pm-offers.generated.ts is missing. Run " +
        "scripts/ingest-perfumania.mjs first."
    );
  }
  const src = readFileSync(OFFERS, "utf8");
  const body = src.slice(src.indexOf("export const PM_OFFERS"));
  const offers = [];
  for (const m of body.matchAll(/^ {2}"([^"]+)":\s*\{([\s\S]*?)^ {2}\},$/gm)) {
    const [, slug, block] = m;
    const pick = (re) => block.match(re)?.[1];
    const url = pick(/remoteImageUrl:\s*"([^"]+)"/);
    offers.push({
      slug,
      title: pick(/title:\s*"([^"]*)"/) ?? "",
      remoteImageUrl: url ?? null, // a literal null means "no image", never a placeholder
      width: Number(pick(/imageWidth:\s*(\d+)/) ?? 0) || null,
      height: Number(pick(/imageHeight:\s*(\d+)/) ?? 0) || null,
    });
  }
  if (!offers.length) {
    throw new Error(
      "fetch-pm-images: parsed zero offers out of pm-offers.generated.ts. The shape of " +
        "that file changed - fix this parser rather than writing an empty manifest."
    );
  }
  return offers;
}

function existingFileFor(slug) {
  for (const ext of EXTENSIONS) {
    if (existsSync(resolve(OUT_DIR, `${slug}${ext}`))) return `${slug}${ext}`;
  }
  return null;
}

function extensionFor(url, contentType) {
  const fromType = { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp", "image/avif": ".avif" }[
    String(contentType).split(";")[0].trim()
  ];
  if (fromType) return fromType;
  const fromUrl = extname(new URL(url).pathname).toLowerCase();
  return EXTENSIONS.includes(fromUrl) ? fromUrl : ".jpg";
}

/* ------------------------------------------------------------------- main */

mkdirSync(OUT_DIR, { recursive: true });

const offers = loadOffers();
const alreadyHave = new Set([...slugsIn(CJ_IMAGES_FILE), ...slugsIn(FEED_IMAGES_FILE)]);

const wanted = offers.filter((o) => {
  if (!o.remoteImageUrl) return false;
  return ALL || !alreadyHave.has(o.slug);
});

console.log(
  `${offers.length} offers, ${alreadyHave.size} slugs already pictured elsewhere -> ` +
    `fetching ${wanted.length}${ALL ? " (--all)" : " gap(s)"}\n`
);

const manifest = {};
const small = [];
let downloaded = 0;
let skipped = 0;
const failures = [];

for (const offer of wanted) {
  const existing = existingFileFor(offer.slug);
  if (existing && !FORCE) {
    manifest[offer.slug] = `/images/fragrance-pm/${existing}`;
    skipped += 1;
    continue;
  }
  try {
    const res = await fetch(offer.remoteImageUrl, {
      headers: {
        "user-agent": "Mozilla/5.0 (compatible; counterscent-images/1.0)",
        // See the header: this is what turns a 1.9 MB PNG into a 145 KB WebP.
        accept: "image/webp,image/avif,image/jpeg,image/png,*/*",
      },
    });
    if (!res.ok) {
      failures.push(`${offer.slug}: HTTP ${res.status}`);
      continue;
    }
    const bytes = Buffer.from(await res.arrayBuffer());
    if (bytes.length < 1024) {
      failures.push(`${offer.slug}: ${bytes.length} bytes, too small to be a photograph`);
      continue;
    }
    const file = `${offer.slug}${extensionFor(offer.remoteImageUrl, res.headers.get("content-type"))}`;
    writeFileSync(resolve(OUT_DIR, file), bytes);
    manifest[offer.slug] = `/images/fragrance-pm/${file}`;
    downloaded += 1;
    // Most of this merchant's photography is 1200-2048px. A small master cannot be
    // upscaled, so it is reported rather than silently shipped at poor quality.
    if (offer.width && offer.width < 600) {
      small.push(`${offer.slug} (${offer.width}x${offer.height})`);
    }
    console.log(`  + ${offer.slug.padEnd(24)} ${String(bytes.length).padStart(8)} B  ${offer.width}x${offer.height}`);
  } catch (err) {
    failures.push(`${offer.slug}: ${err.message}`);
  }
}

// Keep any file already on disk that this run did not touch, so a gap-only run
// does not drop entries a previous --all run wrote.
for (const file of readdirSync(OUT_DIR)) {
  const slug = file.replace(extname(file), "");
  if (!manifest[slug] && EXTENSIONS.includes(extname(file))) {
    manifest[slug] = `/images/fragrance-pm/${file}`;
  }
}

const entries = Object.keys(manifest).sort();
writeFileSync(
  MANIFEST,
  `/**
 * GENERATED FILE - do not edit by hand.
 * Written by scripts/fetch-pm-images.mjs. Maps a reference slug to the
 * locally-hosted copy of Perfumania.com's product photograph.
 *
 * Licensed product images supplied under a live affiliate relationship
 * (CJ advertiser 17335854). The licence rides on the affiliate relationship,
 * not on the picture - see lib/types.ts on ReferenceFragrance.imageUrl.
 *
 * These exist to fill gaps the FragranceShop and My Perfume Shop feeds cannot:
 * houses FragranceShop does not carry at all. lib/data/references.ts resolves
 * CJ_IMAGES first, then these, then FEED_IMAGES.
 *
 * Generated: ${new Date().toISOString()}
 * Images:    ${entries.length}
 */

export const PM_IMAGES: Record<string, string> = {
${entries.map((s) => `  "${s}": "${manifest[s]}",`).join("\n")}
};
`,
  "utf8"
);

console.log(`
downloaded ${downloaded}, skipped ${skipped} already on disk, ${failures.length} failed
manifest   ${entries.length} entries -> lib/data/pm-images.generated.ts`);
if (small.length) {
  console.log(`
LOW-RESOLUTION MASTERS (cannot be upscaled - decide before shipping):
${small.map((s) => `  ${s}`).join("\n")}`);
}
if (failures.length) {
  console.log(`
FAILED:
${failures.map((f) => `  ${f}`).join("\n")}`);
}
