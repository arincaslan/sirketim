/**
 * Measure lib/facet-derivation.ts against the catalogue it has to agree with.
 *
 * Run:
 *   npx esbuild scripts/calibrate-facets.ts --bundle --platform=node \
 *     --format=esm --alias:@=. --outfile=.calib.mjs && node .calib.mjs
 *
 * It imports the SHIPPED deriveFacets rather than re-implementing it, so what
 * it reports is what a producer listing would actually get. A calibration that
 * carries its own copy of the formula only re-tests its own arithmetic - and
 * this repo has already shipped a link checker two source files behind its
 * generator, reporting a clean pass over 368 unchecked links.
 *
 * Re-run it whenever FAMILY_VECTORS, the note map, or the tier weights change.
 * Section 4 prints the offset adjustment that would re-zero the bias; paste
 * those into FACET_OFFSETS rather than hand-tuning a single facet to move a
 * particular listing.
 */
import { DUPES, getReference } from "@/lib/dupes-data";
import { REFERENCES } from "@/lib/data/references";
import { deriveFacets, familyOfNote } from "@/lib/facet-derivation";
import { computeSimilarity } from "@/lib/similarity";
import { getPublishedScore } from "@/lib/verification";
import type { FacetScores } from "@/lib/types";

const KEYS: (keyof FacetScores)[] = [
  "freshness",
  "sweetness",
  "warmth",
  "woodyDepth",
  "longevity",
  "sillage",
];

const mean = (xs: number[]) => (xs.length === 0 ? 0 : xs.reduce((a, b) => a + b, 0) / xs.length);
const r2 = (n: number) => Math.round(n * 100) / 100;
const pad = (s: string | number, n: number) => String(s).padStart(n);

// ---- 1. Can every note in the catalogue be classified? ----------------
const counts = new Map<string, number>();
const tally = (n: string) => counts.set(n, (counts.get(n) ?? 0) + 1);
for (const r of REFERENCES) [...r.notes.top, ...r.notes.heart, ...r.notes.base].forEach(tally);
for (const d of DUPES) [...d.notes.top, ...d.notes.heart, ...d.notes.base].forEach(tally);

const unmapped = [...counts.entries()].filter(([n]) => familyOfNote(n) === null);
const mentions = [...counts.values()].reduce((a, b) => a + b, 0);
const unmappedMentions = unmapped.reduce((a, [, c]) => a + c, 0);

console.log("=== 1. NOTE COVERAGE ===");
console.log(`distinct notes        ${pad(counts.size, 6)}`);
console.log(`unclassified          ${pad(unmapped.length, 6)}`);
console.log(`mention coverage      ${pad(r2((1 - unmappedMentions / mentions) * 100) + "%", 6)}`);
if (unmapped.length) {
  console.log(
    "UNCLASSIFIED: " +
      unmapped.sort((a, b) => b[1] - a[1]).map(([n, c]) => `${n}(${c})`).join(", ")
  );
}

// ---- 2. Agreement with the hand-written facets ------------------------
// The 216 references are what FACET_OFFSETS is fitted on; the 79 listings are
// held out of that fit, so their numbers are the honest ones to quote.
function agreement(label: string, rows: { hand: FacetScores; derived: FacetScores }[]) {
  console.log(`\n--- ${label} (n=${rows.length}) ---`);
  console.log("facet         MAE    bias   within±1  within±2");
  for (const k of KEYS) {
    const diffs = rows.map((x) => x.derived[k] - x.hand[k]);
    const abs = diffs.map(Math.abs);
    console.log(
      k.padEnd(12) +
        pad(r2(mean(abs)), 5) +
        pad(r2(mean(diffs)), 8) +
        pad(r2((abs.filter((d) => d <= 1).length / abs.length) * 100) + "%", 10) +
        pad(r2((abs.filter((d) => d <= 2).length / abs.length) * 100) + "%", 10)
    );
  }
  const all = rows.flatMap((x) => KEYS.map((k) => x.derived[k] - x.hand[k]));
  console.log(`ALL         ${pad(r2(mean(all.map(Math.abs))), 5)}${pad(r2(mean(all)), 8)}`);
}

const refRows = REFERENCES.map((r) => ({
  hand: r.facets,
  derived: deriveFacets(r.notes, r.concentration).facets,
}));
const dupeRows = DUPES.map((d) => ({
  hand: d.facets,
  derived: deriveFacets(d.notes, d.concentration).facets,
}));

console.log("\n=== 2. DERIVED vs HAND-WRITTEN ===");
agreement("references — FITTED ON, so flattering by construction", refRows);
agreement("listings — HELD OUT, quote these", dupeRows);

// ---- 3. What it would do to the published score -----------------------
console.log("\n=== 3. PUBLISHED SCORE, THREE REGIMES (n=79) ===");
const A: number[] = [];
const B: number[] = [];
const C: number[] = [];
const gapHand: number[] = [];
const gapDerived: number[] = [];
const gapMixed: number[] = [];

for (const d of DUPES) {
  const ref = getReference(d.referenceSlug);
  if (!ref) continue;
  const dd = deriveFacets(d.notes, d.concentration).facets;
  const rd = deriveFacets(ref.notes, ref.concentration).facets;
  const withDerived = { ...d, facets: dd };
  const refDerived = { ...ref, facets: rd };

  A.push(getPublishedScore(computeSimilarity(ref, d), d));
  B.push(getPublishedScore(computeSimilarity(ref, withDerived), withDerived));
  C.push(getPublishedScore(computeSimilarity(refDerived, withDerived), withDerived));

  gapHand.push(mean(KEYS.map((k) => Math.abs(ref.facets[k] - d.facets[k]))));
  gapDerived.push(mean(KEYS.map((k) => Math.abs(rd[k] - dd[k]))));
  gapMixed.push(mean(KEYS.map((k) => Math.abs(ref.facets[k] - dd[k]))));
}

console.log("mean facet gap, a reference vs its listing");
console.log(`  both hand-written (today)        ${r2(mean(gapHand))}`);
console.log(`  both derived                     ${r2(mean(gapDerived))}`);
console.log(`  listing derived, reference hand  ${r2(mean(gapMixed))}`);

const regime = (name: string, xs: number[]) => {
  const up = xs.filter((v, i) => v > A[i]).length;
  const dn = xs.filter((v, i) => v < A[i]).length;
  console.log(
    `${name.padEnd(36)} mean ${pad(r2(mean(xs)), 6)}  vs A ${pad(r2(mean(xs) - mean(A)), 6)}` +
      `  up/down/same ${up}/${dn}/${xs.length - up - dn}`
  );
};
console.log("\npublished score");
regime("A  both hand-written (today)", A);
regime("B  derived listing vs hand ref", B);
regime("C  derived on both sides", C);
console.log(
  "\nB is the regime a producer listing lands in if a reviewer accepts the\n" +
    "proposal unchanged. It is a systematic handicap, not a measurement."
);

// ---- 4. Offset re-fit ------------------------------------------------
console.log("\n=== 4. OFFSET ADJUSTMENT (add to FACET_OFFSETS) ===");
console.log("Zero means the current offsets still fit the references.");
for (const k of KEYS) {
  const bias = mean(refRows.map((x) => x.derived[k] - x.hand[k]));
  console.log(`${k.padEnd(12)} ${pad(r2(-bias), 7)}`);
}
