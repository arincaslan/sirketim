# Producer program: subscriptions, submissions, approval

Status: **planning only**. No producer accounts, no billing, no submission form, no approval queue exists. This document designs the mechanism that `MARKETPLACE-PLAN.md` §1 describes in one paragraph. Read that first for the overall pivot.

The data model this assumes (`Producer`, `DupeCandidate.producerSlug`, the `ReviewStatus` lifecycle) is already in `lib/types.ts` and `lib/producers.ts` as fixtures, so the shapes below are not hypothetical.

---

## 1. What a producer is actually buying

Worth settling before pricing, because if this answer is thin nobody subscribes at any price.

A dupe producer's problem is discovery. They make a competent alternative to Baccarat Rouge 540, and the customer searching for it has never heard of them. What DRYDOWN offers is **placement at the exact moment of comparison** - in front of someone who has already named the expensive fragrance they want and is actively looking for an alternative. That is far later in the funnel than an Instagram ad reaches.

Concretely, a subscription should buy:

- **Listings** against reference fragrances (how many depends on tier).
- **A producer page** - their own branded surface listing everything they have on the site. `getDupesByProducer()` already exists for this; the page does not.
- **Being in the comparison at all** - appearing in the ranked list, the radar chart, the spec panel.
- **Performance data** - clicks their listings received, which references drive them. This is genuinely valuable to them and cheap for us: `/go/[slug]` is already the single chokepoint every outbound click passes through, so the logging hook is one function call in a route handler that already exists.

What a subscription must **never** buy: a better match score, a higher rank, or a suppressed customer review. See §7.

---

## 2. Revenue model, and one real risk

The founder's model is subscription **plus** commission on every sale. Mechanically:

1. Producer subscribes (recurring fee to DRYDOWN).
2. Producer enrols DRYDOWN in their affiliate program and supplies a tracking link that credits us.
3. Approved listing goes live; clicks route through `/go/[slug]`.
4. DRYDOWN earns commission on conversions **and** the monthly fee.

**The risk, stated plainly:** charging a subscription *and* taking commission is a double-dip that most marketplaces deliberately avoid - they pick one. Amazon takes commission only. Etsy takes a listing fee plus a small commission, but the listing fee is cents, not a subscription. A small dupe house with thin margins may do the arithmetic and conclude that a monthly fee on top of commission makes DRYDOWN their most expensive channel, and simply not sign up. The whole marketplace depends on producers actually joining, so this is not a detail to discover after building the billing system.

Three ways to de-risk it, in rough order of how much they protect the launch:

- **Commission-only to start, subscription later.** Get listings on the site, prove the channel converts, then introduce a fee once producers can see what the traffic is worth. Slowest to revenue, most likely to actually get producers.
- **Free tier with paid upgrade.** One or two listings free, pay for more listings, the producer page, and analytics. Standard marketplace on-ramp; lets a producer test the channel at zero risk.
- **Subscription instead of commission, not alongside.** Simpler for the producer to reason about, and it decouples our revenue from ranking outcomes - which is quietly the strongest argument for it (see §7).

**Recommendation: free tier plus paid upgrade, commission on all tiers.** It gets listings on the site fastest, which is the actual bottleneck right now (68 originals, ~15 with any listing at all), and the free tier doubles as the sales pitch - a producer sees real click data before being asked for money.

This is a founder decision, not a technical one. The build does not change much either way; only the gate on `Subscription.tier` moves.

---

## 3. Tier shape (illustrative, not priced)

| | Free | Standard | Featured |
|---|---|---|---|
| Listings | 2 | 25 | Unlimited |
| Producer page | No | Yes | Yes |
| Click analytics | Totals only | Per-listing, per-reference | Plus conversion data |
| Respond to reviews | No | Yes | Yes |
| Priority in approval queue | No | No | Yes |
| Commission taken | Yes | Yes | Yes |

Deliberately absent from every tier: anything affecting rank or match score.

