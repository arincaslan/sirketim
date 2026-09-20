/**
 * ============================================================================
 * THE ONE GENERATOR. Everything in src/generated/ comes out of this script.
 * ============================================================================
 *
 * WHY A SCRIPT AND NOT A HAND-TYPED FILE. This project is a separate Worker
 * with no import path to the catalogue next door (products/affiliate-sites/
 * fragrance-dupes) and no shared build step. Every fact this console needs
 * from over there - the note vocabulary a producer picks from, the originals
 * they may compare against, what a tier costs, which hosts are affiliate
 * networks - therefore arrives as a copy, and a copy that somebody types is a
 * copy that drifts with nothing anywhere able to catch it. CONSOLE-PLAN 4.4
 * calls hand-typing the vocabulary "the one version to refuse outright", and
 * the founder extended the same rule to the prices on 2026-09-16 when the
 * console was told to show real figures.
 *
 * ONE SCRIPT, NOT THREE, on purpose: a single regeneration keeps every
 * generated constant in step with the same snapshot of the same source tree.
 * Three scripts would be three chances for one of them not to be run.
 *
 * HOW THE SOURCES ARE READ: the real modules are evaluated, not scraped.
 * The repo's documented pattern is an esbuild bundle, and esbuild is NOT
 * installed in either project (checked, rather than assumed, before choosing
 * this path). What IS installed in both is TypeScript itself, so each source
 * file is compiled by the real TypeScript compiler (`ts.transpileModule`) and
 * then executed. That gives the same property the esbuild route was chosen
 * for - the values this file emits are the values the catalogue's own code
 * holds, not a regex's reading of them - with no network install.
 *
 * It works because all three source shapes are pure data: the 23 house files
 * carry one type-only import (elided by the compiler), and lib/plans.ts and
 * lib/producer-link.ts import nothing at all. Any future import would throw
 * loudly from the `require` stub below rather than silently yielding a
 * partial answer.
 *
 * EVERY ASSERTION BELOW IS THERE TO MAKE FAILURE LOUD. A generator that emits
 * a partial vocabulary is worse than no generator, because the console would
 * then flag perfectly ordinary notes as unrecognised and nobody would know
 * why. If a count looks wrong, this script throws and writes nothing.
 *
 *   node scripts/generate-constants.mjs           regenerate
 *   node scripts/generate-constants.mjs --check    fail if the committed
 *                                                  output would change
 */

import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import path from "node:path";

const require = createRequire(import.meta.url);
const ts = require("typescript");

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PROJECT = path.resolve(HERE, "..");
const CATALOGUE = path.resolve(PROJECT, "..", "fragrance-dupes");
const HOUSES_DIR = path.join(CATALOGUE, "lib", "data", "houses");
const PLANS_FILE = path.join(CATALOGUE, "lib", "plans.ts");
const LINK_FILE = path.join(CATALOGUE, "lib", "producer-link.ts");
const OUT_DIR = path.join(PROJECT, "src", "generated");

const CHECK = process.argv.includes("--check");

/* ---------------------------------------------------------------------- *
 * Reading a source module for real
 * ---------------------------------------------------------------------- */

/**
 * Compile one TypeScript file with the real compiler and run it.
 *
 * `transpileModule` is the isolated-modules path: it does not type-check and
 * does not need the rest of the project on disk, which is exactly right here
 * because these files are data and their types live behind a path alias this
 * script has no reason to resolve. Type-only imports are elided by the
 * compiler, so nothing tries to load "@/lib/types" at runtime.
 */
function evaluateModule(file) {
  const source = fs.readFileSync(file, "utf8");
  const compiled = ts.transpileModule(source, {
    fileName: file,
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      isolatedModules: true,
    },
  });
  if (compiled.diagnostics && compiled.diagnostics.length) {
    const first = compiled.diagnostics[0];
    throw new Error(
      `TypeScript refused ${path.basename(file)}: ` +
        ts.flattenDiagnosticMessageText(first.messageText, " "),
    );
  }
  const mod = { exports: {} };
  const fn = new Function("exports", "module", "require", "__filename", compiled.outputText);
  fn(mod.exports, mod, requireStub(file), file);
  return mod.exports;
}

/** Any real import in one of these files means the "pure data" premise has
 *  stopped holding, and the generator must stop rather than emit whatever it
 *  managed to evaluate before the missing value mattered. */
