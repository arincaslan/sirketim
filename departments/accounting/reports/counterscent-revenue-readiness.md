# COUNTERSCENT revenue readiness — rails, ledger taxonomy, and pre-revenue cost model

**Status: convention proposal + cost model. No ledger row was added — no transaction has occurred.**

2026-08-26 · Accounting (CFO) · Builds on `departments/accounting/reports/payment-rails-investigation.md`, specifically **§10 (live-verified 2026-08-26)**, which is treated here as established fact.

No web access was used for this report. Anything not confirmed by §10 or an in-repo doc is marked **unconfirmed**.

---

## 1. Revenue readiness

| Income stream | Rail it needs | Rail status | Blocked on | Single next action |
|---|---|---|---|---|
| Producer subscriptions (paid tiers) | Paddle (merchant of record) | **CLEARED** (country availability, §10 item 2) | Zero producers exist. Separately, §10 flags Paddle's acceptable-use policy as reportedly restrictive toward *marketplaces* — COUNTERSCENT is one. | Ship the **free** tier — it needs no rail at all. In parallel, email Paddle to pre-clear the AUP question before any adapter is written. |
| Affiliate — Awin (ALT. Fragrances) | Payoneer USD/GBP/EUR receiving account (§10 item 5), or intl bank transfer | **CLEARED — prerequisite unmet** | No Payoneer account exists; no deployed site/domain to apply with. ~$5 refundable signup fee. | Open Payoneer, then deploy site + domain. |
| Affiliate — ShareASale (Dossier) | Same Payoneer rail | **CLEARED — prerequisite unmet** | Same as Awin, plus: ShareASale **rejects subdomains** — needs a real custom domain. | Register a custom `.com`. |
| Affiliate — CJ (FragranceX) | Same Payoneer rail; W-8BEN required | **CLEARED — prerequisite unmet** | Same as above. §10 confirms the TRY-account constraint hits **CJ and ShareASale too**, not just Amazon. | Open Payoneer; complete W-8BEN at enrollment. |
| Affiliate — Amazon Associates | Direct deposit (unavailable) | **BLOCKED** | §10 item 4: direct deposit to a Turkish bank confirmed **NOT available** — eligibility is by bank-account currency (USD/GBP/EUR only); a TR account is TRY and Turkey is in neither the Eurozone nor the EEA. **AND** Turkey is invite-only for Associates. Payoneer is the documented workaround for the payout half; it does **not** fix the invite-only half. | **Drop from the plan.** Do not burn the 180-day / 3-sale clock. |
| House fragrance line ($8.51/55ml cost basis) | Physical-goods checkout | **NOTHING EARNABLE YET** | No checkout exists. Paddle is digital-goods-only and will not process it (§10 item 4, confirming §6). Etsy route needs ETBİS registration + Etsy Payments linked to the firm TRY account. Plus unpriced compliance: fragrance is a limited-quantity dangerous good to ship; EU CPNP / US MoCRA. | Route to Etsy; do not build checkout. |
| COUNTERSCENT commission on brokered sales | Merchant-of-record capability Sirketim does not have | **NOTHING EARNABLE YET** | Requires taking real transaction/payment liability (MoR obligations). No rail here provides it, and `MARKETPLACE-PLAN.md` §5 leaves the question open. | None yet — decide the model before the rail. |

**The only stream that can realistically receive money this quarter is affiliate commission, and it is gated on two founder actions — opening Payoneer and getting a live domain — not on any code.**

---

## 2. Ledger taxonomy — closing the §9 gap

### 2a. New Income category

Propose exactly: **`Subscription revenue — <Product name>`** — e.g. `Subscription revenue — COUNTERSCENT Producer Program`.

It parallels the existing `Affiliate commission — <Program name>` pattern: always name the specific product, because each one is its own billing relationship with its own provider, cadence and fee structure.

**Naming collision — flag explicitly.** The `Type` column already uses `Subscription` to mean a recurring *expense Sirketim pays*. Incoming subscription money is the opposite direction:

| Rule | Value |
|---|---|
| `Type` | **`Income`** — never `Subscription` |
| `Category` | `Subscription revenue — <Product name>` |
| "Recurring subscriptions (at a glance)" table | **Must NOT appear there.** That table tracks costs only. |

This is **the single most likely mis-booking** in the whole taxonomy. A subscription-revenue row filed as `Type = Subscription` would land in the cost table and subtract from the running balance instead of adding to it.

