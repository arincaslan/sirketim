# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Scope: the COUNTERSCENT affiliate/marketplace site. Read the chain — root `CLAUDE.md` → `departments/web-development/CLAUDE.md` → this file. `README.md` here covers the stack, how to run it, and the honesty caveats; `DESIGN.md` covers visual direction. **This file covers the invariants that span several files and are easy to break without noticing.**

## The brand is Counterscent — renamed twice, and the second time cost money

**Drydown → P&#97;rfumoza → Counterscent**, all on 2026-08-27.

> The dead brand name is written as an HTML entity in this section (`P&#97;rfumoza`) so that a future bulk find-and-replace **cannot** silently rewrite this history the way one already did. It renders normally. Leave it escaped.

**Read this before proposing any name, for this project or any other.** The second rename was not a preference change. That domain had to be abandoned because of a collision nobody checked for:

| Brand | What it is | Since |
|---|---|---|
| **Parfumo**.com | Fragrance database — **227,701 perfumes, 14,421 brands**, 283K reviews | 2008 |
| ~~P&#97;rfumoza~~ | us, for about six hours | — |
| **Parfumado**.com | Perfume subscription, €3.2M raised, ships NL/BE/UK/SE/DK | 2017 |

The dead name contained "Parfumo" whole and was one letter from "Parfumado", in the identical vertical. Three consequences, of decreasing certainty: **SEO damage was certain** (our brand query would be permanently intercepted by a far larger same-niche brand); **affiliate rejection was likely** (a merchant reviewer sees a dupe site named one letter off the sector's biggest database and reads brand-piggybacking); **trademark exposure was plausible but never verified** — no registration was found, which is an open question rather than a clean bill of health.

**The vetting that was skipped, and must not be again.** The name was picked only because `drydown.com` was taken. Nothing was checked against existing fragrance brands. When that check was finally run on replacement candidates it **eliminated five of eight**, including two that were about to be recommended:

- `drydowns.com` — **The Drydown** is an operating San Diego niche fragrance boutique. The founder's *original* brand instinct would have hit the same trap.
- `echoscent.com` — `echoscentco.com` is a live fragrance brand pitched as *"smell expensive without overspending"*, i.e. our exact positioning.
- `scentkin.com` — **Maison Kin**, operating fragrance house, same "quality without the price tag" angle.
- `nearscent.com` — something already trades under the name.
- `sillageo.com` — ends in "-o" like Parfumo *and* Parfumado; repeats the pattern instead of escaping it.

So: **a free domain is not a clear name.** Search the candidate against operating fragrance businesses *and* trademark registers before buying, not after. Also note `scent`, `note`, `parfum` and `drydown` are all crowded prefixes in this sector — the collision risk is structural, not bad luck.

**Timing is why this was survivable.** It was caught with zero backlinks, nothing indexed, no affiliate application filed and no brand equity — the cheapest moment it could possibly have happened. Two weeks later it would have meant a live Awin application under a name we had to abandon.

### "drydown" is still a real word here

The first rename's trap survives both renames. **Do not run a blanket find-and-replace on "drydown".** It is the perfumery term for the base-note phase and appears legitimately in editorial copy and in code comments explaining why base notes are weighted highest (`lib/similarity.ts`, `app/about/page.tsx`, the guides, `submission-form.tsx`'s placeholder, `DESIGN.md`). Capitalised forms (`Drydown`, `DRYDOWN`) were the brand; bare lowercase `drydown` is the term.

Slug-style identifiers (`drydown-theme`, `drydown-atelier`) were brand too and were renamed explicitly.

### And the second rename had a trap of its own — which fired

The dead brand *was* a pure coinage with no generic meaning, so a case-aware replace across `.ts`/`.tsx`/`.mdx`/`.css`/`.json` was genuinely safe, and it worked: 28 files, 55 replacements, build clean.

**The markdown was not safe, and running the same blanket replace over `.md` corrupted this very section.** Several docs — this one above all — quote the dead name deliberately, as the record of *why* the brand changed. Rewriting those turned the history into nonsense: "Drydown → Counterscent → Counterscent", and a table row claiming the new name "contains Parfumo whole". The script's own docstring said docs must be done by hand; the script was then pointed at them anyway.

**The rule, stated so the next rename does not repeat it:** code is mechanical, prose is not. A find-and-replace over documentation destroys exactly the sentences that explain the change, because those are the only ones that *must* keep saying the old name. Rename code with a script; rename prose by reading it.

## Commands

```bash
npm install
npm run dev          # port 3000, or the next free one. NOTE: /go/ buy links 404 here — see below
npm run build        # runs prebuild (generate-redirects) then `next build` -> out/
npm run preview      # build + wrangler on :8788 — the only way to click a buy link locally
npm run lint
npm run check:links  # follows every affiliate link to the merchant; needs network
npx prisma validate  # needs DATABASE_URL set to anything well-formed, even offline
```

**`npm run build` produces a fully static site in `out/`, not a server bundle.** `next.config.mjs` sets `output: "export"` (see "Deployment" below). A `prebuild` step runs `scripts/generate-redirects.mjs` first, which writes `public/_redirects`; the export then copies it into `out/`. `public/_redirects` is generated and gitignored — never edit it by hand.

