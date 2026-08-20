# Design Rationale — Parcel 377/1, Ereğli Mah., Karamürsel, Kocaeli

**Date**: 2026-08-20. Companion to `../brief.md` and `../cad/377-1-ground-floor.{dxf,svg,dwg}`, per department convention (`departments/architecture/CLAUDE.md`, "Design rationale"). **Schematic example/practice output — requires licensed-architect review before permitting or construction; not stamped, not code-compliant in a legal sense, no governmental review implied.**

---

## 1. Input classification

Every figure driving this design falls into exactly one of three categories, stated explicitly per the founder's request:

### Confirmed from source (cite the document)
- Parcel identification, area (713.26 m², GIS/current figure — deed governs if it differs, not yet reconciled), TAKS 0.25, KAKS 1.00, Kat Adedi 4, İnşaat Nizamı Ayrık, front setback 5m, side setback 3m — `imardurumu.pdf` and `minuspalityimardurumu.pdf` (identical on both).
- Rear setback 3.00m — **Planlı Alanlar İmar Yönetmeliği** (national regulation, current text fetched from mevzuat.gov.tr, RG 3/7/2017-30113), Madde 23(1)(c), reached via `plannotes.pdf` item 1.1's own fallback instruction.
- Basement floor allowance (1 occupied floor without reducing upper floors; more allowed for parking/service) — `plannotes.pdf` items 2.9 and 4.2.60/4.2.61.
- Floor-to-floor heights (zemin 4.00m, normal 3.50m, bodrum 4.80m) — `plannotes.pdf` item 4.2.4.
- Ground-floor elevation band [0.00, 1.00]m above röper — `plannotes.pdf` item 4.2.22.
- Roof pitch/ridge allowance (≤45%, mahya ≤5.50m above top slab) — `plannotes.pdf` item 4.2.32.
- Minimum room dimensions (Madde 29 table), natural-light rule for living rooms/bedrooms (Madde 32), mandatory elevator at Kat Adedi≥4 (Madde 34) — **Planlı Alanlar İmar Yönetmeliği**.
- Parcel topology (single frontage north on Selçuk Bey Caddesi; east neighbor 377/2; south neighbor is the interior parcel 377/12, not a road; Rüzgar Sk is further south, not directly adjacent) — read directly off both plotted schemas.

### Team-derived through design judgment (the department's own call, not stated by any source)
- The room program itself (all 5 levels) — no client program was ever provided; the founder explicitly asked the department to apply real space-planning judgment.
- Treating this as a single-family residence across all levels, not a multi-unit building — a reasonable default absent any client brief on unit count/ownership.
- Basement programmed as service/amenity space rather than habitable bedrooms — a design choice that sidesteps the stricter natural-light/burial-depth rules for habitable basement rooms (Madde 32, `plannotes.pdf` item 4.2.59), not a requirement.
- The 36.02m × 19.80m width/depth split of the lot rectangle — a visual-proportion estimate off the plotted parcel schema, anchored to the confirmed 713.26 m² area but not itself a measured or surveyed figure (see §3 below).
- max_height = 14.50m (eave-level gabari estimate: 4.00 + 3×3.50, per item 4.2.4) — a derived figure, since neither source document states a Bina Yüksekliği meter value.
- ground_floor_elevation = +0.15m — a reasonable pick within the confirmed [0.00, 1.00]m band, not itself a stated figure.
- The consolidation of the ground floor's fuller conceptual room list into 4 larger drawn zones (see §4).

