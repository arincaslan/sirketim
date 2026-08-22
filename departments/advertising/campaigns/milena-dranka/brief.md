# Milena Dranka — AI Instagram/TikTok Persona

**Type:** Internal — Sirketim's own AI-generated social asset (not a client, not a third-party talent).
**Owner department:** Advertising (content generation + organic posting). Secondary: Communication (DM/fan engagement, once there's real inbound), Sales (monetization deals — brand sponsorships or paid-content platform), coordinated at the board level by `board-coo`.
**Instagram:** https://www.instagram.com/milenadrana/ (live, existing)
**TikTok:** not yet created — see "Accounts: TikTok + Fanvue" below.
**Fanvue:** not yet created — see "Accounts: TikTok + Fanvue" below.
**Registered:** 2026-08-22.

## What this is

A virtual/AI-generated model persona operated as a Sirketim-owned social asset, same category as the product lines under `products/` but running as an ongoing content operation rather than a one-off sale. Advertising treats her the same way it treats any other content account: brief → generate (OpenArt) → copy → post → log.

## Posting cadence

**2 posts/week each on Instagram, TikTok, and Fanvue**, per founder instructions 2026-08-22. Instagram/TikTok are Reels-first, SFW only, generated via OpenArt (other tools/skills as needed). Fanvue is the +18 channel — founder gave **standing authorization** 2026-08-22 for NSFW generation on Fanvue content as part of this recurring cadence (no per-batch check-in needed once a tool is actually generating). **As of 2026-08-22, no generator is configured for it**: `eromify` and `zencreator` (originally used for this) were both removed at the founder's instruction after neither proved usable for free — see "Monetization" below. Instagram/TikTok must never carry +18 content, full stop — that rule is not open for reinterpretation by cadence pressure.

- No Meta Graph API or TikTok Content Posting API configured yet, and Fanvue's posting-API capability is unconfirmed (same gap documented in `../../CLAUDE.md`) — Advertising's output is the finished asset + caption, ready for the founder to post manually until real posting connectors exist.
- Each week's batch gets logged in `post-log.md` (asset reference/OpenArt or eromify IDs, caption, status: drafted / posted).

## Identity consistency — RESOLVED 2026-08-22

Real reference photos pulled directly from the live Instagram account (`reference/ref-01` through `ref-06`, downloaded via signed CDN URLs surfaced by reading the page — profile photo + 5 feed images spanning a portrait close-up, a Trevi Fountain travel shot, and a street café selfie) and confirmed as the same person across all of them. Locked physical description, for reuse verbatim in every OpenArt prompt going forward:

> Woman, early-to-mid 20s, long wavy copper/auburn red hair (worn loose or high ponytail), fair skin with warm undertone and light natural sheen, oval face with high cheekbones, defined arched brows, green-hazel eyes, full lips (soft rose/nude makeup), slender build. Aesthetic: "soft luxury" fashion/lifestyle — warm neutral and amber tones, editorial travel/café settings (NYC, Paris, Istanbul, Rome), designer minimalist styling (gold jewelry, tailored fits, sunglasses), natural directional light, shot on a modern phone-camera-realistic aesthetic (per her existing Reels/carousel style) or shallow-depth editorial photography for stills.

The description + reference images above are what any future generation tool should anchor to, regardless of which vendor ends up providing Fanvue generation.

## Content pillars

Confirmed from the live account's actual style (not a guess): editorial travel/lifestyle portraits (Trevi Fountain-style landmark shots), street/café selfie-style Reels, close-up beauty portraits, warm/amber color grading throughout. Fanvue content pillar (+18) not yet defined — first batch will establish it.

## Accounts: TikTok + Fanvue

Neither exists yet. Both need the founder personally, not something a tool closes:
- **TikTok**: account signup (phone/email verification) plus, for the Content Posting API specifically, a TikTok for Business account + an approved developer app (business email registration, ToS acceptance, ~5-10 business day review). No agent/API can create the account itself.
- **Fanvue**: creator signup legally requires the founder's own government ID + a live selfie/liveness check (2257 record-keeping compliance) — this is the account *operator's* real identity, not Milena's. There is a creator-onboarding API that can pre-fill signup details (handle, category, price, banking country) and return a hosted `kycUrl`, but completing that verification is unavoidably a founder action.

Advertising's role: prepare handle/bio copy and the first content batch so the founder's actual manual steps are as short as possible. Not Advertising's role: attempting to create either account without the founder's direct participation in the identity-verification step.

## Monetization — +18 content

Founder asked (2026-08-22) whether Sirketim can sell adult content of Milena Dranka, then later the same day gave standing authorization to produce Fanvue (+18) content via `eromify` as part of the regular cadence. **Provenance/consent: RESOLVED 2026-08-22 (asked directly a third time, after two earlier flags went unanswered) — founder confirmed Milena is fully synthetic.** No real person's photos were used as the base identity; the Instagram account's photos were themselves AI-generated from the start. The right-of-publicity/non-consensual-imagery exposure the open question below was tracking no longer applies. Researched platform landscape below stands as-is:

- **Instagram/TikTok themselves are not viable as a sales or hosting surface.** Both platforms ban adult content outright, and enforcement now extends to indirect promotion — a link-in-bio to a paid adult platform, mentioning it in captions, or flagged hashtags are explicit ban triggers, independent of whether explicit content is ever posted natively. This means the IG/TikTok account has to stay strictly brand-safe/SFW regardless of what happens elsewhere — it's top-of-funnel only, not a NSFW storefront. ([Instagram's Adult Content Policy in 2026](https://arunatalent.com/blog/instagram-adult-content-policy-2026/))
- **OnlyFans is not viable for a synthetic persona.** As of 2026 OnlyFans requires the account to be a verified real human, and AI-generated content on it must resemble that verified person — fully synthetic personas (no real person behind them) are explicitly prohibited. ([OnlyFans AI Content Policy 2026](https://maho-management.com/en/blog-entry/does-onlyfans-allow-ai-content))
- **Fanvue is the platform that actually permits this**, and is the one built for it — it explicitly allows fully AI-generated personas/characters (not tied to a real person), including NSFW content in permitted regions, with AI-disclosure labeling required. It's grown fast on exactly this use case (~$200M annualized run rate as of May 2026). ([Fanvue AI: The New Era of Virtual Creators in 2026](https://onlymonster.ai/blog/fanvue-ai-what-it-is-how-it-works/))
- **Remaining open questions**, none of which are Advertising's to decide alone:
  - ~~**Provenance/consent**~~ — RESOLVED 2026-08-22, see above.
  - **Regional gating**: Fanvue restricts NSFW AI content to "permitted regions" — needs checking against wherever Sirketim/the founder would actually be paid from.
  - **Compliance overhead**: age-verification and content-provenance/record-keeping obligations for sexually explicit content are a real, evolving legal area for AI-generated material specifically — not a checkbox, needs its own review (a lawyer's, not this repo's) before launch. This now includes an **age-representation** angle distinct from platform record-keeping: because generation tooling for this category needs a real content-moderation backstop (not a "no restrictions" tool chosen for lacking one) — AI-generated content that reads as depicting a minor is independently illegal regardless of the persona being synthetic. See `../../CLAUDE.md`'s "AI-influencer content" section and [[feedback_no_unrestricted_content_tooling]] (memory) for why this ruled out the "find something free/unrestricted" ask 2026-08-22.
  - **Generation tooling: currently NONE configured.** OpenArt confirmed NOT viable 2026-08-22 (checked, not assumed) — none of its 16 catalog models (Google/OpenAI/ByteDance/Alibaba/xAI) mention NSFW/adult/mature capability, and none of their generation-parameter schemas expose a content-type or safety-filter override — consistent with mainstream vendor APIs that filter this at the policy level with no per-call opt-out. `zencreator` and `eromify` (the two tools that could do it) were **removed 2026-08-22 at the founder's direct, repeated instruction** — both required real payment (zencreator: enable NSFW + buy credits; eromify: confirmed not free either), and a follow-up ask to find a free "non-restricted" replacement (searched globally, not just mainstream sources, per the founder's instruction) was declined rather than fulfilled — see [[feedback_no_unrestricted_content_tooling]] (memory) for the full reasoning: a tool selected specifically for lacking content moderation on this category carries a real risk (no backstop against real-person or apparent-minor content) that doesn't shrink just because Milena is synthetic. **This is now a live gap, not a researched-but-unstarted question**: Fanvue content production cannot proceed until the founder either pays for one of the two removed tools' equivalents again, picks a different paid/verified vendor, or decides not to pursue Fanvue further.
  - **Brand risk**: this would sit under the same public GitHub repo and founder identity as client-facing web/architecture/sales work — worth deciding deliberately, not by default.

**Recommendation:** technically reachable via Fanvue specifically, not via OnlyFans, and never natively via Instagram/TikTok. Treat as a distinct founder-level decision with its own legal/compliance review before any production work starts — not a task to fold into this week's normal Advertising cadence.

### 2026-08-22 — Fanvue generator tool evaluation (six candidates, read-only research)

Same day, the founder gave a substantive answer to the concern that killed the earlier "free/unrestricted" ask: an explicit commitment to operate within Fanvue's actual published rules (AI-disclosure labeling, SFW public-facing profile areas, any depicted person must clearly read as 18+ with no age-baiting, no real-person likeness without direct consent). That commitment doesn't change the underlying bar — a generator marketed as having *no content restrictions* still provides no backstop for the age-representation/real-person-consent pieces regardless of intent — but it's a real answer worth evaluating candidates against in good faith. Six named services (Mage.space, FixArt.ai, Joyfun.ai, Creen.ai, Atlas Cloud, Delyvra) were researched read-only (WebFetch/WebSearch only — no sign-ups, no generation, no MCP calls) for what each actually is, NSFW capability/policy, pricing, integration path (API/MCP vs. browser-only), and legitimacy red flags. Full per-service findings and a neutral comparison table: **`fanvue-tool-evaluation-2026-08-22.md`** (this folder).

Headline: no candidate is a clean match. Creen.ai explicitly prohibits NSFW content outright (not a fit). Mage.space and Atlas Cloud are the two most institutionally legitimate (real funded companies, disclosed operators) but each has its own specific content-policy problem — Mage has a media-documented history of non-consensual celebrity deepfake content only partially remediated after external investigation; Atlas Cloud's own Acceptable Use Policy bans adult content while its own marketing/blog content actively instructs on generating NSFW output via its API, an internal contradiction this research could not resolve from outside. FixArt.ai, Joyfun.ai, and Delyvra all market themselves as having few-to-no content restrictions but disclose no accountable operator (no registered entity, no jurisdiction) — Joyfun.ai specifically markets an "undress" feature, the paradigmatic non-consensual-imagery risk category. Delyvra is a partial exception in that its actual Terms of Service are more substantive than its marketing tone suggests (explicit non-consensual-likeness and minor-safety provisions, TAKE IT DOWN Act reference), but still discloses no legal entity and takes crypto-only payment. This is due-diligence input for a founder decision, not a recommendation to adopt any of the six — see the evaluation file for the full per-service breakdown before deciding.

## Conventions

- Reference photos live in `reference/` (pulled from the live Instagram account 2026-08-22 — see "Identity consistency" above).
- Generated assets + generator IDs go in `post-log.md` as they're produced (same pattern as `../fragrance-store-quality-upgrade/assets/manifest.md`).
- Registered in `../../../../shared/clients.md`.
