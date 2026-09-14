/**
 * Manual check for lib/producer-link.ts. Run it with:
 *
 *   npx esbuild scripts/verify-producer-link.ts --bundle --platform=node  *     --format=esm --alias:@=. --outfile=/tmp/vpl.mjs && node /tmp/vpl.mjs
 *
 * NOT an npm script and not a test framework - this project deliberately has
 * neither, and inventing one here would be a bigger change than the thing being
 * checked. It follows the repo's documented technique instead: bundle the REAL
 * module and run it over real cases, so this asserts against shipped code rather
 * than re-testing a reimplementation.
 *
 * Worth keeping rather than deleting after one run, because the cases encode the
 * attacks the validator exists to stop - particularly the suffix attack
 * (opulensi.com.evil.com passing a naive "contains the domain" check) and an
 * affiliate-network host having to lose even when it matches the store domain.
 */

import { validateProducerLink, producerLinkId } from "@/lib/producer-link";

type Case = [name: string, url: string, domain: string, expectOk: boolean, expectReason?: string];

const CASES: Case[] = [
  ["plain product url", "https://opulensi.com/products/amber", "opulensi.com", true],
  ["www on the link", "https://www.opulensi.com/products/amber", "opulensi.com", true],
  ["www on the domain", "https://opulensi.com/products/amber", "www.opulensi.com", true],
  ["subdomain store", "https://shop.opulensi.com/p/amber", "opulensi.com", true],

  ["empty", "", "opulensi.com", false, "empty"],
  ["whitespace only", "   ", "opulensi.com", false, "empty"],
  ["not a url", "opulensi dot com", "opulensi.com", false, "not-a-url"],
  ["http", "http://opulensi.com/p", "opulensi.com", false, "not-https"],
  ["credentials", "https://u:p@opulensi.com/p", "opulensi.com", false, "has-credentials"],

  ["someone else's site", "https://evil.com/p", "opulensi.com", false, "not-own-domain"],
  // The classic suffix attack: the real domain appears as a PREFIX of the host.
  ["suffix attack", "https://opulensi.com.evil.com/p", "opulensi.com", false, "not-own-domain"],
  ["prefix lookalike", "https://notopulensi.com/p", "opulensi.com", false, "not-own-domain"],

  ["awin click link", "https://www.awin1.com/cread.php?s=1&v=2", "opulensi.com", false, "affiliate-network"],
  ["cj click link", "https://www.dpbolvw.net/click-1-2?url=x", "opulensi.com", false, "affiliate-network"],
  ["shortener", "https://bit.ly/3abc", "opulensi.com", false, "affiliate-network"],
  // A network host must lose even when it would otherwise pass the domain test.
  ["network wins over domain", "https://awin1.com/x", "awin1.com", false, "affiliate-network"],
];

let failed = 0;
for (const [name, url, domain, expectOk, expectReason] of CASES) {
  const r = validateProducerLink(url, domain);
  const okMatch = r.ok === expectOk;
  const reasonMatch = expectOk ? true : r.reason === expectReason;
  const pass = okMatch && reasonMatch;
  if (!pass) failed++;
  console.log(
    `${pass ? "PASS" : "FAIL"}  ${name.padEnd(26)} ok=${r.ok}${r.reason ? ` reason=${r.reason}` : ""}` +
      (pass ? "" : `   EXPECTED ok=${expectOk}${expectReason ? ` reason=${expectReason}` : ""}`)
  );
}

console.log("");
const strip = validateProducerLink(
  "https://opulensi.com/p/amber?utm_source=ig&variant=42&fbclid=xyz#reviews",
  "opulensi.com"
);
const expectedStrip = "https://opulensi.com/p/amber?variant=42";
const stripOk = strip.url === expectedStrip;
if (!stripOk) failed++;
console.log(`${stripOk ? "PASS" : "FAIL"}  tracking params stripped, real ones kept`);
console.log(`      -> ${strip.url}`);
if (!stripOk) console.log(`      EXPECTED ${expectedStrip}`);

const id = producerLinkId("opulensi", "amber-nights");
const idOk = id === "producer-opulensi-amber-nights";
if (!idOk) failed++;
console.log(`${idOk ? "PASS" : "FAIL"}  link id namespaced -> ${id}`);

console.log("");
console.log(failed === 0 ? "ALL PASS" : `${failed} FAILURE(S)`);
process.exit(failed === 0 ? 0 : 1);
