---
name: campaign-brief
description: Draft a low-cost content/campaign brief (organic-first, OpenArt-generated assets) for a client or one of Sirketim's own products. Use when starting a new advertising campaign or content push.
---

# Campaign Brief

Produces a campaign folder under `departments/advertising/campaigns/<slug>/`, per `departments/advertising/CLAUDE.md`.

## Steps

1. **Intake**. Confirm: is this a client campaign or promotion for a Sirketim product (`products/`)? Goal, audience, available data/assets, platforms (default Instagram + TikTok), and — for client work only — whether paid budget exists. For Sirketim's own products, paid spend is off by default; only propose it if the product already has organic sales revenue (see `departments/sales/CLAUDE.md`).
2. **Brief document** (`campaigns/<slug>/brief.md`): goal, audience, platform(s), content pillars, posting cadence.
3. **Creative direction**: draft the prompts/direction for OpenArt-generated assets (image or short video) and the accompanying copy (caption, hooks, hashtags per platform) — don't attempt to generate the images yourself without the OpenArt connector configured; produce the prompt/brief for it instead.
4. **Posting plan**: since Instagram/TikTok posting connectors aren't configured yet, output the finished asset brief + caption ready for the founder to post manually, with a note on what direct-posting would require (Meta Graph API / TikTok Content Posting API).
5. **Register** the client in `shared/clients.md` if this is client work.

## Notes

- Organic-first: don't default to recommending paid ad spend. State the cost-free path first, paid as an explicit escalation with its own justification.
