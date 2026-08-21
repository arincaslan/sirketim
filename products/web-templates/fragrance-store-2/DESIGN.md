# NOCTURNE — Design Artboards

Product: second Sirketim fragrance/perfume e-commerce template, sibling to
`../fragrance-store` ("Ambre" — cream/near-black editorial-luxury). This file
is the pre-code design pass: direction, rationale, and a page-by-page
artboard (layout description) for every required screen, settled before any
component was written.

**Tooling note:** the `design` skill referenced by `departments/web-development/CLAUDE.md`
is not present in this environment — it does not exist under `~/.claude/skills/`
or `.claude/skills/` in this repo, and no Skill-invocation tool was exposed to
this session at all (checked via `find-skills`'s own documented search
locations). This document is the manual substitute: real artboards (layout,
hierarchy, interaction) drafted and settled before implementation, matching
the workflow's intent even though the specific skill tool doesn't exist here.
Flagged in the final report, not silently worked around.

## Direction: dark maximalist / nocturnal parfumerie

Ambre is warm, cream, single-column, editorial, quiet — custom cursor, grain
overlay, preloader, soft gold accents. NOCTURNE goes the opposite way on
every axis that matters, not just color:

| Axis | Ambre (store 1) | NOCTURNE (store 2) |
|---|---|---|
| Palette | Cream bg, near-black text, muted gold accent | Near-black obsidian bg, warm off-white text, saturated ember-red primary + pewter secondary accent |
| Type | Playfair Display serif, restrained sizes | Oversized display serif/grotesk mix, marquee ticker, pull-quotes at hero scale throughout |
| Home layout | Single-column hero → value props → scent nav → grid → newsletter | Asymmetric split hero → auto-scrolling marquee strip → bento-grid collections → horizontal-scroll snap product rail → oversized pull-quote → newsletter band |
| Listing | Top pill filter nav, uniform grid | Persistent left sidebar filters (desktop) / bottom-sheet (mobile), asymmetric masonry-weight grid |
| Product detail | Single static image + side panel, single-column below | Stacked vertical image sections (scroll-through gallery) + **sticky** purchase rail, notes shown as a layered pyramid graphic |
| Cart | Slide-in side drawer, auto-opens on add | Dedicated full-bleed `/cart` page (no auto-opening drawer) + a bottom **toast** confirmation with "View bag" on add-to-cart |
| Checkout | 3-step wizard (Shipping → Payment → Review) with a stepper | Single continuous scroll, all sections open at once, no step-hiding; sticky dark summary rail alongside |
| Signature interaction | Custom cursor, film-grain overlay, preloader wipe | None of those three — instead: scroll-snap horizontal rails, `whileInView` clip/slide reveals, magnetic-feel hover on primary CTAs, auto-scrolling marquee ticker |

Chosen over minimalist/Scandinavian or brutalist because it's the sharpest
possible contrast to Ambre's specific "quiet editorial" feel while still
being a legitimate, sellable perfume-brand aesthetic (dark maximalist reads
as intense/niche-parfumerie, a real market segment — think Byredo/Le Labo's
darker sibling, not a generic "dark mode toggle").

### Design tokens (settled before component work)

```
--background:        240 6% 6%     (obsidian, near-black with a cool tint)
--foreground:         40 20% 96%   (warm off-white)
--card:               240 6% 9%
--primary (ember):    355 70% 48%  (saturated crimson-red — the one accent
                                     used for CTAs, focus rings, price)
--secondary (pewter):  0  0% 22%   (dark warm gray panels)
--muted:              240 5% 14%
--muted-foreground:   40  8% 65%
--border:             240 6% 18%
--foil:               38  25% 70%  (desaturated warm silver — small accents,
                                     dividers, icon strokes; never the
                                     primary CTA color, unlike Ambre's gold)
--radius:             0.25rem      (sharper corners than Ambre's 0.6rem —
                                     part of the "harder edge" signature)
```

Fonts: `Fraunces` (display serif, used oversized/bold for headlines — has a
sharper, higher-contrast personality than Playfair) + `Inter` (body/UI). No
italic-as-accent trick (that's Ambre's signature); NOCTURNE uses scale and
weight contrast instead.

