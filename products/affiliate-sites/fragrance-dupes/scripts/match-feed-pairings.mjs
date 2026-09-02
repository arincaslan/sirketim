/**
 * Finds candidate dupe→original pairings by cross-matching the reference
 * catalog against what a merchant feed actually says.
 *
 * WHY THIS EXISTS
 * ---------------
 * The pairing — "this bottle is an alternative to that one" — is the claim every
 * other number on a comparison page depends on. Writing pairings from memory is
 * how this project previously ended up publishing products that did not exist,
 * so the standing rule is that a pairing needs a source.
 *
 * It turns out most of them have one. Retailers say it themselves: Opulensi
 * sells Barakkat Rouge 540 at a URL ending `inspired-by-baccarat-rouge-540` and
 * describes Bint Hooran as `Inspired by "Good Girl"`. This script finds every
 * row where the feed names a fragrance that is already in REFERENCES, and
 * reports it with the surrounding sentence so a human can judge the claim.
 *
 * IT PROPOSES, IT DOES NOT DECIDE. Output is a candidate list to be read, not
 * data to be imported. Three things it cannot judge and a human must:
 *   - Whether the sentence actually claims a pairing ("inspired by X") or just
 *     mentions X in passing ("unlike X", "for fans of X and Y").
 *   - Whether the retailer's own note list supports the claim. It sometimes
 *     does not — see Bint Hooran in lib/dupes-data.ts.
 *   - Whether the product is in stock, which the feed gets wrong constantly.
 *
 * FALSE POSITIVES ARE THE MAIN RISK and short names are why. The catalog
 * contains "Y", "Angel", "Chance", "Her", "Dune", "Legend", "Libre" — words
 * that appear in ordinary marketing prose. Matching is therefore restricted to
 * names that are either long enough to be distinctive, or accompanied by their
 * brand name nearby. Even so, read the quoted sentence before believing a row.
 *
 * Run: node scripts/match-feed-pairings.mjs [--feed opulensi] [--all]
 *   --all  also lists weak/ambiguous matches, which are excluded by default.
 */

import { readFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");

const feedArg = process.argv.includes("--feed")
  ? process.argv[process.argv.indexOf("--feed") + 1]
  : "opulensi";
const SHOW_ALL = process.argv.includes("--all");
const FEED = resolve(here, "feeds", `${feedArg}.csv`);

/* ── CSV ──────────────────────────────────────────────────────────────── */
function parseCsv(text) {
  const rows = [];
  let row = [], cur = "", quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') { cur += '"'; i++; } else quoted = false;
      } else cur += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") { row.push(cur); cur = ""; }
    else if (c === "\n") { row.push(cur); rows.push(row); row = []; cur = ""; }
    else if (c !== "\r") cur += c;
  }
  if (cur || row.length) { row.push(cur); rows.push(row); }
  return rows;
}

if (!existsSync(FEED)) {
  throw new Error(
    `match-feed-pairings: no feed at ${FEED}. Feeds are gitignored — re-download ` +
      "from Awin, see scripts/feeds/README.md."
  );
}
const rows = parseCsv(readFileSync(FEED, "utf8"));
const header = rows[0];
const recs = rows.slice(1).filter((r) => r.length > 10)
  .map((r) => Object.fromEntries(header.map((k, i) => [k, r[i]])));

/* ── the reference catalog, read as text ──────────────────────────────── */
/** Read name/brand/slug out of lib/data/houses/*.ts without a TS toolchain,
 *  the same way generate-redirects.mjs reads the affiliate map. */
function readReferences() {
  const src = readFileSync(resolve(root, "lib", "data", "references.ts"), "utf8");
  const files = [...src.matchAll(/from "@\/lib\/data\/houses\/([a-z0-9-]+)"/g)].map((m) => m[1]);
  const out = [];
  for (const f of files) {
    const body = readFileSync(resolve(root, "lib", "data", "houses", `${f}.ts`), "utf8");
    for (const m of body.matchAll(
      /slug:\s*"([^"]+)",\s*\n\s*name:\s*"([^"]+)",\s*\n\s*brand:\s*"([^"]+)"/g
    )) {
      out.push({ slug: m[1], name: m[2], brand: m[3] });
    }
  }
  if (out.length === 0) {
    throw new Error("match-feed-pairings: parsed zero references — fix this parser.");
  }
  return out;
}

const REFERENCES = readReferences();

const clean = (s) =>
  (s || "").replace(/<[^>]+>/g, " ").replace(/&[a-z]+;/g, " ").replace(/\s+/g, " ");

const norm = (s) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
    .replace(/&/g, " and ").replace(/[^a-z0-9]+/g, " ").trim();

/**
 * Phrases that turn a mere mention into a claimed pairing. Ordered strongest
 * first; the strongest one found is what gets reported.
 */
