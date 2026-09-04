# Affiliate product feeds (gitignored)

Raw merchant product feeds land here and are **not committed** (`/scripts/feeds/` is
in `.gitignore`, this README excepted). They are licensed data delivered through an
affiliate network, large, and not ours to redistribute in a public repo. Ingest
scripts read a feed from here and write typed, reviewed data into `lib/data/` — the
feed file itself stays local.

**These files do not travel with a clone.** If a script here fails with "feed not
found", re-download from Awin rather than assuming it is broken.

## Files

| File | Source | Notes |
|---|---|---|
| `opulensi.csv[.gz]` | Awin advertiser **Opulensi Perfumes** (Awin ID **123248**), publisher 3064149 | 610 rows, all `currency=GBP`. 86 columns. **Tracking works** — this is the only merchant we can currently earn from. Middle-Eastern houses: Lattafa 132, Al-Rehab 98, Ard Al Zaafaran 58, Anfar 57, Sapil 38, Adyan 34, Maison Alhambra 16, Armaf 1. |
| `clone-of-perfume.csv[.gz]` | Awin advertiser **Clone of Perfume** (Awin ID **117395**), publisher 3064149. Approved 2026-09-03 | **11 rows**, all `currency=USD`. 86 columns. A **dupe house selling direct** — the brand ("The CLONE") and the shop are one company, so unlike Opulensi there is no reseller in between. **Tracking works.** 9 of the 11 rows became listings. |
| `my-perfume-shop.csv[.gz]` | Awin advertiser **My Perfume Shop** (Awin ID **106089**), publisher 3064149, delivered via `sftp://datafeeds.shareasale.com/Awin/161226/feed.zip` | ~9,844 rows, all `currency=USD`. 35 columns. Genuine designer fragrances — **originals-side**, not a dupe house. **Programme is CLOSED for tracking — do not ship buy links from this feed.** |

## Which feed backs what

Counts measured 2026-09-03; recompute rather than trusting them.

| Output | Feed | Script |
|---|---|---|
| `lib/data/merchant-offers.generated.ts` | my-perfume-shop | `scripts/ingest-feed.mjs` |
| `lib/data/feed-images.generated.ts` (156 reference images) | my-perfume-shop | `scripts/fetch-feed-images.mjs` |
| `lib/data/dupe-images.generated.ts` (**39** dupe images: 30 opulensi + 9 clone-of-perfume) | opulensi **and** clone-of-perfume | `scripts/fetch-dupe-images.mjs` |
| the **39** real entries in `lib/affiliate-links.ts` (30 opulensi + 9 clone-of-perfume) | opulensi, clone-of-perfume | hand-written from feed rows, each traced first |

`fetch-dupe-images.mjs` handles both merchants from one `SOURCES` map — each entry names its own
`feed`, so a third merchant is a new `FEED` constant and nothing else. **Do not fork the script per
merchant**: the orphan report at the bottom only works while one script owns `public/images/dupe/`.

## Verifying a link actually earns — do this before adding any entry

**Being joined to a programme is not being able to earn from it.** My Perfume Shop is
approved, supplies a feed, and shows payment status green, and every one of its links
is dead. There is a script that checks every entry at once:

```bash
npm run check:links     # scripts/check-affiliate-links.mjs
```

Or by hand, to follow one redirect:

```bash
curl -s -o /dev/null -L -c - -w '  final: %{url_effective}\n' \
  "https://www.awin1.com/pclick.php?p=<aw_product_id>&a=3064149&m=<merchant_id>&clickref=probe"
```

Read three things off the result:

1. **The final URL is on the merchant's own domain.** Anything ending on
   `awin1.com/closedMerchant.html` is a programme that is not serving clicks.
2. **Our sub-ID survived** — but check the right place, see below.
3. **An `awc=` cookie is set**, of the form `awc=<merchantId>_<timestamp>_<hash>`.
   That cookie is the tracking. `-c -` prints the cookie jar to stdout.

### The sub-ID does NOT have to appear in the destination URL

**This produced a false failure on 2026-09-03 and the reasoning is worth keeping.**

Opulensi echoes our `clickref` back into the landing URL as `utm_id=3064149_<subId>`, and the
checker was written to assert that. It is **not an Awin guarantee** — it is Opulensi's own
Shopify theme copying a query parameter through. Clone of Perfume does not do it, so all nine of
its links were reported as "clicks would be unattributable" while tracking perfectly.

The channel that actually decides attribution is **Awin's own click cookie**, set on `.awin1.com`
at the *first* hop, before the merchant is involved at all:

```
aw<merchantId>=<affiliateId>|0|0|<timestamp>|<our clickref>|aw|<aw_product_id>
```

