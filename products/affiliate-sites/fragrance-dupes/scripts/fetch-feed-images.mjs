/**
 * Downloads merchant product images to public/images/fragrance/ so the site
 * serves them itself.
 *
 * WHY REHOST RATHER THAN HOTLINK — a privacy decision, not a performance one
 * ------------------------------------------------------------------------
 * The feed gives absolute URLs on the merchant's Shopify CDN. Rendering those
 * directly would make every visitor's browser fetch an asset from the
 * merchant's infrastructure, handing it their IP address, user agent, and a
 * Referer naming the exact page they were reading — on every page view, whether
 * or not they ever click through.
 *
 * This site deliberately runs cookieless GA4 with no consent banner precisely
 * because it collects nothing that would need one (see the root CLAUDE.md).
 * Silently leaking visitor requests to a commercial third party would undo
 * that, and would be invisible in the code that renders the image. Rehosting
 * keeps the promise the analytics setup already makes.
 *
 * It also removes a fragility: a merchant who reorganises their CDN breaks
 * every image on our site at once, and we would not know until someone looked.
 *
 * ONE IMAGE PER PRODUCT. The cap is two, but this feed carries exactly one —
 * `large_image`, `alternate_image` and the rest are empty on all 9,844 rows,
 * and there are 6,338 distinct images across 6,338 product pages. If a future
 * re-export includes alternates, raise MAX_IMAGES_PER_PRODUCT and re-run.
 *
 * Run: node scripts/fetch-feed-images.mjs [--force]
 * Existing files are skipped unless --force, so a re-run after a feed refresh
 * only fetches what is new.
 */

import { writeFileSync, mkdirSync, existsSync, readFileSync } from "node:fs";
import { dirname, resolve, extname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const OUT_DIR = resolve(root, "public", "images", "fragrance");
const OFFERS = resolve(root, "lib", "data", "merchant-offers.generated.ts");

const MAX_IMAGES_PER_PRODUCT = 2;
const FORCE = process.argv.includes("--force");

/** Read the generated offers without a TypeScript toolchain, the same way
 *  generate-redirects.mjs reads the affiliate map. Strict on purpose: a shape
 *  change should fail loudly, not silently download nothing. */
function readOffers() {
  const src = readFileSync(OFFERS, "utf8");
  const entries = [
    ...src.matchAll(
      /"([a-z0-9-]+)":\s*\{[^}]*?remoteImageUrl:\s*"([^"]+)"[^}]*?\}/g
    ),
  ];
  if (entries.length === 0) {
    throw new Error(
      "fetch-feed-images: found no offers in lib/data/merchant-offers.generated.ts. " +
        "Run scripts/ingest-feed.mjs first, or fix this parser if that file's shape changed."
    );
  }
  return entries.map(([, slug, url]) => ({ slug, urls: [url] }));
}

function extensionFor(url, contentType) {
  const fromUrl = extname(new URL(url).pathname).toLowerCase();
  if ([".jpg", ".jpeg", ".png", ".webp", ".avif"].includes(fromUrl)) return fromUrl;
  if (contentType?.includes("png")) return ".png";
  if (contentType?.includes("webp")) return ".webp";
  return ".jpg";
}

mkdirSync(OUT_DIR, { recursive: true });

const offers = readOffers();
let fetched = 0;
let skipped = 0;
const failures = [];

for (const { slug, urls } of offers) {
  for (const [i, url] of urls.slice(0, MAX_IMAGES_PER_PRODUCT).entries()) {
    const suffix = i === 0 ? "" : `-${i + 1}`;

    const already = [".jpg", ".jpeg", ".png", ".webp", ".avif"]
      .map((e) => resolve(OUT_DIR, `${slug}${suffix}${e}`))
      .find((p) => existsSync(p));
    if (already && !FORCE) {
      skipped++;
      continue;
    }

    try {
      const res = await fetch(url, {
        headers: { "user-agent": "counterscent-feed-ingest/1.0 (+https://counterscent.com)" },
      });
      if (!res.ok) {
        failures.push(`${slug}: HTTP ${res.status}`);
        continue;
      }
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 1024) {
        failures.push(`${slug}: suspiciously small (${buf.length} bytes)`);
        continue;
      }
      const ext = extensionFor(url, res.headers.get("content-type"));
      writeFileSync(resolve(OUT_DIR, `${slug}${suffix}${ext}`), buf);
      fetched++;
      if (fetched % 20 === 0) console.log(`  ...${fetched} downloaded`);
    } catch (err) {
      failures.push(`${slug}: ${err.message}`);
    }
  }
}

/* ── manifest ─────────────────────────────────────────────────────────────
 * The site needs the real on-disk filename, extension included, and only this
 * script knows it — the extension comes from the response, not the feed. So it
 * is written here rather than inferred at render time, where a wrong guess
 * would be a broken image nobody notices.
 */
const manifest = {};
for (const { slug } of offers) {
  for (const ext of [".jpg", ".jpeg", ".png", ".webp", ".avif"]) {
    if (existsSync(resolve(OUT_DIR, `${slug}${ext}`))) {
      manifest[slug] = `/images/fragrance/${slug}${ext}`;
      break;
    }
  }
}

const manifestFile = resolve(root, "lib", "data", "feed-images.generated.ts");
writeFileSync(
  manifestFile,
  `/**
 * GENERATED FILE — do not edit by hand.
 * Written by scripts/fetch-feed-images.mjs. Maps a reference slug to the
 * locally-hosted copy of the merchant's product photograph.
 *
 * These are licensed product images supplied through an affiliate feed — one
 * of exactly two lawful sources for perfume bottle imagery (the other being a
 * bottle we own and photograph). See lib/types.ts on ReferenceFragrance.imageUrl.
 *
 * Generated: ${new Date().toISOString()}
 * Images:    ${Object.keys(manifest).length}
 */

export const FEED_IMAGES: Record<string, string> = ${JSON.stringify(manifest, null, 2)};
`,
  "utf8"
);

console.log(`fetch-feed-images: ${fetched} downloaded, ${skipped} already present`);
console.log(`fetch-feed-images: manifest lists ${Object.keys(manifest).length} images`);
if (failures.length) {
  console.log(`fetch-feed-images: ${failures.length} failed`);
  for (const f of failures) console.log(`  ${f}`);
}
