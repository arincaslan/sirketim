# Communication

Direct outreach for Sirketim's own products (web templates, architecture plan packs, POD prints — see `../../products/`) — not client campaigns, that stays with Advertising (content/organic posting) and Sales (client service pipeline). Works alongside both: uses Advertising's content/assets as outreach material, and hands off anyone who shows real interest to Sales to close.

## What it does

- Finds and reaches out to potential buyers directly via DM, email, and phone.
- Drafts channel-specific outreach copy and keeps reusable starting templates in `templates.md`.
- Tracks every prospect from first contact through hand-off in `prospects.md`.
- The moment someone shows real interest, hands off to Sales (`sales-strategist`) — Communication does not close deals or draft proposals itself, that's Sales' job (see `../sales/CLAUDE.md`).

## Channels — status

None of these have a live sending connector configured yet — Communication's job today is producing ready-to-use outreach, not claiming a message actually went out:

- **DM (Instagram/TikTok)** — drafts messages ready to send on the accounts Advertising already posts to. No Meta Graph API / TikTok messaging API configured (same gap as Advertising's posting — see `../advertising/CLAUDE.md`); founder sends manually.
- **Email** — drafts outreach copy/sequences. No email-sending connector configured (e.g. Resend, Mailchimp); founder sends manually until one's wired up.
- **Phone** — Turkish-language call scripts and talking points. No telephony/voice API (e.g. Twilio) is configured, and this isn't something to fake — calls are placed manually by the founder. Log every call's outcome back into `prospects.md` afterward.

## Language

Default to **Turkish** for outreach aimed at Turkish-speaking prospects (the natural audience for direct local outreach — DMs, email, phone). Match the channel/audience otherwise: e.g. Etsy buyer messages in English, since that marketplace is international (see `../sales/CLAUDE.md`).

## Conventions

- Prospect tracking lives in `prospects.md` — one row per contact, from first outreach through hand-off to Sales.
- Reusable outreach starting points (not project-specific) live in `templates.md`; tailor before sending, don't send a template verbatim.
- Once a prospect shows real interest, hand off to `sales-strategist` and update the prospect's status — Sales registers them in `../../shared/clients.md` from there.
- Use the `communication-strategist` subagent for this department's work.
