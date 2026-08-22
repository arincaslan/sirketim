# Advertising

Campaign strategy, content production, and organic social posting for clients across web/architecture work, for Sirketim's own products (`../../products/`), and for Sirketim's own marketing — run at the lowest cost that still works.

## Cost discipline

Default channel is **organic social content**, not paid ads. Paid spend is a deliberate escalation, not a default:
- For client campaigns: paid spend only when the client has budgeted for it.
- For Sirketim's own products: no paid spend to launch — see `../sales/CLAUDE.md`'s near-zero-cost rule. Only fund a paid test from a product's own revenue once it's proven organically.

## Workflow

1. **Brief** — goal, audience, data/assets available (product info, client brand, past performance).
2. **Generate content** — images/video via **OpenArt**, connected as an MCP server (`.mcp.json`, server `openart`). Claude drafts the prompt/creative direction and calls the OpenArt tools directly to produce the asset — no API key needed, it authenticates via OAuth to the founder's existing account (one-time approval via `/mcp` in Claude Code).
3. **Copy** — captions, hooks, hashtags per platform.
4. **Post** — Instagram and TikTok primarily (see posting below); others as the business grows.
5. **Report** — track what was posted and, once analytics connectors exist, performance.

## Content generation — OpenArt

OpenArt is the department's primary asset generator (images and short video) — cheaper and faster than commissioning photography/design for routine social content. Use it for: product shots/mockups for `products/`, architecture render-to-social content, campaign creative for clients who don't supply their own assets.

**Connector status: configured, pending one-time approval.** Registered as a project MCP server (`.mcp.json`, `openart`, `https://mcp.openart.ai/mcp`). OpenArt has no traditional API key — it authenticates via OAuth to the founder's OpenArt account. First use in a Claude Code session requires running `/mcp` and approving the `openart` connector (opens a browser to sign in/authorize); after that it's live for direct generation, no further setup.

## Posting — Instagram, TikTok

Both platforms require their own developer/business setup before Claude can post directly:
- **Instagram**: Meta Graph API, via a Meta Business account + app review for content publishing permissions.
- **TikTok**: TikTok Content Posting API, via a TikTok for Developers app (has its own approval process).

**Until those are configured**, Claude's role is to produce the finished asset + caption + hashtags, ready for the founder to post manually in under a minute. Once the API connectors exist, move to direct scheduled/automated posting. A scheduling layer (e.g. Buffer or Later) is a reasonable middle step if the native APIs prove too much friction to set up early on.

## Social media (AI personas — Reels-first, multi-platform)

For Sirketim-owned AI persona accounts (e.g. Milena Dranka — `campaigns/milena-dranka/`), founder-set structure as of 2026-08-22: **2 posts/week on each of Instagram, TikTok, and Fanvue**, Reels/short-vertical-video first.

- **Instagram + TikTok are SFW only, always.** OpenArt is the default generator; other tools/skills can be brought in if needed. This is a hard line, not a default that yields to cadence pressure or "it would perform better" reasoning — never +18 content, never even suggestively adjacent, regardless of what's authorized for Fanvue.
- **Fanvue is the +18 channel — no generator is currently configured for it.** `eromify` and `zencreator` were both removed 2026-08-22 (founder decision, after both proved to require payment); a follow-up ask for a free/"unrestricted" replacement was declined rather than sourced — see `campaigns/milena-dranka/brief.md`'s Monetization section for the full reasoning. `openart` is confirmed incapable (checked 2026-08-22: no NSFW-capable model in its catalog, no content-type override in any generation schema). Until the founder picks a new paid/verified tool, Fanvue content production is blocked — say so plainly rather than reaching for a substitute.
- **Identity consistency is required across all three platforms** — the same persona has to be recognizably the same person on Instagram, TikTok, and Fanvue. Anchor generations to real reference material (existing posts, a locked physical description) before producing anything; never post a persona whose face drifts week to week.
- **Posting is manual on Instagram/TikTok today** — no Meta Graph API or TikTok Content Posting API configured. **Fanvue posting is configured but unusable until the account exists**: `fanvue` MCP (`.mcp.json`, `https://mcp.fanvue.com/mcp`, added 2026-08-22) is Fanvue's own official server — see "Fanvue account/posting — Fanvue MCP" below for what it can do and its own governance split (posting vs. fan messaging are NOT the same authorization).
- **Account creation is not a tooling gap — it's an identity requirement.** TikTok needs a business account + developer app (the founder's business identity, ToS acceptance) for the Content Posting API; Fanvue legally requires the founder's own government ID + live-selfie KYC (2257 compliance) as the account operator. No agent or API closes that gap — Advertising's job is to prep everything up to that point (handles, bios, first content) so the founder's actual hands-on time is minimal.

