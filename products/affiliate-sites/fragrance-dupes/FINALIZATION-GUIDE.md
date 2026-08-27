# PARFUMOZA — Finalization Guide

**One ordered path from where the site actually is to where it earns money.**

Written 2026-08-26 · Synthesized by the board from Web Development, Communication, Accounting (CFO) and Control input
Canonical copy. Published visual version is linked from the dashboard.

---

## The honest snapshot

**Updated 27 Aug (second pass), after phase 2 was closed out except content.** The site now contains no invented data and no claim it cannot defend, its catalog is indexable, and it has a real share card. What remains between it and revenue is a deploy and more content.

| | Reality | |
|---|---|---|
| Routes building | 89 pages, typecheck clean, lint clean | ✅ |
| Reference fragrances | 68, across 8 houses — real, researched | ✅ |
| **Indexable catalog URLs** | **68** (was 0) | ✅ |
| Sitemap entries | **81** (was ~11) | ✅ |
| Privacy policy / contact | `/privacy` and `/contact` live | ✅ |
| Canonicals, OG, site schema | On every page — **incl. the 3 content routes that were missing canonicals entirely** | ✅ |
| Social share image | `og-cover.png`, 1200×630, on every page | ✅ |
| Invented data | **None** — all removed | ✅ |
| Payoneer | Open | ✅ |
| Domain + email | `parfumoza.com`, `contact@parfumoza.com` live | ✅ |
| Published content | **4 pieces, ~4,000 words** (was 1 piece / 434 words) | ◐ needs 10–12 |
| Dupe listings | **0** (37 removed as invented) | ❌ needs real data |
| Working affiliate links | **0** — none enrolled | ❌ |
| Deployment / host | **Not chosen** — comparison done, decision is the founder's | ❌ |
| Revenue to date | **$0** | — |

**The catalog is now the site's asset.** 68 real fragrance pages with note pyramids, profiles, longevity and price-per-ml — each one a page a search engine can land on, and each one honestly saying no alternative is listed yet rather than inventing one.

---

## Decisions taken — updated 2026-08-27

**Four of these reversed on 27 Aug. The reasons are recorded because the reversals were driven by new facts, not by preference.**

| Decision | Current choice | Why |
|---|---|---|
| **The fixture listings** | **REMOVED — all 37, plus 6 reviews and 3 content pieces** | Reversed from "keep + banner". Checking the producers' own storefronts showed the *product names themselves* were invented and attributed to real companies: "Dossier Ambrosia" does not exist (theirs is *Ambery Saffron*), and neither do ALT.'s "Bright" or "Blue Cedar" (theirs are *Crystal, Executive, Farouche…*). That is not fixable by correcting prices, and not something a banner covers. |
| **Illustrative-data banner** | **Not needed — never built** | Follows from the above. With no invented data there is nothing to disclaim. |
| **Amazon Associates** | **BACK ON — the payout blocker is gone** | Reversed from "dropped". That call rested mainly on Amazon being unable to pay a TRY account. **Payoneer is now open (27 Aug)**, and a Payoneer USD receiving account is the documented route for exactly this. Still true and still worth weighing: 3% on most Beauty (10% on Luxury Beauty), a 24-hour cookie, the `/go/[slug]` redirect-terms question, and a 180-day / 3-qualifying-sales clock that **starts when you apply** — so apply only once the site is live and has content. A paid Amazon account (Prime) does not shortcut any of this; Associates is a separate application. |
| **Awin** | **Free to join — the €100 was the wrong page** | The ~€100 is Awin's **advertiser** pricing (£99+VAT/mo + 3.5% per transaction), what a *brand* pays to run a programme. The publisher side states "Free to join, no hidden fees". Not a cost reason to exclude it — worth keeping as the backup rail so Amazon is not a single point of failure. |
| **Payee** | **Personal account** (founder + *mali müşavir*, 27 Aug) | Works for Amazon, which accepts an individual with a W-8BEN. Note: Awin does **not** self-bill Turkish tax residents, so we would have to issue our own invoice per payout — awkward for an individual. That constraint only bites if Awin is added. |
| **Payment rail** | **Payoneer ✅ open. Paddle later** | Stripe cannot serve a Turkish business — verified against `stripe.com/global`; its integration has now been deleted from the codebase. A producer subscription rail is not needed until a producer agrees to pay. |

---

## Phase 0 — Make it safe to show anyone  ✅ DONE (27 Aug)

