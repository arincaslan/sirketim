# affiliate-site-kit

Shared, niche-agnostic infrastructure for Sirketim's affiliate/SEO content
sites (`products/affiliate-sites/<niche-slug>/`). See
`departments/web-development/reports/affiliate-sites-technical-plan.md` for
the full reasoning - this folder is that plan's §6 ("shared package
assessment") actually built.

## What this is, and isn't

**Copied at scaffold time, not a live npm/workspace dependency.** This repo
has no monorepo tooling; every project under `products/` is fully
self-contained. Copy the relevant subfolders straight into a new site's own
`content/`, `lib`, `components`, and `app/go/` - each site then owns its copy
and is free to diverge if a niche genuinely needs it.

**What's in here** (all pure/generic, no visual design, no niche-specific
content):

- `content/schema.ts` - the zod frontmatter schema (guide / comparison / review)
- `content/loader.ts` - `getAllContent()` / `getContentByType()` / `getContentBySlug()`
- `lib/jsonld.ts` + `components/JsonLd.tsx` - Article/Review/ItemList JSON-LD builders
- `lib/affiliate-links.ts` + `app/go/[slug]/route.ts` + `components/AffiliateLink.tsx` - the link-cloaking pattern
- `components/Analytics.tsx` - env-var-gated GA4 (renders nothing without a real ID)
- `lib/sitemap-builder.ts` - shared logic for a site's own `app/sitemap.ts`/`app/robots.ts`

**What's deliberately NOT in here**: Tailwind theme/visual design, actual
content, category/taxonomy, per-network affiliate-link quirks. Each site's
visual identity is its own - see that site's own `DESIGN.md`.

## How a new site consumes this

1. Copy `content/`, the relevant `lib/*.ts` files, `components/*.tsx`, and
   `app/go/` into the new site's own matching folders.
2. Populate `lib/affiliate-links.ts` with the site's own (placeholder, until
   real programs exist) entries.
3. Write a thin `app/sitemap.ts` / `app/robots.ts` calling
   `buildContentSitemapEntries()` / `buildRobotsRules()` with the site's own
   `NEXT_PUBLIC_SITE_URL`.
4. Mount `<GoogleAnalytics />` once in the site's root `app/layout.tsx`, and
   add `verification: { google: process.env.NEXT_PUBLIC_GSC_VERIFICATION }`
   to the root `metadata` export.
5. Drop MDX content into `content/<guide|comparison|review>/<slug>.mdx`,
   frontmatter conformed to `content/schema.ts`.

## Escalation trigger

If a third content/SEO site shows up (another affiliate site, or a client
project wanting this same architecture), graduate this into a real npm/pnpm
workspace package with one source of truth. Not before - see the technical
plan §6.

## Consumers

- `products/affiliate-sites/fragrance-dupes/` (first consumer, 2026-08-25)
