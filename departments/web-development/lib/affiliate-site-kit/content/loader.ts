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

let cache: ContentPiece[] | null = null;

/** All content pieces across all three content types, unsorted-guaranteed only by read order. */
export function getAllContent(): ContentPiece[] {
  if (cache) return cache;
  cache = CONTENT_TYPES.flatMap(readDir).sort(
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