All nine items landed. The site now contains no invented data and no claim it cannot defend. Build clean, lint clean, every route 200, and the removals verified in served HTML rather than only in source.

| # | What was done | Why |
|---|---|---|
| 0.1 ✅ | **Fabricated customer reviews removed** (`lib/reviews.ts` now empty) | 6 invented reviews with human names and star ratings, about **real, named, operating companies** — including a 2-star review of MicroPerfumes — rendered with an aggregate average and no fixture label. FTC Fake Reviews Rule plus trade libel. The file now carries a do-not-repopulate note. |
| 0.2 ✅ | **All 37 listings removed** (banner not needed) | Superseded the banner plan entirely — see the decisions table. The names were invented and attributed to real companies. |
| 0.3 ✅ | **False first-hand claims removed** | "a bottle we bought" on `/about` and the homepage, and "bottles we purchased ourselves". We had bought nothing. Replaced with what is actually true: one formula, applied the same way to every bottle, and no paid placement. |
| 0.4 ✅ | **"This is a template build" removed** from the footer | Honest during the build, wrong the moment it is public. |
| 0.5 ✅ | **Dead Stripe code deleted** | `lib/stripe.ts`, both API routes, the npm dependency and 6 env lines. Its 503 said "No Stripe account is connected", implying one could be; Stripe cannot serve a Turkish business. `PaidTier`/`BillingInterval` moved into `lib/plans.ts`, where a payment processor no longer owns the pricing page's type layer. |
| 0.6 ✅ | **`/privacy` written** | Hard blocker for every affiliate application, and required before GA4 fires a single event (KVKK / GDPR). Describes what the site actually does — no accounts, no newsletter, no ad pixels. |
| 0.7 ✅ | **`/contact` live at contact@parfumoza.com** (27 Aug) | Affiliate managers reply there. Hardcoded in `lib/site.ts` rather than an env var, so a forgotten deployment setting cannot make the page claim contact is closed. |
| 0.8 ✅ | **`LICENSE` added** | MIT for the code, with editorial content, the Parfumoza name, and third-party trade marks explicitly excluded. |
| 0.9 ✅ | **Everything committed and pushed** | |

**Also done, not originally on the list:** buy buttons no longer render at all unless a link resolves to a real enrolled programme (`hasRealAffiliateLink`). A button leading to `example.com` reads as broken to a visitor and as low quality to a merchant reviewing our application.

**Done.** The site contains no claim it cannot defend, and `/privacy` and `/contact` both resolve.

---

## Phase 1 — Get it online

Cost: **~$15–20**, or **~$255** if Vercel Pro is required. Owner: Founder, then Web Development.

> ⚠️ **The single biggest cost unknown in this whole plan.** Vercel's Hobby tier is for *non-commercial* use, and an affiliate-monetised site is arguably commercial. If Pro is required that is ~$20/mo — more than every other pre-revenue cost combined. **Read Vercel's terms before deploying.**

| # | Task | Owner | Blocks |
|---|---|---|---|
| 1.1 ✅ | **Payee decided: personal account** (with the `mali müşavir`, 27 Aug) | Founder | Every enrollment. Cannot be casually changed later — use the same answer everywhere. |
| 1.2 ✅ | **Payoneer open** (27 Aug) | Founder | All affiliate income. Highest-value single action in this guide. |
| 1.3 ✅ | **Domain registered: `parfumoza.com`** (27 Aug) — apex, not a subdomain | Founder | Done. `drydown.com` was taken, so the brand was renamed to **Parfumoza** in the same change. |
| 1.4 | **Deploy** — comparison done ✅, host decision outstanding | Founder + Web Dev | See the host comparison below. `parfumoza.com` is already the built-in default, so metadata, canonicals, sitemap and robots all emit it with no env var needed. |
| 1.5 | GA4 + Google Search Console | Web Dev | Must run **2–4 weeks before applying**, so "monthly unique visitors" can be answered honestly. **Only after 0.6 exists.** |

### The host comparison (done 27 Aug, against each vendor's own pricing page)

**Two things this repo previously assumed turned out to be wrong**, and both change the answer:

- **Hostinger's ordinary shared plans now run Node.js web apps** (Business/"Unlimited" 5 apps, Cloud 10, GitHub auto-deploy, Node 18–24). The old "shared hosting can't run `/go/[slug]`" reasoning is retired.
- **Cloudflare is no longer a drop-in.** `@opennextjs/cloudflare` ended Next.js 14 support in Q1 2026 and the current path (`vinext`) targets Next.js 16. This project is pinned to **14.2.35**.