### 2b. Status vocabulary for subscription revenue

A Paddle (MoR) subscription has structurally the same lifecycle as an Etsy sale — the customer is charged immediately, Paddle holds the money and pays out later, net of fees. **Reuse the existing marketplace pattern rather than inventing a parallel one.**

| Status | When |
|---|---|
| `Charged — MoR payout pending` | Producer's card charged; the money is Paddle's to remit |
| `Received — payout posted (<date/ref>)` | Payout landed — same wording as the existing conventions |
| `Refunded — <date>` | MoR subscriptions do get refunds/chargebacks. Update the original row **in place** to this — never delete it |

- `Amount` = **gross** (what the producer paid), never net.
- Paddle's fees are their own **Expense** rows, `Category = Paddle fees`.

**New rule the existing docs do not cover — each billing period is its OWN Income row.** Month 2's charge is a new transaction, not an update to month 1's row. In-place updating applies only *within* a single charge's lifecycle (charged → received / refunded). `Notes` should carry `billing period YYYY-MM, occurrence N`.

**Second new rule — the ~$15 flat SWIFT payout fee is per *payout*, not per *transaction*.** It is **ONE** Expense row per payout batch, cross-referenced to every Income row in that batch — not split or duplicated across them.

### 2c. Booking a Payoneer-intermediated affiliate payout

**One Income row, updated in place. Not two.** Payoneer is a receiving account Sirketim controls, not a counterparty. The money becomes Sirketim's when it lands in Payoneer; the later withdrawal to a Turkish bank is an internal transfer between two accounts Sirketim already owns.

| Step | Status |
|---|---|
| Network dashboard shows commission | `Accrued — unconfirmed/unpaid` |
| Payout lands in Payoneer | `Received — payout posted (Payoneer <ref>)` |
| Withdrawal to Turkish bank | **No new row** — date/reference goes in `Notes` |

**Why not two rows:** the ledger has no account/balance dimension, and the weekly report's running balance is `total income − total expenses`. Booking the transfer would either double-count the same money as income twice, or require a phantom offsetting expense. Both corrupt the balance.

**What DOES get a second row: the withdrawal *fee* only.** `Type = Expense`, `Category = Payoneer fees`, `Amount` = the fee actually charged (Payoneer withdrawal/FX, ~2% — **unconfirmed**), `Notes` cross-referencing the Income row's payout ref.

**Currency rule:** the Income row's `Amount` stays in the network's payout currency (USD/GBP/EUR), per the existing don't-silently-convert convention. The TRY amount actually credited and the FX rate used go in `Notes` as information — they do not replace the `Amount`.

**Payout-accounts table gap:** `departments/accounting/CLAUDE.md`'s `Payout accounts by channel` table currently has **no Payoneer row**. It needs one per program (Awin, ShareASale, CJ) once an account is opened.

### Second taxonomy gap — flagged, not resolved

The `Department` column cannot express which **product** a cost belongs to, and COUNTERSCENT spans Content, Web Development and Sales.

- Recommend every COUNTERSCENT row's `Notes` begin with **`COUNTERSCENT — `** so the product's true total cost stays greppable regardless of which Department it was filed under.
- Recommend `Web Development` for domain/hosting/deploy rows, `Content` for affiliate-program rows.

---

## 3. Cost model — the free-tier-first path

Real, pre-revenue spend only.

| Item | Amount | Cadence | Confidence | Note |
|---|---|---|---|---|
| Domain (`.com`, custom) | ~$10–15 | First year | **Unconfirmed** (registrar-dependent) | Required — ShareASale rejects subdomains |
| Hosting — Vercel Hobby | $0 | — | **Unconfirmed — real cost risk** | Hobby tier is for *personal, non-commercial* use; an affiliate-monetised site is arguably commercial. Vercel Pro is ~$20/mo/member. **Biggest swing in this table: ~$240/yr vs $0.** Next action: read Vercel's own terms before launch |
| Awin signup fee | ~$5 | One-off, **refundable** | Unconfirmed | Refunded after the first payout threshold. Book as an Expense when charged; update in place / add a matching Income-side note when refunded. Refund mechanics should be confirmed at signup |
| Payoneer account opening | $0 to open | — | Unconfirmed | ~2% withdrawal fee; possible annual/inactivity fee — all unconfirmed |
| Paddle | $0 to hold | Per transaction only | Per §10 item 3 | ~5% + $0.50/txn, plus ~$15 flat SWIFT per payout = **~10.2% all-in at $300/mo** |
| OpenArt (already in ledger) | $29/mo | Monthly | Price unconfirmed | **Not attributable to COUNTERSCENT — must not be double-counted against this project** |

