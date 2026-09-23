/**
 * ============================================================================
 * THE EXPORT STEP. Approved producer listings -> the public catalogue.
 * ============================================================================
 *
 * This is the ONLY route a producer's listing has into the Dupe Finder, and
 * until 2026-09-23 it did not exist. `lib/data/producer-listings.generated.ts`
 * has been sitting in the catalogue since the programme was designed, empty,
 * with a header saying it is "written by the export step of the producer
 * console". Nothing wrote it. A producer could sign in, submit, be approved,
 * and see absolutely nothing change on counterscent.com - which is the thing
 * the subscription is sold to provide.
 *
 * ----------------------------------------------------------------------------
 * IT WRITES THREE FILES, AND THAT IS NOT AN IMPLEMENTATION DETAIL
 * ----------------------------------------------------------------------------
 *   lib/data/producer-registry.generated.ts   SUBSCRIBER_PRODUCERS
 *   lib/data/producer-listings.generated.ts   PRODUCER_LISTINGS
 *   lib/data/producer-links.generated.ts      PRODUCER_LINKS
 *
 * The listings file's own header states the trap: a link is not a listing. If
 * only the links file were written, the redirect would resolve and the reader
 * would land on the producer's store, while the comparison card they were
 * meant to click renders nowhere. If only the listings file were written, the
 * card renders and its buy button 404s at the edge. And without the registry,
 * a listing's `producerSlug` names a company the catalogue cannot describe.
 * All three come out of one run, or none do.
 *
 * ----------------------------------------------------------------------------
 * READ-ONLY ON THE DATABASE BY DEFAULT
 * ----------------------------------------------------------------------------
 * `PublishState.LIVE` means "approved AND emitted by the last export". Marking
 * a row LIVE while the catalogue has not actually been redeployed would make
 * the column lie, and the column is what a future re-check reads. So the
 * database write-back is a SEPARATE, EXPLICIT step:
 *
 *   node scripts/export-listings.mjs                 write the three files
 *   node scripts/export-listings.mjs --mark-live     after the catalogue deploy
 *   node scripts/export-listings.mjs --check         fail if output would change
 *
 * Run the second one only once the deploy is actually out.
 *
 * ----------------------------------------------------------------------------
 * THE GATES ARE THE CATALOGUE'S OWN CODE WHERE THEY CAN BE
 * ----------------------------------------------------------------------------
 * `deriveFacets` and `producerLinkId` are loaded out of the catalogue's real
 * modules and executed, the same technique scripts/generate-constants.mjs uses
 * and for the same reason: a reimplementation here would only ever test itself.
 *
 * FACETS ARE OURS AND ARE NEVER READ FROM THE SUBMISSION. The six facet
 * columns exist on `Submission` and this script ignores every one of them.
 * isVerbatimCopy() cross-references a producer's notes AGAINST their facets, so
 * a producer who supplies both defeats the copy gate by construction. The
 * sliders were removed from the form on 2026-09-11 for exactly this reason and
 * reading the columns here would put the hole back one layer down.
 */

import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import path from "node:path";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const { neon } = require("@neondatabase/serverless");

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PROJECT = path.resolve(HERE, "..");
const CATALOGUE = path.resolve(PROJECT, "../fragrance-dupes");
const OUT_DIR = path.join(CATALOGUE, "lib", "data");

const MODE = process.argv.includes("--check")
  ? "check"
  : process.argv.includes("--mark-live")
    ? "mark-live"
    : "write";

/* ==========================================================================
 * TWO DECISIONS THIS SCRIPT REFUSES TO MAKE FOR YOU
 * ==========================================================================
 *
 * Both are founder policy, both change what a reader sees, and both are the
 * kind of thing that gets silently defaulted once and then inherited forever.
 * The script stops rather than picking. Set them here when they are decided,
 * and write the reasoning next to the value, not in a commit message.
 */

