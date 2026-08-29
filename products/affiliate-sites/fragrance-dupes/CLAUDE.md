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
npm run dev      # port 3000, or the next free one
npm run build    # runs prebuild (generate-redirects) then `next build` -> out/
npm run lint
npx prisma validate   # needs DATABASE_URL set to anything well-formed, even offline
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

**The catalog is now indexable — `/fragrance/[slug]` exists (2026-08-27), and `/fragrance` is a real index page as of 2026-08-29.** Each reference statically generates one page via `generateStaticParams()` over `REFERENCES`, with canonical + OG metadata and BreadcrumbList JSON-LD. Sitemap: ~11 URLs → 78 → **132** (2026-08-29). **Exactly two routes use `generateStaticParams`: `/fragrance/[slug]` and `/guide/[slug]`** — this file previously said four, listing `/comparison/[slug]` and `/review/[slug]`, which were deleted in the static-export migration and are documented as deleted further down this same file.

What is still missing is the **pairwise** comparison URL. `/dupe-finder` reads `?ref=<slug>` to seed the initial reference, but picking a dupe is pure React state inside `dupe-finder.tsx` — no router push, no URL sync — so there is still no `/compare/[a]-vs-[b]`. That route is blocked on listings existing at all (see below), not on routing work.

**All data is hand-typed TypeScript literals — there is no import path anywhere.** No feed, no CSV, no fetch. That is why "add every fragrance on the market" is not a bigger version of the same task: it needs an ingest source, which is expected to be an affiliate product feed (which also supplies the legally usable imagery discussed below). Prices are hand-maintained constants that feed a user-facing "Nx cheaper" claim, so they go stale silently.

## Things that are deliberately inert — keep them honestly so

This project has several features that are fully built but non-functional, because the service behind them doesn't exist. **They announce that plainly rather than faking success, and that is a requirement, not a placeholder to tidy up:**

- **`app/api/` no longer exists.** The Stripe checkout/webhook routes were **deleted on 2026-08-27**, not left inert: Sirketim is Turkey-based and **Stripe does not serve Turkey** (verified 2026-08-26 against `stripe.com/global`), which `departments/accounting/CLAUDE.md` had already documented two days before that integration was written. Replacement rail is **Paddle**; `prisma/schema.prisma` stays provider-agnostic (`PaymentProvider`, `providerCustomerId`, …) so the next attempt isn't provider-shaped. **There are now zero route handlers anywhere in the project** — `/go/[slug]/route.ts` was deleted too, in the static-export migration later the same day. Verify with `find app -name route.ts` before assuming otherwise; this line has already been wrong once.
- `components/reviews/add-review-form.tsx` and `components/producers/submission-form.tsx` tell the user nothing was saved. Don't "fix" these into fake success states.

Unfilled env vars are listed in `.env.example`. Filling them requires the founder's own accounts (Supabase/Neon, a payment provider) — real business, bank, and tax identity that can't be scripted.

## Three arrays are deliberately empty — and refilling them by hand is the failure mode

As of 2026-08-27, `DUPES`, `REVIEWS` and `affiliateLinks` are all empty (`[]`, `[]`, `{}`). This is the **corrected** state, not an unfinished one, and each file's header says so. The site renders its empty states correctly throughout — that is why the empty states exist.

