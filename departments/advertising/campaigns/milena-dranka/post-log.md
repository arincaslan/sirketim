# Milena Dranka — Post Log

Target cadence: 2 posts/week each on Instagram, TikTok, Fanvue. See `brief.md` for persona/workflow status.

## Batch 1 — 2026-08-22

| Platform | Status | Asset | Generator / historyId | Caption | Posted date |
|---|---|---|---|---|---|
| Instagram | **Ready to post** (manual — no Graph API configured) | `assets/ig-reel-trevi-twilight.mp4` (1080x1920, 8.08s, audio) | OpenArt `byte-plus-seedance-2` element2video, historyId `JxwThd75Gpj3eutj0JsG` | "Some nights don't ask for a caption. 🕯️ Roma." — hashtags: #Roma #TreviFountain #EuropeanSummer #SoftLuxury #AIModel | — |
| TikTok | **Ready to post** — account doesn't exist yet, see `brief.md` "Accounts: TikTok + Fanvue" | `assets/tiktok-reel-street-selfie.mp4` (1080x1920, 8.08s, audio) | OpenArt `byte-plus-seedance-2` element2video, historyId `CIvjAikkArRERNKESEqa` | "coffee run in Rome, no notes ☕️🇮🇹" — hashtags: #RomeVibes #StreetStyle #CoffeeRun #POV #AIModel | — |
| Fanvue | **Blocked** — account doesn't exist yet, AND generation itself is blocked this session on the tool side too: `eromify` MCP still exposes zero tools to this session (same OAuth/non-interactive gap as before — not re-testable without a different session type). `zencreator` MCP *is* reachable this time (confirmed live via `zencreator_get_me`, `zencreator_list_tools`, `zencreator_get_tool_schema`), but the connected account (`mavihawk@gmail.com`) has `nsfw_allowed: false`, `is_trusted: false`, and `credits: 0` (`out_of_credits: true`). Standing founder authorization for Milena-on-Fanvue is NOT the blocker here — it's account configuration/billing. See note below for the exact gate and unblock path. | — | — | — | — |

Concept selection for IG/TikTok was founder-picked from 2 options each (Trevi Fountain twilight walk vs. Paris café; street-style selfie vs. mirror GRWM) — see chat log 2026-08-22.

Both videos generated with `visualReferences` anchored to `reference/ref-02-trevi.jpg` + `reference/ref-04-closeup-a.jpg` (real photos pulled from the live Instagram account) — identity held consistent in both outputs, visually confirmed against the reference set before logging as ready.

### Fanvue blocker detail — 2026-08-22, second attempt

`zencreator` connectivity is confirmed live in this session (unlike `eromify`, which has no tools exposed at all — consistent with the documented OAuth gap). But the zencreator account itself is not configured for NSFW generation. Per `image_editor`'s own tool documentation, NSFW output requires ALL of: (1) `nsfw_allowed = true` account-wide — ours is `false`, and the tool's own instructions say explicitly "do NOT silently downgrade the request to SFW" if this is false; (2) `is_trusted = true` for any trusted-only model — ours is `false`, and the tool says "do NOT submit, it will 403" if a trusted-only model is picked without it. The model the tool's own `model_selection_guide` recommends for exactly this brief's ask (tasteful lingerie/boudoir-tier, no explicit anatomy) is `GENERAL_NSFW`, which is trusted-only — so there is no model on this tool that escapes the `nsfw_allowed` gate for our use case; (3) a non-zero credit balance — ours is `0` (`out_of_credits: true`), which blocks any generation call at all, NSFW or SFW.

**Unblock path** (founder action, not something this task can do): (1) enable adult content / NSFW in ZenCreator account settings; (2) buy a credit pack at `https://app.zencreator.pro/billing` — per zencreator's own tool docs, a first purchase auto-grants Trusted Status permanently, so this step likely also resolves the `is_trusted` gate at the same time. The `nsfw_allowed` toggle appears to be a separate settings action from purchasing credits.

**Ready-to-execute plan, if a generator is configured again**: model class `GENERAL_NSFW`-equivalent, reference anchors `reference/ref-02-trevi.jpg` + `reference/ref-04-closeup-a.jpg` (same as the IG/TikTok batch), prompt built from the locked physical description in `brief.md` ("Identity consistency") plus a tasteful boudoir/lingerie framing (soft directional light, editorial styling, explicit "keep her face and identity unchanged" preservation clause), 9:16 or 4:5 for the Fanvue feed. No generation was attempted with a downgraded SFW substitute or via OpenArt — OpenArt isn't confirmed to permit any NSFW generation and is the dedicated SFW tool already in use for IG/TikTok, so it isn't a valid stand-in for this distinct content pillar.

### Tools removed — 2026-08-22, third session

Founder confirmed Milena's identity is fully synthetic (resolving the provenance/consent question raised above and in `brief.md`), then, separately, instructed removal of both `eromify` and `zencreator` from `.mcp.json` and every agent/CLAUDE.md reference to them, after asking for a free "non-restricted" alternative and having that ask declined (see `brief.md`'s Monetization section and memory `feedback_no_unrestricted_content_tooling` for the reasoning — not sourced regardless of price or region, since "no restrictions" as a selection criterion means no backstop against real-person or apparent-minor content, independent of Milena's own synthetic status). Deletion itself was carried out as instructed — a reversible repo-config change, distinct from the declined tool-sourcing request. **Fanvue production is now fully blocked on tooling**: no generator is configured, and none will be sourced without an explicit founder decision on a specific paid/verified vendor.

### On hold — 2026-08-22, founder decision

6-candidate evaluation done (`fanvue-tool-evaluation-2026-08-22.md` — Mage.space, FixArt.ai, Joyfun.ai, Creen.ai, Atlas Cloud, Delyvra; none cleared cleanly, Atlas Cloud and Delyvra were the closest). Founder decided to **hold off on Fanvue generation entirely for now** rather than pursue any of the six or re-fund zencreator immediately — will revisit equivalents later. This is a deliberate pause, not an open blocker to keep chasing: don't restart tool-sourcing or generation attempts without a fresh founder go-ahead. IG/TikTok cadence (SFW, OpenArt) is unaffected and continues.
