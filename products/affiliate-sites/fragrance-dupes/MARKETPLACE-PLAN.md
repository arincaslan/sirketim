# COUNTERSCENT marketplace pivot — plan

Status: **planning only**. No code changed, no database provisioned, no payment processor connected, no producer accounts exist. This document exists to nail down the business model and technical shape before any implementation starts — the founder asked for this explicitly after seeing the live site for the first time (2026-08-26) and proposing the pivot below.

This evolves the existing COUNTERSCENT site (`products/affiliate-sites/fragrance-dupes/`) in place. It is not a new product.

---

## 0. The pivot, in one paragraph

COUNTERSCENT today is a single-author, single-dataset comparison site: one fixture array (`lib/dupes-data.ts`) of reference fragrances and their dupe candidates, picked and written by whoever builds the site. The founder wants it to become a **two-sided marketplace**: other dupe producers submit their own products with their own affiliate links, pay a subscription for the privilege, and the founder personally approves or rejects each submission before it goes live. Revenue comes from two places — producer subscriptions, and commission/affiliate revenue on every sale that happens through the site, whether the buyer ends up choosing a dupe **or the original** (the original fragrance needs its own buy link too, not just the dupes it's compared against). The founder's own in-house fragrance line joins the same catalog as a first-party option, with real unit economics to work from: **$8.51 production cost per 55ml bottle**. Product photos for that line aren't available yet — this doc does not invent placeholder imagery for it.

---

## 1. Business model

**Two sides:**

- **Producers** (dupe makers, currently referenced in the fixture data as names like Dossier, MicroPerfumes, ALT. Fragrances, Regency Fragrances, Divain, Parfum Inspirations, hkPerfumes — see `departments/sales/affiliate-program-signup-checklist.md`) subscribe to list their own dupe products against reference (original) fragrances, each listing carrying that producer's own affiliate link.
- **COUNTERSCENT / Sirketim** reviews every submission before it's visible on the site — a moderation gate, not auto-publish. The founder does the approve/reject call personally, at least at this stage.

**Revenue streams:**

1. **Producer subscription fees** — recurring payment for the ability to submit and maintain listings. Tiering, price points, and billing period are open questions (§5) — not decided here.
2. **Commission on sales** — COUNTERSCENT earns a cut (affiliate commission, or a direct commission if COUNTERSCENT brokers the transaction itself) on every purchase made through the site, regardless of which option the buyer picks: a producer's dupe, the original fragrance, or COUNTERSCENT's own line. This means the **original** fragrance needs a real buy/affiliate link on every comparison, not just the dupes — today's `ReferenceFragrance` type (`lib/types.ts`) has no link field at all, only `DupeCandidate` does (`affiliateLinkId`).
3. **First-party margin** — COUNTERSCENT's own fragrance line sells directly (or via whatever checkout/fulfillment path gets chosen, §5) with a known cost basis: $8.51 per 55ml bottle. This is the one catalog entry that isn't affiliate-driven — it's an actual product with real margin.

**What's still open**: exact subscription pricing, commission percentage, and whether COUNTERSCENT ever takes on real transaction/payment liability (vs. staying pure affiliate-link cloaking) — see §5.

---

## 2. Comparison-page redesign

The existing mechanic — the Dupe Finder (`components/dupe-finder/`, `lib/dupes-data.ts`, `lib/similarity.ts`, `lib/radar-geometry.ts`) — already does reference-fragrance-picker → ranked dupe matches → radar chart + spec panel comparison. That flow is the right foundation; the pivot changes *where the data comes from and how much of it there is*, not the core interaction.

Changes needed:

- **Brand-by-brand categorization.** Today's dataset is a flat list. With multiple producers submitting multiple dupes against the same references, the browse/library experience (`app/library/page.tsx`, `components/library/library-tabs.tsx`) needs real category structure — by original brand, and likely by producer brand too, so a buyer can browse "everything that dupes Chanel" or "everything from producer X."
- **Search.** Needed for both sides: search originals by name/brand/family (to start a comparison), and search/filter dupes by producer, price, or fragrance family once the catalog is no longer a small hand-picked set.
- **The buy flow stays pick-original → see ranked/categorized dupes → compare → buy**, but "buy" now needs to branch three ways per comparison: buy the dupe (producer's link), buy the original (a link that doesn't exist in the data model yet), or buy COUNTERSCENT's own version where one exists.
- **Customer reviews.** The site's existing "review" content type (`content/review/*.mdx`) is editorial — written by `content-strategist`, not by buyers. This pivot adds a second, distinct kind of review: real customers rating and writing about a specific listing (a producer's dupe, the original, or COUNTERSCENT's own line) after trying it, with an "Add a review" action on that listing's page. This is genuine social proof for a marketplace where the buyer is choosing between several unfamiliar producers' claims — arguably more load-bearing for conversion than the editorial reviews are, since it's other buyers vouching rather than the site vouching for itself.

This is a real content-architecture and component change, not just new data — the current UI wasn't designed for "which of N producers' dupes for this one reference should render first," and that ranking/filtering logic doesn't exist yet.

---

## 3. Data model

Today's model (`lib/types.ts`) is two flat interfaces — `ReferenceFragrance` and `DupeCandidate` — held in one in-memory array (`lib/dupes-data.ts`) with no concept of who submitted an entry, whether it's approved, or whether anyone's paying for it to be there. That's fine for a single-author fixture dataset; it has no room for multi-tenant submissions or billing state.

New entities this pivot needs:

- **Producer** — an account: identity, contact/payment info, subscription status.
- **Subscription** — who's paying, what tier, what period, current status (active/lapsed/cancelled). Tied to a Producer.
- **Listing / Submission** — what used to just be a `DupeCandidate` row, now owned by a Producer, carrying an **approval-status lifecycle** (submitted → approved / rejected, plus room for "needs changes" or similar). Only `approved` listings render on the live site.
- **Reference (original) fragrance** — same idea as today's `ReferenceFragrance`, but extended with its own affiliate/buy link, since originals are now purchasable through the site too.
- **COUNTERSCENT's own product** — a distinct entity type from a producer Listing: no subscription, no approval workflow (it's the house brand), but its own cost/margin fields (starting from the $8.51/55ml figure) rather than an `affiliateLinkId`.
- **Customer Review** — author (name or account), star rating, text, which Listing/Reference/own-product it's attached to, submission timestamp, and its own lightweight moderation state (at minimum spam/abuse filtering; whether every review needs founder approval like producer Listings do, or publishes immediately with after-the-fact moderation, is an open question — see §5). Distinct from the existing editorial `review` MDX content type, which stays as-is.