## AI-influencer content — removed 2026-08-22

Two AI-influencer generators (`eromify`, `zencreator`) were configured for a period (2026-08-22) for Milena Dranka's Fanvue (+18) content, under founder-gated per-persona/platform authorization. Both were **removed at the founder's explicit, repeated instruction 2026-08-22** after neither turned out to be usable for free: `eromify` required OAuth this workspace never completed (and the founder separately confirmed it isn't free either); `zencreator` connected but its account needed the founder to enable NSFW and buy a credit pack before it could generate anything.

The founder then asked for a "free," "non-restricted" replacement, searched globally (not just mainstream/Google-indexed sources). **That request was declined, not fulfilled** — deliberately did not source or wire in a generator selected for lacking content moderation on this content category, regardless of price or region, because that selection criterion (no restrictions) is also the absence of any check against generating content involving a real non-consenting person's likeness or content that reads as depicting a minor — a risk that doesn't scale down just because a persona's base identity is confirmed synthetic. See `campaigns/milena-dranka/brief.md`'s Monetization section and memory (`feedback_no_unrestricted_content_tooling`) for the full reasoning.

**Current state: no Fanvue-capable generator is configured.** `openart` was checked directly and confirmed incapable (2026-08-22: no NSFW model in its 16-model catalog, no content-type/safety override in any of its generation schemas). If Fanvue content is requested, say so plainly — sourcing a new paid/verified tool for this category is a founder decision to make explicitly, not something to infer or route around.

## Fanvue account/posting — Fanvue MCP

**Configured 2026-08-22** (`.mcp.json`, `fanvue`, `https://mcp.fanvue.com/mcp`, OAuth, no key). Different category from the two generators above — this is Fanvue's own official account-management server, not a content generator: publish/schedule posts (incl. pay-to-view), read account/analytics/subscriber data, browse and manage the vault, **read and reply to fan chats, send targeted mass messages**.

**Useless until the account exists and is KYC-verified** — see "Accounts: TikTok + Fanvue" above. Don't attempt anything with it before that.

**Two different authorization rules inside this one connector — don't conflate them:**
- **Publishing/scheduling already-approved content, and reading account/analytics/vault data**: covered by the same standing per-persona/platform authorization as content generation (e.g. Milena-on-Fanvue). This is the automated version of an already-expected step, not a new capability.
- **Replying to fans and sending mass messages is a genuinely new capability, NOT covered by that authorization.** This is live communication with paying subscribers — treat it with the same caution `communication-strategist` applies to its own outreach (draft, don't auto-send, until the founder trusts a live sending connector — see `departments/communication/CLAUDE.md`). Draft replies for founder review by default. Only send autonomously if the founder explicitly authorizes live fan messaging as its own decision — "manage the account" or "post 2x/week" does not imply this.

## Recommended connectors

- **OpenArt MCP** — content generation. Configured, pending one-time OAuth approval (see above). Confirmed NSFW-incapable (see "AI-influencer content" above) — SFW use only.
- **Fanvue MCP** — account/posting management, configured, gated per above (see "Fanvue account/posting" above).
- **Fanvue (+18) content generator** — none configured as of 2026-08-22 (`eromify`/`zencreator` removed — see "AI-influencer content" above). Needs a founder decision on a new paid/verified tool before Fanvue production can resume.
- **Meta Graph API** — Instagram posting + ad performance data (not yet configured)
- **TikTok Content Posting API** — TikTok posting
- **GA4** — site-side conversion/traffic reporting, pairs with web-development's client sites
- **Buffer/Later** (optional) — cross-platform scheduling if going direct-API is too slow to set up

## Conventions

- Each campaign/content run gets a folder under `campaigns/<client-or-product-slug>/` with the brief, generated assets (or references to them), copy drafts, and post log.
- Register every campaign client in `../../shared/clients.md`.
- Use the `ad-strategist` subagent for this department's work.
