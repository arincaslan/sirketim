/**
 * Ranks the published guides by what removing each one would cost the site,
 * for the weekly rotation (GUIDE-ROTATION.md). Read-only: it prints the ranking
 * and the slugs to retire. Deleting, redirecting and unlinking is the
 * rotation's job.
 *
 *   node scripts/rank-guides.mjs                       # table + RETIRE line
 *   node scripts/rank-guides.mjs --json                # machine-readable
 *   node scripts/rank-guides.mjs --today 2026-10-26 --count 3
 *
 * THE SIGNALS, AND WHY NOT TRAFFIC
 * --------------------------------
 * Cloudflare Web Analytics is the only per-page traffic source we have, and on
 * 2026-10-20 it showed every guide at zero or one sampled pageview over 30
 * days. A ranking on that is a coin toss that looks like a measurement. Every
 * signal here is something the repo shows and a reader can check:
 *
 *   inbound    other guides linking here (x3). Removing a hub means unlinking
 *              it from every one of them.
 *   catalogue  distinct /fragrance/ pages it links to (x1, capped at 10). Each
 *              of those lists this guide under "Related reading"
 *              (lib/related-guides.ts), so removing it empties that module there.
 *   sole       of those, pages no other guide links to (x2): they lose their
 *              only related reading.
 *   intent     targets a dupe/alternative search (+8). Those searches end in a
 *              click to a retailer; general explainers teach but convert nobody
 *              (fragrance-dupes CLAUDE.md, "Content").
 *
 * Lowest score goes first. Ties go to the older piece, then alphabetically, so
 * a re-run gives the same answer. When traffic is large enough to beat noise it
 * should become a signal, and probably the dominant one.
 *
 * NEVER ELIGIBLE
 * --------------
 *   - Published in the last 14 days. A new piece has had no time to collect
 *     inbound links, so without this every new piece would be next week's
 *     first removal.
 *   - Listed under "keep" in content/guide-rotation.json - the founder's override.
 *   - Linked from site code (app/, components/, lib/). Deleting it would leave a
 *     hard-coded link to a page that no longer exists.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";

import { readGuideRotation } from "./lib/guide-rotation.mjs";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const GRACE_DAYS = 14;
const CATALOGUE_CAP = 10;
const INTENT = /\b(dupes?|alternatives?|clones?|smells like|cheaper than|inspired by)\b/i;
const GUIDE_LINK = /\/guide\/([a-z0-9-]+)/g;
// Same shape as FRAGRANCE_LINK_PATTERN in lib/related-guides.ts, which is what
// turns these links into the "Related reading" module.
const FRAGRANCE_LINK = /\/fragrance\/([a-z0-9-]+)/g;
const CODE_DIRS = ["app", "components", "lib"];
const CODE_FILE = /\.(ts|tsx|js|jsx|mjs)$/;

const args = process.argv.slice(2);
const option = (name) => {
  const at = args.indexOf(name);
  return at === -1 ? undefined : args[at + 1];
};
const today = option("--today") ?? new Date().toISOString().slice(0, 10);
const count = Number(option("--count") ?? 3);
if (!/^\d{4}-\d{2}-\d{2}$/.test(today)) throw new Error(`rank-guides: --today must be YYYY-MM-DD, got ${today}`);
if (!Number.isInteger(count) || count < 0) throw new Error(`rank-guides: --count must be a whole number`);

const { keep } = readGuideRotation(projectRoot, "rank-guides");

const guideDir = join(projectRoot, "content", "guide");
const guides = readdirSync(guideDir)
  .filter((file) => file.endsWith(".mdx"))
  .map((file) => {
    const { data, content } = matter(readFileSync(join(guideDir, file), "utf8"));
    // Unquoted YAML dates arrive as Date objects.
    const publishedAt =
      data.publishedAt instanceof Date ? data.publishedAt.toISOString().slice(0, 10) : String(data.publishedAt);
    return {
      slug: file.slice(0, -".mdx".length),
      title: String(data.title ?? ""),
      keywords: data.keywords ?? [],
      publishedAt,
      guideLinks: new Set([...content.matchAll(GUIDE_LINK)].map((m) => m[1])),
      fragranceLinks: new Set([...content.matchAll(FRAGRANCE_LINK)].map((m) => m[1])),
    };
  });

function codeFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return codeFiles(path);
    return CODE_FILE.test(name) ? [path] : [];
  });
}
const code = CODE_DIRS.flatMap((dir) => codeFiles(join(projectRoot, dir))).map((path) => ({
  path: relative(projectRoot, path).replace(/\\/g, "/"),
  text: readFileSync(path, "utf8"),
}));

const rows = guides.map((guide) => {
  const others = guides.filter((other) => other.slug !== guide.slug);
  const inbound = others.filter((other) => other.guideLinks.has(guide.slug)).length;
  const catalogue = guide.fragranceLinks.size;
  const sole = [...guide.fragranceLinks].filter((slug) => !others.some((o) => o.fragranceLinks.has(slug))).length;
  const intent = INTENT.test([guide.slug.replace(/-/g, " "), guide.title, ...guide.keywords].join(" ")) ? 1 : 0;
  const score = 3 * inbound + Math.min(catalogue, CATALOGUE_CAP) + 2 * sole + 8 * intent;

  const ageDays = Math.floor((Date.parse(today) - Date.parse(guide.publishedAt)) / 86_400_000);
  const linkedFrom = code.find((file) => new RegExp(`/guide/${guide.slug}(?![a-z0-9-])`).test(file.text));
  const protection =
    ageDays < GRACE_DAYS
      ? `new (${ageDays}d)`
      : keep.includes(guide.slug)
        ? "keep"
        : linkedFrom
          ? `code: ${linkedFrom.path}`
          : null;

  return { slug: guide.slug, title: guide.title, publishedAt: guide.publishedAt, score, inbound, catalogue, sole, intent, protection };
});

rows.sort(
  (a, b) => a.score - b.score || a.publishedAt.localeCompare(b.publishedAt) || a.slug.localeCompare(b.slug)
);
const retire = rows.filter((row) => row.protection === null).slice(0, count);

if (args.includes("--json")) {
  console.log(JSON.stringify({ today, count, retire: retire.map((r) => r.slug), guides: rows }, null, 2));
} else {
  const header = ["score", "in", "cat", "sole", "intent", "published", "slug", "status"];
  const table = rows.map((r) => [
    r.score,
    r.inbound,
    r.catalogue,
    r.sole,
    r.intent ? "yes" : "-",
    r.publishedAt,
    r.slug,
    retire.includes(r) ? "RETIRE" : (r.protection ?? "eligible"),
  ]);
  const widths = header.map((h, i) => Math.max(h.length, ...table.map((row) => String(row[i]).length)));
  for (const row of [header, ...table]) {
    console.log(row.map((cell, i) => String(cell).padEnd(widths[i])).join("  ").trimEnd());
  }
  console.log("");
  console.log(`today ${today}; ${rows.length} published; ${rows.filter((r) => r.protection === null).length} eligible`);
  if (retire.length < count) {
    console.log(`only ${retire.length} eligible guide(s), fewer than the ${count} asked for - retire only these`);
  }
  console.log(`RETIRE: ${retire.length ? retire.map((r) => r.slug).join(" ") : "(none)"}`);
}
