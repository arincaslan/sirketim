# MERIDIAN — Design Artboards (v2, photography-forward rebuild)

Product: third Sirketim fragrance/perfume e-commerce template, sibling to
`../fragrance-store` ("Ambre" — cream/near-black editorial-luxury, rounded)
and `../fragrance-store-2` ("Nocturne" — obsidian/ember, sharp-cornered dark
maximalism). This document **replaces** the v1 `DESIGN.md` (built under the
brand name "LUMEN") and is the settled direction for a full visual rebuild,
now that real OpenArt-generated photography and video are available. It does
not touch `app/`, `components/`, or `lib/` — direction and asset manifest
only; implementation is a separate phase.

**Tooling note:** `openart`, `21st`, and `chrome-devtools` were all
structurally unavailable in the session that built v1 (verified empirically,
not assumed — see v1's own tooling notes, preserved below in spirit). All
three are confirmed live in this session (a real tool call succeeded on
each before this pass started). This pass ran the `design-taste-frontend`
skill directly (rather than substituting a hand-rolled artboard pass, as v1
had to) and cross-checked palette/typography choices against the
`ui-ux-pro-max` skill's local data (`data/typography.csv`,
`data/products.csv`) — both cited inline below. No `mcp__openart__*` calls
were made this phase; asset generation is deferred to the next phase, which
consumes `asset-manifest.json`.

## Redesign audit (per `design-taste-frontend`'s redesign protocol)

This is a **redesign, not a greenfield build** — the skill's Section 11
applies before anything else. Audit of the current (v1 "Lumen") state:

- **Brand tokens**: light theme, cool "stone/fog" background (264 10% 95%)
  with inverted warm-ivory card surfaces, electric lavender accent (268 62%
  56%), Bodoni Moda + Manrope, split-radius system (0 on frames/images, full
  pill on buttons/chips).
- **Information architecture**: Home, Collection, Product detail, Discovery
  quiz, About/Atelier, Journal, Cart/Checkout — seven pages/flows, all
  functionally complete (a real 6-question weighted quiz scorer, a real
  10-product catalog with sort/filter, 6 full journal articles, three cart
  surfaces, a progressive-accordion checkout).
- **Signature patterns to preserve**: the split-radius shape language (sharp
  frames, soft pills — genuinely distinct from both siblings' uniform
  systems), the 12-column offset/staggered collection grid, the full-bleed
  layered hero with an overlapping headline card, all-three cart surfaces,
  the progressive-accordion checkout, the vertical animated notes timeline
  on product detail, the "scent as a place" product concept and its ten
  fully-written products.
- **Patterns to retire**: the entire generative SVG/CSS "bottle glyph +
  material field" visual system (`components/store/bottle-glyph.tsx`,
  `material-field.tsx`, `product-visual.tsx`) — this existed *specifically*
  to compensate for having no photography tool, which is no longer true.
  Also retiring: the pointer-following glow (`spotlight-cursor.tsx`) — see
  "Signature motion" below for why. Also retiring: the literal implemented
  wordmark "FRAGRANCE STORE" / "N°3" (a placeholder-grade name that was
  never actually "Lumen" in the shipped UI — see "Brand identity" below).
- **Dial reading of the existing build**: roughly `variance 7 / motion 6 /
  density 4` — already fairly close to this skill's own "premium consumer
  landing" preset. Not a low-effort starting point.
