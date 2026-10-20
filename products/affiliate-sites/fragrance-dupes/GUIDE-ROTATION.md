# Weekly guide rotation

**Founder decision, 2026-10-20:** every week, retire the **3 least important guides** and publish **3 new guides about perfume and dupes**, then deploy. Links to a retired guide are removed from every page that carried them.

This file is the procedure. The cloud routine *Counterscent weekly guide rotation* runs it every Monday; a person running it by hand follows the same steps. Change the procedure here, not in the routine's prompt, so the change travels with the repo.

## Why it is shaped like this

Read this before changing a step. Every rule below exists because the obvious alternative fails.

- **What to retire is decided by `scripts/rank-guides.mjs`, never by judgement on the day.** The founder rejected "the oldest three" because the oldest pieces are the highest-intent ones (Aventus, Baccarat Rouge 540, Sauvage). The script scores what removing each guide would cost: inbound links from other guides, catalogue pages that list it under "Related reading", catalogue pages that would lose their *only* related reading, and whether it targets a dupe/alternative search. Traffic is deliberately not a signal yet: on 2026-10-20 Cloudflare Web Analytics showed every guide at zero or one sampled pageview a month, so a traffic ranking would be noise dressed as measurement. The script's header has the weights.
- **A guide is never eligible in its first 14 days.** A new piece has had no time to collect inbound links, so without the grace period each week's new pieces would be the next week's first removals. With 12 guides and 3 in / 3 out, the 6 newest are always protected and the other 6 compete. So a guide survives past its second week only by outranking its rivals.
- **The founder can protect a guide** by adding its slug to `keep` in `content/guide-rotation.json`. The script never offers a kept guide.
- **Retired URLs answer 301, and internal links to them are removed.** These are two separate audiences. The 301 serves people and crawlers arriving from outside: a bookmark, a backlink, a search result Google has not dropped yet. Inside the site, a link to a page we retired is just a link to something that is gone, so it is deleted rather than left to bounce through the redirect. `scripts/check-internal-links.mjs` fails the run if one survives. The library, the home page's latest pieces, the fragrance pages' "Related reading" and the sitemap are all generated from `content/guide/`, so deleting the file removes those links by itself.
- **A retired slug is never published again.** Cloudflare applies a `_redirects` rule even when a file exists at that path, so a new guide under a retired slug would be unreachable. `scripts/lib/guide-rotation.mjs` fails the build if it happens.
- **Deploy = push to `main`.** Workers Builds deploys about two minutes after each push. This was verified 2026-10-20: every push for four weeks produced a deployment, and each commit carries a `Workers Builds: counterscent` check run on GitHub. The routine holds no Cloudflare credential and must never be given one: the only one on file is the account's Global API Key, which reaches DNS and mail.

## Procedure

Work from the repo root (`sirketim/`); every path below is relative to it.

### 0. Start clean

```bash
git checkout main && git pull --ff-only
cd products/affiliate-sites/fragrance-dupes && npm install && cd -
```

Read `products/affiliate-sites/fragrance-dupes/CLAUDE.md`, section "Content", before writing anything.

### 1. Decide what to retire

```bash
node products/affiliate-sites/fragrance-dupes/scripts/rank-guides.mjs
```

Retire exactly the slugs on the `RETIRE:` line. If it names fewer than 3, retire only those and say so in the report. Do not substitute your own choice, and do not retire a guide the script did not name.

### 2. Choose three new topics

Every topic is about perfume and dupes, written for a buyer who is weighing an original against its alternatives.

- **At least two of the three are `<original> alternatives` pieces** for an original that has listed alternatives and no guide yet. Candidates, most listings first:

  ```bash
  cd products/affiliate-sites/fragrance-dupes && for s in $(grep -oE 'referenceSlug: "[^"]+"' lib/dupes-data.ts | cut -d'"' -f2 | sort | uniq -c | sort -rn | awk '{print $2}'); do [ -e "content/guide/$s-alternatives.mdx" ] || grep -q "\"$s-alternatives\"" content/guide-rotation.json || echo "$s"; done | head -15; cd -
  ```

  The slug is `<reference-slug>-alternatives`, matching the three that exist.
