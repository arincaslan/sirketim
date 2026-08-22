# Fanvue (+18) Generator Tool Evaluation — 2026-08-22

Referenced from `brief.md`'s Monetization section. Read-only due-diligence research only — WebFetch/WebSearch against public sites and third-party coverage. No sign-ups, no accounts, no generation attempts, no money spent, no `openart`/`fanvue` MCP calls. Evaluates six named candidates as possible replacements for `eromify`/`zencreator` (removed 2026-08-22 — see brief.md).

## Why this list, and what changed since the "unrestricted" ask was declined

Same day, the founder gave a substantive answer to the concern that killed the earlier "find something free/unrestricted" request: an explicit commitment to operate within Fanvue's actual published rules —
1. Clear AI-disclosure (label/watermark AI-generated media in bio/captions)
2. Public-facing areas (profile pic, banner, intro) stay SFW; explicit content locked behind paid subscription/PPV
3. Any AI-generated person must clearly look 18+; no age-baiting text, no school/youth themes
4. No realistic likenesses of real living people/celebrities without their direct consent

This is a real compliance commitment and changes what "good" looks like — but not the underlying bar. A generator marketed as having *no content restrictions at all* still provides zero backstop for commitments 3 and 4 regardless of intent; that distinction is flagged per-service below as a concern, not a selling point. Three of the four commitments (1, 2, 3-partially) are things Sirketim's own operating practice has to uphold no matter which tool is used — the tool choice mainly bears on commitment 4 (real-person likeness) and, indirectly, on whether the tool has *any* moderation backstop for age-representation at all.

---

## 1. Mage.space

**What it is:** A real, funded AI image/video generation platform (browser-based, Stable Diffusion/Flux/proprietary models, 160+ models, consistent-character and motion-control features). Operated by **Ollano Inc.**, founded 2022 by Roi Lee and Gregory Hunkins, headquartered in New York City. Reached 1M+ monthly active users by 2023, has Crunchbase/PitchBook/LinkedIn profiles — this is a genuine, identifiable company, not an anonymous storefront.

