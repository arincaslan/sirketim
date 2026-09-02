/**
 * Checks a list of candidate "Brand :: Name" pairs against the merchant feed,
 * using the same strict matcher as ingest-feed.mjs.
 *
 * WHY THIS EXISTS
 * ---------------
 * The catalog was expanded 68 -> 111 by choosing against merchant storefronts
 * rather than by house depth, after roughly 45 of 68 references turned out to
 * have no counterpart at any merchant we could sell through. A page for a
 * fragrance nobody stocks can never hold a listing or earn a commission.
 *
 * So: before authoring a note pyramid for a candidate, check the merchant
 * actually carries it. Authoring comes second, and only for survivors.
 *
 * Run: node scripts/check-candidates.mjs
 */

import { readFileSync, readdirSync } from "node:fs";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");

const norm = (s) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

function parseCsv(text) {
  const rows = [];
  let row = [], field = "", quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; } else quoted = false;
      } else field += c;
      continue;
    }
    if (c === '"') quoted = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
    else if (c !== "\r") field += c;
  }
  if (field !== "" || row.length) { row.push(field); rows.push(row); }
  const header = rows.shift();
  return rows.filter((r) => r.length === header.length)
    .map((r) => Object.fromEntries(header.map((h, i) => [h, r[i]])));
}

const ANCILLARY = [
  "gift set", "deodorant", "shower gel", "body lotion", "body wash", "balm",
  "hair mist", "shampoo", "candle", "soap", "refill", "rollerball", "roll on",
  "miniature", "body spray", "after shave", "aftershave", "shaving", "body oil",
  "travel", "duo set", "trio set", "discovery", "gel", "stick", "cream",
  "scrub", "air freshener", "pouch", "purse",
];

const feed = parseCsv(readFileSync(resolve(root, "scripts", "feeds", "my-perfume-shop.csv"), "utf8"));

/** Names already in the catalog, so we never propose a duplicate. */
const existing = new Set();
const housesDir = resolve(root, "lib", "data", "houses");
for (const f of readdirSync(housesDir).filter((x) => x.endsWith(".ts"))) {
  const src = readFileSync(join(housesDir, f), "utf8");
  for (const m of src.matchAll(/name:\s*"([^"]+)"/g)) existing.add(norm(m[1]));
}

const candidates = readFileSync(resolve(here, "candidates.txt"), "utf8")
  .split("\n")
  .map((l) => l.trim())
  .filter((l) => l && !l.startsWith("#"))
  .map((l) => {
    const [brand, name] = l.split("::").map((s) => s.trim());
    return { brand, name };
  });

let carried = 0, missing = 0, dupe = 0;
const found = [];

for (const c of candidates) {
  if (existing.has(norm(c.name))) {
    console.log(`  ALREADY  ${c.brand} :: ${c.name}`);
    dupe++;
    continue;
  }

  const brandTokens = norm(c.brand).split(" ").filter((t) => t.length > 1);
  const nameTokens = norm(c.name).split(" ").filter((t) => t.length > 1 && !brandTokens.includes(t));

  const hits = feed.filter((r) => {
    const t = norm(r.product_name).split(" ");
    if (!brandTokens.every((x) => t.includes(x))) return false;
    if (!nameTokens.every((x) => t.includes(x))) return false;
    const low = norm(r.product_name);
    return !ANCILLARY.some((a) => low.includes(a));
  });

  if (hits.length) {
    const prices = hits.map((h) => Number.parseFloat(h.search_price)).filter(Number.isFinite);
    console.log(
      `  CARRIED  ${c.brand} :: ${c.name}  (${hits.length} rows, $${Math.min(...prices)}-$${Math.max(...prices)})  e.g. "${hits[0].product_name}"`
    );
    found.push(c);
    carried++;
  } else {
    console.log(`  --       ${c.brand} :: ${c.name}`);
    missing++;
  }
}

console.log(`\ncarried ${carried} · not carried ${missing} · already in catalog ${dupe}`);
