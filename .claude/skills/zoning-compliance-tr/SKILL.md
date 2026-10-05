---
name: zoning-compliance-tr
description: Read and apply Turkish zoning and building rules to a parcel with citation discipline, and turn them into an auditable constraint ledger. Covers the imar durumu, plan notları (plan hükümleri), 3194 İmar Kanunu, Planlı Alanlar İmar Yönetmeliği, Otopark, Yangın, TBDY deprem, Sığınak and Enerji Performansı, plus getting the real parcel outline from TKGM. Use before any design or CAD work on a Turkish parcel, whenever a regulation article or plan-note item is about to be cited, and whenever someone asks whether a bonus, exception or emsal exclusion applies.
---

# Turkish zoning compliance (imar mevzuatı)

Zoning fixes what can be built before any design decision is made, so every Turkish project starts here. Errors in this area are rarely about not knowing a rule. They come from **applying it carelessly**:
- a bonus assumed without checking its conditions
- an article cited from memory that turns out to say something else
- a long plan-notes document skimmed rather than read item by item

The method below prevents all three. Our own example is the 377/1 work of 2026-08. A claimed KAKS bonus had never been checked, and two plan-note items (4.2.41 and 4.2.55) were cited for rules they don't contain. The corrective item-by-item read, `departments/architecture/clients/377-1/notes/plan-notes-brief.md`, is a good model for any parcel.

For the regulation figures themselves (room minimums, stairs, doors, lifts, fire, shelter, energy, 2026 unit costs), see `architecture-expertise/reference/09-regulation-quick-reference.md`. This skill is the method for applying them.

Everything produced here is **research to verify with the municipality, not a legal determination**. Department scope rules apply (`departments/architecture/CLAUDE.md`): no compliance claims, no stamps, no approval-stamp language.

## 1. Which source governs

1. **3194 sayılı İmar Kanunu**, the law itself.
2. **National regulations under it.** The Planlı Alanlar İmar Yönetmeliği is the default for planned areas. The Otopark, Yangın, TBDY, Sığınak and Enerji Performansı regulations apply alongside it.
3. **A büyükşehir or municipal imar yönetmeliği**, where one exists and is still in force. İstanbul, Ankara, İzmir, Bursa and others have one (see the index below). For Kocaeli, start at kocaeli.bel.tr "Konu Yönetmelikleri" and confirm the document is current before using it.
4. **The uygulama imar planı (1/1000) and its plan notları.** Parcel-specific rules usually live here.
5. **The imar durumu belgesi**, which is the municipality's statement of this parcel's figures.

Don't assume the order of priority. Plan notes normally state their own relationship to the national regulation. For example, 377/1's item 1.1 falls back to upper-tier rules where the plan is silent, and item 4.1.1 gives the plan priority. Find and quote that item first.

Also check the imar durumu for **overlays** that can override everything above:
- SİT or koruma alanı
- Kıyı (shore) lines
- Airport obstacle limits (havalimanı mania)
- Highway setback (karayolu yapı yaklaşma)
- Stream protection (DSİ dere koruma)
- Forest boundary (orman sınırı)
- Geology zone (e.g. ÖA-5.1) and its etüt conditions
- Disaster-risk area (afet riskli alan)

## 2. Source index (canonical URLs checked 2026-10-05)

| Source | MevzuatNo / Tür | Text |
|---|---|---|
| 3194 İmar Kanunu | 3194 / 1 | https://www.mevzuat.gov.tr/MevzuatMetin/1.5.3194.pdf |
| Planlı Alanlar İmar Yönetmeliği (RG 03.07.2017 / 30113) | 23722 / 7 | https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=23722&MevzuatTur=7&MevzuatTertip=5 (PDF: `/MevzuatMetin/yonetmelik/7.5.23722.pdf`) |
| Plansız Alanlar İmar Yönetmeliği | 4882 / 7 | `mevzuat?MevzuatNo=4882&MevzuatTur=7&MevzuatTertip=5` |
| Otopark Yönetmeliği (RG 22.02.2018 / 30340) | 24408 / 7 | `mevzuat?MevzuatNo=24408&MevzuatTur=7&MevzuatTertip=5` |
| Binaların Yangından Korunması Hakkında Yönetmelik (BKK 2007/12937) | 200712937 / 21 | https://www.mevzuat.gov.tr/MevzuatMetin/21.5.200712937.pdf |
| Türkiye Bina Deprem Yönetmeliği (RG 18.03.2018 / 30364 mük., in force 01.01.2019) | 24468 / 7 | `mevzuat?MevzuatNo=24468&MevzuatTur=7&MevzuatTertip=5` |
| Sığınak Yönetmeliği | 4883 / 7 | `mevzuat?MevzuatNo=4883&MevzuatTur=7&MevzuatTertip=5` |
| Binalarda Enerji Performansı Yönetmeliği | 13594 / 7 | `mevzuat?MevzuatNo=13594&MevzuatTur=7&MevzuatTertip=5` |
| Büyükşehir imar yönetmelikleri (Tür 7) | İstanbul 24601, Ankara 24656, Bursa 24623, İzmir 38661, Sakarya 38988, Adana 39703, Antalya 39787 | same URL pattern |

