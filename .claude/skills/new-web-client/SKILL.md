---
name: new-web-client
description: Scaffold a new web-development client project — intake, folder setup, starter code, and registry entry. Use when starting a new client website build.
---

# New Web Client

Sets up a new client under `departments/web-development/clients/<slug>/` following the department's default stack (see `departments/web-development/CLAUDE.md`).

## Steps

1. **Intake**. If not already provided, ask for: client name, one-line project goal, any hard requirements (must-use CMS, existing brand assets, deadline). Don't guess these — they shape the whole build.
2. **Slug**. Derive a lowercase-hyphenated slug from the client name (e.g. "Acme Bakery" -> `acme-bakery`).
3. **Scaffold**. Create `departments/web-development/clients/<slug>/` with:
   - A Next.js + TypeScript + Tailwind + shadcn/ui starter (`npx create-next-app` with Tailwind, then add shadcn/ui) — unless the intake called for a different stack, in which case note the deviation.
   - A `CLAUDE.md` in that folder: client name, goal, requirements, any brand constraints, and a link back to `../../CLAUDE.md` for department defaults.
4. **Register**. Add a row for the client in `shared/clients.md` (department: Web Development, status: In progress, next action: initial build).
5. **Report back**: the folder path, what was scaffolded, and the next concrete step (e.g. "confirm homepage sections before I build them").

## Notes

- Don't invent content (copy, images, pricing) for the client — placeholder/lorem content is fine until the client supplies real material, but say clearly what's placeholder.
- No deploy connector is configured yet — don't claim to have deployed anything; say what a deploy would require (Vercel account/connector).
