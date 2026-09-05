# COUNTERSCENT — Finalization Guide

**One ordered path from where the site actually is to where it earns money.**

Written 2026-08-26 · Synthesized by the board from Web Development, Communication, Accounting (CFO) and Control input
Canonical copy. Published visual version is linked from the dashboard.

---

## The honest snapshot

**Updated 27 Aug (fourth pass) — the site is LIVE and the board's findings are actioned.** `counterscent.com` serves over HTTPS on Cloudflare Workers at **$0/month**, email survived the DNS migration, GA4 is collecting and Search Console is verified. Phases 0, 1 and 2 are done, and every code defect the 27 Aug board review found is now fixed and verified. **What stands between here and revenue is no longer build work.** *(Updated 29 Aug: the payee bank account — previously the top blocker — is now open, USD and EUR. What is left is the 2–4 week analytics window, which gates **Amazon only**, and one founder decision: whether to run producer store-direct links.)*

**Updated 30 Aug (fifth pass) — Phase 3 is actually underway.** Awin: applied, **verified/approved**, payment details configured (Payoneer pass-through into the company USD account, no standalone Payoneer account needed), threshold set. Applications went out to ALT. Fragrances, My Perfume Shop, The Fragrance Counter and the in-network "ShareASale" listing — **ALT. Fragrances and The Fragrance Counter subsequently vanished from Awin entirely** (their programmes closed; this reads as the advertiser leaving the network, not a rejection or an account issue), so **3.1's claim below that "ALT. Fragrances and Dossier are both merchants inside Awin" is now stale** — Dossier was never found there either. Currently pending: **My Perfume Shop** (still red link status, watch before building around it) and **Escentual** (originals-side, not a dupe house). CJ (3.3) has **not** been applied yet — next action.

**Updated 31 Aug (sixth pass) — first merchant approval, and CJ is in.** Founder reports: **My Perfume Shop approved us on Awin** — the first merchant-level approval (§3.2). Checked 1 Sep against its Awin profile (ID 106089): it is a **genuine-designer retailer**, Australia-led, ships AU/NZ/UK, 30-day cookie — **originals-side, not a dupe house.** So it gives us "buy the original" links, real original prices, and (via the Awin feed) lawful designer-bottle imagery — it does **not** unblock the `DUPES` listings or dupe `comparison`/`review` content. Separately, the **CJ application is submitted** (§3.3), now pending review. Neither changes the code state — `affiliateLinks` is still `{}` and no sub-ID scheme exists — but §3.4, §3.5 and the link-shape change below are no longer hypothetical: **a real merchant is waiting to be wired, and per §3.5 the sub-ID scheme must be built before the first real click or that traffic is unattributable forever.**

**Updated 3–4 Sep (seventh pass) — the dupe side is finally open, and Phase 4 is largely done.** Two things changed that this document had been waiting on since 30 Aug. **(1) A merchant we can earn from, and then a second.** Opulensi Perfumes (Awin **123248**) tracks and was wired up 1 Sep; **Clone of Perfume (Awin 117395) was approved 3 Sep and is the first genuine *dupe house* we have** — which is what §3.1's "treat Awin's dupe-side coverage as unresolved" was waiting for. AromaPassions (Awin 34989) is pending. On CJ, **FragranceShop.com approved us** — a genuine-designer discount retailer, so §3.3's originals-rail prediction holds. (A note written here on 3 Sep claimed this was a dupe house; it had checked `thefragranceshop.com`, a different company. Corrected 5 Sep — see §3.3.) **(2) The catalog is real.** `DUPES` went `[]` → 25 → 32 → **41 listings across 27 originals**, `affiliateLinks` `{}` → **39 tracking entries**, every pairing **cited from the retailer's own words** rather than asserted, and every link traced *and* stock-checked live. Opulensi is exhausted at 32/22 — two full hand-scans of its 610 rows found nothing further; the growth from here came from adding merchants, which is the lesson worth carrying.

**A tooling correction from the same pass, because it nearly cost us a merchant.** `check-affiliate-links.mjs` asserted our sub-ID had to appear in the *destination URL*, which is Opulensi's Shopify theme echoing a parameter — never an Awin guarantee. Clone of Perfume does not echo it, so all nine of its links reported as "clicks would be unattributable" when they track perfectly. The authoritative record is Awin's own click cookie (`aw<merchantId>=<affid>|0|0|<ts>|<subId>|aw|<pid>`), set at the **first** hop — invisible to the old code because `redirect: "follow"` exposes only the final response's headers. The script now walks the chain by hand and accepts either channel; a link that loses the sub-ID on **both** still fails hard.