Both merchants set it, identically shaped — `aw123248=…` and `aw117395=…` — which is how you can
tell it is the network-level record and the URL echo is the merchant-specific extra.

To see it you must **follow the redirects by hand**: with `curl -L` (or `fetch(redirect:"follow")`)
only the final response's headers survive, and this cookie is set on the first one. Use `-c -` to
dump the whole jar:

```bash
curl -s -o /dev/null -L -c - "https://www.awin1.com/pclick.php?p=<pid>&a=3064149&m=<mid>&clickref=probe" \
  | grep "aw<mid>"
```

`npm run check:links` now does this itself and reports which channel carried the sub-ID
(`Awin click cookie aw117395` vs `... + destination URL`), so "verified out of band" and
"survived in the URL" are distinguishable rather than both printing a bare PASS. A link that
reaches **neither** channel still fails hard — that check was strengthened, not relaxed.

Per-advertiser context lives in `MERCHANT_NOTES` in that script. It is printed, never used to
skip a check.

Confirming a click in the **Awin dashboard** is the second half, and it is a different
question — it tells you Awin recorded the click, not just that the redirect worked:
Reports → *Performance* (or *Click Report*), set the date range to today, and look for
the click against advertiser 123248 with our `clickref` in the Click Ref column.
**Expect a delay of a few hours** — the report is not real time, so an absent click
within minutes of testing means nothing either way.

## `opulensi.csv` shape (86 columns)

- `aw_deep_link` — tracked link, `https://www.awin1.com/pclick.php?p=<pid>&a=3064149&m=123248`.
  Append `&clickref=<subId>`; `lib/affiliate-links.ts` stores the link *without* the
  sub-ID and composes it in `affiliateDestination()`, so attribution cannot be dropped.
- `product_name` — **588 of 610 carry the size in the name** ("… 100ml Extrait Perfume").
  This is the field that makes real price-per-ml possible; the My Perfume Shop feed has
  no size column at all.
- `brand_name` — a real separate column, 610/610 filled. My Perfume Shop has none.
- `search_price` + `currency` — GBP throughout. `rrp_price` is empty.
- `in_stock` / `stock_quantity` — both 610/610 filled, and **both were wrong at least once.**
  The Armaf limited edition carries `in_stock=1` in the feed while the live Opulensi page
  says `OutOfStock`. Feed stock is a snapshot taken at export; treat it as a hint and read
  real stock off the product page (`npm run check:links` does this). `stock_quantity` is
  the string `"true"`, not a number — it is not a quantity at all.
- `merchant_image_url` — Shopify CDN, 610/610. `large_image` and the `alternate_image*`
  columns are **empty**, so there is one usable image per product, not two.
- `aw_product_id` — the `p=` in the deep link. Keep data keyed on this: it is what makes
  a picture and a buy button provably refer to the same product.

## `clone-of-perfume.csv` shape (86 columns, 11 rows)

Same 86-column Awin template as `opulensi.csv`, so the column names carry over — but what is
*filled in* differs, and two of the differences matter.

- `aw_deep_link` — `https://www.awin1.com/pclick.php?p=<pid>&a=3064149&m=117395`. Works.
- `brand_name` — `Clone` on all 11 rows (the storefront brands itself "The CLONE"). Useless as a
  discriminator with a single-brand merchant, unlike Opulensi's eight houses.