/**
 * DECISION 1 - what `pyramidSource` should be for a producer-declared pyramid.
 *
 * The catalogue's scoring applies a -10 penalty to `imputed` pyramids, and 47
 * of the 79 hand-authored merchant listings carry it because we had to guess
 * their notes. A producer fills in three tier fields themselves, which reads
 * as `declared` and escapes that penalty entirely.
 *
 * The two honest readings, neither obviously wrong:
 *
 *   "declared" is simply TRUE. They do declare it; they know their own
 *   product. A merchant listing is `imputed` because WE guessed, and that
 *   penalty is about our uncertainty, not about the company.
 *
 *   ...but every paying subscriber then lands in the better bucket and every
 *   listing we researched ourselves lands in the worse one, systematically,
 *   for a reason unrelated to the fragrance. "No tier buys rank" is this
 *   programme's structural promise, and a reader cannot see this happening.
 *
 * ---------------------------------------------------------------------------
 * THE CATALOGUE HAS ALREADY ANSWERED HALF OF THIS, IN CODE
 * ---------------------------------------------------------------------------
 * Found by running `npm run build` with a real exported row, not by reading:
 *
 *   Error: Producer listing "..." claims pyramidSource "declared" with no
 *   pyramidBasis. Either record where the producer publishes that pyramid
 *   (source, quote, url, checkedOn) or set pyramidSource to "imputed".
 *
 * So "declared" is not free for a producer listing either - it is EARNED by
 * citing where the producer publishes that pyramid, exactly the third option
 * this comment used to describe as hypothetical. The submit form collects no
 * such citation today: there is no field asking where a pyramid is published.
 *
 * WHICH MAKES THE ONLY SHIPPABLE VALUE TODAY "imputed", and the -10 concern
 * dissolves with it - a producer lands in the same bucket as the 47 merchant
 * listings we had to guess at, until they supply evidence. That is a defensible
 * default rather than a compromise.
 *
 * The real decision left for the founder is therefore narrower and better
 * posed: is it worth adding a "where do you publish this pyramid" field to the
 * submit form, so a producer CAN earn "declared"? Until that exists, set this
 * to "imputed".
 *
 * Set to "declared" or "imputed" to proceed.
 */
const PYRAMID_SOURCE_POLICY = null;

/**
 * DECISION 2 - whether a producer's uploaded photograph may be published.
 *
 * Photograph upload was built on 2026-09-23 and the bytes are served from
 * producers.counterscent.com/media/<key>. The catalogue sends no CSP at all,
 * so embedding that URL works today - checked, not assumed.
 *
 * WHAT IS MISSING IS NOT TECHNICAL. The catalogue's rule for bottle imagery is
 * "supplied by an affiliate programme we are enrolled in, or a photo of a
 * bottle we own", because a bottle is protected trade dress. A producer's own
 * photograph of their own product is a THIRD case, and it is fine in
 * principle - they took it, they own it - but nothing in the submit form asks
 * them to say so. We would be republishing an image on a commercial site on
 * the strength of an assumption.
 *
 * What closes it is small: a required checkbox on /console/submit warranting
 * that the producer holds the rights, stored on the row, and checked here.
 * That is a schema change plus a form field, which is tomorrow's work.
 *
 * Set to true ONLY once that declaration exists and is being read below.
 */
const IMAGE_RIGHTS_DECLARED = false;

/* ========================================================================== */

function fail(message) {
  console.error(`\nEXPORT REFUSED\n\n${message}\n`);
  process.exit(1);
}

/**
 * Compile-and-run one of the catalogue's TypeScript modules. Type-only imports
 * are elided, so a module whose only imports are types loads with no project
 * on disk. A module with a real value import throws from the require stub
 * rather than silently yielding a partial answer.
 */
