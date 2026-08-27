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

Added 2026-08-27 for the `counterscent.com` launch. Four of Hostinger's official MCP servers are configured in `.mcp.json`: `hostinger-domains`, `hostinger-dns`, `hostinger-hosting`, `hostinger-vps` (npm package `hostinger-api-mcp`).

**Deliberately NOT configured**: `hostinger-billing`, `hostinger-ecommerce`, `hostinger-reach`. Billing exposes payment and purchase operations, which an agent has no business holding; the other two are unrelated to this work. The founder's original config included all seven — the three were dropped on purpose and are one line each to restore if a real need appears.

**The token is a per-machine environment variable, never committed.** `.mcp.json` references `${HOSTINGER_API_TOKEN}` and is a *tracked* file in a **public** repo, so a literal token there would be published on the next push. Same pattern and same reason as `TWENTY_FIRST_API_KEY` above. To set it up on a machine: `setx HOSTINGER_API_TOKEN "..."`, then start a **new** session (MCP servers load at session start, and `setx` only affects processes started afterwards).

**Gotcha that cost real time:** a PowerShell/Bash tool call inherits its environment from the Claude Code process, which was started *before* `setx` ran — so `$env:HOSTINGER_API_TOKEN` reads as empty in the same session that set it, and every API call comes back `401 Unauthenticated`. That looks exactly like a bad token. Read it with `[Environment]::GetEnvironmentVariable("HOSTINGER_API_TOKEN","User")` instead, or check the length before concluding the key is wrong.

**API notes**: base URL is `https://developers.hostinger.com` (the docs host *is* the API host), auth is `Authorization: Bearer <token>`. Useful paths: `/api/domains/v1/portfolio`, `/api/dns/v1/zones/{domain}` (GET/PUT), `/api/vps/v1/virtual-machines`. **Rate limits are aggressive** — expect `429 Too Many Attempts` on back-to-back calls; space requests ~20–40s apart.

## Choosing a host — the real numbers, verified 2026-08-27

Researched for the `counterscent.com` launch, against each vendor's own pricing page. **Two corrections to what this repo previously assumed**, both of which change the decision:

1. **Hostinger's ordinary shared plans now run Node.js web apps** — Business/"Unlimited" (5 apps) and every Cloud plan (10 apps), GitHub-connected with auto-rebuild on push, Node 18/20/22/24. The old "shared hosting is PHP/Apache, it can't run a Next.js route handler" reasoning is out of date; don't repeat it.
2. **Cloudflare is no longer a drop-in for an older Next.js app.** `@opennextjs/cloudflare` ended Next.js 14 support in Q1 2026, and the current recommended path (`vinext`) targets Next.js 16. For a Next 14 project, Cloudflare means either a **static export** or a **Next upgrade** — not `git push`.

| | Hostinger Cloud Startup | Hostinger Unlimited | Cloudflare Workers |
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
- **Email is not an argument for buying hosting.** Hostinger email is attached to the *domain*, not the plan — `contact@counterscent.com` resolves today with **no hosting plan on the account** (MX/SPF/DKIM/DMARC verified live via the API).
- Hostinger has a **30-day money-back guarantee**, so a wrong pick is recoverable at day 20 and not at day 400.

## Deploying to Cloudflare — what actually worked

`counterscent.com` is the first site deployed from this repo, and it has been **live since 2026-08-27**. **Four** builds failed before it worked — the first two for the reason below, then a third that found Node but still never ran the build, and a fourth fixed only by the `postinstall` hook. The failure mode is worth recognising because the log does not say what is wrong.

**A commercial-use check that was nearly missed:** this department rejected Vercel Hobby on its non-commercial clause (see "Hosting" above) and then chose Cloudflare without asking the same question of it. Verified 2026-08-27: **Cloudflare's free plan permits commercial use.** Ask this of every free tier, every time — the question that disqualifies one host does not get to skip the next one.

**Symptom**: the build log shows `Detected the following tools from environment:` with **nothing after it**, goes straight to `Executing user deploy command: npx wrangler deploy`, never runs `npm install` or `npm run build`, and fails with `Could not detect a directory containing static files`.

**What that means**: Cloudflare created a **Workers** project (the current default — it does *not* create Pages projects any more), cloned the repo root, and found no `package.json` there because the app is four levels down. Nothing about the code was wrong.

