# Counterscent: the 31 dependency advisories, and which of them can actually reach us

**Written 2026-09-14.** Prepared because the founder assigned this decision to
this department. It is a briefing, not a decision — the call at the end is
web development's to make.

Surfaced while provisioning the producer database; none of it came from that
work. Every advisory below predates 2026-09-14 and has been sitting in the tree.

---

## The headline, and why the headline is misleading

`npm audit` in `products/affiliate-sites/fragrance-dupes` reports:

> **7 vulnerabilities (6 high, 1 critical)**

That count is packages, not problems. Expanded, it is **31 distinct advisories**
across six packages: `next` (22), `postcss` (4), `js-yaml` (2), `next-mdx-remote`,
`glob`, and the eslint config that pulls `glob` in.

**`npm audit` matches installed version numbers against an advisory database. It
does not know what our build target is.** That distinction decides almost this
entire list, so it has to come first rather than as a footnote.

---

## What we actually deploy

Verified in this session against the config and the source, not from memory:

| Fact | Evidence |
|---|---|
| Static export | `next.config.mjs:23` — `output: "export"` |
| Image optimizer disabled | `next.config.mjs:36` — `images: { unoptimized: true }` |
| No middleware | no `middleware.ts` anywhere |
| No route handlers | no `route.ts` under `app/` |
| No Server Actions | no `"use server"` in `app/`, `lib/` or `components/` |

The deployed artifact is **243 HTML files plus assets**, served by Cloudflare's
static asset host. There is no Next.js server process in production. There is
nothing running that could receive a crafted request and act on it.

---

## The 31, sorted by whether they can reach us

### Cannot reach production — 28 of 31

Every one of these describes an attack against a **running Next.js server**:
Server Components deserialization, Server Actions DoS and SSRF, middleware and
proxy bypass, rewrites SSRF and request smuggling, Server Function endpoint
disclosure, RSC cache poisoning, CSP-nonce XSS, and the whole Image Optimization
family including the **critical AVIF RCE (GHSA-2xp9-vwfh-vxw4)**.

We run none of those code paths. The image optimizer is not merely unused — a
static export disables it, and `images: { unoptimized: true }` is set explicitly.
Middleware, rewrites, Server Actions and Server Functions do not exist in this
codebase at all.

`js-yaml` (CPU exhaustion parsing untrusted YAML) and the `glob` CLI command
injection (requires running `glob -c`) are in the same category for a different
reason: nothing here feeds them attacker-controlled input.

### Reaches the build machine, not the site — 4 `postcss` advisories

All four are `sourceMappingURL`-driven arbitrary `.map` file reads, triggered by
**attacker-controlled CSS**. Our CSS is ours, in this repo. The exposure would be
processing CSS we did not write.

Worth noting rather than dismissing: this runs on whichever machine builds, and
one of those is **Cloudflare's build environment**.

### Genuinely live, and not on the public site — 1 critical

**GHSA-p293-qw3h-jr36 — unauthenticated RCE on Windows-hosted Next.js servers.**

Production is unaffected: no server. But `npm run dev` **is** a Next.js server,
and both of this founder's machines are Windows. Anything that can reach that dev
port during a development session is in scope.

Mitigating: `next dev` binds localhost by default, so this needs local access or
another process on the machine — not a remote attacker. It is not a "the site is
compromised" finding. It is a "do not run `next dev` with the port exposed, on
an untrusted network, or with `-H 0.0.0.0`" finding, and it will stay true until
`next` moves.

### Live later, and the one to write down — `next-mdx-remote`

**GHSA-g4xw-jxrg-5f6m — arbitrary code execution when server-rendering
*untrusted* MDX.**

Today `app/guide/[slug]/page.tsx:93` passes `piece.body` to `<MDXRemote>`, and
`piece` comes from `content/loader` — files committed to this repo, rendered at
build time. Our own content. Not exploitable.

**This flips the moment producer-submitted text reaches a renderer.** The producer
programme's entire premise is accepting prose from outside companies. If any of
it is ever rendered as MDX rather than as escaped plain text, this advisory
becomes a remote code execution path in our build, authored by a subscriber.

That is a constraint on build step 6, and it holds regardless of what is decided
below: **producer-submitted text is data, never markup.** Escape it, or render it
through something that cannot execute.

---

## The decision this department owns

`npm audit fix` cannot resolve the `next` advisories. The fix is **`next@16.3.5`**
— two major versions above the pinned **14.2.35**.

**Arguments for upgrading**

- It clears 26 of the 31, including both criticals.
- It ends the standing "do not expose the dev port" caveat rather than managing it.
- Deferring gets more expensive as the gap widens.

**Arguments against, or at least for not doing it this week**

- `products/affiliate-sites/fragrance-dupes/CLAUDE.md` records the Next 14 pin as
  deliberate, and `HANDOFF.md` rejected converting off `output: "export"` partly
  on upgrade cost. That reasoning was about a different question, but the pin is
  load-bearing and was not accidental.
- Two majors will touch routing, metadata and image handling on a live,
  indexed, revenue-carrying site with 243 pages and 620 affiliate redirects.
- None of the two criticals are reachable through counterscent.com today. The
  urgency the word "critical" implies is not our urgency.
- The producer console will be a **Cloudflare Worker**, not Next — so the upgrade
  buys the subscription programme nothing directly.

**A third option worth pricing before choosing either:** upgrade within the 14.x
line if a patched 14.x exists. The advisory ranges here mostly read
`>=13.x <15.5.x`, which suggests the fixes landed in 15/16 only — but that should
be checked against the actual release notes rather than inferred from a range,
because it changes the answer entirely if a 14.2.x patch exists.

### What to verify before shipping any upgrade

- `npm run build` produces **243** pages and `public/_redirects` holds exactly
  **620** lines starting `/go/` — both are the existing regression checks.
- `scripts/check-scoring-isolation.mjs` still passes (it runs in `prebuild`).
- Affiliate buy links 404 under `npm run dev` **by design** — verify with
  `npm run preview`, never `next dev`. This has cost a real founder click before.
- The root `package.json` deploy shim is what Cloudflare runs. Per the root
  CLAUDE.md, verify with `rm -rf out && WORKERS_CI=1 npm install` from the repo
  root; `npm run build` at the root proves little and has shipped two broken
  "fixes".

---

## Reproducing this analysis

```bash
cd products/affiliate-sites/fragrance-dupes
npm audit --json
```

The expansion from 7 to 31 is in the `via` arrays; the summary counts packages.
