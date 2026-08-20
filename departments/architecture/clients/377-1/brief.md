# Project Brief — Parcel 377/1, Ereğli Mah., Karamürsel, Kocaeli

**Date**: 2026-08-20 (multi-level pass); originally 2026-08-20 single-level pass.
**Status**: Internal Sirketim-owned capital project (the founder's own building — not a third-party client, see `CLAUDE.md`). Schematic depth tier. As of the multi-level pass, all 5 levels (bodrum + zemin + 3 normal kat + çatı piyesi) have concrete DXF/SVG/DWG geometry, not just the ground floor — see `notes/rationale.md` for the full compliance-verification results across every level. The full production set (sections/elevations/door-window schedules/finish specs/furnishing layout) is still not built.

**SUPERSEDED, not rewritten (2026-08-20, later same-day pass)**: the room program below still describes the original single-family-residence framing. The building has since pivoted to a 6-unit apartment building (shared stair/elevator core, 2 apartments per floor) — see `CLAUDE.md`'s "Room program" section for the current program and `notes/rationale.md` §9 for the full design reasoning (core placement, unit-count tradeoff, reverse-duplex verdict). This file is kept as-is below for the historical record of the single-family pass's own reasoning (still valid as *general* zoning-research background — §2's citations are unchanged), not as a current description of the building. A full rewrite of this brief to the apartment-building program is real, not-yet-done follow-up work.

---

## 1. Site summary

713.26 m² (GIS figure; deed governs, not yet reconciled — no tapu provided), rectangular-ish detached (ayrık nizam) residential parcel, single frontage north onto the 12m-wide Selçuk Bey Caddesi. Zoned Konut Alanı, TAKS 0.25 / KAKS 1.00 / Kat Adedi 4, in Karamürsel İlçesi's approved 1/1000 uygulama imar planı (tasdik 13.01.2022/50). Full constraint table in `CLAUDE.md`.

## 2. Zoning research (flagged as research to verify against the actual jurisdiction — not a legal determination)

All figures below are read directly from the three provided source documents plus the current national **Planlı Alanlar İmar Yönetmeliği** (fetched from mevzuat.gov.tr this pass — RG 3/7/2017-30113, the operative successor to the 1985 "Planlı Alanlar Tip İmar Yönetmeliği" the local plan notes name; the 1985 version was repealed 1/10/2017 per the current regulation's own Madde 70). Every figure is cited to a specific document and item/madde number in `notes/rationale.md`. **This is department research to verify with Karamürsel Belediyesi before any real design proceeds — not a legal determination, and not permit-ready.**

Two items the founder specifically asked to be chased down this pass:

- **Basement floor count**: resolved primarily from LOCAL plan notes (items 2.9 and 4.2.60/4.2.61), which explicitly cover this — no need to fall back to the national regulation for this specific question. Net result: 1 occupied/habitable basement floor is the standard allowance without reducing upper floors (4 above-grade + 1 basement = 5 total occupied floors); more basement floors are allowed without that trade-off specifically when dedicated to parking (own-need or commercial) or ancillary/service space for certain institutional building types (not applicable to plain residential habitable space, but directly relevant if part of the basement is built as parking, which is the realistic real-world choice here). See rationale.md for the one remaining uncertainty (whether item 2.9's D-130-north geographic scope technically covers 377/1) and why it doesn't change the practical answer.
- **Rear setback**: resolved via the national **Planlı Alanlar İmar Yönetmeliği** Madde 23(1)(c) = 3.00 m, since the local plan notes' own item 1.1 directs exactly this fallback for anything the plan/plan notes don't cover, and the one local rear-setback formula found (item 4.2.10) is confirmed inapplicable (scoped to mixed residential+commercial blocks; 377/1 is pure residential).

## 3. Room program

Real space-planning judgment applied (adjacency, circulation efficiency, natural light/ventilation orientation, minimum comfortable sizes) — this is the department's own design proposal, not a client-supplied program (none was provided; the founder explicitly asked the team to derive one). Sized against **Planlı Alanlar İmar Yönetmeliği** Madde 29's mandatory minimum room dimensions (dar kenar / net alan) and Madde 32's natural-light rule (living room + all bedrooms need a direct exterior window). Framed as a single-family residence occupying the whole building across all levels (not subdivided into separately-titled apartments) — a reasonable default absent an explicit client brief on unit count/ownership structure, flagged as a team assumption open to revision.

Floor-to-floor heights per plan notes item 4.2.4 (residential default, used since the plan doesn't specify greater values): zemin kat 4.00 m, normal katlar 3.50 m each, bodrum kat 4.80 m.

### Bodrum Kat (Basement) — service/amenity, not full habitable bedrooms — **now drawn as concrete geometry** (`cad/377-1-bodrum-kat.{dxf,svg,dwg}`); room areas below are the department's own schematic estimates (brief did not originally specify m², see `notes/rationale.md`)

Kept as service space rather than full bedrooms deliberately: basement daylight is always compromised, and Madde 32/plan notes item 4.2.59 require any *habitable* basement room (living room, bedroom) to have a real exterior window with limited burial depth (≤0.90m) — easier to satisfy on the ground floor instead, where those mandatory rooms are already programmed.

| Space | Program tag | Notes |
|---|---|---|
| Kapalı Otopark (1–2 car) | parking | Excluded from TAKS/KAKS entirely per plan notes item 4.2.1 / national Madde 22(1)(h) — a real cost/area win |
| Mekanik/Tesisat Odası | mechanical | Heating plant, water tank (Madde 27, Madde 36) |
| Depo/Kiler | storage | ≤4 m² per unit if treated as the item-4.2.1 excluded depo allowance |
| Çamaşır Odası | laundry | |
| Çok Amaçlı Oda | flex/rec | Modest size, acknowledges reduced daylight; not a legal bedroom |
| Sığınak | life-safety | Sized properly against the Sığınak Yönetmeliği at full-design stage — not sized schematically here |

### Zemin Kat (Ground Floor) — drawn as concrete geometry, unchanged from the single-level pass (`cad/377-1-zemin-kat.{dxf,svg,dwg}`, renamed from `377-1-ground-floor.*`)

Entry/social level, oriented so the living/kitchen zone can face away from the street for privacy and toward the rear garden for light. Carries the two Madde 29 mandatory ground-adjacent pieces (oturma odası, and effectively the household's primary WC) plus the mandatory Madde 34 elevator core (Kat Adedi=4 → elevator is mandatory, not just a reserved shaft).

Concrete geometry consolidates this into 4 zones (see §4 below for why):

| Space (as generated) | Target net (m²) | Actual drawn (m²) | Program tag |
|---|---|---|---|
| Giriş + Merdiven/Asansör | 24.0 | 26.15 | circulation |
| Salon (living/dining, open plan) | 48.0 | 52.29 | living |
| Mutfak | 22.0 | 23.75 | kitchen |
| Servis (Misafir WC + Depo) | 14.0 | 15.17 | service |

Fuller conceptual breakdown this consolidates (for a future multi-row layout pass, not drawn individually this time): Antre, Salon, Mutfak+Yemek nook, Misafir WC (≥1.20 m², Madde 29), utility/coat closet, stair+elevator core (shaft ≥1.60m dar kenar / ≥3.00 m² per Madde 34(2), local item 4.2.55 agrees).

### 1., 2., 3. Normal Kat (Typical Upper Floors — bedroom/private zone) — **now drawn as concrete geometry** (`cad/377-1-1-normal-kat.{dxf,svg,dwg}`, `...-2-normal-kat...`, `...-3-normal-kat...`), identical program on all three floors

| Space | Target net (m² each) | Program tag | Note |
|---|---|---|---|
| Yatak Odası (master) | ~17 | bedroom | ≥9.00 m² / 2.50m dar kenar minimum (Madde 29); ensuite optional |
| Yatak Odası ×2 | ~11 each | bedroom | Direct exterior window each (Madde 32) |
| Banyo/Aile Banyosu | ~5 | bath | ≥3.00 m² (Madde 29) |
| Hol | — | circulation | ≥1.20 m width (Madde 29(3), local item 4.2.41 agrees) |
| Balkon (off primary bedroom) | — | exterior | ≤1.20m projection into rear/side setback, ≥2.00m off the property line (local item 4.2.46) |

Wet zones (kitchen below, bathrooms above) kept vertically stacked floor-to-floor for plumbing-riser efficiency — a real adjacency call, not incidental.

### Çatı Katı / Piyes (Roof) — **now drawn as concrete geometry** (`cad/377-1-cati-piyesi.{dxf,svg,dwg}`); room breakdown/areas below are the department's own schematic estimate (brief did not originally itemize this level, see `notes/rationale.md`)

Pitched roof, max 45% pitch, mahya (ridge) ≤5.50m above the top floor's slab (plan notes item 4.2.32 — more generous than the national Madde 40(4) default of 5.00m; local governs since it's an explicit stated figure). Roof-level piyes connected only to the top-floor unit (cannot form an independent unit, Madde 40(7)); could house a small roof terrace plus mechanical/solar equipment enclosure. Not counted as a 5th above-grade "kat" against Kat Adedi=4.

## 4. Concept narrative

The building sits toward the front of its buildable envelope (anchored to the 5m front setback line, per `lib/cadgen`'s current footprint-placement convention), banking the large remainder of the lot's depth as rear yard — the site's generous depth relative to the modest TAKS-capped footprint (max 178.32 m² vs. an 11.8m-deep × 30.02m-wide setback envelope of 354.27 m²) means TAKS, not the physical envelope, is what actually constrains the footprint. A single-family house across 5 levels (basement + 4 floors) comfortably fits the KAKS 1.00 allowance (713.26 m² total) without needing anywhere near the full footprint on every floor.

**Update (multi-level pass)**: `lib/cadgen/plan.py` was extended this pass with `generate_multilevel_plan()`, `LevelSpec`, `compute_footprint_fitted()`, and `verify_compliance_multilevel()` — the single-level limitation above is closed. All 5 levels now have concrete DXF/SVG/DWG geometry. See `notes/rationale.md` for the full account, including a genuine new simplification introduced to make this work: each level is footprint-sized independently from its own room program (same philosophy `compute_footprint()` already used for the single ground floor), rather than a real building's single consistent structural footprint stacked floor-to-floor — flagged there as a real, documented gap versus true structural realism, not silently smoothed over.

**Still true, unchanged from the single-level pass**: the generator's only layout algorithm (single-row bay-slicing) forces every room on a level to share one depth — at the ground floor's resulting ~4.2m bay depth, a small standalone room (e.g., a bare guest WC at ~3 m²) would come out as an unrealistic sliver, so the concrete ground-floor realization consolidates into 4 larger zones rather than every individual room in the fuller conceptual breakdown. This is a genuine, current gap in the library, not something silently worked around.

## 5. Open questions

1. **Client-registration status — resolved.** 377/1 is the founder's own building-firm capital project, not a third-party client engagement — corrected in `shared/clients.md` and `CLAUDE.md` (was briefly mislabeled "client engagement" during an earlier pass).
2. **Tapu (deed) document** — not yet provided. The 713.26 m² figure is the GIS/current-system figure; both source documents explicitly flag that the deed's own stated area governs if it differs.
3. **Kırmızı kot (red grade line)** — no plankote document provided. A placeholder datum (0.00m absolute) was used, clearly labeled; ground-floor elevation and true building height cannot be finalized against the real site without this.
4. **Parcel boundary precision** — the 36.02m × 19.80m rectangle used is a visual-proportion estimate off the plotted İmar Durumu schema, not a surveyed dimension. An Arsa Aplikasyon Krokisi or Plankote (plan notes items 4.1.7/4.1.8) would be needed to firm this up to survey-grade.
5. **Basement geographic applicability of plan notes item 2.9** — could not independently confirm from available sources whether 377/1 sits north of the D-130 karayolu (the specific geographic condition item 2.9 names). Doesn't change the practical basement-count answer, since the general item 4.2.60 converges on the same result regardless — flagged for completeness.
6. **Unit program assumption** — treated as a single-family residence across all levels, not a multi-unit building. No client brief exists to confirm this; flagged as a team assumption.

---

**Every dimension in this brief and its accompanying CAD files traces back to the source documents cited above, or is explicitly labeled as a team design decision or a placeholder pending real data — see `notes/rationale.md` for the full compliance-verification results and design rationale.**

**Schematic only. Requires licensed-architect review before permitting or construction. Not a substitute for a structural/MEP engineer's calculations. No governmental review or approval implied.**