function requireStub(file) {
  return (id) => {
    throw new Error(
      `${path.basename(file)} now imports "${id}" at runtime. This generator ` +
        `evaluates these files in isolation and cannot resolve that. Either the ` +
        `import is type-only and should be written as \`import type\`, or this ` +
        `script needs a real bundler.`,
    );
  };
}

function fail(message) {
  throw new Error(`generate-constants: ${message}`);
}

/* ---------------------------------------------------------------------- *
 * The catalogue: references, note vocabulary, tier width
 * ---------------------------------------------------------------------- */

function readCatalogue() {
  if (!fs.existsSync(HOUSES_DIR)) fail(`no house directory at ${HOUSES_DIR}`);

  const files = fs
    .readdirSync(HOUSES_DIR)
    .filter((f) => f.endsWith(".ts"))
    .sort();

  // 23 is what the tree held when this was written. The assertion is ">= 23"
  // rather than "=== 23" so that adding a house is not an error - but the
  // count lands in the generated header, so a new house makes `--check` fail
  // until somebody regenerates, which is the alarm we actually want.
  if (files.length < 23) {
    fail(`expected at least 23 house files in ${HOUSES_DIR}, found ${files.length}`);
  }

  const references = [];
  const perFile = [];

  for (const name of files) {
    const file = path.join(HOUSES_DIR, name);
    const exported = evaluateModule(file);
    let found = 0;
    for (const value of Object.values(exported)) {
      if (!Array.isArray(value)) continue;
      for (const entry of value) {
        if (!entry || typeof entry !== "object") continue;
        if (typeof entry.slug !== "string" || typeof entry.name !== "string") continue;
        if (typeof entry.brand !== "string" || !entry.notes) continue;
        references.push(entry);
        found++;
      }
    }
    // A house file that evaluates cleanly and yields nothing is the silent
    // failure this whole script exists to prevent.
    if (found === 0) fail(`${name} exported no reference fragrances`);
    perFile.push({ name, count: found });
  }

  if (references.length < 200) {
    fail(`only ${references.length} references parsed; the catalogue holds over 200`);
  }

  // Slug uniqueness, because a duplicate would make the form's <select> offer
  // the same original twice and the server's membership check meaningless.
  const seen = new Set();
  for (const r of references) {
    if (seen.has(r.slug)) fail(`duplicate reference slug "${r.slug}"`);
    seen.add(r.slug);
  }

  /* The vocabulary. AS WRITTEN, deduplicated exactly, sorted for a stable
     diff. Deliberately NOT case-folded or otherwise normalised: the
     catalogue's own spelling is the string a match score is computed
     against, so "Ice Accord" and "Ice" are genuinely two different inputs to
     the formula and collapsing them here would hide a difference that costs
     real points. See CONSOLE-PLAN 4.4. */
  const vocabulary = new Set();
  const sillage = new Set();
  const concentrations = new Set();
  // FAMILIES, added 2026-09-20 for the review screen. An admin sets a
  // submission's family at approval, and the value has to be one the
  // catalogue's build can render - so it is read from the catalogue rather
  // than typed into the console, for the same reason every other constant
  // in this file is.
  const families = new Set();
  let maxTier = 0;
  const facetValues = [];

  for (const r of references) {
    if (typeof r.sillageLabel === "string" && r.sillageLabel) sillage.add(r.sillageLabel);
    if (typeof r.concentration === "string" && r.concentration) concentrations.add(r.concentration);
    if (typeof r.family === "string" && r.family) families.add(r.family);
    for (const tier of ["top", "heart", "base"]) {
      const notes = r.notes?.[tier];
      if (!Array.isArray(notes) || notes.length === 0) {
        fail(`reference "${r.slug}" has an empty or missing ${tier} tier`);
      }
      if (notes.length > maxTier) maxTier = notes.length;
      for (const note of notes) {
        if (typeof note !== "string" || !note.trim()) {
          fail(`reference "${r.slug}" has a non-string note in ${tier}`);
        }
        vocabulary.add(note);
      }
    }
    if (r.facets && typeof r.facets === "object") {
      for (const v of Object.values(r.facets)) {
        if (typeof v === "number") facetValues.push(v);
      }
    }
  }

  if (vocabulary.size < 150) {
    fail(`only ${vocabulary.size} distinct notes; the catalogue holds far more`);
  }
  // The catalogue's SillageLabel is a closed union of four in lib/types.ts.
  // Read here as the set of values actually in use, because a type has no
  // runtime value to evaluate and text-scraping a union would be exactly the
  // fragile reading this generator avoids everywhere else.
  if (sillage.size < 2 || sillage.size > 8) {
    fail(`observed ${sillage.size} distinct sillage labels, which is implausible`);
  }
  if (concentrations.size < 2) fail(`observed ${concentrations.size} concentrations`);
  // The taxonomy is two-word and granular - "Oriental Woody", "Floral Fruity" -
  // so 58 across 216 references is normal, and the first ceiling written here
  // (40) was wrong and fired on correct data. Fewer than three means the field
  // was not read at all; more than eighty means something other than a family
  // is being collected, which would produce hundreds rather than dozens.
  if (families.size < 3 || families.size > 80) {
    fail(`observed ${families.size} distinct families, which is implausible`);
  }

  return {
    files: perFile,
    sillage: [...sillage].sort((a, b) => a.localeCompare(b)),
    concentrations: [...concentrations].sort((a, b) => a.localeCompare(b)),
    families: [...families].sort((a, b) => a.localeCompare(b)),
    references: references
      .map((r) => ({ slug: r.slug, name: r.name, brand: r.brand }))
      .sort((a, b) => a.brand.localeCompare(b.brand) || a.name.localeCompare(b.name)),
    vocabulary: [...vocabulary].sort((a, b) => a.localeCompare(b)),
    maxTier,
    facetMin: Math.min(...facetValues),
    facetMax: Math.max(...facetValues),
  };
}

