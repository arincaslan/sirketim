# Board

Three board members sit between the founder and the six departments. The founder briefs a board member with an outcome, not a task list; the board member delegates to the department subagent(s) it owns via the Agent tool, then reports back a synthesized result — not a raw handoff. Each board member is its own subagent (`.claude/agents/board-*.md`), separate from the department subagents it directs.

| Board member | Subagent | Owns | Delegates to |
|---|---|---|---|
| COO | `board-coo` | Web Development, Architecture, Sales, Advertising (production) | `web-developer`, `architecture-assistant`, `sales-strategist`, `ad-strategist` |
| CFO | `board-cfo` | Accounting | `accountant` |
| Controller | `board-controller` | Control/Audit | `auditor` |

## Why three, not one per department

A lean board keeps the founder's briefing surface small — three relationships to manage, not six — while still separating production (COO), money (CFO), and oversight of the whole operation (Controller) into distinct lines of accountability. If a department outgrows this grouping (e.g. production splits into two board members), that's a deliberate future change, not a default.

## How to work with the board

- Address the board member for the outcome you want, not the department: "COO, get client X a proposal" rather than "sales-strategist, draft a proposal." The board member figures out routing, including when a brief spans more than one of its departments.
- The CFO and Controller run the weekly accounting and control reports (see `../departments/accounting/CLAUDE.md` and `../departments/control/CLAUDE.md`) — on a schedule once one is configured (see each department's CLAUDE.md for current cadence), or on demand by asking.
- Board members report back compressed, decision-relevant summaries — if you need a subagent's full raw output, ask for it explicitly.
- Board members don't do department-level production work themselves (no code, no proposals, no ledger edits) — that stays with the department subagents. The board's job is routing, sequencing multi-department work, and turning results into something actionable for the founder.

## Status

Set up 2026-08-19, alongside the Accounting and Control/Audit departments. Not yet load-tested at any real volume — if the three-person split or the delegation pattern doesn't hold up in practice, revisit this file rather than letting the board charter drift from how work actually happens.