This is very likely the real trigger for the database transition `departments/web-development/reports/affiliate-sites-technical-plan.md` already flagged as a future revisit ("needed until either a non-technical human starts editing directly, or volume moves into the hundreds-to-thousands range... revisit then, not now" — this pivot is that revisit). MDX-in-git, the content pipeline that document settled on, was designed for editorial content authored by `content-strategist` — it has no natural way to represent a Producer submitting a Listing through some review queue with billing state attached. Long-form editorial content (guides, comparisons, reviews) can likely stay MDX; producer/listing/subscription data cannot.

---

## 4. Backend requirements

Per `departments/web-development/CLAUDE.md`'s own default stack: **Postgres** (via Neon or Supabase — neither provisioned yet), **Prisma** as the ORM, **Auth.js** for accounts. Concretely, this pivot needs:

- **Producer accounts and auth** — sign-up, login, a submission form, a view of their own listings' approval status.
- **An approval-queue admin surface** for the founder — see pending submissions, approve/reject, presumably with a reason/feedback field for rejections.
- **Subscription billing** — recurring payment collection from producers. Nothing payment-related is configured anywhere in this repo today; **Stripe** is the obvious default for Next.js + the department's stack, but this is a real gap to close, not an assumption to make silently.
- **Affiliate-link cloaking at scale** — the existing `/go/[slug]` redirect pattern (`app/go/[slug]/route.ts`, shared via `departments/web-development/lib/affiliate-site-kit/`) already does link cloaking for one dataset; it needs to extend cleanly to many producers' many links, plus however COUNTERSCENT tracks its own commission/attribution on top of that (click tracking, conversion tracking — neither exists today).

None of this is provisioned yet. This section names what's needed, not a build order — that's the "stronger backend" conversation the founder asked to have separately.

---

## 5. Open questions

These are real decisions, not implementation details — flagged here rather than decided unilaterally:

- **Subscription pricing and tiers** — flat fee? Tiered by number of listings or catalog placement? Monthly vs. annual?
- **Commission percentage** — on producer sales, and (if COUNTERSCENT ever brokers original-fragrance or its own-line sales directly) on those too.
- **Approval criteria and SLA** — what makes a submission acceptable beyond "founder likes it"? `DESIGN.md`'s existing trademark caution (never depict real branded bottles photorealistically) presumably extends to producer-submitted imagery too — worth an explicit content-and-IP policy before the first real submission arrives.
- **Customer review moderation** — pre-moderated like producer Listings (nothing shows until approved) or published immediately with after-the-fact removal? Whether a review requires a verified purchase (harder to fake, but needs the site to know a purchase happened — which it currently can't, since it only ever redirects to someone else's checkout). Whether producers can respond publicly to a review on their own listing.
- **Payment processor choice** — Stripe is the default guess, not a decision.
- **How COUNTERSCENT's own line actually sells** — through the site's own checkout (a real e-commerce build, which this site explicitly doesn't have today — see README's "no backend, no database, no cart"), or by routing to an external store/marketplace listing instead?
- **Legal/compliance for real transactions** — taking a commission on a brokered sale is a different liability and disclosure posture than pure affiliate-link cloaking (which just redirects to someone else's checkout). This distinction matters for FTC disclosure requirements and potentially payment/merchant-of-record obligations, and isn't resolved by anything currently in this repo.

---

## Next step

Founder review of this document, followed by the backend-architecture discussion referenced in the original ask (data model migration off the static fixture, provisioning Postgres/auth/billing, and a real implementation plan for the comparison-page rebuild) — not started here.

**See also:** `PRODUCER-PROGRAM.md` designs the subscription tiers, the producer submission flow, the approval queue, link attribution, and the ranking-integrity problem that §5's open questions only name. Written 2026-08-26.
