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
| `my-perfume-shop.csv[.gz]` | Awin advertiser **My Perfume Shop** (Awin ID **106089**), publisher 3064149, delivered via `sftp://datafeeds.shareasale.com/Awin/161226/feed.zip` | ~9,844 rows, all `currency=USD`. 35 columns. Genuine designer fragrances — **originals-side**, not a dupe house. **Programme is CLOSED for tracking — do not ship buy links from this feed.** |

## Which feed backs what

| Output | Feed | Script |
|---|---|---|
| `lib/data/merchant-offers.generated.ts` | my-perfume-shop | `scripts/ingest-feed.mjs` |
| `lib/data/feed-images.generated.ts` (156 reference images) | my-perfume-shop | `scripts/fetch-feed-images.mjs` |
| `lib/data/dupe-images.generated.ts` (23 dupe images) | opulensi | `scripts/fetch-dupe-images.mjs` |
| the 3 real entries in `lib/affiliate-links.ts` | opulensi | hand-written from feed rows, each traced first |

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
2. **Our sub-ID survived.** Opulensi echoes it back as `utm_id=3064149_probe`. A link
   that drops the `clickref` still pays, but the commission is unattributable to a
   page forever — there is no way to reconstruct it after the fact.
3. **An `awc=` cookie is set**, of the form `awc=<merchantId>_<timestamp>_<hash>`.
   That cookie is the tracking. `-c -` prints the cookie jar to stdout.

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
3. **Prices are a discounter's prices**, not RRP — frame as "from £X", never "the original costs £X".
   They are also per-presentation: Opulensi's only Armaf row is a £68.99 limited edition of a
   fragrance that street-prices near $40. Never feed a merchant price into the "Nx cheaper per
   ml" claim, and never quote a street price on a buy button.
4. **Never convert currency with a hardcoded rate.** An unsourced FX rate goes stale silently,
   and on a buy button it is stale one click away from the page that disproves it. Store and
   display the merchant's own currency.
5. Match feed rows to `lib/data/houses/*.ts` references by brand + name **and** concentration +
   bottle size — picking the wrong variant row picks the wrong price.
