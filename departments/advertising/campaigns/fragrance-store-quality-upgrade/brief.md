# Fragrance Store — Visual Quality Upgrade

**Type:** Internal product work (template asset upgrade, not a client campaign)
**Target:** `products/web-templates/fragrance-store/`
**Requested by:** Founder, after rejecting the first pass on bringing the template up to the quality of 4 reference sites (palominoprod.com, daynight.co.uk, primesec.ai, winkdigital.nl). Specific note: imagery wasn't good enough, use OpenArt for real generated visuals instead of stock photography.

## Brief

Replace the site's generic stock photography with a cohesive, on-brand generated image set:
1. Hero image — editorial perfume bottle shot, replacing the rainbow-prism stock photo at `public/hero.jpg`.
2. Five category images (Floral, Woody, Oriental, Fresh, Gourmand), replacing the generic stock under `public/products/`.
3. **Follow-up (2026-08-20):** all 12 individual product photos, replacing watermarked/uncredited/mismatched stock (e.g. `iris-poudre.jpg` carried a "Brian Tomlinson Photography" CC-NC watermark; `bergamot-sky.jpg` was an unrelated seagull stock photo credited "aivars_k") — an actual licensing liability, not just a quality issue. Founder-approved regeneration of all 12 to close the gap and complete the 18-image system.

## Brand read (from `app/globals.css`)

- Warm cream/neutral background (`--background: 32 25% 97%`), near-black foreground (`--primary: 20 20% 14%`), muted amber/bronze gold accent (`--gold: 38 55% 45%`).
- Serif display type (Playfair Display) + Inter body.
- Positioning: small-batch, tactile, editorial fragrance brand — elevated minimalist, not garish.

## Model / approach

- **Model:** OpenArt `gpt-image-2` (GPT Image 2), text2image mode — chosen for its stated strength in "luxury product hero shots" and general high-end aesthetic photography.
- **Hero:** 4:5 portrait, 2K, quality "high" (145 credits) — the single most visible asset, worth the extra spend.
- **5 category images:** 1:1 square, 2K, quality "medium" (40 credits each = 200 credits) — cohesive set, cost-conscious since there are five.
- Total: ~345 credits pre-discount (account is on Plus plan, MCP generations get 10% off), against a 12,000 credit balance.
- Cohesion across the 5 category shots achieved by reusing an identical lighting/backdrop/camera-angle/color-grade description in every prompt, varying only the scent-family-specific objects (see `manifest.md` for exact prompts).

## Status

All 18 images (1 hero + 5 category + 12 product) generated and confirmed COMPLETED via `openart_creation_wait` (see `manifest.md` for historyIds, resource IDs, and URLs). The 12 product shots reuse the hero's exact bottle/lighting/backdrop/color-grade template, straight-on framing, garnished per-product with 2-3 objects pulled from that product's actual top/heart/base notes (e.g. Cedar & Smoke gets charred wood and a leather scrap; Ocean Bloom gets a water lily and driftwood; Golden Saffron gets saffron threads, cinnamon, and a dried rose) — same design language as the 5 category shots, extended down to SKU level so all 18 read as one considered system.

**Known gap:** this session's toolset has no Bash/curl/download tool — only Read/Write/Edit/WebFetch/WebSearch and the OpenArt MCP tools. I could not pull the binary PNGs down to local disk under `assets/`. The images exist on OpenArt's CDN at the URLs in `manifest.md` (permanent production CDN paths, not temp links). Web-development (or the founder) needs to download all 18 URLs into `assets/` — e.g. `Invoke-WebRequest -Uri <url> -OutFile <path>` in PowerShell, or a session with Bash/curl access — before wiring them into the Next.js project, and should replace the 12 `public/products/*.jpg` files 1:1 by slug to close out the licensing liability.