Product photography: reuses the existing Ambre bottle photography (no new
photoshoot/image-generation tool available in this session — noted, not
hidden). To make warm cream-backdrop photography read correctly on an
obsidian background, every product image sits inside a card with a soft
warm radial "spotlight" gradient behind it (matches the amber tone already
in the photos) rather than being placed on flat black — the bottle now
reads as deliberately lit out of the dark, a legitimate and common
dark-theme commerce pattern, not a mismatch. Brand renamed **NOCTURNE**
(Ambre's brand is "Ambre" — kept distinct); product copy rewritten with a
nocturnal/intensity voice instead of Ambre's calm-editorial voice, same
underlying scent data (family/notes/price) since it's tied to the shared
photography set.

## Page-by-page artboards

### 1. Home (`/`)
```
┌─────────────────────────────────────────────────────────┐
│ NAV: logo · Shop / Edit / About  ·  bag icon  (sticky,   │
│ transparent over hero, solidifies obsidian+blur on scroll)│
├─────────────────────────────────────────────────────────┤
│ HERO — split, asymmetric 58/42                            │
│ ┌───────────────────────────┐ ┌─────────────────────┐    │
│ │ Oversized Fraunces headline│ │ dark ember-glow panel│    │
│ │ overlapping bottle photo   │ │ "Bottle of the hour" │    │
│ │ bleeding off the top edge  │ │ card + price + CTA   │    │
│ │ Eyebrow + CTA row below    │ │                       │    │
│ └───────────────────────────┘ └─────────────────────┘    │
├─────────────────────────────────────────────────────────┤
│ MARQUEE — auto-scrolling ticker strip, ember bg,          │
│ "NOCTURNAL BLOOM · SMALL BATCH · EAU DE PARFUM · ..."      │
├─────────────────────────────────────────────────────────┤
│ COLLECTIONS — asymmetric bento (2 large tiles + 3 small),  │
│ each = scent family, hover reveals top/heart/base notes    │
├─────────────────────────────────────────────────────────┤
│ THE EDIT — horizontal scroll-snap product rail (not a      │
│ static grid), drag/scroll, partial-card peek at the edge   │
├─────────────────────────────────────────────────────────┤
│ RITUAL — 2-col editorial block, oversized pull-quote right,│
│ short brand copy left                                      │
├─────────────────────────────────────────────────────────┤
│ NEWSLETTER — full-bleed obsidian band, inline email form    │
├─────────────────────────────────────────────────────────┤
│ FOOTER — dark, condensed, foil-colored hairline dividers   │
└─────────────────────────────────────────────────────────┘
```
States: hero image lazy-fades in (no preloader wipe); marquee pauses on
`prefers-reduced-motion`; bento tiles show static (no hover state) on touch.

### 2. Product listing (`/products`)
```
┌───────────┬─────────────────────────────────────────────┐
│ SIDEBAR   │ Sort control (top-right)                      │
│ (sticky,  │ Asymmetric grid: rows alternate 1 large +      │
│ desktop)  │ 2 small card widths, not uniform 3-up          │
│ Family    │                                                │
│ checkboxes│ [product cards...]                             │
│ Conc.     │                                                │
│ Price     │ Empty state: no results copy + "Clear filters" │
│ range     │                                                │
└───────────┴─────────────────────────────────────────────┘
Mobile: sidebar collapses into a bottom-sheet "Filter" trigger bar.
```
States covered: empty (no matches), loading is not applicable (static data,
no skeleton needed), long product names truncate with `line-clamp`, filter
chips show active-count badge.

### 3. Product detail (`/products/[slug]`)
```
┌───────────────────────┬───────────────────────────────┐
│ Breadcrumb                                              │
├───────────────────────┬───────────────────────────────┤
│ STACKED IMAGE SECTIONS │ STICKY PURCHASE RAIL           │
│ (scroll through full-  │ Name / family / price          │
│ width image blocks,    │ Size selector                  │
│ warm-spotlight cards)  │ Notes accordion (top/heart/base)│
│                        │ Add to cart (ember CTA)         │
│                        │ Highlights checklist            │
├───────────────────────┴───────────────────────────────┤
│ NOTES PYRAMID — layered graphic (top/heart/base as       │
│ stacked horizontal bands, not a plain list)               │
├───────────────────────────────────────────────────────┤
│ RELATED — horizontal scroll-snap rail                    │
└───────────────────────────────────────────────────────┘
```
Purchase rail is `sticky` on desktop, stacks below images on mobile — never
overlaps or gets clipped at short viewport heights (`max-h` + internal
scroll, not fixed `height`).

### 4. Cart (`/cart`)
```
┌─────────────────────────────┬───────────────────────┐
│ Line items (large thumbnails,│ STICKY ORDER SUMMARY   │
│ stepper qty, remove icon)    │ (dark card, foil       │
│                               │ hairline rules)        │
│ Empty state: bag icon + copy │ Continue to checkout   │
│ + "Shop the collection" CTA  │ (ember CTA)             │
└─────────────────────────────┴───────────────────────┘
```
No auto-opening drawer anywhere in this template — adding an item instead
surfaces a bottom-of-viewport toast ("Added to bag — View bag") that
self-dismisses; this is the deliberate interaction-pattern difference from
Ambre's slide-in drawer.

### 5. Checkout (`/checkout`)
```
┌───────────────────────────────┬─────────────────────┐
│ Contact                        │ STICKY DARK SUMMARY   │
│ Shipping address                │ RAIL (line items,     │
│ Payment                         │ subtotal/ship/tax/    │
│ (all sections open at once,     │ total, always visible)│
│ one continuous scroll — no      │                        │
│ step-hiding/wizard)             │ Place order (ember)   │
├───────────────────────────────┴─────────────────────┤
│ Confirmation state replaces the whole page on submit   │
└───────────────────────────────────────────────────────┘
```
Empty-cart state redirects copy to "Your bag is empty" + CTA, same as
Ambre's guard but restyled.

### 6. About (`/about`)
```
Oversized opening statement (Fraunces, hero scale) → founder/brand story
two-column block → image break (full-bleed, warm-spotlight treatment) →
timeline/ritual steps (numbered, foil dividers) → closing CTA band.
```

## Sign-off

No client to sign off (internal Sirketim product, not client work) — this
document is the settled direction the founder can review; department
proceeded to implementation against it, per the task brief's authority to
build the second template end to end.
