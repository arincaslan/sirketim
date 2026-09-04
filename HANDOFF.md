# Handoff — 2026-09-04

**Perishable.** This is where a working session stopped, not a permanent document. When its open items are done, delete it rather than letting it rot into a false account of the project. Durable lessons belong in the relevant `CLAUDE.md`; the ordered roadmap belongs in `products/affiliate-sites/fragrance-dupes/FINALIZATION-GUIDE.md`.

Machine setup is `SETUP.md`. This file is only about *what state the work is in*.

## Where things stand

`counterscent.com` is live and current with `main` at commit `9328f31`. Working tree clean, nothing unpushed.

| | |
|---|---|
| Dupe listings | **55** across **41** originals |
| Tracking affiliate links | **53**, all traced and stock-checked |
| Merchants we can earn from | **3** — Opulensi (Awin 123248), Clone of Perfume (117395), AromaPassions (34989) |
| Reference catalog | 200 originals, 221 sitemap URLs |
| Images | 195 committed (156 reference, 39 dupe) + 14 AromaPassions added since |

Three merchants were approved and wired in two days, taking listings 25 → 55. Two more approvals exist and are **not wired**: **The Fragrance Shop** and **Perfumania**, both on CJ.

## Do this first on the other machine — the feeds do not travel

`scripts/feeds/` is gitignored on purpose (licensed merchant data, large, not ours to redistribute in a public repo). A clone gets the README and nothing else, so **every ingest/matching script will fail with "feed not found" until you re-download**. That is expected, not breakage.

Re-download from Awin (Toolbox → Create-a-Feed), publisher **3064149**, and save as:

| Save as | Awin advertiser | Notes |
|---|---|---|
| `opulensi.csv` | 123248 | 610 rows. Exhausted — two full hand-scans found nothing further. |
| `clone-of-perfume.csv` | 117395 | 11 rows, 10 fragrances. All mined. |
| `aromapassions.csv` | 34989 | 230 rows, 101 distinct claims. **Only partly mined — this is the live work.** |
| `my-perfume-shop.csv` | 106089 | Originals-side, programme closed for tracking. Kept for reference imagery only. |

Take **all** columns, not the default preset — the default is ~11 columns and drops `description`, which is where every "Inspired by" citation and note pyramid lives. The Opulensi export is 86 columns; match that.

Also per-machine and not in the repo: `.agents/` skills (re-run the `npx skills@latest add` commands in `SETUP.md`), `HOSTINGER_API_TOKEN` and `TWENTY_FIRST_API_KEY` env vars, and `node_modules`/`.next`/`out`.

## The open decision that gates everything else

**The match score can be gamed by a merchant's copywriter, and it is now happening at scale.**

Five of the last fourteen listings score 83–87 because the merchant restated the original's note pyramid in their own product description. Our formula reads that as a near-perfect composition match. It is not — it is marketing copy. Two different merchants did this within two days, so it is a pattern.

`isVerbatimCopy()` exists for exactly this but needs notes *and* facets to match; merchants supply only notes and we author the facets, so it rarely fires. One listing (ILLUMINATE / Versace Crystal Noir) was deliberately **not** shipped for this reason, and one (GLAMOROUS / Bright Crystal) ships only because the merchant writes "Ice"/"Lotus" where our catalogue records "Ice Accord"/"Lotus Flower" — there is a comment in `lib/dupes-data.ts` warning that tidying those two strings makes the listing disappear.

Fixing it changes every existing score, so it is its own change, and it belongs beside the known `familyBonus`-hardcoded-to-`1` bug in `lib/similarity.ts`.

**Decide this before adding more listings.** Growing the catalog further means showing a number we already distrust on more pages.

## Work queue, in the order it makes sense

1. **The scoring decision above.** Everything below inflates the problem if it goes first.
2. **AromaPassions batch A2** — 14 more exact matches, same standard as the 14 shipped. The list is derivable by re-running `node scripts/match-feed-pairings.mjs --feed aromapassions` and filtering to exact brand+name matches whose original has no listing yet.
3. **Brand-alias mapping — 18 listings, no new data needed.** The feed writes brands abbreviated or misspelled (`MFK`, `CH`, `DG`, `D.`, `INTIO`, `MRLY`, `GIVNCHY`), so exact matching rejects originals we *do* hold: `MFK BACCARAT ROUGE 540`→`baccarat-rouge-540`, `CH GOOD GIRL`→`good-girl`, `D. FAHRENHEIT`→`fahrenheit`, `INTIO OUD FOR GREATNESS`→`oud-for-greatness`, `MARLY LAYTON`→`layton`, `ROJA ELYSIUM`→`elysium`, and about a dozen more. Cheapest remaining win.
4. **~44 missing originals.** Real, famous fragrances with publicly documented pyramids (Coco Mademoiselle, Chanel No 5, Noir Extreme, Delina, 1 Million, A*Men, Musc Ravageur, Portrait of a Lady, Luna Rossa Ocean, YSL Libre, Jubilation XXV, Philosykos, Do Son…). Each unlocks exactly one AromaPassions listing. **Research them properly — do not create placeholder references.** A reference carries the note pyramid and facets the score is computed from, so a dummy publishes a meaningless percentage about a real company's product on a live, indexed page. Note also that a CJ feed cannot fill this gap: feeds supply names, prices and images, never note pyramids.
   Two claims in that list must never become references: `Designer Brands` (a category label, not a fragrance) and `LAKESIDE MORNING by BBW`.
5. **Wire the CJ merchants for the originals side.** The site says "Nx cheaper" but cannot link the original at all — My Perfume Shop has been closed for tracking since 1 Sep. Perfumania and The Fragrance Shop fix that. Note The Fragrance Shop is itself a dupe house selling **alcohol-free oil concentrates**; if its products are ever listed as dupes, the format difference is real and must be stated — unlike AromaPassions, where I wrongly assumed the same thing (see below).
6. **Root `CLAUDE.md` edits, analysed but not applied.** One verified stale claim (line 58 still says Opulensi supplies 23 links and is the only dupe merchant), plus three lessons that currently live only in the project-level file although they are not fragrance-specific: merchant copy is not product fact; affiliate attribution lives in the network's cookie, not the destination URL; feed image URLs decay because Shopify CDN paths are content-addressed. Also worth adding: a subagent refusing a brief is a success mode, not a failure.

## Founder actions still open

- **`parfumoza.com` still needs removing** from the Cloudflare account and the Worker's Domains & Routes. Dead since the 27 Aug rename, auto-renew off.
- **9 affiliate applications were pending** and are not tracked anywhere in the repo. Worth recording which, so the next session does not re-apply or re-research them.

## Two traps this session paid for

**I asserted a product format from marketing copy and nearly published it 15 times.** Every AromaPassions title contains "Essential Oil Fragrance", so I briefed them as oil concentrates and asked for the score to reflect the weaker format. Their own product pages list `alcohol` and never say alcohol-free, roll-on or oil-based; they are ordinary 50/100 ml sprays. A subagent refused the brief rather than writing fifteen invented format claims about a real company — the correct call. The same trap caught the other direction the same day: these are marketed as "Pheromone Perfume", which we correctly refuse to repeat. Both are seller claims. Attribute them or verify them against something the seller cannot spin.

**A wrangler preview left orphaned `workerd.exe` processes holding a lock on `out/`,** so `rm -rf out` failed with "Device or resource busy" and the deploy rehearsal could not run. Kill `workerd.exe` and stray `serve`/`wrangler` node processes before rebuilding. Documented in the project CLAUDE.md, hit anyway.
