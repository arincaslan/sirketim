"""
departments/architecture/clients/377-1/scripts/generate_377_1.py

Full generation script for parcel 377/1 -- the MAXIMIZED-FOOTPRINT /
REVERSE-DUPLEX / ROOF-DUPLEX pass (see ../notes/rationale.md, dated section
for this pass, for the sourced reasoning behind every number below). Every
input here traces to a specific citation in rationale.md; this file is the
SAVED source of truth for how the CAD set was produced.

This SUPERSEDES the prior 6-unit apartment-building script (same filename,
prior pass) as the project's current design -- that prior pass's own CAD
output remains a legitimate, separately-verified checkpoint in the project's
history (see rationale.md's dated section for this pass, first paragraph),
not deleted or discredited, just superseded by what this script produces.

What changed this pass, in one paragraph: the buildable footprint is pushed
to the TAKS cap (0.25) rather than the prior pass's schematic-sized
footprint, replicated across all 4 KAKS-counted levels; the ground floor
gained ONE reverse-duplex unit (zemin + bodrum, connected by a private
internal stair) alongside the existing shared lobby/core; the top normal kat
(3rd) had its 2 standalone apartments converted into 2 roof-duplex units
(each combined with its own loft space in the cati piyesi, connected by a
private internal stair) -- and `lib/cadgen/plan.py` gained real, reusable
"true duplex" library capability (DuplexUnitSpec/DuplexZoneSpec/
DuplexPairSpec + build_level_geometry_duplex_level() +
generate_multilevel_plan(duplex_pairs=...) + verify_duplex_stair_alignment()
+ verify_duplex_area_caps()) to make this representable at all -- the
pre-existing LevelSpec/units model could only size/lay out one level's own
program independently, with no way to express a single bagimsiz bolum
spanning two physically stacked levels via its own internal stair.

Run with:
    python "departments/architecture/clients/377-1/scripts/generate_377_1.py"

Regenerates every plan/schedule/parking/elevation/section/calc-table sheet
for 377/1 into ../cad/, runs the full compliance + core-alignment +
duplex-alignment + duplex-area-cap + stamp-language verification suite, and
prints a pass/fail summary. Exits non-zero if anything fails.
"""

from __future__ import annotations

import sys
from pathlib import Path

# Windows console default (cp1252) can't encode this script's Turkish
# diacritics in plain print() calls -- force UTF-8 stdout/stderr (same fix
# the prior pass's script needed and recorded, see rationale.md Section 10.1
# of the prior pass).
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")

LIB_DIR = Path(__file__).resolve().parents[3] / "lib"  # .../departments/architecture/lib
if str(LIB_DIR) not in sys.path:
    sys.path.insert(0, str(LIB_DIR))

import ezdxf  # noqa: E402
from ezdxf.addons import importer  # noqa: E402

from cadgen import calc_table as calc_table_mod  # noqa: E402
from cadgen import elevation as elevation_mod  # noqa: E402
from cadgen import export_dwg as export_dwg_mod  # noqa: E402
from cadgen import parking as parking_mod  # noqa: E402
from cadgen import plan as plan_mod  # noqa: E402
from cadgen import schedule as schedule_mod  # noqa: E402
from cadgen import section as section_mod  # noqa: E402
from cadgen import titleblock as titleblock_mod  # noqa: E402

CAD_DIR = Path(__file__).resolve().parents[1] / "cad"
CAD_DIR.mkdir(parents=True, exist_ok=True)

RESULTS: list[tuple[str, bool, str]] = []


def record(name: str, passed: bool, detail: str = "") -> None:
    RESULTS.append((name, passed, detail))
    print(f"{'PASS' if passed else 'FAIL'}  {name}" + (f"  -- {detail}" if detail else ""))


def section(title: str) -> None:
    print("\n" + "=" * 78)
    print(title)
    print("=" * 78)


# ---------------------------------------------------------------------------
# 1. Intake -- unchanged from every prior pass; see brief.md / CLAUDE.md for
# source citations (imardurumu.pdf, minuspalityimardurumu.pdf, plannotes.pdf)
# ---------------------------------------------------------------------------

section("1. Intake (unchanged from prior passes -- see brief.md/CLAUDE.md for citations)")

lot = plan_mod.LotGeometry(
    width=36.02, depth=19.80,
    source_note="Visual-proportion estimate off imardurumu.pdf/minuspalityimardurumu.pdf's plotted schema, anchored to the confirmed 713.26 m2 area -- not a surveyed dimension (see rationale.md).",
)
setbacks = plan_mod.Setbacks(front=5.0, rear=3.0, side_left=3.0, side_right=3.0)
zoning = plan_mod.ZoningConstraints(
    taks=0.25, kaks=1.00, max_height=14.65,
    setbacks=setbacks,
    source_note="imardurumu.pdf / minuspalityimardurumu.pdf (TAKS/KAKS/setbacks/Kat Adedi); rear setback via Planli Alanlar Imar Yonetmeligi Madde 23(1)(c); max_height re-derived from plan notes item 4.2.4 + ground_floor_elevation, see rationale.md.",
    min_ground_floor_offset=0.0, max_ground_floor_offset=1.0,
    roof_ridge_max_above_top_slab=5.50,
)
RED_GRADE_ELEVATION = 0.0  # still a placeholder -- no plankote provided, see rationale.md
GROUND_FLOOR_ELEVATION = 0.15