/* ---------------------------------------------------------------------- *
 * The plans and the network hosts
 * ---------------------------------------------------------------------- */

function readPlans() {
  const mod = evaluateModule(PLANS_FILE);
  const plans = mod.PLANS;
  const never = mod.NEVER_INCLUDED;

  if (!Array.isArray(plans) || plans.length !== 3) {
    fail(`lib/plans.ts exported ${Array.isArray(plans) ? plans.length : "no"} plans, expected 3`);
  }
  for (const id of ["free", "standard", "unlimited"]) {
    if (!plans.some((p) => p.id === id)) fail(`lib/plans.ts has no "${id}" plan`);
  }
  if (!Array.isArray(never) || never.length < 3) {
    fail(`lib/plans.ts NEVER_INCLUDED is missing or too short`);
  }
  for (const p of plans) {
    if (typeof p.name !== "string" || typeof p.listings !== "string") {
      fail(`plan "${p.id}" is missing name or listings`);
    }
    if (!Array.isArray(p.features)) fail(`plan "${p.id}" is missing features`);
    if (typeof p.takesCommission !== "boolean") fail(`plan "${p.id}" is missing takesCommission`);
  }

  return { plans, never };
}

function readNetworkHosts() {
  const source = fs.readFileSync(LINK_FILE, "utf8");
  // NETWORK_HOSTS is a module-private const rather than an export, so it
  // cannot be read off the evaluated module the way PLANS can. Appending
  // `export { NETWORK_HOSTS }` to the compiled text is the smallest honest
  // way to reach it: the array itself is still the catalogue's own literal,
  // evaluated by the real compiler, not a regex's reading of the file.
  const compiled = ts.transpileModule(source + "\nexport { NETWORK_HOSTS };\n", {
    fileName: LINK_FILE,
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const mod = { exports: {} };
  new Function("exports", "module", "require", compiled)(mod.exports, mod, requireStub(LINK_FILE));

  const hosts = mod.exports.NETWORK_HOSTS;
  if (!Array.isArray(hosts) || hosts.length < 20) {
    fail(`lib/producer-link.ts NETWORK_HOSTS is missing or implausibly short`);
  }
  for (const h of hosts) {
    if (typeof h !== "string" || !h.includes(".")) fail(`NETWORK_HOSTS holds "${h}", not a host`);
  }
  return hosts;
}

/* ---------------------------------------------------------------------- *
 * Emitting
 * ---------------------------------------------------------------------- */

/**
 * The date stamped into every generated header. HAND-MAINTAINED, AND IT HAS TO
 * BE: `--check` regenerates and compares, so a `new Date()` here would report
 * drift every single day and train everyone to ignore the one signal that says
 * the constants are stale.
 *
 * The cost of pinning is that the line goes quietly false between bumps - it
 * said 2026-09-16 on a file regenerated on the 18th, which is the stale-doc
 * failure the root CLAUDE.md describes, in a file that announces itself as
 * generated. It was called TODAY, which is what made forgetting it easy: the
 * name reads as "now" and the value is a constant. Bump it when you change what
 * the generator emits.
 */
const GENERATED_ON = "2026-09-18";
const COMMAND = "npm run generate";

/** THE HOUSE STYLE IS WRITTEN HERE, NOT COPIED THROUGH FROM THE SOURCE.
 *  src/ and public/ on this origin contain zero em-dashes and zero en-dashes,
 *  verified by grep, and lib/plans.ts next door does NOT hold that line in its
 *  comments. So this generator emits values only, under a header it writes
 *  itself. Nothing textual crosses from a source comment into src/. */
function header(lines) {
  return ["/**", ...lines.map((l) => (l ? ` * ${l}` : " *")), " */"].join("\n");
}

function lit(value) {
  // JSON.stringify produces a valid TypeScript string literal, including the
  // escapes, which hand-quoting gets wrong on the first apostrophe.
  return JSON.stringify(value);
}

function buildCatalogueFile(cat) {
  const capped = Math.min(cat.maxTier, 6);
  const capNote =
    cat.maxTier > 6
      ? [
          "",
          `THE FORM IS CAPPED BELOW THE OBSERVED MAXIMUM. The widest tier in`,
          `the catalogue holds ${cat.maxTier} notes, and NOTE_INPUTS_PER_TIER is 6.`,
          `Rendering ${cat.maxTier} empty boxes per tier, three times over, would make`,
          `the densest screen on this origin unreadable for a figure only one`,
          `reference actually reaches. Six is the number of inputs; it is not a`,
          `claim about what a pyramid may contain, and the form's own hint says`,
          `so.`,
        ]
      : [
          "",
          `NOTE_INPUTS_PER_TIER equals the observed maximum: no tier in the`,
          `catalogue is wider than 6, so the form does not have to cap anything.`,
        ];

  const out = [
    header([
      "GENERATED FILE. DO NOT EDIT BY HAND.",
      "",
      `Produced by scripts/generate-constants.mjs on ${GENERATED_ON}.`,
      `Regenerate with \`${COMMAND}\`; check for drift with`,
      "`node scripts/generate-constants.mjs --check`.",
      "",
      "SOURCE: the catalogue's researched reference pyramids, at",
      `products/affiliate-sites/fragrance-dupes/lib/data/houses/*.ts`,
      `(${cat.files.length} files, read and evaluated, not text-scraped).`,
      "",
      `COUNTS AT GENERATION: ${cat.references.length} references,`,
      `${cat.vocabulary.length} distinct notes, widest tier ${cat.maxTier} notes,`,
      `${cat.sillage.length} sillage labels, ${cat.concentrations.length} concentrations.`,
      `Facet values across the catalogue span ${cat.facetMin} to ${cat.facetMax},`,
      "which is what makes -1 a safe out-of-range sentinel for a submission",
      "whose facets nobody has set yet. See src/lib/submission.ts.",
      ...capNote,
    ]),
    "",
    "/** Every note the catalogue records, as the catalogue spells it. A producer",
    " *  may type something not in here and that is allowed: an off-vocabulary note",
    " *  is flagged for a person, never rejected. See src/lib/submission.ts. */",
    `export const NOTE_VOCABULARY: readonly string[] = [`,
    ...cat.vocabulary.map((n) => `  ${lit(n)},`),
    `];`,
    "",
    "/** The widest note tier anywhere in the catalogue. Observed, not guessed. */",
    `export const MAX_NOTES_PER_TIER = ${cat.maxTier};`,
    "",
    "/** How many note boxes the submit form renders per tier. */",
    `export const NOTE_INPUTS_PER_TIER = ${capped};`,
    "",
    "/** The sillage labels in use across the catalogue. Closed: the catalogue's",
    " *  own SillageLabel type is a union, so a value outside this set is one the",
    " *  public build could not render. The form offers these and nothing else. */",
    `export const SILLAGE_LABELS: readonly string[] = [`,
    ...cat.sillage.map((s) => `  ${lit(s)},`),
    `];`,
    "",
    "/** The concentrations in use across the catalogue. OPEN, unlike the sillage",
    " *  labels above: the column is free text and a producer may genuinely sell a",
    " *  format we have never recorded, so these are typeahead suggestions and not",
    " *  a permitted set. */",
    `export const CONCENTRATIONS: readonly string[] = [`,
    ...cat.concentrations.map((c) => `  ${lit(c)},`),
    `];`,
    "",
    "/** The fragrance families in use across the catalogue. CLOSED: an admin",
    " *  picks one of these when approving a submission, and a family outside",
    " *  this set is one the public build has never rendered. Generated rather",
    " *  than typed so the review screen cannot drift from the catalogue. */",
    `export const FAMILIES: readonly string[] = [`,
    ...cat.families.map((f) => `  ${lit(f)},`),
    `];`,
    "",
    "export interface GeneratedReference {",
    "  readonly slug: string;",
    "  readonly name: string;",
    "  readonly brand: string;",
    "}",
    "",
    "/** The originals a producer may compare against. A producer can never add",
    " *  one: researching a pyramid is our work, and a comparison against a",
    " *  fragrance we have not written up has nothing to be scored against. */",
    `export const REFERENCES: readonly GeneratedReference[] = [`,
    ...cat.references.map(
      (r) => `  { slug: ${lit(r.slug)}, name: ${lit(r.name)}, brand: ${lit(r.brand)} },`,
    ),
    `];`,
    "",
  ];
  return out.join("\n");
}

function buildPlansFile({ plans, never }) {
  return [
    header([
      "GENERATED FILE. DO NOT EDIT BY HAND.",
      "",
      `Produced by scripts/generate-constants.mjs on ${GENERATED_ON}.`,
      `Regenerate with \`${COMMAND}\`.`,
      "",
      "SOURCE: products/affiliate-sites/fragrance-dupes/lib/plans.ts",
      `(PLANS and NEVER_INCLUDED). ${plans.length} tiers, ${never.length} never-included lines.`,
      "",
      "WHY THE FIGURES ARE HERE AT ALL. CONSOLE-PLAN 2.4 ruled that the console",
      "would show no currency figures, because a hand-typed third copy of 19 and",
      "49 could drift behind lib/plans.ts and behind a payment provider's own",
      "price objects with nothing able to catch it. The founder overruled the",
      "ruling on 2026-09-16 and upheld the objection: the console shows real",
      "figures, and they are generated rather than typed. That is what this file",
      "is. If the catalogue's numbers move, this one is stale until somebody",
      "regenerates, and `--check` is what says so.",
      "",
      "THE NUMBERS ARE STILL PLACEHOLDERS AT THE SOURCE. lib/plans.ts says in",
      "its own header that 19 and 49 are a considered guess and not a price, and",
      "no payment provider is connected to anything. Every surface that renders",
      "them has to say so at the point of use.",
    ]),
    "",
    "export interface GeneratedPlan {",
    "  readonly id: string;",
    "  readonly name: string;",
    "  readonly tagline: string;",
    "  /** USD. null on the free tier, which has no figure rather than a zero. */",
    "  readonly priceMonthlyUsd: number | null;",
    "  readonly priceYearlyUsd: number | null;",
    "  /** The allowance as the catalogue words it. */",
    "  readonly listings: string;",
    "  readonly features: readonly string[];",
    "  /** Whether Counterscent earns commission on this tier's sales. */",
    "  readonly takesCommission: boolean;",
    "}",
    "",
    `export const PLANS: readonly GeneratedPlan[] = [`,
    ...plans.flatMap((p) => [
      "  {",
      `    id: ${lit(p.id)},`,
      `    name: ${lit(p.name)},`,
      `    tagline: ${lit(p.tagline)},`,
      `    priceMonthlyUsd: ${p.priceMonthly == null ? "null" : String(p.priceMonthly)},`,
      `    priceYearlyUsd: ${p.priceYearly == null ? "null" : String(p.priceYearly)},`,
      `    listings: ${lit(p.listings)},`,
      `    features: [`,
      ...p.features.map((f) => `      ${lit(f)},`),
      `    ],`,
      `    takesCommission: ${String(p.takesCommission)},`,
      "  },",
    ]),
    `];`,
    "",
    "/** What no tier buys, at any price. */",
    `export const NEVER_INCLUDED: readonly string[] = [`,
    ...never.map((n) => `  ${lit(n)},`),
    `];`,
    "",
  ].join("\n");
}

function buildHostsFile(hosts) {
  return [
    header([
      "GENERATED FILE. DO NOT EDIT BY HAND.",
      "",
      `Produced by scripts/generate-constants.mjs on ${GENERATED_ON}.`,
      `Regenerate with \`${COMMAND}\`.`,
      "",
      "SOURCE: the NETWORK_HOSTS array in",
      "products/affiliate-sites/fragrance-dupes/lib/producer-link.ts",
      `(${hosts.length} hosts).`,
      "",
      "GENERATED RATHER THAN RETYPED because this is the part of the link check",
      "most likely to drift: the list grows every time a new affiliate network or",
      "shortener turns up, and a console validating against last month's copy",
      "would accept a tracking link the export step then refuses, leaving a",
      "producer with a submission that passed and cannot publish.",
    ]),
    "",
    "/** Hosts that mean \"this is somebody's affiliate link, not a product page\",",
    " *  plus the common shorteners, whose destination can change after approval. */",
    `export const NETWORK_HOSTS: readonly string[] = [`,
    ...hosts.map((h) => `  ${lit(h)},`),
    `];`,
    "",
  ].join("\n");
}

/* ---------------------------------------------------------------------- *
 * Run
 * ---------------------------------------------------------------------- */

function main() {
  const cat = readCatalogue();
  const plans = readPlans();
  const hosts = readNetworkHosts();

  const outputs = {
    "catalogue.ts": buildCatalogueFile(cat),
    "plans.ts": buildPlansFile(plans),
    "network-hosts.ts": buildHostsFile(hosts),
  };

  // THE HOUSE RULE, ENFORCED AT THE GENERATOR RATHER THAN TRUSTED. src/ and
  // public/ carry zero em-dashes and zero en-dashes, and this script writes
  // into src/. The values come from a project that does not hold that line, so
  // one appearing in a plan feature or a note name has to stop the run rather
  // than land in the output and be found by a grep three steps later.
  for (const [name, body] of Object.entries(outputs)) {
    const bad = body.match(/[–—]/);
    if (bad) {
      const at = body.indexOf(bad[0]);
      fail(
        `src/generated/${name} would contain an em-dash or en-dash, which this ` +
          `origin does not use. Near: ${JSON.stringify(body.slice(Math.max(0, at - 60), at + 60))}`,
      );
    }
  }

  if (CHECK) {
    const changed = [];
    for (const [name, body] of Object.entries(outputs)) {
      const file = path.join(OUT_DIR, name);
      const onDisk = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : null;
      if (onDisk === null) {
        changed.push(`${name}: missing on disk`);
      } else if (normalise(onDisk) !== normalise(body)) {
        changed.push(`${name}: ${summariseDiff(onDisk, body)}`);
      }
    }
    if (changed.length) {
      console.error("generate-constants --check: committed output is stale.");
      for (const line of changed) console.error(`  ${line}`);
      console.error(`Run \`${COMMAND}\` and commit the result.`);
      process.exit(1);
    }
    console.log(
      `generate-constants --check: up to date ` +
        `(${cat.references.length} references, ${cat.vocabulary.length} notes, ` +
        `${plans.plans.length} plans, ${hosts.length} network hosts).`,
    );
    return;
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  for (const [name, body] of Object.entries(outputs)) {
    fs.writeFileSync(path.join(OUT_DIR, name), body, "utf8");
  }

  console.log(`Wrote src/generated/ from ${cat.files.length} house files:`);
  console.log(`  references          ${cat.references.length}`);
  console.log(`  distinct notes      ${cat.vocabulary.length}`);
  console.log(`  widest note tier    ${cat.maxTier}`);
  console.log(`  inputs per tier     ${Math.min(cat.maxTier, 6)}`);
  console.log(`  facet value range   ${cat.facetMin} to ${cat.facetMax}`);
  console.log(`  plans               ${plans.plans.length}`);
  console.log(`  never-included      ${plans.never.length}`);
  console.log(`  network hosts       ${hosts.length}`);
}

/** Line endings are not the change anyone means. Most files in this repo are
 *  CRLF and a checkout can rewrite them; comparing on content rather than on
 *  terminators keeps --check from failing for a reason nobody can act on. */
function normalise(text) {
  return text.replace(/\r\n/g, "\n");
}

function summariseDiff(before, after) {
  const a = normalise(before).split("\n");
  const b = normalise(after).split("\n");
  let first = 0;
  while (first < a.length && first < b.length && a[first] === b[first]) first++;
  const delta = b.length - a.length;
  const sizeNote =
    delta === 0 ? "same line count" : delta > 0 ? `+${delta} lines` : `${delta} lines`;
  return `first change at line ${first + 1}, ${sizeNote}`;
}

try {
  main();
} catch (err) {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
}