| | Reality | |
|---|---|---|
| Routes building | 90 pages, typecheck clean, lint clean | ✅ |
| Reference fragrances | **200** (was 111, before that 68 across 8 houses) | ✅ |
| **Indexable catalog URLs** | **200** — plus a catalog index page, "related originals," and "related reading" (was 0) | ✅ |
| Sitemap entries | **221** (was ~11), all trailing-slash canonical | ✅ |
| Privacy policy / contact | `/privacy` and `/contact` live | ✅ |
| Canonicals, OG, site schema | On every page — **incl. the 3 content routes that were missing canonicals entirely** | ✅ |
| Social share image | `og-cover.png`, 1200×630, on every page | ✅ |
| Invented data | **None** — all removed | ✅ |
| Payoneer | Open | ✅ |
| Domain + email | `counterscent.com`, `contact@counterscent.com` live | ✅ |
| Published content | **12 pieces, 11,996 words** (was 1 piece / 434 words) | ✅ 10–12 met |
| Dupe listings | **79 across 65 originals** (was 41/27 on 4 Sep; 0 before that, after 37 invented ones were removed) — every one read off a live merchant feed, every pairing cited | ✅ |
| Working affiliate links | **77**, all traced and stock-checked (Opulensi 30, Clone of Perfume 9, AromaPassions 38) | ✅ |
| Deployment / host | **LIVE** at counterscent.com — Cloudflare **Workers**, $0/mo | ✅ |
| Scoring integrity | House products can no longer publish an uncapped score; rank can no longer invert | ✅ fixed 27 Aug |
| Broken-link guard | Build now fails if a content type has no route | ✅ fixed 27 Aug |
| Payee entity | **A.Ş.** — decided 27 Aug, **receiving account (company USD+EUR) open 29 Aug** | ✅ |
| Awin | Approved. **Opulensi (123248), Clone of Perfume (117395) and AromaPassions (34989) all wired and earning.** AromaPassions is mined out as of the A2 batch, 5 Sep. My Perfume Shop (106089) stays closed for tracking. | ✅ |
| CJ Affiliate | **Network approved; FragranceShop.com and Perfumania approved us** — both genuine-designer retailers, so CJ *is* the originals rail after all. A 3 Sep note here called it a dupe house; that was the wrong company (see §3.3). Product export created 5 Sep, not yet delivered. | ◐ wire it |
| Merchants we can actually earn from | **3 wired on Awin (Opulensi, Clone of Perfume, AromaPassions) + 2 approved but unwired on CJ (FragranceShop.com, Perfumania — both originals-side)** | ✅ |
| Revenue to date | **$0** | — |

**The catalog is now the site's asset.** 111 real fragrance pages with note pyramids, profiles, longevity and price-per-ml — each one a page a search engine can land on, each one honestly saying no alternative is listed yet rather than inventing one, and — new since 29 Aug — each one reachable from a catalog index and cross-linked via "related originals" and "related reading" instead of sitting orphaned in the sitemap.

---

## Decisions taken — updated 2026-08-27

**Four of these reversed on 27 Aug. The reasons are recorded because the reversals were driven by new facts, not by preference.**

