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

## Recommended connectors

- **OpenArt MCP** — content generation. Configured, pending one-time OAuth approval (see above).
- **Meta Graph API** — Instagram posting + ad performance data (not yet configured)
- **TikTok Content Posting API** — TikTok posting
- **GA4** — site-side conversion/traffic reporting, pairs with web-development's client sites
- **Buffer/Later** (optional) — cross-platform scheduling if going direct-API is too slow to set up

## Conventions

- Each campaign/content run gets a folder under `campaigns/<client-or-product-slug>/` with the brief, generated assets (or references to them), copy drafts, and post log.
- Register every campaign client in `../../shared/clients.md`.
- Use the `ad-strategist` subagent for this department's work.