print(f"Lot: {lot.width}m x {lot.depth}m = {lot.area():.2f} m2")
print(f"TAKS {zoning.taks} -> max footprint {lot.area() * zoning.taks:.2f} m2")
print(f"KAKS {zoning.kaks} -> max total construction {lot.area() * zoning.kaks:.2f} m2")

# ---------------------------------------------------------------------------
# 2. Maximized footprint + shared core + reverse-duplex / roof-duplex program
#
# See rationale.md's dated section for this pass for the full sourced
# design-judgment write-up (envelope derivation, unit-count tradeoffs, the
# real parking-width conflict that capped the reverse duplex at 1 unit
# rather than 2, the piyes-exemption citation research). Headline numbers,
# reproduced here as inline comments so this script stays self-explanatory:
#
# - ZEMIN_DEPTH = NORMAL_KAT_DEPTH = 5.93 m: pushes the TAKS-counted
#   footprint (zemin + 1/2/3 normal kat, all the SAME full-envelope-width x
#   5.93m depth footprint) to 178.02 m2 -- TAKS 0.2496 against the 0.25 cap,
#   99.84% of the legal maximum, with a small deliberate safety margin
#   (same engineering-prudence convention the prior pass already used for
#   BODRUM_DEPTH's own margin over its own minimum).
# - BODRUM_DEPTH = 11.70 m: UNCHANGED from the prior pass -- not
#   TAKS/KAKS-constrained, already validated, no reason to churn it.
# - Reverse duplex: bodrum (secondary) + zemin (entry) = ONE unit
#   ("Ters Dubleks 1") -- see rationale.md for why exactly one, not two:
#   a real, quantified parking-width conflict (7 required stalls need
#   ~17.5m of the basement's own ~29.77m interior width; one
#   Madde-29-compliant reverse-duplex unit needs ~9.0m; a second would need
#   another ~9m that the remaining ~0.2m of width cannot supply without
#   either shrinking the unit below Madde 29 minimums or a
#   double-loaded/stacked parking layout this library's parking.py does not
#   yet support -- both real, named, not-attempted-this-pass follow-ups).
# - Roof duplex: 3rd normal kat (entry) + cati piyesi (secondary) = TWO
#   units ("Cati Dubleks 1"/"2") -- both of the 3rd floor's existing
#   standalone apartments become roof duplexes (a net-neutral unit-count
#   change on that floor, adding loft space, not additional dwelling
#   units). 3rd normal kat + cati piyesi share a narrower, MATCHED
#   footprint width (explicit_max_width=27.0m on both) -- required for the
#   pair's own cross-level x-alignment guarantee (see
#   build_level_geometry_duplex_level()'s docstring) -- which gives up
#   17.91 m2 of KAKS-countable footprint on L3 versus the full envelope
#   width (178.02 -> 160.11 m2), a real, quantified, and accepted
#   consequence of building the roof duplex honestly rather than a free
#   lunch.
# - Total dwelling units: 1 (reverse duplex) + 2 (1st normal kat,
#   unchanged standalone) + 2 (2nd normal kat, unchanged standalone) + 2
#   (roof duplex) = 7 -- up from the prior pass's 6.
# ---------------------------------------------------------------------------

section("2. Maximized footprint + shared core + reverse-duplex / roof-duplex program")

CORE = plan_mod.CoreSpec(width=3.00, depth=2.60)
print(f"CoreSpec: {CORE.width}m x {CORE.depth}m, area {CORE.width * CORE.depth:.2f} m2 "
      f"(>= plan notes item 4.2.55's 3.00 m2 asansor bosluğu minimum, plus stair run)")

ZEMIN_DEPTH = 5.93  # meters -- maximized toward the TAKS cap, see comment block above
NORMAL_KAT_DEPTH = 5.93  # meters -- SAME footprint as zemin, replicated across all 4 KAKS-counted levels (this pass's own "maximize toward TAKS, replicate across KAKS floors" instruction)
BODRUM_DEPTH = 11.70  # meters -- UNCHANGED from the prior pass (already validated against real parking-stall geometry, not TAKS/KAKS-constrained)
CATI_DEPTH = 5.00  # meters -- roof-duplex loft depth, chosen to give the piyes rooms a real (>2.5m) usable depth once the shared core+corridor band is subtracted, not a sliver
NORMAL_KAT_ROOF_MAX_WIDTH = 27.00  # meters -- SHARED, identical max_width for BOTH 3rd normal kat and cati piyesi (required for the roof-duplex pair's cross-level x-alignment; narrower than the 30.02m full envelope, see comment block above)

# -- Bodrum Kat (index -1) -- reverse-duplex secondary level + parking + service --
BODRUM_ZONE_MEKANIK = [
    plan_mod.RoomSpec("Mekanik Tesisat Odasi", 10.0, "mechanical"),
    plan_mod.RoomSpec("Depo Kiler", 8.0, "storage"),
    plan_mod.RoomSpec("Siginak", 12.0, "life-safety"),
]

