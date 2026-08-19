# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Sirketim is a solo-founder, multi-department agency workspace, not a single codebase — it currently holds no client projects yet. Claude Code subagents act as each department's actual workers (drafting, research, first-pass production), not just copilots; the founder reviews and decides. Six departments: web development, architecture (real building/interior design), sales, advertising, accounting, control/audit. A three-member board (COO, CFO, Controller) sits between the founder and the departments — see `shared/board.md`.

## Commands

There is no build/lint/test at the repo root — no client code exists yet. Once the `new-web-client` skill scaffolds a client under `departments/web-development/clients/<slug>/`, that project gets its own Next.js `package.json` with its own `npm run dev` / `build` / `lint`, scoped to that subfolder.

Commands that are already real and used in this repo:
- **Architecture CAD generation**: Python with `ezdxf` (DXF) and `svgwrite` (SVG) — already installed system-wide. See `departments/architecture/CLAUDE.md`.
- **Architecture 3D rendering**: Blender 4.5 LTS, run headless — `"C:\Program Files\Blender Foundation\Blender 4.5\blender.exe" --background --python <script>.py`. Installed via winget (`BlenderFoundation.Blender.LTS.4.5`), added to the user PATH. Note: `bpy` must be imported explicitly in the script; it isn't auto-imported.
- **MCP connector status**: `claude mcp list` shows configured servers; `/mcp` inside an interactive session approves a pending one. `openart` is configured in `.mcp.json` (OAuth, no API key). Approval appears to be scoped per session/process, not global — a session can show `⏸ Pending approval` even after the founder approved it elsewhere. Always check `claude mcp list` in the current session before claiming it's live or unavailable; if it's pending here despite being approved elsewhere, that's likely a stale session, not a broken connector.

## Architecture

CLAUDE.md files nest and each layer adds scope, not a replacement: this root file -> `departments/<dept>/CLAUDE.md` -> `departments/<dept>/clients/<slug>/CLAUDE.md` (created per-client by a skill). Read the relevant chain before doing department or client work, don't rely on the root file alone.

- **Subagents** (`.claude/agents/`) map 1:1 to departments — `web-developer`, `architecture-assistant`, `sales-strategist`, `ad-strategist`, `accountant`, `auditor`. Each is scoped to its department's CLAUDE.md, has only the tools that department needs, and should be invoked for department-specific work instead of doing it ad hoc from root.
- **Board members** (`.claude/agents/board-*.md`) are a layer above departments, not a 7th/8th department — `board-coo` (owns web development, architecture, sales, advertising), `board-cfo` (owns accounting), `board-controller` (owns control/audit). The founder briefs a board member with an outcome; it delegates to the department subagent(s) it owns via the Agent tool and reports back a synthesized result. See `shared/board.md`. Prefer addressing the board member over the department subagent directly when the request is an outcome rather than a specific department task.
- **Skills** (`.claude/skills/`) are the repeatable intake-to-deliverable workflows: `new-web-client`, `project-brief` (architecture), `client-proposal` (sales), `campaign-brief` (advertising), `product-listing` (sales/products). Prefer these over freeform work when a task matches one.
- **`products/`** vs **`departments/<dept>/clients/`**: products are Sirketim's own sellable goods (web templates, architecture plan packs, POD prints), built by whichever department creates the underlying asset but sold by sales via marketplaces — separate from client-commissioned work. See `products/README.md` for the line breakdown.
- **`shared/clients.md`** is the single cross-department client/lead registry (a client can span multiple departments). **`shared/board.md`** is the board charter (who's on it, what they own). **`shared/brand.md`** is Sirketim's own brand/voice, still a placeholder.
- **Connector status** lives in two places: `.mcp.json` (MCP servers, e.g. `openart`) and each department's CLAUDE.md "Recommended connectors" section (everything else, mostly not yet configured — check before assuming a connector is live).

## Departments

- [Web Development](departments/web-development/CLAUDE.md) — Next.js + Tailwind + shadcn/ui, GitHub, Vercel.
- [Architecture](departments/architecture/CLAUDE.md) — briefs, zoning research, to-scale CAD floor plans (DXF/SVG), 3D catalog renders (Blender + AI polish). Never claims permit-ready/stamped output.
- [Sales](departments/sales/CLAUDE.md) — client pipeline/proposals, plus productizing department output for near-zero-cost marketplace sales (Etsy primary).
- [Advertising](departments/advertising/CLAUDE.md) — OpenArt-generated content, organic-first posting (Instagram/TikTok), paid spend only when budgeted or revenue-funded.
- [Accounting](departments/accounting/CLAUDE.md) — manual ledger of income/expenses/subscriptions (no bank/Stripe integration yet), weekly financial report.
- [Control/Audit](departments/control/CLAUDE.md) — internal audit of the other departments: workflow correctness, registry hygiene, cross-department coordination, productivity/yield. Read-only over other departments' files; reports findings, doesn't fix them.

## Conventions

- Client work: `departments/<department>/clients/<slug>/`. Products: `products/<line>/<slug>/`. Slugs are lowercase-hyphenated.
- Register every client/lead in `shared/clients.md` as soon as they're qualified.
- Every transaction (income, expense, subscription charge) gets a row in `departments/accounting/ledger.md` when it happens, not retroactively at report time.
- Don't claim a connector, deploy, or post happened if it isn't actually configured — say what's missing instead.
