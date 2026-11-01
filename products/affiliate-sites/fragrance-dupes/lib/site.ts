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
const DEFAULT_SITE_URL = "https://counterscent.com";

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
export const CONTACT_EMAIL = "contact@counterscent.com";

/**
 * Where the producer console lives.
 *
 * A SECOND ORIGIN, NOT A ROUTE ON THIS SITE. Accounts, submissions, the review
 * queue and everything else a producer does need a server and a database. This
 * project has neither and is committed to not having them: `output: "export"`,
 * no route handlers, and 620 affiliate redirects served from a generated
 * `_redirects` file that a Worker on this origin would stop applying. So the
 * console is its own Cloudflare Worker on its own hostname. See HANDOFF.md,
 * "The architecture answer: do not touch the static site", and
 * products/affiliate-sites/counterscent-producers/.
 *
 * A constant rather than an env var, for the same reason as CONTACT_EMAIL
 * above: a forgotten deployment setting would turn every "sign in" link on the
 * marketing pages into a link to nowhere, and a static export bakes that in.
 *
 * No trailing slash: every use appends a path.
 */
export const PRODUCER_CONSOLE = "https://producers.counterscent.com";

/**
 * THE REGISTERED COMPANY BEHIND COUNTERSCENT - the contracting party in the
 * terms, the operator named in the footer, and the name a merchant of record
 * compares against the registration document. NOT the name on the privacy
 * notices any more: see DATA_CONTROLLER below.
 *
 * Founder decision, 2026-11-01. Until then the site said "Sirketim A.Ş.", which
 * is the internal workspace name, while the affiliate networks (CJ, Awin) and
 * the accounting memo all carry this title.
 *
 * Written exactly as registered with the networks, abbreviations included.
 * Do not expand "TUR. SAN. TİC." by guesswork - if the trade registry spells it
 * out differently, change it HERE and every legal page follows.
 */
export const LEGAL_ENTITY = "IGDIR İNŞAAT MADENCİLİK TUR. SAN. TİC. A.Ş.";

/**
 * THE NAME THE PRIVACY AND COOKIE NOTICES GIVE AS DATA CONTROLLER (veri
 * sorumlusu). Founder instruction, 2026-11-01, the same day LEGAL_ENTITY was
 * first put there: "veri sorumlusu Counterscent'tir yazalım".
 *
 * THE RISK, recorded so nobody discovers it later: KVKK Article 10 requires the
 * notice to state the controller's IDENTITY, and a controller is a natural or
 * legal person. Counterscent is a brand, not a registered company, so a
 * regulator or a court could read a notice naming only the brand as not
 * identifying the controller at all - an Article 10 breach, which Article 18
 * fines. The terms still name LEGAL_ENTITY as the contracting party (a brand
 * cannot sign a contract), and VERBIS, if registration applies, is filed under
 * the company. LEGAL-COMPLIANCE.md carries this as an open lawyer item. If the
 * founder or a lawyer reverses it, render LEGAL_ENTITY in the two "controller"
 * sections of app/privacy and app/tr/gizlilik instead of this.
 */
export const DATA_CONTROLLER = "Counterscent";

/**
 * How a data subject reaches us. A postal address for KVKK applications is
 * an OPEN ITEM (founder chose email-only for now, 2026-11-01); the policies say
 * the registered address is available on request. When it is known, add it
 * here as LEGAL_ADDRESS and render it on /privacy and /tr/gizlilik.
 */
export const PRIVACY_CONTACT_EMAIL = CONTACT_EMAIL;

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
/**
 * CARRIED OVER FROM THE OLD DOMAIN — needs one manual step in GA4.
 *
 * This property and data stream were created on 2026-08-27 against the
 * previous domain, before the rename. The ID keeps collecting after a domain
 * change (GA4 keys on the measurement ID, not the hostname), so nothing breaks
 * loudly — which is precisely the risk: the stream's configured URL still
 * names the dead domain, and Enhanced Measurement's cross-domain and
 * referral-exclusion settings are derived from it.
 *
 * Update the data stream's URL in GA4 to the new domain, or create a fresh
 * property. Search Console is different and does NOT carry over: a Domain
 * property is per-domain, so the new domain needs its own verification and its
 * own sitemap submission.
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

/**
 * Absolute URL in the site's CANONICAL form - with a trailing slash.
 *
 * `next.config.mjs` sets `trailingSlash: true`, so /about is not a page: it is
 * a 307 to /about/. Next's own canonical tags already account for this, but
 * anything we build by hand does not, and the two silently disagreed.
 *
 * That is not cosmetic. Every one of the 86 URLs in sitemap.xml was emitted
 * without the slash while the matching page's canonical carried one, so the
 * sitemap advertised 86 redirecting, explicitly non-canonical URLs. Search
 * Console logs those as "Page with redirect", crawls them more slowly, and
 * the contradiction lands at exactly the wrong moment - the start of the
 * analytics/indexing window before an affiliate application.
 *
 * Use this for sitemap entries and any hand-built absolute URL. Asset paths
 * with a file extension (/og-cover.png) are returned unchanged, since those
 * are real files and must NOT gain a slash.
 */
export function canonicalUrl(path: string): string {
  const url = absoluteUrl(path);
  if (url.endsWith("/")) return url;
  // A dot in the last segment means a file, not a route.
  const lastSegment = url.slice(url.lastIndexOf("/") + 1);
  if (lastSegment.includes(".")) return url;
  return `${url}/`;
}