# -- Zemin Kat (index 0) -- shared entry/core + reverse-duplex entry half --
ZEMIN_ZONE_LOBBY = [
    plan_mod.RoomSpec("Giris Lobisi", 70.0, "circulation"),
    plan_mod.RoomSpec("Yonetim Depo Odasi", 25.0, "service"),
]

REVERSE_DUPLEX_UNIT = plan_mod.DuplexUnitSpec(
    name_prefix="Ters Dubleks 1",
    entry_rooms=[  # zemin kat -- satisfies plan notes item 4.2.59's requirement (living room + 1 bedroom AT the ground floor)
        plan_mod.RoomSpec("Salon", 22.0, "living"),
        plan_mod.RoomSpec("Mutfak", 10.0, "kitchen"),
        plan_mod.RoomSpec("Yatak Odasi 1", 13.0, "bedroom"),
    ],
    secondary_rooms=[  # bodrum kat -- reached only via this unit's own internal stair
        plan_mod.RoomSpec("Yatak Odasi 2", 11.0, "bedroom"),
        plan_mod.RoomSpec("Banyo WC", 5.0, "bath"),
        plan_mod.RoomSpec("Calisma Odasi", 8.0, "flex"),
    ],
)

REVERSE_DUPLEX_PAIR = plan_mod.DuplexPairSpec(
    lower_level=-1, upper_level=0, entry_level=0,
    units=[REVERSE_DUPLEX_UNIT],
    units_zone_width=9.0,  # meters -- sized so the smallest entry-level room (Yatak Odasi 1) clears the Madde 29 >=9.00 m2 master-bedroom minimum at this level's own available room depth (~4.13m); see rationale.md for the arithmetic
    zones_before_units=[],
    zones_after_units=[
        plan_mod.DuplexZoneSpec(
            name="Lobi-Otopark", width=17.50,  # SAME width both levels: zemin's lobby zone sits directly above bodrum's parking zone
            entry_program=ZEMIN_ZONE_LOBBY,
            secondary_program=[plan_mod.RoomSpec("Kapali Otopark", 150.0, "parking")],
        ),
    ],
    corridor_depth=1.50, stair_width=1.00, stair_run=1.50, stair_gap=0.20,
    demising_wall_thickness=0.20, door_width=1.00, door_height=2.10,
    street_entry_door_width=1.50,  # Madde 39(1)(b) >=1.50m bina giris kapisi
)


def make_roof_duplex_unit(n: int) -> plan_mod.DuplexUnitSpec:
    return plan_mod.DuplexUnitSpec(
        name_prefix=f"Cati Dubleks {n}",
        entry_rooms=[  # 3rd normal kat -- the unit's own full apartment program
            plan_mod.RoomSpec("Salon", 26.0, "living"),
            plan_mod.RoomSpec("Mutfak", 9.0, "kitchen"),
            plan_mod.RoomSpec("Yatak Odasi 1", 16.0, "bedroom"),
            plan_mod.RoomSpec("Yatak Odasi 2", 11.0, "bedroom"),
            plan_mod.RoomSpec("Banyo WC", 6.0, "bath"),
        ],
        secondary_rooms=[  # cati piyesi -- reached only via this unit's own internal stair; area capped <= entry-level area, plan notes item 4.2.32
            plan_mod.RoomSpec("Cati Odasi", 22.0, "flex"),
        ],
    )


ROOF_DUPLEX_PAIR = plan_mod.DuplexPairSpec(
    lower_level=3, upper_level=4, entry_level=3,
    units=[make_roof_duplex_unit(1), make_roof_duplex_unit(2)],
    units_zone_width=21.0,  # meters -- 10.5m/unit, sized so the smallest bedroom clears Madde 29's minimum at this level's own available room depth (~4.13m); see rationale.md
    zones_before_units=[],
    zones_after_units=[
        plan_mod.DuplexZoneSpec(
            name="Mekanik", width=2.60,
            entry_program=[],  # nothing drawn on 3rd normal kat's own share of this narrow tail strip this pass -- a genuine, stated simplification (see rationale.md)
            secondary_program=[plan_mod.RoomSpec("Mekanik Solar Ekipman Odasi", 6.0, "mechanical")],
        ),
    ],
    corridor_depth=1.50, stair_width=1.00, stair_run=1.50, stair_gap=0.20,
    demising_wall_thickness=0.20, door_width=1.00, door_height=2.10,
    secondary_area_capped_by_entry=True,  # plan notes item 4.2.32
)

DUPLEX_PAIRS = [REVERSE_DUPLEX_PAIR, ROOF_DUPLEX_PAIR]