Short paths are relative to `https://www.mevzuat.gov.tr/`.

- **TSE standards are paid documents**, not on mevzuat.gov.tr: TS 9111 (accessibility) and TS 825 (thermal insulation) among them. The regulations point to them. Never quote one from memory. Say it was not read.
- **Fetch the current text with WebFetch every time you cite it.** These regulations are amended often, so record the URL and the fetch date. mevzuat.gov.tr is blocked from the cloud container (2026-10-05) but reachable from the founder's machines, where the 377/1 work fetched it. If a fetch fails, the citation is **UNVERIFIED**. Write that word instead of an article number from memory.

## 3. Output: the constraint ledger

Put one table in the client's notes, one row per constraint, before any design starts:

| # | Constraint | Value | Class | Source doc | Item / Madde (fıkra, bent) | Exact quote (Turkish) | Applies? why | Read on |
|---|---|---|---|---|---|---|---|---|

The **Class** column takes one of these values:
- **stated:** printed on the imar durumu or plan.
- **derived:** computed from stated figures. Show the formula, e.g. `TAKS 0.25 × 713.26 = 178.32 m²`.
- **fallback:** taken from an upper-tier rule because the local one is silent. Cite both the fallback item and the article.
- **assumed:** a design judgement. Never present it as a rule.
- **missing:** a blocker. Ask; don't fill it in.

## 4. Plan notes: an item-by-item disposition, never a skim

1. **Read the whole document once, end to end.** Then do a second pass hunting only for things that change the envelope:
   - bonus emsal or extra floors
   - height bonuses
   - setback relaxations
   - parking exceptions
   - emsal-exclusion methods
   - allowed ground-floor uses
2. **Test every numbered item** against the parcel's own facts, in this order. Answer each test from a document:
   - **Geography:** the mahalle, ada, mevki, lejant or zone the item names. 377/1's items 2.5, 2.7 and 2.8 named other mahalles, and 2.1 another belde.
   - **Use:** Konut, Konut+Ticaret, Ticaret and so on. 377/1's h/2 rear-setback formula (4.2.10) was scoped to mixed-use blocks, so it did not apply to a pure Konut Alanı.
   - **Building facts:** nizam (ayrık/bitişik/blok), kat adedi, TAKS thresholds, frontage road width, corner parcel, parcel size, unit count.
   - **Project type:** new build, or addition/renovation.
   - **Time:** plan approval date and the dates of amendments.
3. **A bonus is not a bonus until every one of its conditions is ticked against the parcel.** Write the conditions out. For example, 377/1's item 2.12 gave +1 floor only when the zoned TAKS was ≥ 0.30. The parcel's TAKS was 0.25, so the bonus did not apply, and it would not have added KAKS anyway.
4. **Expect duplicate numbering and amended items.** 377/1's plan notes used "4.2.17" twice, for two unrelated rules.
5. **Record the result** as an appendix table: `Item | What it says (short) | Applies / Not applicable (failed test) / Bonus checked (result)`.

## 5. Citation discipline

- **Cite only text read this session,** or text already quoted with a fetch date in the project's notes. Quote the sentence.
- **Cite to the finest unit.** Write "Planlı Alanlar İmar Yönetmeliği Madde 23(1)(c)", not "Madde 23".
- **Re-read the article and check it says the claim before writing "(Madde X)".** The 377/1 misattributions were exactly this:
  - 4.2.41 is a hallway-width rule, but it was cited as duplex support.
  - 4.2.55 is an elevator-shaft size rule, but it was cited as the mandatory-elevator threshold.
- **When sources disagree,** report both sides and which one governs according to the documents' own priority clause.
- **Don't promote a figure from one parcel to a general rule.** Numbers found for 377/1 are that parcel's numbers.