- **The third** may be one of those too, or a dupe-adjacent explainer that no live guide already covers. Examples: how dupe houses pick what to clone, decants versus dupes, why an alternative can last longer than its original.
- **Never** reuse a slug listed under `retired` in `products/affiliate-sites/fragrance-dupes/content/guide-rotation.json`. Never write a topic a live guide already covers. Never re-publish the topic of a guide retired this run.

### 3. Research and write

Read two existing pieces first for the house voice: `aventus-alternatives.mdx` and `baccarat-rouge-540-alternatives.mdx`. Plain, specific, explains *why*, no hype. **Do not copy their "we do not currently list alternatives" paragraphs**: they predate the listings and are no longer true.

What a piece may say, and where each kind of claim must come from:

- **The original's notes, family, longevity and sillage come from our own catalogue**: `grep -rn 'slug: "<slug>"' products/affiliate-sites/fragrance-dupes/lib/data/houses/`. Never use a pyramid from the web instead. The fragrance page shows ours, and a guide that disagrees with it is a contradiction on our own site.
- **Name an alternative only if it is a listing in `products/affiliate-sites/fragrance-dupes/lib/dupes-data.ts`**, with its `name` and `brand` exactly as written there. Its `verdict` field is our published judgement and its `pairingBasis` says who claims the pairing. Use both, and attribute the claim: "the retailer describes it as inspired by…". Never name a product that is not listed, however well known it is. This site was emptied once for naming products that did not exist.
- **No match percentages, prices, price-per-ml or "Nx cheaper" figures in prose.** They are computed live and move whenever the formula, a price or a listing changes, so a number frozen in a guide goes stale with nothing to flag it. Send the reader to `/dupe-finder/?ref=<slug>` for the live comparison and to `/fragrance/<slug>/` for the original.
- **A seller's marketing copy is not a product fact.** Pheromones, "extrait strength", "smells identical" and "lasts 24 hours" are attributed or left out.
- **No invented experience.** No testimonials, no quotes, no reviews, no "we wore it for eight hours". The editorial team has not worn these bottles and the piece must not imply it has.
- **General perfumery facts** (concentration ranges, how materials evaporate, IFRA, what an accord is) are checked with WebSearch against a reputable source. Where sources disagree, say so or leave the fact out. No medical, skin-safety or legal claims beyond "patch-test a new fragrance".
- **Length 800 to 1,300 words.** Use short paragraphs and `##` sections, a notes table where it helps, and a "what to check before you buy" section.

### 4. File format

Write `products/affiliate-sites/fragrance-dupes/content/guide/<slug>.mdx`. The filename must equal the slug.

```yaml
---
title: "…"
description: "…"            # 140-160 characters, the meta description
slug: "<slug>"
publishedAt: "YYYY-MM-DD"   # today
author: "Editorial Team"
categories: ["Guides"]
keywords:                   # 3-6 lowercase search phrases
  - "…"
disclosure: false
contentType: "guide"
---
```

- **No `/go/` links in a guide.** Link to `/dupe-finder/?ref=<slug>` and `/fragrance/<slug>/` instead, where the buy buttons and their disclosure already are. That is also why `disclosure` stays `false`: its block says "this piece contains affiliate links", which would be untrue. The link check fails a guide that links to `/go/` with `disclosure: false`.
- **Every internal link ends in `/`**: `/fragrance/aventus/`, `/about/#methodology`, `/dupe-finder/?ref=aventus`. Link only to pages that exist. Each new piece links to at least three `/fragrance/` pages, which is what puts it under "Related reading" on them.
- **MDX is not Markdown.** A bare `{`, `}`, `<` or `>` in prose is parsed as code or JSX and fails the build. Write "under 10" instead of "<10".

### 5. Retire

For each slug from step 1:

