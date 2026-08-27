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

/**
 * GA4 measurement ID (property created 2026-08-27).
 *
 * A constant rather than a build variable, for the same reason as the two
 * above and one more:
 *
 *  - It is NOT a secret. It ships in the HTML of every page and is visible to
 *    every visitor; treating it as a credential would be cargo-culting.
 *  - A static export inlines this at build time, so a forgotten dashboard
 *    variable does not degrade gracefully - it silently collects nothing, and
 *    "no data" looks identical to "no traffic" for weeks.
 *  - The Cloudflare project's dashboard settings failed to apply four times
 *    during the deploy. Adding a fifth dependency on one would be optimistic.
 *
 * NEXT_PUBLIC_GA_MEASUREMENT_ID still overrides it - set it to a different
 * property for a staging build, or to an empty string to disable analytics
 * entirely.
 */
const DEFAULT_GA_MEASUREMENT_ID = "G-4Q54ZJKVW1";

/**
 * Returns the GA4 ID, or null when analytics must not run.
 *
 * Gated on NODE_ENV so `npm run dev` never pollutes the property with local
 * pageviews - which matters here specifically, because the whole point of
 * enabling analytics now is to answer "monthly unique visitors" honestly on
 * an affiliate application. Development traffic in that number would make the
 * answer wrong in the direction that looks self-serving.
 */
export function gaMeasurementId(): string | null {
  if (process.env.NODE_ENV !== "production") return null;
  const configured = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const id = configured === undefined ? DEFAULT_GA_MEASUREMENT_ID : configured.trim();
  return id === "" ? null : id;
}

/** Absolute URL for a site-relative path, for canonicals and structured data. */
export function absoluteUrl(path: string): string {
  return `${siteUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}
