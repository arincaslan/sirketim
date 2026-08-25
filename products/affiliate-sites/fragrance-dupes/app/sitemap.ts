import type { MetadataRoute } from "next";
import { getAllContent } from "@/content/loader";
import { buildContentSitemapEntries } from "@/lib/sitemap-builder";

const STATIC_ROUTES = ["", "/dupe-finder", "/library", "/about", "/disclosure"];

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
