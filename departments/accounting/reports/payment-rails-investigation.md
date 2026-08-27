# Payment rails investigation — PARFUMOZA marketplace

**Status: investigation only.** No account was created, nothing was applied to, nothing was configured. No ledger row was added (no transaction has occurred).

Written 2026-08-26 · Accounting (CFO) · Site: `products/affiliate-sites/fragrance-dupes/` (PARFUMOZA)
Builds on: `departments/communication/reports/amazon-associates-application.md`, `PRODUCER-PROGRAM.md` §2/§8, `MARKETPLACE-PLAN.md` §5.

---

## ⚠️ Read this before trusting any figure below

> **UPDATE 2026-08-26 — items 1, 2, 4 and 5 of §8 have since been verified live. See [§10](#10-live-verification-2026-08-26). Two findings in this report changed: Amazon direct deposit to a Turkish bank is confirmed *unavailable*, and Paddle is confirmed available to Turkish sellers. Read §10 alongside any section below.**

**No live verification was possible *at the time this report was written*.** Neither the CFO nor the `accountant` subagent has web access (`WebSearch`/`WebFetch` are not in either toolset). Every provider fact here comes from two sources only:

1. Model knowledge with a **May 2026 cutoff** — this report is written 2026-08-26, so there is ~3 months of unmonitored drift.
2. Prior in-repo research, principally `departments/accounting/CLAUDE.md`'s payout table (researched 2026-08-24).

**Payment-provider country support changes frequently and silently.** Every row marked *VERIFY* must be confirmed on the provider's own site before a single hour more is spent building against it. §9 lists them.

---

## 0. Bottom line

| Question | Answer |
|---|---|
| Is Stripe usable by a Turkey-based business? | **No.** High confidence. Turkey is not on Stripe's supported-countries list and never has been. |
| Is the existing Stripe code wasted? | **No.** ~60–70% survives a provider swap. The architecture is right; the provider calls are ~20 lines. |
| What should the subscription rail be? | **Paddle** (merchant of record) — *pending live confirmation it still onboards Turkish sellers.* |
| What is the more urgent rail? | **Payoneer for affiliate commissions.** That is the one that can receive real money this quarter. Subscriptions cannot — there are zero producers. |
| Biggest hidden trap found | Amazon's international **cheque** fallback ($100 + $15 fee, USD) is effectively uncashable in Turkey. If direct deposit isn't available, the account earns but cannot pay out. |

---

## 1. The critical question: Stripe and Turkey

**Finding: the assumption is wrong. Stripe does not support businesses based in Turkey.** Confidence: **high**, from two independent sources.

| Evidence | Source | Date |
|---|---|---|
| Turkey has never appeared on Stripe's supported-countries list (~46 countries). Turkish businesses see "Stripe is not available in your country" at signup; there is a new-markets waitlist, no launch. | Model knowledge | ≤ May 2026 |
| "Stripe does not support standard/Connect accounts for Turkey, and PayPal does not operate in Turkey — neither rail currently works for a Turkey-based seller." | `departments/accounting/CLAUDE.md`, Gumroad row | 2026-08-24 |

The second is independent, recent, in-repo, and was reached while investigating a *different* product (Gumroad payouts). Two separate investigations landing on the same conclusion is meaningful corroboration.

**What I could NOT confirm:** that this is still true as of today. I cannot load `stripe.com/global`. Given the 2026-08-24 in-repo finding is only two days old, the risk of staleness is low — but **the founder should load Stripe's supported-countries page once and settle it**, because everything downstream turns on it.

**Second-order consequence, easy to miss:** PayPal also does not operate in Turkey. Many payout rails below default to PayPal. Rule out PayPal everywhere in this report.

**One thing that is NOT a blocker:** Sirketim is a registered **A.Ş. with a tax ID on file** (confirmed 2026-08-24). Most "solo founder in Turkey" advice assumes no entity. That assumption is outdated here — the entity exists, which unlocks iyzico/PayTR and a business-payee option on several networks.

---

## 2. Money in from producers — the subscription rail

| Option | Available to a TR A.Ş.? | Fees | Recurring? | Payout | VAT/sales tax handled? |
|---|---|---|---|---|---|
| **Stripe (direct)** | **No** — high confidence | — | — | — | No |
| **Paddle** (MoR) | **Likely yes** — *VERIFY* | ~5% + $0.50/txn | Yes, native | Bank transfer (Wise-backed); PayPal n/a in TR | **Yes — Paddle is the seller of record** |
| **Lemon Squeezy** (MoR) | **Uncertain — VERIFY, see risk** | ~5% + $0.50/txn | Yes | PayPal (n/a in TR) or Wise | Yes |
| **iyzico** (TR) | **Yes** — entity + tax ID is exactly what it needs | ~2.5–3.5% + fixed, domestic cards | Yes ("Abonelik") | TR bank, **TRY** | No — you handle Turkish VAT |
| **PayTR** (TR) | Yes, same profile | Comparable | Yes | TR bank, TRY | No |
| **Stripe Atlas** (US entity) | Yes, but see cost | $500 setup + Stripe's 2.9%+$0.30 | Yes | US bank → TR | No (US sales tax becomes yours) |

### The real differences, not the fee differences

**Paddle / Lemon Squeezy — merchant of record.** They become the legal seller. That means *they* owe EU VAT, UK VAT, and US sales tax on every subscription, not Sirketim. For a solo founder selling recurring digital subscriptions to producers in the US, Spain and the UK, this is the single largest hidden liability being avoided — larger in practice than the ~2% fee premium over a raw processor. **This is why MoR beats a cheaper processor here.**

> **Lemon Squeezy risk, stated plainly:** Lemon Squeezy was **acquired by Stripe** (2024). Its historical advantage was onboarding sellers in countries Stripe itself doesn't serve. Post-acquisition, country-list alignment with the parent is a real and specific risk, and exactly the kind of change that happens quietly. **Do not choose Lemon Squeezy without confirming Turkish seller onboarding is still open.** Confidence: low–medium.

**iyzico / PayTR — wrong shape for this business.** They are excellent at collecting from *Turkish card holders in TRY*. PARFUMOZA's producers are Dossier (US), ALT. Fragrances (US), Divain (ES). Billing a US company in TRY through a Turkish PSP is a poor fit: FX friction on the producer's side, no VAT/sales-tax handling on ours, and weak international-card economics. **iyzico stays the right answer for Turkish direct-invoice clients — it is the wrong answer for this marketplace.**

**Stripe Atlas — the expensive escape hatch. Do not do this yet.**

| Real cost of an Atlas entity | Amount |
|---|---|
| Atlas setup (incl. year-1 registered agent) | ~$500 one-time |
| Delaware franchise tax + annual report | ~$225–$450/yr |
| Registered agent, year 2+ | ~$100–$300/yr |
| US CPA — Form 1120 + **Form 5472** | ~$1,000–$2,500/yr |
| **Realistic year-1 all-in** | **~$1,700–$3,500** |

Two traps that make this worse than the sticker price:
- **Form 5472** is mandatory for a foreign-owned US entity. The penalty for not filing is **$25,000**. This is not a form to forget.
- **Turkish CFC rules** (Kontrol Edilen Yabancı Kurum) and place-of-effective-management: a US company run day-to-day by a Turkish resident can create Turkish declaration obligations and, in some readings, Turkish tax residency for the US entity. **This is a `mali müşavir` question, not an engineering one.**

Spending ~$2,000/yr to open a payment rail for a marketplace with **zero producers and zero revenue** is the wrong trade. Revisit only if MoR is genuinely unavailable *and* subscription revenue is proven.

---

## 3. How much of the existing Stripe code survives?

Good news: the code is well-shaped and mostly provider-agnostic. The valuable part — *the webhook is the only writer of subscription state* — is correct for **every** provider.

| Piece | Survives a switch? |
|---|---|
| `PaidTier` / `BillingInterval` types + `isPaidTier` / `isBillingInterval` guards | **Yes, 100%** |
| The `isStripeConfigured()` gate + return-503-with-a-reason convention | **Yes** — rename to `isBillingConfigured()` |
| Price ids held in env vars, never in the repo (public-repo safety) | **Yes** — Paddle/LS use the same hosted-price-id pattern |
| `/api/subscribe` shape: validate → resolve price → create hosted checkout → return URL | **Yes, ~80%** |
| `metadata: { producerId, tier, interval }` carried through to the webhook | **Yes** — Paddle `custom_data`, LS `checkout_data.custom` |
| Webhook architecture: raw body, `runtime = "nodejs"`, handled-event set, 200 on unknown events | **Yes, 100%** — this is the genuinely valuable part |
| `stripe.checkout.sessions.create(...)` | No — ~12 lines replaced |
| `stripe.webhooks.constructEvent(...)` | No — Paddle/LS use HMAC-SHA256 over the raw body |
| Event names (`checkout.session.completed` etc.) and payload shapes | No — remapped |
| `stripe` npm dependency, `apiVersion` pin | No |

**Also needs changing, and it's a migration not a refactor:** `prisma/schema.prisma` bakes the provider into three column names — `stripeCustomerId` (required, `@unique`), `stripeSubscriptionId`, `stripePriceId`. Rename these to `billingCustomerId` / `billingSubscriptionId` / `billingPriceId` **now, while the schema has never been migrated and no database exists**. Doing it today costs nothing; doing it after go-live is a data migration.

**Verdict: roughly 60–70% survives. Nothing here was wasted work.** Treat the swap as writing one adapter, not a rewrite.

---

## 4. Money in from Amazon Associates

Builds on the Communication report's §2 and §6, which already established the marketplace question (Amazon.com.tr is invite-only → apply to Amazon.com US → W-8BEN). Not repeated here. **This section addresses the gap that report left open: can the money actually be received?**

| Item | Detail | Confidence |
|---|---|---|
| Payout options (non-US associate) | Direct deposit / Amazon.com gift card / cheque | High |
| Threshold — direct deposit | $10 | Medium–high |
| Threshold — gift card | $10 | Medium–high |
| Threshold — cheque | **$100, plus a $15 processing fee** | Medium–high |
| Schedule | ~60 days after month end (net-60) | Medium |
| Currency | USD, unless converted via Amazon Currency Converter for Associates | Medium |
| **Is Turkey on Amazon's international direct-deposit list?** | **COULD NOT CONFIRM** | **Low** |

### The concrete gap

The Communication report states "Direct deposit to a Turkish bank ($10 minimum)" at medium–high confidence. **I could not independently confirm that Turkey is on Amazon.com Associates' international direct-deposit country list.** Amazon has expanded international direct deposit over time but the covered-country list is specific and not universal.

This matters far more than a 3%-vs-10% commission debate, because the fallbacks are both bad:

- **Cheque** — $100 threshold, $15 fee, issued in USD. **Turkish banks generally will not clear a foreign personal cheque**, or will take weeks and charge heavily. Treat this as functionally uncashable.
- **Gift card** — $10 threshold, but it is Amazon.com store credit. It is not money, it cannot pay the firm's expenses, and it cannot be booked as received cash in the ledger.

**If direct deposit to Turkey is unavailable, Amazon Associates can be approved, earn commission, and still never deliver usable cash.** Confirm the payout-country list *before* burning the 180-day / 3-qualifying-sales clock — which, per the Communication report, starts at application time.

### Withholding under W-8BEN — a likely-better outcome than assumed

The Communication report says "without a valid treaty claim Amazon withholds up to 30% of US-sourced commission." That is the correct conservative framing, and I am not contradicting it. One nuance worth raising with the `mali müşavir`:

Associates **commissions** are generally advertising/service income, not royalties. For a non-US person with no US office or personnel, performing the work outside the US, that income is commonly treated as **foreign-source** — meaning **0% withholding**, not 30%. This differs from KDP book royalties, which genuinely are US-source royalties. A US–Turkey tax treaty is also in force.

**Do not act on my read of this.** The tax interview's own determination at signup is authoritative — but a 0% outcome is a plausible and materially better result than the 30% worst case, so don't price the channel off 30%.

---

## 5. Money in from affiliate networks (Awin, ShareASale, CJ)

The Communication report recommends these **ahead of** Amazon. From a pure money-in standpoint, that recommendation is correct and this report reinforces it: these networks are easier to get paid by than Amazon is.

| Network | Threshold | International payout rails | Entity required? | Notes |
|---|---|---|---|---|
| **Awin** | ~£20/$20 | International bank transfer, multi-currency | No — individuals accepted | Charges a **small refundable signup fee** (~$5), returned after first payout threshold |
| **ShareASale** | $50 | **Payoneer**, cheque; direct deposit is US-centric | No | Migrating onto Awin's platform; rails converging. Rejects subdomains (already noted by Comms) |
| **CJ** | $50 direct deposit / $100 cheque | **Payoneer**, direct deposit in select countries | No | W-8BEN required |
| Impact | Varies | Bank transfer, PayPal (n/a in TR) | No | — |
| Rakuten | $50 | Direct deposit / cheque | No | — |

**None of them require a company entity.** Individuals/sole traders are accepted everywhere on this list.

### The actual unlock: Payoneer

> **Payoneer operates in Turkey**, is widely used by Turkish freelancers and companies, supports **both individual and business accounts**, provides USD/EUR/GBP receiving accounts, and withdraws to a Turkish bank in TRY or to an FX account. Withdrawal cost is roughly ~2%. Confidence: **medium–high**, *VERIFY*.

Payoneer is the accepted international payout rail on ShareASale and CJ, and is the practical answer to "how does a Turkish affiliate get paid." **This — not Stripe — is the payment rail that could realistically be earning money first.** It is also the one nobody has been treating as urgent.

Note `departments/accounting/CLAUDE.md`'s payout table already lists a personal USD account as a candidate for USD-paying programs. That instinct was right; Payoneer is the concrete form of it.

### One decision to make deliberately, once

Amazon's application asks **"who is paid?"** — individual (W-8BEN) or entity (W-8BEN-E) — and the Communication report correctly flags this "cannot be casually changed later."

**Sirketim has a registered A.Ş.** Routing business income into the founder's *personal* account, while a company exists that should be invoicing it, is a Turkish tax and bookkeeping problem, not a convenience. Conversely, an A.Ş. invoicing foreign customers may qualify for Turkey's **services-export VAT exemption** (`hizmet ihracatı`) — a genuine advantage of using the entity.

**Decide payee = individual vs. A.Ş. once, with the `mali müşavir`, before the first enrollment** — then use the same answer across every program. Do not let it be settled ad hoc by whichever signup form is open. Both parts of this paragraph need the accountant's confirmation; I am flagging the fork, not resolving it.

---

## 6. Money in from customers buying our own fragrance line

**The site has no checkout at all** — no backend, no database, no cart (`README.md`, `CLAUDE.md`). Nothing exists to switch on.

**Critical, easily-missed point: none of §2 helps here.** Paddle and Lemon Squeezy are **digital-goods merchants of record — they will not process physical products.** Solving the subscription rail does **not** solve the fragrance rail. These are two separate problems with two separate answers.

Physical-goods options for a TR A.Ş.:

| Path | Viability |
|---|---|
| **Route to Etsy** | Best near-term. Already in the payout table: TR IBAN, TRY, bank transfer. Requires **ETBİS** registration (achievable now the A.Ş. exists) |
| **Shopify + iyzico/PayTR** | Workable. Shopify Payments is unavailable in Turkey; TR gateways plug in, but Shopify adds a ~2% fee for not using Shopify Payments |
| **Build our own checkout** | **Don't.** Highest cost, highest liability, lowest return at this volume |

### Two cost realities the $8.51 figure does not include

`MARKETPLACE-PLAN.md` §1 uses **$8.51 per 55ml bottle** as the cost basis. As CFO I have to flag that any margin built on that number is optimistic, because it is *production cost only*:

1. **Fragrance is a regulated hazardous material to ship.** Alcohol-based fragrance is a **limited-quantity dangerous good** under IATA rules. Air shipping is restricted, surcharged, and refused outright by some carriers and marketplaces. International fragrance shipping is a well-known blocker, not a detail.
2. **Cosmetics compliance is per-market.** EU sales require **CPNP notification** and a Responsible Person in the EU; US sales fall under **MoCRA** facility/product registration. Both cost real money before the first bottle sells.

**Recommendation: do not build checkout. Route the house line to Etsy and keep PARFUMOZA a pure comparison/affiliate surface.** Revisit only once affiliate revenue proves the traffic exists.

---

## 7. Recommendation and sequencing

**Headline: stop treating the subscription rail as the urgent one. It is blocked on a business decision, not a technical one — and there are zero producers to bill.**

`PRODUCER-PROGRAM.md` §2 already recommends **free tier + paid upgrade**, and §8 states plainly that nothing in items 2–8 is worth building until the revenue-model decision is made. That is financially correct. A free tier needs **no payment rail at all**. The fastest path to revenue is affiliate commission, which needs Payoneer — not Paddle, and definitely not Stripe.

### Sequence

| # | Step | Owner | Cost | Blocks what? |
|---|---|---|---|---|
| 1 | Load `stripe.com/global`, confirm Turkey absent. Settle it in 5 minutes | Founder | £0 | Everything below |
| 2 | Rename the three `stripe*` columns in `prisma/schema.prisma` to `billing*` | Web dev | £0 | Free now, a data migration later |
| 3 | Decide payee: individual vs. A.Ş., with the `mali müşavir` | **Founder only** | Advisor fee | Every program enrollment; can't be undone casually |
| 4 | Open **Payoneer** (or confirm the firm's FX account works) | **Founder only** | ~free | All affiliate income |
| 5 | Deploy site + domain + `/privacy` (Comms report Phase A) | Web dev / founder | Domain + hosting → **ledger rows** | All network applications |
| 6 | Apply to **Awin** and **ShareASale** — not Amazon | Founder | ~$5 refundable | First real revenue |
| 7 | Ship the **free** producer tier. No billing code | Web dev | £0 | Proves demand before any rail is built |
| 8 | **Only when a producer says yes to paying:** confirm Paddle onboards TR sellers, then write the adapter | Founder + web dev | 5% + $0.50 | — |
| 9 | Amazon Associates — **last**, and only after confirming TR direct deposit | Founder | £0 | — |
| 10 | Stripe Atlas | **Do not do this** | ~$2k/yr | Revisit only if 8 fails *and* revenue is proven |

### Founder-only steps (no subagent can do these)

- Verifying Stripe's and Amazon's country lists.
- The individual-vs-A.Ş. payee decision, and the `mali müşavir` conversation behind it.
- Any tax registration, W-8BEN/W-8BEN-E, or treaty claim.
- Opening Payoneer / linking any bank account.
- Domain registration and its billing.
- Every account creation and program application.

### Honest estimate: what a solo founder can achieve without a foreign company

**Achievable, no foreign entity needed:** Awin, ShareASale, CJ enrollment; Payoneer payouts; a free producer tier; Etsy for the house line; iyzico for Turkish direct invoicing. **This covers every near-term revenue stream PARFUMOZA actually has.**

**Achievable but unconfirmed:** Paddle for producer subscriptions. Genuinely likely to work; must be verified before it is built on.

**Not achievable without a foreign entity:** Stripe direct, Gumroad, PayPal. Accept these are closed and stop designing around them.

**The realistic constraint is not the payment rail — it is that PARFUMOZA has no deployment, no domain, no traffic, four content pieces, and zero producers.** No payment rail fixes any of that, and every rail above can be opened in days once there is something to point it at.

---

## 8. Must be verified before relying on it

| # | Item | Why it matters | My confidence |
|---|---|---|---|
| 1 | Stripe supported-countries list (`stripe.com/global`) | The entire premise | High that TR is absent |
| 2 | **Paddle onboards Turkey-based sellers** | The whole §7 recommendation rests on this | Medium |
| 3 | **Lemon Squeezy country list post-Stripe-acquisition** | Parent-company alignment could have closed TR quietly | Low–medium |
| 4 | **Is Turkey on Amazon's international direct-deposit list?** | Otherwise the channel earns but cannot pay out | **Low — the biggest gap here** |
| 5 | Payoneer availability for a TR A.Ş. + current fees | The near-term revenue rail | Medium–high |
| 6 | Awin / ShareASale / CJ current thresholds and TR payout rails | Sequencing steps 6 | Medium |
| 7 | Whether Associates commission is foreign-source (0%) or 30%-withheld | Materially changes channel economics | Low — tax interview is authoritative |
| 8 | Turkish CFC treatment of a US entity; services-export VAT exemption | `mali müşavir` question, not a research question | Low |
| 9 | All fee figures (5% + $0.50, iyzico rates, Payoneer ~2%) | Secondary-source, pre-cutoff | Medium |

**Anything at Low confidence should be treated as a question, not a finding.**

---

## 9. Ledger position

**No ledger entry was made, and none is warranted — no transaction has occurred.** No account exists, nothing is enrolled, nothing has been charged or received.

Per `departments/accounting/CLAUDE.md`, do **not** add speculative rows. The first real ledger events from this workstream will be **expenses, not income**: domain registration and hosting (Comms report §8). Those get rows the day they are charged.

Two conventions worth noting now, before the first transaction:

- Affiliate income already has a home: `Affiliate commission — <Program name>`, with `Accrued — unconfirmed/unpaid` until a payout actually posts. Name each program separately — Awin, ShareASale, CJ and Amazon are four independent payout relationships with different thresholds, schedules and currencies.
- **There is currently no Income category for recurring subscription revenue we receive.** The taxonomy covers product sales and affiliate commissions only. If producer subscriptions ever go live, that gap needs closing before the first charge — not after.

---

## 10. Live verification (2026-08-26)

Done from the root session, which has `WebSearch`/`WebFetch` that the `board-cfo`/`accountant` subagents do not. This closes four of the nine §8 items, including the one flagged as the biggest gap.

| §8 # | Item | Verified answer | Method |
|---|---|---|---|
| 1 | Stripe supported countries | **Confirmed: Turkey absent.** ~50 countries listed; no Turkey, no waitlist entry for it. The report's premise holds. | Fetched `stripe.com/global` directly |
| 2 | Paddle onboards Turkish sellers | **Confirmed available.** Paddle's own help centre: "works with software businesses anywhere in the world" minus a 29-country unsupported list — **Turkey is not on it**. Independently corroborated by a Turkish developer who states they personally use Paddle from Türkiye. | Paddle help centre + first-hand TR account |
| 4 | Amazon direct deposit to Turkey | **Confirmed NOT available — the CFO's worst case is the real one.** Eligibility is by *bank-account currency*: USD (US), GBP/EUR (UK), EUR (Eurozone). A Turkish bank account is TRY and Turkey is in neither the Eurozone nor the EEA. Turkey is additionally **invite-only** for the Associates programme. | Amazon Associates Central help + cross-checks |
| 5 | Payoneer for affiliate income | **Confirmed, and it is specifically the documented workaround for exactly this problem.** Payoneer is legal and widely used in Turkey, gives USD/GBP/EUR receiving accounts whose banking details are entered into Amazon's payment settings, and withdraws to a Turkish IBAN. Named as the standard route for CJ and Amazon Associates. | Payoneer + a guide dedicated to Amazon-Associates-via-Payoneer |

### What changed versus the body of this report

**1. The Amazon payout gap is real, and Payoneer is the answer to it — not a nice-to-have.**
§4 said "if direct deposit to Turkey is unavailable, Amazon Associates can be approved, earn commission, and still never deliver usable cash," at *low* confidence. **That is now confirmed at high confidence.** The two fallbacks are as bad as §4 said: a USD cheque Turkish banks won't practically clear, or Amazon.com store credit that is not money.

This makes the §7 sequencing **more** right, not less: Payoneer moves from "step 4" to a hard prerequisite of the Amazon channel existing at all. Note this same currency logic hits **CJ and ShareASale** too — the constraint is the TRY account, not Amazon specifically.

**2. Paddle is cleared. The subscription rail is no longer an open question.**
§8 item 2 was the medium-confidence assumption the whole §7 recommendation rested on. It holds. `PaymentProvider.PADDLE` in `prisma/schema.prisma` is a real option, not a guess.

**3. A real cost correction — Paddle is more expensive than §2's "~5% + $0.50."**
First-hand Turkish figures at $300/month revenue: ~$15.50 commission **plus a flat $15 SWIFT payout fee** = ~10.2% all-in. The flat wire fee is regressive and dominates at low volume. At $300/month it is half the total cost. **Do not model Paddle at 5% until monthly volume is well past $1,000.** This strengthens §7's "ship the free tier first" conclusion rather than weakening it.

**4. Two Paddle constraints §2 did not surface, both of which need a decision before building:**
- **Digital goods only.** Paddle will not process the house fragrance line. §6 already reached this conclusion — now confirmed from Paddle's own docs. Two rails remain two rails.
- **⚠ Acceptable-use is reportedly restrictive toward *marketplaces*.** PARFUMOZA is literally a marketplace. The subscription being sold is arguably plain SaaS (access to a listing tool), which Paddle does support — but this is close enough to the line that it must be raised with Paddle *before* an adapter is written. KYC also tightened after Paddle's 2025 FTC settlement. **This is now the single largest unverified risk on the subscription rail**, replacing the country question.

**5. PayTR looks better than iyzico on fees for the TRY/local rail** — ~2.19% next-day settlement versus iyzico's ~4.29% + 0.25 TL with weekly cycles and 2-day holds. §2 treated them as interchangeable. They are not. Neither changes §2's conclusion that a Turkish PSP is the wrong shape for billing US/ES producers.

**6. iyzico *does* support native recurring billing** ("Abonelik" — payment plans, stored cards, configurable intervals), which nothing in this repo had confirmed. It stays the wrong fit for this marketplace for the reasons in §2, but the capability question is answered.

### Still unverified

§8 items 3 (Lemon Squeezy post-acquisition — moot, and independently flagged for frozen payouts; **treat as ruled out**), 6, 7, 8, and 9 remain open. Items 7 and 8 are `mali müşavir` questions and will not be resolved by research.

### Net effect on the recommendation

**§7's sequence stands and is now better-founded.** One reordering: **Payoneer (step 4) is the highest-value founder action on the list** — it is a hard prerequisite for Amazon, CJ and ShareASale simultaneously, and it is the only step that unblocks money actually arriving. Step 1 is now done: Stripe is settled, no need to spend the five minutes.
