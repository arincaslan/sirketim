import type { MetadataRoute } from "next";
import type { ContentPiece } from "../content/loader";

/**
 * Shared affiliate-site-kit: "walk content, build URL list" logic, so a
 * site's own app/sitemap.ts stays a thin wrapper instead of a
 * reimplementation. See the technical plan §2.
 */
export function buildContentSitemapEntries(
  siteUrl: string,
  pieces: ContentPiece[]
): MetadataRoute.Sitemap {
  return pieces.map((p) => ({
    url: `${siteUrl}/${p.frontmatter.contentType}/${p.frontmatter.slug}`,
    lastModified: p.frontmatter.updatedAt ?? p.frontmatter.publishedAt,
    changeFrequency: "monthly" as const,
    priority: p.frontmatter.contentType === "comparison" ? 0.9 : 0.7,
  }));
}

/** Standard robots.txt rules: allow all, disallow the /go/ redirect route. */
export function buildRobotsRules(siteUrl: string): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/go/"] },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