const CLAIM_PATTERNS = [
  { weight: "explicit", re: /inspired[ -]by/i },
  { weight: "explicit", re: /\balternative to\b/i },
  { weight: "explicit", re: /\bdupe (?:of|for)\b/i },
  { weight: "explicit", re: /\bour (?:take|version) on\b/i },
  { weight: "strong", re: /\breminiscent of\b/i },
  { weight: "strong", re: /\bsimilar to\b/i },
  { weight: "strong", re: /\bin the (?:style|spirit) of\b/i },
  { weight: "strong", re: /\bif you (?:like|love)\b/i },
  { weight: "weak", re: /\bcompare(?:d|s)? (?:to|with)\b/i },
  { weight: "weak", re: /\bfans of\b/i },
];

/** Names too common to match on their own; need the brand nearby. */
const needsBrand = (name) => norm(name).replace(/ /g, "").length <= 6 || /^(y|her|angel|chance|legend|dune|poison|libre|idole|opium|kouros|si|erba pura|lira)$/i.test(name);

const results = [];

for (const r of recs) {
  const desc = clean(r.description);
  const url = r.merchant_deep_link || "";
  const haystackRaw = `${r.product_name} ${desc} ${url.replace(/[-/]/g, " ")}`;
  const haystack = norm(haystackRaw);

  for (const ref of REFERENCES) {
    const nName = norm(ref.name);
    if (nName.length < 3) continue;
    // Word-boundary match against the normalised haystack.
    if (!new RegExp(`(^| )${nName.replace(/ /g, " ")}( |$)`).test(haystack)) continue;
    if (needsBrand(ref.name) && !haystack.includes(norm(ref.brand))) continue;

    // Find the sentence carrying the mention, for a human to read.
    const idx = haystackRaw.toLowerCase().indexOf(ref.name.toLowerCase());
    const around = idx >= 0 ? haystackRaw.slice(Math.max(0, idx - 130), idx + ref.name.length + 90) : "";

    let weight = "mention";
    for (const p of CLAIM_PATTERNS) {
      if (p.re.test(around) || (p.re.test(url) && /inspired/i.test(url))) { weight = p.weight; break; }
    }

    // Notes, straight from the retailer's own pyramid.
    const top = desc.match(/top\s*notes?\s*:?\s*([^:]{3,90}?)(?:heart|middle|mid)\s*notes?/i)?.[1];
    const heart = desc.match(/(?:heart|middle|mid)\s*notes?\s*:?\s*([^:]{3,90}?)base\s*notes?/i)?.[1];
    const base = desc.match(/base\s*notes?\s*:?\s*([^:]{3,90})/i)?.[1];

    results.push({
      id: r.aw_product_id,
      brand: r.brand_name,
      product: r.product_name,
      price: r.search_price,
      currency: r.currency,
      ml: r.product_name.match(/(\d+)\s*ml/i)?.[1] ?? null,
      url,
      refSlug: ref.slug,
      refName: `${ref.name} (${ref.brand})`,
      weight,
      quote: around.trim().replace(/\s+/g, " "),
      hasNotes: Boolean(top && heart && base),
      notes: top && heart && base ? { top: top.trim(), heart: heart.trim(), base: base.trim() } : null,
    });
  }
}

const rank = { explicit: 0, strong: 1, weak: 2, mention: 3 };
results.sort((a, b) => rank[a.weight] - rank[b.weight] || a.refSlug.localeCompare(b.refSlug));

const shown = SHOW_ALL ? results : results.filter((x) => x.weight === "explicit" || x.weight === "strong");

for (const x of shown) {
  console.log(`[${x.weight.toUpperCase()}] ${x.id}  ${x.brand} — ${x.product}`);
  console.log(`    -> ${x.refSlug}  (${x.refName})   ${x.currency} ${x.price}  ${x.ml ? x.ml + "ml" : "size?"}`);
  console.log(`    notes: ${x.hasNotes ? "yes" : "NO — cannot author without them"}`);
  console.log(`    "...${x.quote}..."`);
  console.log();
}

const byWeight = {};
for (const x of results) byWeight[x.weight] = (byWeight[x.weight] || 0) + 1;
console.log("─".repeat(70));
console.log(`feed rows: ${recs.length} | references: ${REFERENCES.length}`);
console.log(`candidate pairings by strength:`, byWeight);
console.log(`shown: ${shown.length}${SHOW_ALL ? " (all)" : " (explicit + strong; pass --all for the rest)"}`);
console.log(`with a parseable note pyramid: ${shown.filter((x) => x.hasNotes).length}`);
console.log(
  "\nThis is a candidate list, not data. Read the quote, check the notes actually\n" +
    "support the claim, and stock-check before authoring anything."
);
