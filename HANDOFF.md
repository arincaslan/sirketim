# Handoff — 2026-09-05, updated 2026-09-07 (end of session)

**Perishable.** This is where a working session stopped, not a permanent document. When its open items are done, delete it rather than letting it rot into a false account of the project. Durable lessons belong in the relevant `CLAUDE.md`; the ordered roadmap belongs in `products/affiliate-sites/fragrance-dupes/FINALIZATION-GUIDE.md`.

Machine setup is `SETUP.md`. This file is only about *what state the work is in*.

## Where things stand

`counterscent.com` is live and **everything below is shipped, pushed and verified in production**. Three deploys on 2026-09-07, each confirmed against the live site rather than assumed: the originals side (`6002fdd`, landed 145s), and the AromaPassions photographs (`7fb29b5`, landed 167s — all 38 images return 200, `/originals/` and `/fragrance/noir-extreme/` still 200, both redirect kinds still 302). Working tree clean, nothing unpushed.

**You are picking this up on the other machine.** Everything in the repo travels; four things do not, and three of them will look like breakage:

1. **`scripts/feeds/` is empty on a fresh clone** — licensed merchant data, gitignored on purpose. Every ingest script fails with "feed not found" until you re-download. **The site still builds and deploys fine without any of them**, because the generated `lib/data/*.generated.ts` files and all 407 images are committed. You only need a feed to ingest *new* products or fetch *new* images. See the table below.
2. **`.agents/` skills** — re-run the `npx skills@latest add` commands in `SETUP.md`. Their installer writes Windows directory junctions holding this machine's absolute profile path, which is why they cannot be committed.
3. **`HOSTINGER_API_TOKEN` and `TWENTY_FIRST_API_KEY`** env vars, plus `gh auth login` and Claude Code's own login — all per-machine.
4. `node_modules`/`.next`/`out` — `npm install` inside whichever project you are working on.

Run `git fetch origin` before trusting local state or briefing the board: two scheduled routines push to `main` directly, and one (the CFO weekly report) landed mid-session on 2026-09-07. `origin/claude/department-collaboration-view-iqy07o` exists and is **empty relative to `main`** — checked 2026-09-07, nothing to merge, safe to ignore or delete.

| | |
|---|---|
| Dupe listings | **79** across **65** originals |
| Reference catalog | **216** originals |
| `/go/` ids that resolve | **252** — 116 `original-*`, 59 `shop-*`, 77 `dupe-*` |
| Merchants we can earn from | **4** — Opulensi (Awin 123248), Clone of Perfume (117395), AromaPassions (34989), FragranceShop.com (CJ 16941446) |
| Images | **407 committed**, all of them. Dupes 77/79, references 190/216, shop originals 102/103 — the gaps are licence-bound, not TODOs. See "image coverage is finished" below |

Three merchants were approved and wired in two days, taking listings 25 → 55; A2 on 2026-09-05 took it to **79 listings on 65 originals**. Two more approvals exist and are **not wired**: **The Fragrance Shop** and **Perfumania**, both on CJ.

**Coverage is now inside the estimated 50–70 ceiling, so treat AromaPassions as spent.** Its remaining unlisted products all need a *new researched original* first — the cheap matches are gone.

## What A2 changed, and the one decision behind it