| | Hostinger Cloud Startup | Hostinger Unlimited | Cloudflare Pages |
|---|---|---|---|
| Advertised | $7.99/mo | $3.99/mo | $0 |
| **Real commitment** | **48 mo, $383.52 upfront** | **48 mo, $191.52 upfront** | none |
| **Renewal** | **$25.99/mo** ($311.88/yr) | **$16.99/mo** ($203.88/yr) | $0 |
| Runs this code unmodified | ✅ | ✅ | ⚠️ needs static export or a Next upgrade |

**Recommendation: Cloudflare Pages via static export.** A grep of `app/` and `lib/` found **no dynamic server surface at all** — no `cookies()`, `headers()`, `force-dynamic` or `revalidate`, and one route handler (`/go/[slug]`) that does a static map lookup and returns a 302, reproducible as a generated `_redirects` file. Cloud Startup's 4 CPU / 4 GB would be serving a folder of HTML.

**If speed matters more than cost, take Unlimited — not Cloud.** Cloud buys CPU, RAM, app slots and a dedicated IP, none of which is a bottleneck here. Two non-reasons to pick Hostinger: **email is attached to the domain, not the plan** (`contact@parfumoza.com` already resolves with no hosting plan on the account), and the 30-day money-back window closes long before the renewal bites.

> **Note on the payee choice.** Personal works for Amazon Associates, which accepts an individual with a W-8BEN. It is awkward for Awin specifically: Awin does **not** self-bill Turkish tax residents (verified against Awin's own policy — Turkey is an explicit exception), so we would have to issue our own invoice to Awin Ltd per payout, which a Turkish individual cannot casually do. Revisit only if Awin is added.

**Done when:** the real domain serves the site over HTTPS and analytics is collecting.

---

## Phase 2 — Make it findable  ✅ TECHNICALLY DONE (27 Aug) · content ongoing

**2.1–2.6 are all built and verified against the running site.** 2.7 (content) is the only open item and remains the longest-lead item in the whole plan.

| # | Task | Status |
|---|---|---|
| 2.1 ✅ | **Per-fragrance routes** — `/fragrance/[slug]`, 68 static pages via `generateStaticParams` | Took the sitemap from ~11 URLs to 78. The catalog had generated **zero** indexable URLs before this. |
| 2.2 ✅ | Canonical URLs on every page | **Finished 27 Aug.** The first pass missed three routes: `/comparison/[slug]`, `/guide/[slug]` and `/review/[slug]` emitted **no canonical at all** and built their JSON-LD `url` from a hardcoded `example-placeholder.com` fallback instead of `lib/site.ts`. All three now use `absoluteUrl()` and carry canonical + article OG. Verified: zero occurrences of the placeholder host in served HTML. |
| 2.3 ✅ | Per-page OpenGraph + Twitter cards, **and the share image** | **Finished 27 Aug.** `public/og-cover.png` (1200×630) now ships on every page with width/height/alt. Rendered once via Satori using the site's own Cormorant Garamond and `globals.css` palette, then committed as a static asset — see the note below on why it is not a generated route. |
| 2.4 ✅ | `Organization` + `WebSite` sitewide, `BreadcrumbList` on fragrance pages | |
| 2.5 ✅ | Homepage metadata | |
| 2.6 ✅ | `lastModified` in the sitemap | Verified present on all three entry groups (static, references, content). |
| 2.7 ◐ | **Content: 10–12 real pieces** | **6 published, ~6,100 words** (was 1 piece / 434 words). See the constraint below — this is not simply "write more". |

> **Why the share image is a committed PNG, not `opengraph-image.tsx`.** Next's `ImageResponse` only runs under the **edge** runtime in this project — the Node runtime path crashes the request outright. Adopting edge would have given the site its first dynamic route and cost it the property that makes free static hosting viable (see Phase 1's host comparison). The card is one fixed brand image that never varies per page, so generating it per request bought nothing. To change it, re-render from a throwaway edge route rather than editing the PNG.

### The content constraint nobody had written down

**`comparison` and `review` pieces cannot honestly be written yet**, and this is structural rather than a matter of effort. `content/schema.ts` requires a `productRef` — with a mandatory `affiliateLinkId` — on every `comparison` (min 2 products) and every `review` (exactly 1). There are currently **zero listings and zero enrolled programmes**, so any such piece would have to invent a product to point at. That is precisely the failure Phase 0 just spent a day undoing.

