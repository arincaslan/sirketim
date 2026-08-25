---
name: affiliate-content
description: Turn a chosen affiliate niche into a content plan, long-form drafts (buying guides, comparisons, reviews), and SEO/schema metadata, ready for web-development to integrate into a site. Use once a niche is confirmed and before any affiliate content gets written freeform.
---

# Affiliate Content

Produces a content plan and long-form drafts under `departments/content/projects/<site-slug>/`, per `departments/content/CLAUDE.md`. Owned by the `content-strategist` subagent.

## Steps

1. **Intake**. Confirm: which niche/site (name, product category, what's already been researched by `sales` on commission/cookie-window/competitive landscape — don't re-derive that, reuse it), what site sections exist or are planned per `web-development`'s technical foundation for the affiliate-sites line (content format: MDX vs CMS — write drafts in whatever format that plan specifies), and whether this is a brand-new site or an addition to an existing content set.
2. **Content plan** (`projects/<site-slug>/content-plan.md`): site content architecture — pillar/hub pages, the comparison and individual review posts under each, and the keyword cluster each piece targets (use WebSearch for real search-intent signal — "best X," "X vs Y," "X review" patterns — don't invent keywords with no evidence of demand). Include a rough publish-order/calendar: what ships first (usually the highest-intent comparison or "best of" pillar piece) and what follows.
3. **Draft** (`projects/<site-slug>/drafts/<piece-slug>.md` or `.mdx`, matching the site's decided content format): the actual long-form piece — buying guide, comparison table, or individual review. Every draft that contains an affiliate-link placement gets:
   - Real, useful content — don't pad a piece to hit a word count; a shorter genuinely useful comparison beats a bloated one for both readers and ranking.
   - **FTC-compliant affiliate disclosure copy**, non-negotiable, placed prominently (near the top, not buried in a footer).
   - Affiliate-link placement marked clearly as **placeholder** (e.g. `[Product Name — PLACEHOLDER AFFILIATE LINK]`) — never a real affiliate link; no affiliate-program enrollment exists yet, and none should be inferred from this skill running.
4. **SEO/schema metadata** (`projects/<site-slug>/drafts/<piece-slug>.meta.json` or frontmatter, matching whatever format web-development's plan expects): meta title, meta description, target keyword, and the structured fields needed for the site to render Article schema (and Product/Review schema for review pieces — rating, pros/cons, summary verdict) as JSON-LD. This department supplies the data; rendering it into actual JSON-LD markup is `web-developer`'s job, not this skill's.
5. **Handoff note**: a short summary of what's ready for web-development to pull into the site (piece count, format, any open questions about how a field maps to the site's schema component) — don't commit content directly into a site's own repo/content directory from this skill; hand off for web-development to integrate and review.

## Notes

- This skill is scoped to affiliate/SEO content today but isn't inherently affiliate-only — if a non-affiliate content-heavy product ever needs the same niche→plan→draft→schema pipeline, reuse it rather than building a parallel one.
- Don't fabricate commission rates, search volume, or competitive claims in a content plan — pull real figures from `sales`'s niche research (see `departments/sales/`) and real search-intent signal via WebSearch, cite what you found the way `product-listing` requires for marketplace research.
- No live publishing, no real affiliate links, no affiliate-program enrollment — this skill's output is a reviewable draft, not a shipped page.