**NSFW capability & policy:** Yes, explicitly supports NSFW/mature content — markets itself as more permissive than mainstream generators (no DALL-E/Midjourney-style filters). ToS requires users be 18+, explicitly prohibits CSAM and reports violations to NCMEC, and prohibits non-consensual private imagery. **However**, per a [404 Media investigation](https://www.404media.co/mage-space-new-restrictions-non-consensual-porn-celebrities/), Mage was found hosting large volumes of non-consensual sexual imagery of real celebrities, generated and paid for by users. Mage's response (after media pressure, not proactively) was to delete NSFW Discord channels and add deepfake-detection for *major* celebrities only — 404 Media confirmed the site **still generates non-consensual sexual images of lesser-known celebrities** even after the fix, and many prior images remained hosted. The co-founders cited a 2-person team as a constraint. This is a direct, documented hit against exactly the real-person-likeness commitment the founder just made — not a hypothetical risk.
- No explicit AI-disclosure requirement found in ToS.

**Pricing:** Freemium. Free tier $0/mo (300 "Gems"). Paid: Basic $10/mo (unlimited generations, 2x speed), Pro $30/mo (adds video), Pro Plus $60/mo (4K), Max $200/mo (motion control, 1080p video).

**Integration path:** No public API today — site states "a premium API, currently in limited beta," contact-only (email). No MCP server. Browser-only in practice.

**Legitimacy red flags:** Real company/entity, real ToS, real CSAM/NCMEC language — better paper legitimacy than most candidates here. But the documented, media-investigated history of non-consensual celebrity deepfake content, only partially and reactively remediated, is a concrete red flag specifically on the axis the founder's commitment #4 is meant to guard against.

## 2. FixArt.ai

**What it is:** A free, no-login browser tool for text/image-to-image and text/image-to-video generation (up to 15s, 1080p) plus face-swap.

**NSFW capability & policy:** Yes, and markets around it heavily — self-describes as "a dedicated NSFW AI Generator" with "Spicy Mode," "zero restrictions," "no filters," and states plainly: "Our keyword filters and censorship are nonexistent for both images and videos." **This markets itself as having no content restrictions** — noted here as the concern the founder specifically flagged, not a selling point. Notably, its own [Terms of Service](https://fixart.ai/terms-of-service/) contradict the marketing: it does prohibit deepfakes of "celebrities or private citizens without consent," CSAM, and non-consensual sexual content, and requires users be 18+. So the operative legal document is more restrictive than the marketing copy claims — which means the marketing overstates permissiveness relative to policy, or the policy is unenforced. No way to tell which from outside.
- No AI-disclosure requirement found.

**Pricing:** Completely free, no login, "replenishing credits," no paid tier found anywhere on the site.

**Integration path:** No API, no MCP, no developer access mentioned anywhere. Browser-only.

**Legitimacy red flags:** No company name, no registered entity, no jurisdiction, no physical address anywhere on the site — only a support email (support@fixart.ai). No independent third-party reviews found (all search results trace back to the site's own pages). A GPU-intensive free image/video generator with no login, no paid tier, and no disclosed business entity has no visible monetization — unclear how it's funded, which is itself a legitimacy question mark (ad-funded, data-harvesting, or loss-leader for something not disclosed). Marketing claims ("zero censorship") directly contradict its own ToS.

## 3. Joyfun.ai

**What it is:** A free browser tool for face-swap, image-to-video, text-to-video, and video effects.

**NSFW capability & policy:** Yes — homepage explicitly states it "provides a largely uncensored platform... including NSFW content," and its own feature menu lists tools named **"AI Breast Expansion"** and **"free undress AI."** An "undress" tool is a named, marketed feature — this is the paradigmatic non-consensual-imagery risk category (turning a photo of a real, clothed, non-consenting person into a nude), directly opposed to the founder's commitment #4 by design, not by omission. The only stated restriction is a blanket "we strictly prohibit the generation of any illegal content," with no age-verification or real-person-consent mechanism described.

**Pricing:** Marketed as "100% free... no hidden costs, no subscriptions, no credit systems," but third-party reviews found paid tiers exist ($9.99/mo Standard, $19.99/mo Premium) with ads and limits on the free tier — the "100% free" framing appears to overstate what's actually offered.

**Integration path:** No API, no MCP, no developer access found. Browser-only.

**Legitimacy red flags:** Domain registered October 2025 (well under a year old at review time) through GoDaddy with **owner identity hidden via privacy registration**. A third-party scanner (Gridinsoft) gave it a 61/100 trust score with mixed/cautionary signals. Per one review, billing runs through **"Joyland AI"** — a differently-branded AI companion/roleplay chat company — not "Joyfun" itself, a mismatch between the consumer-facing brand and the entity actually processing payment. That same review reported the privacy policy allows uploaded media to be retained for "model development" and shared with unnamed "business partners," with no end-to-end encryption. Anonymous ownership plus an undress-specific feature is the most direct combination, of all six candidates, of "actively markets the exact non-consensual-imagery risk category" with "no visible accountable operator."

## 4. Creen.ai

**What it is:** A legitimate, well-structured all-in-one AI creative studio aggregating 28 video models, 11 image models, and 7 audio/voice models (Sora 2, VEO 3.1, Kling V3, Seedance, etc.) via a single browser prompt box, no account required for the free tier.

**NSFW capability & policy:** **No — explicitly and actively prohibited.** Homepage states verbatim: "Creen AI strictly prohibits and actively moderates any request to produce adult image content, NSFW video, porn image, NSFW AI art, or any 18+ material." ToS separately bans unauthorized face-swap/impersonation and any minor-involving content. This rules Creen out for the Fanvue use case entirely, regardless of its other merits — noted for completeness since it was on the list, not because it's a viable candidate.

**Pricing:** Free tier offers unlimited daily generations on select models (Z-Image Turbo, Seedream 5.0 Lite, Nano Banana 2); premium models (Sora 2 Pro, VEO 3.1) consume credits at unspecified rates. No sign-up required for free tier.

**Integration path:** No API, MCP, or developer access mentioned.

**Legitimacy red flags:** None of note. Operated by **CODESAIL LIMITED**, a Hong Kong-registered entity with a disclosed physical address (Unit 13, Block A, 7/F, Po Koon Building, 50 Hung To Road, Kwun Tong, Hong Kong) — more corporate transparency than most other candidates here, even though it's a small, otherwise-unverified entity. The only "issue" is fit: it is simply not an NSFW tool.

## 5. Atlas Cloud

**What it is:** A real, substantially-funded AI infrastructure/API aggregation company — "one API for all media AI," 400+ models (image, video, audio, chat) from providers including ByteDance, OpenAI, Google DeepMind. This is compute/API infrastructure, not a consumer generation app. Founded 2024 by CEO Jerry Tang; recently announced a $6B multi-year sustainable AI compute buildout with NewYork GreenCloud on NVIDIA Blackwell hardware, and a separate GPU supply deal with Soluna (64 H100s). This is the most institutionally substantial company of the six by a wide margin.

**NSFW capability & policy — internally contradictory, flagged explicitly:** Atlas Cloud's own [Acceptable Use Policy](https://www.atlascloud.ai/acceptable-use) states users may not "use the Services for illegal/adult content, hate speech, or malware" — a blanket prohibition. **At the same time**, Atlas Cloud's own blog/guides section (dozens of SEO articles, written and published by Atlas Cloud itself) actively markets and instructs on generating NSFW/adult content through its own API using specific "uncensored" models it hosts — named examples include Wan 2.2 Spicy, Seedance 1.5 Spicy, HunyuanVideo, and Flux Kontext Dev, described as running "without content moderation filters." One article specifically walks through why a given model (Kling) blocks NSFW while contrasting it with others that don't. This is a direct contradiction between the company's stated policy and its own marketing/instructional content, and it's unclear from outside which governs actual enforcement — noted plainly as an unresolved ambiguity, not resolved one way or the other by this research. No age-verification or real-person-likeness language found in the AUP excerpt available.
- No AI-disclosure requirement found.

**Pricing:** Pay-per-use, not subscription — video models roughly $0.09-$0.135/second, image models roughly $0.004-$0.045/image. Some free credits mentioned but amount not disclosed on the pages fetched.

**Integration path:** This is the one candidate with genuine, well-documented programmatic access: an OpenAI-compatible API endpoint, instant API keys, full developer docs, and explicitly **MCP (Model Context Protocol) & CLI tools** — architecturally the closest match to Sirketim's existing `openart` MCP pattern of any of the six.

**Legitimacy red flags:** Company legitimacy itself is strong (real funding, real infrastructure deals, named leadership, verifiable press coverage) — this is not a fly-by-night operator. The red flag here is narrower but real: the gap between its own stated content policy and its own marketing/instructional content for adult-content generation via its API means the actual, enforced content boundary is unclear and would need direct confirmation (e.g., from Atlas Cloud support, or by testing account-level behavior) before relying on it — not something this research can resolve from outside.

## 6. Delyvra

**What it is:** A browser-based NSFW-focused platform: text-to-image, image-to-video (WAN 2.2), and an "AI companion chat" product line ("Companions") with integrated image generation. Self-positions in review-site copy as a budget alternative within a cluster of near-identical "uncensored AI generator" competitor sites (comparisons recur to Pixelbunny, Yodayo, Seduced AI) — a low-differentiation market segment, though no evidence found that Delyvra shares ownership with any of those named competitors.

**NSFW capability & policy:** Yes. Marketing language is the most explicit of the six about lacking restrictions — "uncensored," "zero content restrictions," "zero prompt blocking on adult content for 18+ users," hard blocks only on "illegal categories." **This is flagged as the concern it is, not a selling point.** That said, its actual [Terms of Service](https://www.delyvra.com/tos) are more substantive than the marketing tone suggests: explicit prohibition on "non-consensual depictions of real, identifiable individuals" (with a documented-consent exception process via support), an explicit deepfake ban that cites the federal TAKE IT DOWN Act with a stated 48-hour non-consensual-imagery removal process, and a zero-tolerance policy for "real or synthetic minors in any sexual or suggestive context" with stated NCMEC reporting. It also describes automated pre-delivery screening (a public-figure blocklist, prompt hardening, Amazon Rekognition scanning for minors/recognized people). Its [18 U.S.C. §2257 page](https://www.delyvra.com/2257) claims blanket **exemption** (not compliance) from federal record-keeping requirements, on the theory that no real performers are involved since all content is synthetic — this is a self-assessed legal claim, not independently verified, and the brief's existing "Compliance overhead" open question already flags this exact area as needing real legal review rather than a vendor's own say-so. Net: Delyvra's actual written policy is closer to what the founder's commitment #4 asks for than its own marketing tone implies — worth registering as a real distinction between the two, not a resolution of the underlying legal-review gap.

**Pricing:** Freemium, paid-only in practice for generation (free tier is gallery-browsing only, no credit card needed to create an account). Starter $9.99/mo (1,000 credits, ~100 images, 2 videos/mo), Creator $14.99/mo (3,000 credits, 8 videos/mo, "most popular"), Studio Pro $29.99/mo (8,000 credits, 22 videos/mo, LoRA training, API "coming soon"). **Payment is cryptocurrency-only** via NOWPayments (300+ coins incl. BTC/ETH/USDT/USDC/Monero) — no credit card option at all, marketed explicitly for "anonymity."

**Integration path:** No live API today; "coming soon" on the top Studio Pro tier only. No MCP server. Browser-only in practice right now.

**Legitimacy red flags:** No legal entity name, registered jurisdiction, or physical address disclosed anywhere found — homepage, ToS, and 2257 page all omit it, leaving only a contact form and the trading name "Delyvra Studio." Crypto-only billing explicitly marketed for anonymity is a real accountability gap (no card processor relationship to hold the business to, easy to relaunch under a new name if needed) — this is a common pattern across the "uncensored AI generator" site cluster it's benchmarked against in reviews, not unique to Delyvra. Content stored "completely private," auto-purged after 30 days, prompts "never persisted past session" — reads as a privacy feature but also means minimal retained record for any future compliance question, worth weighing against the brief's own flagged 2257/record-keeping open question rather than taking at face value.

---

## Summary table (neutral, for founder decision — not a recommendation)

| Service | NSFW capable | Real operator disclosed | API/MCP | Pricing | Headline concern |
|---|---|---|---|---|---|
| Mage.space | Yes | Yes (Ollano Inc, NYC, funded) | API in closed beta only, no MCP | Free tier + $10-$200/mo | Documented history of non-consensual celebrity deepfakes, only partially fixed after media exposure |
| FixArt.ai | Yes, markets as unrestricted | No (email only) | None | Fully free | No disclosed operator; marketing directly contradicts its own ToS |
| Joyfun.ai | Yes, incl. an "undress" feature | No (privacy-registered domain) | None | Marketed free; paid tiers found in practice | Named non-consensual-imagery-risk feature + anonymous ownership + billed under a differently-branded company |
| Creen.ai | **No — explicitly prohibited** | Yes (CODESAIL LIMITED, Hong Kong) | None | Free tier + credits | Not a fit at all for this use case |
| Atlas Cloud | Ambiguous (policy says no, own marketing says yes) | Yes (real, well-funded infra company) | **Yes — real API + MCP + CLI** | Pay-per-use, ~$0.004-$0.135/unit | Stated Acceptable Use Policy directly contradicts the company's own how-to-get-NSFW marketing content |
| Delyvra | Yes, markets as unrestricted | No (no entity/jurisdiction disclosed) | "Coming soon," no MCP | Free browsing; $9.99-$29.99/mo, crypto-only | Anonymous operator + crypto-only payment, despite unusually substantive written consent/minor-safety policy |

No candidate is a clean match: the two most institutionally legitimate options (Mage, Atlas Cloud) each carry a documented or self-contradictory content-policy problem specific to the founder's stated commitments; the ones with the most permissive marketing (FixArt, Joyfun, Delyvra) pair that with little-to-no disclosed operator accountability, and Joyfun specifically markets a feature (undress) that runs directly counter to commitment #4. Creen is simply not applicable. This is reported for the founder's decision, not to shortlist a "winner" — none of the six should be read as pre-cleared for use based on this research alone.
