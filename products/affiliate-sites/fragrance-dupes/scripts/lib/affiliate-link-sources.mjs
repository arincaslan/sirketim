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

/** @typedef {{ relPath: string, declaration: string, owns: string, mayOverride?: boolean }} LinkSource */

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
    relPath: "lib/data/irfe-links.ts",
    declaration: "IRFE_LINKS",
    owns: "irfe-<slug> - Maison IRFE's own CJ programme, advertiser 17213922. Hand-written, not generated; see the file header.",
  },
  {
    relPath: "lib/data/producer-links.generated.ts",
    declaration: "PRODUCER_LINKS",
    owns: "producer-<producerSlug>-<listingSlug> — approved producer listings, network `direct`",
  },
  {
    relPath: "lib/affiliate-links.ts",
    declaration: "affiliateLinks",
    owns: "dupe-<slug> — hand-written dupe-side entries, three Awin merchants",
    /** The ONE source allowed to win a key collision. The spread in
     *  lib/affiliate-links.ts reads the generated files first and this literal
     *  last, so a hand-written entry deliberately overrides a regenerated one —
     *  a correction beating a default. Every OTHER collision is the 91-key bug
     *  described above and `assertNoDuplicateLinkIds` throws on it. */
    mayOverride: true,
  },
];

/**
 * The entries in one literal's text, as `{ id, fields }`.
 *
 * WHY THIS IS SHARED AND NOT INLINED IN EACH CALLER. Three scripts parse these
 * literals — the redirect generator, the link checker and the duplicate guard
 * below — and the list of SOURCES was already extracted here after two of them
 * drifted apart and shipped 368 unchecked links. The regex that turns a literal
 * into entries is the same class of shared agreement: if the guard split entries
 * even slightly differently from the generator, it would be policing a set of
 * ids that is not the set going to the edge.
 *
 * A fresh RegExp per call on purpose — a module-level /g regex carries
 * `lastIndex` between callers and silently starts mid-file on the second use.
 *
 * @param {string} body the literal's inner text
 * @returns {{id: string, fields: string}[]}
 */
export function linkEntriesOf(body) {
  return [...body.matchAll(/["']?([\w-]+)["']?\s*:\s*\{([^}]*)\}/g)].map(([, id, fields]) => ({
    id,
    fields,
  }));
}

/**
 * Throw if any affiliate link id is defined twice where that is not deliberate.
 *
 * WHY A BUILD-TIME ASSERTION RATHER THAN A CONVENTION. `affiliateLinks` is one
 * flat object spread from five sources. A duplicate key is not an error in
 * JavaScript — the last spread silently wins — so when FragranceShop and
 * Perfumania both keyed their reference links `original-<slug>`, 91 of 123 ids
 * vanished with **no error anywhere**: the UI still rendered a buy button for
 * the retailer whose link had been overwritten, pointing at the other one. The
 * convention ("each source owns its own namespace") was already written down at
 * the time and was not a mechanism. This is the mechanism.
 *
 * Two kinds of collision, treated differently on purpose:
 *   - WITHIN one source — always an error. A generator emitting the same key
 *     twice means its own key derivation is not unique, which no spread order
 *     can rescue.
 *   - ACROSS sources — an error unless the later source is marked
 *     `mayOverride`, which is only lib/affiliate-links.ts. That override is
 *     documented behaviour (a hand-written correction beating a regenerated
 *     default), so it is REPORTED rather than silently permitted.
 *
 * @param {string} projectRoot
 * @param {string} caller
 * @returns {{total: number, overrides: string[]}}
 */
export function assertNoDuplicateLinkIds(projectRoot, caller) {
  /** @type {Map<string, LinkSource>} */
  const owner = new Map();
  const errors = [];
  const overrides = [];
  let total = 0;

  for (const source of AFFILIATE_LINK_SOURCES) {
    const seenHere = new Set();
    for (const { id } of linkEntriesOf(readLinkLiteral(projectRoot, source, caller))) {
      total++;
      if (seenHere.has(id)) {
        errors.push(`  "${id}" is defined twice inside ${source.relPath}`);
        continue;
      }
      seenHere.add(id);

      const prior = owner.get(id);
      if (!prior) {
        owner.set(id, source);
        continue;
      }
      if (source.mayOverride) {
        overrides.push(`  "${id}": ${source.relPath} overrides ${prior.relPath}`);
        owner.set(id, source);
        continue;
      }
      errors.push(
        `  "${id}" is defined in BOTH ${prior.relPath} and ${source.relPath}` +
          ` — the spread order decides which survives and the other link is lost silently`
      );
    }
  }

  if (errors.length) {
    throw new Error(
      `${caller}: ${errors.length} duplicate affiliate link id(s).\n` +
        errors.join("\n") +
        "\n\nGive each source its own key prefix. A shared prefix means one" +
        " retailer's links\nvanish with no error at all — that is how 91 of 123" +
        " ids were lost once already.\nThe prefix a source owns is recorded in" +
        " AFFILIATE_LINK_SOURCES above, in this\nfile, which is the only registry" +
        " of them — and this assertion, over the ids\nactually emitted, is the" +
        " only thing that enforces it."
    );
  }

  return { total, overrides };
}

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