**The fix used here** — make the repo root self-sufficient so the deploy depends on **no** dashboard settings at all:

- Root `package.json` with a `build` script that `cd`s into the project and builds it.
- Root `wrangler.jsonc` with `assets.directory` pointing at that project's `out/`.
- Root `package-lock.json`, so Cloudflare uses **npm**. Without one it detected **bun**, which printed `No packages! Deleted empty lockfile` and moved on.
- **A `postinstall` hook** (`scripts/ci-postinstall.mjs`) that runs the build during Cloudflare's automatic "Installing project dependencies" step. This is the part that makes it work with nothing configured: setting the build command in the dashboard failed to take three times running, and the log's tell is the **absence** of any `Executing user build command:` line. The script is gated on `WORKERS_CI`/`CF_PAGES`/`CI` so a human running `npm install` at the repo root does not trigger a site build, and it exits non-zero on build failure rather than letting wrangler deploy a missing or half-written `out/`.

Setting the dashboard **build command** to `npm run build` is still the *intended* mechanism and does no harm — the build just runs twice. If it is ever confirmed reliable, the postinstall hook can be deleted; it is redundancy, not architecture.

Setting a **root directory** in the dashboard is the other fix, and is the better one *if it takes* — but it needs **Build System V2** for monorepo support, and it silently did not apply here. Also note **"Retry deployment" replays the previous build's settings**; after changing settings you need a *new* deployment (push a commit, or use Create/Deploy) or you will debug a config that is no longer current.

**Verify locally before pushing** — simulate the builder exactly, rather than running the build by hand:

```bash
rm -rf products/affiliate-sites/fragrance-dupes/out
WORKERS_CI=1 npm install           # from the repo root; postinstall does the build
npx wrangler@4 deploy --dry-run    # should print "Read N files from the assets directory"
```

Running `npm run build` directly also works, but it proves less: it bypasses the `postinstall` path that Cloudflare actually takes. `WORKERS_CI=1 npm install` is the real rehearsal.

**Config choices worth keeping**: `not_found_handling` is `"404-page"`, deliberately **not** `"single-page-application"` — SPA handling returns `index.html` with a **200** for every unknown URL, which tells a crawler that every typo'd path is a real page and makes a broken redirect render the homepage instead of failing visibly.

### "The site is down" — verify before you believe it

This has been reported **three times** for a site that was live worldwide each time, and it has never once been the site. The founder's **OpenWrt router (`192.168.1.1`) serves a stale apex A record for `2.57.91.91`** — Hostinger's old parked-page IP, which returns a real HTTP 200 with `<title>Parked Domain name on Hostinger DNS system</title>`. A browser shows that parked page and it looks exactly like a broken deploy. `Clear-DnsClientCache` does not help, because the router re-serves it.

The tell is that **`www` resolves correctly through the same router** while the apex does not. Run these before concluding anything:

```bash
curl -s -o /dev/null -w "%{http_code} %{remote_ip}\n" https://counterscent.com/     # what YOU get
curl -s -o /dev/null --resolve counterscent.com:443:104.21.23.170 -w "%{http_code}\n" https://counterscent.com/
nslookup counterscent.com 1.1.1.1                       # public resolver
nslookup counterscent.com michelle.ns.cloudflare.com    # authoritative
nslookup counterscent.com ns1.dns-parking.com           # Hostinger: expect NXDOMAIN
```

If the authoritative and public answers are Cloudflare IPs and only the local one differs, **the site is fine** — say so plainly and point at the router (reboot, or `/etc/init.d/dnsmasq restart`), rather than starting a deploy investigation. The reverse mistake has also been made here: reporting the site *down* on the strength of one local `curl`. Neither direction is safe from a single local lookup.

**Workers vs Pages, going forward**: staying on Workers is the right call. `assets` serves a static export from the edge on the free plan, and a `main` Worker script can later handle a dynamic path (for Counterscent, the `/go/*` affiliate chokepoint) while falling through to assets for everything else — which Pages would need a separate Functions directory for. **Gotcha for that day**: `_redirects` rules are **not** applied to requests served by Worker code, only to asset requests, so move the mapping into the script rather than leaving both and guessing.

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