Why they were emptied: the listings named products (`Dossier Ambrosia`, ALT.'s `Bright` and `Blue Cedar`) that **do not exist**, attributed to real operating companies — verified against those companies' own storefronts. `lib/reviews.ts` held six invented reviews with human names, star ratings and dates about the same real companies, including a negative one, rendered with an aggregate average and no on-screen fixture label. That is FTC Fake Reviews Rule and trade-libel territory, not a tidiness problem.

**Do not hand-write entries back into any of the three.** If a product name cannot be verified on the producer's own storefront right now, it does not go in. Real listings arrive with an affiliate product feed (`FINALIZATION-GUIDE.md` phase 3 → 4), which is also the lawful imagery source discussed below.

Consequences worth knowing before you plan around them: the site currently has **111 references and zero listings**, so every "alternatives" section renders its empty state, and the house-product plumbing (`components/dupe-finder/house-badge.tsx`, the scoring constraint in `lib/verification.ts`) is intact but has nothing to render.

The previously-documented problem of *our own product ranking #1 on Baccarat Rouge 540* is now **half solved, and it matters which half.** Fixed 2026-08-27: a house product can no longer publish an uncapped score, so it cannot show a number that only independent verification earns, and the ranking can no longer invert against the displayed percentages. **Not fixed, and not fixable in code:** a house product whose declared notes are written to sit close to the reference will still legitimately out-rank honest third-party listings, because the formula only sees the data it is given. That is a data-authorship problem. Whoever repopulates `DUPES` owns it — write house listings as honest formulation compromises, the way the same three products were written before, when our bottles ranked *last* on Aventus and Sauvage. The COO's launch recommendation stands: **ship with no house products at all until Awin approves**, because a merchant reviewer seeing us rank first on our own comparison is the rejection.

## Content: only `guide` pieces can be written right now

`content/schema.ts` defines three types, and the difference between them is a hard gate, not a formality:

| Type | Requires | Writable today? |
|---|---|---|
| `guide` | `featuredProducts` **optional** | ✅ |
| `comparison` | `products` — min 2 `productRef`, each with a **mandatory** `affiliateLinkId` | ❌ |
| `review` | `product` — one `productRef`, **mandatory** `affiliateLinkId` | ❌ |

With `affiliateLinks` empty and no programme enrolled, a comparison or review would have to **invent a product to point at** — the exact failure Phase 0 spent a day undoing. So those two types are blocked until Phase 3, and their routes are deleted (see Deployment below).

This is not a limitation to work around; guides about the **111 real, researched originals** need no affiliate link, internally link to `/fragrance/[slug]`, and are what makes those pages rank. **Twelve are published** (`content/guide/`, 11,996 words as of 2026-08-27), which meets the 10-12 target in `FINALIZATION-GUIDE.md` 2.7.

**The last three changed shape deliberately, and new pieces should follow that pattern rather than the first nine.** Nine general explainers ("what is an EDP", "how to read a note pyramid") teach a reader something but convert nobody. The COO's recommendation was **original-anchored** pieces — "*&lt;original&gt;* alternatives" — writable as `guide` today, needing no `affiliateLinkId`, and landing directly on the `/fragrance/[slug]` pages that already exist. Three now exist for the highest-demand queries in the category: Baccarat Rouge 540, Aventus, Sauvage.

**How to write one honestly while `DUPES` is empty**, since the obvious approach is to name dupe products and we have none verified: anchor on the *original*, which we do have real researched data for. Analyse its actual note structure from `lib/data/houses/`, explain why it is easy or hard to copy (BR540 is six notes over freely-available amberwood; Aventus is twelve whose character is an interaction, and whose own batches vary — so a precise match percentage claims more precision than the target supports), say what to check before buying, then link to genuinely adjacent **originals** in the catalog. Each piece states plainly that we list no alternative products yet and why. That analysis stays true whichever bottle the reader buys, and it does not have to be rewritten when real listings land.

Two rules when adding a piece:

- **`disclosure` defaults to `true` and that is wrong for every current piece.** The block renders "This piece contains affiliate links" — false where there are none. Set `disclosure: false` until real links land, then flip it per-piece.
- **Verify every internal link resolves before committing.** `/library` is the *content* library (`getAllContent()`, the 12 guides) and is **not** the catalog index — this file claimed it was, which was false. **The catalog index is `/fragrance`, built 2026-08-29** (`app/fragrance/page.tsx`, grouped by house via `getReferencesByBrand()`), which also fixed a guide link to `/fragrance` that had been 404ing. Before that day the catalog was fully orphaned: nothing on the site linked to a `/fragrance/` page except the guides, leaving 37 of 68 reachable only via `sitemap.xml`. Fixed by the index plus the per-page "Related originals" and "Related reading" modules. A 404 inside published content is exactly what an affiliate reviewer looks for; so is a catalog nothing links to.

The filename must match the frontmatter `slug`, and bad frontmatter fails the build loudly by design (`content/loader.ts`).

**`content/loader.ts` also refuses to build if a piece's content type has no route** (added 2026-08-27). Every piece renders a card linking to `/<contentType>/<slug>`, and `app/comparison/[slug]` and `app/review/[slug]` were deleted in the static-export migration — so writing one comparison would previously have shipped a card pointing at a 404, which is the first thing an affiliate reviewer clicks. The guard checks the filesystem rather than a hand-maintained list, because keeping a list in step is exactly the step that gets missed. Restore the route (it's in git history) before adding the piece; the error message carries the `git log` command.

