# Web Development

Builds and ships client websites end to end: design-to-code, front-end build, deploy, handoff.

## Stack

- **Framework**: Next.js (React) + TypeScript, App Router
- **Styling / UI**: Tailwind CSS + shadcn/ui for component primitives
- **Backend**: this department owns the backend, not just the front end. Next.js Route Handlers / Server Actions for API logic; **Prisma** as the default ORM; **Postgres** as the default database (via Neon or Supabase — pick one per client when the project needs persistent data; neither is provisioned yet, so say so rather than assuming a database is live). **Auth.js (NextAuth)** as the default auth layer when a client needs accounts/login.
- **Hosting**: Vercel
- **Repos**: GitHub, one repo per client under `departments/web-development/clients/<slug>/`
- **CMS (when needed)**: prefer a headless option (Sanity or Payload) over a custom admin panel unless the client specifically needs one

Deviate from this stack when a client's requirements call for it (e.g. WordPress if the client insists on editing it themselves, Shopify for storefronts) — this is the default, not a mandate.

## Design workflow — UI/UX comes before code

Don't go straight from brief to code. For every new client build (and any significant redesign of an existing one):

1. Use the **`design` skill** to draft the actual UI/UX as artboards (the pages/screens/flows involved) before writing production code — this is where layout, hierarchy, and visual design decisions get made and reviewed, not improvised while coding.
2. Get sign-off on the design direction (founder, and client where applicable) before implementation starts.
3. Build against the signed-off design — Tailwind/shadcn implementation should match what was approved, not drift from it ad hoc. If something needs to change during build, update the design artboards, don't just quietly diverge.

Use the **`dataviz` skill** for any charts, dashboards, or stat displays a client site needs — don't improvise chart colors/layout from scratch.

## Recommended connectors (not yet configured)

Set these up when accounts exist; don't assume they're live:

- **GitHub** — repo creation, PRs, issue tracking per client project
- **Vercel API** — deploys and preview URLs without leaving the chat
- **Figma MCP** — pull design specs/assets directly when a design comes from Figma instead of being drafted here
- **Neon or Supabase** — managed Postgres for the backend stack above; pick per client based on whether the project also needs auth/storage bundled (lean towards Supabase) or just a database (lean towards Neon)
- **Resend** — transactional email (auth flows, contact forms, notifications) once a client build needs it

## Conventions

- One client = one folder under `clients/<slug>/`, each with its own `CLAUDE.md` for client-specific context (goals, brand constraints, tech decisions) — created by the `new-web-client` skill.
- Register every new client in `../../shared/clients.md`.
- Use the `web-developer` subagent (`.claude/agents/web-developer.md`) for build work; it has full tool access (Bash, file edits, web fetch) scoped to this department's conventions.