level_specs = [
    plan_mod.LevelSpec(
        index=-1, name="Bodrum Kat", floor_to_floor_height=4.80,
        footprint_style="explicit_depth", explicit_depth=BODRUM_DEPTH,
        count_toward_taks=False, count_toward_kaks=False, is_duplex_level=True,
    ),
    plan_mod.LevelSpec(
        index=0, name="Zemin Kat", floor_to_floor_height=4.00,
        footprint_style="explicit_depth", explicit_depth=ZEMIN_DEPTH,
        count_toward_taks=True, count_toward_kaks=True, is_duplex_level=True,
    ),
    plan_mod.LevelSpec(
        index=1, name="1. Normal Kat",
        units=[
            [plan_mod.RoomSpec("Salon", 26.0, "living"), plan_mod.RoomSpec("Mutfak", 11.0, "kitchen"),
             plan_mod.RoomSpec("Yatak Odasi 1", 14.0, "bedroom"), plan_mod.RoomSpec("Yatak Odasi 2", 11.0, "bedroom"),
             plan_mod.RoomSpec("Banyo WC", 6.0, "bath")],
            [plan_mod.RoomSpec("Salon", 26.0, "living"), plan_mod.RoomSpec("Mutfak", 11.0, "kitchen"),
             plan_mod.RoomSpec("Yatak Odasi 1", 14.0, "bedroom"), plan_mod.RoomSpec("Yatak Odasi 2", 11.0, "bedroom"),
             plan_mod.RoomSpec("Banyo WC", 6.0, "bath")],
        ],
        floor_to_floor_height=3.50, footprint_style="explicit_depth", explicit_depth=NORMAL_KAT_DEPTH,
        corridor_depth=1.20, count_toward_taks=False, count_toward_kaks=True,
    ),
    plan_mod.LevelSpec(
        index=2, name="2. Normal Kat",
        units=[
            [plan_mod.RoomSpec("Salon", 26.0, "living"), plan_mod.RoomSpec("Mutfak", 11.0, "kitchen"),
             plan_mod.RoomSpec("Yatak Odasi 1", 14.0, "bedroom"), plan_mod.RoomSpec("Yatak Odasi 2", 11.0, "bedroom"),
             plan_mod.RoomSpec("Banyo WC", 6.0, "bath")],
            [plan_mod.RoomSpec("Salon", 26.0, "living"), plan_mod.RoomSpec("Mutfak", 11.0, "kitchen"),
             plan_mod.RoomSpec("Yatak Odasi 1", 14.0, "bedroom"), plan_mod.RoomSpec("Yatak Odasi 2", 11.0, "bedroom"),
             plan_mod.RoomSpec("Banyo WC", 6.0, "bath")],
        ],
        floor_to_floor_height=3.50, footprint_style="explicit_depth", explicit_depth=NORMAL_KAT_DEPTH,
        corridor_depth=1.20, count_toward_taks=False, count_toward_kaks=True,
    ),
    plan_mod.LevelSpec(
        index=3, name="3. Normal Kat", floor_to_floor_height=3.50,
        footprint_style="explicit_depth", explicit_depth=NORMAL_KAT_DEPTH, explicit_max_width=NORMAL_KAT_ROOF_MAX_WIDTH,
        count_toward_taks=False, count_toward_kaks=True, is_duplex_level=True,
    ),
    plan_mod.LevelSpec(
        index=4, name="Cati Piyesi", floor_to_floor_height=2.60,
        footprint_style="explicit_depth", explicit_depth=CATI_DEPTH, explicit_max_width=NORMAL_KAT_ROOF_MAX_WIDTH,
        count_toward_taks=False, count_toward_kaks=False, is_duplex_level=True,
    ),
]

building = plan_mod.generate_multilevel_plan(
    name="Parcel 377-1 -- Maximized Footprint, Reverse + Roof Duplex (schematic)",
    lot=lot, zoning=zoning, level_specs=level_specs,
    red_grade_elevation=RED_GRADE_ELEVATION, ground_floor_elevation=GROUND_FLOOR_ELEVATION,
    core=CORE, duplex_pairs=DUPLEX_PAIRS,
)

TOTAL_DWELLING_UNITS = 1 + 2 + 2 + 2  # reverse duplex (1) + 1st normal kat (2) + 2nd normal kat (2) + roof duplex (2)
print(f"Total dwelling units (bagimsiz bolum): {TOTAL_DWELLING_UNITS}")
for lvl in building.levels:
    print(f"  L{lvl.index} {lvl.name}: footprint {building.footprint_area(lvl.index):.2f} m2, "
          f"{len(building.rooms_on_level(lvl.index))} rooms")
    for r in building.rooms_on_level(lvl.index):
        print(f"    {r.id}: {r.name} = {r.area():.2f} m2 [{r.program_tag}]")

# ---------------------------------------------------------------------------
# 3. Sheet metadata
# ---------------------------------------------------------------------------

SHEETS = {
    -1: ("A-101", "Bodrum Kat Plani (Ters Dubleks Alt Kat)"),
    0: ("A-102", "Zemin Kat Plani (Ters Dubleks Giris Kati)"),
    1: ("A-103", "1. Normal Kat Plani"),
    2: ("A-104", "2. Normal Kat Plani"),
    3: ("A-105", "3. Normal Kat Plani (Cati Dubleks Giris Kati)"),
    4: ("A-106", "Cati Piyesi Plani (Cati Dubleks Ust Kat)"),
}
SLUGS = {
    -1: "bodrum-kat", 0: "zemin-kat", 1: "1-normal-kat", 2: "2-normal-kat", 3: "3-normal-kat", 4: "cati-piyesi",
}