function evaluateModule(file, stubs = {}) {
  const source = fs.readFileSync(file, "utf8");
  const compiled = ts.transpileModule(source, {
    fileName: file,
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      isolatedModules: true,
    },
  });
  const module = { exports: {} };
  const fn = new Function("exports", "module", "require", compiled.outputText);
  fn(module.exports, module, (spec) => {
    // Stubs are named one by one rather than resolved generally, so a module
    // that grows a new dependency fails loudly here instead of quietly
    // receiving an empty object and exporting a half-computed answer.
    if (spec in stubs) return stubs[spec];
    throw new Error(`${path.basename(file)} tried to require "${spec}"; this loader has no resolver for it.`);
  });
  return module.exports;
}

function readDevVars(file) {
  if (!fs.existsSync(file)) return {};
  return Object.fromEntries(
    fs
      .readFileSync(file, "utf8")
      .split(/\r?\n/)
      .filter((l) => l && !l.startsWith("#") && l.includes("="))
      // wrangler's .dev.vars permits a quoted value and some of ours are quoted.
      .map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1).replace(/^"(.*)"$/, "$1")]),
  );
}

/** The catalogue's own newline convention. Most files in this repo are CRLF and
 *  a generator that writes LF rewrites every line, burying the real change. */
function matchEol(existingPath, text) {
  if (!fs.existsSync(existingPath)) return text;
  const existing = fs.readFileSync(existingPath, "utf8");
  return existing.includes("\r\n") ? text.replace(/\r?\n/g, "\r\n") : text;
}

/**
 * Serialises to a TypeScript object literal, NOT to JSON.
 *
 * THE DIFFERENCE IS LOAD-BEARING AND IT FAILS SILENTLY. The catalogue's
 * scripts/generate-redirects.mjs reads these files with regexes that expect
 * unquoted property names (`network: "direct"`), and on a miss it does not
 * throw - line 106 is `if (!network || network === "placeholder") continue;`.
 * A JSON-quoted `"network":` therefore matches nothing, the entry is skipped
 * without a word, and the producer gets a listing card whose buy button 404s
 * at the edge. That is exactly the "a link is not a listing" trap the
 * generated file's own header warns about, arriving from the other direction.
 *
 * Found by grepping the emitted _redirects for the producer's slug and not
 * finding it, after the redirect count looked plausible. The count was the
 * misleading part: 620 to 621 read like the new link had landed, and it had
 * not - the run that produced 621 was made while the links file was empty.
 *
 * Keys stay quoted when they are not valid identifiers, which every listing
 * slug is not (they carry hyphens). The parser allows that; it is only the
 * property names inside each entry that must be bare.
 */
function tsLiteral(value, indent = 0) {
  const pad = "  ".repeat(indent);
  const padInner = "  ".repeat(indent + 1);
  if (value === null || value === undefined) return "undefined";
  if (typeof value === "string") return JSON.stringify(value);
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) {
    if (!value.length) return "[]";
    return `[\n${value.map((v) => padInner + tsLiteral(v, indent + 1)).join(",\n")},\n${pad}]`;
  }
  const keys = Object.keys(value).filter((k) => value[k] !== undefined);
  if (!keys.length) return "{}";
  return `{\n${keys
    .map((k) => {
      const key = /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(k) ? k : JSON.stringify(k);
      return `${padInner}${key}: ${tsLiteral(value[k], indent + 1)}`;
    })
    .join(",\n")},\n${pad}}`;
}

/**
 * Replaces ONLY the exported value, keeping everything above it byte for byte.
 *
 * THE HEADERS IN THOSE THREE FILES ARE THE SPECIFICATION FOR THIS SCRIPT, and
 * the first version of this function overwrote them with a generated banner -
 * 115 lines of reasoning gone, including the slug-namespace rule, the facets
 * rule and the "a link is not a listing" trap, none of which is recoverable
 * from the data. A generator is allowed to own its output; it is not allowed
 * to delete the document that told it what to emit.
 *
 * So the contract is: find the `export const <NAME>` line, keep everything
 * before it, rewrite from there. If the marker is missing the script stops
 * rather than guessing where the prose ends.
 */
