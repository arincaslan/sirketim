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
| Claude Code | the actual working environment | log in with the same account |

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

`.mcp.json` already configures `openart` (OAuth, no API key needed) — it travels with the repo. But connector *approval* is scoped per session/process, not global: a brand-new PC (or even a new session on a known PC) can show `⏸ Pending approval` the first time even though it's approved elsewhere. Run `/mcp` in that session to approve it there. Check `claude mcp list` before assuming a connector is live or broken.

## 5. Per-project installs

Nothing installs at the repo root — there's no root `package.json`. Each web-development client or product (e.g. `products/web-templates/agency-landing/`, `departments/web-development/clients/<slug>/`) is a self-contained Next.js project with its own `package.json`. `cd` into the specific one you're working on and run `npm install` there before `npm run dev`/`build`/`lint`.

## 6. What needs no setup at all

- **Scheduled reports** (`Sirketim Weekly Accounting Report`, `Sirketim Weekly Control/Audit Report`) run server-side on claude.ai against `main`, not tied to any local PC. They keep running regardless of which machine you're working from — don't reconfigure them.
- **Ledger, client registry, board charter** (`departments/accounting/ledger.md`, `shared/clients.md`, `shared/board.md`) are plain files in the repo — cloning brings the current state automatically.
