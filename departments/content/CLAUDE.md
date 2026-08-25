# Content

Ongoing long-form content production: buying guides, comparison posts, and reviews — the kind of content an affiliate/SEO site lives or dies on. Set up 2026-08-24, specifically to close a gap flagged in an earlier passive-income strategy review: nobody owned this work, and the missing content-production capability was the real blocker on affiliate sites, more ahead of any technical build.

## Why this is its own department, not a scope expansion

The founder was explicitly offered the option of folding this into `ad-strategist`'s existing scope and rejected it, asking for a distinct new structure instead. The two jobs are genuinely different in cadence and craft, not just adjacent:

- **Advertising** (`ad-strategist`) produces short-form campaign content — social captions, hooks, hashtags, image/video briefs — optimized for a feed, refreshed weekly, tied to a posting cadence.
- **Content** produces long-form, evergreen, search-intent-driven pages — a single buying guide or comparison post is a durable asset meant to rank and keep earning for years, not a post that cycles out of a feed. It needs keyword/SERP research, structured content architecture (pillar pages, internal linking, comparison tables), and SEO/schema output — a different skill set and a different definition of "done" than a caption.

Following the same pattern this repo already used when Accounting and Control/Audit were split out as their own departments (see `shared/board.md`'s Status note) rather than folded into an existing one: when a genuinely new ongoing function emerges, it gets its own department + subagent, not a quiet scope expansion of whatever's nearest.

## What this department owns

- Niche → content plan: turning a chosen affiliate niche (see `../sales/CLAUDE.md` for how niches get evaluated) into a content architecture — pillar pages, comparison posts, individual review posts, the keyword clusters each targets, and a rough content calendar.
- Long-form drafts: the actual buying-guide/comparison/review copy, written to whatever content format `web-development` decides the site uses (MDX front matter today — see `../web-development/`'s technical foundation plan for affiliate sites once it lands).
- SEO/schema metadata per piece: meta title/description, target keyword, and the data needed to populate Article/Product/Review JSON-LD (the actual JSON-LD *rendering* is web-development's job — this department supplies the structured data that feeds it).
- Affiliate-link placement strategy within content (which product mention gets a link, anchor text) — not the technical link-cloaking/redirect mechanism itself, that's `../web-development/`'s.
- FTC/affiliate-disclosure copy for every piece that carries affiliate links — non-negotiable, not optional boilerplate.

## What this department does NOT own

- Site build, hosting, deploy, sitemap/robots, JSON-LD rendering, link-cloaking infrastructure — all `web-development`.
- Niche selection methodology and marketplace/commission viability — `sales`. Content only starts once a niche is chosen.
- Social/paid distribution of content pieces — `advertising`, if and when that's warranted.
- Actual affiliate-program enrollment (Amazon Associates or otherwise) and any live posting — founder-level decisions, not this department's or any subagent's to make unilaterally.

## Workflow

Use the **`affiliate-content` skill** (`.claude/skills/affiliate-content/SKILL.md`) for the niche → plan → draft → schema pipeline — don't freehand long-form content without going through it, the same way sales doesn't freehand proposals outside `client-proposal`.

1. **Intake**: which niche/site (from `sales`'s recommendation), what site sections/pages already exist or are planned (from `web-development`).
2. **Content plan**: pillar pages, comparison/review post list, keyword clusters, calendar — via the skill.
3. **Draft**: long-form pieces in the site's decided content format, each with disclosure copy and affiliate-link placement notes.
4. **SEO/schema metadata**: per-piece meta + structured data for web-development to render.
5. **Handoff**: drafts + metadata go to `web-developer` for integration into the actual site codebase — this department doesn't commit content directly into a site's repo/content store, it hands off a reviewable draft.

## Conventions

- Work-in-progress content plans/drafts live under `projects/<site-slug>/` (mirrors advertising's `campaigns/<slug>/` pattern) — e.g. `projects/carbide-tools/`, `projects/<second-niche-slug>/` — until handed off to web-development's site repo.
- Register the underlying product (each affiliate site) in `../../products/README.md`'s line-item list once web-development confirms where the sites live under `products/`.
- Use the `content-strategist` subagent (`.claude/agents/content-strategist.md`) for this department's work.

## Status

Set up 2026-08-24 alongside the affiliate-sites initiative. Capability/structure only as of this date — no populated content library yet; the first real content plan follows once the second niche is chosen (sales-strategist, in progress) and web-development's shared technical foundation for the two sites is in place.
