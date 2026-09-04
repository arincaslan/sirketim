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
| `aromapassions.csv[.gz]` | Awin advertiser **AromaPassions** (Awin ID **34989**), publisher 3064149. Approved 2026-09-03 | **230 rows**, all `currency=USD`. 86 columns. A **dupe house selling direct**, like Clone of Perfume. **Tracking works** (verified 2026-09-04). Every product names its own inspiration in `product_name`. **14 listings shipped 2026-09-04**, all on originals that had no alternative. **The stalest feed here — its prices, its stock, its sizes AND its image URLs are all wrong; see below.** |
| `my-perfume-shop.csv[.gz]` | Awin advertiser **My Perfume Shop** (Awin ID **106089**), publisher 3064149, delivered via `sftp://datafeeds.shareasale.com/Awin/161226/feed.zip` | ~9,844 rows, all `currency=USD`. 35 columns. Genuine designer fragrances — **originals-side**, not a dupe house. **Programme is CLOSED for tracking — do not ship buy links from this feed.** |

## Which feed backs what

Counts measured 2026-09-04; recompute rather than trusting them.

| Output | Feed | Script |
|---|---|---|
| `lib/data/merchant-offers.generated.ts` | my-perfume-shop | `scripts/ingest-feed.mjs` |
| `lib/data/feed-images.generated.ts` (156 reference images) | my-perfume-shop | `scripts/fetch-feed-images.mjs` |
| `lib/data/dupe-images.generated.ts` (**53** dupe images: 30 opulensi + 9 clone-of-perfume + 14 aromapassions) | opulensi, clone-of-perfume **and** aromapassions | `scripts/fetch-dupe-images.mjs` |
| the **53** real entries in `lib/affiliate-links.ts` (30 opulensi + 9 clone-of-perfume + 14 aromapassions) | all three dupe feeds | hand-written from feed rows, each traced first |

`fetch-dupe-images.mjs` handles all three merchants from one `SOURCES` map — each entry names its
own `feed`, so a third merchant was a new `FEED` constant and a block of entries, exactly as the
script's header promised, with the loop untouched. **Do not fork the script per merchant**: the
orphan report at the bottom only works while one script owns `public/images/dupe/`.

**It now falls back to the merchant's live product page when a feed's image URL is dead**, added
2026-09-04 because *every* `merchant_image_url` in the AromaPassions export 404s (the shop
re-uploaded its photography, and Shopify CDN paths are content-addressed rather than stable). It
reports which images were rescued that way, so a feed rotting is visible rather than silent. The
licence is unchanged by this: it rests on the affiliate relationship, not on which of the enrolled
merchant's own URLs the bytes came from. **The general lesson is that `merchant_image_url` decays
like `search_price` and `in_stock` do** — it was simply the last of the three to be caught at it.

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

## `aromapassions.csv` shape (86 columns, 230 rows) — the stalest feed here, and it still shipped

Same 86-column Awin template. Investigated 2026-09-04 for a 15-listing batch covering originals
with no alternative at all (Allure Homme Sport, Angel, Another 13, Antaeus, Bitter Peach, Bright
Crystal, Cedrat Boise, Chance Eau Tendre, Costa Azzurra, Crystal Noir, Eros, Eros Flame, Flora
Gorgeous Gardenia, Flowerbomb, Green Irish Tweed). All 15 pairings are sound and every product is
live and in stock. **Fourteen shipped the same day**; the fifteenth was withheld for a reason that
is about the merchant's copy rather than the feed (see "the one that did not ship", below).

**An earlier pass over this feed refused to write the batch at all**, on the reading that these are
oil concentrates. That reading was wrong and is disproved below — but the refusal was still the
right call at the time, because publishing an invented format claim about a real company's product
would have been the same failure class as the fabricated Dossier/ALT. listings. Read the "essential
oil" section before touching this merchant again; it is the most misreadable thing in this file.

- `product_name` — **the strongest pairing field of any feed here.** Every fragrance row states its
  inspiration in the title itself (`SPARK | Inspired by CHANEL ALLURE HOMME SPORT | …`), so every
  pairing is cited rather than editorial. Better even than Clone of Perfume, which needed the
  description read.
- `description` — carries a full top/heart/base pyramid, a `Concentration | 20%` figure, a
  `Sizes ||` list, and on some rows an ingredient list. **Two of those four are stale** (below).
- `brand_name` — **empty on all 230 rows.** Unlike Opulensi (610/610 filled) and Clone of Perfume
  (`Clone` on all 11). `vendor` on the live Shopify product is `Inspired by <ORIGINAL>`, which is a
  pairing hint, not a brand. The brand is AromaPassions itself.
