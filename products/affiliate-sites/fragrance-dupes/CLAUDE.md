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

**Why any of this exists:** before 2026-09-08 the raw formula was `notes*0.5 + facets*0.35 + familyBonus*0.15` with `familyBonus` hardcoded to `1`, and the other two terms return `1` on identical inputs — so a producer who copied the reference's note pyramid and facet scores scored **exactly 100%**, verified rather than theoretical. No formula over self-reported data can tell a real match from a copied answer key, so the defence is structural. Full reasoning: `PRODUCER-PROGRAM.md` §7, and the module doc in `lib/verification.ts`.

**The formula changed on 2026-09-08 and so did every ceiling — see `PRODUCER-PROGRAM.md` §7's dated subsection for the decision record.** Four changes shipped as one atomic edit, because each one moves scores and staging them would have meant explaining three different numbers to the same reader:

| | |
|---|---|
| `familyBonus` | **Fixed.** Now the real `family === family ? 1 : CROSS_FAMILY_CREDIT (0.4)` check, shared with `computeOriginalSimilarity` via one `familyBonus()` helper. Required a new `DupeCandidate.family` field — the bug had persisted partly because there was nothing on that type to compare against. **A no-op for all 79 current listings**, every one of which shares its reference's family; it only discriminates for a future cross-family listing. |
| Ingredient overlap | **New 4th component, 15%.** Flat, untiered Jaccard over `ingredients?: string[]` on both `ReferenceFragrance` and `DupeCandidate`. Weights become 40/30/15/15 — **but only when both sides have a list.** Otherwise the formula uses `BASE_WEIGHTS` (the original 50/35/15), so a missing list is never scored as a mismatch. Two fixed weight constants, deliberately not one proportional redistribution: redistributing 15 points across the other three lands at ~47/35/18, which would have shifted every existing score on ship day. **No listing has ingredient data yet**, so this component currently affects nothing. |
| Structural ceiling | **New: 95, applies to everything, including `verified`** (previously uncapped, up to 100). Two fragrances can declare identical notes and still not contain them in the same proportions — a note list says what went in, never how much. `UNVERIFIED_SCORE_CAP` (90) still binds below it for declared/house listings. |
| Imputed-pyramid penalty | **New: flat −10, applied before either ceiling**, on any listing whose tier split we invented rather than read off the seller (`pyramidSource: "declared" \| "imputed"`, required). **47 of 79 are imputed** (AromaPassions 38 + Clone of Perfume 9); the other 32 are Opulensi-sourced and declared. |

**One escape hatch, and it is human, not formulaic:** `DupeCandidate.founderOverride` (`{ score, note, date }`) publishes its own number, bypassing the penalty and both ceilings — the only way past 95. It cannot override `isVerbatimCopy` (a flagged copy never publishes, override or not), cannot be set on a house product, and requires a non-empty justification — all three enforced by `validateFounderOverride()`, called in a module-load loop in `lib/dupes-data.ts` so a bad one fails the build rather than shipping. It renders as its own badge ("Founder's personal assessment", `Signature` icon), deliberately not styled like "Editorially verified": one is an independent check, the other is one person's disclosed opinion. **Zero listings use it today** — the mechanism shipped ahead of its first use, so its badge has never rendered in production.

**Measured effect of the whole change**, before/after over all 79 listings via `npx esbuild --alias:@=.` against the shipped functions: the 32 declared listings moved by **exactly zero**, and 41 of the 47 imputed ones fell exactly 10. The other six fell less (−1 to −7) because they were already sitting at the 90 cap — Rouge Veil, the raw-99 copied-pyramid case this file has flagged since 2026-09-03, went 90 → 89. One ranking changed anywhere on the site: on Aventus, the Clone of Perfume listing that this file already described as suspiciously #1 dropped to #3, behind two declared-pyramid Opulensi listings. That is the penalty doing exactly the job it was added for.

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

**Current state, 2026-09-05, across THREE merchants:** `DUPES` holds **79 listings** across **65 references**, `affiliateLinks` holds **77 real Awin entries**, `REVIEWS` is still `[]`. All three were emptied on 2026-08-27 and the reasoning below is the bar every refill had to clear, not a superseded note.

| | Then | Now |
|---|---|---|
| `DUPES` | `[]` | **79 listings**, every name read off a live merchant feed *and* re-checked against the merchant's own page, each carrying `offers` with the exact rows |
| `affiliateLinks` | `{}` | **77 entries** — **30 Opulensi** (Awin 123248) + **9 Clone of Perfume** (117395) + **38 AromaPassions** (34989) — each traced AND stock-checked before being added |
| `REVIEWS` | `[]` | still `[]` — nothing has changed here, and inventing reviews is the worst of the three failures |

