/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  /**
   * Static export (added 2026-08-27 for the Cloudflare Pages deploy).
   *
   * This site has no dynamic server surface to give up: no cookies(), no
   * headers(), no force-dynamic, no revalidate, and - since the Stripe routes
   * were deleted - no API routes. Every page was already statically
   * renderable, so `output: "export"` is a change of build target rather than
   * a downgrade in capability.
   *
   * Why it matters: it is what makes free static hosting viable. See
   * departments/web-development/CLAUDE.md, "Choosing a host" - the paid
   * alternatives are a 48-month prepayment whose renewal is 3-4x the headline
   * price, for a pre-revenue site whose pages are all static HTML.
   *
   * The one thing that had to move is /go/[slug]: a route handler cannot
   * return a 302 in a static export. It is now generated into public/_redirects
   * at build time by scripts/generate-redirects.mjs. See that file.
   */
  output: "export",

  /**
   * Next's image optimizer is a server feature and cannot run in an export.
   * Six components use next/image; with this flag they emit plain <img> tags
   * pointing at the original source.
   *
   * Cost of this is currently zero: ReferenceFragrance.imageUrl is empty on
   * every entry by design (perfume bottles are protected trade dress - see
   * this project's CLAUDE.md), so there is no product photography to optimise.
   * Revisit when Phase 4 populates imageUrl from an affiliate feed: Cloudflare
   * Images or a build-time resize step would then be worth having.
   */
  images: { unoptimized: true },

  /**
   * Emit /about as /about/index.html rather than /about.html, so static hosts
   * resolve the trailing-slash and non-slash forms consistently instead of
   * one 404ing.
   */
  trailingSlash: true,
};

export default nextConfig;