### Still assumed / pending real data (do not mistake for confirmed)
- **Kırmızı kot (red grade line)**: no plankote document (`plannotes.pdf` item 4.1.8's "Yol ve Arsa Kotu Tutanağı") exists among the three provided PDFs — re-confirmed this pass, not just re-flagged: `plannotes.pdf`, `imardurumu.pdf` and `minuspalityimardurumu.pdf` were all read in full again specifically hunting for an absolute site elevation, and none appears anywhere in any of the three. The generated plan uses an **arbitrary placeholder datum of 0.00m absolute** — the same convention `lib/cadgen`'s own synthetic test uses for a fictional site — and this must not be read as a real site elevation.
- Tapu (deed) document — not provided; the 713.26 m² figure is the GIS/current-system area, and both source documents themselves flag that the deed's own stated figure governs if it differs.
- Exact parcel corner coordinates/bearings — not available from either plotted document at legible resolution (see §3).

## 2. Why the building is placed and oriented as it is

- **Orientation**: long axis east-west, matching the lot's wide, shallow proportion and its single north frontage on Selçuk Bey Caddesi. Living/kitchen zone faces toward the rear of the lot (away from the street) for daylight and some traffic-noise buffering; entry and the vertical circulation core sit toward the street-facing front, where a visitor would naturally arrive.
- **Setback anchoring**: the generator anchors the footprint to the front setback line and uses the full buildable width, banking any unused depth as rear yard rather than building deeper than the program needs (`lib/cadgen/plan.py`'s documented behavior, not an accident). Here that produces a real, generous rear yard (≈10.57m as-built vs. the 3.00m minimum) — a deliberate result of TAKS (not the setback envelope) being the binding constraint on this lot: the envelope after setbacks is 354.27 m², nearly double the TAKS-capped 178.32 m² maximum footprint.
- **Vertical stacking**: basement (service/parking) below, social space at grade, private bedrooms above, roof piyes on top — the standard, sensible stacking for a single-family Turkish residential building of this scale, and specifically chosen so wet zones (kitchen, bathrooms) stay vertically aligned floor-to-floor for plumbing efficiency.
- **Basement kept non-habitable**: rather than fight the stricter natural-light/burial-depth rule for habitable basement rooms (item 4.2.59 / Madde 32), the mandatory ground-floor living room already satisfies the code's "at least one living room + bedroom must have real daylight" intent, freeing the basement for parking (explicitly excluded from TAKS/KAKS, item 4.2.1/Madde 22) and service space.

## 3. How each municipal constraint shaped the design

| Constraint | Value | How it shaped the design |
|---|---|---|
| TAKS 0.25 | max footprint 178.32 m² | Binding constraint on footprint size (envelope after setbacks is 354.27 m², nearly 2× larger) — the building is TAKS-limited, not setback-limited. Ground floor drawn at 127.06 m² (0.1781 used), leaving headroom. |
| KAKS 1.00 | max total construction 713.26 m² | Comfortably covers a 5-level building at TAKS-capped footprints per floor; not the binding constraint here. |
| Front setback 5m | | Footprint's front (north) wall sits exactly at the 5m line — used in full, since the entry/circulation zone wants to be as close to the street as reasonably allowed. |
| Side setbacks 3m each | | Both side walls sit exactly at the 3m line — the building uses its full legal width. |
| Rear setback 3m (resolved this pass) | | Not the binding constraint given the small footprint-to-envelope ratio — actual rear yard (≈10.57m) is far more generous than the 3m minimum, banked automatically. |
| Kat Adedi 4 + basement | | Set the number of levels in the room program (5 total) and triggered the mandatory-elevator rule (Madde 34, kat adedi≥4) — the ground floor's circulation zone reserves a real stair+elevator core, not just stairs. |
| Ground floor offset [0.00,1.00]m | | Ground floor set at +0.15m, comfortably inside the band. |
| Red grade line — placeholder | | Every elevation in this plan (basement/ground/upper floor levels) is relative to an arbitrary 0.00m datum, not a real site elevation — this is the one figure that would need to be redone, not just re-verified, once real plankote data exists. |

## 4. Tradeoffs and honest limitations

- **Single-level generation only.** `lib/cadgen/plan.py` generates one level (`Building.footprints`/`levels` support multiple, but `generate_plan()` only populates level 0). This pass therefore produced concrete DXF/SVG/DWG geometry for the **ground floor only** — the basement and 3 upper floors are described in `brief.md`'s room program as the department's real design proposal, but were not drawn. This is a pre-existing, documented gap in the library (its own module docstring already flags it), re-confirmed by actually running a real multi-story project through it, not a new discovery — but worth restating plainly since it's the single biggest gap between "what the brief proposes" and "what the CAD files actually show."
- **Single-row bay-slicing layout.** The only layout algorithm in the library today splits a level's interior into one row of full-depth bays, sized proportionally to each room's target area. At this lot's resulting ~4.2m bay depth, a small standalone room (e.g., a bare ~3 m² guest WC) would draw as an unrealistic sliver rather than a sensible box — so the concrete ground floor consolidates into 4 larger zones (entry+core, salon, kitchen, a combined WC+storage "service" zone) rather than every individual room from the fuller conceptual program. A real multi-row, adjacency-aware layout engine is roadmapped (per `plan.py`'s own docstring) but not built — this is a genuine, reportable interaction between this specific lot's real proportions and the library's current foundation-phase scope, not a hidden workaround.
- **Door sizing default.** `generate_plan()` doesn't expose a door-width override — it always uses `build_level_geometry()`'s default (1.00m), which meets the Madde 39(1)(c) minimum for a **bağımsız bölüm giriş kapısı** (1.00m net) but is undersized for a proper **bina giriş kapısı** (main building entrance), which Madde 39(1)(b) sets at ≥1.50m net. Worth widening in a real pass; flagged here as a concrete API gap rather than silently accepted.
- **Height check is only trivially exercised.** Because only the ground floor was drawn, the compliance pass's height/gabari check compares 4.15m (one floor) against the 14.50m full-building estimate — it necessarily passes, but doesn't really test the full 5-level height the way it would once multi-story generation exists.

## 5. Compliance verification results (mandatory pass, per department convention)

Run against the **freshly re-read** generated DXF (`../cad/377-1-ground-floor.dxf`), not the in-memory model — `lib/cadgen/plan.py`'s `verify_compliance()`, exactly as the department's compliance-verification convention requires. **All 9 checks passed** (the department's baseline 5, plus `lib/cadgen`'s own bonus dimension-fidelity check):

| # | Check | Actual | Requirement | Result |
|---|---|---|---|---|
| 0 | *(bonus)* Drawn lot boundary matches intake lot geometry | 713.26 m² (36.023m × 19.800m) | == 713.26 m² | **PASS** |
| 1 | TAKS (lot coverage) | 0.1781 (127.06 m² / 713.26 m²) | ≤ 0.2500 | **PASS** |
| 2 | KAKS / Emsal (floor area ratio) | 0.1781 | ≤ 1.0000 | **PASS** |
| 3 | Height / gabari | 4.15 m | ≤ 14.50 m | **PASS** (see §4 — only one of five levels was drawn) |
| 4 | Front setback | 5.00 m | ≥ 5.00 m | **PASS** |
| 5 | Rear setback | 10.568 m | ≥ 3.00 m | **PASS** |
| 6 | Side setback (left) | 3.00 m | ≥ 3.00 m | **PASS** |
| 7 | Side setback (right) | 3.00 m | ≥ 3.00 m | **PASS** |
| 8 | Ground floor level vs. red grade (kırmızı kot) datum | +0.150 m (datum 0.00 m absolute — **placeholder**) | in [0.000, 1.000] | **PASS** (against the placeholder datum — this check is only as real as that datum, i.e. not real yet) |

No conflicts to fix. The one caveat worth restating plainly: check #8 passes against a **placeholder** kırmızı kot, not a real one — technically a pass, honestly only a pass against fictional data until a real plankote document exists.

Additional mandatory checks, also run and passed:
- **DWG export**: succeeded (`../cad/377-1-ground-floor.dwg`, 20,093 bytes, via `export_dwg.py` / ODA File Converter).
- **Approval-stamp language audit** (`titleblock.scan_dxf_for_stamp_language()`): 0 violations in the generated DXF's text entities.

## 6. Did the `project-brief` skill's flow work end-to-end?

**Yes, cleanly**, with the caveats already noted above (single-level scope, single-row layout, door-width default) — all pre-existing, documented library limitations rather than new breakage. Intake → slug/folder → brief.md → `lib/cadgen` generation (`LotGeometry`/`ZoningConstraints`/`Setbacks`/`RoomSpec` → `generate_plan()` → `render_dxf()`/`render_svg()`) → `verify_compliance()` → `export_dwg.export_dwg()` → titleblock stamp-language audit all ran without needing any workaround or code change. The one skipped step is the 3D-render stage (Blender + OpenArt) — out of scope for this pass (the founder's brief asked specifically for the example DWG/DXF/SVG plus compliance and rationale, not a catalog render), not silently dropped.

## 7. Client status — resolved

Founder confirmed 2026-08-20: **377/1 is a real client engagement**, not internal practice work. Registered in `shared/clients.md`. See `CLAUDE.md` at the top of this folder for the current status note — the design itself is still schematic/example-fidelity (single-level geometry, placeholder kırmızı kot, estimated parcel boundary), so "real client" doesn't mean "finished deliverable"; the limitations in §4 above still apply and still need addressing before anything here is client-ready.
