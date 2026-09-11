/**
 * The ONE list of files the affiliate link map is assembled from, plus the
 * parser that reads them.
 *
 * WHY THIS FILE EXISTS. `generate-redirects.mjs` writes the edge redirect
 * table and `check-affiliate-links.mjs` verifies it, and until 2026-09-10 each
 * kept its own copy of this list. They drifted: the generator assembled four
 * files while the checker read two, under a comment asserting the two matched.
 * The result was that **368 of 620 shipped links — every Perfumania link, both
 * the reference side and the whole shop surface — went to the edge unchecked
 * while the checker reported a clean pass.** A checker that is silently
 * checking a subset is worse than no checker, because it converts "we have not
 * looked" into "we looked and it was fine".
 *
 * So the list lives here and both scripts import it. Adding a fifth source —
 * producer-supplied links are the next one — is now a single edit that both
 * the generator and the checker pick up, and it is no longer possible for one
 * to know about a source the other does not.
 *
 * ORDER IS LOAD-BEARING. It mirrors the spread order in lib/affiliate-links.ts
 * so the edge and the UI cannot disagree about where an id points: generated
 * files are read FIRST, so a hand-written entry overwrites a regenerated one on
 * a key collision.
 *
 * The key prefixes do NOT collide by design. 91 references are stocked by both
 * originals retailers, and when both used `original-<slug>` the spread order
 * silently decided which retailer survived — 91 of 123 links vanished with no
 * error anywhere. Each source owns its own namespace and must keep doing so.
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/** @typedef {{ relPath: string, declaration: string, owns: string }} LinkSource */

/** @type {LinkSource[]} */
export const AFFILIATE_LINK_SOURCES = [
  {
    relPath: "lib/data/cj-links.generated.ts",
    declaration: "CJ_ORIGINAL_LINKS",
    owns: "original-<slug> — FragranceShop.com, CJ advertiser 16941446",
  },
  {
    relPath: "lib/data/pm-links.generated.ts",
    declaration: "PM_ORIGINAL_LINKS",
    owns: "pm-<slug> — Perfumania.com, CJ advertiser 17335854",
  },
  {
    relPath: "lib/data/pm-shop-links.generated.ts",
    declaration: "PM_SHOP_LINKS",
    owns: "pmshop-<handle> — Perfumania's shop surface behind /originals",
  },
  {
    relPath: "lib/affiliate-links.ts",
    declaration: "affiliateLinks",
    owns: "dupe-<slug> — hand-written dupe-side entries, three Awin merchants",
  },
];

/**
 * Pull one exported object literal out of a TypeScript file as raw text.
 *
 * These files are read as TEXT rather than imported because the scripts are
 * plain .mjs and the sources are .ts. Strict on purpose: a shape change throws
 * instead of yielding an empty map, because both callers treat "no links" as a
 * legitimate state and would otherwise sail past a parse regression — the
 * generator emitting a truncated redirect table, the checker reporting that
 * zero links are all fine.
 *
 * @param {string} projectRoot absolute path to the project root
 * @param {LinkSource} source
 * @param {string} caller script name, for the error message
 * @returns {string} the literal's inner text, or "" when it is genuinely empty
 */
export function readLinkLiteral(projectRoot, source, caller) {
  const { relPath, declaration } = source;
  const src = readFileSync(resolve(projectRoot, ...relPath.split("/")), "utf8");

  // Matches both the empty one-line form (`= {};`) and a populated multi-line
  // literal, anchored on a closing `};` at the start of a line.
  const match = src.match(
    new RegExp(`export const ${declaration}\\s*:[^=]*=\\s*(\\{\\s*\\}|\\{[\\s\\S]*?^\\});`, "m")
  );
  if (!match) {
    throw new Error(
      `${caller}: could not find the \`${declaration}\` literal in ${relPath}. ` +
        "The file's shape changed — update the parser in " +
        "scripts/lib/affiliate-link-sources.mjs rather than letting this run " +
        "continue on a partial link map."
    );
  }

  const body = match[1].trim();
  return /^\{\s*\}$/.test(body) ? "" : body;
}

/**
 * Every source's literal, concatenated in the order above.
 *
 * @param {string} projectRoot
 * @param {string} caller
 * @returns {string}
 */
export function readAllLinkLiterals(projectRoot, caller) {
  return AFFILIATE_LINK_SOURCES.map((s) => readLinkLiteral(projectRoot, s, caller)).join("\n");
}