Only `guide` pieces (where `featuredProducts` is optional) are writable now. That is not a loss: guides about the **originals** — 68 real, researched references — are honest, need no affiliate link, and internally link to the `/fragrance/[slug]` pages 2.1 just created, which is what makes those pages rank.

**Consequently this phase's old target — "every merchant we apply to appears in ≥2 published pieces with real prices and a working link" — belongs to Phase 3, not here.** It cannot be met before enrollment.

Published so far (all `guide`, all `disclosure: false`):

| Piece | Words |
|---|---|
| How to Actually Find a Fragrance Dupe That Works | 434 — thin, worth expanding |
| EDT, EDP, Extrait: What Fragrance Concentration Actually Changes | 1,166 |
| Why a Fragrance Smells Different on You Than in Every Review | 1,227 |
| Top, Heart, Base: How to Actually Read a Fragrance Note Pyramid | 1,169 |
| How to Make a Fragrance Last Longer (and What Doesn't Work) | 1,051 |
| Are Fragrance Dupes Legal? And Are They Safe to Wear? | 1,036 |

**6 of 10–12. ~6,100 words.** Every internal link across all six is verified resolving against the built site, not assumed. The six form a deliberate cluster: each answers a real search question, needs no affiliate link, and internally links to the `/fragrance/[slug]` pages 2.1 created — which is what gets those 68 pages crawled.

> **`disclosure` was being set dishonestly.** The block reads "This piece contains affiliate links" — untrue on every piece currently published, since none contain any. The schema defaults it to `true`, and the pre-existing guide had it on. All four are now `disclosure: false`; it flips back per-piece as real links land in Phase 3.

**Done when:** 10–12 pieces are published and GSC shows the catalog indexed.

---

## Phase 3 — Turn the money on

Cost: ~$5, refundable. Owner: Communication. Blocked on: Phases 0–2.

| # | Task | Note |
|---|---|---|
| 3.1 | **Apply to Awin** | **One application, not two.** ShareASale migrated into Awin (2025-08-15) and its platform closed 2025-10-06 — verified. ALT. Fragrances and Dossier are both merchants *inside* Awin. |
| 3.2 | Apply to merchants inside Awin | Network approval ≠ merchant approval. The **merchant** gate is what rejects a thin site, and it usually fails as silence, not a "no". |
| 3.3 | **Apply to CJ, then FragranceX** | Not optional diversification — **the backup rail.** Post-merger, ALT. *and* Dossier both sit behind one Awin account. That is a single point of failure. |
| 3.4 | Populate `affiliateLinks` (now **empty**, was 18 placeholders); flip the placeholder fallback to **hard failure** | The placeholders are gone rather than fixed — `affiliateLinks` is `{}`, so `/go/<id>` currently 404s for every id, which is correct. After launch a missing link must keep breaking loudly rather than sending a customer nowhere. |
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

1. ~~**Decide payee — A.Ş. vs individual.**~~ ✅ Personal, with the `mali müşavir` (27 Aug).
2. ~~**Open Payoneer.**~~ ✅ Open (27 Aug).
3. ~~**Register the apex domain.**~~ ✅ `parfumoza.com`, plus `contact@parfumoza.com` (27 Aug).
4. **Choose a host and deploy.** ⬅ **the only thing now blocking Phase 3.** Comparison and recommendation are in Phase 1 above; this is a spending decision, so it is the founder's.
5. **Apply to Awin**, once the site is live and has content — and only after GA4 has run 2–4 weeks (1.5), so "monthly unique visitors" can be answered honestly.

---

## One unresolved integrity problem

`No. 01 Ember` — our own product — rendered **#1 at 79%** on Baccarat Rouge 540, ahead of every real listing. Verified against the live server, not inferred.

**It is dormant, not solved.** `DUPES` is empty as of 27 Aug, so nothing renders at all — but the house-product plumbing (`HouseBadge`, the note in `lib/verification.ts`) is intact and the problem returns the moment listings are repopulated with Ember still among them. Resolve it before Phase 4, not after.

This is not the producer-copying exploit (that is fixed and enforced). It is the same failure by our own hand: we wrote Ember's note list close to the reference. The site brands itself *"Independent Fragrance Comparisons"* while selling its own line inside those comparisons. A merchant reviewing our Awin application will see that.

The `HouseBadge` disclosure is real and the tie-break favours the cheaper bottle, so the mechanism is honest. The **data** is not. Resolving this is a founder call and is deliberately left open here.
