/**
 * The site's canonical origin, in one place.
 *
 * This fallback was previously repeated in app/layout.tsx, app/sitemap.ts and
 * app/robots.ts, which meant three chances to disagree about what the site is
 * called. Canonical URLs, OpenGraph URLs, the sitemap and robots.txt must all
 * agree or search engines get contradictory signals about which URL is real.
 *
 * NEXT_PUBLIC_SITE_URL is read at build time. While it is unset every absolute
 * URL on the site points at an obvious placeholder host - which is correct
 * behaviour for a site with no domain yet, and loud enough to notice if it
 * ever reached production. Set it before deploying (FINALIZATION-GUIDE.md
 * phase 1.4).
 */
const PLACEHOLDER = "https://example-placeholder.com";

export function siteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!configured) return PLACEHOLDER;
  // Trailing slashes produce `//path` when concatenated, which reads as a
  // different URL to a crawler than the one without.
  return configured.replace(/\/+$/, "");
}

/** True while no real domain is configured. */
export function isPlaceholderSiteUrl(): boolean {
  return siteUrl() === PLACEHOLDER;
}

/** Absolute URL for a site-relative path, for canonicals and structured data. */
export function absoluteUrl(path: string): string {
  return `${siteUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}