Relatedly, `components/library/library-tabs.tsx` **derives its tabs from what is actually published** rather than from the three schema types. It used to render permanent "Comparisons (0)" and "Reviews (0)" tabs, advertising an empty catalog to every visitor. With one type published it drops the tab strip entirely; the tabs return on their own when a second type lands.

## Product imagery is legally blocked, not missing

`ReferenceFragrance.imageUrl` is empty on every entry **by design**. Perfume bottles are protected trade dress. There are exactly two lawful sources: imagery supplied by an affiliate program we've enrolled in, or photography of bottles we own. Generating bottle renders is ruled out by `departments/web-development/CLAUDE.md`'s trademark caution; reusing a retailer's photo is infringement.

Until then `components/fragrance/fragrance-image.tsx` renders a generated per-fragrance colour mark (`lib/fragrance-visual.ts`). Every surface routes through that component, so populating `imageUrl` later lights up the whole site with no component changes. Don't bypass it.

## `/go/[slug]` — the affiliate chokepoint, now a build-time artifact

**`app/go/[slug]/route.ts` no longer exists.** A route handler cannot return a 302 in a static export, so as of 2026-08-27 the chokepoint is `scripts/generate-redirects.mjs`, which reads `lib/affiliate-links.ts` at build time and writes `public/_redirects`. Cloudflare serves those as real edge redirects, so `/go/<slug>` behaves identically to a visitor.

The generator **fails the build loudly** if it cannot parse the map, rather than emitting an empty redirect table — that would 404 every affiliate link in production while the site looked fine. It already caught one real regression: the first version's regex only matched a multi-line literal and broke on the empty `= {};` form.

Three things to know before changing anything here:

- **`affiliateLinks` is currently `{}`, so every `/go/<anything>` 404s.** That is correct, not broken. Buy buttons already refuse to render unless `hasRealAffiliateLink()` resolves, so no visitor can reach one.
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

Two known-good expectations for that smoke test: `/go/anything` returns **404** (correct while `affiliateLinks` is empty), and a fragrance page's canonical reads `https://counterscent.com/...`, never a placeholder or `localhost`.

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

**The review and comparison routes are recoverable from git history** (`git log --oneline -- "app/review/[slug]/page.tsx"`). Restore them the moment `content/review/` or `content/comparison/` has a real piece in it — but see the content constraint: neither type can be written honestly until an affiliate programme is enrolled, because `content/schema.ts` requires a `productRef` with a mandatory `affiliateLinkId` on both.

**Next.js 14.2.35 is pinned and still constrains options.** `@opennextjs/cloudflare` ended Next 14 support in Q1 2026 and `vinext` targets Next 16, so running this as a *Node app* on Cloudflare would mean upgrading Next first. The static export sidesteps that entirely — which is the point.

## Canonical URLs and the contact address go through `lib/site.ts`

`lib/site.ts` is the single source for the site origin (`siteUrl()`, `absoluteUrl()`) and the public contact address (`CONTACT_EMAIL = contact@counterscent.com`, a real monitored inbox since 2026-08-27). Both are **constants with real defaults, not env vars**, deliberately: a forgotten deployment setting would otherwise ship canonicals pointing at a placeholder host, which is invisible in review and expensive in search results. `NEXT_PUBLIC_SITE_URL` still overrides for previews.

**A previously documented defect here is fixed** — three content routes used to carry their own `process.env.NEXT_PUBLIC_SITE_URL ?? "https://example-placeholder.com"` fallback instead of calling `siteUrl()`, and two of them also emitted **no canonical at all**. `grep -r example-placeholder` now returns nothing. The lesson survives the fix: **never hand-roll the origin in a page** — that literal reached production-shaped output precisely because it looked harmless in review.

Site-wide OpenGraph, including `public/og-cover.png`, is set once in `app/layout.tsx` and inherited. The card is a **committed PNG, not a generated `opengraph-image.tsx`**: `ImageResponse` only runs under the edge runtime in this project (the Node path crashes the request), and adopting edge would cost the static export above. Re-render it from a throwaway edge route rather than editing the PNG.
