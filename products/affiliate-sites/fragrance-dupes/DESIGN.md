# DRYDOWN — Design Artboards (v1, greenfield)

Product: Sirketim-owned affiliate/comparison content site for niche and
designer fragrance "dupes." Lives at `products/affiliate-sites/fragrance-dupes/`.
Not a fourth fragrance e-commerce template — no cart, no checkout, no product
inventory. Its job is editorial content (guides, comparisons, reviews) plus an
interactive comparison tool, closer in spirit to an Awwwards-style editorial/
research site than to `fragrance-store` (Ambre), `fragrance-store-2`
(Nocturne), or `fragrance-store-3` (Meridian).

**Tooling note:** `design-taste-frontend` and Emil Kowalski's skill set
(`emil-design-eng`, `animate`, etc.) were not present on this machine at
session start (`.agents/skills/` did not exist) despite being documented as
installed in `departments/web-development/CLAUDE.md` — a cross-machine skill-
install gap, not a tooling failure. Both were installed fresh this session
(`npx skills@latest add Leonxlnx/taste-skill --skill design-taste-frontend`,
`npx skills@latest add emilkowalski/skills`) and ran for real against this
brief; nothing below substitutes for them. `21st`, `openart`, and
`ui-ux-pro-max` were all live and used directly (`mcp__21st__search`,
`mcp__openart__*`, `ui-ux-pro-max`'s `search.py --design-system` /
`--domain color|typography|chart`). **`chrome-devtools` was not present in
this session's tool list at all** (confirmed structurally — no
`mcp__chrome-devtools__*` tool available, not just a stale `claude mcp list`
read) — flagged here and again at the QA section; final browser verification
in this pass is a manual/code-review substitute, not a `chrome-devtools`
screenshot pass.

## 0. Brief inference (`design-taste-frontend` Section 0.B)

**Reading this as:** an editorial/research comparison site for a design-
conscious, TikTok-influenced consumer audience, with an "Awwwards-premium,
authority-not-storefront" language, leaning toward native Tailwind + Motion +
a hand-built radar/spec comparison system (no dashboard library — this is
explicitly out of `design-taste-frontend`'s dashboard/data-table scope per its
Section 13, so the comparison surfaces borrow chart-type guidance from
`dataviz`/`ui-ux-pro-max` rather than a data-grid package).

This is **greenfield**, not a redesign (`design-taste-frontend` Section 11.A) —
no audit section needed.

## 1. Brand identity: DRYDOWN

"Drydown" is the real perfumery term for a fragrance's final, true stage —
what's left once the top and heart notes burn off and only the honest, lasting
character remains. That's a direct, motivated match for the product: this site
exists to get past marketing copy and brand-blog spin to what a fragrance
*actually* smells like and what actually overlaps with a pricier original —
the same "cut past the noise to the true thing" idea, not an arbitrary label.
It also reads as a plain English phrase (getting to "the dry-down" of a
claim), so it doesn't require perfumery fluency to land, even though the
audience skews toward people who already use terms like "sillage" and "note
pyramid" daily (confirmed by the actual competitor content surveyed in
`departments/sales/affiliate-niche-research.md`).

Wordmark: **DRYDOWN**, set in the display serif, all-caps tracked out.
Lockup subline (nav/footer only, small, not a page-repeating eyebrow):
"Independent Fragrance Comparisons" — functional, states what the site is and
that it isn't a brand blog, no cute wordplay.

No em-dash anywhere in copy, including this document's own visible-string
examples below (`design-taste-frontend` Section 9.G — checked).

## 2. Differentiation vs the three existing fragrance templates

This is not a fourth entry in that product line (it's a different product:
content/affiliate, not e-commerce) but the same design department built all
four, so the audit still matters — nothing here should read as a reskin.

| Axis | Ambre (store) | Nocturne (store-2) | Meridian (store-3) | **Drydown (this site)** |
|---|---|---|---|---|
| Mode | Light, warm | Dark, cool | Light, cool base / warm surfaces | Light, cool paper (dark mode supported, not primary) |
| Accent hue | ~38-45 (gold) | ~355 (ember/crimson) | ~213 (cobalt blue) | ~155-165 (deep botanical green) - the one hue family untouched by any sibling |
| Corners | Soft uniform 0.6rem | Sharp uniform 0.25rem | Split: 0 frames / full-pill buttons | Near-sharp frames/cards (2px), modest-rounded buttons (8px), full-pill only on tags/chips - a third distinct shape rule, documented once and followed everywhere |
| Display font | Playfair Display | Fraunces | Bodoni Moda | **Cormorant Garamond** - a fourth, unused serif family, chosen over Fraunces/Bodoni/Playfair specifically to not repeat any sibling and because `design-taste-frontend` explicitly bans Fraunces/Instrument Serif as LLM defaults |
| Sans/UI font | Inter | Inter | Manrope | **Public Sans** - a reading-optimized civic/journalism sans (US Web Design System's own body font), not used by any sibling, chosen because this site's job is long-form reading, not commerce chrome |
| Hero paradigm | Centered 2-col | Asymmetric 58/42 split + glow | Full-bleed layered/overlap photo | **Editorial Manifesto Hero, full-bleed** (revised 2026-08-25, Implementation addendum v2) - type-led, asymmetric left/bottom-anchored headline over a full-bleed atmosphere video, no dominant product photograph (this site has no products to photograph). Distinct from Meridian's layered-panel treatment: type sits over one full-bleed atmosphere layer rather than photo panels being composed against each other |
| Core mechanic | Product catalog + cart | Product catalog + cart | Product catalog + cart + quiz | **Dupe Finder**: reference-fragrance picker -> ranked matches -> radar chart + grouped spec comparison. No cart anywhere on the site. |
| Signature motion | Custom cursor, grain overlay, preloader wipe | Marquee ticker, magnetic CTA | The Meridian Sweep (duotone-to-color light wash) | **The Atomizer** (Implementation addendum v3) - a mist/spray particle system (canvas cursor trail, a spritz that leads into the radar chart, a preloader dissolve, one text-dispersal headline), replacing the v2 pass's cursor+preloader (which had been directly adapted from Ambre's own precedent components - that borrowed-and-restyled approach is exactly what read as generic and was retired, not tuned again). "Settle" (gentle deceleration, no bounce/spring anywhere in the Atomizer itself) remains the underlying physics; the Match Reveal keeps the site's one spring/bounce exception |
| Imagery | Real curated stock/CC photography | Reuses Ambre's photography | Original OpenArt photography (bottles, lifestyle) | A handful of OpenArt atmosphere/mood images (site shell, not per-product) plus, as of Implementation addendum v2, two short OpenArt video loops (hero, one chapter break) - still deliberately minimal per the brief, see Section 7 and the v2 addendum |