- `search_price` + `currency` — USD. Direct-from-brand, so the Clone of Perfume exception applies:
  this *is* the street price. **But see the price decay below — the feed's figure often is not.**
- `merchant_image_url` — Shopify CDN, filled on every row, and **every single one 404s.** Checked
  2026-09-04 across all 14 shipped products; the URLs carry `v=17099…` timestamps from early 2024
  and the shop has since re-uploaded its photography under new content-addressed paths
  (`v=17582…`). `large_image`/`alternate_image*` empty, same as the other two Shopify feeds.
  `fetch-dupe-images.mjs` now falls back to `<merchant_deep_link>.js` → `featured_image` and says
  which images it rescued that way. **This is the first feed to prove that an image URL goes stale
  exactly like a price does** — do not assume the other two feeds are immune, just untested.
- `merchant_product_id` — **the field that decodes bottle size**, which nothing else in this feed
  does reliably. SKUs run `<CODE>-<NNN>[-suffix]`: bare = 30 ml, `-X` = 50 ml, `-XC` = 100 ml.
  Confirmed against the live variant list on every two-variant product (`-X`=$39=50 ml,
  `-XC`=$69=100 ml). Use this, not the `Sizes ||` line in the description.

### The feed is a stale snapshot of a store that has since dropped a whole size

**The 30 ml variant no longer exists anywhere on the live store.** Seven of the fifteen products
ship three feed rows each at $29 / $45 / $79 (30/50/100 ml). Every one of those products now offers
**only 50 ml and 100 ml**, at **$39 / $69** — except Bright Crystal, which is **$29 / $59**. So for
those seven, *all three* feed prices are wrong and one row describes a product that cannot be
bought. The eight two-variant products' prices ($39/$69) match live exactly.

Two consequences:

- **Never take `search_price` from this feed.** Read it off `/products/<handle>.js`, whose
  `variants[]` gives title, price in cents and a real `available` flag. That endpoint is the
  cheapest truth source found for any merchant here — it needs no HTML parsing.
- **Eros Flame has no usable feed row at all.** Its only row is `VRF-093` @ $29, the delisted 30 ml.
  It is still linkable, because the pclick deep link is product-level (see `MERCHANT_NOTES` in
  `scripts/check-affiliate-links.mjs`), but nothing in the feed describes a product you can buy.

The description prose decays independently of the variant list: EROTIC's live description still
reads `Sizes || 30 ml | 50 ml | 100 ml` while its variant picker offers two. **The variant list is
the truth; the prose is marketing that nobody updated.**

**One correction to an earlier note in this file, which said Green Irish Tweed's
`merchant_deep_link` 404s.** It does not, in the export currently on disk: both its rows carry
`/products/revive-creed-green-irish-tweed-dupe-perfume-men`, which resolves. The handle **without**
the `-men` suffix 404s, so the earlier note had the two the wrong way round or read an older
export. Re-check a `merchant_deep_link` against the live store rather than trusting either version
of this paragraph — the general point (the tracked `aw_deep_link` is re-resolved by Awin and is the
more durable of the two) still stands and is worth keeping.

### The "essential oil" wording is about the materials, not the base

This is the one that stopped an earlier pass writing any listing at all, and it is worth stating
plainly because the misreading is very easy to make.

Every product title in this range contains **"Essential Oil Fragrance"**, and the body copy says the
formula is "Scented using … Essential Oils" and made with "genuine and natural essential oils". Read
quickly, that says *oil concentrate* — a format that would project far less than an alcohol spray
and would deserve honest, lower `sillage` facets plus a format disclosure.