- **The one real flaw, named directly**: the accent color. Electric lavender
  at hue ~268 sits squarely in the range the taste skill calls out by name
  as **"the Lila Rule"** — the single most-flagged "this looks AI-generated"
  color tell in current production testing (Section 4.2: "the AI Purple /
  Blue glow aesthetic is discouraged as a default... no automatic purple
  button glows"). It wasn't an unreasonable choice under the old
  constraint (a system with no real imagery needs *one* loud, memorable
  color to carry the whole brand), but it's the wrong choice to carry
  forward into a photography-led rebuild.

## Verdict: evolve, not replace, not keep verbatim

Per the taste skill's decision tree (Section 11.E): "IA, content, and SEO
sound → targeted evolution... visual debt is structural → full redesign...
brand itself is changing → greenfield." None of the three apply cleanly
here in isolation — the IA and content are sound (keep), but the *reason*
the whole visual system exists (no photography) has changed structurally
(evolve/redesign), and the brand identity itself is getting a real fix
(the wordmark was never actually distinct). The right read is a **content-
preserving overhaul**: everything a buyer interacts with functionally stays;
everything that exists to compensate for a missing photography tool gets
rebuilt around the photography that tool now provides.

Two alternatives were seriously considered and rejected before settling on
"evolve":

### Rejected — full greenfield replace (new palette, new type, new motion, new grid, new IA)

Rejected because the audit above shows nothing structurally wrong with six
of the eight differentiating axes (mode, corners, type pairing, hero
composition, grid pattern, cart/checkout patterns) — they were already
genuinely distinct from both siblings and well-reasoned. Replacing all of
it because photography is now available would be solving a color problem
with a full teardown, which the taste skill's own modernization-lever
ordering explicitly warns against (Section 11.D: work through typography,
spacing, color, motion, hero *before* full block replacement, stop when the
brief is satisfied). It also would have meant discarding ten fully-written,
well-differentiated products and six real journal articles for no reason
connected to the actual problem being fixed.

### Rejected — keep every token, just add photos

Rejected because it ignores the one real flaw identified above (the lila
accent) and because two of the old system's components exist for no reason
other than "we had no photography" — `bottle-glyph.tsx` /
`material-field.tsx` (the entire product visual, replaced outright by real
shots) and `spotlight-cursor.tsx` (a pointer-following glow added to give
flat generative art some visual interest; a glow overlay sitting *on top
of* real editorial photography reads as decorative clutter, not a
signature — and the taste skill separately flags "no neon / outer glows by
default" as a plain AI tell, section 9.A). Keeping these because they
already existed would be inertia, not a design decision.

## Brand identity: FRAGRANCE STORE → MERIDIAN

The internal design-direction codename in v1 was "LUMEN," but it never
actually shipped — `components/store/navbar.tsx`, `footer.tsx`, and
`app/layout.tsx`'s metadata all hardcoded the literal, generic wordmark
**"FRAGRANCE STORE"** with a small **"N°3"** mark. That's a real gap (a
placeholder-grade name in the one place a customer sees it most), and the
brief explicitly authorizes fixing it.

New wordmark: **MERIDIAN**, with an optional small-caps category line
"Parfumerie" set beneath it in the nav/footer lockup (a genuine convention
in real niche perfumery branding — not a version-label or a section-number
eyebrow, which the taste skill correctly flags as AI-generated clutter; this
is a permanent part of the logotype, not a page-by-page UI label).

Why "Meridian": the existing catalog concept — "scent as a place," ten
fragrances each written around one specific remembered location — is a
cartographic idea already. A meridian is a line of longitude: a fixed
reference used to locate a place on a map. The name makes the brand and the
product concept the same idea instead of an arbitrary label bolted onto it
(which is what "FRAGRANCE STORE" was). It also carries a second, unforced
meaning — a meridian is the sun's highest point, the moment of most light —
which keeps a thread back to "Lumen" (light) without keeping the color that
caused the actual problem. No em-dash convention, no fake version-numbering
gimmick (`N°3` is dropped, since neither Ambre nor Nocturne uses a house
number and dropping it keeps naming parity across all three siblings).

## Signature motion: the Meridian Sweep

Replaces both v1 mechanisms (the aperture iris clip-path reveal, the
pointer-following glow) with one device instead of two, directly motivated
by the brand name rather than decorative:

**On scroll-into-view (and on hover, at a smaller scale, for grid cards):**
a soft diagonal light-wash band travels across the image once, left to
right on desktop / top to bottom on mobile — literally a line crossing a
place, the way a meridian crosses a map, or the way a terminator line
crosses a globe at dawn. The portion of the image the band hasn't reached
yet sits in a muted duotone using that product's family color (rose quartz,
umber clay, amber smoke, sage quartz, or cocoa dust — see tokens below); the
portion the band has passed resolves to full natural photographic color.
The reveal and the color-grade settle are the same single motion, not two
separate effects layered on top of each other.