| Decision | Current choice | Why |
|---|---|---|
| **The fixture listings** | **REMOVED — all 37, plus 6 reviews and 3 content pieces** | Reversed from "keep + banner". Checking the producers' own storefronts showed the *product names themselves* were invented and attributed to real companies: "Dossier Ambrosia" does not exist (theirs is *Ambery Saffron*), and neither do ALT.'s "Bright" or "Blue Cedar" (theirs are *Crystal, Executive, Farouche…*). That is not fixable by correcting prices, and not something a banner covers. |
| **Illustrative-data banner** | **Not needed — never built** | Follows from the above. With no invented data there is nothing to disclaim. |
| **Amazon Associates** | **Possible only through Payoneer — and still gated behind an invite** | Nuanced, and the nuance was previously recorded wrongly. **Verified live 27 Aug** against Amazon's own Associates help page: direct-deposit eligibility is by **country, not by account currency** — United States (USD), United Kingdom (GBP/EUR), 51 Eurozone/EEA countries (EUR), **52 in total, Turkey absent**. This matters because the founder holds a **USD bank account** and reasonably read the old "by account currency (USD/GBP/EUR)" wording as clearing the blocker. It does not: a USD account *held in Turkey* is ineligible. **Payoneer is the fix precisely because it supplies a US-*domiciled* account** — a different thing from a USD-denominated one. Remaining gates: `amazon.com.tr` is **invite-only** (no self-service signup), whether a TR resident may instead join **amazon.com (US)** is **unverified**, and the `/go/<slug>` redirect may breach Amazon's "Redirecting Links" clause. Economics unchanged: 3% most Beauty, 24-hour cookie, 180-day/3-sale clock starting **at application**. |
| **Awin** | **Free to join — the €100 was the wrong page** | The ~€100 is Awin's **advertiser** pricing (£99+VAT/mo + 3.5% per transaction), what a *brand* pays to run a programme. The publisher side states "Free to join, no hidden fees". Not a cost reason to exclude it — worth keeping as the backup rail so Amazon is not a single point of failure. |
| **Payee** | **REVERSED 27 Aug → the A.Ş.** | The invoicing requirement settled it, exactly as the escape clause below predicted. Awin does **not** self-bill Turkish tax residents (Turkey is an explicit exception in Awin's own policy), so the publisher issues their own invoice per payout — and a Turkish individual cannot casually issue a *fatura*. Founder: *"for invoice we need company account."* **This creates a new open problem, see below.** |
| **Payee receiving account** | ✅ **OPEN — company USD *and* EUR accounts, confirmed 29 Aug. No longer gates Phase 3.** | Checked and answered on 27 Aug, and the answer was the awkward one: **the company has no USD account.** The only one on record (24 Aug) is **personal**, so an A.Ş. invoice paid into it would make the invoice issuer and the payee **different legal persons** — the CFO's "costs in the A.Ş., revenue personal" warning in its concrete form. **Resolved 29 Aug: the founder opened company USD and EUR (*döviz*) accounts.** The A.Ş. can now be named as payee cleanly, and the EUR account additionally suits Awin, which pays European programmes in EUR. The enrolment hold this row imposed is lifted; the payee named on an affiliate application is still hard to change afterwards, so name the A.Ş. Note this is a *bank* account and is separate from Payoneer: Payoneer supplies a US-domiciled account (what Amazon needs), while Awin pays a local bank account directly. |
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
| 0.7 ✅ | **`/contact` live at contact@counterscent.com** (27 Aug) | Affiliate managers reply there. Hardcoded in `lib/site.ts` rather than an env var, so a forgotten deployment setting cannot make the page claim contact is closed. |
| 0.8 ✅ | **`LICENSE` added** | MIT for the code, with editorial content, the Counterscent name, and third-party trade marks explicitly excluded. |
| 0.9 ✅ | **Everything committed and pushed** | |

**Also done, not originally on the list:** buy buttons no longer render at all unless a link resolves to a real enrolled programme (`hasRealAffiliateLink`). A button leading to `example.com` reads as broken to a visitor and as low quality to a merchant reviewing our application.

**Done.** The site contains no claim it cannot defend, and `/privacy` and `/contact` both resolve.

---

## Phase 1 — Get it online  ✅ DONE (27 Aug)

Actual recurring cost: **$0/month.** Owner: Founder, then Web Development.

> **The biggest cost unknown in this plan resolved to zero.** Vercel Pro (~$255/yr) was the feared outcome; Cloudflare Workers' free plan permits commercial use and serves static assets free and unlimited, so the site hosts for nothing. The rejected alternatives were Hostinger Cloud Startup (**$383.52 upfront**, then $25.99/mo) and Hostinger Unlimited ($191.52, then $16.99/mo). Only the domain and mailbox cost money, and **those amounts are not yet in the ledger** — see the accounting note at the foot of this doc.

| # | Task | Owner | Blocks |
|---|---|---|---|
| 1.1 ◐ | **Payee entity decided: the A.Ş.** (27 Aug) — *revised from "personal"* | Founder | Every enrollment. **Still blocked on the receiving account** — see the payee rows in the decisions table. Cannot be casually changed later; use the same answer everywhere. |
| 1.2 ✅ | **Payoneer open** (27 Aug) | Founder | All affiliate income. Note the Payoneer→bank link is a *separate* step from the account existing, and is what the founder flagged as not done. |
| 1.3 ✅ | **Domain registered: `counterscent.com`** (27 Aug) — apex, not a subdomain | Founder | Done. `drydown.com` was taken, so the brand was renamed to **Counterscent** in the same change. |
| 1.4 ✅ | **Deployed and live** (27 Aug) — Cloudflare **Workers**, $0/mo | Founder + Web Dev | Four builds failed first; the fix was a root `postinstall` hook, not a dashboard setting. `counterscent.com` is the built-in default in `lib/site.ts`, so metadata, canonicals, sitemap and robots all emit it with no env var. |
| 1.5 ✅ | **GA4 + Google Search Console live** (27 Aug) | Web Dev | GA4 `G-4Q54ZJKVW1` collecting; GSC verified by DNS TXT with the sitemap submitted. **This started the 2–4 week clock — it is now the pacing item for the entire revenue path**, not any remaining build work. |

### The host comparison (done 27 Aug, against each vendor's own pricing page)

**Two things this repo previously assumed turned out to be wrong**, and both change the answer:

- **Hostinger's ordinary shared plans now run Node.js web apps** (Business/"Unlimited" 5 apps, Cloud 10, GitHub auto-deploy, Node 18–24). The old "shared hosting can't run `/go/[slug]`" reasoning is retired.
- **Cloudflare is no longer a drop-in.** `@opennextjs/cloudflare` ended Next.js 14 support in Q1 2026 and the current path (`vinext`) targets Next.js 16. This project is pinned to **14.2.35**.

| | Hostinger Cloud Startup | Hostinger Unlimited | **Cloudflare Workers** ✅ chosen |
|---|---|---|---|
| Advertised | $7.99/mo | $3.99/mo | $0 |
| **Real commitment** | **48 mo, $383.52 upfront** | **48 mo, $191.52 upfront** | none |
| **Renewal** | **$25.99/mo** ($311.88/yr) | **$16.99/mo** ($203.88/yr) | $0 |
| Runs this code unmodified | ✅ | ✅ | ⚠️ needed a static export |

**Chosen: Cloudflare Workers via static export** — not Pages. Cloudflare no longer creates Pages projects for new sites, and the distinction is load-bearing: a `functions/` directory does nothing on Workers, and `_redirects` rules are not applied to requests served by Worker code. A grep of `app/` and `lib/` found **no dynamic server surface at all** — no `cookies()`, `headers()`, `force-dynamic` or `revalidate`. The single route handler (`/go/[slug]`) was replaced by `scripts/generate-redirects.mjs`, which writes `public/_redirects` at build time; **the project now has zero route handlers.** Cloud Startup's 4 CPU / 4 GB would have been serving a folder of HTML.

**Verified 27 Aug: Cloudflare's free plan permits commercial use.** Worth recording because it was nearly missed — Vercel Hobby was rejected on exactly this clause, and the same question was never asked of the host we then chose.

**If speed matters more than cost, take Unlimited — not Cloud.** Cloud buys CPU, RAM, app slots and a dedicated IP, none of which is a bottleneck here. Two non-reasons to pick Hostinger: **email is attached to the domain, not the plan** (`contact@counterscent.com` already resolves with no hosting plan on the account), and the 30-day money-back window closes long before the renewal bites.

> **Note on the payee choice — this escape clause has now triggered, exactly as written.** The original text said the Awin invoicing constraint should be revisited "only if Awin is added." Awin *is* the plan, and always was once Amazon was dropped and ShareASale merged into it, so the clause was deferring a decision that was already made. **Resolved 27 Aug: the payee is the A.Ş.**, because Awin does not self-bill Turkish tax residents (verified against Awin's own policy — Turkey is an explicit exception) and a Turkish individual cannot casually issue a *fatura* to Awin Ltd. The lesson worth keeping: a conditional deferral whose condition is already true is not a deferral, it is an unnoticed decision.

**Done when:** the real domain serves the site over HTTPS and analytics is collecting.

---

## Phase 2 — Make it findable  ✅ DONE (27 Aug)

**Every item is built and verified against the running site, content included.** The sitemap now carries **89 URLs**.

**Phases 0, 1 and 2 are complete. Nothing in Phase 3 is blocked by build work any more** — and as of **29 Aug the company USD/EUR accounts are open**, which removes the first and larger of the two gates. The 2–4 week analytics window is what remains, and it binds **Amazon only** (see §3 and the Communication report); Awin and CJ are applyable now.

| # | Task | Status |
|---|---|---|
| 2.1 ✅ | **Per-fragrance routes** — `/fragrance/[slug]`, 68 static pages via `generateStaticParams` | Took the sitemap from ~11 URLs to 78. The catalog had generated **zero** indexable URLs before this. |
| 2.2 ✅ | Canonical URLs on every page | **Finished 27 Aug.** The first pass missed three routes: `/comparison/[slug]`, `/guide/[slug]` and `/review/[slug]` emitted **no canonical at all** and built their JSON-LD `url` from a hardcoded `example-placeholder.com` fallback instead of `lib/site.ts`. All three now use `absoluteUrl()` and carry canonical + article OG. Verified: zero occurrences of the placeholder host in served HTML. |
| 2.3 ✅ | Per-page OpenGraph + Twitter cards, **and the share image** | **Finished 27 Aug.** `public/og-cover.png` (1200×630) now ships on every page with width/height/alt. Rendered once via Satori using the site's own Cormorant Garamond and `globals.css` palette, then committed as a static asset — see the note below on why it is not a generated route. |
| 2.4 ✅ | `Organization` + `WebSite` sitewide, `BreadcrumbList` on fragrance pages | |
| 2.5 ✅ | Homepage metadata | |
| 2.6 ✅ | `lastModified` in the sitemap | Verified present on all three entry groups (static, references, content). |
| 2.7 ✅ | **Content: 10–12 real pieces — target met** | **12 published, 11,996 words** (was 1 piece / 434 words). The last three took the COO's steer and changed shape: **original-anchored** rather than generic — *Baccarat Rouge 540 alternatives*, *Aventus alternatives*, *Sauvage alternatives*, the three highest-demand dupe queries in the category. Each analyses the real note structure from our own catalog data, explains **why** that original is easy or hard to copy (BR540 is six notes built on freely-available amberwood; Aventus is twelve notes whose character is an *interaction*, and whose own batches vary), and says what to check before buying. All 21 internal links verified resolving against the built site. |
| 2.8 ✅ | **Sitemap emitted 86 redirecting URLs** — found by the board, fixed | `trailingSlash: true` makes `/about` a 307 to `/about/`, but every sitemap entry was emitted **without** the slash while every canonical carried one. The sitemap advertised 86 explicitly non-canonical URLs on the day Google began crawling. Fixed via `canonicalUrl()` in `lib/site.ts`; verified 86 of 86 now match. |
| 2.9 ✅ | **Build now refuses to ship a link to a 404** | `content/loader.ts` fails the build if a piece's content type has no route. `app/comparison/[slug]` and `app/review/[slug]` were deleted in the export migration, so writing one comparison would have shipped a card pointing at a dead URL — the first thing an affiliate reviewer clicks. Checks the filesystem rather than a hand-maintained list, because keeping a list in step is the step that gets missed. Verified by hiding the guide route and watching the build fail. |

> **Why the share image is a committed PNG, not `opengraph-image.tsx`.** Next's `ImageResponse` only runs under the **edge** runtime in this project — the Node runtime path crashes the request outright. Adopting edge would have given the site its first dynamic route and cost it the property that makes free static hosting viable (see Phase 1's host comparison). The card is one fixed brand image that never varies per page, so generating it per request bought nothing. To change it, re-render from a throwaway edge route rather than editing the PNG.

### The content constraint nobody had written down

**`comparison` and `review` pieces cannot honestly be written yet**, and this is structural rather than a matter of effort. `content/schema.ts` requires a `productRef` — with a mandatory `affiliateLinkId` — on every `comparison` (min 2 products) and every `review` (exactly 1). There are currently **zero listings and zero enrolled programmes**, so any such piece would have to invent a product to point at. That is precisely the failure Phase 0 just spent a day undoing.

Only `guide` pieces (where `featuredProducts` is optional) are writable now. That is not a loss: guides about the **originals** — 68 real, researched references — are honest, need no affiliate link, and internally link to the `/fragrance/[slug]` pages 2.1 just created, which is what makes those pages rank.

**Consequently this phase's old target — "every merchant we apply to appears in ≥2 published pieces with real prices and a working link" — belongs to Phase 3, not here.** It cannot be met before enrollment.

Published so far (all `guide`, all `disclosure: false`):

| Piece | Words |
|---|---|
| How to Actually Find a Fragrance Dupe That Works | 954 (was 434 — expanded) |
| EDT, EDP, Extrait: What Fragrance Concentration Actually Changes | 1,166 |
| Why a Fragrance Smells Different on You Than in Every Review | 1,227 |
| Top, Heart, Base: How to Actually Read a Fragrance Note Pyramid | 1,169 |
| How to Make a Fragrance Last Longer (and What Doesn't Work) | 1,051 |
| Are Fragrance Dupes Legal? And Are They Safe to Wear? | 1,036 |
| Fragrance Families Explained | 879 |
| Designer vs Niche vs Dupe: What You're Actually Paying For | 919 |
| How to Buy a Fragrance Online Without Smelling It First | 908 |

**9 of 10–12. ~9,300 words.** All **30 distinct internal links** across the nine are verified resolving against the built site, not assumed — a check that exists because an early piece shipped a link to `/fragrance`, which has no index route.

The nine are a deliberate cluster, not nine unrelated posts: each answers a real search question, needs no affiliate link, cross-links to the others, and points into the `/fragrance/[slug]` pages 2.1 created — which is what gets those 68 pages crawled rather than sitting orphaned in a sitemap.

> **`disclosure` was being set dishonestly.** The block reads "This piece contains affiliate links" — untrue on every piece currently published, since none contain any. The schema defaults it to `true`, and the pre-existing guide had it on. All four are now `disclosure: false`; it flips back per-piece as real links land in Phase 3.

**Done when:** 10–12 pieces are published and GSC shows the catalog indexed.

---

## Phase 3 — Turn the money on

Cost: ~$5, refundable. Owner: Communication. Blocked on: Phases 0–2.

| # | Task | Note |
|---|---|---|
| 3.1 ✅ | **Apply to Awin** — **done 30 Aug, verified/approved** | **One application, not two.** ShareASale migrated into Awin (2025-08-15) and its platform closed 2025-10-06 — verified. ~~ALT. Fragrances and Dossier are both merchants *inside* Awin.~~ **Stale as of 30 Aug: ALT. Fragrances' Awin programme closed** (vanished from Pending *and* from the general advertiser search, not just rejected) and **Dossier was never found there either.** Treat Awin's dupe-side coverage as unresolved, not settled. |
| 3.2 ✅ | Apply to merchants inside Awin | **DONE — superseded 3–4 Sep. Two merchants now earn.** **Opulensi Perfumes (Awin 123248)** approved and tracking, wired 1 Sep, 30 links. **Clone of Perfume (Awin 117395)** approved 3 Sep — **the first actual dupe house**, 9 links, every product declaring its own designer inspiration, so every pairing is cited rather than asserted. **AromaPassions (Awin 34989)** applied, pending. The "zero merchants" verdict below was true on 1 Sep and is kept because its *reasoning* still governs: approval, a feed, and green payment status still do not mean a link earns — that is why every one of the 39 links was traced end to end before shipping. Original note follows. ~~**The one approval does not trade. Verified 1 Sep:**~~ every My Perfume Shop link — the feed's own `aw_deep_link` and a hand-built `cread.php` link alike — redirects to `awin1.com/closedMerchant.html?mid=106089&aid=3064149`, while the merchant's own product page returns 200. The dashboard's **"link status offline"** is the field that governs earning; **payment status green does not override it** (it only says where money would go). So the honest count of merchants we can earn from is **zero**, and a buy button here would land a buyer on an Awin error page. Original note follows. **First approval landed 31 Aug: My Perfume Shop** (Awin ID 106089). Applied 30 Aug to ALT. Fragrances, My Perfume Shop, The Fragrance Counter, and the in-network "ShareASale" listing — ALT., The Fragrance Counter and "ShareASale" all subsequently disappeared (programmes closed, not rejected). **My Perfume Shop is approved but it is a *genuine-designer* retailer** (Australia-led — Dior, Chanel, Tom Ford; ships AU/NZ/UK; 30-day cookie), so it is **originals-side like Escentual, not a dupe house.** It backs "buy the original" links and the real original price behind the "Nx cheaper" claim — it does **not** unblock `DUPES` or dupe `comparison`/`review` content, which still have no merchant. Still pending: **Escentual** (also originals-side, applied same day). Lesson from 30 Aug still stands: network approval ≠ merchant approval, and merchant existence on the network isn't stable either. |
| 3.3 ◐ | **Apply to CJ, then its fragrance advertisers** | **Updated 5 Sep: the 3 Sep correction here was itself wrong, and the original prediction was right.** That note said our CJ approval was a dupe house and that "CJ carries no dupe houses" was therefore false. **It checked the wrong company.** Three separate businesses share a near-identical name:

| domain | what it actually is |
|---|---|
| **fragranceshop.com** | **our CJ advertiser** — US discount retailer of GENUINE designer fragrances, New Jersey, trading since 1998 (Chanel, Dior, Gucci, Versace, Burberry). Grey-market/parallel import, which is how the prices are low. |
| thefragranceshop.com | a dupe house — alcohol-free oil replications. **Not our advertiser.** The 3 Sep note quoted this site's disclaimer. |
| thefragranceshop.co.uk | unrelated UK retailer of genuine designer fragrances. |

So **CJ is the originals rail**, exactly as this row first predicted, and the alcohol-free-oil-concentrate warning does not apply to our advertiser. **Verify a merchant against the domain in the CJ advertiser record, not against a name search** — the name collision here is close enough to invert a whole phase's plan.

**Feed status, 5 Sep:** product export created (Shopping/Google format, TAB-delimited, filename `AdvertiserName-FeedName-shopping.txt.zip`). **Not yet delivered** — CJ generates on schedule and sends a separate "ready" notification; only the format sample is downloadable before that. **Do not use CJ SFTP:** `datatransfer.cj.com` runs Apache SSHD 2.5.1 offering **only `ssh-dss`** host keys, which OpenSSH has removed outright and recent paramiko dropped — `no matching host key type found. Their offer: ssh-dss`. curl's libssh2 still speaks DSA but needs a `known_hosts` entry no keyscan tool will produce. Use **CJ HTTP/S** transport instead. Original note follows. ~~**CJ application submitted 31 Aug — pending CJ review.**~~ Once in, apply (priority order): **FragranceX** (advertiser ID 1024283 — category leader on CJ, ships worldwide, 1–10%), **Notino** (~5%, best for any EU/UK traffic), **Perfumania** (~4%, 15-day, US). Jomashop optional. All are *originals* discounters — CJ carries no dupe houses (Dossier is ShareASale→Awin; ALT./Oakcha run in-house programmes). CJ is the backup rail for the "buy the original" side, not a route to `DUPES` data. Company Payoneer account approved and earmarked for CJ payout. |
| 3.4 ✅ | Populate `affiliateLinks` (was **empty**, before that 18 placeholders); link shape reworked | **Now 39 entries across two merchants (Opulensi 30, Clone of Perfume 9) as of 4 Sep.** Original note, from the first three: **Done 1 Sep — 3 real entries, all Opulensi (Awin 123248).** `AffiliateLinkEntry` now carries `network` + `merchantId` + `deepLink` + `subId`, and `affiliateDestination()` composes the destination so a hand-edited entry cannot disagree with itself. `/go/` resolves for those three ids and still 404s for everything else. Every entry was **traced end to end before being added** — final URL on `opulensi.com`, our `clickref` echoed back as `utm_id=3064149_<subId>`, `awc=` cookie set. That check is now the documented gate (`scripts/feeds/README.md`), because My Perfume Shop proved that approved + feed + green payment status can still mean zero tracking. |
| 3.5 ✅ | **Sub-ID scheme, before the first real click** | **Done 1 Sep.** `<listingSlug>__<referenceSlug>`, emitted as Awin `clickref` / CJ `sid` via `SUB_ID_PARAM`. Baked into the destination at build time — `/go/<id>` is a static redirect in an export, so it cannot be composed per request. **The guide's third `__<surface>` segment is deliberately dropped**: one destination per id means a surface segment needs a separate link id per surface, for a breakdown GA4 outbound-click events already give against the firing page. `scripts/generate-redirects.mjs` **fails the build** on a missing `subId` or an unknown network. Revisit the surface segment only if a `main` Worker ever handles `/go/*` per request. |
| 3.5b | Server-side click logging | Not built, and not needed yet. There is no server — the honest options are GA4 outbound-click events (enough for "which pages convert") or a `main` Worker in the root `wrangler.jsonc`. Do the Worker before the first paid campaign, and move the `/go/` mapping *into* it: `_redirects` rules are not applied to requests served by Worker code. |

> ~~**Link shape needs changing.** `AffiliateLinkEntry` holds one bare `destinationUrl`, but Awin and CJ both require a network click URL with the destination URL-encoded inside it.~~ **Done 1 Sep** — see 3.4.

> **The distinction this phase actually turned on, worth carrying forward:** *joined* and *able to earn* are different states, and only one of them is visible in the Awin dashboard's headline. My Perfume Shop is approved, supplies a 9,844-row feed, and shows payment status green — and every link it has ever issued dead-ends at `awin1.com/closedMerchant.html`. **Trace the redirect before wiring any merchant**, and treat a green payment status as saying only where money would be sent.

### 3.6 — The parallel path that does *not* wait on Awin (founder proposal, 27 Aug)

Everything above is blocked on a third party approving us. **One route is not:** most dupe houses run their own Shopify store, so a paying subscriber can link straight at it with no network in between. Written up in full as `PRODUCER-PROGRAM.md` §6a.

This is worth stating in the guide's own terms because it **breaks the Phase 3 → Phase 4 dependency that the rest of this plan is built around.** A subscribing producer supplies the same three things the affiliate feed was going to: real product names, real prices, and **imagery they own the rights to** — which is the other thing blocking the site, since `imageUrl` is empty on all 68 references because bottles are protected trade dress. It also removes the subscription-*and*-commission double-dip for those listings: we take the subscription **instead of** commission, which decouples our revenue from ranking outcomes entirely — the strongest structural answer to the integrity problem at the foot of this doc.

**Four conditions before it ships:**

| # | Condition | Why it is not optional |
|---|---|---|
| 3.6a | **`rel="sponsored"` on every paid outbound link** | Verified against Google's own spam policy: links bought through a subscription are paid links, and unmarked dofollow paid links are a link scheme. **The penalty lands on our domain, not the producer's.** |
| 3.6b | **"Unlimited" = unlimited *originals covered*, not unlimited rows** | One listing per (producer, reference) pair — caps naturally at 68 today. Otherwise a producer blankets the catalog with 40 near-identical variants to crowd out competitors. |
| 3.6c | **It buys coverage, never placement** | The unverified score cap applies to these exactly as to any other listing. Listing volume is a legitimate tier lever; rank is not. Keep them separate in the pricing copy as well as the code. |
| 3.6d | **Stop promising conversion data for store-direct listings** | With no network there is no conversion report — we would see clicks and nothing else. The Featured tier currently promises conversion data; that must be qualified or the promise breaks on day one. |

**Done when:** one real commission appears in a network dashboard — **or** one producer pays for store-direct listings, whichever comes first.

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
| 4.1 ✅ | Build a feed ingest path (the first non-hand-written data source in the project) — **done.** `scripts/ingest-feed.mjs` (merchant offers), `scripts/match-feed-pairings.mjs` (proposes dupe→original pairings from what a feed actually *says*, and it proposes, it does not decide), `scripts/fetch-dupe-images.mjs` / `fetch-feed-images.mjs` (imagery), `scripts/check-affiliate-links.mjs` (traces every link and reads live stock). Three feeds ingested: Opulensi, My Perfume Shop, Clone of Perfume. |
| 4.2 ◐ | Import real prices; retire the hand-maintained constants — **half done, and the remaining half is deliberate.** Each offer now carries the merchant's own price in the merchant's own currency, never converted. `priceUsd` stays hand-maintained because a *discounter's* price cannot feed the "Nx cheaper per ml" claim: Opulensi's only Armaf row is a £68.99 limited edition of a fragrance that street-prices near $40. Clone of Perfume is the exception that proves it — it is the brand's own store, so its price *is* the street price. |
| 4.3 ✅ | Populate `imageUrl` from affiliate-supplied imagery — **done, 195 images** (156 reference from My Perfume Shop, 39 dupe from Opulensi + Clone of Perfume; both generated manifests match those counts exactly). Two of the 41 listings still have none — the two carried only by My Perfume Shop, whose programme is closed, which is the licence rule working rather than a gap. Never hand-set on a data entry; merged in at module load from generated manifests, so the diff always says where a picture came from. The licence rides on the affiliate relationship, so an image is only taken where the programme actually tracks. |
| 4.4 ◐ | Expand the reference catalog from the feed — REFERENCES is **200**, but hand-researched rather than feed-derived. Feed-driven expansion is still unbuilt, and the ceiling worth knowing is on the *dupe* side: coverage is capped by what the dupe industry actually clones, not by our merchant count. |
| 4.5 ◐ | **Re-check the house-product ranking before listings go back in.** The *scoring* half is now fixed in code (27 Aug): a house product can never publish above the cap, and rank can no longer invert against displayed scores. The **data** half is not fixable in code and remains open — see the integrity problem at the foot of this doc. |

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

1. ~~**Decide payee — A.Ş. vs individual.**~~ ✅ **The A.Ş.** (27 Aug, revised from "personal" once the Awin invoicing constraint was faced).
2. ~~**Open Payoneer.**~~ ✅ Open (27 Aug).
3. ~~**Register the apex domain.**~~ ✅ `counterscent.com`, plus `contact@counterscent.com` (27 Aug).
4. ~~**Choose a host and deploy.**~~ ✅ Done 27 Aug — Cloudflare Workers, $0/mo, live at counterscent.com with email intact.
5. ✅ **Open the company USD (*döviz*) account** — **DONE 29 Aug: USD *and* EUR company accounts opened.** Was the top blocker. The reasoning it closed out stands as the record of why it mattered: an A.Ş. invoice paid into a personal account would not survive review by the *mali müşavir*, and could not be fixed retroactively once payouts had started.
6. **Supply the Hostinger receipt** — amount, currency, and whether auto-renew is on. No agent can retrieve this: `hostinger-billing` is deliberately not configured because it exposes purchase operations. The ledger records **nothing** about this project until you provide it.
7. **Decide on producer store-direct links** (§3.6) — this is the one path to a populated catalog that does not wait on Awin approving us. **Still open as of 30 Aug.**
8. ~~**Decide GA4 cookies vs KVKK.**~~ ✅ **Cookieless GA4 chosen and shipped** (`client_storage: 'none'` + `anonymize_ip`) — no consent banner needed under KVKK/ePrivacy since no cookie is written. Trade-off recorded elsewhere: this inflates *Users* toward *Sessions*, so that number must never be quoted on an affiliate application — use Cloudflare Web Analytics instead.
9. ~~**Apply to Awin.**~~ ✅ **Applied and verified 30 Aug**, payment details configured (Payoneer pass-through into the company USD account), threshold set. **First merchant approved 31 Aug: My Perfume Shop** — see §3.2.
10. ~~**Apply to CJ.**~~ ✅ **Submitted 31 Aug**, pending CJ review — see §3.3. Next: once CJ approves, apply to FragranceX through it.

---

## Board review, 27 Aug — what the COO and CFO found

Both ran read-only and verified against files rather than asserting. Their findings, with what has already been actioned:

**Fixed immediately:**

- **Every sitemap URL was a redirect.** `trailingSlash: true` means `/about` 307s to `/about/`, but all 86 sitemap entries were emitted *without* the slash while every canonical carried one. The sitemap was advertising 86 explicitly non-canonical URLs at the exact moment Google started crawling. Fixed via `canonicalUrl()` in `lib/site.ts`; all 86 now match.
- **`scripts/generate-redirects.mjs` named the wrong platform.** It told the next session to restore click logging with "a Cloudflare Pages Function at `functions/go/[slug].js`" — but this deploys as a **Worker**, where a `functions/` directory does nothing. Two files gave contradictory instructions on the one path that will carry every affiliate click. Corrected.

**Also fixed since, all verified against the running build:**

- ✅ **The score cap did not protect against us.** The cap keyed on the `verified` status — and **we are the only party who grants `verified`**, while also selling a fragrance line on a site branded *"Independent Fragrance Comparisons"*. Nothing structural stopped COUNTERSCENT marking its own bottle verified and publishing uncapped at #1: self-certification wearing the badge of editorial review. `getPublishedScore()` now takes the whole listing rather than a bare status, so no call site can bypass it, and derives house-ness from a single definition shared with the buyer-facing disclosure so the two cannot disagree. The badge reads **"Our own product — self-declared"**. Proven with two probe listings identical in notes, facets and `verified` status, differing **only** by producer: **90% house (capped) vs 92% third party (raw)**.
- ✅ **A second defect the probe exposed, which nobody had reported.** Ranking sorted on the *raw* score while display showed the *capped* one — so the house listing sat at **#1 showing 90%, above a listing showing 92%**. A ranking that reads as if it is hiding something. Now sorts published → raw → price-per-ml: the published key stops the inversion, the raw key keeps ordering meaningful among listings tied at the cap.
- ✅ **`library-tabs.tsx` filtered deleted route types.** It rendered permanent "Comparisons (0)" and "Reviews (0)" tabs, advertising an empty catalog to every visitor. Tabs are now derived from what is actually published and return on their own when a second type lands.
- ✅ **`lib/verification.ts` cited a comment that no longer existed.** Dangling evidence pointer, repointed at where the evidence now lives.

**Still open — and this one is a founder call, not a code change:**

- **Content has no commercial intent.** Nine informational guides compete in the most saturated vertical online and will not convert even after links land. Original-anchored formats — "*&lt;original&gt;* alternatives" — are writable as `guide` **today**, need no `affiliateLinkId`, and seed the `/fragrance/[slug]` pages that will later hold the links. Stop generic guides at 9–10; spend the rest there.

**Accounting — the ledger does not know this project exists:**

- `departments/accounting/ledger.md` holds **one row** (OpenArt, $29/mo, itself unconfirmed since 19 Aug). Running balance −$29.00, and **100% of it unconfirmed**.
- The domain and mailbox were paid today and are **not logged**. No agent can retrieve the amounts: `hostinger-billing` is deliberately not configured, so the founder must supply the receipt — amount, currency (TRY or USD), and whether auto-renew is on. This recurs at every renewal.
- ◐ **"Costs sit in the A.Ş., revenue will land personally."** The founder resolved the *entity* half on 27 Aug — the payee is the A.Ş. — but the **account** half is now the sharper version of the same problem: the only USD account on record is personal, so the invoice issuer and the payee would be different legal persons. Until that is settled the A.Ş. still shows permanent loss with no revenue line. **This is the single blocking item for Phase 3.**
- ✅ **The payee escape clause triggered, and has been closed.** The doc deferred the Awin invoicing problem "only if Awin is added" — but Awin *was* already the plan. Answered 27 Aug: an individual cannot casually issue a *fatura* to a UK company, so **the payee is the A.Ş.** The general lesson is recorded in Phase 1: a conditional deferral whose condition is already true is not a deferral.
- **Two docs disagree on the Awin signup fee** (~$5 refundable vs "free to join"). Unverified either way.
- Also unlogged and unchecked: whether `TWENTY_FIRST_API_KEY` is a paid tier, whether Payoneer charged an opening or inactivity fee, and whether the *mali müşavir* billed for the payee consultation.

**Checked and closed:** Cloudflare's free plan permits commercial use — the same question that ruled out Vercel Hobby had never been asked of Cloudflare.

---

## The integrity problem — now half solved, and it matters which half

`No. 01 Ember` — our own product — rendered **#1 at 79%** on Baccarat Rouge 540, ahead of every real listing. Verified against the live server, not inferred.

**✅ The scoring half is fixed (27 Aug).** A house product can no longer publish above the unverified cap however its status field reads, so it cannot display a number that only an independent check is allowed to earn; and the ranking can no longer invert against the displayed scores. Both are enforced in code and proven with probe listings.

**❌ The data half is not fixable in code, and is the part that actually matters.** A house listing whose declared notes are written to sit close to the reference will still *legitimately* out-rank honest third-party listings — the formula only ever sees the data it is given. Nothing in the code favoured Ember; we simply wrote its note list favourably. When the same three products were later written as honest formulation compromises, our bottles ranked **last** on Aventus and **last** on Sauvage. That is the proof it is authorship, not arithmetic.

**It is dormant, not gone.** `DUPES` is empty, so nothing renders — the problem returns the moment listings are repopulated with Ember among them.

The `HouseBadge` disclosure is real, the tie-break favours the cheaper bottle, and the cap now binds us as tightly as anyone. The mechanism is honest. **Whoever repopulates `DUPES` owns the remaining risk**, and the COO's recommendation stands: **launch with no house products at all until Awin approves.** A merchant reviewer seeing us rank first on our own comparison is the rejection — and no amount of correct code prevents that impression.
