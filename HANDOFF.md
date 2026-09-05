# Handoff — 2026-09-05

**Perishable.** This is where a working session stopped, not a permanent document. When its open items are done, delete it rather than letting it rot into a false account of the project. Durable lessons belong in the relevant `CLAUDE.md`; the ordered roadmap belongs in `products/affiliate-sites/fragrance-dupes/FINALIZATION-GUIDE.md`.

Machine setup is `SETUP.md`. This file is only about *what state the work is in*.

## Where things stand

`counterscent.com` is live. **`main` is at `ed73957`; the AromaPassions A2 batch below is committed-pending — it is in the working tree, built and verified, not yet committed or deployed.**

| | |
|---|---|
| Dupe listings | **79** across **65** originals |
| Tracking affiliate links | **77**, all traced and stock-checked (8 out of stock, all Opulensi) |
| Merchants we can earn from | **3** — Opulensi (Awin 123248), Clone of Perfume (117395), AromaPassions (34989) |
| Reference catalog | 200 originals |
| Images | 195 committed. **The 24 new A2 listings have none** — see below |

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

1. **Commit and deploy A2.** It is verified in the working tree but unpushed: `tsc` and `lint` clean, `npm run build` succeeds, all 77 links traced with attribution intact, 84 redirect rules generated, all 38 AromaPassions listings confirmed visible via `getRankedDupesFor()` and 0 flagged verbatim.
2. **Images for the 24 new listings.** `scripts/fetch-dupe-images.mjs` regenerates the *whole* manifest, so it needs `opulensi.csv` and `clone-of-perfume.csv` present too — only `aromapassions.csv` was re-downloaded. Re-download those two and one run fills them in. They render the generated note-signature mark until then. **`imageUrl` was deliberately not hand-set** — the generated manifest is what records licensing provenance.
3. **The scoring decision.** Now sharper (see above) and still the thing that gates honest growth.
4. ~~**Brand-alias mapping**~~ — **done in A2.** The alias cases (`MFK`, `CH`, `DG`, `D.`, `INTIO`, `MRLY`, `GIVNCHY`, `ROJA`) were resolved by matching on the reference *name* with word boundaries and requiring brand confirmation only for short names; `fahrenheit`, `elysium`, `light-blue`, `delina`, `l-homme`, `y`, `poison` and `la-vie-est-belle` all shipped from it.
5. **~32 missing originals.** Real, famous fragrances with publicly documented pyramids (Noir Extreme, 1 Million, A*Men, Musc Ravageur, Portrait of a Lady, Luna Rossa Ocean, Jubilation XXV, Philosykos, Do Son, Acqua di Gioia, Black Afgano, Grand Soir, MFK 724…). Each unlocks exactly one AromaPassions listing. **Chanel No 5, Coco Mademoiselle and Delina were on this list and should not have been — we hold all three**, and No 5 and Delina now carry listings; Coco Mademoiselle is held, uncovered, and blocked only by the split problem in item 3 (see the project CLAUDE.md on SEDUCTIVE). Re-check the catalogue before adding a name here. **Research them properly — do not create placeholder references.** A reference carries the note pyramid and facets the score is computed from, so a dummy publishes a meaningless percentage about a real company's product on a live, indexed page. Note also that a CJ feed cannot fill this gap: feeds supply names, prices and images, never note pyramids.
   Two claims in that list must never become references: `Designer Brands` (a category label, not a fragrance) and `LAKESIDE MORNING by BBW`.
6. **Wire the CJ merchants for the originals side.** The site says "Nx cheaper" but cannot link the original at all — My Perfume Shop has been closed for tracking since 1 Sep. Perfumania and The Fragrance Shop fix that. Note The Fragrance Shop is itself a dupe house selling **alcohol-free oil concentrates**; if its products are ever listed as dupes, the format difference is real and must be stated — unlike AromaPassions, where I wrongly assumed the same thing (see below).
7. **Root `CLAUDE.md` edits — the stale line 58 is now FIXED** (it said Opulensi supplied 23 links and was the only dupe merchant; it now reads 77 links across three merchants). Still worth promoting: three lessons that currently live only in the project-level file although they are not fragrance-specific: merchant copy is not product fact; affiliate attribution lives in the network's cookie, not the destination URL; feed image URLs decay because Shopify CDN paths are content-addressed. Also worth adding: a subagent refusing a brief is a success mode, not a failure.

## Founder actions still open

- **`parfumoza.com` still needs removing** from the Cloudflare account and the Worker's Domains & Routes. Dead since the 27 Aug rename, auto-renew off.
- **9 affiliate applications were pending** and are not tracked anywhere in the repo. Worth recording which, so the next session does not re-apply or re-research them.

## Two traps this session paid for

**I asserted a product format from marketing copy and nearly published it 15 times.** Every AromaPassions title contains "Essential Oil Fragrance", so I briefed them as oil concentrates and asked for the score to reflect the weaker format. Their own product pages list `alcohol` and never say alcohol-free, roll-on or oil-based; they are ordinary 50/100 ml sprays. A subagent refused the brief rather than writing fifteen invented format claims about a real company — the correct call. The same trap caught the other direction the same day: these are marketed as "Pheromone Perfume", which we correctly refuse to repeat. Both are seller claims. Attribute them or verify them against something the seller cannot spin.

**A wrangler preview left orphaned `workerd.exe` processes holding a lock on `out/`,** so `rm -rf out` failed with "Device or resource busy" and the deploy rehearsal could not run. Kill `workerd.exe` and stray `serve`/`wrangler` node processes before rebuilding. Documented in the project CLAUDE.md, hit anyway.
