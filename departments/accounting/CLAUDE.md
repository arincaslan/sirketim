# Accounting

Tracks Sirketim's actual money — income, expenses, and recurring subscriptions across every department — and produces a weekly report for the founder.

## Data source

No bank/Stripe/accounting API is connected yet. `ledger.md` is the single source of truth, updated manually. Every transaction (client payment received, product sale, subscription charge, one-off tool purchase) gets a row added when it happens or is discovered — by whichever department incurs it, the founder, or accounting itself when reviewing other departments' work (e.g. sales logging a closed deal, advertising logging ad spend).

## Ledger format (`ledger.md`)

Columns: Date | Type | Department | Category | Description | Amount | Currency | Status | Notes.

- **Type**: `Income`, `Expense`, or `Subscription` (a recurring expense — also gets a row in the Recurring Subscriptions table for at-a-glance tracking).
- **Department**: which department the transaction belongs to, or `Shared` for company-wide tools/costs used by more than one department.
- **Amount / Currency**: keep amounts in their native currency, don't silently convert — Sirketim transacts in more than one (e.g. USD subscriptions, TRY client work).
- **Status**: for income, whether it's invoiced/pending/received; for expenses, one-off vs. Nth occurrence of a recurring charge; for anything with an unconfirmed number, say so explicitly (`unconfirmed`) rather than guessing silently.

### Income category taxonomy

