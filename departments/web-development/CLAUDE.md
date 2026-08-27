# Web Development

Builds and ships client websites end to end: design-to-code, front-end build, deploy, handoff.

## Stack

- **Framework**: Next.js (React) + TypeScript, App Router
- **Styling / UI**: Tailwind CSS + shadcn/ui for component primitives
- **Backend**: this department owns the backend, not just the front end. Next.js Route Handlers / Server Actions for API logic; **Prisma** as the default ORM; **Postgres** as the default database (via Neon or Supabase — pick one per client when the project needs persistent data; neither is provisioned yet, so say so rather than assuming a database is live). **Auth.js (NextAuth)** as the default auth layer when a client needs accounts/login.
- **Payments (when a build needs them)**: **do not default to Stripe.** Sirketim is a Turkey-based A.Ş. and Stripe does not serve Turkey — check `../accounting/CLAUDE.md` and its `reports/payment-rails-investigation.md` before writing a line of integration code. Defaults that actually work: **Paddle** (merchant of record, digital goods only, will not process physical products), **iyzico**/**PayTR** (Turkish, TRY, both support recurring). A full Stripe checkout + webhook integration was built and thrown away in 2026-08-26 for exactly this reason. Whatever the provider, keep the shape provider-agnostic — hosted checkout redirect, signed webhook as the *only* writer of subscription state, a local projection of the provider's own object — which is the ~60–70% that survives a provider swap.
- **Hosting**: no standing default — pick per project against the comparison below. **Vercel's Hobby tier is for non-commercial use**, so an ad-supported, affiliate-monetised, or otherwise revenue-generating site needs Pro (~$20/mo/member). Check the current terms before deploying anything that earns money, and flag the cost to the founder rather than assuming free; for a pre-revenue project this single line can outweigh every other launch cost combined.
- **Repos**: GitHub, one repo per client under `departments/web-development/clients/<slug>/`
- **CMS (when needed)**: prefer a headless option (Sanity or Payload) over a custom admin panel unless the client specifically needs one

Deviate from this stack when a client's requirements call for it (e.g. WordPress if the client insists on editing it themselves, Shopify for storefronts) — this is the default, not a mandate.

## Design workflow — UI/UX comes before code

Don't go straight from brief to code. For every new client build (and any significant redesign of an existing one):

1. Use the **`design` skill** to draft the actual UI/UX as artboards (the pages/screens/flows involved) before writing production code — this is where layout, hierarchy, and visual design decisions get made and reviewed, not improvised while coding.
2. Get sign-off on the design direction (founder, and client where applicable) before implementation starts.
3. Build against the signed-off design — Tailwind/shadcn implementation should match what was approved, not drift from it ad hoc. If something needs to change during build, update the design artboards, don't just quietly diverge.
4. Before calling any new screen/component done, run the **`ui-ux-pro-max` skill** over it — layout, responsiveness, accessibility, and color/interaction issues a first implementation pass tends to miss. For a live page, load it with the **Chrome DevTools MCP** (`mcp__chrome-devtools` — screenshot, console errors, responsive breakpoints, Core Web Vitals) before running `ui-ux-pro-max` over it: `chrome-devtools` (see it live) → `ui-ux-pro-max` (review). For motion — micro-interactions, transitions, easing/duration — use the `emil-design-eng`/`animate` skills instead of freehanding timing values.

Use the **`dataviz` skill** for any charts, dashboards, or stat displays a client site needs — don't improvise chart colors/layout from scratch.

## Product quality: 21st MCP, Chrome DevTools MCP

Configured in `.mcp.json` (project-wide, travels with the repo):
- **`21st`** (21st.dev's Magic MCP: search 10,000+ React/Tailwind components, or generate new ones from a description, without leaving the chat). Grant is scoped to the `web-developer` subagent as `mcp__21st`.
- **`chrome-devtools`** (Google's Chrome DevTools MCP, free, no API key: drives a real local Chrome instance — screenshots, console, network, performance/Core Web Vitals, accessibility tree). Grant is scoped to `web-developer` as `mcp__chrome-devtools`, runs via `npx chrome-devtools-mcp@latest --isolated` (temp profile, doesn't touch the founder's real Chrome profile). This is what actually lets the department "test in a browser before calling it done" per the root CLAUDE.md instruction — nothing else in this repo drove a real browser before this was added.
- **`openart`** (OAuth, no API key — see root CLAUDE.md's connector status) — granted to `web-developer` as `mcp__openart` starting 2026-08-25, for generating hero/lifestyle/mood imagery and short video loops for product sites (first use: the `affiliate-sites/fragrance-dupes` build). Previously only granted to `architecture-assistant` and `ad-strategist`. **Trademark caution**: never generate photorealistic renders of real, identifiable branded products (e.g. a specific designer perfume's actual bottle shape/label) — use abstract/artistic scent-mood imagery, generic bottle silhouettes, or ingredient/texture visuals instead.

**21st needs a per-machine API key, not committed to the repo** (the repo is public — see root `CLAUDE.md`'s "Git remote" bullet). `.mcp.json` references it as `${TWENTY_FIRST_API_KEY}`, resolved from the local environment at startup, not stored in the file. To set it up on a machine:

1. Get a key at [21st.dev/mcp](https://21st.dev/mcp) (sign in, generate a key — old Magic MCP keys were reset, a fresh one is required).
2. Set it as a real environment variable named `TWENTY_FIRST_API_KEY` on that machine (persists across sessions — e.g. Windows: `setx TWENTY_FIRST_API_KEY "..."`, then open a new terminal).
3. Run `claude mcp list` in a new Claude Code session — `21st` should show `✔ Connected`. If it still shows unauthorized/pending, the env var likely isn't set in that process's environment yet (new terminal needed) rather than the server being broken.

`chrome-devtools` needs no key or approval step beyond the normal per-session MCP approval (`/mcp`) — `claude mcp list` should show it connected as soon as `npx` can fetch the package (first run downloads it).

## Hostinger MCP — domain, DNS, hosting, VPS

Added 2026-08-27 for the `parfumoza.com` launch. Four of Hostinger's official MCP servers are configured in `.mcp.json`: `hostinger-domains`, `hostinger-dns`, `hostinger-hosting`, `hostinger-vps` (npm package `hostinger-api-mcp`).

**Deliberately NOT configured**: `hostinger-billing`, `hostinger-ecommerce`, `hostinger-reach`. Billing exposes payment and purchase operations, which an agent has no business holding; the other two are unrelated to this work. The founder's original config included all seven — the three were dropped on purpose and are one line each to restore if a real need appears.

**The token is a per-machine environment variable, never committed.** `.mcp.json` references `${HOSTINGER_API_TOKEN}` and is a *tracked* file in a **public** repo, so a literal token there would be published on the next push. Same pattern and same reason as `TWENTY_FIRST_API_KEY` above. To set it up on a machine: `setx HOSTINGER_API_TOKEN "..."`, then start a **new** session (MCP servers load at session start, and `setx` only affects processes started afterwards).

**Gotcha that cost real time:** a PowerShell/Bash tool call inherits its environment from the Claude Code process, which was started *before* `setx` ran — so `$env:HOSTINGER_API_TOKEN` reads as empty in the same session that set it, and every API call comes back `401 Unauthenticated`. That looks exactly like a bad token. Read it with `[Environment]::GetEnvironmentVariable("HOSTINGER_API_TOKEN","User")` instead, or check the length before concluding the key is wrong.

**API notes**: base URL is `https://developers.hostinger.com` (the docs host *is* the API host), auth is `Authorization: Bearer <token>`. Useful paths: `/api/domains/v1/portfolio`, `/api/dns/v1/zones/{domain}` (GET/PUT), `/api/vps/v1/virtual-machines`. **Rate limits are aggressive** — expect `429 Too Many Attempts` on back-to-back calls; space requests ~20–40s apart.

## Choosing a host — the real numbers, verified 2026-08-27

Researched for the `parfumoza.com` launch, against each vendor's own pricing page. **Two corrections to what this repo previously assumed**, both of which change the decision:

1. **Hostinger's ordinary shared plans now run Node.js web apps** — Business/"Unlimited" (5 apps) and every Cloud plan (10 apps), GitHub-connected with auto-rebuild on push, Node 18/20/22/24. The old "shared hosting is PHP/Apache, it can't run a Next.js route handler" reasoning is out of date; don't repeat it.
2. **Cloudflare is no longer a drop-in for an older Next.js app.** `@opennextjs/cloudflare` ended Next.js 14 support in Q1 2026, and the current recommended path (`vinext`) targets Next.js 16. For a Next 14 project, Cloudflare means either a **static export** or a **Next upgrade** — not `git push`.

| | Hostinger Cloud Startup | Hostinger Unlimited | Cloudflare Pages |
|---|---|---|---|
| Advertised | $7.99/mo | $3.99/mo | $0 |
| **Actual commitment** | **48 mo, $383.52 upfront** | **48 mo, $191.52 upfront** | none |
| **Renewal** | **$25.99/mo** ($311.88/yr) | **$16.99/mo** ($203.88/yr) | $0 |
| Resources | 4 CPU / 4 GB / 100 GB | 2 CPU / 3 GB / 50 GB | edge |

Cloudflare Workers Paid is $5/mo (10M requests, 30M CPU-ms) if the free tier's 100k requests/day is exceeded; **static asset requests are free and unlimited on both tiers**, which is what matters for a content site.

**How to reason about it:**

- **The advertised monthly price is a 48-month prepayment, and renewal is 3–4× it.** Always quote the founder the upfront figure and the renewal, never the headline. A four-year commitment on a pre-revenue site is the same trap as the Vercel Pro line above.
- **Cloud over Business buys CPU, RAM, app slots and a dedicated IP — not capability.** Node.js support is identical. Don't recommend Cloud unless something concrete needs the headroom.
- **Check whether the app actually needs a server before pricing one.** Grep for `cookies()`, `headers()`, `force-dynamic`, `revalidate`, `runtime =` and route handlers. A Next.js site with none of those is statically exportable, and a redirect-only route handler can usually become a generated `_redirects` file. `products/affiliate-sites/fragrance-dupes/` is exactly this shape.
- **Email is not an argument for buying hosting.** Hostinger email is attached to the *domain*, not the plan — `contact@parfumoza.com` resolves today with **no hosting plan on the account** (MX/SPF/DKIM/DMARC verified live via the API).
- Hostinger has a **30-day money-back guarantee**, so a wrong pick is recoverable at day 20 and not at day 400.

## Skills for UI/motion quality

- **`ui-ux-pro-max`** (`.claude/skills/ui-ux-pro-max/`) — local design-intelligence data (styles, palettes, typography, UX rules) for reviewing or generating a screen/component. This is the skill referenced above and in `web-developer.md`; installed via `uipro init --ai claude` (npm package `ui-ux-pro-max-cli`). Its installer also bundles several *other* skills (`design`, `brand`, `banner-design`, `design-system`, `slides`, `ui-styling`) — deliberately not kept: the bundled `design` skill has the exact same name as Anthropic's own built-in `design` skill (Claude Design canvas), which the internal dashboard workflow depends on, and shadows/overrides it if present. Re-running `uipro init` will recreate those folders — delete them again (keep only `ui-ux-pro-max/`) rather than letting the shadow reappear.
- **Emil Kowalski's skill set** (`emilkowalski/skills`, installed via `npx skills@latest add emilkowalski/skills`) — lands in `.agents/skills/`, symlinked into `.claude/skills/`. Relevant ones for this department: `emil-design-eng` (general UI polish/component-design philosophy), `animate` (build an animation from scratch — timing, easing, interruption), `review-animations`/`improve-animations` (audit existing motion), `apple-design` (gesture/spring/materials principles adapted for web), `ask-sonner` (the Sonner toast library), `pick-ui-library`, `prototype`, `animation-vocabulary`. `write-swift` and `animate-expo` are irrelevant to this department's Next.js stack (mobile/Swift-oriented) — harmless to leave installed, just don't reach for them here.
- **`design-taste-frontend`** ("taste skill", `Leonxlnx/taste-skill`, installed via `npx skills@latest add Leonxlnx/taste-skill --skill design-taste-frontend` — the `--skill` flag matters, the source repo bundles 12 other style/output variants not installed here) — anti-"AI slop" instruction skill: infers a design direction from the brief, sets variance/motion/density dials before coding, and pushes back on generic patterns (centered heroes, purple gradients, boilerplate layouts). Complements `ui-ux-pro-max` (which supplies concrete style/palette/typography data) rather than replacing it — reach for `design-taste-frontend` earlier, when deciding the direction, and `ui-ux-pro-max` when reviewing the built result.

## Recommended connectors (not yet configured)

Set these up when accounts exist; don't assume they're live:

- **GitHub** — repo creation, PRs, issue tracking per client project
- **Vercel API** — deploys and preview URLs without leaving the chat
- **Figma MCP** — official, Figma-hosted, but its free tier caps at 6 tool calls/month (Starter plan or View/Collab seat) — not practically usable free. Real use needs a paid Professional-plan seat (~$12/mo Dev seat, ~$16/mo Full seat). Only worth wiring up once a client actually hands over Figma files and the founder decides the seat cost is worth it — treat as a paid decision, not a free connector like `openart`/`chrome-devtools`.
- **Neon or Supabase** — managed Postgres for the backend stack above; pick per client based on whether the project also needs auth/storage bundled (lean towards Supabase) or just a database (lean towards Neon)
- **Resend** — transactional email (auth flows, contact forms, notifications) once a client build needs it

## Conventions

- One client = one folder under `clients/<slug>/`, each with its own `CLAUDE.md` for client-specific context (goals, brand constraints, tech decisions) — created by the `new-web-client` skill.
- Register every new client in `../../shared/clients.md`.
- Use the `web-developer` subagent (`.claude/agents/web-developer.md`) for build work; it has full tool access (Bash, file edits, web fetch) scoped to this department's conventions.
