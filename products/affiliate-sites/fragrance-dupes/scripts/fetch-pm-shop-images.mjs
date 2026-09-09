/**
 * Downloads Perfumania.com photography for the /originals SHOP surface into
 * public/images/originals-pm/, and writes lib/data/pm-shop-images.generated.ts.
 *
 * Reads lib/data/pm-shop.generated.ts, so run scripts/ingest-perfumania.mjs first.
 *
 * SEPARATE FROM fetch-pm-images.mjs ON PURPOSE. That one fills gaps in the
 * RESEARCHED reference catalogue and is keyed by reference slug; this one covers
 * shop products keyed by the merchant's own handle. Same split, same reason, as
 * fetch-cj-images.mjs versus the shop images beside it: the provenance of every
 * rendered image should be readable from its path, and dropping a surface should
 * be deleting one folder.
 *
 * Products that ARE one of our references are skipped - their photograph already
 * exists under the reference slug, and getShopOriginalsByBrand() looks it up
 * there rather than here.
 *
 * The Accept header is load-bearing here too: this merchant's masters run to
 * 2000x2000 PNGs of ~1.9 MB, and Shopify's documented format parameters are all
 * ignored on this endpoint. Content negotiation is the only lever that works.
 * Measurements are in fetch-pm-images.mjs.
 *
 * LICENSING. Licensed product images supplied under a live affiliate
 * relationship (CJ advertiser 17335854). The licence rides on the affiliate
 * relationship, not on the picture.
 *
 * Run: node scripts/fetch-pm-shop-images.mjs [--force]
 */

import { writeFileSync, mkdirSync, existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, resolve, extname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");

const OUT_DIR = resolve(root, "public", "images", "originals-pm");
const SHOP = resolve(root, "lib", "data", "pm-shop.generated.ts");
const MANIFEST = resolve(root, "lib", "data", "pm-shop-images.generated.ts");

const FORCE = process.argv.includes("--force");
const EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".avif"];

/** Shop rows, parsed out of the generated TypeScript. Same reason as the
 *  ingest: these are .mjs scripts and the data is .ts, with no build step. */
function loadShop() {
  if (!existsSync(SHOP)) {
    throw new Error(
      "fetch-pm-shop-images: lib/data/pm-shop.generated.ts is missing. Run " +
        "scripts/ingest-perfumania.mjs first."
    );
  }
  const src = readFileSync(SHOP, "utf8");
  const body = src.slice(src.indexOf("export const PM_SHOP_ORIGINALS"));
  const rows = [];
  for (const m of body.matchAll(/^ {2}\{([\s\S]*?)^ {2}\},$/gm)) {
    const block = m[1];
    const pick = (re) => block.match(re)?.[1];
    rows.push({
      slug: pick(/slug:\s*"([^"]+)"/),
      name: pick(/name:\s*"([^"]*)"/) ?? "",
      // A literal null means "no image", never a placeholder.
      remoteImageUrl: pick(/remoteImageUrl:\s*"([^"]+)"/) ?? null,
      referenceSlug: pick(/referenceSlug:\s*"([^"]+)"/) ?? null,
    });
  }
  if (!rows.length) {
    throw new Error(
      "fetch-pm-shop-images: parsed zero rows out of pm-shop.generated.ts. The shape " +
        "of that file changed - fix this parser rather than writing an empty manifest."
    );
  }
  return rows;
}

function existingFileFor(slug) {
  for (const ext of EXTENSIONS) {
    if (existsSync(resolve(OUT_DIR, `${slug}${ext}`))) return `${slug}${ext}`;
  }
  return null;
}

function extensionFor(url, contentType) {
  const fromType = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/avif": ".avif",
  }[String(contentType).split(";")[0].trim()];
  if (fromType) return fromType;
  const fromUrl = extname(new URL(url).pathname).toLowerCase();
  return EXTENSIONS.includes(fromUrl) ? fromUrl : ".jpg";
}

/* ------------------------------------------------------------------- main */

mkdirSync(OUT_DIR, { recursive: true });

const rows = loadShop();
// A reference-backed product already has its photograph under the reference
// slug; fetching it again here would put the same picture on disk twice under
// two names, with nothing to say which surface owns it.
const wanted = rows.filter((r) => r.remoteImageUrl && !r.referenceSlug);

console.log(
  `${rows.length} shop products, ${rows.length - wanted.length} already pictured as ` +
    `references -> fetching ${wanted.length}\n`
);

const manifest = {};
let downloaded = 0;
let skipped = 0;
let bytes = 0;
const failures = [];

for (const row of wanted) {
  const existing = existingFileFor(row.slug);
  if (existing && !FORCE) {
    manifest[row.slug] = `/images/originals-pm/${existing}`;
    skipped += 1;
    continue;
  }
  try {
    const res = await fetch(row.remoteImageUrl, {
      headers: {
        "user-agent": "Mozilla/5.0 (compatible; counterscent-images/1.0)",
        // Turns ~1.9 MB PNG masters into ~150 KB WebP. See the header.
        accept: "image/webp,image/avif,image/jpeg,image/png,*/*",
      },
    });
    if (!res.ok) {
      failures.push(`${row.slug}: HTTP ${res.status}`);
      continue;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 1024) {
      failures.push(`${row.slug}: ${buf.length} bytes, too small to be a photograph`);
      continue;
    }
    const file = `${row.slug}${extensionFor(row.remoteImageUrl, res.headers.get("content-type"))}`;
    writeFileSync(resolve(OUT_DIR, file), buf);
    manifest[row.slug] = `/images/originals-pm/${file}`;
    downloaded += 1;
    bytes += buf.length;
  } catch (err) {
    failures.push(`${row.slug}: ${err.message}`);
  }
}

// Keep anything already on disk that this run did not touch.
for (const file of readdirSync(OUT_DIR)) {
  const slug = file.replace(extname(file), "");
  if (!manifest[slug] && EXTENSIONS.includes(extname(file))) {
    manifest[slug] = `/images/originals-pm/${file}`;
  }
}

const entries = Object.keys(manifest).sort();
writeFileSync(
  MANIFEST,
  `/**
 * GENERATED FILE - do not edit by hand.
 * Written by scripts/fetch-pm-shop-images.mjs. Maps a Perfumania product handle
 * to the locally-hosted copy of that shop product's photograph.
 *
 * Licensed product images supplied under a live affiliate relationship
 * (CJ advertiser 17335854). Keyed by the MERCHANT'S handle, not a reference
 * slug - these are shop products we have not researched. Reference-backed
 * products are absent here on purpose; their picture lives in PM_IMAGES.
 *
 * Generated: ${new Date().toISOString()}
 * Images:    ${entries.length}
 */

export const PM_SHOP_IMAGES: Record<string, string> = {
${entries.map((s) => `  "${s}": "${manifest[s]}",`).join("\n")}
};
`,
  "utf8"
);

console.log(
  `downloaded ${downloaded} (${(bytes / 1024 / 1024).toFixed(1)} MB), ` +
    `skipped ${skipped}, ${failures.length} failed`
);
console.log(`manifest   ${entries.length} entries -> lib/data/pm-shop-images.generated.ts`);
if (failures.length) {
  console.log(`\nFAILED:\n${failures.map((f) => `  ${f}`).join("\n")}`);
}