This is more motivated than either retired mechanism: an iris reveal makes
sense over a camera-adjacent motif but doesn't reference the brand itself;
a pointer glow was pure decoration added because flat generative art needed
*something* to feel alive. A line sweeping across a photograph of a real
place, that clears into full color as it passes, is literally the brand
concept in motion. Runs once per element (`viewport once: true`), gates
fully under `prefers-reduced-motion` to an instant opacity fade straight to
full color (no duotone flash, no travelling band).

## Design dials (declared per `design-taste-frontend` Section 1)

Not a single flat number for the whole site — marketing surfaces and
transactional surfaces get different dial readings on purpose, which the
skill's own guidance supports (Section 11.D works lever-by-lever; a
checkout is explicitly out of this skill's primary scope per Section 13,
so its motion dial is intentionally pulled down, not up, right before a
purchase decision):

| Surface | Variance | Motion | Density |
|---|---|---|---|
| Home, About/Atelier, Journal, Discover | 8 | 6 | 3 |
| Collection, Product detail | 7 | 6 | 5 |
| Cart, Checkout | 4 | 3 | 5 |

Reasoning: marketing pages read as "premium consumer" per the skill's
use-case table (variance 7, motion 6, density 3) with variance nudged to 8
because the 12-column offset grid and layered hero overlap are already
asymmetric by design. Catalog/PDP need enough density to actually work as
commerce (filters, sizes, specs, reviews) so density rises to 5, matching
the skill's "daily app" band rather than "art gallery." Checkout drops
variance and motion hard on purpose: a purchase flow is not the place for
Meridian Sweep reveals or an offset grid, it's the place for a boringly
predictable, high-contrast, fast-scanning form.

## Differentiation matrix (vs. both siblings)

| Axis | Ambre (1) | Nocturne (2) | Meridian (3) |
|---|---|---|---|
| Mode | Light, warm | Dark, cool | Light, cool base / warm surfaces (inverted) — unchanged from v1, still the only inverted-temperature system of the three |
| Accent hue | ~38–45° (gold/amber) | ~355° (ember/crimson) | ~213° (Meridian Cobalt, a saturated azure blue) — changed from v1's ~268° lavender specifically to move off the "Lila Rule" AI-tell hue, while staying maximally distant from both siblings on the wheel |
| Corners | Soft, uniform 0.6rem | Sharp, uniform 0.25rem | Split system: 0 on frames/images, full pill on buttons/chips — unchanged, still the only mixed system of the three |
| Display font | Playfair Display | Fraunces | Bodoni Moda — unchanged; validated against `ui-ux-pro-max`'s own `typography.csv` row 50, "Luxury Minimalist: Bodoni Moda + Jost," tagged for "luxury minimalist brands, high-end fashion, premium products" |
| Sans/UI font | Inter | Inter | Manrope — unchanged; also grounded in `typography.csv` row 18, "Fashion Forward: Syne + Manrope," tagged for "fashion brands" |
| Product naming | Material/mood ("Velvet Oud") | Intensity/dark-mood ("Oud Rouge") | Place/atmosphere ("Amber Room," "Low Tide") — unchanged, all ten products kept as-is, now a coherent pair with the cartographic brand name instead of an arbitrary one |
| Signature motion | Custom cursor, grain overlay, preloader wipe | Marquee ticker, scroll-snap rails, magnetic CTA | The Meridian Sweep (a duotone-to-color light-wash reveal) — replaces v1's aperture reveal + pointer-glow with one brand-motivated device |
| Home hero | Centered 2-col grid | Asymmetric 58/42 split + glow panel | Full-bleed layered/overlap composition, headline card breaks across the image's bottom edge — unchanged, now populated with real photography instead of generative art |
| Collection grid | Uniform grid, top pill filters | CSS-column masonry, sidebar filters | 12-col offset/staggered rhythm grid, inline top filter panel — unchanged |
| Cart pattern | Slide-in drawer only | Dedicated page + toast only | Drawer *and* dedicated page *and* toast, all three — unchanged |
| Checkout pattern | 3-step wizard | Single always-open scroll | Progressive accordion, each section collapses to an editable summary once completed — unchanged |
| Imagery | Real curated stock/CC photography | Reuses Ambre's photography | Original OpenArt-generated photography and video, brand-exclusive (see `asset-manifest.json`) — this is the actual axis that changed this pass |
| Wordmark | "Ambre" | "Nocturne" | "MERIDIAN" — fixed from v1's un-shipped "Lumen" concept vs. the literal implemented "FRAGRANCE STORE" placeholder |