PROJECT_NAME = "Parcel 377/1 -- Ereğli Mah., Karamursel, Kocaeli (maximized footprint, reverse + roof duplex)"
PARCEL_ID = "Ada 377 / Parsel 1, Tapu Kutugu Eregli, Pafta G23D04D3D"
GEN_DATE = "2026-08-21"


def titleblock_for(level: int, scale: str = "1:100 (schematic)") -> titleblock_mod.TitleBlockInfo:
    sheet_no, sheet_title = SHEETS[level]
    return titleblock_mod.TitleBlockInfo(
        project_name=PROJECT_NAME, parcel_id=PARCEL_ID, date=GEN_DATE, scale=scale,
        sheet_number=sheet_no, sheet_title=sheet_title,
    )


def _tb(sheet_number: str, sheet_title: str, scale: str = "1:100 (schematic)") -> titleblock_mod.TitleBlockInfo:
    return titleblock_mod.TitleBlockInfo(
        project_name=PROJECT_NAME, parcel_id=PARCEL_ID, date=GEN_DATE, scale=scale,
        sheet_number=sheet_number, sheet_title=sheet_title,
    )


# ---------------------------------------------------------------------------
# 4. Plan sheets (DXF + SVG + DWG) + door/window schedules
# ---------------------------------------------------------------------------

section("4. Plan sheets + door/window schedules")

plan_dxf_paths: dict[int, Path] = {}
for lvl in building.levels:
    idx = lvl.index
    slug = SLUGS[idx]
    dxf_path = CAD_DIR / f"377-1-{slug}.dxf"
    svg_path = CAD_DIR / f"377-1-{slug}.svg"
    plan_mod.render_dxf(building, lot, zoning, dxf_path, titleblock_info=titleblock_for(idx), level=idx)
    plan_mod.render_svg(building, lot, zoning, svg_path, titleblock_info=titleblock_for(idx), level=idx)
    plan_dxf_paths[idx] = dxf_path
    print(f"Wrote {dxf_path}")

    sched_dxf = CAD_DIR / f"377-1-{slug}-schedule.dxf"
    sched_svg = CAD_DIR / f"377-1-{slug}-schedule.svg"
    sched_sheet_no, sched_sheet_title = SHEETS[idx]
    sched_tb = titleblock_mod.TitleBlockInfo(
        project_name=PROJECT_NAME, parcel_id=PARCEL_ID, date=GEN_DATE, scale="N/A (schedule table)",
        sheet_number=sched_sheet_no.replace("A-1", "A-2"), sheet_title=f"{sched_sheet_title} -- Door/Window Schedule",
    )
    schedule_mod.render_schedule_dxf(building, idx, sched_dxf, titleblock_info=sched_tb)
    schedule_mod.render_schedule_svg(building, idx, sched_svg, titleblock_info=sched_tb)

    fidelity = schedule_mod.verify_schedule_fidelity(sched_dxf, building, idx)
    record(f"L{idx} ({lvl.name}) schedule fidelity", fidelity.all_passed, f"{sum(c.passed for c in fidelity.checks)}/{len(fidelity.checks)} checks")

# ---------------------------------------------------------------------------
# 5. Compliance verification (mandatory pass)
# ---------------------------------------------------------------------------

section("5. Compliance verification")

report = plan_mod.verify_compliance_multilevel(
    plan_dxf_paths, lot, zoning,
    taks_level=0, kaks_levels=[0, 1, 2, 3], eave_levels=[0, 1, 2, 3],
    roof_level=4, top_structural_level=3, ground_floor_level=0,
)
print(report.summary())
record("Multi-level compliance: all checks pass", report.all_passed, f"{sum(c.passed for c in report.checks)}/{len(report.checks)}")

# ---------------------------------------------------------------------------
# 6. Core alignment + duplex stair alignment + duplex area-cap verification
# ---------------------------------------------------------------------------

section("6. Core (stair/elevator shaft) + duplex internal-stair alignment + duplex area caps")

core_report = plan_mod.verify_core_alignment(plan_dxf_paths, CORE)
print(core_report.summary())
record("Core alignment: identical shaft footprint on every level", core_report.all_passed, f"{sum(c.passed for c in core_report.checks)}/{len(core_report.checks)}")

duplex_align_report = plan_mod.verify_duplex_stair_alignment(plan_dxf_paths, DUPLEX_PAIRS)
print(duplex_align_report.summary())
record("Duplex internal-stair alignment: identical shaft footprint on both levels of each pair", duplex_align_report.all_passed, f"{sum(c.passed for c in duplex_align_report.checks)}/{len(duplex_align_report.checks)}")

duplex_area_report = plan_mod.verify_duplex_area_caps(plan_dxf_paths, DUPLEX_PAIRS, CORE, footprint_x0=setbacks.side_left)
print(duplex_area_report.summary())
record("Duplex area caps (plan notes 4.2.32, roof-duplex pair): secondary-level area <= entry-level area per unit", duplex_area_report.all_passed, f"{sum(c.passed for c in duplex_area_report.checks)}/{len(duplex_area_report.checks)}")

# ---------------------------------------------------------------------------
# 7. Stamp-language audit -- every plan + schedule DXF
# ---------------------------------------------------------------------------

