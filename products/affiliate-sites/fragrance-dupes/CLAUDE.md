# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Scope: the PARFUMOZA affiliate/marketplace site. Read the chain — root `CLAUDE.md` → `departments/web-development/CLAUDE.md` → this file. `README.md` here covers the stack, how to run it, and the honesty caveats; `DESIGN.md` covers visual direction. **This file covers the invariants that span several files and are easy to break without noticing.**

## The brand is Parfumoza — and "drydown" is still a real word here

Renamed from **Drydown** to **Parfumoza** on 2026-08-27, when `parfumoza.com` was chosen as the domain (`drydown.com` was taken).

**Do not run a blanket find-and-replace on "drydown".** It is also the perfumery term for the base-note phase — the part of a fragrance still on skin hours later — and it appears legitimately in editorial copy and in code comments explaining why base notes are weighted highest (`lib/similarity.ts`, `app/about/page.tsx`, the guide, `submission-form.tsx`'s placeholder, `DESIGN.md`). Those uses are correct and must survive.

The rule that made the rename safe: **capitalised forms (`Drydown`, `DRYDOWN`) were the brand; bare lowercase `drydown` is the perfumery term.** Slug-style identifiers (`drydown-theme`, `drydown-atelier`) were brand too and were renamed explicitly.

## Commands

```bash
npm install
npm run dev      # port 3000, or the next free one
npm run build
npm run lint
npx prisma validate   # needs DATABASE_URL set to anything well-formed, even offline
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
- **Ranking uses raw; display uses capped.** `getRankedDupesFor()` sorts on the raw score so ordering stays meaningful when several listings tie at the cap. Swapping either side silently flattens the ranking.
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

**The catalog has no URLs.** 68 references × 37 listings currently generate **zero** indexable pages: `/dupe-finder` reads `?ref=<slug>` server-side to seed the initial reference, but picking a dupe is pure React state inside `dupe-finder.tsx` — no router push, no URL sync — and `ComparisonDetail` only ever renders inside that component or an MDX embed. So there is no `/fragrance/[slug]` and no `/compare/[a]-vs-[b]`, and the sitemap carries ~11 URLs for the whole site. This is the single highest-leverage SEO fix and it is a *routing* change, not a content one. Everything downstream of it (canonicals, per-page OG, breadcrumbs) is blocked on those routes existing.

**All data is hand-typed TypeScript literals — there is no import path anywhere.** No feed, no CSV, no fetch. That is why "add every fragrance on the market" is not a bigger version of the same task: it needs an ingest source, which is expected to be an affiliate product feed (which also supplies the legally usable imagery discussed below). Prices are hand-maintained constants that feed a user-facing "Nx cheaper" claim, so they go stale silently.

## Things that are deliberately inert — keep them honestly so

This project has several features that are fully built but non-functional, because the service behind them doesn't exist. **They announce that plainly rather than faking success, and that is a requirement, not a placeholder to tidy up:**

- `app/api/subscribe` and `app/api/webhooks/stripe` return **503 with an explicit reason** when Stripe env vars are absent. **⚠ This code is dead and slated for deletion — do not extend it.** Sirketim is Turkey-based and **Stripe does not serve Turkey** (verified 2026-08-26 against `stripe.com/global`); this was already documented in `departments/accounting/CLAUDE.md` two days before the integration was written. Its 503 message ("No Stripe account is connected to this site") is itself misleading, because it implies one *could* be. Replacement rail is **Paddle**; `prisma/schema.prisma` is already provider-agnostic (`PaymentProvider`, `providerCustomerId`, …). See `FINALIZATION-GUIDE.md` phase 0.5.
- `components/reviews/add-review-form.tsx` and `components/producers/submission-form.tsx` tell the user nothing was saved. Don't "fix" these into fake success states.
- Every affiliate destination in `lib/affiliate-links.ts` is a marked placeholder; no program is enrolled.

Unfilled env vars are listed in `.env.example`. Filling them requires the founder's own accounts (Supabase/Neon, Stripe) — real business, bank, and tax identity that can't be scripted.

## Product imagery is legally blocked, not missing

`ReferenceFragrance.imageUrl` is empty on every entry **by design**. Perfume bottles are protected trade dress. There are exactly two lawful sources: imagery supplied by an affiliate program we've enrolled in, or photography of bottles we own. Generating bottle renders is ruled out by `departments/web-development/CLAUDE.md`'s trademark caution; reusing a retailer's photo is infringement.

Until then `components/fragrance/fragrance-image.tsx` renders a generated per-fragrance colour mark (`lib/fragrance-visual.ts`). Every surface routes through that component, so populating `imageUrl` later lights up the whole site with no component changes. Don't bypass it.

## `/go/[slug]` — the affiliate chokepoint

Every outbound click goes through `app/go/[slug]/route.ts`, which must resolve via `resolveAffiliateLink()` rather than reading the `affiliateLinks` map directly (reading the raw map made every buy-the-original link 404 while its button rendered fine).

**Unresolved compliance question:** Amazon's Associates agreement bars obscuring the source site "including by use of Redirecting Links" — which is exactly this pattern. Probably fine where attribution is preserved, but unverified, and the penalty is account termination. This redirect is load-bearing for the whole producer-attribution design. See `departments/communication/reports/amazon-associates-application.md` §2 before shipping an Amazon link.

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

Also confirm the API routes still refuse honestly (`POST /api/subscribe` → 503 with a message), and that `/go/<id>` 302s to the expected placeholder while an invalid id still 404s.

## The producer surface, and the gate that isn't open

Four routes: `/producers` and `/producers/pricing` (public), `/producers/login`, and `/producers/submit` (**gated**). `lib/plans.ts` holds the tiers — its prices are **labelled placeholders** pending a founder decision — plus `NEVER_INCLUDED`, which encodes that no tier may buy rank, score, placement, or review removal. That constraint is the independence posture above, expressed in code; don't weaken it for a pricing experiment.

`lib/producer-session.ts` gates access. Two things to know before planning around it:

- **`isPreviewMode()` requires `NODE_ENV === "development"` *in addition to* `PRODUCER_PREVIEW=1`.** That is deliberate: the bundler inlines `NODE_ENV` at build time, so the preview bypass **cannot** be switched on in a production build. An env-var-only flag would be a real auth-bypass hole the day this deploys. Don't "simplify" it to one check.
- **The consequence is that `/producers/submit` is currently unreachable in production for everyone**, since no real auth exists yet. It is deliberately closed, not broken — but every free-tier discussion is downstream of ungating it (`FINALIZATION-GUIDE.md` phase 5.1).

`past_due` counts as an active subscription on purpose, so dunning on a temporarily declined card doesn't instantly delist a paying producer.

## Planning docs

**Start with `FINALIZATION-GUIDE.md`** (2026-08-26) — the current ordered roadmap: 6 phases with department owners, costs, dependencies, and what is deliberately *not* worth doing yet. It supersedes the sequencing in the older docs and is also published as a dashboard-linked Artifact.

`MARKETPLACE-PLAN.md` (the two-sided marketplace model, data model, open business questions) and `PRODUCER-PROGRAM.md` (subscription tiers, submission flow, approval criteria, the integrity standard) remain the reference for *why* things are shaped as they are. Both are `Status: planning only` where they describe unbuilt things — check which parts have since been implemented rather than assuming either extreme.

## Two open problems, both deliberately unresolved

- **`lib/reviews.ts` renders fabricated reviews as real.** Six invented reviews with human names, star ratings and dates, about **real, named, operating companies** (including a negative one), rendered with an aggregate average and no on-screen fixture label — despite the file's own header forbidding exactly that. FTC Fake Reviews Rule plus trade-libel exposure. It is the **first item** in `FINALIZATION-GUIDE.md` and a one-line data change; the empty state already renders correctly.
- **Our own house product ranks #1 on its reference.** `No. 01 Ember` renders at 79% on `baccarat-rouge-540`, ahead of every real listing — confirmed against the running server. This is *not* the producer-copying exploit (that one is fixed and enforced); it is the same failure by our own hand, because Ember's note list was written close to the reference. The mechanism is honest (same formula, `HouseBadge` discloses it, ties break toward the cheaper bottle) but the data isn't. Resolving it is a founder call — don't quietly re-weight the formula to hide it.
