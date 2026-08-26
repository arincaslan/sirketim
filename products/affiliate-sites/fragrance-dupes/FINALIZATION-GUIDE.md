# DRYDOWN — Finalization Guide

**One ordered path from where the site actually is to where it earns money.**

Written 2026-08-26 · Synthesized by the board from Web Development, Communication, Accounting (CFO) and Control input
Canonical copy. Published visual version is linked from the dashboard.

---

## The honest snapshot

DRYDOWN is a well-built site with no audience, no income, and four things that would fail a merchant review today. The build quality is not the problem — three design passes have already landed. **What stands between this and revenue is data honesty, four missing legal pages, and the fact that nothing is deployed.**

| | Reality | |
|---|---|---|
| Routes building | 15 app routes, all 200 | ✅ |
| Reference fragrances | 68, across 8 houses | ✅ |
| Dupe listings | 37, across 8 producers | ⚠️ figures illustrative |
| Indexable catalog URLs | **0** | ❌ |
| Published content | 4 pieces, ~1,500 words | ❌ fixture-scale |
| Working affiliate links | **0 of 18** — all placeholders | ❌ |
| Privacy policy | **Does not exist** | ❌ |
| Deployment / domain | **None** | ❌ |
| Affiliate programs enrolled | **0** | ❌ |
| Revenue to date | **$0** | — |

**Uncommitted:** ~44 paths. A deploy today would ship the *pre-marketplace* site. Commit before anything else.

---

## Three decisions already taken (2026-08-26)

| Decision | Choice | Why |
|---|---|---|
| **Amazon Associates** | **Dropped** | Turkey is invite-only *and* Amazon cannot pay a Turkish (TRY) bank account. Separately, CJ/FragranceX beats it at its only job — 10% vs 3%, 45-day vs 24-hour cookie. It is also the only program whose terms conflict with our `/go/[slug]` redirect. Dropping it deletes real backlog. |
| **The 37 listings** | **Keep, add a sitewide "illustrative data" banner** | Founder's call. Nothing is deleted; the site states plainly that figures are not yet verified. |
| **Payment rail** | **Payoneer first, Paddle later** | Stripe cannot serve a Turkish business — verified against `stripe.com/global`. Payoneer unblocks all affiliate income. Paddle is confirmed available but is only needed once a producer agrees to pay. |

---

## Phase 0 — Make it safe to show anyone

**Nothing may become publicly reachable before this phase lands.** Cost: $0. Owner: Web Development. Blocked on: nothing — start now.

| # | Task | Why it is here |
|---|---|---|
| 0.1 | **Empty the fabricated customer reviews** (`lib/reviews.ts`) | 6 invented reviews with human names, star ratings and dates, about **real, named, operating companies** — including a 2-star review of MicroPerfumes. `review-list.tsx` renders them with an aggregate star average and no fixture label. The file's own header says not to do this. FTC Fake Reviews Rule + trade libel against a named third party. The empty state already exists, so this is a one-line data change. **Highest-priority item in this guide.** |
| 0.2 | **Add the sitewide "illustrative data" banner** | The founder's decision on the 37 listings. Must appear on every comparison surface, not just one page. |
| 0.3 | **Fix 3 false first-hand claims** | `app/about/page.tsx:21` and `components/home/chapter-standards.tsx:66` both say "a bottle we bought". We did not buy them. This directly contradicts 0.2 — a banner saying "illustrative" beside a claim of first-hand testing is worse than either alone. |
| 0.4 | **Remove `site-footer.tsx:64`** "This is a template build" | Honest today, wrong the moment it is public. |
| 0.5 | **Delete the dead Stripe code** | `lib/stripe.ts`, both API routes, the npm dep, 6 `.env.example` lines. Its user-facing 503 says "No Stripe account is connected" — implying one *could* be. It never can. Move `PaidTier`/`BillingInterval` into `lib/plans.ts`. The valuable part (webhook-as-sole-writer) is architecture, already recorded in `prisma/schema.prisma`. |
| 0.6 | **Write `/privacy`** | Hard blocker: no affiliate network approves a site without one. Also required before GA4 fires a single event (KVKK / GDPR). |
| 0.7 | **Add `/contact` with a monitored inbox** | Affiliate managers reply there. A dead contact page reads as a silent rejection. |
| 0.8 | **Add a `LICENSE`** | Repo is public and has none. |
| 0.9 | **Commit the ~44 uncommitted paths** | Otherwise a deploy ships the old site. |

**Done when:** the site contains no claim we cannot defend, and `/privacy` + `/contact` resolve.

---

## Phase 1 — Get it online

Cost: **~$15–20**, or **~$255** if Vercel Pro is required. Owner: Founder, then Web Development.

> ⚠️ **The single biggest cost unknown in this whole plan.** Vercel's Hobby tier is for *non-commercial* use, and an affiliate-monetised site is arguably commercial. If Pro is required that is ~$20/mo — more than every other pre-revenue cost combined. **Read Vercel's terms before deploying.**

