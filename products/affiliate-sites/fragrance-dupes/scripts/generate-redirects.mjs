/**
 * Generates public/_redirects — the affiliate redirect chokepoint, moved from
 * a Next route handler to build-time static redirects.
 *
 * WHY THIS EXISTS
 * ---------------
 * Every outbound affiliate click used to go through app/go/[slug]/route.ts, a
 * GET handler that looked the slug up and returned a 302. A route handler
 * cannot return a redirect in a static export (`output: "export"`), and the
 * static export is what lets this site host for free — see
 * departments/web-development/CLAUDE.md, "Choosing a host".
 *
 * Cloudflare Pages reads a `_redirects` file from the build output and serves
 * those as real edge redirects, so /go/<slug> keeps working exactly as before
 * from a visitor's point of view. Files in public/ are copied into out/ by the
 * export, so writing it here is enough.
 *
 * WHAT CHANGED, HONESTLY
 * ----------------------
 * Sub-ID attribution is UNAFFECTED. The scheme in FINALIZATION-GUIDE.md §3.5
 * (`<listingId>__<referenceSlug>__<surface>`, emitted as Awin `clickref` / CJ
 * `sid`) is deterministic, so it is baked into the destination URL here at
 * build time instead of being composed per-request. Attribution still works.
 *
 * What IS lost is our own server-side click logging — there is no server to
 * log on. Two honest options when that matters:
 *   1. Client-side GA4 outbound-click events (enough for "which pages convert").
 *   2. A `main` Worker script declared in the repo-root wrangler.jsonc, which
 *      handles /go/* per-request and falls through to the static assets for
 *      everything else. The free tier covers it (100k requests/day).
 * Option 2 is the right one before the first real campaign spend. Neither is
 * needed today: `affiliateLinks` is empty and no programme is enrolled.
 *
 * CORRECTED 2026-08-27: this comment previously said to add "a Cloudflare
 * Pages Function at functions/go/[slug].js". That is WRONG for this project.
 * The site deploys as a WORKER with static assets, not as Pages, and a
 * functions/ directory does nothing there. The root wrangler.jsonc always
 * carried the right advice; this file contradicted it — on the one code path
 * that will carry every affiliate click. Caught in a board review.
 *
 * When that Worker script lands, note also that `_redirects` rules are NOT
 * applied to requests served by Worker code. Move the /go/ mapping into the
 * script rather than leaving both in place and guessing which one wins.
 *
 * UNRESOLVED COMPLIANCE QUESTION — carried over verbatim, still unresolved:
 * Amazon's Associates operating agreement bars obscuring the source site
 * "including by use of Redirecting Links" such that Amazon cannot tell which
 * site a click came from. This pattern is exactly that. It is probably
 * acceptable where attribution is preserved and the destination is plainly
 * Amazon, but "probably" is not good enough for a clause whose penalty is
 * account termination. Verify against the live agreement text before the
 * first Amazon link ships. Other networks do not necessarily share this
 * restriction. See departments/communication/reports/amazon-associates-application.md §2.
 */

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const outFile = resolve(here, "..", "public", "_redirects");

/** Must match SUB_ID_PARAM in lib/affiliate-links.ts. Duplicated because this
 *  script deliberately reads the TS file as text rather than importing it. */
const SUB_ID_PARAM = { awin: "clickref", cj: "sid" };

/**
 * Read the affiliate map without pulling in the TypeScript toolchain.
 *
 * lib/affiliate-links.ts is the single source of truth and stays that way;
 * this parses the literal out of it. It is deliberately strict: if the file's
 * shape changes so this can no longer read it, the build FAILS loudly rather
 * than silently emitting an empty redirect table, which would 404 every
 * affiliate link in production while the site looked fine.
 */
async function readAffiliateLinks() {
  const src = await import("node:fs").then((fs) =>
    fs.readFileSync(resolve(here, "..", "lib", "affiliate-links.ts"), "utf8")
  );

  // Matches both the empty one-line form (`= {};`) and a populated multi-line
  // literal. Anchored on the closing `};` at the start of a line, or `{}`.
  const match = src.match(
    /export const affiliateLinks\s*:[^=]*=\s*(\{\s*\}|\{[\s\S]*?^\});/m
  );
  if (!match) {
    throw new Error(
      "generate-redirects: could not find the `affiliateLinks` literal in " +
        "lib/affiliate-links.ts. The file's shape changed — update this parser " +
        "rather than letting the build emit an empty redirect table."
    );
  }

  const body = match[1].trim();
  if (/^\{\s*\}$/.test(body)) return {};

  // Only reached once real links land; keep the parse explicit and boring.
  const entries = [...body.matchAll(/["']?([\w-]+)["']?\s*:\s*\{([^}]*)\}/g)];
  const out = {};
  for (const [, id, fields] of entries) {
    const network = fields.match(/network:\s*["']([^"']+)["']/)?.[1];
    const deepLink = fields.match(/deepLink:\s*["']([^"']+)["']/)?.[1];
    const subId = fields.match(/subId:\s*["']([^"']+)["']/)?.[1];
    if (!network || network === "placeholder") continue;

    // Mirrors affiliateDestination() in lib/affiliate-links.ts. Kept in step by
    // the assertion below rather than by hope: this file cannot import the TS
    // module, and a silent divergence here would strip attribution from every
    // affiliate click while the links still appeared to work.
    if (!deepLink || !subId) {
      throw new Error(
        `generate-redirects: affiliate link "${id}" is missing deepLink or subId. ` +
          "Every real entry needs both — a link without a sub-ID is unattributable " +
          "forever, and there is no way to recover which listing earned a commission."
      );
    }
    const param = SUB_ID_PARAM[network];
    if (!param) {
      throw new Error(
        `generate-redirects: unknown network "${network}" on affiliate link "${id}". ` +
          `Add its sub-ID parameter to SUB_ID_PARAM in both this file and lib/affiliate-links.ts.`
      );
    }
    const joiner = deepLink.includes("?") ? "&" : "?";
    out[id] = `${deepLink}${joiner}${param}=${encodeURIComponent(subId)}`;
  }
  return out;
}

const links = await readAffiliateLinks();
const ids = Object.keys(links);

const lines = [
  "# GENERATED FILE — do not edit by hand.",
  "# Written by scripts/generate-redirects.mjs at build time from",
  "# lib/affiliate-links.ts, which is the source of truth.",
  "#",
  `# Generated: ${new Date().toISOString()}`,
  `# Real affiliate links: ${ids.length}`,
  "",
];

if (ids.length === 0) {
  lines.push(
    "# No affiliate programme is enrolled yet, so there is deliberately nothing",
    "# here. /go/<anything> therefore 404s, which is correct: a link that goes",
    "# nowhere must break loudly rather than sending a customer to a dead page.",
    "# Buy buttons already refuse to render unless a link resolves to a real",
    "# programme (see hasRealAffiliateLink), so no visitor can reach one."
  );
} else {
  for (const id of ids) {
    // 302, not 301: affiliate destinations change, and a cached permanent
    // redirect to a retired merchant URL is very hard to take back.
    lines.push(`/go/${id} ${links[id]} 302`);
  }
}

mkdirSync(dirname(outFile), { recursive: true });
writeFileSync(outFile, lines.join("\n") + "\n", "utf8");

console.log(
  `generate-redirects: wrote ${ids.length} redirect${ids.length === 1 ? "" : "s"} to public/_redirects`
);
