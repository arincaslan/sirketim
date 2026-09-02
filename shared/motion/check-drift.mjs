#!/usr/bin/env node
/**
 * Sirketim motion-system drift checker.
 *
 * Projects are deliberately self-contained (own package.json, nothing builds
 * from the repo root), so the motion system cannot be a shared npm package.
 * Instead each project keeps a verbatim copy of shared/motion/motion.ts at
 * <project>/lib/motion.ts. This script is what stops those copies silently
 * diverging.
 *
 * Run from the repo root:   node shared/motion/check-drift.mjs
 * Exit code 0 = all copies in sync, 1 = drift or missing copy found.
 *
 * Intended to be run before shipping a template, and by the control/audit
 * department as part of its weekly pass.
 */

import { createHash } from "node:crypto";
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const canonicalPath = join(repoRoot, "shared", "motion", "motion.ts");

/** Every project expected to carry a copy. Add new projects here. */
const PROJECTS = [
  "products/web-templates/agency-landing",
  "products/web-templates/fragrance-store",
  "products/web-templates/fragrance-store-2",
  "products/web-templates/fragrance-store-3",
  "products/affiliate-sites/fragrance-dupes",
];

const hash = (buf) => createHash("sha256").update(buf).digest("hex").slice(0, 12);

if (!existsSync(canonicalPath)) {
  console.error(`FATAL: canonical motion system missing at ${canonicalPath}`);
  process.exit(1);
}

const canonical = readFileSync(canonicalPath);
const canonicalHash = hash(canonical);

console.log(`Sirketim motion system  canonical sha256:${canonicalHash}\n`);

let drifted = 0;
let missing = 0;

for (const project of PROJECTS) {
  const copyPath = join(repoRoot, project, "lib", "motion.ts");
  const label = project.padEnd(44);

  if (!existsSync(copyPath)) {
    console.log(`${label} MISSING   (not adopted yet)`);
    missing += 1;
    continue;
  }

  const copyHash = hash(readFileSync(copyPath));
  if (copyHash === canonicalHash) {
    console.log(`${label} ok        sha256:${copyHash}`);
  } else {
    console.log(`${label} DRIFTED   sha256:${copyHash}`);
    drifted += 1;
  }
}

console.log("");
if (drifted === 0 && missing === 0) {
  console.log("All copies in sync.");
  process.exit(0);
}
if (drifted > 0) {
  console.log(
    `${drifted} copy/copies drifted. Re-copy shared/motion/motion.ts over them,\n` +
      `or if the change was deliberate, promote it into the canonical file first.`
  );
}
if (missing > 0) {
  console.log(`${missing} project(s) have not adopted the motion system yet.`);
}
process.exit(1);
