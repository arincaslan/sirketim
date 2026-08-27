import type { MetadataRoute } from "next";
import { getAllContent } from "@/content/loader";
import { buildContentSitemapEntries } from "@/lib/sitemap-builder";
import { REFERENCES } from "@/lib/data/references";
import { siteUrl } from "@/lib/site";

/**
 * Before /fragrance/[slug] existed this sitemap listed about eleven URLs for a
 * catalog of 68 fragrances, because nothing described an individual fragrance
 * at its own address. It now carries one entry per reference, which is the
 * bulk of what this site actually has to offer a search engine.
 *
 * `/producers/login` and `/producers/submit` are deliberately absent: a
 * sign-in form has no search value and the submit page is gated, so indexing
 * either just spends crawl budget on pages a searcher cannot use. robots.ts
 * disallows both to match - a sitemap that lists what robots.txt blocks is a
 * contradictory signal.
 */
const STATIC_ROUTES: Array<{ path: string; priority: number }> = [
  { path: "", priority: 1 },
  { path: "/dupe-finder", priority: 0.9 },
  { path: "/library", priority: 0.8 },
  { path: "/about", priority: 0.7 },
  { path: "/producers", priority: 0.7 },
  { path: "/producers/pricing", priority: 0.6 },
  { path: "/disclosure", priority: 0.4 },
  { path: "/privacy", priority: 0.3 },
  { path: "/contact", priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  const pieces = getAllContent();
  // Static routes have no per-page edit history to draw on, so they share the
  // build date. Content pieces carry their own real updatedAt from frontmatter.
  const builtAt = new Date();

  return [
    ...STATIC_ROUTES.map(({ path, priority }) => ({
      url: `${base}${path}`,
      lastModified: builtAt,
      changeFrequency: "weekly" as const,
      priority,
    })),
    ...REFERENCES.map((reference) => ({
      url: `${base}/fragrance/${reference.slug}`,
      lastModified: builtAt,
      // These change when a listing is added against them, not on a schedule.
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...buildContentSitemapEntries(base, pieces),
  ];
}
