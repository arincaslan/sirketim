# Parfumoza — Sirketim Product

An independent fragrance-dupe comparison and affiliate content site built
around an **interactive comparison tool** (the Dupe Finder), not a text
wall: pick a designer/niche fragrance you know, see ranked dupe candidates
scored by a disclosed formula, and compare each one against the original on
a visual radar chart plus a grouped spec panel (composition, wear, value).
Long-form editorial content (guides, comparisons, reviews) lives alongside
it and reuses the same components and dataset.

This is a **Sirketim product** (`products/affiliate-sites/fragrance-dupes/`),
built on the shared infrastructure at
`departments/web-development/lib/affiliate-site-kit/` (content schema/loader,
JSON-LD, the `/go/[slug]` affiliate-link cloaking pattern, env-var-gated
analytics, sitemap/robots) but with its own from-scratch visual identity —
see `DESIGN.md` for the full direction rationale, differentiation from the
three fragrance e-commerce templates (`fragrance-store`, `-2`, `-3`), and
the computed design-token/contrast work behind it.

## Stack

- [Next.js 14](https://nextjs.org/) (App Router) + TypeScript
- Tailwind CSS + hand-rolled shadcn-style primitives (`Button`, `Card`,
  `Badge`, `Separator`, `Accordion`, `Tabs`) — no Dialog/Sheet in this build,
  the Dupe Finder uses an in-page two-pane layout instead of a modal
- [Motion](https://motion.dev/) (`motion/react`, the current `framer-motion`
  successor) for every animation, gated globally through `MotionConfig
  reducedMotion="user"` (`components/site/motion-provider.tsx`) so
  `prefers-reduced-motion` is respected everywhere without a manual check in
  every component
- [@phosphor-icons/react](https://phosphoricons.com/) for icons (not
  lucide-react — see `DESIGN.md`'s taste-skill reasoning)
- `zod` + `gray-matter` + `next-mdx-remote/rsc` for the MDX content pipeline
- **No charting library.** The radar chart (`components/dupe-finder/radar-chart.tsx`)
  is a hand-built SVG component, not a Recharts/Chart.js wrapper — see its
  doc comment for why (the signature "Match Reveal" stroke-draw + spring
  needed direct control Motion's SVG primitives give cleanly).
- **Fonts**: Cormorant Garamond (display) + Public Sans (UI/body) — both
  real Google Fonts via `next/font/google`, not used by any sibling template
- **No backend, no database, no cart.** This is a content/comparison site,
  not a storefront.

## Running it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm run start    # serve the production build
npm run lint      # eslint
```

`npm run build` and `npm run lint` both pass cleanly as shipped (reconfirmed
2026-08-25 after the homepage redesign pass — clean production build, zero
ESLint warnings/errors, all 15 routes still render, confirmed with a real
dev-server `curl` smoke test across every route including `/go/[slug]`'s
404 behavior, `/sitemap.xml`, and `/robots.txt`, plus the two new video
files serving with the correct `video/mp4` content-type).

**Dev-server note**: during this pass, a production `npm run build` was
briefly run while a `npm run dev` process was also live against the same
`.next/` directory — Next.js does not support that safely, and it corrupted
`.next/`'s webpack manifest badly enough that the dev server started
404ing on every route. Fixed by killing both processes, deleting `.next/`,
and running one clean build and one clean `npm run dev` in sequence rather
than concurrently (confirmed recovered - full route sweep back to 200).
Flagged here as a standing gotcha for this project specifically, since a
dev server is commonly left running for founder preview: never run
`npm run build`/`npm run start` in the same project directory while
`npm run dev` is active.

## The homepage

`app/page.tsx` is a six-chapter scroll narrative (Hero, Trend, Gap, Formula,
Try It, Standards, closing on a compact library-proof strip), rebuilt from a
conventional stacked-sections landing page on 2026-08-25 at the founder's
request for Awwwards-caliber quality - see DESIGN.md's "Implementation
addendum v2" for the chapter-by-chapter redesign rationale.

The same day, second-round founder feedback said the result still read as
generic despite working functionally, naming the cursor and the `whileInView`
scroll reveals specifically as the borrowed/common parts. That produced
**"The Atomizer"** (DESIGN.md's "Implementation addendum v3") - one bespoke
mist/spray motion system, not another decorative layer, built around the
founder's own idea ("effects or animations with bottle atomizer") and shown
at exactly four moments: `components/site/custom-cursor.tsx` (full rewrite,
not a re-skin - a canvas-based mist trail replacing the dot+ring spring
cursor that had been adapted from `fragrance-store`'s precedent, gone
entirely now), `components/home/atomizer-spritz.tsx` (an abstract SVG
atomizer silhouette that releases mist leading directly into the existing
radar chart in chapter 3 - tying the flourish to the site's real data,
`radar-chart.tsx` itself untouched), `components/site/preloader.tsx` (exit
reworked into a blur-dissolve + mist burst, same proven counter/timing
mechanics underneath, still mounted once via `lib/preloader-timing.ts`), and
`components/home/mist-headline.tsx` (the hero headline's one deliberate
text-dispersal moment, not a reusable pattern). `components/site/mist-burst.tsx`
is a small shared particle-burst primitive behind both the preloader and the
spritz - the same piece of code in two places, deliberately, so it reads as
one system.

## The Dupe Finder

`/dupe-finder` — the product's centerpiece, built to genuinely beat the
category's dominant authority site's actual UX weaknesses (cluttered
layout, plain-text note pyramids, no real matching flow — see
`departments/sales/affiliate-niche-research.md`), not just look nicer:

1. **Reference picker** — 6 real, commonly-duped designer/niche fragrances
   (Baccarat Rouge 540, Bleu de Chanel, Black Opium, Coco Mademoiselle,
   Tobacco Vanille, Santal 33).
2. **Ranked results** — every dupe candidate for that reference, sorted by a
   similarity score computed live from `lib/similarity.ts` (weighted note
   overlap 50%, facet closeness 35%, family match 15% — never a hardcoded
   number), with price-per-ml value framing and a one-line "why it matches"
   rationale per card.
3. **Full comparison** — a two-pane layout (list left, sticky detail right
   on desktop; stacks on mobile) showing the radar chart (the "Match
   Reveal" signature motion, see `DESIGN.md` §5), an accessible data-table
   fallback, and a grouped spec panel (Composition / Wear / Value — never a
   hairline-per-row table, per the taste skill's explicit "spec sheet" ban).

The same dataset (`lib/dupes-data.ts`, 6 references x up to 2 dupes each = 12
pairings) and the same `ComparisonDetail` component back both the
interactive tool and the `<EmbeddedComparison>` MDX component used in
written comparison articles, so the tool and the editorial content can never
disagree with each other.

**Fixture data, not verified market research**: dupe-candidate brand names
(Dossier, MicroPerfumes, ALT. Fragrances, Regency Fragrances, Divain,
Parfum Inspirations, hkPerfumes) are real, currently-operating "inspired
by" retailers found in
`departments/sales/affiliate-program-signup-checklist.md`'s own research.
Their specific product names, prices, and facet ratings in this dataset are
illustrative constructions for this build, not confirmed against live
catalogs — treat every number as a demo value, not a verified quote, before
this ever informs real content.

## Structure

```
DESIGN.md                          # design direction: brief read, dials, tokens, motion, IA, asset plan

app/
  layout.tsx                       # fonts, metadata, GA4/GSC wiring, MotionProvider, theme-flash script
  page.tsx                         # homepage
  dupe-finder/page.tsx              # the Dupe Finder tool (reads ?ref= for deep-linking)
  library/page.tsx                  # combined content index with type filter tabs
  guide/[slug]/page.tsx              # per-content-type routes, matching the technical plan's naming
  comparison/[slug]/page.tsx          # convention exactly (singular route names, distinct JSON-LD
  review/[slug]/page.tsx               # composition per type: Article, Article+ItemList, Article+Review)
  about/page.tsx                        # "Our Standards" - methodology (#methodology anchor), independence FAQ
  disclosure/page.tsx                    # full FTC affiliate-disclosure policy
  go/[slug]/route.ts                      # affiliate redirect (from the shared kit)
  sitemap.ts / robots.ts                   # thin wrappers around the shared kit's builder

components/
  ui/                                # button, card, badge, separator, accordion, tabs
  site/                               # header/nav, footer, theme toggle, reveal (scroll-in wrapper),
                                        # motion-provider, preloader, custom-cursor (canvas mist trail),
                                        # mist-burst (shared one-shot particle burst)
  dupe-finder/                         # the whole tool: picker, result cards, radar chart, spec panel,
                                         # value bar, data-table fallback, comparison detail, orchestrator
  content/                              # article header/hero image, disclosure block, MDX component map,
                                          # pros/cons, verdict callout, embedded-comparison, content card
  home/                                   # hero (chapter 0, uses mist-headline) + chapter-trend/gap/
                                            # formula (uses atomizer-spritz)/try-it/standards, library-proof
                                            # (closing), atmosphere-video (shared video/poster)
  library/                                 # tab-filtered content index
  kit/                                      # copied from the shared affiliate-site-kit (JsonLd,
                                              # AffiliateLink, Analytics)

content/
  schema.ts / loader.ts               # copied from the shared kit
  guide/ comparison/ review/           # 4 fixture MDX pieces (1 guide, 2 comparison, 1 review)

lib/
  types.ts                            # ReferenceFragrance / DupeCandidate / FacetScores
  dupes-data.ts                        # the 6-reference / 12-dupe fixture dataset
  similarity.ts                         # the disclosed similarity formula, radar-data builder, price-per-ml
  radar-geometry.ts                      # pure trig for the hand-built radar chart
  preloader-timing.ts                     # shared timing constants, preloader.tsx <-> hero.tsx
  affiliate-links.ts                      # placeholder affiliate-link registry (copied-kit pattern)
  jsonld.ts / sitemap-builder.ts           # copied from the shared kit
  utils.ts                                  # cn()
```

## Honesty notes — read before treating this as launch-ready

- **`chrome-devtools` MCP was not available in this build session** (not
  present in the tool list at all, not just a stale `claude mcp list`
  reading — checked per this department's own standing instruction on how
  to verify that). Unlike `fragrance-store-3`'s v2 pass, which had it and
  used it to find and fix real bugs, this build's browser-level QA is a
  substitute: a real `npm run start` + `curl` smoke test across every route
  (status codes, JSON-LD content, sitemap/robots content, image serving),
  full `next build` TypeScript type-checking, clean ESLint, and a manual,
  line-by-line audit against `design-taste-frontend`'s Section 14 Pre-Flight
  Checklist. That audit caught and fixed three real issues before calling
  this done:
  - Motion-driven entrance animations (result-card stagger, reference-picker
    tap physics) weren't actually gated by `prefers-reduced-motion` — the
    global CSS reduced-motion rule in `globals.css` only covers CSS
    `animation`/`transition`, not Motion's own transform-driven ones. Fixed
    with `MotionConfig reducedMotion="user"` wrapping the whole app
    (`components/site/motion-provider.tsx`).
  - Two CTAs on the homepage said "Find your dupe" and "Try the dupe
    finder" for the identical intent — a same-page duplicate-CTA-intent
    violation. Fixed by making both say "Find your dupe."
  - The affiliate CTA button included the variable-length dupe brand name
    ("Check price at Parfum Inspirations"), risking a 2-line wrap on
    narrow viewports for longer brand names. Fixed to a fixed-length "Check
    current price" (the brand is already shown in the badge/heading above
    it).
  - A real color-contrast gap: the gold "Reference" series color validated
    for the radar chart's graphical marks (3:1 bar) was also being reused
    as white-on-badge text (needs 4.5:1) in a couple of UI spots — computed
    at only 3.23:1, an AA failure for text. Fixed with a separate,
    text-contrast-safe darker step (`--series-reference-text`, 5.70:1 with
    white) used for UI chrome, while the chart itself keeps the original
    dataviz-validated hex. See `DESIGN.md` §3 and `app/globals.css`'s
    comment on the token.
  - What this substitute QA can't catch that a real browser would: actual
    pixel-level layout at real breakpoints, font-loading/CLS behavior,
    genuine hover/focus states, and whether the two-pane Dupe Finder layout
    and the radar chart's Match Reveal animation actually look right in
    motion. Flagged honestly rather than asserted as verified.
- **2026-08-25 homepage redesign pass: same `chrome-devtools` gap,
  reconfirmed rather than assumed.** Checked again this pass (still not in
  the tool list at all) - verification was `npm run lint` (clean),
  `npm run build` (clean, see above), and a manual read against
  `design-taste-frontend`'s Pre-Flight Checklist, same as v1. This pass adds
  two full-bleed `<video>` elements (hero, chapter 4) and a custom cursor -
  none of it was seen rendering in an actual browser this session. Two
  specific things a real browser check would need to confirm that this
  pass couldn't: whether the hero's paper-toned gradient scrim holds
  enough contrast against the live video at real viewport sizes (checked
  against the video's color-graded stills and the computed gradient stops,
  not a screenshot), and whether either video's loop point reads as a
  visible cut in motion (both prompts were written for slow, continuous,
  directionless motion specifically to minimize this, but it was not
  requested with start/end-frame matching and was not watched end-to-end
  by a human or a browser tool this session). See DESIGN.md's
  "Implementation addendum v2" for the full redesign rationale.
- **2026-08-25 "Atomizer" pass (same day, third round): same `chrome-
  devtools` gap, reconfirmed a third time.** Founder feedback on the v2
  redesign was that it still read as generic despite working
  functionally - the cursor and the `whileInView` scroll reveals were
  named specifically as the borrowed/common parts. This pass retired the
  spring dot+ring cursor entirely (replaced with a canvas-based mist
  trail) and added one bespoke signature moment (an SVG atomizer
  silhouette + particle burst leading into the existing radar chart,
  `radar-chart.tsx` itself untouched) plus a reworked preloader exit and
  one hero-headline text-dispersal moment - see DESIGN.md's
  "Implementation addendum v3" for the full rationale and an honest
  self-critique against the founder's actual guardrail (not just the
  obvious clichés). Verification was `npm run lint` (clean), `npm run
  build` (clean, all 15 routes), a full dev-server route sweep (all 200),
  and inspecting the rendered HTML directly for the expected output (all
  seven headline words present as separate spans, the atomizer SVG
  present, the preloader's content server-rendering as expected) - real
  signal, but not the same as watching any of it move in a browser.
  Specifically unverified: the canvas cursor's actual feel (particle
  density/spawn rate/drag were reasoned from the `animate` skill's
  physics guidance, not watched on a real pointer), the spritz sequence's
  exact timing feel (silhouette → burst → chart, computed from each
  piece's stated duration, not watched end-to-end), and real frame-timing/
  Core Web Vitals impact of the canvas loop (designed to a stated
  performance budget - capped particle count, throttled spawn, tab-hidden
  pause - but never profiled).
- **No real affiliate links, no real affiliate-program enrollment.** Every
  `AffiliateLink` resolves through `lib/affiliate-links.ts` to a clearly
  marked `example.com/aff/...?tag=REPLACE_ME` placeholder. `/disclosure`
  says this explicitly.
- **No real analytics/Search Console.** `NEXT_PUBLIC_GA_MEASUREMENT_ID` and
  `NEXT_PUBLIC_GSC_VERIFICATION` are unset (see `.env.example`) — the GA4
  script and the verification meta tag both render nothing until real IDs
  exist.
- **No deploy, hosting, or domain.** `NEXT_PUBLIC_SITE_URL` falls back to
  `https://example-placeholder.com` in metadata, `sitemap.xml`, and
  `robots.txt`.
- **Content is fixture-scale on purpose** (1 guide, 2 comparisons, 1
  review) — enough to exercise all three content types and the JSON-LD
  variants per type, not a real content library. That's `content-strategist`'s
  eventual job via the `affiliate-content` skill.
- **No license file yet** — same gap as every other template in this repo.

## License

Not yet defined — same as `agency-landing`, `fragrance-store`,
`fragrance-store-2`, and `fragrance-store-3`. Add a license file before this
goes anywhere public.
