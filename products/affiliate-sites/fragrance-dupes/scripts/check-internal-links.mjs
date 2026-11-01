/**
 * Checks every internal link in the BUILT site. out/ is the only place the
 * whole link graph exists: MDX bodies, components and generated modules all
 * end up there, and the source alone cannot tell you what a page inherits.
 * Run it after a build; it reads, never writes.
 *
 *   node scripts/check-internal-links.mjs
 *
 * Exit 1 on any of:
 *   - a link to a page the export did not produce - a published 404, the
 *     first thing an affiliate reviewer clicks
 *   - a page link without its trailing slash: `trailingSlash: true` serves it a
 *     307, which Search Console files under "page with redirect" and does not
 *     index (CLAUDE.md, "Canonical URLs")
 *   - a /go/ link with no rule in out/_redirects: a buy button that 404s at the edge
 *   - any link to a retired guide. The 301 exists for visitors arriving from
 *     outside; inside the site the link itself must go (GUIDE-ROTATION.md)
 *   - a retired guide whose redirect target is not a page in out/
 *   - a guide that links to /go/ but sets `disclosure: false`, which drops the
 *     "contains affiliate links" block from a page that does contain them
 *
 * /go/ links are deliberately exempt from the slash rule: they are _redirects
 * sources, not pages, and a trailing slash breaks every one of them.
 */

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";

import { readGuideRotation } from "./lib/guide-rotation.mjs";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(projectRoot, "out");

if (!existsSync(join(out, "index.html"))) {
  console.error("check-internal-links: out/index.html is missing - build first (see GUIDE-ROTATION.md step 6).");
  process.exit(1);
}

function htmlFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return htmlFiles(path);
    return name.endsWith(".html") ? [path] : [];
  });
}

const redirectSources = new Set(
  existsSync(join(out, "_redirects"))
    ? readFileSync(join(out, "_redirects"), "utf8")
        .split(/\r?\n/)
        .filter((line) => line.trim() && !line.startsWith("#"))
        .map((line) => line.trim().split(/\s+/)[0])
    : []
);

const { retired } = readGuideRotation(projectRoot, "check-internal-links");
const retiredPaths = new Set(retired.map((r) => `/guide/${r.slug}/`));

const pageExists = (path) => existsSync(join(out, decodeURIComponent(path), "index.html"));

// problem -> target -> pages, so one bad link repeated on 200 pages reads as one line.
const problems = new Map();
const report = (problem, target, page) => {
  if (!problems.has(problem)) problems.set(problem, new Map());
  const byTarget = problems.get(problem);
  if (!byTarget.has(target)) byTarget.set(target, new Set());
  byTarget.get(target).add(page);
};

let pages = 0;
let links = 0;
for (const file of htmlFiles(out)) {
  pages++;
  const page = "/" + relative(out, file).replace(/\\/g, "/").replace(/index\.html$/, "");
  const html = readFileSync(file, "utf8");

  for (const [, raw] of html.matchAll(/href="([^"]*)"/g)) {
    if (!raw.startsWith("/") || raw.startsWith("//")) continue;
    links++;
    const path = raw.replace(/&amp;/g, "&").split(/[?#]/)[0];

    if (path.startsWith("/go/")) {
      if (!redirectSources.has(path)) report("/go/ link with no rule in _redirects", path, page);
      continue;
    }
    // A file rather than a page: favicons, images, feeds, _next chunks.
    if (/\.[a-z0-9]+$/i.test(path)) {
      if (!existsSync(join(out, decodeURIComponent(path)))) report("link to a file that is not in out/", path, page);
      continue;
    }
    if (!path.endsWith("/")) {
      report("page link without its trailing slash", path, page);
      continue;
    }
    if (retiredPaths.has(path)) {
      report("link to a retired guide (remove the link)", path, page);
      continue;
    }
    if (!pageExists(path)) report("link to a page the export did not produce", path, page);
  }
}

for (const { slug, redirectTo } of retired) {
  if (!pageExists(redirectTo)) report("retired guide redirects to a page that does not exist", `${slug} -> ${redirectTo}`, "content/guide-rotation.json");
}

const guideDir = join(projectRoot, "content", "guide");
for (const file of readdirSync(guideDir).filter((f) => f.endsWith(".mdx"))) {
  const { data, content } = matter(readFileSync(join(guideDir, file), "utf8"));
  if (/\/go\//.test(content) && data.disclosure === false) {
    report("guide links to /go/ but sets disclosure: false", file, `content/guide/${file}`);
  }
}

if (problems.size === 0) {
  console.log(`check-internal-links: OK - ${links} internal links across ${pages} pages, ${retired.length} retired guide(s).`);
  process.exit(0);
}

for (const [problem, byTarget] of problems) {
  console.error(`\n${problem} (${byTarget.size}):`);
  for (const [target, onPages] of byTarget) {
    const sample = [...onPages].slice(0, 3).join(", ");
    console.error(`  ${target}  <- ${sample}${onPages.size > 3 ? ` and ${onPages.size - 3} more` : ""}`);
  }
}
console.error(`\ncheck-internal-links: FAILED (${links} internal links across ${pages} pages checked).`);
process.exit(1);
