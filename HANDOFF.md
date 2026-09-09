# Handoff — 2026-09-05, updated 2026-09-08 (end of session)

**Perishable.** This is where a working session stopped, not a permanent document. When its open items are done, delete it rather than letting it rot into a false account of the project. Durable lessons belong in the relevant `CLAUDE.md`; the ordered roadmap belongs in `products/affiliate-sites/fragrance-dupes/FINALIZATION-GUIDE.md`.

Machine setup is `SETUP.md`. This file is only about *what state the work is in*.

## Where things stand

`counterscent.com` is live and **everything below is shipped, pushed and verified in production**. Deploys on 2026-09-07, each confirmed against the live site rather than assumed: the originals side (`6002fdd`, landed 145s), and the AromaPassions photographs (`7fb29b5`, landed 167s — all 38 images return 200, `/originals/` and `/fragrance/noir-extreme/` still 200, both redirect kinds still 302). Then on 2026-09-08 the **score reform** (`0873b20`, landed 14:45:11, ~3 min) and the docs/dashboard pass (`967ce0b`). Working tree clean, nothing unpushed.

**Live-verified after `0873b20`, not assumed:** `/fragrance/chance-eau-tendre/` renders **75** for AromaPassions Admire (was 85), Aventus reads **80 / 79 / 79**, and `/about` carries every new number (40%, 30%, 15%, 90%, 95%, "Ingredient overlap", "Founder's personal assessment"). One process note worth keeping: **the first two live checks after a push will show the old content and that is not a deploy failure** — Cloudflare has taken 145–167s on every deploy here and I twice read "not deployed" from a check made too early. Wait ~3 minutes before concluding anything, and force-resolve rather than trusting the local resolver.

**You are picking this up on the other machine.** Everything in the repo travels; four things do not, and three of them will look like breakage:

1. **`scripts/feeds/` is empty on a fresh clone** — licensed merchant data, gitignored on purpose. Every ingest script fails with "feed not found" until you re-download. **The site still builds and deploys fine without any of them**, because the generated `lib/data/*.generated.ts` files and all 407 images are committed. You only need a feed to ingest *new* products or fetch *new* images. See the table below.
   **New on 2026-09-09:** that directory now also holds `perfumania-storefront.json`, a crawl cache rather than a download. Same rule — gitignored, does not travel, regenerate with `node scripts/ingest-perfumania.mjs --refresh`. The site still builds and deploys without it, because `pm-*.generated.ts` and all 198 new images are committed.
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

Three merchants were approved and wired in two days, taking listings 25 → 55; A2 on 2026-09-05 took it to **79 listings on 65 originals**. Two more approvals exist and are **not wired**: **The Fragrance Shop** and **Perfumania**, both on CJ. **Perfumania's feed arrived 2026-09-08 and is the wrong catalogue** — see below; it is still not wired and should not be.

**Coverage is now inside the estimated 50–70 ceiling, so treat AromaPassions as spent.** Its remaining unlisted products all need a *new researched original* first — the cheap matches are gone.

## What A2 changed, and the one decision behind it