- `description` — **the strongest field in this feed.** Every fragrance row carries a full
  top/heart/base pyramid *and* names the designer original outright ("Inspired by Baccarat Rouge
  540", "inspired by the iconic Sauvage"). Opulensi managed that on 21 of 610 rows; this managed
  it on 10 of 10. All nine listings are cited pairings as a result — none is editorial judgement.
- **NO SIZE FIELD, AND NO SIZE ANYWHERE.** `dimensions`, `specifications`, `product_model` and
  `colour` are **empty on all 11 rows**, the product names carry no size (unlike Opulensi, where
  588 of 610 do), and no ml or oz figure appears in any description. This is the same gap that
  stopped `ingest-feed.mjs` deriving a price-per-ml from My Perfume Shop, and it matters more
  here because bottle size feeds the "Nx cheaper per ml" claim. **Read the size off the live
  product page** (`merchant_deep_link`), where the buy block states `Size: 50ML / 1.7 OZ`.
  All nine listings turned out to be 50ml; none had to be guessed.
- **No concentration field either.** Also read off the product page — every one is
  `Extrait de Parfum`, stated in the buy block beside the size.
- `search_price` + `currency` — **USD**, against Opulensi's GBP. Currencies are never converted;
  `offers[]` is per-retailer and stores the merchant's own. Do not add conversion.
  **Two of eleven prices were stale** when checked against the live pages on 2026-09-03
  (Naked Cherry $39.99 → $45.00, Brave in Love $34.99 → $39.99). Prices decay fastest of all.
- `in_stock` / `stock_quantity` — `stock_quantity` is a real integer here (897–2023), not
  Opulensi's literal string `"true"`. Still do not trust it: read stock off the product page.
  On this feed the flag happened to be right — all nine were genuinely in stock.
- `merchant_image_url` — Shopify CDN, filled on all 11. `large_image` and `alternate_image*` empty,
  same as Opulensi: one usable image per product.
- `aw_product_id` — the `p=` in the deep link. Key data on it, as with Opulensi.

**Two rows are deliberately not listed:**

1. `Shipping protection` (44269697234) — a cart add-on, not a fragrance. It is the only row with
   `in_stock=0`. A feed row is not automatically a product.
2. `Lost in Symphony No. 83` (44269697230) — its stated inspiration, "Symphony", is not in
   `REFERENCES`. Left out rather than paired against a guess.

**The storefront is bigger than the feed.** The live site carries 17 products; the feed carries 11.
Delira No. 17 (Delina), Vallure No. 27 (Valaya), Libera No. 47 (YSL Libre), Layvish No. 67
(Layton), Pacific Soul No. 57 (LV Pacific Chill), Phantom Leather No. 97 (Ombré Leather) and
Imagine Noise No. 87 (Imagination) are on the site but **absent from the feed, so they have no
`aw_product_id` and no deep link can be built for them.** Several pair to originals we already
carry. Worth re-downloading the feed periodically to see whether they appear — do not hand-build
a link for one in the meantime.

## `my-perfume-shop.csv` shape (35 columns)

- `aw_deep_link` — form `https://www.awin1.com/pclick.php?p=<pid>&a=3064149&m=106089`. **Dead.**
- `product_name` — brand is embedded here (`"Chanel Allure Homme Sport EDT"`), no separate brand column.
- `merchant_image_url` / `aw_image_url` — Shopify CDN URLs. `large_image` is empty.
- `search_price` + `currency` + `display_price` — merchant's selling price; `rrp_price` empty.
  Multiple rows per fragrance (size / concentration variants) at different prices, **with no
  dedicated size field** — so a row's price cannot be turned into a price-per-ml.
- No `in_stock`, no category, no RRP in this export.

## Caveats before wiring anything live

1. **My Perfume Shop is CLOSED FOR TRACKING — verified 2026-09-01.**
   Both link forms redirect to `https://awin1.com/closedMerchant.html?mid=106089&aid=3064149`:
   the feed's own `aw_deep_link` and a manually-built `cread.php` link with a `clickref`. The
   merchant's own product page returns 200, so the destination is fine — the Awin programme
   is not serving clicks. This is what the dashboard's **"link status offline"** means, and it
   is the field that decides whether we can earn. **Payment status showing green does not
   override it**: payment status only describes where money would be sent, not whether a click
   is tracked. Re-test with the check above; if the programme reopens the redirect will end on
   `myperfumeshop.com.au` instead of `closedMerchant.html`.
2. **This also constrains imagery.** The lawful basis for hosting bottle photographs is
   "supplied by an affiliate programme we are enrolled in, to promote that merchant" — which
   is weaker for a programme that no longer serves clicks. `scripts/fetch-dupe-images.mjs`
   enforces the rule going forward (image only where the listing has a working link); the 156
   reference images predate it and are a known open question, flagged in the project CLAUDE.md.
3. **Opulensi's prices are a discounter's prices**, not RRP — frame as "from £X", never "the
   original costs £X". They are also per-presentation: its only Armaf row is a £68.99 limited
   edition of a fragrance that street-prices near $40. Never feed a merchant price into the
   "Nx cheaper per ml" claim, and never quote a street price on a buy button.

   **Clone of Perfume is the documented exception, and only because of what it is.** It is the
   brand's own direct store — there is nowhere else to buy The CLONE — so its price *is* the
   street price and inventing a separate `priceUsd` would be less accurate, not more careful.
   Those nine listings therefore take `priceUsd` from the merchant (the live page's figure, not
   the feed's). The test is "is this the only seller of this product?", not "is this a nice feed":
   apply it per merchant and write down the answer, as `lib/dupes-data.ts` does for these.
4. **Never convert currency with a hardcoded rate.** An unsourced FX rate goes stale silently,
   and on a buy button it is stale one click away from the page that disproves it. Store and
   display the merchant's own currency.
5. Match feed rows to `lib/data/houses/*.ts` references by brand + name **and** concentration +
   bottle size — picking the wrong variant row picks the wrong price.
