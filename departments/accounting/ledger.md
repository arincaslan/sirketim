# Ledger

Single source of truth for Sirketim's income, expenses, and subscriptions. Add a row as soon as a transaction happens or is discovered — see `CLAUDE.md` for column definitions and who's responsible for logging.

| Date | Type | Department | Category | Description | Amount | Currency | Status | Notes |
|---|---|---|---|---|---|---|---|---|
| 2026-08-19 | Subscription | Shared | Software | OpenArt "Plus" plan (12,000 credits/mo, confirmed via `openart_account_get`) | 29.00 | USD | Active, price unconfirmed | Account is on the 12,000-credit tier, which OpenArt's public pricing page (as of Aug 2026) lists as the "Advanced" plan at $29/mo ($14.50/mo if billed annually) — plan naming differs between the API ("Plus") and the pricing page ("Advanced"), and this wasn't cross-checked against an actual receipt. Confirm the real charge on the next billing statement and correct this row. |
| 2026-08-27 | Expense | Web Development | Domains & email — Hostinger | `counterscent.com` + `parfumoza.com`, both domains **and** both mailboxes, one combined figure supplied by the founder | 1,680.00 | TRY | Paid — **per-item split not known** | First real cost of the COUNTERSCENT project, and the first row here that is not OpenArt. The founder gave a single total covering **four items** (two domains, two mailboxes); Hostinger's per-item breakdown was not captured and `hostinger-billing` is deliberately not configured (it exposes purchase operations), so **no agent can retrieve the split** — it has to come off the invoice. Do not apportion it by guessing. **Renewal dates and auto-renew status are unknown and are the thing most likely to bite**: a domain that silently renews at a higher price is exactly the failure mode `departments/web-development/CLAUDE.md` warns about for Hostinger pricing. See the wasted-spend row below for why two domains were bought. |
| 2026-08-27 | Expense | Web Development | Domains & email — Hostinger | *(memo, not a separate charge — included in the 1,680.00 TRY above)* `parfumoza.com` domain + mailbox, **abandoned the day it was bought** | — | TRY | Sunk — portion of the row above | **This is the cost of the naming gap, recorded so it is not invisible.** `parfumoza.com` was abandoned hours after purchase: the name contained **Parfumo** (a 227,701-fragrance database operating since 2008) whole, and sat one letter from **Parfumado**. Nothing had been checked against existing fragrance brands before buying. The amount is a fraction of the 1,680.00 TRY above — **not an additional charge**, and not separately known. Kept as a memo row rather than a number so the running balance is not double-counted. If the domain is left to lapse rather than renewed, there is no recurring cost; if it is kept as a redirect, it becomes an annual expense that needs its own row at renewal. |

## Recurring subscriptions (at a glance)

| Subscription | Department | Cost | Cadence | Status |
|---|---|---|---|---|
| OpenArt (12,000 credits/mo tier) | Shared (Advertising, Architecture) | ~$29/mo (unconfirmed, see note above) | Monthly (assumed — could be annual) | Active |
| `counterscent.com` domain + mailbox (Hostinger) | Web Development | Part of 1,680.00 TRY (split unknown) | Annual (assumed — **unconfirmed**) | Active |
| `parfumoza.com` domain + mailbox (Hostinger) | Web Development | Part of 1,680.00 TRY (split unknown) | — | **Closed 2026-08-27 — shut down at Hostinger, auto-renew disabled. No further charge; it lapses at term end.** |

**Closed:** the abandoned domain and its mailbox were shut down at Hostinger by the founder on 2026-08-27 with auto-renew off, so the 1,680.00 TRY is a **one-off cost, not a recurring one.** It is not being kept as a redirect.

**Still open, and only the founder can supply it:** the per-item split of the 1,680.00 TRY across the four purchased items, and whether auto-renew is on for **`counterscent.com`** — the domain being kept. Both come off the Hostinger invoice; `hostinger-billing` is deliberately not configured, so no agent can retrieve either. The renewal price matters more than the purchase price here: `departments/web-development/CLAUDE.md` documents that Hostinger's renewal rates run well above the advertised first-term figure.

**Note on hosting:** there is **no hosting charge** and no row for one. The site runs on Cloudflare Workers' free plan, whose terms were verified on 2026-08-27 to permit commercial use. Hostinger sells the domains and email only — email is attached to the domain, not to a hosting plan.