- **One offer per listing, the 50ml price, one link** (founder's call). A1's second 100ml offer pointed at the *same* affiliate link, so it rendered a duplicate buy button and made `buy-actions.tsx` call one retailer's two bottles "2 retailers". A1 was collapsed too; no price moved.
- **SPICY (Spicebomb) withheld** — its declared notes are Spicebomb's set exactly (overlap 1.000), so `notesAreVerbatim()` fires. Same call as ILLUMINATE. **Three flankers refused**: Acqua di Gio *Profondo*, Armani Code *Profumo*, Delina *Exclusif*.
- **The scoring problem got sharper, and was addressed on 2026-09-08 — see the scoring-pipeline section of `products/affiliate-sites/fragrance-dupes/CLAUDE.md`.** AromaPassions publishes **one flat note list and no pyramid at all**, but our formula weights tiers 20/35/45 — so *we* choose the split and the split moves the score **70–82% on identical merchant data**. Aligning the split to the original's pyramid (what A1 and A2 both do) maximises overlap by construction. Splitting by perfumery convention instead was tried and is worse: it disagrees with **17.1% of our own reference notes**. The founder's call was to keep the tiered formula and **price the uncertainty**: a flat −10 on any listing whose split is ours, a 95 structural ceiling on everything, `familyBonus` fixed, and a 15% ingredient component that stays inert until both sides have a list. Tier-agnostic comparison remains unbuilt and is no longer the plan.

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
| `perfumania-storefront.json` | **not a feed** — CJ 17335854 | **Not downloaded, crawled.** `node scripts/ingest-perfumania.mjs --refresh` rebuilds it from the live shop (18 pages, ~1 min). Perfumania's actual CJ feed is its in-house dupe line and is useless to us; the storefront is the source. Nothing needs this unless you are re-ingesting or fetching new images. |

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

**A second originals merchant is the only route to those 26, and Perfumania is a real but partial
one** — worth being precise, because judging it by its CJ feed gets the answer backwards.

The feed delivered 2026-09-08 is Perfumania's in-house dupe line: 66 rows, nine house brands, no
designer stock. **The storefront is 4,380 products across 480 vendors** (enumerated in full
2026-09-09 — the feed is 1.5% of the store), and it does stock Giorgio Armani, YSL, Paco Rabanne,
Azzaro, Jo Malone, Parfums de Marly, Xerjoff, Kilian, Amouage and MFK.

**Against the 26 it covers 6**: `armani-code-profumo` ($98.95), `percival` ($229.95), `angels-share`
($244.95), `naxos` ($219.95), `wood-sage-sea-salt` ($126.99), `interlude-man` ($299.95). **Chanel,
Initio and Roja are carried at zero SKUs**, so 9 of the 26 are permanently out of reach there. A 7th
apparent hit, `the-most-wanted`, is a **flanker trap** — only *Intense* and *Parfum*, never the base
EDP. Detail and the two ingest traps: `scripts/feeds/README.md`.

**FragranceX** (CJ advertiser 1024283) therefore stays the top-priority application in
`FINALIZATION-GUIDE.md` §3.3 — it is the better fit for the niche houses — but Perfumania is no
longer a dead end for this gap, provided we get the right feed.

## The decision that gated everything else — taken 2026-09-08

**The match score can be gamed by a merchant's copywriter, and it was happening at scale.**

Five of the last fourteen listings scored 83–87 because the merchant restated the original's note pyramid in their own product description. Our formula read that as a near-perfect composition match. It is not — it is marketing copy. Two different merchants did this within two days, so it was a pattern.

`isVerbatimCopy()` exists for exactly this but needs notes *and* facets to match; merchants supply only notes and we author the facets, so it rarely fires. One listing (ILLUMINATE / Versace Crystal Noir) was deliberately **not** shipped for this reason, and one (GLAMOROUS / Bright Crystal) ships only because the merchant writes "Ice"/"Lotus" where our catalogue records "Ice Accord"/"Lotus Flower" — there is a comment in `lib/dupes-data.ts` warning that tidying those two strings makes the listing disappear.

**What shipped**, as one atomic change, ahead of the producer-subscription program that would have made outside producers a second source of the same self-reported data (decision record: `PRODUCER-PROGRAM.md` §7; mechanics: that project's `CLAUDE.md`):

- **`familyBonus` fixed** — real family check, no longer hardcoded to `1`. A no-op for all 79 current listings by construction.
- **Ingredient overlap, 15%** — new 4th component, flat untiered list, **inert until both sides have one** (none do yet), with the other three keeping their original weights meanwhile.
- **95 structural ceiling on everything**, `verified` listings included: identical declared notes never means identical proportions.
- **−10 on any listing whose tier split is ours**, not the seller's (47 of 79).
- **A founder override** as the only way past 95 — human, justified in writing, never on a house product, cannot rescue a flagged copy. Unused so far.

**Measured:** the 32 declared listings moved by exactly zero, 41 of 47 imputed fell exactly 10, six fell less because they were already at the 90 cap. One ranking changed site-wide — the Clone of Perfume listing this file called suspiciously #1 on Aventus is now #3.

**Still open, and worth being precise about:** the penalty prices a *missing pyramid*, not copying. A merchant who copies the reference's pyramid and publishes it as three proper tiers is still scored at face value, and `isVerbatimCopy()` — which needs facets to match too — remains the only defence against that.

## Two published artifacts live outside the repo — one is a pass behind

These are account-scoped, not machine-scoped: they travel with the founder's Claude login, so **nothing needs re-publishing just because you switched machines.** Both URLs are here because a republish must target the existing URL — publishing without one silently creates a *duplicate* artifact and the founder's bookmark keeps pointing at the stale one.

| Artifact | URL | State |
|---|---|---|
| **Counterscent Finalization** | `https://claude.ai/code/artifact/379722bc-cf4f-431f-a2ac-3c9acd6ead96` | **Current** — republished 2026-09-08 as the eighth pass, completed tasks ticked, real counts in, Perfumania recorded as waiting-on-feed. Mirrors `products/affiliate-sites/fragrance-dupes/FINALIZATION-GUIDE.md`. |
| **Perfumania Coverage** | `https://claude.ai/code/artifact/6f979f92-1253-46ca-87f8-1f6ccc46566b` | **Current** — published 2026-09-09. The 123 references Perfumania stocks, which 32 are new coverage, the 6 image gaps closed, the 6 concentration disagreements, and the 20 it cannot reach. |
| **Sirketim Dashboard** | `https://claude.ai/code/artifact/e2e47262-d56d-4ca9-8e6f-cdb07955e025` | **One pass behind.** `internal/dashboard/design/sirketim-dashboard.html` and `Main.dc.html` both carry task 185 and the "Sep 8" labels in the repo, but the *published* page still shows the previous snapshot. Not urgent: the dashboard's Finalization Guide link URL did not change, so clicking it from the stale dashboard still opens the current report. |

**The reason it is a pass behind, which will bite the next session too:** republishing an artifact this conversation did not itself publish is refused until you have `Read` **every line** of the live copy the tool hands you. The dashboard is ~786 lines and ~140 KB, most of it very long task-note strings, so that read is a real context cost for a file the repo already holds a newer copy of. Budget for it deliberately — do the read early in a session, or accept the artifact lagging until a session has room. Do not work around it by publishing without the `url`.

## Work queue, in the order it makes sense

1. ~~**Commit and deploy A2.**~~ — **DONE, shipped as `e106c89`.** It is live: 77 links traced with attribution intact, 84 redirect rules generated, all 38 AromaPassions listings visible via `getRankedDupesFor()`, 0 flagged verbatim.
2. ~~**Images for the 24 new listings.**~~ — **DONE 2026-09-07, and the diagnosis that used to sit here was wrong.** This item claimed the script "regenerates the whole manifest, so it needs `opulensi.csv` and `clone-of-perfume.csv` present too". It does not. It needed exactly one feed — `aromapassions.csv` — and that file was on disk the whole time, which is why the gap sat for two days behind a wrong explanation.

   The real blocker was ordering inside `scripts/fetch-dupe-images.mjs`: the loop read a merchant's feed *before* checking whether the image was already downloaded, so the expired Opulensi export made `loadFeed()` throw on the very first entry and killed the run — even though all 53 of those images were already present and every one of those entries would have been skipped a line later. The loop now checks the filesystem first and treats an unreadable feed as **that merchant's** failure, reported per-slug, rather than the run's. **A script serving several merchants must degrade to the ones it can still serve**, because feeds are gitignored and expire.

   All 24 images came from the **live-page fallback**, not the feed — every `merchant_image_url` in that export 404s, exactly as the first 14 did on 2026-09-04. That rescue path is doing the primary work for this merchant, not covering an edge case.
3. ~~**The scoring decision.**~~ — **DONE 2026-09-08.** See the section above for what shipped and what it measured. The follow-on that is *not* done: **ingredient/INCI data for the 65 referenced originals and 79 dupes** (~144 lookups with overlap), which is what activates the new 15% component. Source it from each merchant's own product page under the standing rule — attribute or verify against something the seller cannot spin, never invent. AromaPassions already publishes ingredient lists on some products and is the natural first pass.
4. ~~**Brand-alias mapping**~~ — **done in A2.** The alias cases (`MFK`, `CH`, `DG`, `D.`, `INTIO`, `MRLY`, `GIVNCHY`, `ROJA`) were resolved by matching on the reference *name* with word boundaries and requiring brand confirmation only for short names; `fahrenheit`, `elysium`, `light-blue`, `delina`, `l-homme`, `y`, `poison` and `la-vie-est-belle` all shipped from it.
5. **~32 missing originals.** Real, famous fragrances with publicly documented pyramids (Noir Extreme, 1 Million, A*Men, Musc Ravageur, Portrait of a Lady, Luna Rossa Ocean, Jubilation XXV, Philosykos, Do Son, Acqua di Gioia, Black Afgano, Grand Soir, MFK 724…). Each unlocks exactly one AromaPassions listing. **Chanel No 5, Coco Mademoiselle and Delina were on this list and should not have been — we hold all three**, and No 5 and Delina now carry listings; Coco Mademoiselle is held, uncovered, and blocked only by the split problem in item 3 (see the project CLAUDE.md on SEDUCTIVE). Re-check the catalogue before adding a name here. **Research them properly — do not create placeholder references.** A reference carries the note pyramid and facets the score is computed from, so a dummy publishes a meaningless percentage about a real company's product on a live, indexed page. Note also that a CJ feed cannot fill this gap: feeds supply names, prices and images, never note pyramids.
   Two claims in that list must never become references: `Designer Brands` (a category label, not a fragrance) and `LAKESIDE MORNING by BBW`.
6. ~~**Wire the CJ merchants for the originals side**~~ — **DONE 2026-09-07, FragranceShop.com.** The feed arrived and the whole originals side is live. Before this, all 200 references declared `affiliateLinkId: "original-<slug>"` and **not one resolved**; `/go/` now resolves **252** ids (116 `original-*`, 59 `shop-*`, 77 `dupe-*`).

   **What shipped:** the founder's buy-link scope — **EDP or Parfum, over $100, never EDT or EDC** — is 103 products and **all 103 are linked**. A new `/originals` page lists them with price, photograph and buy link and nothing else, because the feed carries nothing else. **17 references were added with researched pyramids** (200 → 216), and the "Nx cheaper" comparison now runs on **the retailer's own price** rather than our approximate-retail figure. Reference imagery went 156 → **190**, with 116 re-sourced off the dead My Perfume Shop programme onto a live one. Full write-up in `products/affiliate-sites/fragrance-dupes/CLAUDE.md`.

   **Three silent mis-links were found and fixed**, all the same shape: the merchant's `<Name> <Gender tag> - <Format> <Size>` grammar puts the word "Cologne" in the gender tag, so `cologne` is a noise word — and it was being absorbed when it was part of a product NAME. We were linking **Viking Cologne as Viking**, **Aventus Cologne as Aventus**, **Eternity Cologne as Eternity**, and **Le Male Le Parfum as Le Male** (that last via `le` + `parfum`; FragranceShop stocks no plain Le Male at all).

   **What is left:**

   - **Confirm `sid` once in CJ's click report.** CJ obfuscates the forwarded query, so only the `cjevent` token is checkable from here. Same one-off founder check already done for Awin 117395.
   - **Perfumania** — the second CJ approval. **Feed delivered 2026-09-08 and NOT the catalogue we need**, so this item did not advance: the export is Perfumania's own house dupe line (66 rows, no third-party brand), not its designer stock, and it covers none of the ~100 references FragranceShop does not stock (no Chanel, Parfums de Marly, Byredo, Le Labo, Xerjoff, Initio, By Kilian, Amouage, Roja, Jo Malone or Louis Vuitton anywhere). Full analysis and four ingest traps in `scripts/feeds/README.md`. **Nothing is wired from it and nothing should be** — no row declares an inspiration, so its products cannot become dupe listings without inventing the mapping.
   - **59 shop-only products have no comparison page.** Adding one means hand-authoring a note pyramid; the feed cannot supply it. `node scripts/ingest-cj-feed.mjs --candidates` prints the shortlist.

7. ~~**Root `CLAUDE.md` edits**~~ — **done 2026-09-07.** The stale line 58 was fixed, and eight cross-department lessons were promoted into the root file's bullet list (repo root not gitignored; identify a vendor by domain not name; CRLF diffs and the `package-lock` side effect; assert against shipped code via esbuild; marketing copy is not product fact; attribution can live in the click cookie; feed image URLs decay; a subagent refusing a brief is a success mode). Kept to one line each — task 179 records that this file is a real per-session context cost.

## Two retailers per bottle, shipped 2026-09-09

`getOriginalOffers()` in `lib/catalog.ts` replaces the old single-retailer
`getOriginalOffer()` on the buy surfaces. **91 references now show both
FragranceShop.com and Perfumania.com with their own prices**, 67 of them with both
retailers quoting the exact bottle our reference records. 57 show one retailer, 68
none. `/go/` resolves **375** ids, up from 252.

Three things that are easy to undo by accident:

- **The key prefixes must stay different.** FragranceShop owns `original-<slug>`,
  Perfumania owns `pm-<slug>`. They were briefly both `original-<slug>`, which
  collided on **91 of 123 keys** - `affiliateLinks` is one flat map, so the spread
  order silently decided which retailer survived and the other's links vanished with
  no error anywhere. Two retailers per bottle is the whole point; one key cannot hold
  both.
- **`scripts/generate-redirects.mjs` now reads THREE files.** A fourth link source
  must be added there too or its buttons resolve in the UI and 404 at the edge.
- **Retailers are deliberately NOT ranked and nothing says "cheapest".** A price is
  only comparable when both retailers quote the same bottle, and 24 of the 91 pairs
  do not. The page says so in words rather than sorting on a figure that is sometimes
  null and sometimes a different size.

Verified live, not assumed: `/go/pm-sauvage` lands on Perfumania's Dior Sauvage page
carrying `SID=pm__sauvage`, `AID`, `PID` and a `cjevent` token.

**What did NOT happen, and why - the "90 pyramids" is a false lead.** Perfumania's
storefront tags carry a full three-tier pyramid on 90 of the 123 matched references,
which reads like 90 fragrances to add. **All 90 already have our own researched
pyramid** - the merchant data is redundant there, not new. The genuinely new pool is
the **1,707** pyramid-bearing storefront products that are not in our catalogue, and
that pool should not be bulk-imported: **59% of this merchant's own duplicate SKUs
disagree with themselves about the pyramid.** Paco Rabanne 1 Million has four SKUs
carrying four different pyramids, three of which are wrong. Importing them would
publish false note data about real products on indexed pages - the exact failure the
placeholder-reference rule exists to prevent. Use them as a research starting point a
human verifies, never as a source.

## The Perfumania shop surface, shipped 2026-09-09

`/originals` is now a TWO-MERCHANT page: **348 products across 50 houses**, 103 from
FragranceShop.com and **245 from Perfumania.com**, every card naming its own shop.
96 of them link to a full comparison here; the rest are price-and-availability only,
which the page says in words. `/go/` resolves **620** ids.

Verified live: `/go/pmshop-creed-aventus-cologne-mens-eau-de-parfum` lands on
Perfumania's Creed Aventus page carrying `SID=pmshop__...`, `AID`, `PID` and a
`cjevent` token.

**Perfumania's scope is narrower than FragranceShop's, on purpose.** Same founder
rule (EDP or Parfum, over $100, no testers/sets), plus two exclusions that merchant
needs and the other did not:

- **Its own private-label brands**, the nine names in its "Like product feed" - that
  feed IS the house dupe line, so each is proven in-house by the merchant's own data
  rather than by our guess.
- **Houses our reference catalogue does not already cover.** 413 products clear price
  and concentration; **193 come from a house we have researched**. The remainder
  include names we cannot tell from a retailer's private label without research we
  have not done - Michael Malul, Daniel Josier, Camille Rochelle, NOTEZ, Patek
  Maison, Thauy, 93 Mil - and the page calls its contents "genuine designer
  fragrances". Widening this later is a decision with evidence behind it; taking it
  by default is not.

One thing worth knowing about the price rule: the scope test is the **cheapest**
variant, not the cheapest one above $100. A bottle sold at $80 and $120 passes the
looser test and would then be shown at $120 - quoting a higher price than the shop's
own entry price for the same fragrance.

A pre-existing defect surfaced and was fixed: FragranceShop files two products under
"Maison Francis **Kurkdijan**" and one under the correct spelling, so the brand index
grew two headings for one perfumer. `BRAND_TYPOS` in `lib/catalog.ts` normalises it.
That map is for provable typos only - merging two brands that are actually different
companies is the `fragranceshop.com` / `thefragranceshop.com` mistake in a new
costume.

**The merchant's note tags stay unused, and this is now measured rather than
suspected.** Against the 90 fragrances where we hold a researched pyramid AND
Perfumania publishes one, the two agree on only **0.57** of the materials named -
before asking which tier they sit in. Only 5 of 90 match exactly; 19 fall below 0.4;
one shares nothing at all. Separately, **59% of the merchant's own duplicate SKUs
contradict themselves** (Paco Rabanne 1 Million carries four different pyramids
across four SKUs). Neither number supports publishing their notes as fact about a
real product.

## The retailer band, and the disclosure page that was lying, 2026-09-09

The home page now carries a slow band naming the five retailers we earn from:
Opulensi, Clone of Perfume, AromaPassions, FragranceShop.com, Perfumania.com. Three
things about it are load-bearing and none of them is cosmetic.

**It is a disclosure, not a logo wall.** The heading reads "We earn a commission from
these retailers" and the band carries NAMES, not brand marks. It must never become
"Partners", "Sponsors" or "As featured in": none of these companies has reviewed
anything here, several of them sell products this site rates against each other, and
an affiliate agreement grants no logo rights. `shared/clients.md` records that
Sirketim has no third-party clients at all, so there is nobody whose logo could
legitimately appear. Framed honestly the band strengthens the independence claim;
reframed as a partner strip it would assert an association we do not have.

**The list is derived, never typed.** `lib/merchants.ts` reads the shipped link map
and a merchant appears only while at least one of its links actually resolves. My
Perfume Shop (Awin 106089) is the reason that matters: still enrolled, still feeding
data, every link dead. A hand-typed list would keep advertising it, which is the
direction that flatters us. An id in the link map with no registry entry throws at
build time rather than quietly under-reporting who pays us.

**`/disclosure` was asserting the opposite of the truth, live.** It said Counterscent
had joined no affiliate programme and that there were no affiliate links on the site
at all, while 5 retailers and 620 redirects were shipping. It now renders the same
derived list, so the two cannot drift apart again. Worth auditing any other page that
states a fact about the BUSINESS rather than about a fragrance - that was the only
one checked.

**Reduced motion needed its own rule, and a screenshot caught the second bug.**
`app/globals.css` sets `animation-iteration-count: 1` globally under
`prefers-reduced-motion`, which for a looping marquee means it completes instantly
and parks the track at -50%: half the names shoved off-screen with no motion to
explain why. `.marquee-track` therefore kills the animation AND resets the transform,
and the track wraps instead. That fix exposed a second one visible only in a rendered
screenshot: the duplicate run that makes the loop seamless was still painting once
wrapped, printing every retailer twice. Hence `.marquee-dup { display: none }` under
the same query. Verified on the live site at 1280, 390 and under reducedMotion:
10 visible names while animating, 5 when not.

## Founder actions still open

No agent can do any of these. The numbered list in `FINALIZATION-GUIDE.md` is the canonical copy; this is the short form.

- **Deep linking on Perfumania is SETTLED - only a real sale is still outstanding.** Resolved 2026-09-09 from CJ's own artifact rather than by reasoning: the `anrdoezrs.net/am/101873278/include/joined/impressions/page/am.js` include CJ generates for our publisher id is scoped `domains=['perfumania.com','www.perfumania.com']`, and the `joined` path segment means CJ built it for an advertiser we are enrolled with that supports deep link automation. So **17335854 permits deep linking.** Our URL shape is also not an invention - `dpbolvw.net/click-101873278-17335854?url=...` is the exact format CJ delivered in that merchant's own feed. **Clicks show in CJ's dashboard graphs** (founder confirmed 2026-09-09); the SID *breakdown* appears against transactions, so the last unknown - does a purchase through one of these links actually pay - **cannot be answered without a sale**, and no amount of further checking will change that. Stop spending sessions on it. Asking Perfumania for a full designer feed remains optional, not blocking.
- **Apply to FragranceX (CJ 1024283).** Still the better fit for the niche houses Perfumania carries at zero SKUs — Chanel, Initio and Roja account for 9 of the 20 references still without a photograph.
- **Confirm the CJ `sid` for 16941446 on the first real transaction, not in a click report.** The click report shows clicks but the SID breakdown lands against transactions, so this is not a check that can be done ahead of a sale - the earlier wording here implied it could be, and that sent a session looking for a report that does not exist. `cjevent` is already verified end to end for both advertisers.
- **`parfumoza.com` still needs removing** from the Cloudflare account and the Worker's Domains & Routes. Dead since the 27 Aug rename, auto-renew off.
- **9 affiliate applications were pending** and are not tracked anywhere in the repo. Worth recording which, so the next session does not re-apply or re-research them.
- **Supply the Hostinger receipt** (amount, currency, auto-renew state). `hostinger-billing` is deliberately not configured, so the ledger records nothing about this project until you provide it.

## Two traps this session paid for

**I asserted a product format from marketing copy and nearly published it 15 times.** Every AromaPassions title contains "Essential Oil Fragrance", so I briefed them as oil concentrates and asked for the score to reflect the weaker format. Their own product pages list `alcohol` and never say alcohol-free, roll-on or oil-based; they are ordinary 50/100 ml sprays. A subagent refused the brief rather than writing fifteen invented format claims about a real company — the correct call. The same trap caught the other direction the same day: these are marketed as "Pheromone Perfume", which we correctly refuse to repeat. Both are seller claims. Attribute them or verify them against something the seller cannot spin.

**A wrangler preview left orphaned `workerd.exe` processes holding a lock on `out/`,** so `rm -rf out` failed with "Device or resource busy" and the deploy rehearsal could not run. Kill `workerd.exe` and stray `serve`/`wrangler` node processes before rebuilding. Documented in the project CLAUDE.md, hit anyway.
