/**
 * Fails the build if the scoring path can reach subscription state.
 *
 * WHY THIS IS A SCRIPT AND NOT A SENTENCE IN A DOC. "No tier buys rank, score or
 * placement" is the claim the whole producer programme rests on, it is printed on
 * /producers and /disclosure, and until now nothing enforced it. A promise in a
 * markdown file is not a control: the first time someone wants "featured producers
 * sorted first", the change is three lines and no test objects.
 *
 * So the rule is mechanical. Walk the import graph from every module that computes
 * or orders a score, and fail if it can reach a module that knows what anyone pays.
 * A violation is not a style problem - it is the moment rank becomes purchasable,
 * and it should stop a deploy.
 *
 * This got sharper, not softer, with the 2026-09-10 revenue decision. Paid tiers
 * take no commission, so we have no per-sale interest in a subscriber's rank
 * either; the code should be as unable to see a tier as we are to profit from one.
 *
 * Run by `prebuild`, so it guards `npm run build` and the Cloudflare deploy.
 */

import { readFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");

/**
 * Everything that decides a score or an order. Adding a new scoring module here
 * is part of writing one.
 */
const ENTRY_POINTS = [
  "lib/similarity.ts",
  "lib/verification.ts",
  "lib/catalog.ts",
];

/**
 * Modules that know what a producer pays. `lib/plans.ts` is the tier table;
 * `lib/producer-session.ts` answers "is this subscription active".
 *
 * `lib/merchants.ts` is deliberately NOT here. It knows which RETAILERS we earn
 * commission from, which is a different fact about different companies, and the
 * disclosure band needs it. The rule is about a producer's payment influencing
 * their own listing's position.
 */
const FORBIDDEN = new Set(["lib/plans.ts", "lib/producer-session.ts"]);

/** Catches a future module by name before anyone has to remember to list it. */
const FORBIDDEN_PATTERN = /(^|\/)(subscription|billing|paddle|iyzico|paytr)[.-]/i;

function resolveImport(spec) {
  if (!spec.startsWith("@/")) return null; // node_modules or relative asset
  const base = spec.slice(2);
  for (const cand of [`${base}.ts`, `${base}.tsx`, `${base}/index.ts`]) {
    if (existsSync(resolve(root, cand))) return cand;
  }
  return null;
}

function importsOf(rel) {
  const src = readFileSync(resolve(root, rel), "utf8");
  const specs = [];
  // `import ... from "x"`, `export ... from "x"`, and bare `import "x"`.
  for (const m of src.matchAll(/(?:^|\n)\s*(?:import|export)[^;'"]*?["']([^"']+)["']/g)) {
    specs.push(m[1]);
  }
  for (const m of src.matchAll(/import\(\s*["']([^"']+)["']\s*\)/g)) specs.push(m[1]);
  return specs;
}

function isForbidden(rel) {
  return FORBIDDEN.has(rel) || FORBIDDEN_PATTERN.test(rel);
}

const violations = [];
const seen = new Set();

for (const entry of ENTRY_POINTS) {
  if (!existsSync(resolve(root, entry))) {
    console.error(
      `check-scoring-isolation: entry point ${entry} does not exist. If it was ` +
        `renamed, update ENTRY_POINTS - a scoring module that is not walked is not guarded.`
    );
    process.exit(1);
  }
  // Depth-first, carrying the path so a violation names the whole chain rather
  // than only the offending file.
  const stack = [[entry, [entry]]];
  while (stack.length) {
    const [rel, path] = stack.pop();
    const key = rel;
    if (seen.has(key)) continue;
    seen.add(key);

    for (const spec of importsOf(rel)) {
      const target = resolveImport(spec);
      if (!target) continue;
      if (isForbidden(target)) {
        violations.push([...path, target].join("\n        -> "));
        continue;
      }
      stack.push([target, [...path, target]]);
    }
  }
}

if (violations.length) {
  console.error("");
  console.error("check-scoring-isolation: FAILED");
  console.error("");
  console.error("  The scoring path can reach a module that knows what a producer pays.");
  console.error("  That is the moment rank becomes purchasable in substance, whatever");
  console.error("  /producers and /disclosure say about it. Break the import:");
  console.error("");
  for (const v of violations) console.error(`     ${v}\n`);
  console.error("  If a score genuinely must vary by tier, that is a decision to take in");
  console.error("  the open and to change the public pages for - not one to make by adding");
  console.error("  an import. See PRODUCER-PROGRAM.md section 7.");
  console.error("");
  process.exit(1);
}

console.log(
  `check-scoring-isolation: clean - ${seen.size} module(s) reachable from ` +
    `${ENTRY_POINTS.length} scoring entry point(s), none of them subscription-aware`
);
