import type { MetadataRoute } from "next";
import { getAllContent } from "@/content/loader";
import { buildContentSitemapEntries } from "@/lib/sitemap-builder";

/**
 * `/producers` and `/producers/pricing` are public marketing pages and belong
 * here. `/producers/login` and `/producers/submit` deliberately do not: a
 * sign-in form has no search value, and the submit page is gated, so indexing
 * either just spends crawl budget on pages a searcher cannot use.
 */
const STATIC_ROUTES = [
  "",
  "/dupe-finder",
  "/library",
  "/about",
  "/disclosure",
  "/producers",
  "/producers/pricing",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example-placeholder.com";
  const pieces = getAllContent();

  return [
    ...STATIC_ROUTES.map((route) => ({
      url: `${siteUrl}${route}`,
      changeFrequency: "weekly" as const,
      priority: route === "" ? 1 : 0.8,
    })),
    ...buildContentSitemapEntries(siteUrl, pieces),
  ];
}