**The merchant's own ingredient list says otherwise.** Five of the fifteen publish one, and all five
begin **`alcohol, aqua, …`** — verified on the live product pages 2026-09-04, not just in the feed
(Costa Azzurra, Bitter Peach, Another 13, Angel, Flowerbomb; the other ten say "Ingredient List
Coming Soon"). Nothing in any title, description or product page says *roll-on*, *rollerball*,
*oil-based* or *alcohol-free*, and every product is sold in conventional 50/100 ml bottles at a
stated `Concentration | 20%`, labelled *Extrait de Parfum*.

So these are **alcohol-based perfumes at a stated 20% concentration** — if anything a *higher*
stated concentration than the EDT/EDP originals they are paired against, not a weaker format.
"Essential oil" describes the aromatic materials, exactly as it does for most perfumery.

**Do not write these listings as oil concentrates, and do not mark sillage down on that basis.** It
would put an invented format claim about a real company's product into published copy, contradicted
by that company's own live ingredient list — the same failure class as the fabricated Dossier/ALT.
listings and the invented reviews, just arrived at by trusting merchant marketing instead of memory.

The honest disclosure, if one is wanted, is the *stated concentration* and its limits: AromaPassions
states 20% Extrait de Parfum; we have not verified it; and concentration is not material quality, so
a higher percentage does not make it a closer match. That is a claim we can source.

**This is the same trap as the pheromone marketing on these products, pointed the other way.** Both
are seller claims. One was correctly refused; the other was nearly adopted because it sounded like a
product fact rather than a marketing line. Neither belongs in a verdict unsupported. The listings
that shipped rate facets on notes and character alone, with no format field and no score adjustment
of any kind, and mention the 20% figure only where it is attributed to AromaPassions and paired with
"concentration is not similarity".

### What shipped, 2026-09-04 — 14 of 15, and the one that did not

Fourteen listings, one per product, each with **an offer per live size** (50ml and 100ml) and a
single product-level affiliate link shared by both. Every original covered had no alternative before
this, so the site's reach went 27 → 41 originals.

**ILLUMINATE (Versace Crystal Noir) was withheld.** AromaPassions declares Crystal Noir's own
pyramid back note for note across all three layers, publishes no ingredient list, and offers nothing
else of its own. `isVerbatimCopy()` needs notes **and** facets to match, so the only two ways to
publish it were to invent facet differences purely to clear the copy-detection threshold, or to ship
a listing `getRankedDupesFor()` correctly hides everywhere while its link and photograph sat in the
tree pointing at nothing. Both are worse than its absence.

**GLAMOROUS (Bright Crystal) is the same situation and it shipped**, because the merchant writes
"Ice" and "Lotus" where the catalogue records "Ice Accord" and "Lotus Flower" and the normalising
rule never adds a qualifier. Those two strings are the only thing keeping it clear of the copy
check. That is the copy gate working at slightly different points on two near-identical cases, not
an inconsistency to tidy — but know it before editing those notes.

### Three things about this merchant that generalise

1. **A feed can be stale in a field you have not thought to distrust yet.** This one was stale in
   prices, in stock, in the size list, in the description prose *and* in every image URL. The
   working assumption should be that **only the ids are durable** — `aw_product_id` and
   `merchant_product_id` — and everything else is read off the live store.
2. **A merchant can contradict itself between two documents on the same page, and it matters which
   one you score.** HEAVENLY's note pyramid is a fruity floral with no chocolate or caramel; its
   ingredient list on the same page contains patchouli, vanilla and ethyl maltol — the caramel
   material that is the backbone of Angel. FREEDOM's pyramid shares almost nothing with Another 13;
   its ingredient list is nearly pure amber and musk molecules, which is a much closer description
   of what Another 13 actually is. SENSUAL's list contains olibanum, Costa Azzurra's own base note,
   which its pyramid omits. **Score the pyramid, because that is what is comparable across the
   catalogue — and say in the verdict when the ingredient list disagrees.** It is the best evidence
   on the page that a low score is a limit of the data rather than a verdict on the bottle.
3. **A cheap original is where the dupe economics stop working, and the site has to say so.** This
   batch produced the first listing that is *more expensive per millilitre than the original it
   copies* (EROTIC, $0.78/ml against Versace Eros at $0.75/ml). Both call sites rendered
   `${multiple.toFixed(1)}x cheaper` unconditionally and would have printed "1.0x cheaper" — a false
   price claim, one click from the page that disproves it. Fixed with `describeValueMultiple()` in
   `lib/similarity.ts`, which returns "no cheaper" or "Nx more expensive" as warranted. Expect this
   again on any merchant paired against sub-$100 designer bottles.

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

   **AromaPassions is the second merchant to pass that test**, on identical ground: its own direct
   store, its own line, nowhere else to buy it — and emphatically *not* because its feed is good,
   since that feed is the worst here. Its 14 listings take `priceUsd` from the live page. The 50ml
   figure is the one recorded, because it is the more conservative of the two live sizes: the 100ml
   works out cheaper per ml, so quoting the 50ml understates the saving rather than overstating it.
4. **Never convert currency with a hardcoded rate.** An unsourced FX rate goes stale silently,
   and on a buy button it is stale one click away from the page that disproves it. Store and
   display the merchant's own currency.
5. Match feed rows to `lib/data/houses/*.ts` references by brand + name **and** concentration +
   bottle size — picking the wrong variant row picks the wrong price.