- **One offer per listing, the 50ml price, one link** (founder's call). A1's second 100ml offer pointed at the *same* affiliate link, so it rendered a duplicate buy button and made `buy-actions.tsx` call one retailer's two bottles "2 retailers". A1 was collapsed too; no price moved.
- **SPICY (Spicebomb) withheld** — its declared notes are Spicebomb's set exactly (overlap 1.000), so `notesAreVerbatim()` fires. Same call as ILLUMINATE. **Three flankers refused**: Acqua di Gio *Profondo*, Armani Code *Profumo*, Delina *Exclusif*.
- **The scoring problem got sharper and is still open.** AromaPassions publishes **one flat note list and no pyramid at all**, but our formula weights tiers 20/35/45 — so *we* choose the split and the split moves the score **70–82% on identical merchant data**. Aligning the split to the original's pyramid (what A1 and A2 both do) maximises overlap by construction. Splitting by perfumery convention instead was tried and is worse: it disagrees with **17.1% of our own reference notes**, because tier placement is a per-fragrance fact, not a property of the material. Shipped with the disclosure in every verdict, on the founder's call. **The real fix — compare tier-agnostically when the merchant gives no pyramid — is still unbuilt** and belongs with the `familyBonus` bug in one considered change.

## Do this first on the other machine — the feeds do not travel

`scripts/feeds/` is gitignored on purpose (licensed merchant data, large, not ours to redistribute in a public repo). A clone gets the README and nothing else, so **every ingest/matching script will fail with "feed not found" until you re-download**. That is expected, not breakage.

Re-download from Awin (Toolbox → Create-a-Feed), publisher **3064149**, and save as:

| Save as | Awin advertiser | Notes |
|---|---|---|
| `opulensi.csv` | 123248 | 610 rows. Exhausted — two full hand-scans found nothing further. |
| `clone-of-perfume.csv` | 117395 | 11 rows, 10 fragrances. All mined. |
| `aromapassions.csv` | 34989 | 230 rows, 103 distinct products. **Mined out as of A2** — what is left needs a new researched original first. |
| `FragranceShop_com_-CJ_Product_Feed-shopping.txt` | CJ 16941446, not Awin | **Delivered 7 Sep and fully ingested.** 5,802 rows, **87 columns, TAB-delimited**, no quoting — a different network with a different schema, so do not expect the Awin columns. Re-download only to refresh prices or pick up new stock; nothing currently needs it. Schema table in `scripts/feeds/README.md`. |
| `my-perfume-shop.csv` | 106089 | Originals-side, programme closed for tracking. Kept for reference imagery only. |

Take **all** columns, not the default preset — the default is ~11 columns and drops `description`, which is where every "Inspired by" citation and note pyramid lives. The Opulensi export is 86 columns; match that.

Also per-machine and not in the repo: `.agents/` skills (re-run the `npx skills@latest add` commands in `SETUP.md`), `HOSTINGER_API_TOKEN` and `TWENTY_FIRST_API_KEY` env vars, and `node_modules`/`.next`/`out`.


## Image coverage is finished — the three remaining gaps are licence-bound, not TODOs

**407 images committed, and every one that can lawfully exist does.** Do not "fix" what is left; each
was checked on 2026-09-07 and each has a reason:

- **2 dupes** (Armaf Club de Nuit Sillage, Urban Man) — carried only by the **closed** My Perfume
  Shop programme. The licence rides on the affiliate relationship, so no live relationship means no
  photograph. Correct as-is.
- **26 references** — searched against the full 5,802-row CJ feed and **not one is genuinely
  stocked**. Every apparent hit is the merchant's own dupe oil (`Armani Code Profumo - Type Perfume
  Oil`), a flanker (`The Most Wanted Intense`), or a brand collision — `Al-Rehab` matching Initio
  Rehab, `Kim Kardashian True Reflection` matching Amouage Reflection Man. The houses are the ones
  FragranceShop does not carry at all: Chanel, Parfums de Marly, By Kilian, Xerjoff, Initio, Roja,
  Amouage, Jo Malone.
- **1 shop product** (Marc Jacobs Oh Lola Sunsheer) — the merchant offered only a shared stock
  photograph, recorded as `remoteImageUrl: null`. **Null means "no image", never "use a placeholder".**

**A second originals merchant is the only route to those 26**, which is what makes Perfumania the next
piece of work rather than a nice-to-have. Temper the expectation before spending a session on it:
Perfumania is a mass-market designer discounter, so expect it to cover Chanel poorly and the niche
houses not at all. **FragranceX** (CJ advertiser 1024283) is the better fit for that specific gap and is
already the top-priority application in `FINALIZATION-GUIDE.md` §3.3. Applying to both costs nothing
extra.

## The open decision that gates everything else

**The match score can be gamed by a merchant's copywriter, and it is now happening at scale.**

Five of the last fourteen listings score 83–87 because the merchant restated the original's note pyramid in their own product description. Our formula reads that as a near-perfect composition match. It is not — it is marketing copy. Two different merchants did this within two days, so it is a pattern.

`isVerbatimCopy()` exists for exactly this but needs notes *and* facets to match; merchants supply only notes and we author the facets, so it rarely fires. One listing (ILLUMINATE / Versace Crystal Noir) was deliberately **not** shipped for this reason, and one (GLAMOROUS / Bright Crystal) ships only because the merchant writes "Ice"/"Lotus" where our catalogue records "Ice Accord"/"Lotus Flower" — there is a comment in `lib/dupes-data.ts` warning that tidying those two strings makes the listing disappear.

Fixing it changes every existing score, so it is its own change, and it belongs beside the known `familyBonus`-hardcoded-to-`1` bug in `lib/similarity.ts`.

**Decide this before adding more listings.** Growing the catalog further means showing a number we already distrust on more pages.

## Work queue, in the order it makes sense

1. **Commit and deploy A2.** It is verified in the working tree but unpushed: `tsc` and `lint` clean, `npm run build` succeeds, all 77 links traced with attribution intact, 84 redirect rules generated, all 38 AromaPassions listings confirmed visible via `getRankedDupesFor()` and 0 flagged verbatim.
2. ~~**Images for the 24 new listings.**~~ — **DONE 2026-09-07, and the diagnosis that used to sit here was wrong.** This item claimed the script "regenerates the whole manifest, so it needs `opulensi.csv` and `clone-of-perfume.csv` present too". It does not. It needed exactly one feed — `aromapassions.csv` — and that file was on disk the whole time, which is why the gap sat for two days behind a wrong explanation.

   The real blocker was ordering inside `scripts/fetch-dupe-images.mjs`: the loop read a merchant's feed *before* checking whether the image was already downloaded, so the expired Opulensi export made `loadFeed()` throw on the very first entry and killed the run — even though all 53 of those images were already present and every one of those entries would have been skipped a line later. The loop now checks the filesystem first and treats an unreadable feed as **that merchant's** failure, reported per-slug, rather than the run's. **A script serving several merchants must degrade to the ones it can still serve**, because feeds are gitignored and expire.

   All 24 images came from the **live-page fallback**, not the feed — every `merchant_image_url` in that export 404s, exactly as the first 14 did on 2026-09-04. That rescue path is doing the primary work for this merchant, not covering an edge case.
3. **The scoring decision.** Now sharper (see above) and still the thing that gates honest growth.
4. ~~**Brand-alias mapping**~~ — **done in A2.** The alias cases (`MFK`, `CH`, `DG`, `D.`, `INTIO`, `MRLY`, `GIVNCHY`, `ROJA`) were resolved by matching on the reference *name* with word boundaries and requiring brand confirmation only for short names; `fahrenheit`, `elysium`, `light-blue`, `delina`, `l-homme`, `y`, `poison` and `la-vie-est-belle` all shipped from it.
5. **~32 missing originals.** Real, famous fragrances with publicly documented pyramids (Noir Extreme, 1 Million, A*Men, Musc Ravageur, Portrait of a Lady, Luna Rossa Ocean, Jubilation XXV, Philosykos, Do Son, Acqua di Gioia, Black Afgano, Grand Soir, MFK 724…). Each unlocks exactly one AromaPassions listing. **Chanel No 5, Coco Mademoiselle and Delina were on this list and should not have been — we hold all three**, and No 5 and Delina now carry listings; Coco Mademoiselle is held, uncovered, and blocked only by the split problem in item 3 (see the project CLAUDE.md on SEDUCTIVE). Re-check the catalogue before adding a name here. **Research them properly — do not create placeholder references.** A reference carries the note pyramid and facets the score is computed from, so a dummy publishes a meaningless percentage about a real company's product on a live, indexed page. Note also that a CJ feed cannot fill this gap: feeds supply names, prices and images, never note pyramids.
   Two claims in that list must never become references: `Designer Brands` (a category label, not a fragrance) and `LAKESIDE MORNING by BBW`.
6. ~~**Wire the CJ merchants for the originals side**~~ — **DONE 2026-09-07, FragranceShop.com.** The feed arrived and the whole originals side is live. Before this, all 200 references declared `affiliateLinkId: "original-<slug>"` and **not one resolved**; `/go/` now resolves **252** ids (116 `original-*`, 59 `shop-*`, 77 `dupe-*`).

   **What shipped:** the founder's buy-link scope — **EDP or Parfum, over $100, never EDT or EDC** — is 103 products and **all 103 are linked**. A new `/originals` page lists them with price, photograph and buy link and nothing else, because the feed carries nothing else. **17 references were added with researched pyramids** (200 → 216), and the "Nx cheaper" comparison now runs on **the retailer's own price** rather than our approximate-retail figure. Reference imagery went 156 → **190**, with 116 re-sourced off the dead My Perfume Shop programme onto a live one. Full write-up in `products/affiliate-sites/fragrance-dupes/CLAUDE.md`.

   **Three silent mis-links were found and fixed**, all the same shape: the merchant's `<Name> <Gender tag> - <Format> <Size>` grammar puts the word "Cologne" in the gender tag, so `cologne` is a noise word — and it was being absorbed when it was part of a product NAME. We were linking **Viking Cologne as Viking**, **Aventus Cologne as Aventus**, **Eternity Cologne as Eternity**, and **Le Male Le Parfum as Le Male** (that last via `le` + `parfum`; FragranceShop stocks no plain Le Male at all).

   **What is left:**

   - **Confirm `sid` once in CJ's click report.** CJ obfuscates the forwarded query, so only the `cjevent` token is checkable from here. Same one-off founder check already done for Awin 117395.
   - **Perfumania** — the second CJ approval, still unwired. A second originals merchant would cover part of the 100 references FragranceShop does not stock (no Chanel, Parfums de Marly, Byredo, Le Labo, Xerjoff, Initio, By Kilian, Amouage, Roja, Jo Malone or Louis Vuitton at all).
   - **59 shop-only products have no comparison page.** Adding one means hand-authoring a note pyramid; the feed cannot supply it. `node scripts/ingest-cj-feed.mjs --candidates` prints the shortlist.

7. ~~**Root `CLAUDE.md` edits**~~ — **done 2026-09-07.** The stale line 58 was fixed, and eight cross-department lessons were promoted into the root file's bullet list (repo root not gitignored; identify a vendor by domain not name; CRLF diffs and the `package-lock` side effect; assert against shipped code via esbuild; marketing copy is not product fact; attribution can live in the click cookie; feed image URLs decay; a subagent refusing a brief is a success mode). Kept to one line each — task 179 records that this file is a real per-session context cost.

## Founder actions still open

- **`parfumoza.com` still needs removing** from the Cloudflare account and the Worker's Domains & Routes. Dead since the 27 Aug rename, auto-renew off.
- **9 affiliate applications were pending** and are not tracked anywhere in the repo. Worth recording which, so the next session does not re-apply or re-research them.

## Two traps this session paid for

**I asserted a product format from marketing copy and nearly published it 15 times.** Every AromaPassions title contains "Essential Oil Fragrance", so I briefed them as oil concentrates and asked for the score to reflect the weaker format. Their own product pages list `alcohol` and never say alcohol-free, roll-on or oil-based; they are ordinary 50/100 ml sprays. A subagent refused the brief rather than writing fifteen invented format claims about a real company — the correct call. The same trap caught the other direction the same day: these are marketed as "Pheromone Perfume", which we correctly refuse to repeat. Both are seller claims. Attribute them or verify them against something the seller cannot spin.

**A wrangler preview left orphaned `workerd.exe` processes holding a lock on `out/`,** so `rm -rf out` failed with "Device or resource busy" and the deploy rehearsal could not run. Kill `workerd.exe` and stray `serve`/`wrangler` node processes before rebuilding. Documented in the project CLAUDE.md, hit anyway.