| # | Task | Owner | Blocks |
|---|---|---|---|
| 1.1 | **Decide payee: A.Ş. vs individual**, with the `mali müşavir` | **Founder only** | Every enrollment. Cannot be casually changed later — use the same answer everywhere. |
| 1.2 | **Open Payoneer** | **Founder only** | All affiliate income. Highest-value single action in this guide. |
| 1.3 | **Register an apex domain** (not a subdomain) | **Founder only** | Every application. Awin reviews the site itself. |
| 1.4 | Deploy to Vercel, set `NEXT_PUBLIC_SITE_URL` | Web Dev | Metadata, sitemap and robots currently all emit `example-placeholder.com`. |
| 1.5 | GA4 + Google Search Console | Web Dev | Must run **2–4 weeks before applying**, so "monthly unique visitors" can be answered honestly. **Only after 0.6 exists.** |

> **1.1 is not paperwork.** Awin does **not** self-bill Turkish tax residents — verified against Awin's own policy. Turkey is an explicit exception: *we* must issue an invoice to Awin Ltd for every payout. A Turkish individual cannot casually issue a *fatura*. This is a hard argument for **payee = A.Ş.**, and it makes every payout a manual invoice event Accounting owns.

**Done when:** the real domain serves the site over HTTPS and analytics is collecting.

---

## Phase 2 — Make it findable

Cost: $0. Owner: Web Development + Content. Blocked on: Phase 1 for the domain, but **content starts today**.

| # | Task | Impact |
|---|---|---|
| 2.1 | **Build per-fragrance and per-comparison routes** | **The highest-leverage fix on this list.** 68 references × 37 listings currently generate **zero** indexable URLs — the Dupe Finder is one client-state page. Static routes with `generateStaticParams` take the sitemap from ~11 URLs to several hundred, and `/fragrance/[slug]` + `/compare/[a]-vs-[b]` are exactly the shapes this niche's search demand maps to. |
| 2.2 | Canonical URLs | Zero exist today. |
| 2.3 | Per-page OpenGraph + one social share image | Every page currently shares a static site-wide OG block with no image. |
| 2.4 | `Organization` / `WebSite` / `BreadcrumbList` JSON-LD | Only `Article`/`Review`/`ItemList` exist, on 3 content routes. |
| 2.5 | Homepage `metadata` | The only page with none — it inherits the root title. |
| 2.6 | `lastModified` in the sitemap | Static entries have none. |
| 2.7 | **Content: 10–12 real pieces** | **Longest lead item in the entire plan and blocked on nothing — start immediately.** 4 pieces / ~1,500 words is a demo, not a library. Target: every merchant we apply to appears in ≥2 published pieces with real prices and a working link. |

**Done when:** the sitemap lists several hundred real URLs and GSC shows them indexed.

---

## Phase 3 — Turn the money on

Cost: ~$5, refundable. Owner: Communication. Blocked on: Phases 0–2.

| # | Task | Note |
|---|---|---|
| 3.1 | **Apply to Awin** | **One application, not two.** ShareASale migrated into Awin (2025-08-15) and its platform closed 2025-10-06 — verified. ALT. Fragrances and Dossier are both merchants *inside* Awin. |
| 3.2 | Apply to merchants inside Awin | Network approval ≠ merchant approval. The **merchant** gate is what rejects a thin site, and it usually fails as silence, not a "no". |
| 3.3 | **Apply to CJ, then FragranceX** | Not optional diversification — **the backup rail.** Post-merger, ALT. *and* Dossier both sit behind one Awin account. That is a single point of failure. |
| 3.4 | Replace 18 placeholder links; flip the placeholder fallback to **hard failure** | Today `resolveAffiliateLink()` silently produces `example.com` URLs. After launch, a missing link must break loudly, not send a customer nowhere. |
| 3.5 | **Sub-ID scheme + click logging, before the first real click** | `<listingId>__<referenceSlug>__<surface>`, composed once in `/go/[slug]`, emitted as Awin `clickref` / CJ `sid`. **Cannot be retrofitted** — untagged traffic is unattributable forever. |

> **Link shape needs changing.** `AffiliateLinkEntry` holds one bare `destinationUrl`, but Awin and CJ both require a network click URL with the destination URL-encoded inside it. The shape needs `network` + `merchantId` + `deepLink`, not a single string.

**Done when:** one real commission appears in a network dashboard.

---

## Phase 4 — "All originals currently in market"

Cost: $0. Owner: Web Development. **Blocked on Phase 3 — and that dependency is the point.**

The catalog cannot be hand-expanded. All 68 references are hand-typed TypeScript literals and there is **no import path anywhere** in the project. Hand-authoring thousands of note pyramids would mean fabricating data at scale — the exact failure this project already corrected once with the anti-copy-cheat standard.