## 3. Design tokens (computed, not eyeballed)

Contrast verified with the standard WCAG relative-luminance formula via a
throwaway Node script (same method Meridian's `DESIGN.md` used), not visual
estimate. All pairs below clear AA (4.5:1); most clear AAA (7:1).

```
LIGHT MODE
--background        (page plane, "paper"):  #F1F1EB   -- cool-neutral, NOT the
                                                            taste skill's banned
                                                            warm-cream/bone family
                                                            (#f5f1ea/#f7f5f1/etc)
--foreground         (ink):                  #12140F
--card:                                      #FFFFFF
--muted:                                     #E7E6DD
--muted-foreground:                          #5B5D52
--border:                                    #D8D7CB
--primary (Drydown Green):                   #1B5E44
--primary-foreground:                        #FFFFFF
--ring:                                      #1B5E44
--destructive:                               #B3261E
--radius-frame:      2px    (cards, images, tables, the gallery, inputs)
--radius-button:     8px    (buttons - modest rounded rect, NOT full pill)
--radius-pill:       999px  (tags, chips, badges only)

DARK MODE
--background:                                #14160F
--foreground:                                #F1EFE6
--card:                                      #1F2318
--muted-foreground:                          #B7B7A8
--primary (Drydown Green, dark):             #3EAE80
--primary-foreground (dark):                 #0B0E09

Computed pairs (light): ink/paper 16.35:1, muted-fg/paper 5.91:1,
white/primary-green 7.69:1, primary-green/paper 6.78:1, primary-green/card 7.69:1.
Computed pairs (dark): paper/ink 15.83:1, muted-fg/dark-bg 8.99:1,
dark-ink/accent-green 7.00:1, accent-green/dark-bg 6.58:1.
```

Shape rule stated once, per `design-taste-frontend`'s Shape Consistency Lock:
frames/cards/tables/inputs are near-sharp (2px), buttons are modestly rounded
(8px), tags/chips/badges are full pill. No other radius values used anywhere.

Color Consistency Lock: Drydown Green is the only accent on the page, in both
modes, everywhere (CTAs, links, focus rings, active nav state, the "Dupe"
chart series, the match-score ring). No second accent hue introduced anywhere
in UI chrome.

### Chart palette (via the `dataviz` skill, validated not eyeballed)

Radar chart and spec/value bars compare exactly two series: the **Reference**
(the designer original) and the **Dupe** (the candidate alternative) - so this
is a categorical, 2-slot palette, built for this site's own surface rather
than snapped from a generic default, then run through
`dataviz`'s `scripts/validate_palette.js`:

```
Light (surface #F1F1EB): Reference #B8863A (gold) / Dupe #1E7A52 (green)
  -> PASS lightness band, PASS chroma floor, PASS CVD separation (all-pairs
     dE 9.9), PASS normal-vision floor (dE 20.1), WARN contrast on gold
     (2.85:1) -> relief required: direct value labels + the data-table
     fallback are both shipped unconditionally (see Section 4), so the WARN
     is satisfied, not ignored.

Dark (surface #14160F): Reference #BD8420 (gold) / Dupe #2C9268 (green)
  -> ALL PASS, CVD 7.9 sits in the 6-8 floor band -> legal because secondary
     encoding (direct labels + table) ships regardless of mode.
```

Gold-vs-green is a deliberate warm/cool complementary pairing: gold reads
"the precious original," green reads "the fresh alternative," and green is
also literally this site's own brand accent, so the "Dupe" series and the
site's own visual identity are the same color on purpose - the chart is
telling you which one this site is rooting for, honestly, not neutrally
hiding it.

## 4. Typography

**Cormorant Garamond** (variable, wght 300-700, ital available) for display
type and headlines - a refined, high-contrast old-style garamond, chosen from
`design-taste-frontend`'s approved-if-justified serif rotation (Section 4.1:
"editorial / luxury / publication" is one of the explicit carve-outs; this is
a publication). Verified via `ui-ux-pro-max`'s `typography.csv` as a real,
distinct pairing family, not reused from any sibling.