section("7. Approval-stamp language audit")

total_violations = 0
for idx, dxf_path in plan_dxf_paths.items():
    v = titleblock_mod.scan_dxf_for_stamp_language(dxf_path)
    total_violations += len(v)
    sched_path = CAD_DIR / f"377-1-{SLUGS[idx]}-schedule.dxf"
    v2 = titleblock_mod.scan_dxf_for_stamp_language(sched_path)
    total_violations += len(v2)
record("Zero stamp-language violations across all plan + schedule DXFs", total_violations == 0, f"{total_violations} violation(s)")

# ---------------------------------------------------------------------------
# 8. DWG export -- per-sheet (working files)
# ---------------------------------------------------------------------------

section("8. Per-sheet DWG export")

for idx, dxf_path in plan_dxf_paths.items():
    try:
        dwg_path = export_dwg_mod.export_dwg(dxf_path)
        record(f"L{idx} plan DWG export", dwg_path.exists(), f"{dwg_path.name} ({dwg_path.stat().st_size:,} bytes)")
    except export_dwg_mod.ODAConverterMissingError as exc:
        record(f"L{idx} plan DWG export", False, str(exc))
    sched_dxf = CAD_DIR / f"377-1-{SLUGS[idx]}-schedule.dxf"
    try:
        sched_dwg = export_dwg_mod.export_dwg(sched_dxf)
        record(f"L{idx} schedule DWG export", sched_dwg.exists(), f"{sched_dwg.name}")
    except export_dwg_mod.ODAConverterMissingError as exc:
        record(f"L{idx} schedule DWG export", False, str(exc))

# ---------------------------------------------------------------------------
# 9. Parking layout -- bodrum kat, real drawn stall/aisle geometry
# ---------------------------------------------------------------------------

section("9. Parking layout (bodrum kat -- real stall/aisle geometry, Otopark Yonetmeligi)")

parking_room = parking_mod.find_parking_room(building, level=-1)
parking_layout = parking_mod.compute_parking_layout(parking_room, required_stalls=TOTAL_DWELLING_UNITS)
print(
    f"Otopark room {parking_layout.room_id}: required {parking_layout.required_stalls} "
    f"(1/daire x {TOTAL_DWELLING_UNITS} daire, Ek-1), provided {parking_layout.provided_stalls}, "
    f"fits={parking_layout.fits}"
)
record(
    "Parking: room fits the mandatory stall row + two-way aisle depth (Madde 5(1)(h)(7)/(8))",
    True,  # compute_parking_layout() would have raised ValueError above if it didn't fit at all
    f"BODRUM_DEPTH={BODRUM_DEPTH}m -> room {parking_room.area():.2f} m2",
)
record(
    "Parking: provided stall count meets required count (Otopark Yonetmeligi Ek-1, 1/daire)",
    parking_layout.fits,
    f"{parking_layout.provided_stalls}/{parking_layout.required_stalls}",
)

parking_dxf = CAD_DIR / "377-1-bodrum-kat-otopark.dxf"
parking_svg = CAD_DIR / "377-1-bodrum-kat-otopark.svg"
parking_mod.render_parking_dxf(building, lot, zoning, parking_layout, parking_dxf, level=-1, titleblock_info=_tb("A-107", "Bodrum Kat Otopark Duzeni"))
parking_mod.render_parking_svg(building, lot, zoning, parking_layout, parking_svg, level=-1, titleblock_info=_tb("A-107", "Bodrum Kat Otopark Duzeni"))
print(f"Wrote {parking_dxf}")

parking_verify = parking_mod.verify_parking_layout(parking_dxf)
print(parking_verify.summary())
record(
    "Parking layout verification, re-read from disk (dims + count vs Otopark Yonetmeligi minimums)",
    parking_verify.all_passed,
    f"{sum(c.passed for c in parking_verify.checks)}/{len(parking_verify.checks)}",
)

# ---------------------------------------------------------------------------
# 10. Elevations -- front/rear/left/right, real orthographic views derived
# from the same level stack already generated + compliance-verified above
# ---------------------------------------------------------------------------

section("10. Elevations (front/rear/left/right -- orthographic, derived from plan geometry)")

ELEVATION_SHEETS = {
    "front": ("A-301", "Govde Gorunusu -- On (Kuzey / Selcuk Bey Caddesi Cephesi)"),
    "rear": ("A-302", "Govde Gorunusu -- Arka (Guney)"),
    "left": ("A-303", "Govde Gorunusu -- Sol"),
    "right": ("A-304", "Govde Gorunusu -- Sag"),
}
expected_z0 = min(lvl.finished_floor_elevation for lvl in building.levels)
expected_z1 = max(lvl.finished_floor_elevation + lvl.floor_to_floor_height for lvl in building.levels)

