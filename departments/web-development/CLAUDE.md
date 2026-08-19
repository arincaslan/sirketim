# Web Development

Builds and ships client websites end to end: design-to-code, front-end build, deploy, handoff.

## Stack

- **Framework**: Next.js (React) + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui for component primitives
- **Hosting**: Vercel
- **Repos**: GitHub, one repo per client under `departments/web-development/clients/<slug>/`
- **CMS (when needed)**: prefer a headless option (Sanity or Payload) over a custom admin panel unless the client specifically needs one

Deviate from this stack when a client's requirements call for it (e.g. WordPress if the client insists on editing it themselves, Shopify for storefronts) — this is the default, not a mandate.

## Recommended connectors (not yet configured)

Set these up when accounts exist; don't assume they're live:

- **GitHub** — repo creation, PRs, issue tracking per client project
- **Vercel API** — deploys and preview URLs without leaving the chat
- **Figma MCP** — pull design specs/assets directly when a design comes from Figma instead of being drafted here

## Conventions

- One client = one folder under `clients/<slug>/`, each with its own `CLAUDE.md` for client-specific context (goals, brand constraints, tech decisions) — created by the `new-web-client` skill.
- Register every new client in `../../shared/clients.md`.
- Use the `web-developer` subagent (`.claude/agents/web-developer.md`) for build work; it has full tool access (Bash, file edits, web fetch) scoped to this department's conventions.