**Public Sans** (variable, wght 300-700) for UI, nav, labels, and - unlike the
three e-commerce siblings, where the sans is mostly chrome around product
photography - the actual long-form article body copy on this site, because
Public Sans is purpose-built for sustained civic/journalism reading (it is
the U.S. Web Design System's own body typeface), which matches this site's
actual job better than a geometric UI sans would.

Italic descender clearance respected (`leading-[1.15]` minimum + bottom
reserve) wherever an italic emphasis word with a descender appears in display
type, per `design-taste-frontend` Section 4.1's mandatory rule.

Emphasis within headlines uses italic of the *same* family (Cormorant
Garamond italic), never a mixed-font insert.

## 5. Motion: "Settle" (via `emil-design-eng`)

Philosophy, not a single component: **the site's motion should read like a
fragrance settling into its drydown** - things arrive and ease into a resting
state, nothing snaps, nothing bounces except one small, deliberate exception.
Concretely, from `emil-design-eng`'s framework:

- **Should it animate at all?** Gated by frequency. The nav, buttons, and
  filter chips get instant/short (100-200ms) feedback because they're touched
  constantly. First-time/occasional moments (the Dupe Finder's result reveal,
  scroll-ins on article/marketing pages) get the more deliberate treatment
  below. Nothing plays on every keystroke or every list re-sort beyond a
  simple crossfade.
- **Easing tokens** (CSS custom properties, matches `emil-design-eng`'s
  recommended strong custom curves over weak built-in CSS easings):
  `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)` (entrances),
  `--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1)` (on-screen movement),
  linear only for the radar chart's stroke-draw (a constant-rate reveal).
  `ease-in` is never used for UI (it reads sluggish, per the skill).
- **Durations**: button/chip press feedback 120-160ms, dropdowns/comboboxes
  (the reference-fragrance picker) 150-220ms, the full-comparison
  drawer/sheet 250-380ms, marketing scroll-reveals 400-600ms. Everything
  under 300ms except the two explicitly "explanatory" moments (the radar
  stroke-draw, the hero's one-time entrance).
- **Press feedback**: every pressable element gets `scale(0.97)` on `:active`,
  transform+opacity only (no layout properties animated anywhere).
- **Nothing enters from `scale(0)`**: minimum starting scale 0.94-0.96 with
  opacity, everywhere an element enters.
- **Stagger**: result cards in the Dupe Finder's ranked list stagger in at
  40ms/item (within the skill's 30-80ms guidance), capped at the first 6 cards
  so a long list doesn't feel slow.
- **Signature moment - the Match Reveal** (plays once, `viewport: { once:
  true }`, on the radar chart entering view on `/dupe-finder` and inside
  `/comparison/[slug]` articles): the Reference polygon draws in first via an
  SVG `stroke-dasharray`/`stroke-dashoffset` animation, ~550ms, linear (a
  constant-rate line-draw, matches `emil-design-eng`'s guidance that genuinely
  constant-rate motion is the one place linear easing is correct). ~150ms
  later the Dupe polygon fades and scales in from 0.95 to 1 with a small
  spring (`{ type: "spring", duration: 0.5, bounce: 0.18 }` - the one place
  bounce is used anywhere on this site, deliberately, because this is the
  page's actual payoff moment). The overlapping fill area's opacity settles in
  last, ~200ms after that. Fully reduced-motion safe: skips straight to both
  polygons at final opacity/position, no draw-in, no stagger, per
  `prefers-reduced-motion`.
- **Popovers/comboboxes are origin-aware** (`transform-origin` set to the
  trigger, not center) except the full-comparison modal, which stays
  center-anchored because it isn't spatially tied to one trigger.
- Every animation above `MOTION_INTENSITY > 3` is wrapped for
  `prefers-reduced-motion`, per both skills' shared requirement.

## 6. Design dials (`design-taste-frontend` Section 1), split by surface

| Surface | Variance | Motion | Density |
|---|---|---|---|
| Home, About/Standards, article pages (`/guide`, `/comparison`, `/review`), Library | 7 | 5 | 3 |
| Dupe Finder (`/dupe-finder`) | 6 | 6 | 5 |

Reasoning: marketing/editorial pages read close to the skill's own "Editorial
/ Blog" preset (6/4/3) with variance nudged to 7 because the hero and section
rhythm are deliberately asymmetric (anti-center-bias, Section 4.3). The Dupe
Finder needs real density to show comparison data honestly (spec groups,
radar, ranked list) so it moves toward the "Daily App" band, and motion ticks
up one notch specifically for the Match Reveal - the one place on the site
motion is the actual product, not decoration.

## 7. Information architecture

```
/                         Home
/dupe-finder               The comparison tool (centerpiece)
/library                   Combined index of all content (filter: All / Guides
                            / Comparisons / Reviews) - one hub, not three
                            near-identical index pages (avoids
                            Section-Layout-Repetition per the taste skill)
/guide/[slug]               Individual guide (matches the technical plan's
/comparison/[slug]          singular route-naming convention exactly, so
/review/[slug]               JSON-LD composition in the shared kit lines up)
/about                      "Our Standards" - methodology, independence,
                            disclosure policy - the actual trust page
/disclosure                 Full FTC affiliate-disclosure policy (site-wide,
                            distinct from the per-article inline block)
/go/[slug]                  Affiliate redirect route (shared kit, not a page)
app/sitemap.ts, app/robots.ts, app/not-found.tsx
```

Nav (fits one line at `lg`, per the taste skill's hard rule): wordmark +
subline | Dupe Finder - Library - Our Standards | theme toggle. Three items,
comfortably under the one-line/80px-height cap. No duplicate-intent CTAs
anywhere (checked): every "go compare" action says "Find your dupe," every
"read more" action says "Read the [type]," never mixed synonyms for the same
intent.

## 8. The Dupe Finder - mechanics (the actual product)

This is where the brief's "better than Fragrantica" claim has to be earned,
not asserted. Fragrantica's real weaknesses (per
`departments/sales/affiliate-niche-research.md`): cluttered, ad-heavy, note
pyramids as plain text walls, no actual "find your match" flow. Concretely,
this tool does three things Fragrantica does not:

1. **A real matcher flow, not a static database page.** Step 1: pick a
   reference fragrance from a small curated set of the fragrance world's most
   commonly-duped designer/niche scents (Baccarat Rouge 540, Bleu de Chanel,
   YSL Black Opium, Coco Mademoiselle, Tom Ford Tobacco Vanille, Le Labo
   Santal 33 - chosen because independent dupe-culture sources surveyed in the
   niche research actually center on these, not invented for convenience).
   Step 2: ranked dupe candidates appear as cards - brand/name, a computed
   similarity score, price-per-ml value versus the reference, and a one-line
   "why it matches" note. Step 3: opening a candidate expands the full
   comparison (radar + grouped spec panel + verdict).
2. **A visual accord comparison, not a text wall.** The radar chart (6 axes:
   Freshness, Sweetness, Warmth, Woody Depth, Longevity, Sillage - within the
   `dataviz`/`ui-ux-pro-max` chart guidance's 5-8 axis, 2-3 dataset ceiling
   for radar readability) replaces Fragrantica's plain note-pyramid text list
   with something you can actually read at a glance. An always-visible data
   table sits directly beneath it (collapsed by default behind a "View as
   table" disclosure) as the accessible/CVD-safe fallback the `dataviz` skill
   requires for any chart shipped with a contrast WARN or floor-band CVD
   result.
3. **A grouped spec comparison, not a hairline-bordered table.** Per
   `design-taste-frontend` Section 4.9's explicit "spec sheet" guidance
   (`border-b` on every row is the single most-flagged AI-cliche pattern for
   exactly this kind of content): specs are grouped into three clusters -
   **Composition** (notes top/heart/base), **Wear** (longevity, sillage,
   concentration), **Value** (price, price-per-ml, where to buy) - each
   cluster gets one soft divider and a heading, not per-row hairlines. Price-
   per-ml value is shown as a small labeled bar (no filled background track,
   per the taste skill's explicit ban on dashboard-style progress bars as
   comparison visuals - a value figure plus a short inline mark instead).

**Similarity score, honestly computed, not invented-precise:** a weighted
formula (shared-note overlap across top/heart/base, weighted by position;
family match; intensity/sillage delta) produces the percentage shown, and the
methodology is one click away (links to `/about`) rather than presented as an
unexplained black-box number - directly addressing
`design-taste-frontend`'s "fake-precise numbers" flag (Section 4.9): the
number is real output of a stated formula, not a set-dressing figure, and the
formula is disclosed.

**Verdict copy is honest, not a sales pitch**: every comparison's written
verdict names where the match is strong and where it genuinely differs (e.g.
"matches the ambery drydown closely; the opening is noticeably sweeter") -
never a blanket "identical!" claim, which would undermine the entire
neutral-authority positioning this site exists for.

## 9. Content fixtures (4 pieces - guide, 2x comparison, review)

Per the brief: fixtures only, no real affiliate enrollment, every piece
carries the FTC disclosure block from the shared kit's frontmatter schema.
Real designer-fragrance names in text are expected (nominative use, matches
how every real competitor in this space writes). Dupe-side products use real,
currently-operating dupe/inspired-by retailers found in
`departments/sales/affiliate-program-signup-checklist.md`'s own research
(Dossier, MicroPerfumes, ALT. Fragrances) so the fixture data is realistic,
not invented brand names - their `affiliateLinkId`s all resolve to the shared
kit's placeholder-only `lib/affiliate-links.ts`, never a real destination.

1. **Comparison**: "Dossier Ambrosia vs Baccarat Rouge 540" (`comparison`)
2. **Comparison**: "ALT. Fragrances Bright vs YSL Black Opium" (`comparison`)
3. **Guide**: "How to Actually Find a Fragrance Dupe That Works" (`guide`) -
   explains the site's own methodology in reader-facing terms, cross-links to
   `/about` and `/dupe-finder`
4. **Review**: "MicroPerfumes Amber Nights, Reviewed" (`review`) - a single-
   product verdict, `editorialRating` populated, pros/cons populated

## 10. OpenArt image plan (deliberately minimal, per the brief)

Site shell only - no per-product photography (there are no products to shoot;
"products" here are affiliate destinations, not inventory this site sells).
**Trademark caution honored**: every prompt below is abstract/atmospheric -
no real bottle shape, no real label, no identifiable branded packaging, per
this department's standing rule and the brief's explicit reminder.

| Asset | Placement | Nature |
|---|---|---|
| `home-hero-atmosphere` | Home hero, right-hand asymmetric panel | Abstract macro shot: amber liquid catching low light through plain glassware, no bottle silhouette recognizable as a specific product |
| `about-standards-atmosphere` | `/about` hero | A quiet, considered still-life mood shot: a lab-style scent-strip fan and a notebook, evoking "testing," not retail |
| `dupe-comparison-1-support` | Comparison fixture 1, one supporting inline image | Abstract botanical/amber texture (ambergris-toned resin macro) - not a bottle |
| `dupe-comparison-2-support` | Comparison fixture 2, one supporting inline image | Abstract floral/citrus texture (dew on petals, cut citrus peel macro) - not a bottle |

Four static images total, zero video - a hero video loop doesn't earn its
place on a text/data-forward comparison site the way it does on a product
storefront, so it's deliberately skipped rather than generated out of habit.
Actual generation happens in the implementation pass below; this table is the
manifest it executes against, same pattern as the sibling templates'
`asset-manifest.json`.

## 11. Sign-off

No client to sign off (internal Sirketim product); the founder's brief
authorized a full build through this design pass. This document is the
settled direction. Any deviation discovered during implementation gets
recorded back into this file's "Implementation addendum," not silently
diverged from - same convention `fragrance-store-3/DESIGN.md` set.

## Implementation addendum (build phase, 2026-08-25)

Full implementation is done - see the template's own `README.md` for what's
actually built, confirmed `build`/`lint` status, and the full detail on four
real issues a line-by-line audit against `design-taste-frontend`'s Section 14
Pre-Flight Checklist caught and fixed before calling this done (a global
`prefers-reduced-motion` gap for Motion-driven transforms, a same-page
duplicate-CTA-intent violation, an affiliate-CTA wrap risk, and a real
white-on-badge text-contrast failure on the chart-mark gold, fixed with a
separate text-safe token rather than changing the dataviz-validated chart
color). `chrome-devtools` was not present in this session's tool list at
all (not just a stale `claude mcp list` reading) - real browser-level visual
QA is the one open gap this pass could not close, flagged honestly in the
README rather than assumed away. No other deviations from this document's
plan: the IA, dial values, token set, typography pairing, motion philosophy,
Dupe Finder mechanics, content fixtures, and asset manifest were all built
exactly as specified above.

## Implementation addendum v2 (homepage redesign, 2026-08-25)

Same-day follow-up: the founder saw the v1 build, kept `/dupe-finder`
functionally as-is ("loves it as-is"), and asked for the homepage
specifically to be rebuilt to an Awwwards-caliber standard, citing
https://otsuka-air.jp/'s feel (large serif brand statement, a chaptered
vertical scroll narrative, video at chapter moments, restrained premium
palette) as the reference. `chrome-devtools` was checked again for this
pass and confirmed still absent from the tool list, same substitute QA
approach as v1 (see "Honesty notes" in README.md).

### Redesign mode and audit (`design-taste-frontend` §11)

Classified as **Redesign - Overhaul** for the homepage specifically (visual
language changes; IA, routes, nav labels, and every other page are
untouched - `/dupe-finder`, `/about`, `/library`, article routes are all
explicitly out of scope for this pass except the typography/imagery polish
noted below). Audit of the v1 homepage before touching it, reading its own
dial values honestly rather than assuming the documented 7/5/3 (Section 6)
was actually achieved in practice:

- **Read dial values (actual, not intended):** variance ~5, motion ~3,
  density ~3. The hero's asymmetric grid was the only genuinely asymmetric
  moment; everything below it (Mission, Trust Strip, Latest Library) was a
  centered-or-symmetric block stacked in an alternating-tint rhythm - a
  correct-but-generic "sections with borders" pattern common to most
  Tailwind marketing pages, which is exactly what reads as "too normal"
  regardless of how sound the underlying tokens/typography were.
- **What was working and got preserved:** the token set, the Cormorant
  Garamond/Public Sans pairing, the shape rule, Drydown Green as the single
  accent, the "Find your dupe" CTA-intent discipline (the v1 build's own
  README documents fixing a duplicate-CTA-intent issue - this pass reuses
  that exact label at every touchpoint rather than reintroducing variants),
  the no-em-dash / no-named-competitor copy voice, and the Mission section's
  actual copy (it was good; only its centered layout was the problem).
- **What was retired:** the plain 4-up icon-card Trust Strip (the "three/
  four equal cards" pattern the taste skill flags directly), the dedicated
  "Featured Comparison" full-bleed photo band (folded into a new tool-
  focused chapter instead of a single-article promo), and the centered
  Mission text block (content kept, layout rebuilt asymmetric).
- **New dial reading for the homepage only** (other pages keep the original
  Section 6 table): **variance 9, motion 8, density 3** - close to the
  taste skill's own "Landing (Agency/creative)" preset (9/8/3), reasoned
  from "redesign - overhaul" (+2/+2 over the original 7/5/3) and the
  founder's explicit Awwwards/reference-site framing.

### New hero paradigm: Editorial Manifesto Hero, full-bleed

The differentiation table in §2 named this site's hero paradigm "Editorial
Manifesto Hero: type-led, asymmetric left-aligned headline, no dominant
product photograph." That identity holds; what changed is staging - the
hero is now a full-bleed `min-h-[100dvh]` video loop with the manifesto
type sitting on a paper-toned scrim (a gradient built from the theme's own
`--background` token, not a hardcoded black overlay), asymmetric and
bottom/left-anchored rather than centered. This is deliberately not
Meridian's "layered/overlap photo" paradigm (a different structural idea -
side-by-side panels vs. type-over-full-bleed-atmosphere) and the video is
still atmosphere in service of the headline, not a product hero shot, so
the original differentiation claim ("no dominant product photograph")
still holds in spirit even though the staging is now full-bleed.

### The six-chapter scroll narrative

`app/page.tsx` now reads as one continuous narrative rather than six
independent landing-page sections, mapped directly to the beats the
founder specified:

0. **Hero** (`components/home/hero.tsx`) - the manifesto headline, unchanged
   copy, now full-bleed video.
1. **Chapter 1: the trend** (`chapter-trend.tsx`) - what a dupe actually is
   and why the culture around them is real, without inventing statistics
   (no fake-precise numbers per taste skill §4.9 - "the conversation has
   moved to the biggest short-video platforms" instead of a made-up
   percentage). Asymmetric text-left/image-right split.
2. **Chapter 2: the gap** (`chapter-gap.tsx`) - why Drydown exists. Reuses
   the v1 Mission copy verbatim (it was already good) but restages it from
   a centered block into an asymmetric single-column flow with an indented
   contrast aside ("A cluttered database... " vs "One matcher, one public
   formula..."), which also breaks up what would otherwise be three
   consecutive image/visual+text split sections (the taste skill's zigzag-
   alternation cap) between chapter-trend and chapter-formula. Never names
   Fragrantica - matches the voice /about already established.
3. **Chapter 3: the formula** (`chapter-formula.tsx`, evolved from the old
   `finder-preview.tsx`) - the three-step matcher explanation plus the
   live radar-chart "Match Reveal" demo, now with a direct link to
   `/about#methodology` so the site's real differentiator (a disclosed,
   weighted formula) is demonstrated, not just claimed.
4. **Chapter 4: try it** (`chapter-try-it.tsx`) - the second and last video
   on the page, the pivot from editorial narrative to the interactive tool.
   See "Video" below for why this specific clip earns the founder's "one
   chapter-break moment if it truly earns it" bar.
5. **Chapter 5: standards** (`chapter-standards.tsx`, evolved from
   `trust-strip.tsx`) - the same four principles, moved from a four-card
   grid to a single divided list (retiring the "N equal cards" pattern),
   closing on a quiet text-link CTA rather than repeating the big button
   from chapter 4 (pacing: one loud CTA moment, one quiet one).
6. **Closing: library proof** (`library-proof.tsx`, evolved from
   `latest-library.tsx`) - unchanged content and behavior (3 most recent
   pieces, links into `/library`), restyled to read as the narrative's
   quiet tail rather than another bordered block.

Layout-family diversity across the page (taste skill §4.7): full-bleed
video-with-overlay (hero, chapter 4), asymmetric text+image split
(chapter 1), asymmetric text+device single column (chapter 2), asymmetric
text+chart split (chapter 3), divided list (chapter 5), card grid (closing)
- six distinct families, well past the "at least 4 different families
across 8 sections" floor, and no layout family repeats back-to-back.

### Motion techniques implemented

- **Preloader** (`components/site/preloader.tsx` + `lib/preloader-timing.ts`,
  mounted once in `app/layout.tsx`): adapted from
  `fragrance-store/components/store/preloader.tsx` - same mechanics (a
  requestAnimationFrame-driven 0-100 counter with a quadratic ease-out
  curve so it starts fast and settles into 100, a clip-path curtain wipe
  exit on `cubic-bezier(0.76, 0, 0.24, 1)`, a brief 100ms hold at 100
  before the wipe starts), entirely Drydown's own visual identity: the
  DRYDOWN wordmark in Cormorant Garamond rather than a small tracked
  label, Drydown Green rather than gold for the progress rule, no italic
  (italic stays reserved for the hero's own emphasis word). Timing:
  800ms count + 100ms hold + 450ms exit = 1.35s total, identical to the
  proven fragrance-store numbers. The hero's entrance animation reads
  `HERO_REVEAL_DELAY_S` from the same timing file so it starts exactly as
  the wipe clears rather than sitting there finished behind it. Mounts
  once per real page load only (lives above `MotionProvider` in the root
  layout, which Next's App Router keeps mounted across client-side
  `<Link>` navigations) and is skipped entirely under
  `prefers-reduced-motion` (renders `null`, no counter, no wipe).
- **Custom cursor** (`components/site/custom-cursor.tsx`): adapted from
  `fragrance-store/components/store/custom-cursor.tsx` - identical spring
  mechanics (a tight-spring dot at `stiffness: 900, damping: 45` and a
  looser-spring ring at `stiffness: 220, damping: 26`, both driven off the
  same raw `useMotionValue` x/y via Motion's imperative values, never
  `useState`, so it never re-renders the React tree on pointer move),
  restyled around Drydown Green as the only accent (the sibling template's
  cursor uses a second "gold" tint; this site's Color Consistency Lock
  means there is no second UI accent, so the hover-ring tint is
  `primary/10` rather than a second hue). Three hover states: link/button
  (ring grows, primary tint), `data-cursor="view"` targets (ring grows
  further, solid primary fill, serif-italic "View" label - applied to
  `ContentCard` links site-wide and to the chapter-4 CTA), and text inputs
  (cursor hides, native caret shows). Gated on `(pointer: fine)` (never
  mounts on touch) and `prefers-reduced-motion` (a lagging pointer is
  itself a motion effect). This is a deliberate, explicit override of
  `design-taste-frontend` §9.A's general "no custom mouse cursors"
  guidance - done anyway because the founder asked for it by name, citing
  this exact in-repo precedent as the quality bar, and the precedent
  already addresses the a11y/perf concerns the skill's general guidance is
  protecting against (pointer:fine gate, reduced-motion gate, motion-value-
  driven rather than state-driven).
- **Scroll reveals**: unchanged mechanism (`components/site/reveal.tsx`,
  `whileInView` + `viewport: { once: true, amount: 0.3 }`,
  `cubic-bezier(0.23, 1, 0.32, 1)`, 0.5s, per DESIGN.md §5 "Settle"),
  applied to every new chapter's entrance. The radar chart's "Match Reveal"
  (§5's signature moment) is unchanged and now appears twice on the
  homepage's own scroll path (chapter 3's live demo) in addition to
  `/dupe-finder` and comparison articles - no new motion invented here,
  reusing the existing signature moment rather than adding a competing one.

### Video (OpenArt, newly authorized this pass)

Two generations, both PixVerse V6 text2video, 720p, 6s, 16:9, no audio
(muted background loops), logged in full in `generation-log.json`:

1. **`home-hero-loop.mp4`** - hero background. Warm amber-gold liquid
   swirling in an unbranded glass vessel, slow and continuous. Poster/
   reduced-motion fallback reuses the existing `home-hero-atmosphere.png`
   (no new still needed).
2. **`chapter-try-it-loop.mp4`** - chapter 4's background, the one
   "chapter-break moment" the brief authorized beyond the hero. Two
   streams (warm gold, cool green) meeting and swirling without fully
   mixing - deliberately the same two hues as the radar chart's Reference/
   Dupe series (§3), so the clip is a literal visualization of "the
   comparison," not a mood shot chosen for looks. This is the reasoning
   the taste skill's "motion must be motivated" rule asks for, applied to
   an asset choice rather than an animation curve. Poster/reduced-motion
   fallback reuses `dupe-comparison-1-support.png`.

Total: 168 list credits / 152 after the account's 10% Plus-tier MCP
discount (round(84 x 0.9) = 76 per clip x 2). No new still images were
generated - both new chapters that use photography reuse the original
four assets from the v1 pass. Both `<video>` elements are `autoPlay muted
loop playsInline aria-hidden`, gated entirely off under
`prefers-reduced-motion` (renders the poster as a plain `next/image`
instead, no `<video>` tag mounted at all) rather than shipping a manual
pause control - honestly, this is a stronger guarantee for motion-
sensitive visitors than a small pause button most users never notice, but
it is not a WCAG 2.2.2 on-page pause mechanism, and neither loop is a
frame-matched seamless cut (no start/end-frame control was requested);
both prompts were written for slow, continuous, directionless motion
specifically so the loop point reads as a soft continuation rather than a
visible jump, but this was not verified in an actual browser this session
(see "Honesty notes" in README.md).

### `/dupe-finder` polish pass (typography and imagery only)

Scope held exactly to the founder's ask - `lib/similarity.ts`, the radar
chart, the spec panel, and the ranked-list mechanics are byte-for-byte
unchanged.

- **`components/dupe-finder/comparison-detail.tsx`**: the verdict block
  moved from small sans body text (`text-sm`) to the display serif at
  pull-quote scale (`font-display text-xl sm:text-2xl`), and gained a
  low-opacity (`opacity-[0.14]`) texture image behind it (reusing
  `dupe-comparison-1-support.png`, not a new generation) with a
  `--card`-toned scrim for legibility - the one supporting image moment in
  the detail view, kept out of the radar/spec-panel area so the actual
  comparison data stays undistracted, per the founder's "without
  cluttering the functional UI" constraint. Considered a second image
  moment (a small per-candidate texture swatch) and deliberately skipped
  it - it would have meant generating up to 12 more images against the
  project's own "deliberately minimal" imagery discipline, for a payoff
  the founder didn't ask for.
- **`components/content/verdict-callout.tsx`**: same typography treatment
  applied for consistency, since it is literally the same "verdict" UI
  pattern (Quotes icon + text) used inside written articles - a "verdict/
  summary" moment should read the same way whether it is inside the tool
  or an article. No imagery added here (the founder's imagery ask was
  specific to "the detail view").

### Honest gaps carried into this pass

Same structural gap as v1, reconfirmed rather than assumed: `chrome-
devtools` was not in this session's tool list at all. Verification this
pass was `npm run lint` (clean) and `npm run build` (clean - see README.md
for the exact route/bundle output), plus a manual line-by-line read
against `design-taste-frontend`'s Section 14 Pre-Flight Checklist. What
that substitute cannot catch that a real browser would: whether the two
new full-bleed videos actually read well at real viewport sizes and
network conditions, real font-loading/CLS behavior with a `<video>`
element now in the LCP path, and whether the hero's paper-toned scrim
holds enough contrast against the live video (verified against the
video's own color-graded stills and the computed gradient stops, not a
rendered screenshot). Flagged honestly rather than asserted as verified.

## Implementation addendum v3 ("The Atomizer," 2026-08-25)

Same-day second follow-up. Founder feedback on v2: functionally solid, but
visually still reads as generic/"AI slop" - his words. A second reference
(a WebGL-driven Lacoste microsite) was raised but explicitly not chased
visually - no browser tool was available to see it, a text-fetch against a
canvas-driven site returns nothing usable, and the founder said so
plainly rather than asking for a guess at what it looks like. What
actually drove this pass was the founder's own concrete idea, verbatim:
"we can do effects or animations with bottle atomizer."

### Naming the actual problem, not just re-auditing

Worth recording honestly rather than reaching for a vaguer "try harder":
the two pieces that read as generic were named specifically, and they
were real. The v2 preloader and cursor were *adapted* from
`fragrance-store`'s precedent components - reskinned, not reinvented -
and `Reveal`'s `whileInView` fade/slide is probably the single most common
technique on every AI-assisted "premium brand site" being built right
now. Competent execution of an already-common pattern is still what reads
as templated. The fix isn't another decorative layer (a second parallax,
a fade-timing tweak) on top of that formula - it's one mechanic specific
enough to this product that it could not be lifted onto a different
luxury brand's site with a color-swap and still make sense there.

### The system: four touchpoints, one physics, deliberately not more

"The Atomizer" is a single motion vocabulary - mist/spray that releases,
decelerates, and disperses, never bounces, never springs (the one
existing bounce exception, the Dupe Finder's Match Reveal, stays exactly
where it was) - built once and shown at exactly four moments, not
sprinkled across every section. Scoped this narrowly on purpose, per
`emil-design-eng`'s own restraint principle applied to the system itself:
turning every chapter transition into a particle effect would trade one
generic tell (fade-up everywhere) for a new one (mist everywhere), and
would risk exactly the perceived-performance and actual-performance cost
the brief warned against. The ordinary `Reveal` fade/slide stays
unchanged for routine chapter entrances - a site needs both a quiet,
competent default *and* a genuine signature moment; having only the
former was the actual problem, not its existence.

1. **The cursor** (`components/site/custom-cursor.tsx`, full rewrite, not
   a re-skin) - the dot+ring spring cursor is retired outright. Replaced
   with a canvas-based mist trail: a small precision dot sits exactly at
   the pointer (so it stays usable for real clicking) trailing a stream of
   particles that spawn, decelerate (`vx`/`vy` multiplied by a `0.955`
   drag factor every frame, never accelerated), expand, and fade over
   `620ms`. Canvas, not Motion/DOM, was the deliberate tool call here
   (`animate` skill's "cheapest tool that works," applied to a continuous
   high-frequency emitter): up to 90 live particles as `motion.div`s would
   mean up to 90 DOM nodes recalculating style/layout/paint every frame;
   one canvas draws that many circles for a fraction of the cost, off the
   DOM entirely. Hover states change emission itself (spawn interval
   `22ms` default, `15.4ms` on links, `11ms` on `data-cursor="view"`
   targets, paused entirely over text inputs) rather than swapping in a
   separate ring element - there is no ring anymore. Same gating as the
   component it replaces (`pointer: fine`, `prefers-reduced-motion`), plus
   a new `visibilitychange` pause so it never burns CPU in a background
   tab (Sonner's "handle edge cases invisibly" principle, `emil-design-eng`).
2. **The spritz** (`components/home/atomizer-spritz.tsx`, new, used in
   chapter 3 in place of the plain radar-chart mount) - this is the key
   move the founder's brief asked for: tying the flourish to the site's
   actual substance instead of leaving it decorative. A hand-built inline
   SVG atomizer silhouette (a bulb, a stem, a nozzle - line art only,
   deliberately not an OpenArt raster image, both because a generated
   image risked reading as stock/product photography - the exact problem
   this pass exists to fix - and because it keeps the trademark-caution
   line unambiguous by construction) releases a `MistBurst` on scroll into
   view, and only once the burst has had its `550ms` moment does the
   existing `RadarChart` mount - its own "Match Reveal" entrance (stroke-
   draw + spring) is completely unchanged, un-imported-from;
   `radar-chart.tsx` was not touched. The mist doesn't just decorate the
   chart, it leads into it.
3. **The preloader exit** (`components/site/preloader.tsx`, edited) - the
   proven counter/timing mechanics (800ms count, 100ms hold, 450ms exit,
   `HERO_REVEAL_DELAY_S` coordination) are unchanged; what changed is the
   exit's visual treatment. The content block (wordmark, counter,
   progress rule) now blur-dissolves (`filter: blur(9px)` + scale 1.08 +
   fade, Emil Kowalski's "blur masks an imperfect transition" recipe
   applied to "this text becomes mist" specifically) while a `MistBurst`
   releases from the same spot, both playing concurrently with the
   existing clip-path curtain wipe over the same exit window. This is why
   the signature system now shows up from first paint, not partway down
   the page, per the founder's own framing.
4. **The hero headline** (`components/home/mist-headline.tsx`, new, used
   once) - the one deliberate text-reveal moment, not a generic pattern:
   each of the headline's seven words resolves from a blurred, scattered,
   low-opacity state (`blur(10px)`, `translateY(10px) scale(1.06)`) into
   focus, staggered `50ms` apart, `550ms` each, starting at
   `HERO_REVEAL_DELAY_S`. `filter` is paint-only (no layout cost), so this
   is cheap despite touching a property outside the strict transform/
   opacity pair - Emil's own blur recipe, not a new exception invented for
   this. Explicitly a one-off: the doc comment says so, so nobody reaches
   for it as a generic text-reveal utility elsewhere on the site.

A new shared primitive backs two of these: `components/site/mist-burst.tsx`,
a bounded one-shot particle burst (Motion, not canvas - a small, finite,
one-time particle count is exactly where Motion's declarative stagger
beats hand-rolling canvas timing) used by both the preloader and the
spritz. Reusing the same component in both places is deliberate, not
incidental - it's what makes this one system rather than two coincidentally
similar effects.

### Self-critique against the actual guardrail

The founder's ask was specific: find what could be copy-pasted onto a
*different* luxury brand's site with a color-swap and still look at home
there, not just the obvious clichés `design-taste-frontend` already
screens for. Honestly, by category:

- **Passes**: the cursor's mist physics, the spritz-into-chart sequence,
  and the preloader's dissolve are all conceptually load-bearing to
  *this* product (fragrance, atomization, a comparison tool's real data) -
  none of them make sense grafted onto a jewelry, fashion, or hospitality
  luxury site without the underlying metaphor becoming nonsensical. That
  was the actual bar, and this pass was built to clear it, not just to
  add motion.
- **Not re-litigated this pass, on purpose**: the hero's underlying
  *structure* (full-bleed video, gradient scrim, headline, two CTAs) is
  still a shape common to premium sites generally - only its *content*
  (the mist-dispersal text, the ambient cursor now active the moment
  someone moves their mouse) changed. A full structural hero rebuild
  wasn't what was asked for this round (the founder's direction was "run
  with the atomizer idea," not "redesign the hero again") and would have
  been scope creep against a specific, bounded brief. Naming this
  honestly rather than quietly leaving it unaddressed and unmentioned.
- The six-chapter narrative shape, the token set, and the ordinary
  `Reveal` fade/slide used for routine content entrances are all
  unchanged from v2 - deliberately, per the restraint reasoning above.

### OpenArt generations this pass

None. The atomizer silhouette is hand-built SVG specifically to avoid the
raster/stock-photography look a generated image risked - see the spritz
section above. No new images or video were generated in this pass; the
existing four stills and two videos from v1/v2 are unchanged.

### Honest gaps

Same `chrome-devtools` absence as v1 and v2, reconfirmed again rather than
assumed. Verification was `npm run lint` (clean), `npm run build` (clean,
all 15 routes), a full dev-server route sweep (all 200), and inspecting
the rendered HTML directly for the expected structural output (all seven
`MistHeadline` words present as separate `inline-block` spans, the
atomizer SVG's `viewBox` present, the preloader's content server-rendering
as expected) - real, but not the same thing as watching any of this play
in an actual browser. Specifically unverified this pass, stated plainly
rather than assumed fine:
- The canvas cursor's actual feel - particle density, spawn rate, drag
  factor, and the three hover states were all reasoned from the `animate`
  skill's physics guidance and sanity-checked by re-reading the code, not
  watched moving on a real pointer. Emil's own skill flags this exact
  situation ("if the result depends on feel you can't judge from code,
  say so") - saying so here rather than asserting the trail feels right.
- The spritz sequence's actual timing (silhouette in -> burst -> `550ms`
  gap -> chart) was computed from each piece's own stated duration, not
  watched end-to-end; whether `550ms` reads as "just right" versus "a beat
  too long/short" is a feel call a browser would settle immediately and
  this session could not.
- Canvas performance was designed to the `animate` skill's stated budget
  (capped particle count, throttled spawn, transform/opacity-equivalent
  cheap canvas draws, tab-hidden pause) but was never profiled against
  real Core Web Vitals/frame timing, because no browser tool was available
  to do that measurement this session.