elevation_dxf_paths: dict[str, Path] = {}
for direction, (sheet_no, sheet_title) in ELEVATION_SHEETS.items():
    elev_dxf = CAD_DIR / f"377-1-elevation-{direction}.dxf"
    elev_svg = CAD_DIR / f"377-1-elevation-{direction}.svg"
    tb = _tb(sheet_no, sheet_title)
    elevation_mod.render_elevation_dxf(building, direction, elev_dxf, titleblock_info=tb)
    elevation_mod.render_elevation_svg(building, direction, elev_svg, titleblock_info=tb)
    elevation_dxf_paths[direction] = elev_dxf
    print(f"Wrote {elev_dxf}")

    doc_e = ezdxf.readfile(str(elev_dxf))
    msp_e = doc_e.modelspace()
    xpt = next(e for e in msp_e if e.dxftype() == "POINT" and e.dxf.layer == plan_mod.LAYERS["project_data"])
    tags = [t.value for t in xpt.get_xdata(elevation_mod.APPID) if t.code == 1000]
    xd = {}
    for s in tags[1:]:
        k, _, v = s.partition("=")
        xd[k] = v
    z0_read, z1_read = float(xd["z0"]), float(xd["z1"])
    ok = abs(z0_read - expected_z0) < 1e-6 and abs(z1_read - expected_z1) < 1e-6
    record(
        f"Elevation ({direction}): re-read height bounds match the building's own level stack",
        ok,
        f"drawn z=[{z0_read:.3f},{z1_read:.3f}] vs expected z=[{expected_z0:.3f},{expected_z1:.3f}]",
    )

# ---------------------------------------------------------------------------
# 11. Section -- one longitudinal section, cut through the shared core
# ---------------------------------------------------------------------------

section("11. Section (longitudinal, cut through the vertical core)")

cut_x = section_mod.section_cut_x_from_core(building, CORE, level=0)
print(f"Section cut at world X={cut_x:.3f}m (core centerline, derived via section_cut_x_from_core())")
building_section = section_mod.cut_longitudinal_section(building, cut_x)
record(
    "Section: cut plane crosses every level's footprint (core is a continuous vertical shaft)",
    len(building_section.levels) == len(building.levels),
    f"{len(building_section.levels)}/{len(building.levels)} levels represented",
)

section_dxf = CAD_DIR / "377-1-section-longitudinal.dxf"
section_svg = CAD_DIR / "377-1-section-longitudinal.svg"
section_mod.render_section_dxf(building, building_section, section_dxf, titleblock_info=_tb("A-401", "Boyuna Kesit (Cekirdek Ekseninden)"))
section_mod.render_section_svg(building, building_section, section_svg, titleblock_info=_tb("A-401", "Boyuna Kesit (Cekirdek Ekseninden)"))
print(f"Wrote {section_dxf}")

doc_s = ezdxf.readfile(str(section_dxf))
msp_s = doc_s.modelspace()
xpt_s = next(e for e in msp_s if e.dxftype() == "POINT" and e.dxf.layer == plan_mod.LAYERS["project_data"])
tags_s = [t.value for t in xpt_s.get_xdata(section_mod.APPID) if t.code == 1000]
xd_s = {}
for s in tags_s[1:]:
    k, _, v = s.partition("=")
    xd_s[k] = v
z0_s, z1_s = float(xd_s["z0"]), float(xd_s["z1"])
ok_s = abs(z0_s - expected_z0) < 1e-6 and abs(z1_s - expected_z1) < 1e-6
record(
    "Section: re-read height bounds match the building's own level stack",
    ok_s,
    f"drawn z=[{z0_s:.3f},{z1_s:.3f}] vs expected z=[{expected_z0:.3f},{expected_z1:.3f}]",
)

# ---------------------------------------------------------------------------
# 12. Calc table -- on-sheet area/TAKS/KAKS table, sourced from the SAME
# ComplianceReport object Section 5 already produced (single source of
# truth -- see calc_table.py's module docstring)
# ---------------------------------------------------------------------------

section("12. Calc table (on-sheet alan hesabi / TAKS-KAKS tablosu, from Section 5's report)")

calc_dxf = CAD_DIR / "377-1-calc-table.dxf"
calc_svg = CAD_DIR / "377-1-calc-table.svg"
calc_table_mod.render_calc_table_dxf(building, lot, zoning, report, calc_dxf, titleblock_info=_tb("A-501", "Alan Hesabi / TAKS-KAKS Tablosu", scale="N/A (calc table)"))
calc_table_mod.render_calc_table_svg(building, lot, zoning, report, calc_svg, titleblock_info=_tb("A-501", "Alan Hesabi / TAKS-KAKS Tablosu", scale="N/A (calc table)"))
print(f"Wrote {calc_dxf}")

doc_c = ezdxf.readfile(str(calc_dxf))
msp_c = doc_c.modelspace()
result_texts = [e.dxf.text for e in msp_c if e.dxftype() == "TEXT" and e.dxf.layer == calc_table_mod.LAYERS["calc_table"] and e.dxf.text in ("PASS", "FAIL")]
record(
    "Calc table: one drawn PASS/FAIL result cell per compliance check (no drift from Section 5's report)",
    len(result_texts) == len(report.checks),
    f"drawn {len(result_texts)} result cells vs {len(report.checks)} checks in the report",
)
record(
    "Calc table: drawn PASS/FAIL cells match the report's own pass/fail values, in order",
    result_texts == ["PASS" if c.passed else "FAIL" for c in report.checks],
)