To verify a change the way the host will build it, run from the **repo root**, not here:

```bash
npm run build                      # repo root; delegates to this project
npx wrangler@4 deploy --dry-run    # should print "Read N files from the assets directory"
```

No test script exists. Don't invent one — verification here is done by running the app and asserting against real rendered output (see "Verifying a change" below).

**Never run `npm run build` while `npm run dev` is live on the same directory.** Both write `.next/`, and the collision corrupts the webpack manifest badly enough that the dev server 404s every route. Recovery: kill both, `rm -rf .next`, then run one at a time. This is documented in `README.md` and has bitten this project more than once.

## The scoring pipeline — the invariant most likely to be broken

Three modules, and the split between them is deliberate:

| Module | Role |
|---|---|
| `lib/similarity.ts` | `computeSimilarity()` — the **raw** formula. Published on `/about#methodology`. |
| `lib/verification.ts` | The anti-copy-cheat standard: verbatim-copy detection + the unverified score cap. |
| `lib/catalog.ts` | `getPublishedSimilarity()` — raw score passed through the cap. **This is what UI must render.** |

**Rules:**

- **Components must never call `computeSimilarity()` for anything a user sees.** Call `getPublishedSimilarity()`. The raw number is internal.
- **This rule is about dupe scores, and does NOT apply to `computeOriginalSimilarity()`** (added 2026-08-29 for the "Related originals" module, alongside a shared `ScentProfile` type and `getRelatedReferences()`/`getRelatedOriginals()`). That path compares two *reference originals* to pick related links — there is no `DupeCandidate`, no producer-submitted data, and therefore nothing to cap: the cap exists because producers self-report and could copy the answer key, which is impossible when both sides are our own curated catalog data. Don't "fix" `getRelatedOriginals()` to route through `getPublishedSimilarity()`; the types won't allow it and the reasoning doesn't transfer.
- **Ranking sorts published-score first, raw second, price-per-ml third.** The published key stops the list ever showing #1 at a lower percentage than #2 — reachable whenever two listings share a raw score but only one may pass the cap. The raw key keeps ordering meaningful among listings that display the same capped number. Dropping either key breaks one of those two properties; both are load-bearing.
- **A house product can never publish above the cap**, whatever its `verificationStatus` says. `getPublishedScore()` takes the whole `DupeCandidate` (not a bare status) specifically so no call site can bypass this, and derives house-ness from `isHouseProducer()` in `lib/producers.ts` — the single definition `lib/catalog.ts` also uses for the buyer-facing disclosure, so scoring and disclosure cannot disagree. **The reason is structural, not cosmetic:** we are the only party who grants `verified`, and we sell a fragrance line here, so lifting our own cap is self-certification wearing the badge of editorial review. Its badge reads "Our own product — self-declared". Added 2026-08-27 after a board review; verified with probe listings identical but for producer (90% house / 92% third party).
- **`getRankedDupesFor()` also filters out verbatim copies entirely.** That exclusion is a publish gate, not a ranking penalty — a flagged listing must not render anywhere.

**Why any of this exists:** the raw formula is `notes*0.5 + facets*0.35 + familyBonus*0.15`, `familyBonus` is hardcoded to `1`, and the other two terms return `1` on identical inputs. A producer who copies the reference's note pyramid and facet scores scores **exactly 100%** — verified, not theoretical. No formula over self-reported data can tell a real match from a copied answer key, so the defence is structural. Full reasoning: `PRODUCER-PROGRAM.md` §7, and the module doc in `lib/verification.ts`.

`familyBonus` being hardcoded to `1` is a known latent bug, deliberately left alone so far: fixing it changes every existing score. Fix it as its own considered change, not as a drive-by.

## Data flow, and the migration path it's shaped for

```
lib/data/houses/*.ts   (one file per fragrance house — the reference catalog)
  → lib/data/references.ts   (concatenates + guards against duplicate slugs at module load)
    → lib/dupes-data.ts      (re-exports REFERENCES; owns DUPES, the producer listings)
      → lib/catalog.ts       (all querying: search, brand grouping, ranking, filtering)
        → components/
```

`lib/catalog.ts` is deliberately shaped like a query layer over static arrays so the eventual swap to real database reads is a change of *implementation*, not of call sites. Add new query helpers there rather than filtering `DUPES`/`REFERENCES` inline in a component.

`prisma/schema.prisma` mirrors the TypeScript types on purpose (`Producer`, `Submission` ≈ `DupeCandidate`, `VerificationStatus`). **It is not migrated and no database exists** — fixtures remain the live data source. Keep the two shapes in step when either changes, or the eventual migration stops being mechanical.

