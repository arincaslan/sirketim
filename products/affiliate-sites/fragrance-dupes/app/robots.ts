import type { MetadataRoute } from "next";
import { buildRobotsRules } from "@/lib/sitemap-builder";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example-placeholder.com";
  return buildRobotsRules(siteUrl);
}