"Priority in approval queue" is the only defensible paid advantage over other producers, because it affects *how fast we look at their submission*, not *where they land in a comparison*. Prices need real research into what these houses spend on customer acquisition today - Sales should own that before a number is set.

---

## 4. Submission flow

Six steps, three of them ours:

**1. Producer signs up** - email, password or OAuth, business name, contact. `Auth.js` per the department's default stack.

**2. Producer creates a listing.** The form maps directly onto the `DupeCandidate` shape that already exists:

| Field | Notes |
|---|---|
| Reference fragrance | Which original this alternates. Picker over the existing catalog - they cannot invent an original, which keeps the reference set curated and prevents 40 spellings of "Baccarat Rouge". |
| Product name, concentration, size (ml), price | Price feeds the "Nx cheaper per ml" claim, so it must be maintained, not set once. |
| Note pyramid (top / heart / base) | Structured input, not free text - this feeds the similarity score. |
| Facet self-assessment (6 sliders, 0-10) | **The integrity problem, see §7.** |
| Affiliate tracking link | Their program's link crediting DRYDOWN. Stored, never rendered raw - resolved through `/go/[slug]`. |
| Product image | Only where they hold the rights. This is also how the site's empty `imageUrl` fields eventually get filled for dupes. |

**3. Automated validation before a human sees it** - link resolves and is not a redirect chain to somewhere unexpected, required fields present, price is plausible, no duplicate listing of the same product against the same reference.

**4. Founder review queue.** Pending listings with everything needed to judge them on one screen, plus approve / reject / request-changes, and a reason field. Rejection reasons should be a fixed list plus free text, because they become the producer-facing explanation and consistency matters.

**5. Live.** `status: "approved"` is the only state that renders.

**6. Ongoing.** Price and stock change. A listing nobody has touched in six months is a stale price on a live comparison, which is a misleading claim - so listings need a `lastVerifiedAt` and a nudge, not just a create-once flow.

---

## 5. Approval criteria

The founder is the gate, so the criteria should be written down before volume makes them ad hoc:

- **Accuracy** - do the declared notes and facets plausibly match the product? Wildly optimistic self-assessment is the main abuse vector.
- **Link integrity** - resolves to the actual product page, is the producer's own, does not redirect somewhere else.
- **Trade dress and IP** - product imagery must not copy the original's bottle or packaging, and the listing must not claim to *be* the original. `DESIGN.md`'s existing trademark caution applies to producer-submitted content too, and this is where legal exposure actually enters the site.
- **Legitimacy** - a real, shipping product from a real business.

**SLA:** commit to something and publish it. 3 business days is realistic for one person and short enough that producers do not assume the queue is dead.

---

## 6. Link handling and attribution

`/go/[slug]` already exists and is already the single chokepoint - it just needs to stop being static:

- Listing ids become database-backed rather than keys in `lib/affiliate-links.ts`.
- The `TODO once a real program exists: log the click event here` comment already in `app/go/[slug]/route.ts` becomes real: timestamp, listing, reference the click came from, coarse referrer. That single table powers both producer analytics and our own revenue reconciliation.
- **Reconciliation is the unglamorous hard part.** The affiliate network reports conversions; our click log reports clicks. Nothing automatically ties a payout to a listing unless sub-IDs are passed through per listing. Whatever network is used, per-listing sub-ID tracking must be set up from day one - retrofitting attribution after months of untagged traffic is not possible.
- **The redirect itself may not be allowed on every network.** Amazon's operating agreement bars obscuring the source site "including by use of Redirecting Links," which is precisely what `/go/[slug]` is. Probably fine where attribution is preserved, but unverified, and the penalty is account termination rather than a warning. Since this whole attribution design rests on that one chokepoint, confirm it per network before relying on it - see `departments/communication/reports/amazon-associates-application.md` §2.

---

## 7. The integrity problem

This is the part most likely to quietly wreck the site, and it deserves to be decided deliberately rather than drifted into.

DRYDOWN's positioning is "Independent Fragrance Comparisons." The pivot introduces two direct conflicts with that:

