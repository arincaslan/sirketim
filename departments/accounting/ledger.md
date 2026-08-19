# Ledger

Single source of truth for Sirketim's income, expenses, and subscriptions. Add a row as soon as a transaction happens or is discovered — see `CLAUDE.md` for column definitions and who's responsible for logging.

| Date | Type | Department | Category | Description | Amount | Currency | Status | Notes |
|---|---|---|---|---|---|---|---|---|
| 2026-08-19 | Subscription | Shared | Software | OpenArt "Plus" plan (12,000 credits/mo, confirmed via `openart_account_get`) | 29.00 | USD | Active, price unconfirmed | Account is on the 12,000-credit tier, which OpenArt's public pricing page (as of Aug 2026) lists as the "Advanced" plan at $29/mo ($14.50/mo if billed annually) — plan naming differs between the API ("Plus") and the pricing page ("Advanced"), and this wasn't cross-checked against an actual receipt. Confirm the real charge on the next billing statement and correct this row. |

## Recurring subscriptions (at a glance)

| Subscription | Department | Cost | Cadence | Status |
|---|---|---|---|---|
| OpenArt (12,000 credits/mo tier) | Shared (Advertising, Architecture) | ~$29/mo (unconfirmed, see note above) | Monthly (assumed — could be annual) | Active |