## Design tokens (settled before asset generation)

```
--background:            213 14% 96%   (cool porcelain grey, not lavender-tinted stone)
--foreground:            215 22% 12%   (cool near-black ink, not warm espresso)
--card:                   40 28% 97%   (warm ivory — inverted temperature vs. bg, kept from v1)
--card-foreground:      215 22% 12%
--secondary:             210 12% 91%   (soft cool panel — pills, chip backgrounds)
--secondary-foreground: 215 22% 12%
--muted:                 210 10% 93%
--muted-foreground:      210  8% 40%
--accent (surface):      210 12% 91%
--primary / Meridian Cobalt: 213 82% 45%   (the one expressive accent — CTAs, price,
                                              focus rings, active states, the Meridian
                                              Sweep's resolved-color state)
--primary-foreground:      0  0% 100%
--border / --input:      210 12% 80%
--ring:                  213 82% 45%
--destructive:             0 65% 50%
--radius:                   0rem       (frames/images/cards — sharp, unchanged)
--radius-pill:             999px       (buttons/chips/badges — soft, unchanged)
```

Contrast verified with the WCAG relative-luminance formula (computed, not
eyeballed): foreground/background **15.41:1**, muted-foreground/background
**5.33:1**, white-text/primary **5.27:1** (passes AA for normal text),
primary/card **4.97:1**, primary/background **4.82:1** — every pairing that
carries text clears AA (4.5:1); foreground/background clears AAA (7:1) by a
wide margin. Methodology matches v1's (relative luminance, not a visual
estimate); numbers changed because the hue changed, not because the
standard did — v1's equivalent pairs landed in the same 4.7–5.3:1 band, so
the palette swap is tonally equivalent in accessibility terms, not just in
"looks fine" terms.

Five family accent tones carry over unchanged from v1's
`lib/scent-material.ts` (rose-quartz/Floral, umber-clay/Woody,
amber-smoke/Oriental, sage-quartz/Fresh, cocoa-dust/Gourmand) — they were
already muted, decorative-only, and never competed with the primary accent,
so there's no reason to re-derive them. **Their job changes**, though: in
v1 they were gradient stops for a generative background system; in this
rebuild they're (a) the duotone base for the Meridian Sweep reveal over
that family's photography, (b) the tint for that family's filter chips and
notes-timeline nodes, and (c) a liquid-color cue used consistently across
that family's product photography (see `asset-manifest.json`). Flagged for
implementation: this file's internals need rewriting (no more
`familyGradient()`/`familyRadial()` CSS-gradient generators) even though
its exported color data doesn't need to change.

Fonts: **Bodoni Moda** (variable, opsz 6–96 / wght 400–900) for
display/headlines. **Manrope** (variable, wght 200–800) for UI/body/nav/
prices. Both unchanged from v1, both real Google Fonts, neither used by
either sibling, both independently grounded in `ui-ux-pro-max`'s font-
pairing dataset (see differentiation matrix above).

## Bottle design brief (referenced by every product photography prompt)

Real photography needs a real, consistent product design to shoot — this
didn't exist before (the old system drew an abstract line-art glyph, not a
specific bottle). Settled once here so `asset-manifest.json` can reference
it consistently across all fifty product shots instead of inventing a
different bottle per prompt:

A rectangular glass flacon with sharp, perfectly square edges (echoing the
brand's own sharp-frame shape language), a matte-finished flat cap in
Meridian Cobalt with a thin brushed-steel collar band, sitting on a
slightly rounded, pill-shaped glass base (echoing the brand's own soft-pill
shape language — the bottle itself carries the split-radius system). A
small square ivory paper label sits low on the front face with minimal
black sans-serif type (kept abstract/soft-focus in renders, not meant to be
legible). Liquid color shifts by olfactive family: pale rose-gold (Floral),
warm amber-brown (Woody), deep amber-orange (Oriental), pale aqua-green
(Fresh), deep cognac-brown (Gourmand).

## Page-by-page artboards

Functional IA is unchanged from v1 throughout (kept per the brief's
explicit allowance) — what changed on every page is the imagery layer and
the motion vocabulary, called out per page.

### 1. Home (`/`)
```
┌──────────────────────────────────────────────────────────┐
│ NAV: "MERIDIAN" wordmark + "Parfumerie" subline · Shop /   │
│ Discover your scent / Journal / Atelier · search · wishlist│
│ · bag (transparent over hero, solidifies porcelain+blur on │
│ scroll)                                                     │
├──────────────────────────────────────────────────────────┤
│ HERO — full-bleed layered composition, ~92vh (unchanged     │
│ layout from v1). Real photography (see hero-image /         │
│ hero-video in the manifest) replaces the generative bottle- │
│ glyph visual. Headline card overlaps the image's bottom     │
│ edge, breaking across the boundary — eyebrow, display        │
│ headline, sensory statement, two CTAs ("Explore fragrances" │
│ / "Discover your scent"). Meridian Sweep plays once on load,│
│ not on every scroll.                                          │
├──────────────────────────────────────────────────────────┤
│ CURATED COLLECTION — 3 asymmetric feature cards, now cross- │
│ family THEMES rather than restating the family rail below:  │
│ "Warm Hours" (Oriental + Gourmand, evening-leaning), "Cold   │
│ Air" (Fresh + Floral, daytime), "The Signature Line" (the    │
│ four Signature-badged bestsellers) — deliberately distinct   │
│ content from the family rail so the two sections don't repeat│
├──────────────────────────────────────────────────────────┤
│ SHOP BY OLFACTIVE FAMILY — 5-up horizontal rail, real family │
│ photography, Meridian Sweep on hover                          │
├──────────────────────────────────────────────────────────┤
│ EDITORIAL SHOWCASE — 2-col: oversized editorial statement     │
│ text + one large real editorial photograph (was a single      │
│ generative "product story block")                              │
├──────────────────────────────────────────────────────────┤
│ DISCOVERY TEASER — "Find your scent" band, 3-question         │
│ preview, links to /discover                                   │
├──────────────────────────────────────────────────────────┤
│ BESTSELLERS — offset-rhythm row, reuses each product's own    │
│ "still" shot (no new assets needed)                            │
├──────────────────────────────────────────────────────────┤
│ LIMITED CAMPAIGN — full-bleed statement band for Copper Coast,│
│ real campaign photography + campaign video                     │
├──────────────────────────────────────────────────────────┤
│ REASSURANCE — shipping / samples-with-every-order / small-     │
│ batch / returns, 4-up strip (icons, no photography needed)     │
├──────────────────────────────────────────────────────────┤
│ NEWSLETTER — inline form, porcelain band                       │
├──────────────────────────────────────────────────────────┤
│ FOOTER — "MERIDIAN" wordmark repeated, no "N°3"                │
└──────────────────────────────────────────────────────────┘
```
States: hero reveal skips to opacity-only fade under
`prefers-reduced-motion` (no Meridian Sweep band, no duotone flash). All
`whileInView` reveals `once: true`.

### 2. Collection (`/products`)
```
┌────────────────────────────────────────────────────────────┐
│ Heading + result count · Sort (Featured/Newest/Bestsellers/  │
│ Price ↑↓/Rating) · Filter trigger (mobile) / inline panel     │
│ (desktop, top position — unchanged from v1)                    │
├────────────────────────────────────────────────────────────┤
│ 12-col offset grid — span/row-offset pattern repeats every 6  │
│ cards; a full-bleed "collection statement" card breaks the    │
│ rhythm every 6th slot (unchanged structure)                    │
│ Card: real "still" shot as the resting image, Meridian Sweep   │
│ on hover reveals the "lifestyle" shot underneath (was: bottle-  │
│ glyph → material-field crossfade), quick add, wishlist heart,  │
│ family label, size chip row, price, "Sample available" tag     │
│ Empty state: no matches + clear-filters CTA                    │
└────────────────────────────────────────────────────────────┘
```
Filters unchanged: family, gender expression, intensity, season, price,
size, availability, format. Chip-based, wrap not clip, active-count badge,
"Clear all."

### 3. Product detail (`/products/[slug]`)
```
┌───────────────────────┬───────────────────────────────────┐
│ GALLERY — 2-5 real shots │ Breadcrumb                          │
│ (still, lifestyle always;│ Family · concentration               │
│ macro/detail/texture on  │ Name (Bodoni Moda, large)             │
│ paper-orchid only, see   │                                        │
│ note below) + vertical   │                                        │
│ vertical thumbnail rail, │ Short sensory story                   │
│ swipeable on touch,      │ Rating · review count                  │
│ Meridian Sweep plays     │ Price · size selector (incl. 2ml       │
│ once when the gallery    │ discovery/sample size)                 │
│ scrolls into view         │ Quantity · Add to bag · Wishlist        │
│                            │ Availability state                      │
│                            │ Shipping / sample note                   │
├───────────────────────┴───────────────────────────────────┤
│ NOTES THREAD — vertical timeline: Top → Heart → Base nodes,    │
│ connecting line draws in on scroll, nodes tinted with that      │
│ product's family accent color, each expands into pill tags       │
│ (unchanged)                                                        │
├─────────────────────────────────────────────────────────────┤
│ Family / concentration / longevity / sillage / ingredients /    │
│ sustainability info — accordion (unchanged)                       │
├─────────────────────────────────────────────────────────────┤
│ REVIEWS — rating breakdown + written reviews (unchanged)          │
├─────────────────────────────────────────────────────────────┤
│ FAQs — accordion (unchanged)                                        │
├─────────────────────────────────────────────────────────────┤
│ RELATED — offset-grid row, same family first (unchanged)             │
├─────────────────────────────────────────────────────────────┤
│ COMPLETE THE RITUAL — cross-sell within the same catalog,             │
│ different family (unchanged)                                            │
└─────────────────────────────────────────────────────────────┘
```
Sticky bottom purchase bar on mobile, unchanged behavior.

**Gallery depth is deliberately asymmetric across the catalog, per a founder
cost decision (2026-08-22):** the asset manifest originally specced 5 shots
(still, macro, detail, texture, lifestyle) per product across all 10.
Paper Orchid was generated first and kept its full 5-shot set. For the
remaining 9 products, rather than either paying to generate 45 images or
reusing `fragrance-store-2`'s product photography (rejected — it shows a
different bottle design, a different backdrop, and has no conceptual mapping
to this catalog's "scent as a place" products, which would have undercut the
differentiation this whole rebuild exists for), those 9 were cut to 2 shots
each (still + lifestyle) — `asset-manifest.json` marks the dropped
macro/detail/texture entries `"descoped": true` with their original prompts
kept intact, not deleted, in case a fuller gallery is worth generating later.
The gallery component must tolerate a variable shot count (2 or 5) per
product rather than assuming exactly 5 — build it data-driven off however
many images actually exist for a given product, not a hardcoded slot count.