## 6. Calculations that go wrong quietly

- **Parcel area.** The imar durumu's GIS area is not the deed area. "Tapu alanı esastır" means the deed governs, so reconcile the two and flag it if no tapu has been provided.
- **TAKS** is taban alanı ÷ parsel alanı. What counts as taban alanı (çıkmalar, sundurma, basement projections) comes from the definitions article and any local item. Read both.
- **KAKS / emsal:**
  - Compute the emsale esas alan with the **official exclusion method**, meaning the regulation's emsal-harici list plus any local method. 377/1's item 4.2.17 excludes shafts and up to 20% of certain areas.
  - Itemize space by space. **Never exclude a whole level by assumption.** 377/1 did that with the basement, and it is flagged as a simplification.
- **Height:**
  - Kat adedi, Hmax in metres and gabari are different limits.
  - Height is measured from the kotlandırma rules and the kırmızı kot, which comes from a plankote. Without one, the datum is a placeholder; say so.
  - Roof and mahya limits are separate rules.
  - Setbacks can grow with height. For 377/1, Madde 23(1)(ç) +0.50 m per floor above 4 was read and found not triggered. Re-read it for any other building.
- **Parking.** Use the Otopark Yönetmeliği Ek-1 rate plus any local otopark decision. The regulation itself anticipates local overrides (Madde 8(2), as recorded for 377/1). Stall, aisle and accessible-stall minimums were recorded in 377/1's `notes/rationale.md` §11. Re-read them before reuse.
- **Basement and roof.** Whether a basement or a çatı piyesi counts toward kat adedi or emsal depends on its use, its exposure and local items. For 377/1 those were 2.9, 4.2.1, 4.2.32, 4.2.60/61 and Madde 40(7). Check each one, not the category.

## 7. The parcel outline: from TKGM, not from a drawing's proportions

377/1's lot was a 36.02 × 19.80 m rectangle estimated from a plotted schema. Don't repeat that. Here is the free route:

1. **Download the polygon.** The founder (or a browser session) opens TKGM Parsel Sorgu at https://parselsorgu.tkgm.gov.tr and queries il / ilçe / mahalle / ada / parsel. "İndir" offers GeoJSON (also KML, Shape and DXF), and there are coordinate-list and edge-length tabs. Keep the file next to the other source documents, outside the repo. The parcel is public cadastral data, but the repo is public and only derived dimensions belong in it.
2. **Convert it:**
   ```
   pip install pyproj
   python .claude/skills/zoning-compliance-tr/scripts/parcel_to_local.py parsel.geojson
   python .claude/skills/zoning-compliance-tr/scripts/parcel_to_local.py parsel.geojson --front-side north --official-area 713.26 --json lot.json
   ```
   - The first run lists the edges and refuses to guess the street side.
   - Take the frontage from the imar durumu: the road side, or `--front-edge <i>`.
   - The zone is derived from longitude. Cross-check it against the "dilim / D.O.M." on the imar durumu (377/1: 3° dilim, D.O.M. 30 → TM30, EPSG:5254).
3. **Validation on record.** The projection reproduces 377/1's official midpoint coordinates (Y=471859.39, X=4507411.51) within 1 cm. On synthetic parcels, a 36.02 × 19.80 m rectangle comes back exact and a trapezoid is flagged as not a rectangle.
4. **Area check.** More than 0.5% off the official area means the wrong parcel, the wrong zone, or a deed-vs-GIS difference. Resolve it before use.
5. **Legal status.** TKGM's online geometry is informational. The legal outline for a permit is the aplikasyon krokisi or plankote from a licensed surveyor. Put "TKGM, informational" in the `source_note`.
6. **Library limit.** `lib/cadgen`'s `LotGeometry` is rectangle-only. If the script reports the lot is not a fair rectangle, say so. Do not force it.

## 8. Stop and ask instead of guessing

Stop when any of these is true:
- No plankote or kırmızı kot.
- No tapu area.
- A blank setback with no fallback that resolves it.
- An item whose applicability turns on a fact you don't have, such as which zone or whether the block is mixed-use.
- Two documents disagree and neither states priority.
- A regulation text could not be fetched.

## 9. Hand-off

The ledger and the disposition table go into `clients/<slug>/notes/`. Then:
- Design decisions go through the `design-reasoning` skill.
- Drawings go through `lib/cadgen` and its mandatory `verify_compliance*()` pass.
- DWG production and QA go through the `autocad-drafting` skill.
