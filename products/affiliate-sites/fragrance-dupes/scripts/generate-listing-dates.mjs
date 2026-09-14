/**
 * Writes lib/data/listing-dates.generated.ts — the date each dupe listing
 * FIRST WENT LIVE on counterscent.com.
 *
 * WHY A DATE HAS TO BE DERIVED RATHER THAN TYPED
 * ----------------------------------------------
 * `DupeCandidate` has no date field and adding one would mean hand-typing 79
 * of them, every one a back-filled guess about a day nobody recorded. Git
 * already knows the real answer to the question a reader is asking, exactly,
 * for free, and cannot be nudged: a listing entered the tree in a commit, and
 * that commit is what put it in front of a visitor.
 *
 * WHICH MOMENT THE DATE MEANS, AND WHY IT IS NOT "APPROVED"
 * ---------------------------------------------------------
 * Three moments exist for a producer listing and they diverge by days:
 * submitted, approved, and live. This file records only the third.
 *
 *   - SUBMITTED is the producer's fact and belongs in the producer console.
 *     Published on the site it would make "new" mean "new to our queue",
 *     which for anything that sat in review is simply false on the page.
 *   - APPROVED is our fact and is the one the producer console must show. But
 *     the catalogue is a static export: approved is not live until the next
 *     build. Printing an approval date publicly would label a listing with a
 *     day on which a visitor could not have seen it, and would read as us
 *     having sat on it.
 *   - FIRST LIVE is the only one of the three that is true from the reader's
 *     side, because "newly added" on a public page is a claim about the SITE,
 *     not about our workflow.
 *
 * And first-live needs no new field on either side of the programme. A
 * producer listing reaches the public build exactly the way these 79 did:
 * a commit (see HANDOFF.md, "Run the export as a commit, not inside CI"). So
 * "the commit that introduced this slug" is one rule covering hand-authored
 * and exported listings alike, with no special case and nothing for an
 * exporter to forget. The producer console shows submitted/approved/live as
 * three separate database timestamps; the public site shows this one.
 *
 * WHY THE OUTPUT IS COMMITTED AND NOT DERIVED AT BUILD TIME
 * ---------------------------------------------------------
 * Cloudflare's builder does not guarantee full history. A shallow clone makes
 * `git log` return one commit, which would produce dates that are right on
 * this machine and silently wrong in production — the exact shape of bug this
 * repo keeps paying for. Same reasoning as HANDOFF.md's "run the export as a
 * commit, not inside CI": the build reads repo files only. So this script is
 * run by hand, its output is reviewed in the diff, and `prebuild` never calls
 * it.
 *
 * DATES ARE WRITE-ONCE. An entry already present in the generated file is
 * copied through untouched, never recomputed. A published "Added on" date
 * should not move because somebody squashed a branch. Pass --rebuild to
 * discard the existing file and re-derive everything from history.
 *
 * THE PURGE OF 2026-08-27 IS WHY "FIRST APPEARANCE" IS NOT ENOUGH. `DUPES`
 * held 18 then 37 listings in August, all of them invented product names
 * attributed to real companies, and all of them deleted. A naive
 * first-appearance scan would date a slug from a commit whose content was
 * later withdrawn. This walks newest→oldest and stops at the first commit
 * where a slug is ABSENT, so the date is the start of the unbroken run that
 * reaches HEAD. A listing removed and re-added dates from the re-add, which
 * is the honest answer.
 *
 * Usage:
 *   node scripts/generate-listing-dates.mjs            # fill in gaps only
 *   node scripts/generate-listing-dates.mjs --rebuild   # re-derive all
 *   node scripts/generate-listing-dates.mjs --check     # write nothing, exit 1 if stale
 */

import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(here, "..");
const repoRoot = resolve(projectRoot, "..", "..", "..");
const outFile = resolve(projectRoot, "lib", "data", "listing-dates.generated.ts");

