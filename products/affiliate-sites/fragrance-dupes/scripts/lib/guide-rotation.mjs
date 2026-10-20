/**
 * The weekly guide rotation's record, content/guide-rotation.json, read by
 * every script that has to agree about it: generate-redirects.mjs (the 301s
 * for retired guides), rank-guides.mjs (what may be retired) and
 * check-internal-links.mjs (nothing may still link to a retired guide).
 *
 * One reader imported by all three, for the reason affiliate-link-sources.mjs
 * gives: a checker that keeps its own copy of a list drifts, and it drifts in
 * the direction that reports a pass.
 *
 * It throws rather than warns. generate-redirects.mjs runs as `prebuild`, so a
 * bad record fails the build - the same posture as content/loader.ts.
 *
 * Procedure and reasoning: GUIDE-ROTATION.md.
 */

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Published guide slugs. content/loader.ts already forces filename === slug. */
export function liveGuideSlugs(projectRoot) {
  return readdirSync(join(projectRoot, "content", "guide"))
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => file.slice(0, -".mdx".length));
}

export function readGuideRotation(projectRoot, caller) {
  const file = join(projectRoot, "content", "guide-rotation.json");
  if (!existsSync(file)) return { keep: [], retired: [] };

  const fail = (message) => {
    throw new Error(`${caller}: content/guide-rotation.json: ${message}`);
  };

  let data;
  try {
    data = JSON.parse(readFileSync(file, "utf8"));
  } catch (error) {
    fail(`not valid JSON (${error.message})`);
  }

  const keep = data.keep ?? [];
  const retired = data.retired ?? [];
  const live = new Set(liveGuideSlugs(projectRoot));
  const seen = new Set();

  for (const entry of retired) {
    const { slug, redirectTo, retiredOn } = entry;
    if (typeof slug !== "string" || !SLUG.test(slug)) fail(`retired slug ${JSON.stringify(slug)} is not a slug`);
    if (seen.has(slug)) fail(`"${slug}" is retired twice`);
    seen.add(slug);

    // _redirects rules fire even when an asset exists at the same path, so a
    // guide published under a retired slug would be unreachable - and because
    // browsers cache a 301, unreachable for anyone who ever followed it.
    if (live.has(slug)) {
      fail(`"${slug}" is retired but content/guide/${slug}.mdx exists. A retired slug is never published again; pick a new one.`);
    }

    if (
      typeof redirectTo !== "string" ||
      !redirectTo.startsWith("/") ||
      redirectTo.startsWith("//") ||
      !redirectTo.endsWith("/")
    ) {
      fail(`"${slug}" redirectTo ${JSON.stringify(redirectTo)} must be a site path ending in "/" (trailingSlash: true)`);
    }

    // When a guide that older retirements point at is itself retired, those
    // older entries must be repointed, or every one of them becomes a chain
    // ending in a 404.
    const target = redirectTo.match(/^\/guide\/([^/]+)\/$/);
    if (target && !live.has(target[1])) {
      fail(`"${slug}" redirects to /guide/${target[1]}/, which is not a published guide. Repoint it to that guide's own redirectTo.`);
    }

    if (typeof retiredOn !== "string" || !DATE.test(retiredOn)) fail(`"${slug}" needs retiredOn as YYYY-MM-DD`);
  }

  for (const slug of keep) {
    if (!live.has(slug)) fail(`keep lists "${slug}", which is not a published guide`);
  }

  return { keep, retired };
}