# ---------------------------------------------------------------------------
# 13. Stamp-language audit -- every new sheet type this section added
# ---------------------------------------------------------------------------

section("13. Approval-stamp language audit (parking + elevations + section + calc table)")

new_sheet_dxfs = [parking_dxf, *elevation_dxf_paths.values(), section_dxf, calc_dxf]
total_new_violations = 0
for p in new_sheet_dxfs:
    v = titleblock_mod.scan_dxf_for_stamp_language(p)
    total_new_violations += len(v)
record(
    "Zero stamp-language violations across parking/elevation/section/calc-table DXFs",
    total_new_violations == 0,
    f"{total_new_violations} violation(s) across {len(new_sheet_dxfs)} sheets",
)

# ---------------------------------------------------------------------------
# 14. Consolidated DWG -- ALL sheets (plan + schedule + parking + elevation +
# section + calc table) as layout tabs inside ONE native DWG file, matching
# the founder's 373-6 reference format.
# ---------------------------------------------------------------------------

section("14. Consolidated DWG (all sheets, multiple layout tabs, one file)")

CONSOLIDATED_SHEETS: list[tuple[str, Path]] = []
for idx in sorted(plan_dxf_paths):
    sheet_no, _ = SHEETS[idx]
    CONSOLIDATED_SHEETS.append((sheet_no, plan_dxf_paths[idx]))
CONSOLIDATED_SHEETS.append(("A-107", parking_dxf))
for idx in sorted(plan_dxf_paths):
    sheet_no, _ = SHEETS[idx]
    sched_sheet_no = sheet_no.replace("A-1", "A-2")
    CONSOLIDATED_SHEETS.append((sched_sheet_no, CAD_DIR / f"377-1-{SLUGS[idx]}-schedule.dxf"))
for direction, (sheet_no, _title) in ELEVATION_SHEETS.items():
    CONSOLIDATED_SHEETS.append((sheet_no, elevation_dxf_paths[direction]))
CONSOLIDATED_SHEETS.append(("A-401", section_dxf))
CONSOLIDATED_SHEETS.append(("A-501", calc_dxf))

consolidated_doc = ezdxf.new("R2018")
consolidated_doc.header["$INSUNITS"] = 6
consolidated_doc.header["$MEASUREMENT"] = 1
consolidated_doc.appids.new(plan_mod.APPID)

layout_names_written: list[str] = []
for sheet_no, src_path in CONSOLIDATED_SHEETS:
    src_doc = ezdxf.readfile(str(src_path))
    psp = consolidated_doc.layouts.new(sheet_no)
    imp = importer.Importer(src_doc, consolidated_doc)
    imp.import_modelspace(target_layout=psp)
    imp.finalize()
    layout_names_written.append(sheet_no)

if "Layout1" in consolidated_doc.layouts.names():
    consolidated_doc.layouts.delete("Layout1")

record(
    "Consolidated doc (in-memory): every sheet imported as its own layout tab",
    sorted(consolidated_doc.layouts.names()) == sorted(["Model", *layout_names_written]),
    f"{len(layout_names_written)} sheet layouts + Model",
)

consolidated_dxf_path = CAD_DIR / "377-1-consolidated.dxf"
consolidated_doc.saveas(str(consolidated_dxf_path))
print(f"Wrote {consolidated_dxf_path} ({len(layout_names_written)} sheet layouts + Model)")

consolidated_dwg_path = CAD_DIR / "377-1-consolidated.dwg"
try:
    export_dwg_mod.export_dwg(consolidated_doc, consolidated_dwg_path)
    record("Consolidated DWG export", consolidated_dwg_path.exists(), f"{consolidated_dwg_path.name} ({consolidated_dwg_path.stat().st_size:,} bytes)")

    reread_doc = export_dwg_mod.read_dwg(consolidated_dwg_path)
    reread_layouts = reread_doc.layouts.names()
    missing = [n for n in layout_names_written if n not in reread_layouts]
    record(
        f"Consolidated DWG re-read from disk: all {len(layout_names_written)} sheet layout tabs present",
        len(missing) == 0,
        f"{len(reread_layouts)} layouts found (incl. Model); missing: {missing or 'none'}",
    )
    empty_layouts = [n for n in layout_names_written if n in reread_layouts and len(list(reread_doc.layouts.get(n))) == 0]
    record(
        "Consolidated DWG re-read from disk: every sheet layout has drawn entities (none blank)",
        len(empty_layouts) == 0,
        f"empty layouts: {empty_layouts or 'none'}",
    )
except export_dwg_mod.ODAConverterMissingError as exc:
    record("Consolidated DWG export", False, str(exc))

# ---------------------------------------------------------------------------
# Final summary
# ---------------------------------------------------------------------------

section("FINAL SUMMARY")
n_pass = sum(1 for _, passed, _ in RESULTS if passed)
n_total = len(RESULTS)
print(f"{n_pass}/{n_total} checks passed.")
if n_pass != n_total:
    print("FAILING CHECKS:")
    for name, passed, detail in RESULTS:
        if not passed:
            print(f"  FAIL  {name}" + (f"  -- {detail}" if detail else ""))
sys.exit(0 if n_pass == n_total else 1)
