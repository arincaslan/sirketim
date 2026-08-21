# Nocturne (fragrance-store-2) — Sirketim Web Template

A full fragrance/perfume e-commerce storefront built around a **dark-maximalist**
design direction: product catalog with sidebar filtering, product detail
pages, a persistent bag, and a single-page demo checkout ending in an order
confirmation screen.

This is a **Sirketim product** (`products/web-templates/fragrance-store-2/`),
not a client project — meant to be sold as a reusable e-commerce starting
point, then rebranded and customized by whoever buys it. It's the second
fragrance-store template, a deliberate design-direction sibling to
`products/web-templates/fragrance-store/` ("Ambre" — cream/near-black
editorial-luxury). See `DESIGN.md` in this folder for the full direction
rationale and per-page artboards drafted before implementation, plus a note
on why (this environment doesn't have the `design` skill installed).

## Stack

Same core stack as `fragrance-store`, with a couple of deliberate swaps:

- [Next.js 14](https://nextjs.org/) (App Router) + TypeScript
- [Tailwind CSS](https://tailwindcss.com/) + shadcn/ui-style components
  (`Button`, `Card`, `Badge`, `Input`, `Label`, `Separator`, `Accordion`)
- [framer-motion](https://www.framer.com/motion/) for scroll reveals,
  hover/tap micro-interactions, the mobile filter bottom-sheet, and the
  add-to-cart toast
- [zustand](https://github.com/pmndrs/zustand) (+ `persist`) for the cart,
  synced to `localStorage`
- [lucide-react](https://lucide.dev/) for icons
- **No `lenis` smooth-scroll and no custom cursor / preloader / grain
  overlay** — those are Ambre's signature interaction devices; Nocturne
  deliberately doesn't reuse them (native scroll + `whileInView` reveals +
  scroll-snap rails instead, see `DESIGN.md`).
- **No backend, no database, no payment processor.** See "Honesty notes"
  below.

## Running it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm run start    # serve the production build
npm run lint      # eslint
```

`npm run build` and `npm run lint` both pass cleanly as shipped (verified,
not assumed — see the department's delivery notes).

## Structure

```
DESIGN.md                       # pre-code artboards: direction, tokens, per-page layout

app/
  layout.tsx                    # root layout: fonts (Fraunces + Inter), metadata, Navbar/Footer/Providers
  page.tsx                      # homepage (hero, marquee, bento collections, featured rail, pull-quote, newsletter)
  globals.css                   # Tailwind base + obsidian/ember CSS theme variables
  products/
    page.tsx                    # catalog page (wraps the client catalog in Suspense)
    [slug]/page.tsx              # product detail page (SSG via generateStaticParams)
  cart/page.tsx                  # dedicated bag page (no drawer anywhere in this template)
  checkout/page.tsx              # single continuous-scroll checkout (no step wizard)
  about/page.tsx                  # brand story page

components/
  ui/                            # shadcn-style primitives, incl. accordion.tsx (not in fragrance-store)
  store/                          # navbar, footer, marquee, bento collections, featured/related rails,
                                   # filter sidebar, product card, purchase panel, notes pyramid, toasts
  checkout/                        # shipping/payment sections + confirmation (single page, no stepper)

lib/
  types.ts                        # Product, CartLine, ShippingDetails, PaymentDetails, etc.
  products.ts                     # the 11-product catalog + helper functions (Nocturne copy/voice)
  cart-store.ts                    # zustand cart store (persisted to localStorage)
  toast-context.tsx                 # React Context powering the add-to-bag toast
  use-prefers-reduced-motion.ts      # reduced-motion hook (available for further use; marquee's own
                                      # reduced-motion handling is a plain CSS media query in globals.css)
  utils.ts                          # cn(), formatPrice(), computeOrderTotals()

public/
  products/<slug>.png             # shared with fragrance-store — see "Honesty notes"
  hero.jpg, about.jpg              # shared with fragrance-store — see "Honesty notes"
```

## What's functional

- **Product grid** (`/products`) — all 11 fragrances, a persistent left
  sidebar filter (family / concentration / price band, multi-select
  checkboxes) on desktop, a bottom-sheet filter panel on mobile, a
  masonry-style (CSS columns) results layout instead of a uniform grid,
  scroll-reveal + hover/focus micro-interactions on cards, a "Quick add"
  button visible on hover *and* keyboard focus.
- **Product detail pages** (`/products/[slug]`) — statically generated for
  all 11 slugs, breadcrumb, a stacked two-block image column (product photo
  + a typographic "atmosphere" block, standing in for a multi-image gallery
  since only one photo per product exists — see "Honesty notes"), a sticky
  purchase rail (size selector, quantity stepper, add-to-bag, an accordion
  for notes/highlights/shipping), a notes "pyramid" rendered as layered
  top/heart/base bands, and a horizontal-scroll related-products rail.
- **Bag** — add, remove, update quantity on a dedicated `/cart` page (no
  slide-in drawer component exists in this template at all — adding an item
  surfaces a bottom toast with a "View bag" link to the full page instead).
  State is a zustand store persisted to `localStorage` under
  `fragrance-store-2-cart`, gated by a `hasHydrated` flag.
- **Checkout** (`/checkout`) — one continuous scroll (contact/shipping,
  then payment), validated together on submit rather than step-by-step; a
  sticky order-summary rail sits alongside the whole time. "Place order"
  simulates a brief delay, generates an order number, clears the cart, and
  shows a confirmation screen.
- **Homepage** — split hero, an auto-scrolling marquee ticker
  (`prefers-reduced-motion`-aware), an asymmetric bento grid of the five
  scent families, a horizontal scroll-snap "Edit" rail, an oversized
  pull-quote block, and a newsletter band (UI-only).
- **About** — oversized opening statement, two-column brand story, a
  full-bleed night-sky image break, a three-step "ritual" section, closing
  CTA.

## Honesty notes — read before selling or deploying this

- **No payment processor, no backend/database** — identical scope
  limitation to `fragrance-store`. The checkout's payment fields are
  format-validated only; nothing is transmitted, charged, or persisted
  server-side. A banner on the payment section and the confirmation screen
  say this explicitly.
- **Product photography is shared with `fragrance-store`, not new
  photography.** No image-generation tool was available in this session
  (see the department's delivery notes on the `openart` MCP / tooling
  gaps). All 11 product photos, `hero.jpg`, and `about.jpg` are copied
  as-is from `../fragrance-store/public/`. To make the warm, cream-backdrop
  product photography read correctly against this template's obsidian
  background, every product image sits inside a `.spotlight-card` — a soft
  warm radial gradient card (see `app/globals.css`) rather than flat black —
  so the bottle reads as deliberately lit out of the dark. This is a
  legitimate dark-theme commerce pattern, but it is a styling workaround
  for reused assets, not a redesigned photoset. **Nocturne's brand name,
  product names, and copy are original to this template** (see
  `lib/products.ts`) even though the underlying photography and scent
  data — family, notes, pricing — match `fragrance-store` one-for-one.
  Same commercial-licensing caveat as `fragrance-store`'s own README:
  replace `public/products/`, `public/hero.jpg`, and `public/about.jpg`
  with licensed photography before using this commercially.
- **Product detail "gallery" is one real photo, not several.** The second
  stacked image block on `/products/[slug]` is a typographic panel (scent
  family name as oversized watermark type), not a second product photo —
  there was no second angle/shot available per product. Swap in real
  additional photography there if you have it; the layout (`app/products/[slug]/page.tsx`)
  already supports a second `relative` image block in that same stack.
- **No license file yet** — same gap as `fragrance-store` and
  `agency-landing`. Add one before this goes up on a marketplace.

## Customizing for a buyer

- **Brand name**: the placeholder brand is "Nocturne" — appears in
  `components/store/navbar.tsx`, `components/store/footer.tsx`, and the
  metadata in `app/layout.tsx`.
- **Colors/theme**: edit the HSL CSS variables in `app/globals.css`
  (`--background`, `--primary`/ember, `--foil`, etc.) — every component
  reads from these. `--primary` doubles as the one saturated CTA color
  (there's no separate "gold-variant" button like Ambre's).
- **Fonts**: `Fraunces` (display) and `Inter` (sans/UI) are loaded in
  `app/layout.tsx` via `next/font/google`.
- **Catalog**: `lib/products.ts` — same shape as `fragrance-store`'s
  catalog (name, family, concentration, tagline, description, highlights,
  notes, image path, badge, per-size pricing).
- **Images**: see "Honesty notes" above.
- **Shipping/tax math**: constants at the top of `lib/utils.ts`.
- **Newsletter form**: `components/store/newsletter.tsx` is UI-only.
- **Checkout/payment**: `components/checkout/payment-section.tsx` and the
  submit handler in `app/checkout/page.tsx`.

## License

Not yet defined — same as `fragrance-store` and `agency-landing`. Add a
license file before this goes up on a marketplace.
