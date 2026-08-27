/**
 * The site's canonical origin, in one place.
 *
 * This fallback was previously repeated in app/layout.tsx, app/sitemap.ts and
 * app/robots.ts, which meant three chances to disagree about what the site is
 * called. Canonical URLs, OpenGraph URLs, the sitemap and robots.txt must all
 * agree or search engines get contradictory signals about which URL is real.
 *
 * The domain is real as of 2026-08-27, so it is the DEFAULT rather than an
 * env var that has to be remembered. A forgotten dashboard setting would
 * otherwise ship canonicals and a sitemap pointing at a placeholder host,
 * which is the kind of mistake that is invisible in review and expensive in
 * search results.
 *
 * NEXT_PUBLIC_SITE_URL still overrides it, for preview deployments or if the
 * domain ever changes.
 */
const DEFAULT_SITE_URL = "https://parfumoza.com";

export function siteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!configured) return DEFAULT_SITE_URL;
  // Trailing slashes produce `//path` when concatenated, which reads as a
  // different URL to a crawler than the one without.
  return configured.replace(/\/+$/, "");
}

/** The public contact address, shown on /contact and used in outreach.
 *
 *  A real, monitored inbox on the site's own domain (created 2026-08-27).
 *  Affiliate managers reply here, and a contact page that goes nowhere is a
 *  common silent reason for a merchant application to be declined - so this
 *  is a constant, not an env var somebody has to remember to set. */
export const CONTACT_EMAIL = "contact@parfumoza.com";

/** Absolute URL for a site-relative path, for canonicals and structured data. */
export function absoluteUrl(path: string): string {
  return `${siteUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}
