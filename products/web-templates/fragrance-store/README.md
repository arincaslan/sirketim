# Fragrance Store — Sirketim Web Template

A full fragrance/perfume e-commerce storefront: a product catalog, individual
product pages with size/quantity selection, a persistent shopping cart (drawer
+ dedicated page), and a multi-step demo checkout flow ending in an order
confirmation screen.

This is a **Sirketim product** (`products/web-templates/fragrance-store/`),
not a client project — it's meant to be sold as a reusable e-commerce
starting point, then rebranded and customized by whoever buys it. It's a
sibling to `products/web-templates/agency-landing/` (same conventions,
different category: a working store instead of a one-page marketing site).

## Stack

- [Next.js 14](https://nextjs.org/) (App Router) + TypeScript
- [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)-style
  components (`Button`, `Card`, `Badge`, `Input`, `Label`, `Separator`)
- [framer-motion](https://www.framer.com/motion/) for animation — scroll
  reveals, hover/tap micro-interactions on product cards, the cart drawer's
  slide-in/out transition, an animated size-selector highlight, and the
  add-to-cart feedback (button micro-bounce + a toast notification with a
  product thumbnail). `framer-motion` and `motion` are published from the
  same repo at the same version; `framer-motion` was used here since it's
  not deprecated and is what most existing React/Next.js examples reference.
- [zustand](https://github.com/pmndrs/zustand) (with its `persist` middleware)
  for cart state, synced to `localStorage` so a page refresh doesn't wipe the
  cart. This is the one deviation from a hand-rolled Context — zustand avoids
  a fair amount of Context/reducer/hydration-guard boilerplate for this
  specific "persist an array to localStorage" use case.
- [lucide-react](https://lucide.dev/) for icons
- **No backend, no database, no payment processor.** See "Honesty notes"
  below before treating this as a production store.

## Running it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm run start    # serve the production build
npm run lint      # eslint
```

`npm run build` and `npm run lint` both pass cleanly as shipped.

## Structure

```
app/
  layout.tsx                 # root layout: fonts, metadata, Navbar/Footer/Providers
  page.tsx                   # homepage (hero, value props, scent nav, featured grid, newsletter)
  globals.css                 # Tailwind base + CSS theme variables
  products/
    page.tsx                  # catalog page (wraps the client catalog in Suspense)
    [slug]/page.tsx            # product detail page (SSG via generateStaticParams)
  cart/page.tsx                # dedicated cart page
  checkout/page.tsx            # multi-step checkout (shipping -> payment -> review -> confirmation)
  about/page.tsx                # brand story page
  not-found.tsx                  # 404

components/
  ui/                          # shadcn-style primitives (button, card, badge, input, label, separator)
  store/                        # navbar, footer, product card/grid, cart drawer, toasts,
                                 # size/quantity selectors, add-to-cart button, homepage sections
  checkout/                      # stepper, shipping/payment forms, review step, confirmation step

lib/
  types.ts                      # Product, CartLine, ShippingDetails, PaymentDetails, etc.
  products.ts                   # the 12-product catalog + helper functions
  cart-store.ts                  # zustand cart store (persisted to localStorage)
  toast-context.tsx               # React Context powering the add-to-cart toast notifications
  utils.ts                        # cn(), formatPrice(), computeOrderTotals()

public/
  products/<slug>.jpg           # one image per product
  hero.jpg, about.jpg            # homepage hero + about-page image
```

## What's functional

- **Product grid** (`/products`) — all 12 fragrances, responsive grid,
  client-side filter by scent family (Floral / Woody / Oriental / Fresh /
  Gourmand), animated filter-pill highlight, scroll-reveal + hover/tap
  micro-interactions on cards, a "Quick add" button on hover.
- **Product detail pages** (`/products/[slug]`) — statically generated for
  all 12 slugs, breadcrumb, larger image, scent family/concentration,
  description, top/heart/base fragrance notes, a size selector (30/50/100ml,
  each with its own price) with an animated active-pill highlight, a quantity
  stepper, an add-to-cart button, and a "you might also like" related-products
  row (same scent family first, then others).
- **Cart** — add, remove, and update quantity, fully working both as a
  slide-in drawer (framer-motion spring transition, backdrop, animated line
  removal) and as a dedicated `/cart` page. State is a zustand store persisted
  to `localStorage` under the key `fragrance-store-cart`, so it survives a
  refresh. A `hasHydrated` flag avoids flashing an incorrect "empty" state
  before `localStorage` has been read on the client.
- **Add-to-cart feedback** — the button micro-bounces on tap, briefly swaps
  its label for a checkmark ("Added"), and a toast slides in with the product
  thumbnail, name, and a "View bag" action that opens the cart drawer. The
  cart icon's item-count badge pulses in on every change.
- **Checkout** (`/checkout`) — a 3-step flow (Shipping -> Payment -> Review)
  with a progress stepper and animated step transitions, each step validated
  before you can continue (required fields, email format, card-number/expiry/
  CVC format). Review shows the full order summary (line items, subtotal,
  shipping, estimated tax, total — shipping is free over $120, otherwise a
  flat $12; tax is a flat 8% mock estimate). "Place order" simulates a brief
  processing delay, generates an order number, clears the cart, and shows a
  confirmation screen. Refreshing or leaving before that point does not lose
  the cart (still in `localStorage`); leaving *after* confirmation does, same
  as a real store clearing the cart post-purchase.
- **Homepage / About** — hero, value-prop strip, scent-family category tiles,
  a featured-products grid, a newsletter form (UI-only, see below), and a
  brand-story About page.

## Honesty notes — read before selling or deploying this

- **No payment processor is configured.** The checkout's "Payment" step has
  card-style fields (name, number, expiry, CVC) for a realistic flow, but
  they are validated only for *format* (length/pattern), not against any real
  card network — nothing is transmitted or stored anywhere, and no charge is
  ever made. The flow deliberately stops at "Place order," not "Process
  payment." A banner on that step and on the confirmation screen says this
  explicitly. **A buyer must wire up their own payment integration (e.g.
  Stripe Checkout/Payment Intents) before using this commercially.**
- **There is no backend or database.** The cart and the entire checkout flow
  are client-side only, backed by `localStorage` via zustand's `persist`
  middleware. Placing an "order" does not send it anywhere, persist it
  server-side, or email anyone — it just clears the local cart and shows a
  confirmation screen with a randomly generated order number. A buyer who
  wants real orders needs a Route Handler/Server Action + database (Prisma +
  Postgres, per this department's default stack) or a third-party checkout
  provider.
- **Product images are real photographs, not gray placeholder boxes — but
  they are stock/stock-style images, not photos of an actual product, and
  they are a mix of two kinds.** All 14 images (12 products + hero + about)
  were fetched from **loremflickr.com**, a service that redirects
  keyword-tagged requests to real, Flickr-hosted, Creative-Commons-licensed
  photos. In practice, keyword tags like `perfume` or `perfume,bottle` return
  a real, but uncurated, sample of Flickr's tagged pool — many of the results
  were unusable (photos of real, identifiable commercial perfume brands like
  Chanel, Dior, Avon, Versace, and Tommy Bahama with their branding clearly
  visible; a few results that were off-topic or not brand-appropriate for a
  storefront). Every image actually shipped in `public/` was individually
  reviewed and hand-picked to exclude those. What's left is a curated mix of:
  - a handful of genuine, unbranded perfume/glass-bottle photography
    (`velvet-oud`, `midnight-leather`, `iris-poudre`, the homepage hero), and
  - complementary nature/ingredient/mood photography (a rose for
    Rose Absolute, a lemon tree for Citrus Noir, coastal waves for Ocean
    Bloom, a night sky for the About page, etc.) for the rest, chosen to
    match each product's scent profile.

  This was a deliberate call given what the source actually returns (see
  "Why not literal bottle photos for every product?" below), not a shortcut
  — but **none of these are licensed for commercial resale as product
  photography.** Replace everything in `public/products/`, `public/hero.jpg`,
  and `public/about.jpg` with real, licensed product photography (or your own
  studio shots) before using this commercially. Filenames and the `image`
  field in `lib/products.ts` are the only things to update — no other code
  changes are needed.
- **No license file yet** — same gap as `agency-landing`. Add one (e.g. a
  standard "single-site use" template license) before this goes up on a
  marketplace.

### Why not literal bottle photos for every product?

Keyword image APIs like loremflickr can't guarantee *content*, only a tag
match, and Flickr's tagged pool for fragrance-related terms turned out to be
dominated by (a) real collectors' photos of real, branded perfume bottles —
unusable here since displaying a real brand's product under one of this
template's fictional product names would be actively misleading, not just
imperfect — and (b) unrelated photos that happened to share a tag. Rather
than ship gray boxes, mismatched real brands, or watermarked/inappropriate
results, the catalog uses genuine bottle photography where a clean result was
available and honest, on-theme ingredient/mood photography everywhere else —
all real photos, reviewed individually, none synthetic.

## Customizing for a buyer

- **Brand name**: the placeholder brand is "Ambre" — it appears in
  `components/store/navbar.tsx`, `components/store/footer.tsx`, and the
  metadata in `app/layout.tsx`. Search for "Ambre" across those three files.
- **Colors/theme**: edit the HSL CSS variables in `app/globals.css`
  (`--primary`, `--secondary`, `--accent`, `--gold`, etc.) — every component
  reads from these, so a palette swap is a one-file change. `--gold` is the
  template's accent color (badges, focus states, icon highlights); swap it
  for whatever accent fits the buyer's brand.
- **Fonts**: `Inter` (sans) and `Playfair Display` (serif, used for headings
  and the wordmark) are loaded in `app/layout.tsx` via `next/font/google` —
  swap either for any other Google font.
- **Catalog**: everything lives in `lib/products.ts` as a typed array — name,
  scent family, concentration, tagline, description, highlights, notes,
  image path, badge, and per-size pricing. Add, remove, or edit products
  there; the grid, filters, PDPs, and related-products logic all read from
  this one file. Scent families are a fixed union type in `lib/types.ts`
  (`Floral | Woody | Oriental | Fresh | Gourmand`) — add a family there and
  in `SCENT_FAMILIES` in `lib/products.ts` if you need a sixth.
- **Images**: see "Honesty notes" above — replace everything under
  `public/products/`, plus `public/hero.jpg` and `public/about.jpg`.
- **Shipping/tax math**: the free-shipping threshold, flat shipping cost, and
  mock tax rate are constants at the top of `lib/utils.ts`
  (`FREE_SHIPPING_THRESHOLD`, `FLAT_SHIPPING_COST`, `TAX_RATE`).
- **Newsletter form**: `components/store/newsletter.tsx` is UI-only — it
  shows a confirmation message on submit but doesn't call an API or store the
  email anywhere. Wire it to a real provider (Mailchimp, Resend, etc.) via a
  Route Handler before relying on it.
- **Checkout/payment**: see "Honesty notes" — `components/checkout/payment-form.tsx`
  and the "place order" handler in `app/checkout/page.tsx` are the two files
  to replace with a real payment integration.

## License

Not yet defined — same as `agency-landing`. Add a license file before this
goes up on a marketplace.