So `/go/<id>` resolves for exactly seventy-seven ids and 404s for everything else. **Seventy listings render a buy button**, not seventy-nine: eight links track fine but their products are out of stock at the merchant (all eight Opulensi — Armaf Club de Nuit Intense Man; Ard Al Zaafaran Bint Hooran; Fragrance World Neroli Riviera, Ard Al Zaafaran Oud Orchid, Lattafa Qaa'ed, Fragrance World Vanille En Tobacco, Lattafa Ameer Al Oudh Intense Oud, Zimaya Oud Is Great), so those rows show the price and "Out of stock" instead, and two listings are carried only by the closed My Perfume Shop programme. Enrolled, tracking, and in stock are three separate questions and all three have failed here. **All nine Clone of Perfume and all thirty-eight AromaPassions offers are genuinely in stock**, which is why the buyable count keeps rising faster than the listing count.

**Offers are per RETAILER again as of 2026-09-05, and the presentation experiment is over.** The A1 AromaPassions batch gave each listing two offers, 50ml and 100ml — but both pointed at the *same* `affiliateLinkId`, so the page rendered two buy buttons going to exactly the same place, and `buy-actions.tsx`, which counts distinct merchants for its header, called one retailer's two bottles "2 retailers". **Founder's call, 2026-09-05: one offer per listing, the 50ml price, one link.** A1 was collapsed in the same change (`priceUsd`/`bottleMl` were already the 50ml figures, so no price moved). 79 listings, 80 offers — the one extra is a genuine second *retailer*, which is what the field is for.

**Recompute these before quoting them.** `grep -c 'inStock: false'` over-counts (the doc comment in `lib/dupes-data.ts` contains the string); count top-level fields instead:

```bash
grep -c '^    slug: "' lib/dupes-data.ts        # listings
grep -c '^        affiliateLinkId: "' lib/dupes-data.ts
node scripts/check-affiliate-links.mjs | head -5   # link count + per-merchant split
```

**The pairing is cited, not asserted, wherever possible.** `DupeCandidate.pairingBasis` holds who claims a dupe matches its original, in their words, with a link. This came from a discovery in the Opulensi feed: **70 of its 610 rows name the Western release themselves**, in the product URL (`...inspired-by-baccarat-rouge-540`) or the description (`Inspired by "Good Girl"`). That is stronger evidence than our recall and it shows the reader who is claiming what. Scan a new feed for `inspired by` before authoring pairings from memory.

**Two kinds of pairing now exist and the UI distinguishes them.** 58 listings carry `pairingBasis` (the retailer said it); 20 do not, and those render **"Our own judgement. No retailer describes X as an alternative to Y"** rather than a blank. The blank was the bug worth avoiding — without it our assertion silently borrows the credibility of the cited listing next to it. (One of the 12 — Zimaya Oud Is Great vs Initio Oud for Greatness — was proposed as an editorial-judgement candidate and only turned into a cited one once a citation was found by reading past the note pyramid in the feed's full product description; scan the whole description, not just the first paragraph.)

**Editorially-paired scores carry a selection bias that cited ones do not.** Those pairings were proposed from reputation and then *checked* against the retailer's published note pyramid, so they are mildly selected for note overlap — and the score is computed from note overlap. Qaed Al Fursan (editorial, 80%) outranking Club de Nuit Intense Man (79%) on Aventus is that bias showing. Cited pairings have no such filter, which is why they range 44–82%. **Never pair on note overlap alone**: selecting on the metric and then publishing the metric is circular, and it would turn every score into a tautology.

**AND A HIGH SCORE IS NOT A COMPLIMENT — it can be a fact about the merchant's copywriting.** This turned up on 2026-09-03 with the second merchant and is the most important thing to understand before adding a third. **All nine Clone of Perfume listings rank #1 on their original**, including on four originals where they displaced established Opulensi listings — Thunderstorm above Qaed Al Fursan and Club de Nuit Intense Man on Aventus, Ultimatum 19 points above Qaa'ed on Oud Wood. That is not nine unusually good fragrances. The formula is 50% note overlap over *declared* notes, and this merchant tends to publish **the original's own pyramid** as its product's: Rouge Veil's declared notes are Baccarat Rouge 540's note for note (raw 99), and Lady on Fire's top and heart are Black Opium's unchanged (raw 93). A merchant whose marketing restates the original will systematically outscore one whose copy describes its own juice, and the site cannot tell those apart from the data.

The unverified cap catches only the extreme end — those two and Whisper publish at 90 instead of 99/93/93 — and does **nothing** for Thunderstorm at 89 or Ultimatum at 85. Three things follow, and none of them is "adjust the scores":

- Each capped listing's `verdict` says on the page that the note match is the retailer's claim rather than our finding. That is the mitigation actually shipped, and it is the same posture as the Bint Hooran disagreement, pointed the other way.
- `isVerbatimCopy()` did not fire on any of the nine, because it needs notes **and** facets to match and the facets are our estimates. Facets were written from the declared differences (extrait vs EDT/EDP, notes added or missing), **not tuned against the flag threshold** — if one had flagged it would have been left flagged.
- **This is a scoring-formula question, not a data question. It was addressed on 2026-09-08, and only partly.** The flat −10 imputed-pyramid penalty (see the scoring-pipeline section above) now applies to all nine of these listings, because Clone of Perfume publishes no tiers — so Thunderstorm's 89 is 79 and Ultimatum's 85 is 75. **That is a penalty for the missing pyramid, not for the copying**, and the distinction matters: a merchant who copies the reference's pyramid *and publishes it as three tiers* still gets scored on it at face value. `isVerbatimCopy()` remains the only defence against that case and it still needs facets to match too. Do not read the penalty as having closed this.

**AromaPassions repeated the pattern on 2026-09-04 and made it worse, which is the argument for finally addressing it.** Five of its fourteen listings score 83–87 on pyramids that largely restate the original's; two products (Crystal Noir, Bright Crystal) restate it *completely*, and one of those had to be withheld because the copy detector correctly fired while the other shipped at 86% on the strength of two orthographic differences. **Two merchants in two days is a pattern, not a coincidence** — a dupe house's marketing copy naturally restates the pyramid it is selling against, so a formula that is 50% declared-note overlap will keep rewarding it. The scores are honest reports of the data we have; the data is systematically flattering. Nothing in this batch adjusts a score to compensate, and nothing should.

**A MERCHANT THAT PUBLISHES NO PYRAMID CANNOT FEED THIS FORMULA HONESTLY, AND TWO OF THREE DON'T.** Measured 2026-09-05, and it is the sharpest form of the problem above. AromaPassions publishes **one flat sentence** — "Scented using A, B, C … essential oils" — and no tiers at all; Clone of Perfume is the same shape. Our formula weights tiers **20/35/45**, so whoever splits that list sets the score. On FEMININITY vs Chanel No. 5, facets held constant, the *same merchant data* scores **70–82% depending only on where the two cuts land.**

Three roads out, and two are closed:

| approach | why it fails |
|---|---|
| Align the cuts to the original's own pyramid | **Circular.** Maximises per-tier Jaccard by construction — selects on the metric, then publishes it. This is what A1 and A2 both do. |
| Split by standard perfumery convention | **Noise, not conservatism.** Disagrees with **17.1% of our own reference notes (253 of 1476)**, because tier placement is a per-fragrance fact published by the house, not a property of the material — saffron is a top note in Baccarat Rouge 540 and a heart note elsewhere, and *both are correct*. It scored Red Tobacco at 0.04 against a reference sharing nine materials. **Do not re-propose this; it was tried and measured.** |
| Compare tier-agnostically when no pyramid exists | **Still not implemented, and no longer the plan.** It remains the most honest representation, but the founder's 2026-09-08 call took a cheaper route to the same posture — keep the tiered formula, and price the uncertainty instead (below). Revisit it only if the penalty proves too blunt. |

Shipped behaviour, on the founder's call of 2026-09-05: **align, and disclose in every verdict** that the merchant published no pyramid and the split is ours. The disclosure is the mitigation, not the number. Two guards keep the aligned split from producing pyramids no reader would believe — no tier may be empty, and none may hold more than 60% of the list (Poison came out 1/1/10 without the second) — and ties break to the *lower* score.

**Extended 2026-09-08: the split is still ours, but it now costs 10 points.** Every listing carries `pyramidSource`, and an `"imputed"` one is penalised before any cap (`lib/verification.ts`). The reasoning is the one in the table above, turned into a number rather than left as prose: an aligned split maximises overlap by construction, so a score built on one cannot be worth the same as a score built on a pyramid the seller published. The penalty is also **not** a claim that these listings are worse fragrances — it prices our confidence in the comparison, and the badge says so on the page.

**A LOW SCORE IS A RESULT, NOT A REASON TO OMIT A LISTING.** This was got wrong once and corrected by the founder, so it is written down. Two candidates (Jean Lowe Matiere vs Oud Wood, Maahir Black Edition vs Layton) were proposed, checked against the retailer's note pyramid, found to diverge, and dropped as "not the same fragrance". That is not the test. The site exists to show *where a candidate matches and where it does not* — Bint Hooran at 44% was already proof — so both were added and score 45% and 52%, with note diffs that say exactly what is shared and what is not.

The test a pairing must pass is **"is this a comparison a buyer would actually make?"**, not "does it score well". Both pass: Maison Alhambra's Jean Lowe line is its Tom Ford line, and Lattafa's Maahir line is routinely shelved against Parfums de Marly. Anfar's and Adyan's own compositions still fail it — nobody compares those to a designer bottle — which is why they remain absent and should stay absent.

(One factual correction that came out of it: the rejection note had called Maahir Black and Layton "not remotely the same". They share bergamot, vanilla, sandalwood, guaiac wood and pepper — most of Layton's base. They diverge at the top, not throughout.)

**COVERAGE IS CAPPED BY WHAT THE DUPE INDUSTRY MAKES, NOT BY OUR MERCHANT.** The obvious goal — every original having at least one alternative — is not reachable and it is worth understanding why before anyone plans around it. Dupe houses clone **bestsellers**. There is no Lattafa version of Chanel Sycomore, Le Labo The Noir 29, Chanel Antaeus or most of the other niche and discontinued entries in a 200-strong catalog, and there never will be. A rough half of `REFERENCES` is simply outside the category's target list.

So the ceiling is not "200 with more merchants". It is closer to **50–70 references**, and reaching even that needs several more dupe-side merchants. Judge progress by *originals covered* (**65**) rather than by listing count (**79**) — six listings on Aventus is depth, not reach, and the reach number is the one that matters for search traffic. The AromaPassions A1 batch of 2026-09-04 took coverage from 27 to 41 in one pass, and **A2 on 2026-09-05 took it from 41 to 65**, every one of its 24 landing on an original with no alternative at all. **That puts us inside the estimated 50–70 ceiling, so treat it as reached rather than as headroom** — the cheap wins from this merchant are now spent, and the next real gain is a fourth dupe-side merchant or newly researched originals, not another pass over AromaPassions.

**How far the OPULENSI feed goes, measured 2026-09-02, re-checked and closed out 2026-09-03 — do not re-derive the underlying scan.** 610 rows → 533 matched to the storefront → **245 actually in stock** (the feed marks all 610 `in_stock=1`) → 218 with a parseable note pyramid → **only 21 name a fragrance that is in REFERENCES**, and several of those are false positives. Chasing "impression" (225 rows) and "TF" (67) yielded nothing: the first is ordinary English, the second a substring bug. The in-stock pool is dominated by Anfar, Adyan, Sapil and Al-Rehab, whose ranges are original Arabian compositions rather than designer clones. **Opulensi tops out at 32 listings covering 22 originals** — two more passes over the same 610 rows found seven more genuine pairings total and nothing further to chase. That remains true and is not worth re-scanning.

**What was wrong was reading that as a ceiling on the site.** The fix was never more scanning; it was a second dupe-side merchant, and one arrived the same day.

### The second merchant, 2026-09-03 — and what a good dupe feed looks like

**Clone of Perfume** (Awin **117395**), `cloneofperfume.com`, US/USD, brand **"The CLONE"**. A dupe house **selling direct**, so producer and merchant are one company — every listing above it has a reseller in between. Nine listings from an **11-row** feed, taking the site to 41/27. Five land on originals that had **no** alternative at all: Sauvage, Black Opium, Santal 33, Love Don't Be Shy, Fucking Fabulous.

Three things generalise from it:

- **Yield is about feed quality, not feed size.** Opulensi: 610 rows → 32 listings (5%). Clone of Perfume: 11 rows → 9 listings (**82%**). Every fragrance row names its designer original outright *and* publishes a full note pyramid, so all nine are **cited** pairings. Prefer a small single-brand dupe house over a large reseller catalogue when prospecting the next merchant.
- **A single-brand direct seller is the one case where `priceUsd` may come from the merchant.** There is nowhere else to buy The CLONE, so its price *is* the street price. That exception is documented at the listings themselves and in `scripts/feeds/README.md`; do not generalise it to a reseller.
- **Feeds vary in which fields they lie about or omit.** This one has *no size column at all* (`dimensions`/`specifications`/`product_model`/`colour` empty on all 11 rows, no ml in any description), so bottle size — which drives the per-ml claim — had to be read off the live pages. It also had 2 of 11 prices stale. Its stock flag, unusually, was right.

**A merchant does not have to echo the sub-ID into the destination URL.** Opulensi does (`utm_id=<affid>_<subId>`); that is its Shopify theme, not an Awin guarantee, and `scripts/check-affiliate-links.mjs` had hardcoded the assumption — so it falsely reported all nine new links as unattributable. Awin's own click cookie, set on `.awin1.com` at the first hop, carries the sub-ID for **both** merchants (`aw117395=…|<clickref>|…`). The script now traces hops by hand, accepts either channel, and **says which one** — the check got stronger, not weaker. Full write-up in `scripts/feeds/README.md`.

It also lets the site disagree in public. **Bint Hooran is the worked example**: Opulensi calls it a Good Girl alternative *and says the notes are similar*, then publishes a pyramid for it built on coriander, cypress, citrus and vetiver — against Good Girl's almond, coffee, tuberose and cacao. One shared base note, 44% match. The listing ships with the retailer's claim quoted, the diff showing otherwise, and a verdict saying so. Do not "fix" that listing by softening the verdict or dropping it; disagreeing with a merchant on their own published data, with the evidence on screen, is the independence posture actually working.

### The third merchant, 2026-09-04 — the stalest feed here, and the biggest jump in reach

**AromaPassions** (Awin **34989**), `aromapassions.com`, US/USD. The second dupe house selling direct. Fourteen listings from a 230-row feed, taking the site to 55 listings across **41** originals — and *every one of the fourteen* lands on an original that had no alternative at all, which is why coverage moved 27 → 41 in a single pass. Its titles state the inspiration outright (`SPARK | Inspired by CHANEL ALLURE HOMME SPORT | …`), so all fourteen are cited pairings.

Four things generalise, and they are mostly warnings:

- **Feed quality and merchant quality are different questions, and this proves it.** The Clone of Perfume lesson above was "prefer a good feed". This feed is the worst here — wrong prices on more than half the range, a size that no longer exists, stale description prose, and **every image URL dead** — and it still produced the most valuable batch, because the *merchant* is good. Judge the merchant; treat the feed as a list of ids to go and check.
- **Only the ids are durable.** `aw_product_id` and `merchant_product_id` were the only fields taken at face value. Prices, stock, sizes and images all came off `/products/<handle>.js`, whose `variants[]` gives title, price in cents and a real `available` flag — the cheapest truth source found for any merchant here, and worth trying first on any Shopify storefront.
- **Two seller claims were refused rather than repeated.** These are marketed as "Pheromone Perfume" (no sound evidence for human pheromone attraction effects) and at a stated "20% Extrait de Parfum" (unverified, and concentration is not similarity). Neither appears in a listing name or a verdict as fact. A prior pass also nearly read "Essential Oil Fragrance" in every title as meaning *oil concentrate* and marking sillage down for it — the merchant's own published ingredient lists all begin `alcohol, aqua`, so that would have been an invented format claim about a real company's product. **Marketing language is not a product fact in either direction**; full write-up in `scripts/feeds/README.md`.
- **A merchant can contradict itself across two documents on the same page.** Three of these products publish an ingredient list that describes the original far better than their own note pyramid does — Angel's caramel material, Another 13's amber-musk stack, Costa Azzurra's olibanum, all present in the ingredients and absent from the pyramid. Score the pyramid, because that is what is comparable across the catalogue, then **say in the verdict where the ingredient list disagrees**. It is the best available evidence that a low score is a limit of the data rather than a verdict on the bottle.

**One listing was withheld and the reason is worth keeping.** ILLUMINATE (Versace Crystal Noir) declares Crystal Noir's pyramid back note for note in all three layers with nothing of its own and no ingredient list. Publishing it would have meant either inventing facet differences purely to clear `isVerbatimCopy()`, or shipping a listing `getRankedDupesFor()` correctly hides while its link and photograph sat in the tree pointing at nothing. GLAMOROUS (Bright Crystal) is the identical situation and *did* ship, clearing the copy check only because the merchant writes "Ice"/"Lotus" where the catalogue records "Ice Accord"/"Lotus Flower" — its verdict says so on the page. That is the copy gate landing at slightly different points on two near-identical cases, not an inconsistency to tidy.

**This batch also broke a UI claim that had been true by luck.** Both places that rendered the per-ml comparison printed `${multiple.toFixed(1)}x cheaper` unconditionally, which is a false price claim the moment the multiple is at or below 1 — and AromaPassions' Eros interpretation is $0.78/ml against Versace Eros at $0.75/ml. It would have read "1.0x cheaper" one click from the page that disproves it. `describeValueMultiple()` in `lib/similarity.ts` now returns "no cheaper" or "Nx more expensive" as warranted. **Cheap designer originals are where dupe economics stop working**, so expect this again rather than treating it as a one-off.

### AromaPassions batch A2, 2026-09-05 — 23 more, and the merchant is now spent

24 listings from the same 230-row feed, taking the site to **79 listings across 65 originals**; every one of the 24 landed on an original with no alternative. Scores run **50–90%**, a far healthier spread than A1's 83–87 cluster, because these were split under the constrained rule above rather than by eye. Four cap at 90.

Four things worth carrying forward:

- **The feed is a list of ids, nothing more — confirmed again.** Prices were stale on LA VIE EST BELLE and ARMANI CODE ($45 in the feed against a live $39), and four of the feed's `merchant_deep_link` handles now **404** (KINDNESS/Hacivat, INVIGORATE/Light Blue Eau Intense, PURE/Love in White, REFRESH/Aqva Atlantiqve) — those four are *not* shipped for that reason. Everything real came from `/products/<handle>.js`.
- **Join the link to the 50ml variant BY SKU.** `aw_product_id` is Awin's id and is **not** the Shopify variant id (SPARK's 50ml is Shopify `44388249993434` but Awin `41943775349`). Live JSON gives sku → variant title, the feed gives sku → `aw_product_id`. Guessing from the sku suffix (`-X` = 50ml) happens to hold across this catalogue but is the merchant's convention, not a guarantee, and a wrong guess sends the buyer to a different bottle.
- **SPICY (Viktor & Rolf Spicebomb) was withheld, same reasoning as ILLUMINATE.** Its declared list is Spicebomb's note set *exactly* — every material, nothing added or missing, note overlap **1.000**, so `notesAreVerbatim()` returns true. Publishing it meant inventing facet differences purely to clear `isVerbatimCopy()`, or shipping a row `getRankedDupesFor()` correctly hides. Spicebomb still has no alternative and the reason is on the record.
- **Three flankers refused:** INTRINSIC (Acqua di Gio **Profondo**), TANTALIZE (Armani Code **Profumo**), STUNNING (Delina **Exclusif**). A flanker is a different fragrance; pairing it to the base misstates which bottle the alternative is for. The matcher will keep proposing these — `scripts/match-feed-pairings.mjs` also matched "the scent of self-assurance" in a *description* to Hugo Boss The Scent, so **read the title, not the prose.**

**Where a diff is vocabulary, not composition, the verdict says so.** We never rewrite a seller's word into ours, so several diffs overstate the gap: **pelargonium IS geranium** (HARMONY), **litchi IS lychee** (PRECIOUS — and our own catalogue spells it "Lychee" on Chloe but "Litchi" on Delina), ambrette/ambrette seed and seaweed/red algae (NATURE), wild strawberry vs strawberry (SWEET), pineapple leaf vs pineapple (LEGENDARY). Each understates the score, which is the safe direction. **The catalogue's own spelling inconsistency is worth fixing on its own merits** — it is currently costing real matches.

**AFTER EXACT MATCHING, FUZZY THE LEFTOVERS — two listings were nearly lost to spelling.** The feed writes `CHANEL COCO MADEMOISLLE` (one L short) and `GIVNCHY LINTERDIT`, so exact matching rejected both even though `coco-mademoiselle` and `linterdit` are in REFERENCES and were uncovered. A Levenshtein pass over the unmatched inspirations found them at edit distance 1. Make that a standing step before concluding an original is absent — but **read every hit**, because short reference names generate noise (`"d"` vs `"k"` matched half the list).

**SEDUCTIVE (Coco Mademoiselle) was found that way and still not shipped, for a different reason worth knowing: this merchant's flat list is not always in pyramid order.** Its five materials are published "Patchouli, Bergamot, Lemon, Rose, Jasmine" — patchouli, a base material, first. The splitter only makes two cuts and preserves the merchant's order, so every legal split puts patchouli in the **top**, which is visibly wrong to any reader who knows the material. A listing that prints an obviously wrong pyramid costs more credibility than one missing listing gains. AUDACIOUS (L'Interdit) came from the same fuzzy pass, splits cleanly 1/3/3, and did ship.

**The same order assumption is doing quiet damage elsewhere and should be reviewed.** FIERY (Fahrenheit) puts sandalwood in the heart and lily of the valley in the base; GLIMMER (Velvet Orchid) puts magnolia and orange blossom in the base. Those are artefacts of an order-preserving split over a list the merchant did not order pyramidally, not claims we would make. Worth a pass once the scoring change lands.

**These 24 have no photographs yet.** `scripts/fetch-dupe-images.mjs` regenerates the whole manifest and therefore needs *all three* feeds present; only `aromapassions.csv` was re-downloaded. They render the generated note-signature mark until `opulensi.csv` and `clone-of-perfume.csv` are back, at which point one run fills them in. `imageUrl` was **not** hand-set — that is what the generated manifest exists to prevent.

Listings carry `offers: MerchantOffer[]` — one entry per retailer, each with that retailer's own price, in that retailer's own currency, **never converted**. This replaced a singular `merchantListing` plus a listing-level `affiliateLinkId` on 2026-09-01. The old single-retailer shape forced the UI to explain in prose why the one price it showed disagreed with the per-ml figure beside it; several retailers side by side says it without a paragraph. Offers are **deliberately not sorted** — ranking £19.99 against $34.00 is an FX claim, and there is no sourced rate to make it with.

Why they were emptied: the listings named products (`Dossier Ambrosia`, ALT.'s `Bright` and `Blue Cedar`) that **do not exist**, attributed to real operating companies — verified against those companies' own storefronts. `lib/reviews.ts` held six invented reviews with human names, star ratings and dates about the same real companies, including a negative one, rendered with an aggregate average and no on-screen fixture label. That is FTC Fake Reviews Rule and trade-libel territory, not a tidiness problem.

**Do not hand-write entries back into any of the three.** If a product name cannot be verified on the producer's own storefront right now, it does not go in. Real listings arrive with an affiliate product feed (`FINALIZATION-GUIDE.md` phase 3 → 4), which is also the lawful imagery source discussed below. That is how all thirty-two that exist arrived, and it is the only route in.

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

The site now has **200 references and 79 listings across 65 references** (Aventus carries six competing listings, Oud Wood four, Angels' Share and Baccarat Rouge 540 three each, and most covered originals have exactly one — which is what the ranking tie-breakers exist for), so **135** references still render the "alternatives" empty state — that is the normal case, not a bug. The house-product plumbing (`components/dupe-finder/house-badge.tsx`, the scoring constraint in `lib/verification.ts`) is intact and still has nothing to render: there are deliberately no house products.

The previously-documented problem of *our own product ranking #1 on Baccarat Rouge 540* is now **half solved, and it matters which half.** Fixed 2026-08-27: a house product can no longer publish an uncapped score, so it cannot show a number that only independent verification earns, and the ranking can no longer invert against the displayed percentages. **Not fixed, and not fixable in code:** a house product whose declared notes are written to sit close to the reference will still legitimately out-rank honest third-party listings, because the formula only sees the data it is given. That is a data-authorship problem. Whoever repopulates `DUPES` owns it — write house listings as honest formulation compromises, the way the same three products were written before, when our bottles ranked *last* on Aventus and Sauvage. The COO's launch recommendation stands: **ship with no house products at all until Awin approves**, because a merchant reviewer seeing us rank first on our own comparison is the rejection.

### The fourth merchant, 2026-09-07 — the first on the ORIGINALS side, and a different network

**FragranceShop.com** (CJ advertiser **16941446**, our CID **101873278**), `fragranceshop.com`, US/USD. A New Jersey discount retailer of GENUINE designer fragrances, trading since 1998, grey-market/parallel import — which is how the prices are low. **It is NOT `thefragranceshop.com` or `thefragranceshop.co.uk`**, two unrelated companies with near-identical names, one of them a dupe house. Identify a merchant by the domain in its network account record, never a name search.

This is the merchant that finally makes "buy the original" work. Before it, **all 200 references declared `affiliateLinkId: "original-<slug>"` and not one resolved**, so `hasRealAffiliateLink()` suppressed the button site-wide. Now **116 resolve**, and the same feed supplied **116 bottle photographs** from a live programme.

`scripts/ingest-cj-feed.mjs` → `lib/data/cj-offers.generated.ts` + `lib/data/cj-links.generated.ts`; `scripts/fetch-cj-images.mjs` → `public/images/fragrance-cj/` + `lib/data/cj-images.generated.ts`. Matching rules live in `scripts/lib/product-matching.mjs`, shared going forward.

Six things generalise, and most are traps:

- **OUR ORIGINALS MERCHANT IS ALSO A DUPE SELLER.** 1,213 of its 5,802 rows — 21% — are titled `<Real Fragrance> - Type Perfume Oil 1 oz Roll-on` at $7.95–$13.95. "Type" is the dupe trade's own word. Matching one as the original would link a $9 knock-off oil as the genuine article on a site whose entire pitch is telling those apart. `NOISE_WORDS` deliberately excludes `type`/`oil`/`roll`/`on` so they fall out as leftover, and that is why Green Irish Tweed, Oud Wood, Neroli Portofino and Royal Oud are unmatched rather than cheaply matched. **Do not "fix" those.**
- **THE FEED'S SCHEMA IS NOT WHAT THE SAMPLE SAID.** CJ's format sample had 66 columns; the real export has **87**. Nothing is shared with Awin's naming (`TITLE`/`LINK`/`PRICE`/`IMAGE_LINK` against `product_name`/`aw_deep_link`/`search_price`/`merchant_image_url`). Read the delivered header, never a sample or a doc.
- **THIS FEED CARRIES BOTTLE SIZE, WHICH THE AWIN ONE NEVER DID.** 99.4% of titles end in a stated volume. That is the documented reason `priceUsd` was never ingestible — a price detached from its volume makes the per-ml claim wrong on the page. Sizes must **snap to nominal**: "3.4 oz" is the 100 ml bottle, and converting literally gives 101, which then fails to equal our own `bottleMl` and silently loses the match. 80 of the 101 offers carry a price tied to a volume equal to ours; the other 21 record `null` rather than a figure spanning an unknown size.
- **THE MERCHANT DISCOUNTS HARD, AND THAT COLLIDES WITH OUR OWN PRICE FIELD.** `ReferenceFragrance.priceUsd` is an approximate US **retail** figure; FragranceShop sells at roughly 0.3–0.6x of it, and **34 of the 80 comparable prices are more than 40% apart** (Obsession: ours $76, theirs $21.95). The old button read "Buy the original - $76" and would have landed on a $21.95 page — a false price claim on a link we earn from. `getOriginalOffer()` in `lib/catalog.ts` is what surfaces the retailer's own price instead. **`priceUsd` is deliberately NOT overwritten with it** — see that function's docstring; the short version is that one discounter's price is not retail, and swapping it in would silently redefine the field the moment a second originals merchant lands.
- **A WAF CAN BLOCK ON TLS FINGERPRINT, NOT ON HEADERS.** `fragranceshop.com` returns **403 to Node's `fetch` with any User-Agent** — real Chrome UA included — and **200 to `curl` with our own bot UA**. So `scripts/fetch-cj-images.mjs` shells out to curl. The first reading of this was "rate limiting", because a single hand-run curl succeeded where the batch failed; that was wrong and cost a pointless backoff-and-retry pass. The same 403 means `check-affiliate-links.mjs` cannot verify these destinations at all — it reports them **inconclusive, explicitly not a pass**, because a WAF 403 and a dead product page are indistinguishable.
- **CJ ATTRIBUTION IS NOT AWIN ATTRIBUTION.** CJ pre-wraps the deep link in the feed (no link to build) and **obfuscates the query it forwards**, so the sub-ID is unreadable from the redirect chain — the hop carries `i6wr%3D25wuw1oz__oq48o-rw-uw2`, which is `sid=original__acqua-di-gio` under their substitution. What is checkable automatically is the `cjevent` token CJ stamps on the destination. That the **sub-ID** is recorded against it needs one confirmation in CJ's own click report, the same founder-side check already done for Awin 117395.

**Two matcher bugs were found by this feed and both would have cost real matches silently.** (1) The guard that stops "Angel" matching "Angel Nova" was built from other references' name words — and we list "Le Male Le Parfum", which put `parfum` into that set while every CJ title contains "Eau de Parfum Spray". It rejected **all 5,802 rows against all 200 references**; the ingest matched zero. Awin abbreviated to "EDP" and never tripped it. (2) `BRAND_SYNONYMS` mapped `"viktor and rolf"` → `"viktor&rolf"`, but every lookup compares `norm()` output and `norm("Viktor&Rolf")` is `"viktor and rolf"` — so Flowerbomb and Spicebomb had exact rows in the feed and failed the brand gate. Both maps are now normalised programmatically so a hand-written raw value cannot do it again.

**Coverage is 101/200, and ~60 of the gap is structural.** FragranceShop carries no Chanel (14 refs), Parfums de Marly (13), Byredo, Le Labo, Xerjoff, Initio, By Kilian, Amouage, Roja, Jo Malone or Louis Vuitton at all — it is a designer discounter, not a niche house. Of the rest, most are genuinely not stocked, ~10 exist only as "type" oils, and the remainder are flankers the matcher correctly refuses (Stronger With You *Intensely*, Born In Roma *Coral Fantasy*, The Most Wanted *Intense*). Run `node scripts/ingest-cj-feed.mjs` — it prints the split by cause rather than one undifferentiated list.

**One recovered by fuzzing, and it was the most valuable of the lot.** The merchant misspells **"Maison Francis Kurkdijan"** (an extra i), so brand matching read MFK as not carried — hiding **Baccarat Rouge 540**, which has three dupe listings and its own guide. Found only by running the standing "fuzz the leftovers" step over the *houses* the ingest reported absent, not just over product names. It was the single true hit; `roja` sits within edit distance 3 of seventeen unrelated brands, so **read every hit**.

**`node scripts/ingest-cj-feed.mjs --candidates`** lists EDP rows over $100 matching no reference we hold — 66 of them, as a shortlist for catalog expansion. It deliberately **writes nothing**: a new original needs hand-authored notes, facets and a family, none of which a feed supplies. Bond No. 9 alone accounts for a dozen, and Tom Ford Noir Extreme is the most obvious single omission.


### The buy-link scope and the 17 researched additions, 2026-09-07

**Founder's scope:** every FragranceShop product that is **EDP or Parfum** (never EDT or EDC) and **over $100**. That is **103 products**, and all 103 now carry a working affiliate link. `/go/` resolves **252** ids — 116 `original-*`, **59 `shop-*`**, 77 `dupe-*`.

**`/originals` is a new surface and it is NOT the catalogue.** `app/originals/page.tsx` lists all 103 with name, house, concentration, size, price, photograph and a buy link — and **nothing else**, because the feed supplies nothing else. No note pyramid, no facet profile, no match score. 44 of the 103 ARE references we hold; those cards link to the comparison page instead of straight to the shop. The other 59 say plainly on the page that we have not analysed them. Data: `lib/data/cj-shop.generated.ts` (`ShopOriginal`, deliberately a different type from `ReferenceFragrance`). **Do not add editorial fields to it** — a fragrance that earns a note pyramid earns a place in `lib/data/houses/` instead.

**17 references were added with RESEARCHED pyramids**, taking the catalogue 200 → **216**: Noir Extreme, MYSLF, Libre Intense, Donna Born in Roma, Guilty Oud, La Nuit Tresor, Samsara, La Panthere, Acqua di Gio Profondo, Original Santal, Himalaya, Neroli Sauvage, Shem, Acqua di Parma Oud, Her Elixir, 1 Million Elixir. Each pyramid was looked up per fragrance; **the feed has no note data at all** — its `DESCRIPTION` column is byte-identical to `TITLE` on all 5,802 rows. Their `priceUsd`/`bottleMl` are the RETAILER'S figures for the bottle actually stocked, which is why some are odd sizes (Samsara 30ml, Himalaya 250ml).

**Four were researched and then dropped rather than guessed**, and the reasons are the useful part: J'adore L'Or (sources give marketing prose, no tiered pyramid), Versace Vanitas (sources conflate the 2011 EDP with the 2012 EDT), Creed Royal Water (sources openly disagree on heart and base), and **Sauvage Parfum** — which fails for a structural reason: this merchant sells every Sauvage concentration as a SIZE VARIANT of one product page, so no feed-driven matcher can tell it from Sauvage EDT. **Scandal Pour Homme Le Parfum** was dropped for a related reason worth knowing: FragranceShop sells a men's *and* a women's "Scandal Le Parfum" whose names are identical once the gender tag is stripped, so a reference would match both and take the cheaper.

### THE COMPARISON NOW RUNS ON THE RETAILER'S PRICE — a founder decision, and it moved real numbers

`getOriginalPricing()` in `lib/catalog.ts` is the single resolver: the shop's own price where we have one for a bottle size we know (**97 of 216** references), our hand-maintained approximate-retail figure otherwise (119). `valueMultiple()` takes it as an override; every surface passes it. The page shows ONE price per bottle and labels which kind it is.

Two things this fixed and one it exposed:

- The buy button used to read **"Buy the original - $76"** while linking a page charging **$21.95**. A price beside a buy button must be the price at its far end.
- **`priceUsd` on the reference is still NOT overwritten.** It remains an approximate-retail figure and the fallback for the 119 references no retailer here stocks. Swapping it wholesale would redefine the field the moment Perfumania lands.
- **26 dupe claims changed wording, and 6 of them stopped being savings.** Mesmorize vs Armani Code and Blossom vs Gucci Bloom now read "no cheaper"; Erotic vs Eros, Uplifting vs Light Blue, Legendary vs Legend and Harmony vs Terre d'Hermes read "**Nx more expensive**". That is the honest outcome of comparing against a discounter, `describeValueMultiple()` already had the vocabulary for it, and **nothing was adjusted to compensate**. Verified against the shipped functions (`npx esbuild ... --alias:@=.`): zero claims say "cheaper" while not being cheaper.

**Do not "verify" that with `text.includes("cheaper")`.** `"no cheaper"` contains `"cheaper"`, so the naive check reports false failures — it did, on the first run. Match the claim shape (`/^[\d.]+x cheaper$/`).

### THE MERCHANT'S TITLE GRAMMAR IS LOAD-BEARING, AND MISREADING IT LINKED THREE FLANKERS

CJ titles are `<Brand> <Product Name> <Gender tag> - <Format> <Size>`, and 5,801 of 5,802 end their head segment with a gender tag ("Perfume for Women" 3,127, "Cologne for Men" 2,042, "Perfume for Unisex" 488).

Because that tag contains the word **"Cologne"**, `cologne` sits in the shared `NOISE_WORDS` — and that silently absorbed it when it was part of a PRODUCT name. FragranceShop sells "Creed Viking" ($251.95) **and** "Creed Viking Cologne" ($202.95) as separate products, because they are different fragrances. The matcher took the cheaper one. **We were linking the flanker as the original**, and the same trap hit "Creed Aventus Cologne" and "Eternity Cologne". A fourth case had no "cologne" in it at all: `le-male` was matching **Le Male Le Parfum**, because `le` is a noise word and `parfum` a concentration word, and FragranceShop stocks no plain Le Male whatsoever.

`productNameOf()` in `scripts/ingest-cj-feed.mjs` now strips the gender tag and the format tail BEFORE matching, and passes a reduced noise set (`opts.noiseWords`) plus an empty concentration set (`opts.concentrationWords`) so that a surviving "cologne" or "parfum" is read as what it then is: part of the name, and proof of a different product. **Both overrides are load-bearing — dropping either re-opens the hole.** One consequence to expect: stripping the tail also hides "TESTER" and "Unboxed" from the leftover rule, so `NOT_RETAIL_BOTTLE` guards those explicitly on the full title.

### The fifth merchant, 2026-09-09 - Perfumania, read off the STOREFRONT because its feed was the wrong catalogue

Perfumania.com, CJ advertiser **17335854**, publisher 101873278, our second originals-side merchant.

**Its CJ feed is useless and that is the headline.** The delivered export ("Like product feed", 66 rows) is Perfumania's own in-house dupe line - nine private-label brands, **zero designer stock**. The storefront carries **4,380 products across 480 vendors**. The feed is 1.5% of the shop and none of the part we need, so `scripts/ingest-perfumania.mjs` reads the shop directly and no feed is involved. **Do not judge a merchant by the feed it happens to send.**

Three Shopify endpoints behave differently and the crawl depends on picking the right one:

| endpoint | behaviour |
|---|---|
| `/products.json` | caps at 250 and **silently ignores `since_id`** - paginating returns the same 250 rows forever while looking like it works |
| `/collections/all/products.json?page=N` | paginates correctly. 18 pages, 4,380 products, matching `sitemap_products_*.xml` exactly. **Use this one.** |
| `/search/suggest.json` | **fuzzy and unstable** - it returned Armani Code Profumo for a query about YSL Tuxedo, then omitted it from a query for its own name. Never conclude "not stocked" from it. |

An empty page under throttling is not the end of the catalogue, so the crawl retries before believing one. The result caches to `scripts/feeds/perfumania-storefront.json`, which is gitignored like every feed and **does not travel** - re-run with `--refresh` on another machine.

**Deep links are BUILT here, not delivered.** CJ pre-wraps links inside a feed; this merchant's usable catalogue is not in its feed at all, so the click URL is assembled as `dpbolvw.net/click-101873278-17335854?url=<encoded product URL>`. Verified against a product deliberately chosen from OUTSIDE the feed: the hop lands carrying `AID`, `PID`, our `SID` and a `cjevent` token. **That the click is stamped is proven; that the programme pays on deep links is a dashboard question and stays a founder check**, exactly as for 16941446.

#### Two retailers per bottle, and the key collision that nearly ate one

91 references are stocked by both merchants. `affiliateLinks` is one flat map, so the two link sets **must not share a key prefix** - they briefly both used `original-<slug>` and collided on 91 of 123 keys, where the spread order silently decided which retailer survived and the other's links vanished with no error anywhere. The namespaces now are:

- `original-<slug>` FragranceShop reference links
- `pm-<slug>` Perfumania reference links
- `pmshop-<handle>` Perfumania `/originals` shop products

`getOriginalOffers()` in `lib/catalog.ts` is what puts them back together for display. **Retailers are deliberately unranked and nothing is labelled cheapest**: a price is only comparable when both quote the same bottle, and 24 of the 91 pairs do not. `scripts/generate-redirects.mjs` reads all three link files - **add a fourth source there too or its buttons resolve in the UI and 404 at the edge.**

#### CJ's `am.js` deep-link automation: it ANSWERED the permission question, and we still do not install it

CJ generates an include at `anrdoezrs.net/am/<websiteId>/include/joined/impressions/page/am.js`. Ours resolves to a real 8 KB script whose first line is the answer to a question that cost a session of research:

```js
var domains = ['perfumania.com','www.perfumania.com'];
var websiteId = 101873278;
var generateLinkOnLoad = false;
var sid = undefined;
```

**That settles deep-link permission for 17335854.** CJ built this for our publisher id, under a path segment reading `joined`, scoped to exactly one advertiser - so Perfumania is enrolled AND supports deep link automation. It also reassures on link shape: the script's own format is `tracking-ams5.cj.com/links/<websiteId>/type/am/sid/<sid>/<dest>`, which is NOT what we build, but what we build (`dpbolvw.net/click-<PID>-<AID>?url=`) is the format CJ itself delivered in that merchant's feed. Note FragranceShop is absent from `domains` - either 16941446 does not support automation or it is not enabled. Neither affects us.

**Do not add the script to the site.** Four reasons, and the first one is not a preference:

1. **It would force a consent banner.** Its actual job here is page-wide impression tracking: a `withCredentials = true` POST to `tracking-ams5.cj.com/pageImpression` carrying **every `<a href>` on the page**, whose response is a list of third-party pixels it then injects into the DOM. That is cross-site tracking with cookies. `components/kit/Analytics.tsx` is deliberately cookieless (`client_storage: 'none'`) and **that is the stated reason this site carries no KVKK/ePrivacy consent banner.** Installing this revokes that reasoning; the banner would follow.
2. **It does not even link.** `generateLinkOnLoad = false` in the config CJ generated for us.
3. **`sid = undefined`.** It carries no sub-ID, so we would lose the `pm__<slug>` / `pmshop__<slug>` split that tells us which page earned a click.
4. **We have no plain merchant URLs to rewrite.** Deep link automation exists for sites that link out with bare URLs. Every link here is built at ingest time and routed through `/go/`, already tracked and already sub-ID'd.

Use the include as evidence. Read its first line whenever the "does this advertiser allow deep links" question comes up for a new CJ merchant - it is cheaper than any dashboard hunt.

#### THE MERCHANT'S NOTE TAGS LOOK LIKE A GOLDMINE AND ARE NOT - THIS IS MEASURED

1,829 of the 4,380 storefront products carry `topnote_ / middlenote_ / basenote_` tags: a real three-tier pyramid, machine-readable, on 276 brands. It reads like a solution to the missing-originals backlog. **It is not, and the numbers are on disk rather than a hunch:**

- Against the **90** fragrances where we hold a researched pyramid AND they publish one, the two agree on only **0.57** of the materials named - before you even ask which tier they sit in. Only **5 of 90** match exactly, **19** fall below 0.4, and one shares **nothing at all**.
- Separately, **59% of the merchant's own duplicate SKUs contradict themselves.** Paco Rabanne 1 Million carries **four different pyramids across four SKUs**; three are wrong, one of them describing an aquatic that is not 1 Million.

So `pm-offers.generated.ts` captures `declaredNotes` for research, and **nothing writes it into a reference's pyramid.** A fragrance that earns a note pyramid earns a hand-authored place in `lib/data/houses/`. Publishing these would put false note data about real, named products on indexed pages - the exact failure the placeholder-reference rule exists to prevent.

#### The shop scope is narrower than FragranceShop's, and the extra rule is about honesty not tidiness

Same founder rule (EDP or Parfum, over $100, no testers or sets) plus two exclusions:

- **The merchant's own private-label brands** - the nine names in its "Like product feed". That feed IS the house dupe line, so each is proven in-house **by the merchant's own data**, not by our judgement.
- **Houses our reference catalogue does not already cover.** 413 products clear price and concentration; **193 come from a house we have researched**. The rest include names we cannot distinguish from a retailer's private label without research we have not done (Michael Malul, Daniel Josier, Camille Rochelle, NOTEZ, Patek Maison, Thauy, 93 Mil), and `/originals` calls its contents "genuine designer fragrances". Declaring a real company a house brand without proof is its own false claim, so the rule avoids per-brand judgement entirely: **we list other bottles from houses we already vouch for.**

The price test is the **cheapest** variant, not the cheapest one above $100. Those differ - a bottle sold at $80 and $120 passes the looser test and is then shown at $120, quoting a higher price than the shop's own entry price for the same fragrance.

#### Images: the Accept header is load-bearing

Several masters are 2000x2000 PNGs of ~1.9 MB against an existing corpus averaging 33 KB. **Shopify's documented format parameters are all ignored on this endpoint** - `?format=jpg`, `?fm=jpg`, `_900x` in the path, and swapping the extension 404s. Content negotiation is the only lever that works: `Accept: image/webp` turns 1,953 KB into 145 KB. Both fetch scripts send it. `wood-sage-sea-salt` has a genuine 250x383 master, far below this merchant's usual 1200-2048px and not upscalable; it ships because a small real photograph beats none, and it is the first to replace if another live programme carries Jo Malone.

## Content: `comparison` and `review` just became writable, but their routes are still deleted

`content/schema.ts` defines three types, and the difference between them is a hard gate, not a formality:

| Type | Requires | Writable today? |
|---|---|---|
| `guide` | `featuredProducts` **optional** | ✅ |
| `comparison` | `products` — min 2 `productRef`, each with a **mandatory** `affiliateLinkId` | ⚠️ schema satisfiable, route missing |
| `review` | `product` — one `productRef`, **mandatory** `affiliateLinkId` | ⚠️ schema satisfiable, route missing |

The gate was never about the schema being strict for its own sake: with `affiliateLinks` empty, a comparison or review had to **invent a product to point at** — the exact failure Phase 0 spent a day undoing.

**What changed, 2026-09-01, grew on 09-02, grew three times on 09-03 and again on 09-04:** `affiliateLinks` now holds **77** real, *tracking* dupe links across **three** merchants (30 Opulensi/123248 + 9 Clone of Perfume/117395 + 38 AromaPassions/34989), so a comparison or review anchored on any of 79 listings across 65 originals can name a real product with a real link. The two dupe houses that sell direct help disproportionately: every one of their offers is in stock, and between them they cover nineteen originals that had no alternative to write about at all. **Two things still stand between that and a published piece, and both fail loudly rather than quietly:**

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


### The 24 missing dupe photographs were not a feed problem, 2026-09-07

This file previously said the 24 AromaPassions listings added on 2026-09-05 could not be
illustrated because `fetch-dupe-images.mjs` "needs all three feeds present". **That diagnosis was
wrong, and it is the reason the gap sat there for two days.** The script needed exactly one feed —
`aromapassions.csv` — and that file was on disk the whole time.

What actually blocked it: the loop read a merchant's feed **before** checking whether the image was
already downloaded. The Opulensi and Clone of Perfume feeds had expired off disk, and `loadFeed()`
throws, so the run aborted on the very first entry — even though all 53 of those images were already
present and every one of those entries would have been skipped a line later.

The fix is an ordering change: check the filesystem first, and treat a missing feed as **that
merchant's** failure rather than the run's. A feed is now only read when something actually needs
downloading from it, and an absent one is reported per-slug instead of killing the process. Feeds
are gitignored and expire; a script that services several merchants must degrade to the merchants it
can still serve.

**All 24 images came from the live-page fallback**, not the feed — every `merchant_image_url` in the
AromaPassions export 404s, exactly as the first 14 did on 2026-09-04. That rescue path is doing the
real work for this merchant, not covering an edge case. Verified after the run: 77 files, 77 distinct
checksums, none under 47 KB, and all 24 slugs present in the built JS bundle.

**Where the remaining gaps genuinely are, and why none of them is fixable here:**

- **2 dupes** (Club de Nuit Sillage, Urban Man) — carried only by the closed My Perfume Shop
  programme. No live relationship, no licence. Correct as-is.
- **26 references** — checked against the full 5,802-row CJ feed on 2026-09-07 and **not one is
  genuinely stocked**. Every apparent hit is the merchant's own dupe oil (`Armani Code Profumo -
  Type Perfume Oil`), a flanker (`The Most Wanted Intense`), or a brand collision (`Al-Rehab` for
  Initio Rehab, `Kim Kardashian True Reflection` for Amouage Reflection Man). The houses are the
  ones FragranceShop does not carry at all: Chanel, Parfums de Marly, By Kilian, Xerjoff, Initio,
  Roja, Amouage, Jo Malone. **A second originals merchant is the only route**, and Perfumania is a
  mass-market designer discounter — expect it to cover Chanel poorly and the niche houses not at all.
- **1 shop product** (Marc Jacobs Oh Lola Sunsheer) — the merchant offered only a shared stock
  photograph, which `remoteImageUrl: null` records deliberately. Null means "no image", never
  "use a placeholder".

## Product imagery — the block lifted for some of the catalog, and the licence rides on the link

Perfume bottles are protected trade dress. There are exactly two lawful sources: imagery supplied by an affiliate programme we've enrolled in, or photography of bottles we own. Generating bottle renders is ruled out by `departments/web-development/CLAUDE.md`'s trademark caution; reusing a retailer's photo is infringement. **That has not changed** — what changed is that we now have feeds.

| | Images | Source |
|---|---|---|
| `REFERENCES` (216) | **190** | **116** FragranceShop.com CJ feed → `scripts/fetch-cj-images.mjs` → `lib/data/cj-images.generated.ts`, plus **74** still only in the My Perfume Shop feed → `scripts/fetch-feed-images.mjs` → `lib/data/feed-images.generated.ts`. `lib/data/references.ts` prefers the CJ copy where both exist. Shop-only products have their own directory again (`public/images/originals/`, 58) and their own manifest. **26 references still have no photograph** — mostly houses neither merchant carries (Xerjoff, Initio, By Kilian, Amouage, Roja). |
| `DUPES` (79) | **77** | Opulensi (30), Clone of Perfume (9) **and** AromaPassions (38) → `scripts/fetch-dupe-images.mjs` → `lib/data/dupe-images.generated.ts`. Only the two Armaf listings lack one, and that is correct — see the rule below. |

Both are merged in as `imageUrl` at module load (`lib/data/references.ts`, `lib/dupes-data.ts`) — **`imageUrl` is never hand-set on a data entry**, because a hand-set path leaves nothing in the diff to say where the picture came from.

**The rule the dupe script enforces, and the one to apply to any new merchant: the licence rides on the affiliate relationship, not on the picture.** An image is only taken for a product whose merchant programme actually *tracks*, and whose listing carries a real `affiliateLinkId` to that merchant. That is why Club de Nuit Sillage and Urban Man have no photograph — they exist only in the closed My Perfume Shop feed, so there is no live relationship to justify hosting their imagery. `scripts/fetch-dupe-images.mjs` reports (never deletes) any file in `public/images/dupe/` it does not claim, so an orphan is visible rather than silently retained.

**That open question is now mostly closed, 2026-09-07 — and this is the worked example of the rule.** All 156 reference images came from My Perfume Shop, whose programme went closed for tracking on 2026-09-01, so they were hosted on the strength of an enrolment that no longer earns. The FragranceShop.com CJ feed re-sourced **101** of them from a programme that is live and that every one of those fragrances now carries a working `original-<slug>` link to. `lib/data/references.ts` prefers `CJ_IMAGES` over `FEED_IMAGES` for exactly that reason, and the preference is documented at the merge rather than left implicit.

**73 images still come from the dead programme** and stay flagged: they are fragrances FragranceShop does not carry at all (13 of the 14 Chanels, all 13 Parfums de Marly, Byredo, Le Labo). No live merchant we hold can replace those, so the honest position is unchanged rather than pretended away — a fourth merchant carrying niche houses is what would close it.

**A feed's `merchant_image_url` goes stale exactly like its prices do — proved 2026-09-04.** Every one of the AromaPassions rows' image URLs 404s: the shop re-uploaded its photography and Shopify CDN paths are content-addressed, not stable. `scripts/fetch-dupe-images.mjs` now falls back to the merchant's own product JSON (`<merchant_deep_link>.js` → `featured_image`) and **reports which images it rescued that way**, so a rotting feed is visible rather than silent. This does not loosen the licence — it is still the enrolled merchant's own photograph of the product the affiliate link is built from, taken from a fresher URL of theirs. Do not assume the other two feeds are immune; they are merely untested.

`components/fragrance/fragrance-image.tsx` renders the generated per-fragrance colour mark (`lib/fragrance-visual.ts`) wherever `imageUrl` is absent. Every surface routes through that component — don't bypass it, and pass `imageUrl` through when adding a new call site or that surface silently shows placeholders next to real photos.

**Images are committed.** `public/images/` is **407 files** as of 2026-09-07 — 156 in `fragrance/` (My Perfume Shop), **116 in `fragrance-cj/`** and **58 in `originals/`** (both FragranceShop.com), **77 in `dupe/`**. **209 are tracked**; the 174 FragranceShop files are untracked pending review. `scripts/fetch-cj-images.mjs` REPORTS orphans rather than deleting them — a shop product that becomes a reference leaves its old copy behind, which is the usual cause. Re-measure rather than trusting either number:

```bash
find public/images -type f | wc -l          # on disk
git ls-files public/images | wc -l          # tracked
```

The hazard the old wording described is real and still worth knowing, it just is not the current state: if the images are absent from the tree the deploy builds without them, and because the manifests are what reference them the result is a **build error rather than a silent 404** — the better of the two failures, but neither is shippable. Commit new images in the same change as the listings that reference them.

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

- **`/go/` now resolves 252 ids, not 77 — and they come from TWO files.** 77 hand-written `dupe-<brand>-<product>` entries in `lib/affiliate-links.ts` (30 Opulensi + 9 Clone of Perfume + 38 AromaPassions), plus **116 `original-<slug>` and 59 `shop-<slug>` entries in `lib/data/cj-links.generated.ts`**, regenerated from the FragranceShop.com CJ feed by `scripts/ingest-cj-feed.mjs` and spread into `affiliateLinks` at module load. `scripts/generate-redirects.mjs` and `scripts/check-affiliate-links.mjs` **both read both files**; adding a third source means editing both scripts, or its links resolve in the UI and 404 at the edge. Everything else still 404s. Both halves are correct. Confirm the count from the file, not from here — this line has been stale more than once already, and `grep -c 'deepLink:' lib/affiliate-links.ts` is itself an unreliable way to check it: that pattern also matches the `deepLink: string` field on the `AffiliateLinkEntry` interface and the one hand-built inside `resolveAffiliateLink()`'s placeholder fallback, so it over-counts by two. Read the real number off `node scripts/check-affiliate-links.mjs`'s own header line (`checking N link(s) across M merchant(s)`, which now also prints the per-advertiser split) instead — it parses this file with the same regex `generate-redirects.mjs` uses to build `_redirects`. Buy buttons refuse to render unless `hasRealAffiliateLink()` resolves, so no visitor can reach a placeholder. The generator **fails the build** if an entry lacks a `deepLink` or `subId`, or names a network with no sub-ID parameter — an untagged click is unattributable forever, so it must never ship quietly.
- **Sub-ID attribution still works** (`FINALIZATION-GUIDE.md` §3.5). The scheme is deterministic, so it bakes into the destination URL at build time instead of being composed per request. What is genuinely lost is *our own* server-side click logging — there is no server. The fix, when it matters, is a `main` Worker script in the root `wrangler.jsonc` handling `/go/*`. **Gotcha for that day: `_redirects` rules are NOT applied to requests served by Worker code**, so move the mapping into the script rather than leaving both and guessing which wins.
- **Unresolved compliance question, unchanged:** Amazon's Associates agreement bars obscuring the source site "including by use of Redirecting Links" — exactly this pattern. Probably fine where attribution is preserved, but unverified, and the penalty is account termination. See `departments/communication/reports/amazon-associates-application.md` §2 before shipping an Amazon link.

## The independence posture is load-bearing

The site brands itself "Independent Fragrance Comparisons" while selling its own fragrance line inside the comparisons and (eventually) charging producers to list. Several things exist specifically to keep that claim true:

- House products are ranked by the same formula as everyone else and are **not** floated to the top; ties break toward the cheaper bottle, not toward us. `components/dupe-finder/house-badge.tsx` discloses which listings are ours.
- No subscription tier may affect rank or score. See `PRODUCER-PROGRAM.md` §3/§7.
- **Claims on `/about` must match what the code actually does.** This has already gone wrong once: the page claimed facet ratings were our own judgment "made while wearing each fragrance side by side," which stopped being true the moment producers could submit their own. If you change how scoring or data provenance works, update `app/about/page.tsx` in the same change.


- **The retailer band on the home page is a DISCLOSURE, not a logo wall, and the wording is the whole point.** `components/home/retailer-band.tsx` names the five retailers we earn from, under a heading that says exactly that. It must never become "Partners", "Sponsors", "As featured in" or anything similar, and it must not carry their logos: no such relationship exists in either direction, none of these companies has reviewed anything here, several of them sell products this site rates against each other, and an affiliate agreement does not grant logo usage. Framed honestly it strengthens the independence claim; reframed as a partner strip it would assert an association we do not have. `shared/clients.md` records that Sirketim currently has **no third-party clients at all** - every entry is internal - so there is nobody whose logo could legitimately appear.
- **The list is derived from `affiliateLinks`, never hand-typed** (`lib/merchants.ts`). A hand-typed list goes stale in the direction that flatters us: a programme closes and the site keeps advertising it. My Perfume Shop is exactly that case - still enrolled, still feeding us data, every link dead - and it must never appear. `getLiveMerchants()` throws if a live link points at a merchant with no registry entry, because a retailer we earn from has to be nameable on `/disclosure`.
- **`/disclosure` had claimed there were "no affiliate links on this site at all" since long after that stopped being true** - fixed 2026-09-09, and worth remembering as the shape of the failure: a page written when it was accurate, never revisited when the code moved under it. It now renders the merchant list from the same derived source as the band, so the two cannot drift apart.
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

**The review and comparison routes are recoverable from git history** (`git log --oneline -- "app/review/[slug]/page.tsx"`). Restore them the moment `content/review/` or `content/comparison/` has a real piece in it — but see the content constraint: neither type can be written honestly until `affiliateLinks` holds real entries, because `content/schema.ts` requires a `productRef` with a mandatory `affiliateLinkId` on both. **That constraint is now satisfiable** — 77 links exist across three merchants — so restoring these two routes is the actual next step for content, not a someday item. (My Perfume Shop is not what unblocked it: it's an originals retailer *and* its programme is closed. Opulensi did, and Clone of Perfume widened it.)

**Next.js 14.2.35 is pinned and still constrains options.** `@opennextjs/cloudflare` ended Next 14 support in Q1 2026 and `vinext` targets Next 16, so running this as a *Node app* on Cloudflare would mean upgrading Next first. The static export sidesteps that entirely — which is the point.

## Canonical URLs and the contact address go through `lib/site.ts`

`lib/site.ts` is the single source for the site origin (`siteUrl()`, `absoluteUrl()`) and the public contact address (`CONTACT_EMAIL = contact@counterscent.com`, a real monitored inbox since 2026-08-27). Both are **constants with real defaults, not env vars**, deliberately: a forgotten deployment setting would otherwise ship canonicals pointing at a placeholder host, which is invisible in review and expensive in search results. `NEXT_PUBLIC_SITE_URL` still overrides for previews.

**A previously documented defect here is fixed** — three content routes used to carry their own `process.env.NEXT_PUBLIC_SITE_URL ?? "https://example-placeholder.com"` fallback instead of calling `siteUrl()`, and two of them also emitted **no canonical at all**. `grep -r example-placeholder` now returns nothing. The lesson survives the fix: **never hand-roll the origin in a page** — that literal reached production-shaped output precisely because it looked harmless in review.

Site-wide OpenGraph, including `public/og-cover.png`, is set once in `app/layout.tsx` and inherited. The card is a **committed PNG, not a generated `opengraph-image.tsx`**: `ImageResponse` only runs under the edge runtime in this project (the Node path crashes the request), and adopting edge would cost the static export above. Re-render it from a throwaway edge route rather than editing the PNG.