/**
 * Every file a `DupeCandidate` literal can live in.
 *
 * Both are scanned with the same regex and merged into one map, because
 * `DUPES` in lib/dupes-data.ts is their concatenation and a reader cannot
 * tell which file a listing came from — which is the point of the producer
 * programme. Adding a third source of listings means adding it here, or its
 * rows silently get no date and drop out of the "recently added" surface.
 */
const LISTING_SOURCES = [
  "lib/dupes-data.ts",
  "lib/data/producer-listings.generated.ts",
];

/**
 * Top-level `slug:` fields of the listing literals.
 *
 * Two to six leading spaces keeps it to object members inside the array and
 * out of doc comments (lib/dupes-data.ts's own header quotes a `grep -c '^
 * slug: "'` command, which a looser pattern picks up). Lower-case `s` is what
 * separates it from `referenceSlug:` and `producerSlug:` on the same objects.
 */
const SLUG_RE = /^\s{2,6}slug: "([^"]+)"/gm;

function git(args, { quiet = false } = {}) {
  return execFileSync("git", args, {
    cwd: repoRoot,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
    // `git show <sha>:<path>` writes "exists on disk, but not in <sha>" to
    // stderr for every commit predating a file, which for the producer source
    // is every commit there has ever been. Expected, handled by the catch
    // below, and noisy enough to bury a real error.
    stdio: quiet ? ["ignore", "pipe", "ignore"] : ["ignore", "pipe", "inherit"],
  });
}

/** Commits touching any listing source, oldest first, with committer date. */
function listingCommits() {
  const paths = LISTING_SOURCES.map((p) => relative(repoRoot, resolve(projectRoot, p)).split("\\").join("/"));
  const log = git(["log", "--reverse", "--format=%H\t%cI", "--", ...paths]);
  return log
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const [sha, iso] = line.split("\t");
      return { sha, date: iso.slice(0, 10) };
    });
}

/** Slugs present across all listing sources at one commit. */
function slugsAt(sha) {
  const found = new Set();
  for (const relPath of LISTING_SOURCES) {
    let body;
    try {
      body = git(
        ["show", `${sha}:${relative(repoRoot, resolve(projectRoot, relPath)).split("\\").join("/")}`],
        { quiet: true }
      );
    } catch {
      // The file did not exist at that commit. Not an error — producer
      // listings only started existing on 2026-09-14.
      continue;
    }
    for (const match of body.matchAll(SLUG_RE)) found.add(match[1]);
  }
  return found;
}

/** Slugs in the CURRENT working tree, which is what must end up dated. */
function slugsNow() {
  const found = new Set();
  for (const relPath of LISTING_SOURCES) {
    const body = readFileSync(resolve(projectRoot, relPath), "utf8");
    for (const match of body.matchAll(SLUG_RE)) found.add(match[1]);
  }
  return found;
}

/** Whatever the committed generated file already records. */
function existingDates() {
  let src;
  try {
    src = readFileSync(outFile, "utf8");
  } catch {
    return {};
  }
  const out = {};
  for (const [, slug, date] of src.matchAll(/"([^"]+)":\s*"(\d{4}-\d{2}-\d{2})"/g)) out[slug] = date;
  return out;
}

const rebuild = process.argv.includes("--rebuild");
const checkOnly = process.argv.includes("--check");

const commits = listingCommits();
if (commits.length === 0) {
  throw new Error(
    "generate-listing-dates: git returned no commits for any listing source. " +
      "Either the paths in LISTING_SOURCES are wrong, or this is a shallow " +
      "clone — in which case do NOT write the file, the dates would be wrong."
  );
}

const present = slugsNow();
if (present.size === 0) {
  throw new Error(
    "generate-listing-dates: parsed zero listing slugs from the working tree. " +
      "The literal's shape changed; fix SLUG_RE rather than shipping an empty map."
  );
}

