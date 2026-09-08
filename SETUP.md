# Setting up Sirketim on another PC

This repo is the whole workspace — cloning it gets you all department docs, the board/subagent config, the ledger, and every client/product folder. What it does *not* carry is machine-local tool installs and account logins, which you set up once per PC.

## 1. Install the tools

| Tool | Why | Install |
|---|---|---|
| Git | clone/push the repo | usually already present; else [git-scm.com](https://git-scm.com) |
| GitHub CLI (`gh`) | pushing, PRs | `winget install GitHub.cli`, then `gh auth login` as `arincaslan` |
| Node.js + npm | every web-development client/product | [nodejs.org](https://nodejs.org) LTS |
| Python + `ezdxf` + `svgwrite` | architecture CAD (DXF/SVG) generation | `pip install ezdxf svgwrite` |
| Blender 4.5 LTS | architecture 3D renders, run headless | `winget install BlenderFoundation.Blender.LTS.4.5`, confirm it lands on PATH |
| Emil Kowalski's design/animation skills | web-development motion/UI polish (`emil-design-eng`, `animate`, etc.) | `npx skills@latest add emilkowalski/skills` from the repo root — **not committed**, see gitignore note below |
| Taste skill (`design-taste-frontend`) | web-development anti-generic-output check | `npx skills@latest add Leonxlnx/taste-skill --skill design-taste-frontend` from the repo root — **not committed**, same reason as above. The `--skill` flag matters: the source repo (`Leonxlnx/taste-skill`) bundles 12 other style/output variants (`brutalist-skill`, `minimalist-skill`, `imagegen-*`, `brandkit`, etc.) that are deliberately not installed — omitting `--skill` installs all 13. |
| Claude Code | the actual working environment | log in with the same account |

**Why Emil Kowalski's skill set (and the taste skill) aren't just `git pull`-able**: their installer creates Windows directory-junction symlinks (`.claude/skills/<name>/` → `.agents/skills/<name>/`) that hardcode this machine's absolute profile path inside the junction — junctions can't be relative. That breaks on the other machine's different Windows username exactly like the `ODA_EXEC_PATH` gotcha below, so `.gitignore` excludes both `.agents/` and those symlink entries; run the `npx skills@latest add` commands locally on each machine instead (a few seconds each, no account/API key needed). `ui-ux-pro-max` (the other new web-dev skill) doesn't have this problem — it installs as plain files, so it's committed normally and needs no per-machine step.

`gh auth` and Claude Code's own login are **per-machine** — cloning the repo does not carry credentials with it. Do both explicitly on the new PC.

## 2. Clone the repo

```
gh repo clone arincaslan/sirketim
```

The repo is **public** (deliberate — see the "Git remote" bullet in [CLAUDE.md](CLAUDE.md)). Never add a `.env`, API key, or credential file to it; nothing in this workspace currently needs one.

## 3. First things Claude Code should do in a new session there

- Read [CLAUDE.md](CLAUDE.md) at the repo root — it chains into each `departments/<dept>/CLAUDE.md` and, per client, `departments/<dept>/clients/<slug>/CLAUDE.md`. Don't rely on the root file alone for department work.
- Run `git fetch` and check `git branch -r` before trusting local state or briefing the board — other sessions (this PC, phone, claude.ai web) may have pushed work to an unmerged `claude/*` branch. This is a standing rule now, documented in CLAUDE.md's "Cross-session sync" bullet.
- **Check for stale per-user paths from the *other* machine.** The founder's two PCs log in as different Windows usernames (`win10` on one, `Semih` on the other) — any absolute path this repo hardcodes toward a per-user tool install (`C:\Users\<name>\...`, e.g. `departments/architecture/lib/cadgen/export_dwg.py`'s `ODA_EXEC_PATH`) was written for whichever machine last touched it and can be wrong on this one. Compare against `$env:USERNAME` and fix before trusting it — don't rediscover this the hard way. See CLAUDE.md's "Two physical machines, two different Windows usernames" bullet.

## 4. MCP connectors

`.mcp.json` already configures `openart` (OAuth, no API key needed) — it travels with the repo. But connector *approval* is scoped per session/process, not global: a brand-new PC (or even a new session on a known PC) can show `⏸ Pending approval` the first time even though it's approved elsewhere. Run `/mcp` in that session to approve it there.

**Two servers need a per-machine environment variable**, which is never committed (the repo is public):

| Variable | Used by | Get it from |
|---|---|---|
| `HOSTINGER_API_TOKEN` | the four `hostinger-*` servers | Hostinger panel → API tokens |
| `TWENTY_FIRST_API_KEY` | `21st` (web-dev UI components) | 21st.dev account |

Without them those servers fail to connect, which looks identical to a broken server. Two more diagnosis rules, both learned the hard way and both contradicting the obvious move:

- **Do not trust `claude mcp list`** — it has reported a server pending while that same server's own tool worked fine. If a connector matters, call one of its actual tools (or `ToolSearch`) instead.
- **A `CONNECT_TIMEOUT` or `CONNECTION_CLOSED` at session start means "start a fresh session", not "the server is broken"** — confirmed while the same servers worked from another terminal at the same moment. Background subagents are hit hardest, since they do not inherit a fresh session's connections.

## 5. Per-project installs

Each web-development client or product (e.g. `products/web-templates/agency-landing/`, `departments/web-development/clients/<slug>/`) is a self-contained Next.js project with its own `package.json`. `cd` into the specific one you're working on and run `npm install` there before `npm run dev`/`build`/`lint`.

**There is now a root `package.json` too, and it is not a workspace root** — it is a deploy shim that exists only so Cloudflare can build `products/affiliate-sites/fragrance-dupes` from the repo root. Its `postinstall` runs that project's build when `WORKERS_CI`/`CF_PAGES`/`CI` is set, which is why `WORKERS_CI=1 npm install` at the root is the only faithful rehearsal of a Cloudflare deploy — `npm run build` at the root is not what Cloudflare runs and proves little. Running a plain `npm install` at the root is harmless (the hook is gated). See the "deploy shim" section of [CLAUDE.md](CLAUDE.md).

## 5b. Licensed merchant feeds do not travel — and the site does not need them

`products/affiliate-sites/fragrance-dupes/scripts/feeds/` is gitignored except its README — the feeds are licensed affiliate data, large, and not ours to redistribute in a public repo. A fresh clone therefore has **no** feed files, and every ingest/matching script fails with "feed not found". That is expected, not breakage.

**What still works with zero feeds present, which is almost everything:** the site builds, lints and deploys normally, because the ingested results are committed — `lib/data/*.generated.ts` and all 407 images under `public/images/`. **You only need a feed to ingest *new* products or fetch *new* images.** Do not re-download one just to build.

Two networks now, and they are not interchangeable:

- **Awin** (publisher 3064149) — Toolbox → Create-a-Feed, saved as `opulensi.csv` (123248), `clone-of-perfume.csv` (117395), `aromapassions.csv` (34989). Take **all** columns, not the default ~11-column preset, which drops `description` — where every "Inspired by" citation and note pyramid lives.
- **CJ** (advertiser 16941446, our CID 101873278) — a **product export created in CJ's dashboard**, not a download link, and it arrives on CJ's own schedule with a separate "ready" notification. 87 columns, TAB-delimited. **Do not attempt CJ SFTP:** `datatransfer.cj.com` offers only `ssh-dss` host keys, which modern OpenSSH and paramiko have both removed. Use CJ's HTTP/S transport.

Which feeds are mined out, and the per-feed gotchas, are in [HANDOFF.md](HANDOFF.md) and in that directory's own README (which carries the full 87-column CJ schema table).

**One script-level consequence worth knowing before you re-download anything:** `fetch-dupe-images.mjs` now only reads a feed when something actually needs downloading from it, and reports a missing feed per-slug instead of aborting. So having just one of the three Awin feeds present is fine — it will service that merchant and tell you which slugs it skipped. Until 2026-09-07 it did the opposite, and a single expired feed blocked every merchant.

## 6. What needs no setup at all

- **Scheduled reports** (`Sirketim Weekly Accounting Report`, `Sirketim Weekly Control/Audit Report`) run server-side on claude.ai against `main`, not tied to any local PC. They keep running regardless of which machine you're working from — don't reconfigure them.
- **Ledger, client registry, board charter** (`departments/accounting/ledger.md`, `shared/clients.md`, `shared/board.md`) are plain files in the repo — cloning brings the current state automatically.
- **The two published Artifacts** — the Sirketim Dashboard and the Counterscent Finalization report — are attached to the founder's Claude account, not to a machine, so switching PCs changes nothing about them. URLs and current state: [HANDOFF.md](HANDOFF.md). Two rules when you do update one: pass the existing `url` (publishing without it creates a duplicate and the founder's bookmark keeps opening the stale page), and expect the tool to **refuse** until you have read the live copy in full — which for the ~140 KB dashboard is a real context cost to plan for, not a step to skip.
