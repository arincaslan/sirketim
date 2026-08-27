import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import {
  contentFrontmatter,
  type ContentFrontmatter,
  type ContentType,
} from "./schema";

/**
 * Shared affiliate-site-kit: content loader.
 *
 * Reads MDX files from `content/<content-type>/<slug>.mdx`, validates
 * frontmatter against the zod schema, and returns typed content pieces.
 * Fails loudly (throws, with the offending file path) if a piece doesn't
 * parse - per the technical plan §1, that's the point: a bad handoff from
 * content-strategist should be a build-time error, not a silently broken
 * page.
 */

export interface ContentPiece {
  frontmatter: ContentFrontmatter;
  body: string; // raw MDX source, rendered by the page via next-mdx-remote/rsc
  filePath: string;
}

const CONTENT_ROOT = path.join(process.cwd(), "content");
const CONTENT_TYPES: ContentType[] = ["guide", "comparison", "review"];

function readDir(contentType: ContentType): ContentPiece[] {
  const dir = path.join(CONTENT_ROOT, contentType);
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".mdx"))
    .map((file) => {
      const filePath = path.join(dir, file);
      const raw = fs.readFileSync(filePath, "utf-8");
      const { data, content } = matter(raw);

      const parsed = contentFrontmatter.safeParse(data);
      if (!parsed.success) {
        throw new Error(
          `[affiliate-site-kit] Invalid frontmatter in ${filePath}:\n${parsed.error.issues
            .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
            .join("\n")}`
        );
      }

      if (parsed.data.slug !== path.basename(file, ".mdx")) {
        throw new Error(
          `[affiliate-site-kit] Slug mismatch in ${filePath}: frontmatter slug "${parsed.data.slug}" must match filename "${path.basename(file, ".mdx")}"`
        );
      }

      return { frontmatter: parsed.data, body: content, filePath };
    });
}

/**
 * Every content piece renders a card linking to `/<contentType>/<slug>`
 * (components/content/content-card.tsx), so a piece whose content type has no
 * route is a published 404 - the single thing an affiliate-network reviewer is
 * most reliably going to click.
 *
 * That is not hypothetical here. `app/comparison/[slug]` and `app/review/[slug]`
 * were DELETED on 2026-08-27 because a static export rejects a dynamic route
 * that generates zero pages, and both directories were empty. The routes are
 * recoverable from git history and should come back the moment either type has
 * a real piece - but nothing forced the two facts to stay in step, so writing
 * one comparison would have quietly shipped a broken link.
 *
 * Checking the filesystem rather than a hand-maintained list is deliberate: a
 * list is one more thing to update in the same change, which is exactly the
 * step that was missed the first time.
 */
function assertRouteExists(piece: ContentPiece): void {
  const routeDir = path.join(process.cwd(), "app", piece.frontmatter.contentType, "[slug]");
  if (fs.existsSync(routeDir)) return;

  throw new Error(
    `[affiliate-site-kit] ${piece.filePath} is a "${piece.frontmatter.contentType}" piece, ` +
      `but app/${piece.frontmatter.contentType}/[slug] does not exist, so it would render a card ` +
      `linking to a 404.\n` +
      `  Restore the route before publishing this piece - it is in git history:\n` +
      `    git log --oneline --diff-filter=D -- "app/${piece.frontmatter.contentType}/[slug]/page.tsx"\n` +
      `  Note that comparison and review pieces also require a real affiliateLinkId ` +
      `(content/schema.ts), which needs an enrolled programme.`
  );
}

let cache: ContentPiece[] | null = null;

/** All content pieces across all three content types, unsorted-guaranteed only by read order. */
export function getAllContent(): ContentPiece[] {
  if (cache) return cache;
  const pieces = CONTENT_TYPES.flatMap(readDir);
  pieces.forEach(assertRouteExists);
  cache = pieces.sort(
    (a, b) =>
      new Date(b.frontmatter.publishedAt).getTime() -
      new Date(a.frontmatter.publishedAt).getTime()
  );
  return cache;
}

export function getContentByType(contentType: ContentType): ContentPiece[] {
  return getAllContent().filter((p) => p.frontmatter.contentType === contentType);
}

export function getContentBySlug(
  contentType: ContentType,
  slug: string
): ContentPiece | undefined {
  return getContentByType(contentType).find((p) => p.frontmatter.slug === slug);
}
