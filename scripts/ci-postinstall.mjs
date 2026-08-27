/**
 * Builds the site during dependency install, but ONLY on a CI builder.
 *
 * WHY THIS EXISTS
 * ---------------
 * Cloudflare Workers Builds has a "build command" setting that must be set to
 * `npm run build`, or it installs dependencies and goes straight to
 * `npx wrangler deploy` with nothing built. Three deploys failed that way -
 * the tell in the log is the absence of any "Executing user build command:"
 * line, followed by wrangler reporting that assets.directory does not exist.
 *
 * Rather than have the deploy depend on one dashboard field staying set, the
 * root package.json runs this from `postinstall`, which Cloudflare triggers
 * automatically as part of "Installing project dependencies". If the build
 * command IS set, the build simply runs twice, which is wasteful but correct.
 *
 * It is gated on CI environment variables so a human running `npm install` at
 * the repo root does not accidentally kick off a full Next.js build. Local
 * behaviour is unchanged.
 *
 * If the dashboard build command is confirmed working and stays that way,
 * this file and the postinstall hook can be deleted - they are redundancy,
 * not architecture.
 */

import { execSync } from "node:child_process";

// WORKERS_CI is set by Cloudflare Workers Builds; CF_PAGES by Pages; CI by
// most other builders. Any of them means "this is a build machine".
const onCI = Boolean(
  process.env.WORKERS_CI || process.env.CF_PAGES || process.env.CI
);

if (!onCI) {
  console.log(
    "ci-postinstall: not a CI builder (no WORKERS_CI/CF_PAGES/CI) — skipping the site build."
  );
  process.exit(0);
}

console.log("ci-postinstall: CI detected — building the site so wrangler has assets to deploy.");

try {
  execSync("npm run build", { stdio: "inherit" });
} catch (error) {
  // Fail loudly. A swallowed error here would let wrangler run against a
  // missing or half-written out/ directory, which is how a broken site gets
  // deployed while the log still looks green.
  console.error("ci-postinstall: site build FAILED — refusing to continue to deploy.");
  process.exit(typeof error?.status === "number" ? error.status : 1);
}
