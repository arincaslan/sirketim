import type { MetadataRoute } from "next";
import { buildRobotsRules } from "@/lib/sitemap-builder";
import { siteUrl } from "@/lib/site";

/**
 * The shared kit supplies the standard rules (allow all, disallow the /go/
 * redirect). The producer routes are this site's own addition and are layered
 * on here rather than pushed into the kit, which other affiliate sites reuse
 * and which has no notion of a producer program.
 *
 * `/producers/submit` is gated and `/producers/login` is a sign-in form -
 * neither has search value, and crawling them wastes budget on pages a
 * searcher cannot use. The public producer pages (`/producers`,
 * `/producers/pricing`) stay indexable; they are how a fragrance house finds
 * this at all. `/fragrance/*` is deliberately NOT disallowed - those pages are
 * the point of the catalog.
 */
const SITE_ONLY_DISALLOW = ["/producers/submit", "/producers/login"];

export default function robots(): MetadataRoute.Robots {
  const base = buildRobotsRules(siteUrl());
  const baseRule = Array.isArray(base.rules) ? base.rules[0] : base.rules;
  const baseDisallow = baseRule?.disallow;

  return {
    ...base,
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        ...(Array.isArray(baseDisallow) ? baseDisallow : baseDisallow ? [baseDisallow] : []),
        ...SITE_ONLY_DISALLOW,
      ],
    },
  };
}
