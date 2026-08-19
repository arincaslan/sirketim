# Sirketim

A multi-department agency: web development, architecture, sales, and advertising. Run by a solo founder, with Claude Code subagents acting as each department's workers — not just copilots. Agents draft, research, and produce first-pass deliverables; the founder reviews and decides.

## Departments

- [Web Development](departments/web-development/CLAUDE.md) — client website builds. Stack: Next.js + Tailwind + shadcn/ui.
- [Architecture](departments/architecture/CLAUDE.md) — real building/interior design: briefs, specs, research, to-scale CAD floor plans, and 3D catalog renders.
- [Sales](departments/sales/CLAUDE.md) — client pipeline/proposals, **and** productizing department output for marketplace sales (near-zero cost).
- [Advertising](departments/advertising/CLAUDE.md) — low-cost content generation (OpenArt) and organic social posting, plus paid campaigns when budgeted.

## Working model

- Each department has a dedicated subagent under `.claude/agents/` (`web-developer`, `architecture-assistant`, `sales-strategist`, `ad-strategist`). Invoke the relevant one for department-specific work rather than doing it ad hoc from the root — it carries the right scope, tone, and tool access for that department.
- Each department has one or more skills under `.claude/skills/` for its core repeatable deliverable (new client site, project brief, proposal, campaign brief, product listing). Prefer these over freeform work when the task matches.
- `shared/clients.md` is the single client registry across all departments — a client can appear in more than one department (e.g. a client gets both a website and an ad campaign).
- `shared/brand.md` holds Sirketim's own brand/voice — fill in as the founder defines it.
- `products/` holds Sirketim's own sellable products (web templates, architecture plan packs, POD prints) — separate from client work, owned end-to-end by whichever department creates the underlying asset but *sold* by the sales department. See `departments/sales/CLAUDE.md`.

## Conventions

- Client work lives under `departments/<department>/clients/` (or `proposals/`, `campaigns/` where that fits better), one folder per client, named by a lowercase-hyphenated slug.
- No external tool connectors are wired up yet (no API keys configured), **except an OpenArt account exists** for the advertising department — it still needs an API key added before Claude can drive it directly. Each department's CLAUDE.md lists recommended tools/connectors for when accounts exist — don't assume the rest are live.