1. Delete `products/affiliate-sites/fragrance-dupes/content/guide/<slug>.mdx`.
2. Append an entry to `retired` in `products/affiliate-sites/fragrance-dupes/content/guide-rotation.json`:

   ```json
   { "slug": "<slug>", "title": "<its title>", "retiredOn": "YYYY-MM-DD", "redirectTo": "/…/", "reason": "<its rank-guides row>" }
   ```

   `redirectTo` is, in order of preference: the live guide closest in subject, possibly one published this run; else the `/fragrance/<slug>/` page it was mainly about; else `/library/`. If an older `retired` entry pointed at a guide you are retiring now, repoint it to the same target. The build refuses a redirect into a retired guide.
3. **Remove every link to it** from the remaining guides: `grep -rn "/guide/<slug>" products/affiliate-sites/fragrance-dupes/content products/affiliate-sites/fragrance-dupes/app products/affiliate-sites/fragrance-dupes/components products/affiliate-sites/fragrance-dupes/lib`. Delete the link and keep the sentence readable. Where the sentence existed only to point at the retired guide, delete the sentence. Do not repoint these links to `redirectTo`; the founder asked for them removed.

### 6. Build and check, the way Cloudflare does

```bash
rm -rf products/affiliate-sites/fragrance-dupes/out && WORKERS_CI=1 npm install     # from the repo root; must exit 0
node products/affiliate-sites/fragrance-dupes/scripts/check-internal-links.mjs      # must print OK
node products/affiliate-sites/fragrance-dupes/scripts/rank-guides.mjs               # the three new pieces show "new (0d)"
```

Then confirm in `products/affiliate-sites/fragrance-dupes/out/` that each new guide has `guide/<slug>/index.html`, that no retired guide does, and that `products/affiliate-sites/fragrance-dupes/out/_redirects` carries two `301` lines per retired slug.

`npm run build` alone is **not** the check: Cloudflare runs the root install, and fixes verified the other way have shipped broken before. If something fails, fix it and run step 6 again. If you cannot fix it, push nothing: discard the changes and report what failed.

### 7. Commit and push

```bash
git status --short
```

Stage only the rotation, deletions included:

```bash
git add -A products/affiliate-sites/fragrance-dupes/content/guide products/affiliate-sites/fragrance-dupes/content/guide-rotation.json
```

`npm install` rewrites lockfiles as a side effect, so restore them with `git checkout -- package-lock.json products/affiliate-sites/fragrance-dupes/package-lock.json`. The lockfile decides which package manager Cloudflare picks. `out/`, `.next/` and `public/_redirects` are gitignored. Never stage anything else. Board routines push to `main` on Monday mornings too, so `git pull --rebase` immediately before `git push origin main`, and retry that pair up to three times if the push is rejected.

Commit message:

```
Guide rotation YYYY-MM-DD: +3 / -3

Added: <slug>, <slug>, <slug>
Retired: <slug> -> <redirectTo>, ...

<the rank-guides table from step 1>
```

### 8. Prove it is live

The deploy takes about two minutes. Never report a deploy you have not seen.

1. **The build:** poll `https://api.github.com/repos/arincaslan/sirketim/commits/<sha>/check-runs` until the `Workers Builds: counterscent` run is `completed`, for up to 15 minutes. `conclusion: success` means Cloudflare built and deployed it. Anything else means it did not, and the report says so.
2. **The site:** `curl -s -o /dev/null -w "%{http_code}" https://counterscent.com/guide/<new-slug>/` should give `200` for each new guide. `curl -sI https://counterscent.com/guide/<retired-slug>/` should give `301` with a `location:` header pointing at its `redirectTo` (relative or absolute). If this environment cannot reach the site, say so and rely on step 1. Do not treat a network failure as either result.

### 9. Report

In Turkish, for the founder. Include:

- The three added guides: title and live URL.
- The three retired guides: title, rank score and redirect target.
- The links that were removed, and from which guides.
- The step 6 and step 8 results, stated exactly.
- Anything skipped, and why.
