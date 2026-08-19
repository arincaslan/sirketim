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