**Realistic pre-revenue cash outlay to reach the point of applying to Awin + ShareASale: ~$15–20 if Vercel Hobby is acceptable, or ~$35–40 in month one (~$255–275 over year one) if Vercel Pro turns out to be required.** The domain and Awin fee are small and near-certain; the entire uncertainty is the Vercel commercial-use question, which is unconfirmed and is worth ~$240/yr on its own. ~$5 of the outlay is refundable.

### First ledger rows (illustrative — NOT added to `ledger.md`)

| Date | Type | Department | Category | Description | Amount | Currency | Status | Notes |
|---|---|---|---|---|---|---|---|---|
| `<date of charge>` | Expense | Web Development | Domain | COUNTERSCENT custom `.com` domain, year 1 | `<actual charge>` | USD | One-off | COUNTERSCENT — required because ShareASale rejects subdomains. Registrar + renewal price to be recorded here |
| `<date of charge>` | Subscription | Web Development | Hosting | Vercel Pro (only if commercial-use terms require it) | `<actual charge>` | USD | Active | COUNTERSCENT — only add this row if Hobby is ruled out by Vercel's terms. If Hobby is acceptable, no row exists (no charge) |
| `<date of charge>` | Expense | Content | Affiliate program fees | Awin signup fee | `<actual charge>` | USD | One-off, refundable | COUNTERSCENT — refundable after first payout threshold. Update this row in place when refunded |

**No income rows whatsoever.** No income row of any kind should be created for COUNTERSCENT until real money is actually charged or accrued — the first ledger events from this workstream are expenses only.

---

## 4. What the founder must personally do, in order

Only items no agent can do.

1. **Open Payoneer.** Highest value on the list — the single action that unblocks Awin, ShareASale and CJ at once.
2. **Decide payee: individual vs. A.Ş., with the `mali müşavir` — before ANY enrollment.** It cannot be casually changed later, and it must be the same answer across every program.
3. **Register and pay for the custom `.com` domain.**
4. **Check Vercel's commercial-use terms**, and pay for Pro if required.
5. **Apply to Awin and ShareASale** once the site is live.
6. **Email Paddle to pre-clear the marketplace acceptable-use question.** Cheap, do it in parallel, do not let it gate anything.

**Do not do:** Amazon Associates · Stripe Atlas · Gumroad · Lemon Squeezy.

---

## 5. Where I disagree with, or would sharpen, §10

1. **§10 says §7's sequence "stands." It does not fully stand.** §7 step 9 defers Amazon "until TR direct deposit is confirmed" — a condition §10 proved permanently unsatisfiable, not merely unconfirmed. Combined with invite-only status, Amazon should be **removed from the plan entirely, not deferred**. That is a changed recommendation, not a restatement.
2. **§10 states two Amazon facts but doesn't connect them.** Payoneer fixes the *payout* half; it does nothing about Turkey being **invite-only** for Associates. A payout rail into a programme you cannot join is worth exactly zero.
3. **The Paddle cost correction has a business consequence §10 doesn't draw out.** A flat ~$15 per payout means that at a plausible early price point, the first one or two paying producers are roughly net-zero after payout costs. The mitigation is an operational rule worth writing down now: **batch Paddle payouts (e.g. quarterly, not monthly)** so one fixed fee is spread across several months of revenue.
4. **Partial disagreement on risk ranking.** §10 calls the Paddle AUP question "the single largest unverified risk on the subscription rail" — true *for that rail*, but it is not the largest risk to money arriving, and treating it as urgent would be a mis-allocation: it gates revenue with **zero producers behind it**. The largest real risk is that there is no deployed site, so no network approves anything. Keep the AUP question as a cheap email, not a workstream.
5. **A caution on evidence quality.** §10's Paddle confirmation leans partly on a single first-hand Turkish user. That is fine corroboration for *country availability*; it is **not** evidence that a *marketplace* passes Paddle's onboarding/KYC. Do not let confidence bleed from the country question across to the AUP question.

The four verifications themselves are accepted without dispute, and ruling Lemon Squeezy out is right.