For `Type = Income`, use one of these `Category` values (add new ones the same way if a genuinely new income type shows up — don't force a transaction into the wrong bucket):

| Category | When to use it | Typical Department |
|---|---|---|
| `Product sale — Etsy` | A Sirketim product (web template, plan pack, POD print, etc.) sold through the Etsy marketplace. | `Sales` (the product's underlying department built the asset; Sales owns the marketplace listing/sale per `products/README.md`) |
| `Product sale — Gumroad` | Same as above, sold through Gumroad. | `Sales` |
| `Product sale — Direct` | A product or service invoiced straight to a client/business, no marketplace involved. | `Sales` (or the delivering department, e.g. `Web Development`, if it invoiced directly) |
| `Affiliate commission — <Program name>` | Commission owed/paid by an affiliate program (e.g. `Affiliate commission — Amazon Associates`) for referred sales. Always name the specific program in the Category, not just "Affiliate commission" — each program is its own payout relationship with its own dashboard, threshold, and schedule. | `Advertising` or `Sales`, whichever drove the referral |

These four cover the two new income streams (marketplace product sales, direct-to-customer product sales, affiliate commissions) described below. No transactions exist yet for any of them as of 2026-08-24 — this is convention-setting only; do not add speculative rows to `ledger.md`.

#### Marketplace sales (Etsy, Gumroad): payout timing and gross-vs-net

Etsy and Gumroad collect payment from the customer immediately at sale time but pay Sirketim out later, in a batch, net of their own marketplace/processing fees. To avoid double-counting the same money as income twice (once "as a sale," once "as a payout"), a marketplace sale is **one row, updated in place** as it moves through its lifecycle — never two separate Income rows for the same order:

1. **At time of sale**: add one Income row. `Amount` = the **gross** sale price (what the customer paid, before fees) — this matches what Etsy/Gumroad's own dashboards report and keeps full revenue visibility. `Status` = `Sold — marketplace payout pending`. `Notes` records the order/listing reference.
2. **At time of payout** (when the batch actually posts to a payout account): update that same row's `Status` to `Received — payout posted (batch <ref>)`, with the batch/payout reference and date in `Notes`. The `Amount` stays the **gross** figure — do not overwrite it with the net figure.
3. **Log the marketplace's fee as its own, separate Expense row** dated at the same payout event: `Type = Expense`, `Department = Sales`, `Category = Etsy fees` / `Gumroad fees`, `Amount` = the fee actually deducted, `Notes` referencing the same order/batch reference as the Income row so the two can be reconciled.

Why gross-Income-plus-separate-fee-Expense rather than netting the fee into one Amount: it preserves a full audit trail matching what the marketplace itself reports, keeps total fees paid to each marketplace independently visible over time (useful for comparing Etsy vs. Gumroad's real cost), and the weekly report's existing net calculation (`total income − total expenses`) already nets it out correctly without needing a special case. Netting the fee directly into the Income row's Amount would quietly bury that cost where nobody would ever total it up.

**Reporting implication**: a row still marked `Sold — marketplace payout pending` is sales activity, not yet cash in hand — the weekly report should call these out separately from `Received` rows and should not count them toward actual cash/running balance until the payout posts and the Status is updated.

#### Affiliate commission: accrual vs. receipt

Affiliate income is structurally different — Sirketim never collects anything from the end customer; the affiliate program pays a commission directly, on its own delayed schedule (e.g. monthly, only above a minimum payout threshold). Use:

- `Status = Accrued — unconfirmed/unpaid` when a program's own dashboard shows commission earned but it hasn't been paid out yet (below threshold, not yet in a payout cycle, or otherwise not yet received). Treat the amount as informational, not cash, until it flips to Received.
- `Status = Received — payout posted (<date/ref>)` once the payout actually lands in a payout account.

Because each affiliate program is its own independent payout relationship (own dashboard, own threshold, own schedule, sometimes its own currency or payout form — e.g. Amazon Associates can pay via direct deposit, check, or gift card depending on region), always name the specific program in the `Category` (`Affiliate commission — <Program name>`) and put the program's threshold/schedule/payout-form details in `Notes` so a row is self-explanatory without cross-referencing anything outside the ledger.

## Weekly report (`reports/<YYYY-MM-DD>.md`)

Generated weekly by the `accountant` subagent, typically triggered by the `board-cfo` board member (see `../../shared/board.md`). Each report covers the prior 7 days and includes:

- Total income and total expenses for the week, net, and running balance since the ledger started.
- Every subscription active that week and its cost (flag any subscription with an unknown/unconfirmed cost rather than estimating).
- New ledger rows added that week, and anything flagged as missing or unclear (e.g. a department mentioned spending money but never logged it).
- Week-over-week trend once enough history exists.

If the ledger has no new rows for a week, the report says so plainly rather than padding — an empty week is a valid, honest report.

## Conventions

- Use the `accountant` subagent for this department's work.
- Never invent numbers. If a figure isn't in the ledger, the report says "not logged," not an estimate.
- Flag data-quality issues (missing rows, ambiguous currency, unconfirmed pricing) as findings for the founder/board to chase down, not silently-fixed guesses.
- **API/MCP subscription and usage costs get logged like any other expense**, promptly — the `openart` MCP subscription today, any future paid API key (e.g. one provisioned for `internal/dashboard/`) as it's set up. `departments/control/CLAUDE.md` has this department cross-checking that these specific costs are actually logged as part of its standing audit (founder's order, 2026-08-19) — control flags gaps, this department fixes them.
- **Marketplace/affiliate income (Etsy, Gumroad, direct-to-customer, affiliate commissions)**: use the Category taxonomy and Status vocabulary documented under "Income category taxonomy" above. Update the existing row in place as a sale/commission moves from pending to received — never add a second Income row for the same order/commission, that would double-count it. A marketplace fee is its own Expense row, not netted into the sale's Amount. No income rows exist yet for any of these streams as of 2026-08-24 (no sales or commissions have happened) — don't add speculative/hypothetical rows; these conventions only apply once a real transaction occurs.
- **Never write real sensitive financial identifiers into this repo** (it's public on GitHub) — no real bank account numbers, IBANs, card numbers, personal tax IDs, or similar, anywhere, including in the payout-accounts reference table below. Use only generic labels (e.g. "Firm account (TRY)", "Personal account (Payoneer)"). Real account details are provided directly to the payment processor's own signup flow, never recorded here.

## Payout accounts by channel

Reference table only — not part of the ledger, not a place for real account numbers (see convention above). Tracks, per income channel, whether a receiving account exists yet and what kind. Founder decides `Account type` (Firm vs. Personal) per channel; update `Setup status` only once something is actually configured, not in anticipation of it.

Entity status confirmed (2026-08-24): Sirketim is a registered A.Ş. (anonim şirket, joint-stock company) in Turkey, with a tax ID (vergi numarası) on file — this is no longer a "TBD — founder decision" item below. Per the never-write-real-identifiers convention above, the tax ID number itself is not recorded anywhere in this repo.

| Channel | Account type | Instrument | Setup status | Notes |
|---|---|---|---|---|
| Etsy | Firm (A.Ş.) | Bank transfer only (TR IBAN, TRY) — PayPal not available to Etsy sellers based in Turkey. | Firm TRY account confirmed available (2026-08-24) — not yet linked in Etsy Payments. | Turkish sellers on foreign marketplaces are separately required to register with ETBIS (Elektronik Ticaret Bilgi Sistemi); with the entity blocker resolved (Sirketim is a registered A.Ş. with a tax ID on file), ETBİS registration is now achievable — the remaining work is completing the registration process itself, not a missing entity or missing account. Exact KYC/tax-ID fields Etsy's signup form asks for TR sellers specifically weren't independently confirmed — check live at signup. |
| Gumroad | TBD — founder decision | Confirmed rail gap: Gumroad's only two payout rails are PayPal and Stripe Connect bank payout. Stripe does not support standard/Connect accounts for Turkey, and PayPal does not operate in Turkey — neither rail currently works for a Turkey-based seller, and no Payoneer/Wise/bank-transfer alternative exists on Gumroad. | Not yet set up | No payout method selected in Gumroad account settings yet. This may not currently be executable at all for a TR-resident seller — verify live in Gumroad's own signup country dropdown before any listing effort. Contradicts the "secondary marketplace" assumption in `departments/sales/CLAUDE.md`; worth the COO/sales-strategist knowing about, though fixing the sales strategy itself is out of scope here. This is a fast-moving area — re-verify before committing effort, but as of today's research (2026-08-24) it's a confirmed gap, not just an unconfirmed detail. Available accounts (firm TRY, personal TRY, personal USD) don't unblock this — the gap is Gumroad's own supported rails, not a missing receiving account. |
| Direct-to-customer invoicing | Firm (A.Ş.) | Two options: bank transfer/wire, available today with zero setup; or an invoicing/payment tool such as iyzico, whose onboarding is now a concrete, executable next step since it requires exactly what Sirketim now has on file — a registered firm (A.Ş.) and a tax ID. | Firm TRY account confirmed available (2026-08-24) — usable for bank-transfer invoicing immediately. iyzico onboarding not yet started. | Bank transfer is ready to use today with the existing firm account. iyzico onboarding is the concrete next step for card/link-based checkout when ready. |
| **Awin** (COUNTERSCENT — planned first programme) | **Firm (A.Ş.)** — founder decision, 2026-08-27 | Bank transfer. **Awin does not self-bill Turkish tax residents** — Turkey is an explicit exception in Awin's own policy, so the publisher issues their own invoice per payout. | Not enrolled. **Firm USD account does not exist yet — founder opening one 2026-08-28.** | The invoicing requirement settled the payee question: a Turkish individual cannot casually issue a *fatura*, so the payee is the A.Ş. **Resolved 2026-08-27, and the answer was the awkward one:** the founder checked, and the company has **no USD account**. The only USD account on record (2026-08-24) is **personal**. An A.Ş. issuing the invoice while a personal account receives the money makes the invoice issuer and the payment recipient different legal persons — a Turkish *mali müşavir* will object, and it is the precise form the CFO's "costs sit in the A.Ş., revenue lands personally" warning takes. The founder is opening a company USD (*döviz*) account on 2026-08-28; Turkish banks open these routinely for a company with a tax ID on file. **Do not enrol anywhere until it exists** — the payee named on an affiliate application is hard to change afterwards, and getting it wrong means either re-papering the account or invoicing from the wrong entity. Note this is a *bank* account, separate from Payoneer: Payoneer's own USD receiving account is US-domiciled and is what unblocks Amazon specifically, whereas Awin pays a local bank account directly. |
| **Amazon Associates** | Would have to be Personal or Payoneer — **not** a Turkish firm account | **Direct deposit is impossible from Turkey. Verified live 2026-08-27** against Amazon's own Associates help page: eligibility is by **country**, not merely account currency — United States (USD), United Kingdom (GBP/EUR), and 51 Eurozone/EEA countries (EUR), 52 in total. **Turkey is not on that list.** A USD-denominated account *held in Turkey* therefore does not qualify; the country is what is checked. | Not enrolled, and not currently enrollable without Payoneer. | Three separate blockers, and the USD account clears **none** of them. (1) Payout: remaining options are a mailed check, an Amazon gift card, or a **Payoneer** virtual receiving account — Payoneer works precisely because it provides a *US-domiciled* account, which is why "we have a USD account but it's not connected to Payoneer" does not substitute for it. (2) The **amazon.com.tr** programme ("Gelir Ortaklığı") is **invite-only** — no self-service registration. Whether a Turkey-resident may instead join **amazon.com (US)** Associates is **not verified** and should be checked at the source before planning around it. (3) The `/go/<slug>` redirect chokepoint may itself breach Amazon's ban on "Redirecting Links" — unresolved, and the penalty is account termination. See `departments/communication/reports/amazon-associates-application.md` §2. |
| Affiliate program (generic) | TBD — per program | Varies by program — e.g. bank transfer, PayPal, Payoneer, or (for some programs) gift card/direct deposit | Personal TRY and personal USD accounts confirmed available (2026-08-24) as candidate receiving accounts; none linked to any specific program yet. | Placeholder row — add one row per specific program once enrolled (e.g. "Amazon Associates"), since instrument/threshold/schedule differ per program. Each program's payout account type is still a per-program decision (some only support a personal account, some pay in USD) — the personal USD account is specifically relevant for USD-paying programs. With a confirmed A.Ş. on file, some programs may now also offer a business/firm payout option — worth checking at enrollment alongside the personal-account options. |