**Producers pay us and we rank them.** Every incentive points toward favouring payers. The defence has to be structural, not a promise: the ranking formula lives in `lib/similarity.ts`, is published on `/about`, takes no input related to subscription tier, and `getRankedDupesFor()` in `lib/catalog.ts` breaks ties toward the cheaper bottle rather than toward anyone paying. Keep it that way, and keep the tier table in §3 free of anything that touches rank.

**Producers self-report the facet scores that feed the ranking.** This is the sharper problem and it is not hypothetical - it already happened here, to us. `lib/dupes-data.ts` documents it: our own No. 01 Ember ranked first against Baccarat Rouge 540 at 79%, twenty-two points clear, purely because its note list was written to sit almost on top of the reference's. Nothing in the code favoured it. When the same three products were written as honest formulation compromises, our bottles ranked last on Aventus and last on Sauvage.

If we can do that to ourselves by accident, a producer whose revenue depends on rank will do it on purpose. Worse, the exploit is not subtle: `computeSimilarity` is `notesScore*0.5 + facetsScore*0.35 + familyBonus*0.15`, `familyBonus` is hardcoded to `1`, and both other terms return `1` on identical inputs. **Copy the reference's notes and facets verbatim and the formula returns exactly 100%.** Verified, not theorised.

### The standard (decided 2026-08-26, implemented in `lib/verification.ts`)

No formula over self-reported inputs can distinguish "genuinely this close" from "copied the answer key," so the answer is structural rather than mathematical:

1. **Verbatim copies are a publish gate, not a rank penalty.** If a submission's note pyramid *and* facet scores both match the reference's (`isVerbatimCopy`), the listing is flagged and excluded from comparisons entirely until a human clears it. Either signal alone can be honest coincidence; both together on self-reported data is the abuse pattern. Enforced in `getRankedDupesFor`, so a flagged listing cannot render at all.
2. **Unverified submissions are capped.** A "producer declared" listing publishes at most **90%**, however high its raw score computes. Only editorial verification lifts the cap. This is deliberately independent of subscription tier - a cap a higher tier could pay past would be selling rank, which §3 forbids.
3. **Ranking uses the raw score, display uses the capped one.** Order stays meaningful even where several listings tie at the cap.
4. **Differences are declared, not optional.** The submission form requires prose on what genuinely differs. A producer copying the note list has to also write, in sentences, that nothing differs - a much harder lie to tell casually, and something the approval queue can actually judge.
5. **The badge is public.** Every listing carries "Producer declared" or "Editorially verified," and `/about#methodology` explains what each means. The site already publishes how the score is computed; it now also publishes *where the inputs come from*, without which that disclosure was only half-true.

**Measured against the real catalog:** 0 of 37 existing listings trip the verbatim flag (no false positives), 5 sit above the cap and are limited by it, and a synthetic copy-paste submission scores 100% raw, is flagged, and never renders.

**Still open:** the cap ceiling (90) is a judgement call, and editorial verification does not scale - at volume this needs either customer reviews as the correction mechanism (a listing that overstates gets rated down) or narrowing the score to inputs checkable against a producer's public listing.

---

## 8. What blocks launch

In dependency order:

1. **Revenue model decision** (§2) - everything else is shaped by it.
2. **Postgres provisioned** - Neon or Supabase, neither exists yet.
3. **Auth.js producer accounts.**
4. **Payment processor** - Stripe is the obvious default, nothing is configured, and this needs a real business entity, tax details, and payout setup that is founder-side work, not code.
5. **Submission form + validation.**
6. **Approval queue.**
7. **Click logging and per-listing sub-ID attribution** (§6) - must exist before the first real click, not after.
8. **Written approval criteria and a published SLA** (§5).
9. **At least one real affiliate program enrolled** - without this the whole thing is a demo. See Communication's Amazon Associates preparation work.

Items 1, 4, and 9 are founder decisions or founder-side applications. Nothing in 2-8 is worth building until 1 is settled.