// Snapshot each commit once, then walk newest→oldest per slug.
const snapshots = commits.map((c) => ({ ...c, slugs: slugsAt(c.sha) }));

const carried = rebuild ? {} : existingDates();
const dates = { ...carried };
const derived = [];

for (const slug of present) {
  if (dates[slug]) continue;
  let introduced = null;
  for (let i = snapshots.length - 1; i >= 0; i--) {
    if (!snapshots[i].slugs.has(slug)) break;
    introduced = snapshots[i].date;
  }
  if (!introduced) {
    // In the working tree but in no commit yet. Deliberately left undated
    // rather than stamped with today: it is not live until it is committed
    // and built, and an undated listing is simply excluded from the
    // "recently added" surface (see lib/listing-dates.ts).
    continue;
  }
  dates[slug] = introduced;
  derived.push(slug);
}

// Drop entries for listings that no longer exist. A removed listing keeps no
// public date, and HANDOFF.md's "never recycle a removed id" means a returning
// slug is a new listing anyway.
const stale = Object.keys(dates).filter((slug) => !present.has(slug));
for (const slug of stale) delete dates[slug];

const undated = [...present].filter((slug) => !dates[slug]);

const ordered = Object.keys(dates).sort((a, b) =>
  dates[a] === dates[b] ? a.localeCompare(b) : dates[a].localeCompare(dates[b])
);

const body = `/**
 * GENERATED FILE — do not edit by hand.
 *
 * Written by scripts/generate-listing-dates.mjs. Read
 * lib/listing-dates.ts for what the date means and why it is "first live"
 * rather than "approved" or "submitted".
 *
 * COMMITTED ON PURPOSE, and not regenerated by \`prebuild\`. These dates come
 * from git history, and Cloudflare's builder does not guarantee a full clone —
 * deriving them in CI would produce dates that are right locally and silently
 * wrong in production. The build reads this file and nothing else.
 *
 * Dates are write-once: re-running the script preserves every entry it already
 * finds here. Use --rebuild to re-derive from history deliberately.
 *
 * A listing missing from this map is NOT an error. It renders everywhere as
 * normal and is simply excluded from the "recently added" surface, because
 * the alternative — guessing a date — is a fabricated fact on a page whose
 * whole claim is that it does not fabricate.
 */

/** Listing slug → ISO date (YYYY-MM-DD) of the commit that first put it live. */
export const LISTING_FIRST_LIVE: Record<string, string> = {
${ordered.map((slug) => `  "${slug}": "${dates[slug]}",`).join("\n")}
};
`;

const previous = (() => {
  try {
    return readFileSync(outFile, "utf8");
  } catch {
    return "";
  }
})();

// Match the repo's own line endings. Most files here are CRLF and a script
// that silently normalises them turns a two-line change into a whole-file
// rewrite — see the root CLAUDE.md.
const eol = previous.includes("\r\n") ? "\r\n" : "\n";
const rendered = body.split("\n").join(eol);

if (checkOnly) {
  if (rendered !== previous) {
    console.error(
      `generate-listing-dates: ${relative(projectRoot, outFile)} is stale. ` +
        "Run `node scripts/generate-listing-dates.mjs` and commit the result."
    );
    process.exit(1);
  }
  console.log("generate-listing-dates: up to date.");
} else {
  writeFileSync(outFile, rendered, "utf8");
  console.log(
    `generate-listing-dates: ${ordered.length} dated listing${ordered.length === 1 ? "" : "s"} ` +
      `across ${commits.length} commits (${derived.length} newly derived, ` +
      `${Object.keys(carried).length - stale.length} carried forward, ${stale.length} dropped).`
  );
}

if (undated.length > 0) {
  console.log(
    `generate-listing-dates: ${undated.length} listing(s) in the tree but in no commit yet, ` +
      `left undated: ${undated.slice(0, 5).join(", ")}${undated.length > 5 ? ", …" : ""}`
  );
}
