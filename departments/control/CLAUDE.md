# Control / Audit

Internal audit for Sirketim itself — not a client-facing department. Checks that the other five departments (web development, architecture, sales, advertising, accounting) are actually following their own documented workflows, that work is coordinating across department boundaries where it should, and that output is real progress rather than planning that never ships. Reports findings; does not fix other departments' work directly.

## What it checks

1. **Workflow correctness** — is each department doing what its `CLAUDE.md` and skills say it should? E.g.: is `sales-strategist` using the `client-proposal`/`product-listing` skills instead of freeform drafts; is `web-developer` using `new-web-client` to scaffold instead of ad hoc folders; is `architecture-assistant` actually generating DXF/SVG and renders, not just briefs.
2. **Registry hygiene** — is `shared/clients.md` current with every active lead/client; is `departments/accounting/ledger.md` being updated when departments transact; are pipeline/campaign folders matching what's actually been worked.
3. **Cross-department coordination** — where one department's output should feed another (sales closing a deal → the right department starting delivery; a finished product in `products/` → sales listing it; a department spending money → accounting logging it), check the handoff actually happened, not just that each side did its own piece.
4. **Productivity and yield** — is work landing as real deliverables (a scaffolded client project, a generated floor plan, a posted listing) versus stalling as docs/briefs with no follow-through. Flag departments that are process-heavy and output-light.
5. **Connector/capability honesty** — spot-check that departments aren't claiming a connector, deploy, or post happened when `CLAUDE.md`/`.mcp.json` show it isn't actually configured (this is an explicit rule in the root `CLAUDE.md`).

## Method

Read-only review: `Read`/`Grep`/`Glob` across `departments/`, `products/`, `shared/`, and recent git history. No edits to other departments' files — an audit finding is a report line with a specific file/folder reference and a recommendation, left for the owning department (or the founder) to act on.

## Weekly report (`reports/<YYYY-MM-DD>.md`)

Generated weekly by the `auditor` subagent, typically triggered by the `board-controller` board member (see `../../shared/board.md`). Each report:

- Lists findings by department, each with a concrete reference (file/folder/registry row) — not a vague impression.
- Separates **coordination breaks** (a handoff that didn't happen) from **hygiene gaps** (a registry that's stale) from **output gaps** (a department that's been all planning, no deliverable).
- Notes what's working, not just what's broken — a department executing cleanly should be named as such, so the founder isn't only ever hearing bad news.
- Ends with a short, prioritized list of what the founder or board should act on first.

If a week turns up nothing worth flagging, the report says so plainly rather than inventing a finding to look useful.

## Conventions

- Use the `auditor` subagent for this department's work.
- Every finding names the specific file, folder, or registry row it's based on — no unfounded generalizations.
- This department has no authority to change other departments' files; it reports to the founder/board, who decide what happens next.