function writeOrCheck(file, constName, value) {
  const target = path.join(OUT_DIR, file);
  if (!fs.existsSync(target)) {
    fail(`${file} does not exist. This script rewrites its value, it does not create it from nothing.`);
  }
  const current = fs.readFileSync(target, "utf8");
  const marker = current.indexOf(`export const ${constName}`);
  if (marker === -1) {
    fail(`${file} has no "export const ${constName}" line; refusing to guess where its header ends.`);
  }
  const declaration = current.slice(marker).match(/^export const [A-Z_]+(?::[^=]+)?=/m);
  if (!declaration) fail(`${file}: could not parse the declaration of ${constName}.`);

  const eol = current.includes("\r\n") ? "\r\n" : "\n";
  const next =
    current.slice(0, marker) +
    declaration[0] +
    " " +
    tsLiteral(value).replace(/\r?\n/g, eol) +
    ";" +
    eol;

  if (MODE === "check") {
    if (current !== next) fail(`${file} is out of date. Run the exporter.`);
    return false;
  }
  if (current === next) return false;
  fs.writeFileSync(target, next);
  return true;
}

async function main() {
  if (MODE !== "check" && PYRAMID_SOURCE_POLICY === null) {
    fail(
      "DECISION 1 is unset: pyramidSource for producer-declared pyramids.\n" +
        "Read the comment on PYRAMID_SOURCE_POLICY in this file and set it.\n" +
        "Defaulting it silently would hand every paying subscriber up to 10\n" +
        "points over the listings we researched ourselves, which is exactly\n" +
        'the thing "no tier buys rank" is supposed to make impossible.',
    );
  }

  const vars = readDevVars(path.join(PROJECT, ".dev.vars"));
  const dbUrl = process.env.DATABASE_URL || vars.DATABASE_URL;
  if (!dbUrl) {
    fail("No DATABASE_URL. Set it in the environment or in .dev.vars.");
  }

  // WHICH DATABASE THIS IS reaches the operator's eyes on every run. This repo
  // has already produced a confidently wrong report about "production data"
  // that was read out of the wrong branch; the endpoint is the only thing that
  // distinguishes them and it is not guessable from the file name.
  const endpoint = (dbUrl.match(/@(ep-[a-z0-9-]+)/) || [, "unknown"])[1];
  console.log(`database endpoint: ${endpoint}`);

  const sql = neon(dbUrl);

  // deriveFacets and producerLinkId come from the CATALOGUE, because those are
  // the definitions the published site computes with.
  const { deriveFacets } = evaluateModule(path.join(CATALOGUE, "lib", "facet-derivation.ts"));
  const { producerLinkId } = evaluateModule(path.join(CATALOGUE, "lib", "producer-link.ts"));

  // validateProducerLink comes from THIS project, not the catalogue, and the
  // difference is deliberate. The catalogue's version takes a `storeDomain`
  // argument for its `not-own-domain` check; there is no such column on
  // `Producer`, and src/lib/producer-link.ts explains at length why inventing
  // one would be worse than omitting the check. Calling the catalogue's with
  // an undefined domain would run that check against nothing and look like it
  // had passed. So the console's port runs here: every check except
  // not-own-domain, which a reviewer enforces by reading the submission.
  const { validateProducerLink } = evaluateModule(path.join(PROJECT, "src", "lib", "producer-link.ts"), {
    "../generated/network-hosts": evaluateModule(
      path.join(PROJECT, "src", "generated", "network-hosts.ts"),
    ),
  });

  if (typeof deriveFacets !== "function" || typeof producerLinkId !== "function" || typeof validateProducerLink !== "function") {
    fail("Could not load deriveFacets / producerLinkId / validateProducerLink.");
  }

  // The references we have actually researched, from the console's own
  // generated copy - which scripts/generate-constants.mjs keeps in step with
  // the catalogue. A producer naming an original we do not hold cannot publish.
  const { REFERENCES } = evaluateModule(path.join(PROJECT, "src", "generated", "catalogue.ts"));
  const referenceSlugs = new Set(REFERENCES.map((r) => r.slug));

  // Companies we list through an affiliate relationship. A subscriber slug must
  // never collide with one, or an exported listing renders under a real
  // company's name and blurb, asserting an enrolment that never happened.
  //
  // LISTED_PRODUCERS lives inside lib/producers.ts, which imports the registry
  // this very script writes. That import is stubbed empty on purpose: we want
  // the companies we list through affiliate programmes, NOT the subscribers,
  // and feeding it last run's output would let a subscriber slug validate
  // against itself.
  const listedProducerSlugs = new Set(
    (
      evaluateModule(path.join(CATALOGUE, "lib", "producers.ts"), {
        "@/lib/data/producer-registry.generated": { SUBSCRIBER_PRODUCERS: [] },
      }).LISTED_PRODUCERS ?? []
    ).map((p) => p.slug),
  );

  const rows = await sql`
    SELECT s.id, s.slug, s.name, s.brand, s.concentration, s."priceUsd", s."bottleMl",
           s."referenceSlug", s."notesTop", s."notesHeart", s."notesBase", s.ingredients,
           s."longevityHoursMin", s."longevityHoursMax", s."sillageLabel",
           s.verdict, s."storeUrl", s."imageUrl", s.family,
           p.slug AS producer_slug, p.name AS producer_name, p.blurb AS producer_blurb,
           p."isHouse" AS producer_is_house
    FROM "Submission" s
    JOIN "Producer" p ON p.id = s."producerId"
    WHERE s."approvalStatus" = 'APPROVED'
      AND s."publishState" IN ('PENDING', 'LIVE')
    ORDER BY p.slug, s.slug
  `;

  console.log(`approved rows: ${rows.length}`);

  const refusals = [];
  const listings = [];
  const links = {};
  const producers = new Map();

  for (const r of rows) {
    const refuse = (why) => refusals.push(`${r.producer_slug}/${r.slug}: ${why}`);

    if (listedProducerSlugs.has(r.producer_slug)) {
      refuse(`producer slug "${r.producer_slug}" collides with a company we list through an affiliate programme`);
      continue;
    }
    if (!referenceSlugs.has(r.referenceSlug)) {
      refuse(`references "${r.referenceSlug}", which is not an original we have researched`);
      continue;
    }

    // The catalogue's rule is that a house product never publishes here: we
    // would gain from how our own listing ranks, which is the conflict the
    // whole no-commission decision exists to avoid.
    if (r.producer_is_house) {
      refuse("is a house producer; house products do not publish");
      continue;
    }

    // `family` is inserted as FAMILY_SENTINEL (the empty string) and an editor
    // fills it in at review. An approval does not imply anybody did. Exporting
    // the sentinel would put a listing on the site with a blank fragrance
    // family - it would group nowhere and read as a data bug to the only
    // people who would notice, which is the producer paying for it.
    if (!r.family || !r.family.trim()) {
      refuse("family is still the placeholder; a reviewer has not set it");
      continue;
    }

    const notes = { top: r.notesTop ?? [], heart: r.notesHeart ?? [], base: r.notesBase ?? [] };
    const derived = deriveFacets(notes, r.concentration);

    // DerivedFacets.unclassified carries its own instruction: surface these
    // rather than publish a score computed from a partial list. A pyramid we
    // could only half-read produces a facet vector that looks precise and is
    // not, and the score is the product.
    if (derived.unclassified.length) {
      refuse(`notes we cannot classify: ${derived.unclassified.join(", ")}`);
      continue;
    }

    const link = validateProducerLink(r.storeUrl);
    if (!link.ok) {
      refuse(`store link rejected at export time (${link.reason})`);
      continue;
    }

    const slug = producerLinkId(r.producer_slug, r.slug);

    const listing = {
      slug,
      referenceSlug: r.referenceSlug,
      name: r.name,
      brand: r.brand,
      producerSlug: r.producer_slug,
      family: r.family,
      pyramidSource: PYRAMID_SOURCE_POLICY,
      notes,
      facets: derived.facets,
      ingredients: r.ingredients?.length ? r.ingredients : undefined,
      longevityHoursRange: [r.longevityHoursMin, r.longevityHoursMax],
      sillageLabel: r.sillageLabel,
      priceUsd: r.priceUsd,
      bottleMl: r.bottleMl,
      concentration: r.concentration,
      verdict: r.verdict ?? "",
      // NEVER defaulted to "verified" - that is earned by editorial review, and
      // defaulting it is how a cap silently stops applying.
      verificationStatus: "declared",
    };

    // The photograph rides on DECISION 2 and on nothing else. A row that has an
    // image but no rights declaration publishes WITHOUT the image rather than
    // not publishing at all: the listing is still the thing the producer is
    // paying for, and withholding it over a missing checkbox would be a worse
    // answer than withholding the picture.
    if (IMAGE_RIGHTS_DECLARED && r.imageUrl) {
      listing.imageUrl = r.imageUrl.startsWith("/media/")
        ? `https://producers.counterscent.com${r.imageUrl}`
        : r.imageUrl;
    }

    listings.push(listing);
    links[slug] = {
      network: "direct",
      merchantId: r.producer_slug,
      deepLink: link.url ?? r.storeUrl,
      subId: slug,
      label: `${r.brand} ${r.name}`,
    };
    producers.set(r.producer_slug, {
      slug: r.producer_slug,
      name: r.producer_name,
      blurb: r.producer_blurb ?? "",
    });
  }

  if (refusals.length) {
    console.log(`\nrefused ${refusals.length} row(s):`);
    for (const r of refusals) console.log(`  - ${r}`);
  }
  console.log(`\nexporting ${listings.length} listing(s) from ${producers.size} producer(s)`);

  if (listings.length && !IMAGE_RIGHTS_DECLARED) {
    console.log(
      "\nNOTE: photographs are NOT being published (DECISION 2 is false).\n" +
        "      The listings will render with the generated note-signature mark.",
    );
  }

  const changed = [];
  if (writeOrCheck("producer-listings.generated.ts", "PRODUCER_LISTINGS", listings)) {
    changed.push("producer-listings.generated.ts");
  }
  if (writeOrCheck("producer-links.generated.ts", "PRODUCER_LINKS", links)) {
    changed.push("producer-links.generated.ts");
  }
  if (writeOrCheck("producer-registry.generated.ts", "SUBSCRIBER_PRODUCERS", [...producers.values()])) {
    changed.push("producer-registry.generated.ts");
  }

  if (MODE === "check") {
    console.log("up to date");
    return;
  }

  console.log(changed.length ? `\nwrote: ${changed.join(", ")}` : "\nno change");

  if (MODE === "mark-live") {
    const ids = listings.map((l) => l.slug);
    console.log(`\nmarking ${ids.length} row(s) LIVE`);
    const marked = await sql`
      UPDATE "Submission" SET "publishState" = 'LIVE', "updatedAt" = now()
      WHERE "approvalStatus" = 'APPROVED'
        AND "publishState" = 'PENDING'
        AND id = ANY(${rows.filter((r) => listings.some((l) => l.slug === producerLinkId(r.producer_slug, r.slug))).map((r) => r.id)})
      RETURNING id
    `;
    console.log(`marked ${marked.length} row(s)`);
  } else if (listings.length) {
    console.log(
      "\nNEXT: deploy the catalogue, then run this again with --mark-live.\n" +
        "      LIVE means 'emitted AND out there'; setting it before the deploy\n" +
        "      makes the column lie to whoever reads it next.",
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