Adding fragrances: append to the relevant `lib/data/houses/<house>.ts`. Adding a house: new file + one line in `references.ts`. Note the reference catalog is curated editorial data — producers must never be able to create originals (that's what stops forty spellings of "Baccarat Rouge").

**The catalog is now indexable — `/fragrance/[slug]` exists (2026-08-27), and `/fragrance` is a real index page as of 2026-08-29.** Each reference statically generates one page via `generateStaticParams()` over `REFERENCES`, with canonical + OG metadata and BreadcrumbList JSON-LD. Sitemap: ~11 URLs → 78 → 132 → **221** (measured live 2026-09-02, after the catalog reached 200 references). Re-measure rather than trusting this: `curl -s https://counterscent.com/sitemap.xml | grep -c "<loc>"`. **Exactly two routes use `generateStaticParams`: `/fragrance/[slug]` and `/guide/[slug]`** — this file previously said four, listing `/comparison/[slug]` and `/review/[slug]`, which were deleted in the static-export migration and are documented as deleted further down this same file.

What is still missing is the **pairwise** comparison URL. `/dupe-finder` reads `?ref=<slug>` to seed the initial reference, but picking a dupe is pure React state inside `dupe-finder.tsx` — no router push, no URL sync — so there is still no `/compare/[a]-vs-[b]`. That route is blocked on listings existing at all (see below), not on routing work.

**All data is hand-typed TypeScript literals — there is no import path anywhere.** No feed, no CSV, no fetch. That is why "add every fragrance on the market" is not a bigger version of the same task: it needs an ingest source, which is expected to be an affiliate product feed (which also supplies the legally usable imagery discussed below). Prices are hand-maintained constants that feed a user-facing "Nx cheaper" claim, so they go stale silently.

## Things that are deliberately inert — keep them honestly so

This project has several features that are fully built but non-functional, because the service behind them doesn't exist. **They announce that plainly rather than faking success, and that is a requirement, not a placeholder to tidy up:**

- **`app/api/` no longer exists.** The Stripe checkout/webhook routes were **deleted on 2026-08-27**, not left inert: Sirketim is Turkey-based and **Stripe does not serve Turkey** (verified 2026-08-26 against `stripe.com/global`), which `departments/accounting/CLAUDE.md` had already documented two days before that integration was written. Replacement rail is **Paddle**; `prisma/schema.prisma` stays provider-agnostic (`PaymentProvider`, `providerCustomerId`, …) so the next attempt isn't provider-shaped. **There are now zero route handlers anywhere in the project** — `/go/[slug]/route.ts` was deleted too, in the static-export migration later the same day. Verify with `find app -name route.ts` before assuming otherwise; this line has already been wrong once.
- `components/reviews/add-review-form.tsx` and `components/producers/submission-form.tsx` tell the user nothing was saved. Don't "fix" these into fake success states.

Unfilled env vars are listed in `.env.example`. Filling them requires the founder's own accounts (Supabase/Neon, a payment provider) — real business, bank, and tax identity that can't be scripted.

## Three arrays were emptied — two are refilled now, and the standard they had to meet still stands

**Current state, 2026-09-02:** `DUPES` holds **25 listings** across **18 references**, `affiliateLinks` holds **23 real Awin entries**, `REVIEWS` is still `[]`. All three were emptied on 2026-08-27 and the reasoning below is the bar every refill had to clear, not a superseded note — **read it before adding a sixteenth.**

| | Then | Now |
|---|---|---|
| `DUPES` | `[]` | **25 listings**, every name read off a live merchant feed, each carrying `offers` with the exact feed rows |
| `affiliateLinks` | `{}` | **23 entries**, all Opulensi (Awin 123248), each traced AND stock-checked before being added |
| `REVIEWS` | `[]` | still `[]` — nothing has changed here, and inventing reviews is the worst of the three failures |

So `/go/<id>` resolves for exactly twenty-three ids and 404s for everything else. **Twenty-two listings render a buy button**, not twenty-three: the Armaf link tracks fine but its product is out of stock at the merchant, so that row shows the price and "Out of stock" instead. Enrolled, tracking, and in stock are three separate questions and all three have failed here.

**The pairing is cited, not asserted, wherever possible.** `DupeCandidate.pairingBasis` holds who claims a dupe matches its original, in their words, with a link. This came from a discovery in the Opulensi feed: **70 of its 610 rows name the Western release themselves**, in the product URL (`...inspired-by-baccarat-rouge-540`) or the description (`Inspired by "Good Girl"`). That is stronger evidence than our recall and it shows the reader who is claiming what. Scan a new feed for `inspired by` before authoring pairings from memory.

**Two kinds of pairing now exist and the UI distinguishes them.** 5 listings carry `pairingBasis` (the retailer said it); 20 do not, and those render **"Our own judgement. No retailer describes X as an alternative to Y"** rather than a blank. The blank was the bug worth avoiding — without it our assertion silently borrows the credibility of the cited listing next to it.

**Editorially-paired scores carry a selection bias that cited ones do not.** Those pairings were proposed from reputation and then *checked* against the retailer's published note pyramid, so they are mildly selected for note overlap — and the score is computed from note overlap. Qaed Al Fursan (editorial, 80%) outranking Club de Nuit Intense Man (79%) on Aventus is that bias showing. Cited pairings have no such filter, which is why they range 44–82%. **Never pair on note overlap alone**: selecting on the metric and then publishing the metric is circular, and it would turn every score into a tautology.

**A LOW SCORE IS A RESULT, NOT A REASON TO OMIT A LISTING.** This was got wrong once and corrected by the founder, so it is written down. Two candidates (Jean Lowe Matiere vs Oud Wood, Maahir Black Edition vs Layton) were proposed, checked against the retailer's note pyramid, found to diverge, and dropped as "not the same fragrance". That is not the test. The site exists to show *where a candidate matches and where it does not* — Bint Hooran at 44% was already proof — so both were added and score 45% and 52%, with note diffs that say exactly what is shared and what is not.

The test a pairing must pass is **"is this a comparison a buyer would actually make?"**, not "does it score well". Both pass: Maison Alhambra's Jean Lowe line is its Tom Ford line, and Lattafa's Maahir line is routinely shelved against Parfums de Marly. Anfar's and Adyan's own compositions still fail it — nobody compares those to a designer bottle — which is why they remain absent and should stay absent.

(One factual correction that came out of it: the rejection note had called Maahir Black and Layton "not remotely the same". They share bergamot, vanilla, sandalwood, guaiac wood and pepper — most of Layton's base. They diverge at the top, not throughout.)

**COVERAGE IS CAPPED BY WHAT THE DUPE INDUSTRY MAKES, NOT BY OUR MERCHANT.** The obvious goal — every original having at least one alternative — is not reachable and it is worth understanding why before anyone plans around it. Dupe houses clone **bestsellers**. There is no Lattafa version of Chanel Sycomore, Le Labo The Noir 29, Chanel Antaeus or most of the other niche and discontinued entries in a 200-strong catalog, and there never will be. A rough half of `REFERENCES` is simply outside the category's target list.

So the ceiling is not "200 with more merchants". It is closer to **50–70 references**, and reaching even that needs several more dupe-side merchants. Judge progress by *originals covered* (18) rather than by listing count (25) — five listings on Aventus is depth, not reach, and the reach number is the one that matters for search traffic.

**How far this feed goes, measured 2026-09-02 — do not re-derive this.** 610 rows → 533 matched to the storefront → **245 actually in stock** (the feed marks all 610 `in_stock=1`) → 218 with a parseable note pyramid → **only 21 name a fragrance that is in REFERENCES**, and several of those are false positives. Chasing "impression" (225 rows) and "TF" (67) yielded nothing: the first is ordinary English, the second a substring bug. The in-stock pool is dominated by Anfar, Adyan, Sapil and Al-Rehab, whose ranges are original Arabian compositions rather than designer clones. **This merchant supports roughly 25 listings covering 18 originals, and not much more.** Growing past that needs another dupe-side merchant, not more work on this feed.

It also lets the site disagree in public. **Bint Hooran is the worked example**: Opulensi calls it a Good Girl alternative *and says the notes are similar*, then publishes a pyramid for it built on coriander, cypress, citrus and vetiver — against Good Girl's almond, coffee, tuberose and cacao. One shared base note, 44% match. The listing ships with the retailer's claim quoted, the diff showing otherwise, and a verdict saying so. Do not "fix" that listing by softening the verdict or dropping it; disagreeing with a merchant on their own published data, with the evidence on screen, is the independence posture actually working.

Listings carry `offers: MerchantOffer[]` — one entry per retailer, each with that retailer's own price, in that retailer's own currency, **never converted**. This replaced a singular `merchantListing` plus a listing-level `affiliateLinkId` on 2026-09-01. The old single-retailer shape forced the UI to explain in prose why the one price it showed disagreed with the per-ml figure beside it; several retailers side by side says it without a paragraph. Offers are **deliberately not sorted** — ranking £19.99 against $34.00 is an FX claim, and there is no sourced rate to make it with.

Why they were emptied: the listings named products (`Dossier Ambrosia`, ALT.'s `Bright` and `Blue Cedar`) that **do not exist**, attributed to real operating companies — verified against those companies' own storefronts. `lib/reviews.ts` held six invented reviews with human names, star ratings and dates about the same real companies, including a negative one, rendered with an aggregate average and no on-screen fixture label. That is FTC Fake Reviews Rule and trade-libel territory, not a tidiness problem.

**Do not hand-write entries back into any of the three.** If a product name cannot be verified on the producer's own storefront right now, it does not go in. Real listings arrive with an affiliate product feed (`FINALIZATION-GUIDE.md` phase 3 → 4), which is also the lawful imagery source discussed below. That is how all twenty-five that exist arrived, and it is the only route in.

**A link entry has a second gate the listings do not: it must be traced before it is added.** There is a script for it now — run it before shipping any link change, and periodically after:

```bash
node scripts/check-affiliate-links.mjs
```

It follows every entry in `lib/affiliate-links.ts` the whole way and checks four failures that all look identical in the codebase, three of which `tsc`, `lint` and a local render cannot see:

| Failure | How it shows | Hit here? |
|---|---|---|
| Programme closed | lands on `awin1.com/closedMerchant.html` | My Perfume Shop — **yes, and it is why it has no links** |
| Sub-ID dropped | click still pays, but nothing records which page earned it | script asserts the sub-ID survives into the final URL |
| Out of stock | button leads to a "Sold out" page and earns nothing | Armaf limited edition — **yes: feed said `in_stock=1`, live page said `OutOfStock`** |
| Delisted | 404, or a redirect to a category page | non-200 is a hard failure |

**Feed stock is a snapshot and goes stale — the merchant's own page is the truth.** That generalises: a feed describes what was true at export, and every field in it decays at a different rate. Prices and stock decay fastest.

Out-of-stock is recorded as `inStock: false` on that offer rather than by deleting the link — the link still tracks and works the moment stock returns, so removing it would only have to be redone.

The site now has **200 references and 25 listings across 18 references** (Aventus carries five competing listings, Angels' Share three, Baccarat Rouge 540 two — which is what the ranking tie-breakers exist for), so 182 references still render the "alternatives" empty state — that is the normal case, not a bug. The house-product plumbing (`components/dupe-finder/house-badge.tsx`, the scoring constraint in `lib/verification.ts`) is intact and still has nothing to render: there are deliberately no house products.

The previously-documented problem of *our own product ranking #1 on Baccarat Rouge 540* is now **half solved, and it matters which half.** Fixed 2026-08-27: a house product can no longer publish an uncapped score, so it cannot show a number that only independent verification earns, and the ranking can no longer invert against the displayed percentages. **Not fixed, and not fixable in code:** a house product whose declared notes are written to sit close to the reference will still legitimately out-rank honest third-party listings, because the formula only sees the data it is given. That is a data-authorship problem. Whoever repopulates `DUPES` owns it — write house listings as honest formulation compromises, the way the same three products were written before, when our bottles ranked *last* on Aventus and Sauvage. The COO's launch recommendation stands: **ship with no house products at all until Awin approves**, because a merchant reviewer seeing us rank first on our own comparison is the rejection.

## Content: `comparison` and `review` just became writable, but their routes are still deleted

`content/schema.ts` defines three types, and the difference between them is a hard gate, not a formality:

| Type | Requires | Writable today? |
|---|---|---|
| `guide` | `featuredProducts` **optional** | ✅ |
| `comparison` | `products` — min 2 `productRef`, each with a **mandatory** `affiliateLinkId` | ⚠️ schema satisfiable, route missing |
| `review` | `product` — one `productRef`, **mandatory** `affiliateLinkId` | ⚠️ schema satisfiable, route missing |

The gate was never about the schema being strict for its own sake: with `affiliateLinks` empty, a comparison or review had to **invent a product to point at** — the exact failure Phase 0 spent a day undoing.

**What changed, 2026-09-01, and grew on 09-02:** `affiliateLinks` now holds **23** real, *tracking* dupe links (all Opulensi, Awin 123248), so a comparison or review anchored on any of 25 listings across 18 originals can name a real product with a real link. **Two things still stand between that and a published piece, and both fail loudly rather than quietly:**

1. **`app/comparison/[slug]` and `app/review/[slug]` are deleted** (static-export migration). `content/loader.ts` refuses to build if a piece's content type has no route, so writing one without restoring the route breaks the build — by design, because the alternative was shipping a card pointing at a 404. Restore from git history first; the error message carries the `git log` command.
2. Flip `disclosure` to `true` on any piece that carries a real link. It defaults to `true` and is currently `false` on every published guide *because* there were no links — that inverts the moment a piece has one.

**The earlier merchant is still no help, and understanding why is the useful part.** My Perfume Shop (Awin 106089, CJ still pending) is approved and **still unblocks nothing**, for two independent reasons, both verified rather than assumed:

1. It is a **genuine-designer retailer** (originals-side, like Escentual), not a dupe house, so it could only ever back "buy the original" links, never the `DUPES` listings or a dupe `comparison`/`review`.
2. **Its programme is closed for tracking.** Verified 2026-09-01: the feed's own `aw_deep_link` *and* a hand-built `cread.php` link both redirect to `awin1.com/closedMerchant.html?mid=106089&aid=3064149`, while the merchant's own product page returns 200. The dashboard's "link status offline" is the field that decides this; **payment status green does not override it** — that only says where money would be sent.

What that enrolment did buy is real, and it is why the site has any imagery at all: a 9,844-row product feed yielding **156 licensed bottle photographs** and a reusable ingest path (`scripts/ingest-feed.mjs` → `scripts/fetch-feed-images.mjs`) that the Opulensi feed then reused.

Guides remain the workhorse regardless: pieces about the **200 real, researched originals** need no affiliate link, internally link to `/fragrance/[slug]`, and are what makes those pages rank. **Twelve are published** (`content/guide/`, 11,996 words as of 2026-08-27), which meets the 10-12 target in `FINALIZATION-GUIDE.md` 2.7.

**The last three changed shape deliberately, and new pieces should follow that pattern rather than the first nine.** Nine general explainers ("what is an EDP", "how to read a note pyramid") teach a reader something but convert nobody. The COO's recommendation was **original-anchored** pieces — "*&lt;original&gt;* alternatives" — writable as `guide` today, needing no `affiliateLinkId`, and landing directly on the `/fragrance/[slug]` pages that already exist. Three now exist for the highest-demand queries in the category: Baccarat Rouge 540, Aventus, Sauvage.

**How to write one honestly while `DUPES` is empty**, since the obvious approach is to name dupe products and we have none verified: anchor on the *original*, which we do have real researched data for. Analyse its actual note structure from `lib/data/houses/`, explain why it is easy or hard to copy (BR540 is six notes over freely-available amberwood; Aventus is twelve whose character is an interaction, and whose own batches vary — so a precise match percentage claims more precision than the target supports), say what to check before buying, then link to genuinely adjacent **originals** in the catalog. Each piece states plainly that we list no alternative products yet and why. That analysis stays true whichever bottle the reader buys, and it does not have to be rewritten when real listings land.

Two rules when adding a piece:

- **`disclosure` defaults to `true` and that is wrong for every current piece.** The block renders "This piece contains affiliate links" — false where there are none. Set `disclosure: false` until real links land, then flip it per-piece.
- **Verify every internal link resolves before committing.** `/library` is the *content* library (`getAllContent()`, the 12 guides) and is **not** the catalog index — this file claimed it was, which was false. **The catalog index is `/fragrance`, built 2026-08-29** (`app/fragrance/page.tsx`, grouped by house via `getReferencesByBrand()`), which also fixed a guide link to `/fragrance` that had been 404ing. Before that day the catalog was fully orphaned: nothing on the site linked to a `/fragrance/` page except the guides, leaving 37 of 68 reachable only via `sitemap.xml`. Fixed by the index plus the per-page "Related originals" and "Related reading" modules. A 404 inside published content is exactly what an affiliate reviewer looks for; so is a catalog nothing links to.

The filename must match the frontmatter `slug`, and bad frontmatter fails the build loudly by design (`content/loader.ts`).

**`content/loader.ts` also refuses to build if a piece's content type has no route** (added 2026-08-27). Every piece renders a card linking to `/<contentType>/<slug>`, and `app/comparison/[slug]` and `app/review/[slug]` were deleted in the static-export migration — so writing one comparison would previously have shipped a card pointing at a 404, which is the first thing an affiliate reviewer clicks. The guard checks the filesystem rather than a hand-maintained list, because keeping a list in step is exactly the step that gets missed. Restore the route (it's in git history) before adding the piece; the error message carries the `git log` command.

Relatedly, `components/library/library-tabs.tsx` **derives its tabs from what is actually published** rather than from the three schema types. It used to render permanent "Comparisons (0)" and "Reviews (0)" tabs, advertising an empty catalog to every visitor. With one type published it drops the tab strip entirely; the tabs return on their own when a second type lands.

## Product imagery — the block lifted for some of the catalog, and the licence rides on the link

Perfume bottles are protected trade dress. There are exactly two lawful sources: imagery supplied by an affiliate programme we've enrolled in, or photography of bottles we own. Generating bottle renders is ruled out by `departments/web-development/CLAUDE.md`'s trademark caution; reusing a retailer's photo is infringement. **That has not changed** — what changed is that we now have feeds.

| | Images | Source |
|---|---|---|
| `REFERENCES` (200) | **156** | My Perfume Shop feed → `scripts/fetch-feed-images.mjs` → `lib/data/feed-images.generated.ts` |
| `DUPES` (25) | **23** | Opulensi feed → `scripts/fetch-dupe-images.mjs` → `lib/data/dupe-images.generated.ts` |

Both are merged in as `imageUrl` at module load (`lib/data/references.ts`, `lib/dupes-data.ts`) — **`imageUrl` is never hand-set on a data entry**, because a hand-set path leaves nothing in the diff to say where the picture came from.

**The rule the dupe script enforces, and the one to apply to any new merchant: the licence rides on the affiliate relationship, not on the picture.** An image is only taken for a product whose merchant programme actually *tracks*, and whose listing carries a real `affiliateLinkId` to that merchant. That is why Club de Nuit Sillage and Urban Man have no photograph — they exist only in the closed My Perfume Shop feed, so there is no live relationship to justify hosting their imagery. `scripts/fetch-dupe-images.mjs` reports (never deletes) any file in `public/images/dupe/` it does not claim, so an orphan is visible rather than silently retained.

**Known open question, flagged rather than fixed:** the 156 reference images all came from the My Perfume Shop feed, which was live and approved when they were pulled and has since gone closed for tracking. By the rule above they are on weaker footing than the three dupe images. They are not removed because the enrolment was genuine at the time and we may yet get an answer from Awin about why 106089 closed — but if that programme stays dead, re-source them from a tracking merchant rather than leaving it.

`components/fragrance/fragrance-image.tsx` renders the generated per-fragrance colour mark (`lib/fragrance-visual.ts`) wherever `imageUrl` is absent. Every surface routes through that component — don't bypass it, and pass `imageUrl` through when adding a new call site or that surface silently shows placeholders next to real photos.

**Images are not gitignored but were also never committed.** `public/images/` is **179 files, 20.6MB**, all untracked as of 2026-09-02; until it is committed, a deploy builds from a tree with no images and every `imageUrl` 404s in production while dev looks perfect. The two `lib/data/*-images.generated.ts` manifests are untracked too, so the failure is actually a build error rather than a silent 404 — which is the better of the two, but neither is shippable.

## `/go/[slug]` — the affiliate chokepoint, and **it does not work under `npm run dev`**

**Every buy button 404s on the dev server. This is expected and is not a bug in the link.**

`public/_redirects` is a *Cloudflare* file. `next dev` does not read it, and neither does `next start` or `npx serve`. So clicking a buy button at `localhost:3000` gives a 404 page, while the identical link works in production. It cost a real founder click to discover, after the links themselves had been verified with `curl` against Awin — which proved the destination was fine and said nothing about whether the site could reach it.

**To click a buy button and have it work, serve the build the way Cloudflare does:**

```bash
npm run build                    # from the REPO ROOT, not here
npx wrangler@4 dev --port 8788 --local
```

Look for `✨ Parsed N valid redirect rules.` in wrangler's output — that line is the proof `_redirects` was picked up. Then `http://localhost:8788/dupe-finder/?ref=aventus` behaves exactly as production, buy buttons included.

Two gotchas when doing this:

- **`wrangler dev` holds a lock on `out/`.** A rebuild while it is running fails with `EBUSY: resource busy or locked, rmdir .../out`. Stop wrangler first — and check for orphaned `workerd.exe` processes, which survive a killed wrangler and keep the lock.
- The usual rule still applies in reverse: never `npm run build` while `npm run dev` is live on this directory.

Use `npm run dev` for UI iteration; use the wrangler preview before believing anything about redirects, headers, or 404 behaviour.

### How it works

**`app/go/[slug]/route.ts` no longer exists.** A route handler cannot return a 302 in a static export, so as of 2026-08-27 the chokepoint is `scripts/generate-redirects.mjs`, which reads `lib/affiliate-links.ts` at build time and writes `public/_redirects`. Cloudflare serves those as real edge redirects, so `/go/<slug>` behaves identically to a visitor.

The generator **fails the build loudly** if it cannot parse the map, rather than emitting an empty redirect table — that would 404 every affiliate link in production while the site looked fine. It already caught one real regression: the first version's regex only matched a multi-line literal and broke on the empty `= {};` form.

Three things to know before changing anything here:

- **`affiliateLinks` holds 23 real entries as of 2026-09-02**, all keyed `dupe-<brand>-<product>`, so exactly those 23 `/go/<slug>` paths resolve and every other `/go/<anything>` 404s. Both halves are correct. Confirm the count from the file, not from here — this line has been stale twice: `grep -c 'deepLink:' lib/affiliate-links.ts`. Buy buttons refuse to render unless `hasRealAffiliateLink()` resolves, so no visitor can reach a placeholder. The generator **fails the build** if an entry lacks a `deepLink` or `subId`, or names a network with no sub-ID parameter — an untagged click is unattributable forever, so it must never ship quietly.
- **Sub-ID attribution still works** (`FINALIZATION-GUIDE.md` §3.5). The scheme is deterministic, so it bakes into the destination URL at build time instead of being composed per request. What is genuinely lost is *our own* server-side click logging — there is no server. The fix, when it matters, is a `main` Worker script in the root `wrangler.jsonc` handling `/go/*`. **Gotcha for that day: `_redirects` rules are NOT applied to requests served by Worker code**, so move the mapping into the script rather than leaving both and guessing which wins.
- **Unresolved compliance question, unchanged:** Amazon's Associates agreement bars obscuring the source site "including by use of Redirecting Links" — exactly this pattern. Probably fine where attribution is preserved, but unverified, and the penalty is account termination. See `departments/communication/reports/amazon-associates-application.md` §2 before shipping an Amazon link.

## The independence posture is load-bearing

The site brands itself "Independent Fragrance Comparisons" while selling its own fragrance line inside the comparisons and (eventually) charging producers to list. Several things exist specifically to keep that claim true:

- House products are ranked by the same formula as everyone else and are **not** floated to the top; ties break toward the cheaper bottle, not toward us. `components/dupe-finder/house-badge.tsx` discloses which listings are ours.
- No subscription tier may affect rank or score. See `PRODUCER-PROGRAM.md` §3/§7.
- **Claims on `/about` must match what the code actually does.** This has already gone wrong once: the page claimed facet ratings were our own judgment "made while wearing each fragrance side by side," which stopped being true the moment producers could submit their own. If you change how scoring or data provenance works, update `app/about/page.tsx` in the same change.

## Verifying a change

`tsc --noEmit` and `lint` passing is not sufficient for anything touching scoring or rendering. Assert against the real running app:

```bash
curl -s "http://localhost:<port>/dupe-finder?ref=<slug>" -o out.html
grep -oE ".{30}note and facet match" out.html    # the displayed (capped) score
```

Also confirm the submission and review forms still say plainly that nothing was saved.

**For anything touching routing, config, or the build, `npm run dev` is no longer sufficient** — the dev server does not enforce the static-export rules, so a change can work perfectly in dev and fail the deploy. Build the export and serve it as the host will:

```bash
npm run build                        # from the repo root
npx serve -l 4321 products/affiliate-sites/fragrance-dupes/out
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:4321/fragrance/baccarat-rouge-540/
```

Note the **trailing slash** — `trailingSlash: true` means `/about` and `/about/` are different paths to a static host. Testing without it is how you get a false 404.

Two known-good expectations for that smoke test: `/go/<an-unmapped-slug>` returns **404** while a mapped one redirects to `awin1.com` (note `npx serve` cannot show you the second half — only the wrangler preview reads `_redirects`), and a fragrance page's canonical reads `https://counterscent.com/...`, never a placeholder or `localhost`.

## The producer surface, and the gate that isn't open

Four routes: `/producers` and `/producers/pricing` (public), `/producers/login`, and `/producers/submit` (**gated**). `lib/plans.ts` holds the tiers — its prices are **labelled placeholders** pending a founder decision — plus `NEVER_INCLUDED`, which encodes that no tier may buy rank, score, placement, or review removal. That constraint is the independence posture above, expressed in code; don't weaken it for a pricing experiment.

`lib/producer-session.ts` gates access. Two things to know before planning around it:

- **`isPreviewMode()` requires `NODE_ENV === "development"` *in addition to* `PRODUCER_PREVIEW=1`.** That is deliberate: the bundler inlines `NODE_ENV` at build time, so the preview bypass **cannot** be switched on in a production build. An env-var-only flag would be a real auth-bypass hole the day this deploys. Don't "simplify" it to one check.
- **The consequence is that `/producers/submit` is currently unreachable in production for everyone**, since no real auth exists yet. It is deliberately closed, not broken — but every free-tier discussion is downstream of ungating it (`FINALIZATION-GUIDE.md` phase 5.1).

`past_due` counts as an active subscription on purpose, so dunning on a temporarily declined card doesn't instantly delist a paying producer.

## Planning docs

**Start with `FINALIZATION-GUIDE.md`** (2026-08-26) — the current ordered roadmap: 6 phases with department owners, costs, dependencies, and what is deliberately *not* worth doing yet. It supersedes the sequencing in the older docs and is also published as a dashboard-linked Artifact.

`MARKETPLACE-PLAN.md` (the two-sided marketplace model, data model, open business questions) and `PRODUCER-PROGRAM.md` (subscription tiers, submission flow, approval criteria, the integrity standard) remain the reference for *why* things are shaped as they are. Both are `Status: planning only` where they describe unbuilt things — check which parts have since been implemented rather than assuming either extreme.

## Deployment — the site is a static export, and staying that way is a constraint

**This is a fully static site as of 2026-08-27.** `output: "export"`, deployed to **Cloudflare Workers** (not Pages — Cloudflare creates Workers projects now) via a root-level `wrangler.jsonc` that serves `out/` through `assets`. The whole deploy config lives at the **repo root**, not here; see `departments/web-development/CLAUDE.md` for the settings and the failure signature to recognise.

It was already statically renderable before the switch — no `cookies()`, `headers()`, `force-dynamic`, `revalidate`, or `runtime` exports anywhere, and `lib/producer-session.ts` returns `null` at build time and stays null. Three things had to move anyway:

| Was | Now | Why |
|---|---|---|
| `app/go/[slug]/route.ts` | `scripts/generate-redirects.mjs` → `_redirects` | A route handler cannot return a 302 in an export |
| `/dupe-finder` read `searchParams.ref` server-side | `useSearchParams` in `components/dupe-finder/dupe-finder-query.tsx` | Reading `searchParams` forces dynamic rendering |
| `app/review/[slug]`, `app/comparison/[slug]` | **deleted** | Both generated **zero** pages, and export rejects a dynamic route with no paths |

**Treat "no dynamic server surface" as an invariant now, not an observation.** Adding `cookies()`, `headers()`, a route handler, or a server-read `searchParams` anywhere will break the build — not at review time, at deploy time. If a feature genuinely needs a server, the right move is a `main` Worker script in the root `wrangler.jsonc` that handles that one path and falls through to assets, **not** turning the export off.

**The review and comparison routes are recoverable from git history** (`git log --oneline -- "app/review/[slug]/page.tsx"`). Restore them the moment `content/review/` or `content/comparison/` has a real piece in it — but see the content constraint: neither type can be written honestly until `affiliateLinks` holds real entries, because `content/schema.ts` requires a `productRef` with a mandatory `affiliateLinkId` on both. **That constraint is now satisfiable** — 23 Opulensi links exist — so restoring these two routes is the actual next step for content, not a someday item. (My Perfume Shop is not what unblocked it: it's an originals retailer *and* its programme is closed. Opulensi did.)

**Next.js 14.2.35 is pinned and still constrains options.** `@opennextjs/cloudflare` ended Next 14 support in Q1 2026 and `vinext` targets Next 16, so running this as a *Node app* on Cloudflare would mean upgrading Next first. The static export sidesteps that entirely — which is the point.

## Canonical URLs and the contact address go through `lib/site.ts`

`lib/site.ts` is the single source for the site origin (`siteUrl()`, `absoluteUrl()`) and the public contact address (`CONTACT_EMAIL = contact@counterscent.com`, a real monitored inbox since 2026-08-27). Both are **constants with real defaults, not env vars**, deliberately: a forgotten deployment setting would otherwise ship canonicals pointing at a placeholder host, which is invisible in review and expensive in search results. `NEXT_PUBLIC_SITE_URL` still overrides for previews.

**A previously documented defect here is fixed** — three content routes used to carry their own `process.env.NEXT_PUBLIC_SITE_URL ?? "https://example-placeholder.com"` fallback instead of calling `siteUrl()`, and two of them also emitted **no canonical at all**. `grep -r example-placeholder` now returns nothing. The lesson survives the fix: **never hand-roll the origin in a page** — that literal reached production-shaped output precisely because it looked harmless in review.

Site-wide OpenGraph, including `public/og-cover.png`, is set once in `app/layout.tsx` and inherited. The card is a **committed PNG, not a generated `opengraph-image.tsx`**: `ImageResponse` only runs under the edge runtime in this project (the Node path crashes the request), and adopting edge would cost the static export above. Re-render it from a throwaway edge route rather than editing the PNG.