### 4. Discovery flow (`/discover`)
6 questions, unchanged scoring (`lib/quiz.ts` stays as-is). Progress rail,
back nav, skip, animated slide/fade between questions. **Mood-reactive
background now reuses the five `family-rail-*` images from the asset
manifest** (duotone-recolored toward the family implied by the current
answer mix) instead of needing dedicated quiz imagery — one fewer asset
family to generate, and it reinforces that the quiz result and the family
rail are the same underlying photography. Result screen: one recommended
fragrance with rationale, two alternates, "Explore this scent" / "Shop the
collection" CTAs. Reduced motion: instant cross-fade, no background
recolor animation.

### 5. About / Atelier (`/about`)
Long-form editorial, unchanged structure: opening statement, creative
philosophy, ingredients sourcing, craftsmanship/process, a perfumer-
perspective pull-quote block, sustainability, campaign-moment band. Now
carries three real photographs (`about-opening`, `about-sourcing`,
`about-craftsmanship`) plus one process film (`atelier-process-video`) in
the craftsmanship section. Sparing `whileInView` reveals (opacity + small
y-offset only, no Meridian Sweep here — this page stays fast/readable, same
reasoning v1 gave for keeping it quiet).

### 6. Journal (`/journal`, `/journal/[slug]`)
Magazine grid, unchanged structure and unchanged six articles (`lib/journal.ts`
stays as-is — the writing is genuinely good and none of it references the
old visual system). Featured story large, category filter pills, reading-
time metadata. Each post gets one real thumbnail image from the manifest,
keyed to that article's actual subject matter (not generic "journal"
stock).