**Enrolling in Awin (Phase 3) unlocks three of these asks at once:**

| Unlock | Why it matters |
|---|---|
| Real affiliate links | The obvious one. |
| **Legally usable product imagery** | `imageUrl` is empty on all 68 references *by design* — perfume bottles are protected trade dress. There are exactly two lawful sources, and **affiliate-program-supplied imagery is one of them.** Every surface already routes through `FragranceImage`, so populating `imageUrl` lights up the whole site with **no component changes**. |
| **A real product feed** | Real prices, real names, at scale — the only honest route to catalog breadth. Prices today are hand-maintained constants feeding a user-facing "Nx cheaper" claim. |

| # | Task |
|---|---|
| 4.1 | Build a feed ingest path (the first non-hand-written data source in the project) |
| 4.2 | Import real prices; retire the hand-maintained constants |
| 4.3 | Populate `imageUrl` from affiliate-supplied imagery |
| 4.4 | Expand the reference catalog from the feed |
| 4.5 | **Remove the illustrative-data banner** — it stops being true here |

**Done when:** the banner from 0.2 can be deleted honestly.

---

## Phase 5 — Producers pay

Cost: ~10.2% of subscription revenue. Owner: Web Development + Founder. **Deliberately last.**

There are **zero producers.** A free tier needs no payment rail at all, and `/producers/submit` is currently unreachable in production *for anyone* — `lib/producer-session.ts` gates on `NODE_ENV === "development"`, which the bundler inlines at build time. Building billing now is building for nobody.

| # | Task | Trigger |
|---|---|---|
| 5.1 | **Ship the free tier.** Ungate the free path, keep every field and the live verbatim-copy warning, swap the dead submit handler for a prefilled `mailto:` | Now — zero accounts, works today |
| 5.2 | Email Paddle about its marketplace acceptable-use policy | In parallel, gates nothing |
| 5.3 | Postgres + Prisma migration, real Auth.js | Only when submission volume outgrows email |
| 5.4 | Paddle adapter | **Only when a producer says yes to paying** |

> **Paddle economics:** ~10.2% all-in at $300/month — a flat ~$15 wire fee per *payout* dominates at low volume. The first one or two paying producers are roughly net-zero after payout costs. **Batch payouts quarterly, not monthly.**

---

## Where the departments hand off

**Communication needs from Web Development:** live apex-domain URL · `/privacy` · corrected `/disclosure` · `/contact` with a monitored inbox · working `/go/[slug]` with real destinations · click logging live before the first real click · GA4+GSC collecting 2–4 weeks before applying · real prices on every linked product · visible site-operator identity.

**Web Development needs from Communication:** final disclosure wording per network and where it sits inline · **link format per network** (see Phase 3 note) · the sub-ID scheme · which merchants get wired first · the condition for flipping the placeholder fallback to hard failure.

**Accounting owns:** the manual Awin invoice per payout (Phase 1 note) · a new `Subscription revenue — <Product>` income category · booking Payoneer payouts as **one row updated in place** (Payoneer is our own account, not a counterparty — only the ~2% withdrawal fee gets its own expense row).

---

## Not worth doing yet

Postgres migration · Auth.js sign-in · billing on any rail · approval-queue UI · producer dashboard · review submission backend · click logging to a database before a network is chosen · the `familyBonus === 1` latent bug · **more front-end polish** (three passes have landed; what fails review is data honesty and missing legal pages, not build quality) · Amazon and everything Amazon-specific · Impact/Rakuten · verifying prices for all 68 references · approaching ALT./Dossier as *producers* (same company, same contact, wrong door — affiliate first) · paid traffic · a second domain · Stripe Atlas (~$2k/yr, and Form 5472 carries a $25,000 penalty for non-filing).

---

## Founder-only actions, in order

Nothing below can be done by an agent. Everything downstream waits on them.

1. **Decide payee — A.Ş. vs individual**, with the `mali müşavir`. Awin's Turkish invoicing rule makes A.Ş. the strong candidate.
2. **Open Payoneer.** One action, unblocks Awin + CJ simultaneously.
3. **Register the apex domain.**
4. **Check Vercel's commercial-use terms**; pay for Pro if required.
5. **Apply to Awin**, once the site is live and has content.

---

## One unresolved integrity problem

`No. 01 Ember` — our own product — currently renders **#1 at 79%** on Baccarat Rouge 540, ahead of every real listing. Verified against the live server, not inferred.

This is not the producer-copying exploit (that is fixed and enforced). It is the same failure by our own hand: we wrote Ember's note list close to the reference. The site brands itself *"Independent Fragrance Comparisons"* while selling its own line inside those comparisons. A merchant reviewing our Awin application will see that.

The `HouseBadge` disclosure is real and the tie-break favours the cheaper bottle, so the mechanism is honest. The **data** is not. Resolving this is a founder call and is deliberately left open here.