### 7. Cart / Checkout
Unchanged structure: mini-cart drawer, dedicated `/cart` page, toast
confirmation, all three surfaces. Checkout stays a progressive accordion
(Shipping → Payment/Sample selection → Review). No new imagery needed here
by design — see "Design dials" above for why this surface's motion and
variance both drop rather than inheriting the rest of the site's
photography-forward energy.

## What changes in code (implementation-phase flags, not done this phase)

This phase touches no `app/`, `components/`, or `lib/` files. For the next
phase:

- **`app/globals.css`**: replace the v1 HSL token block with the tokens
  above (background/card/foreground/secondary/muted/primary/ring all
  change values; `--radius` and `--radius-pill` stay the same).
- **`components/store/navbar.tsx`, `footer.tsx`, `app/layout.tsx`**:
  replace the literal "FRAGRANCE STORE" / "N°3" strings with "MERIDIAN" (+
  the optional "Parfumerie" subline in the nav/footer lockup).
- **`components/store/bottle-glyph.tsx`, `material-field.tsx`,
  `product-visual.tsx`, `spotlight-cursor.tsx`, `aperture-reveal.tsx`**:
  removed outright. Replaced by a new `MeridianSweep` component (image/video
  reveal + duotone-to-color transition, see "Signature motion" above) and
  plain `next/image`/`next/video`-backed gallery components consuming the
  generated assets from `asset-manifest.json`.
- **`lib/scent-material.ts`**: keep the exported HSL family-color data
  (`FAMILY_MATERIAL`), remove `familyGradient()`/`familyRadial()` (no more
  CSS-gradient generation — the same colors now drive duotone image
  treatment and chip/node tinting instead).
- **`lib/products.ts`, `lib/journal.ts`, `lib/quiz.ts`, `lib/filters.ts`,
  `lib/types.ts`**: **no content changes.** All ten products, all six
  journal articles, and the quiz's scoring weights stay exactly as
  written — the brand/concept pairing got stronger, not weaker, from the
  rename. The one small addition needed: a convention for looking up a
  product's five generated images by `productSlug` from the manifest (e.g.
  a `getProductImages(slug)` helper reading `asset-manifest.json`'s
  `productSlug` field) — a lookup helper, not a data-model change.
- **`app/icon.svg`**: replace with a mark reflecting "MERIDIAN" (a simple
  geometric line-and-circle meridian/longitude-line mark would fit the
  brand's own "no hand-rolled decorative SVG unless it's a single simple
  geometric mark" allowance from the taste skill).

## Sign-off

No client to sign off (internal Sirketim product). This document is the
settled direction; implementation proceeds against it, plus
`asset-manifest.json`, once photography and video are generated from the
manifest in the next phase. Any deviation discovered during build gets
reflected back into this file, not silently diverged from.

## Implementation addendum (build phase, 2026-08-22)

Full implementation is done — see the template's `README.md` for what's
actually built, what build/lint/QA found, and one honest remaining gap
(`dust-and-marble`'s missing `lifestyle` shot). Two real deviations from
this document's letter, both discovered during live-browser QA and worth
recording here rather than leaving unexplained:

- **Family rail, collection-statement cards, and the curated-collection
  theme cards use `trigger="view"`, not `trigger="hover"`** as their literal
  page-artboard text says ("Shop by olfactive family... Meridian Sweep on
  hover"). Reason: these three usages reveal the *same* photograph from
  duotone to color (no image swap involved) — on a real touchscreen,
  `hover` never fires, so a hover-only reveal would permanently strand
  touch visitors looking at a muted, unresolved photo, on a rebuild whose
  entire point is real photography being visible. The one usage where hover
  genuinely differs from view — the collection-grid product card, where the
  resting "still" shot is already a complete photo and hover swaps in a
  *different* "lifestyle" shot as a bonus — was kept exactly as designed.
- **The "Signature Line" curated card links to `/products?badge=Signature`**,
  a one-off query filter read directly by `ProductsCatalog` rather than a
  new `FilterState` dimension with UI controls — there was no existing
  "badge" filter concept to extend, and adding one with a full chip-based
  UI for a single homepage card's destination would have been
  disproportionate. The "Warm Hours"/"Cold Air" cards use a small,
  backward-compatible extension instead: `?family=` now accepts a
  comma-separated list (`?family=Oriental,Gourmand`), parsed into the
  existing `FilterState.families` array.
