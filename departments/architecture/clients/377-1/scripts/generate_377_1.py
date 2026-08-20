"""
departments/architecture/clients/377-1/scripts/generate_377_1.py

Full generation script for parcel 377/1 -- the multi-unit apartment-building
pass (see ../notes/rationale.md, design-judgment section, for the sourced
reasoning behind every number below). Every input here traces to a specific
citation in rationale.md; this file is the SAVED source of truth for how the
CAD set was produced -- closing a gap flagged by the previous (single-family)
pass's own rationale.md (Section 8's schedule.py account): "save the
LevelSpec/generation script itself alongside the CAD output, not just the
rendered files, so future modules don't need to reconstruct-and-cross-validate."

Run with:
    python "departments/architecture/clients/377-1/scripts/generate_377_1.py"

Regenerates every plan/schedule/parking/elevation/section/calc-table sheet
for 377/1 into ../cad/, runs the full compliance + core-alignment +
stamp-language verification suite, and prints a pass/fail summary. Exits
non-zero if anything fails.
"""

from __future__ import annotations

import sys
from pathlib import Path

# Windows console default (cp1252) can't encode this script's Turkish
# diacritics (asansor bosluğu, cekirdek, etc.) in plain print() calls --
# force UTF-8 stdout/stderr so the script can actually run to completion on
# this machine instead of crashing partway through with UnicodeEncodeError
# (a real failure hit while first running this script, see rationale.md).
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
# 1. Intake -- unchanged from the single-family pass; see brief.md / CLAUDE.md
# for source citations (imardurumu.pdf, minuspalityimardurumu.pdf, plannotes.pdf)
# ---------------------------------------------------------------------------

section("1. Intake (unchanged from the single-family pass -- see brief.md/CLAUDE.md for citations)")

lot = plan_mod.LotGeometry(
    width=36.02, depth=19.80,
    source_note="Visual-proportion estimate off imardurumu.pdf/minuspalityimardurumu.pdf's plotted schema, anchored to the confirmed 713.26 m2 area -- not a surveyed dimension (see rationale.md).",
)
setbacks = plan_mod.Setbacks(front=5.0, rear=3.0, side_left=3.0, side_right=3.0)
zoning = plan_mod.ZoningConstraints(
    taks=0.25, kaks=1.00, max_height=14.65,
    setbacks=setbacks,
    source_note="imardurumu.pdf / minuspalityimardurumu.pdf (TAKS/KAKS/setbacks/Kat Adedi); rear setback via Planli Alanlar Imar Yonetmeligi Madde 23(1)(c); max_height re-derived from plan notes item 4.2.4 + ground_floor_elevation, see rationale.md Section 1.",
    min_ground_floor_offset=0.0, max_ground_floor_offset=1.0,
    roof_ridge_max_above_top_slab=5.50,
)
RED_GRADE_ELEVATION = 0.0  # still a placeholder -- no plankote provided, see rationale.md
GROUND_FLOOR_ELEVATION = 0.15

print(f"Lot: {lot.width}m x {lot.depth}m = {lot.area():.2f} m2")
print(f"TAKS {zoning.taks} -> max footprint {lot.area() * zoning.taks:.2f} m2")
print(f"KAKS {zoning.kaks} -> max total construction {lot.area() * zoning.kaks:.2f} m2")

# ---------------------------------------------------------------------------
# 2. Design-judgment decisions (see rationale.md for the full reasoning)
#
# - Shared vertical core (CoreSpec): stair + elevator shaft, identical
#   (x, y) footprint on every level -- fixes the core-alignment bug found
#   this pass (see rationale.md).
# - Zemin kat: shared entry lobby + management/mechanical room only (no
#   longer a single-family living/kitchen program -- that assumption is
#   resolved away this pass). Main building entrance opens directly into
#   the lobby/core (entry_at_core_front=True).
# - 1st/2nd/3rd normal kat: 2 independent 2+1 apartment units per floor,
#   served by the shared core via a common corridor
#   (build_level_geometry_multiunit()) -- the unit-count recommendation
#   from rationale.md Section on unit count.
# - Bodrum kat: stays parking/service (reverse-duplex judged
#   conditionally-feasible but NOT implemented as geometry this pass -- see
#   rationale.md). Footprint deepened to fit real drawn parking stalls
#   (parking.py), sized to the 6-daire otopark requirement.
# - Cati piyesi: stays small roof terrace/mechanical enclosure, now also
#   served by the same core (roof access), unchanged program otherwise.
# ---------------------------------------------------------------------------

section("2. Shared core + level programs")

CORE = plan_mod.CoreSpec(width=3.00, depth=2.60)
print(f"CoreSpec: {CORE.width}m x {CORE.depth}m, area {CORE.width * CORE.depth:.2f} m2 "
      f"(>= plan notes item 4.2.55's 3.00 m2 asansor bosluğu minimum, plus stair run)")

# -- Bodrum Kat (index -1) ---------------------------------------------------
bodrum_program = [
    plan_mod.RoomSpec("Kapali Otopark", 150.0, "parking"),  # sized generously; real stall geometry drawn by parking.py against the actual room, see Section 5
    plan_mod.RoomSpec("Mekanik Tesisat Odasi", 12.0, "mechanical"),
    plan_mod.RoomSpec("Depo Kiler", 10.0, "storage"),
    plan_mod.RoomSpec("Siginak", 14.0, "life-safety"),
]

# -- Zemin Kat (index 0) ------------------------------------------------------
zemin_program = [
    plan_mod.RoomSpec("Giris Lobisi", 28.0, "circulation"),
    plan_mod.RoomSpec("Yonetim Depo Odasi", 10.0, "service"),
]

# -- 1./2./3. Normal Kat (index 1/2/3) -- 2 units per floor, identical -------


def make_unit() -> list[plan_mod.RoomSpec]:
    return [
        plan_mod.RoomSpec("Salon", 26.0, "living"),
        plan_mod.RoomSpec("Mutfak", 11.0, "kitchen"),
        plan_mod.RoomSpec("Yatak Odasi 1", 14.0, "bedroom"),
        plan_mod.RoomSpec("Yatak Odasi 2", 11.0, "bedroom"),
        plan_mod.RoomSpec("Banyo WC", 6.0, "bath"),
    ]


# -- Cati Piyesi (index 4) ----------------------------------------------------
piyes_program = [
    plan_mod.RoomSpec("Kapali Teras Odasi", 18.0, "flex"),
    plan_mod.RoomSpec("Mekanik Solar Ekipman Odasi", 6.0, "mechanical"),
]

NORMAL_KAT_DEPTH = 5.70  # meters, explicit -- see rationale.md for why (fits KAKS budget + gives a real corridor+2-unit plan, not a sliver)
ZEMIN_DEPTH = 5.70  # matches normal kat's footprint width AND depth -- closes (for these two levels) the previously-flagged "independent footprint per level, not real structural stacking" simplification
BODRUM_DEPTH = 11.70  # meters -- CORRECTED this pass (was 10.90m): the room's own INTERIOR depth is footprint depth minus the exterior wall thickness (0.25m), so a 10.90m footprint only left a 10.65m-deep Kapali Otopark room -- 0.55m short of the 11.20m parking.py actually needs (stall 4.90m + two-way aisle 6.00m + 2x0.15m wall margin, Otopark Yonetmeligi Madde 5(1)(h)(7)/(8)). Confirmed empirically by first running compute_parking_layout() against the as-generated bodrum kat and getting a real ValueError, not assumed. 11.70m gives an 11.45m-deep room (0.25m of real margin over the 11.20m need) while staying inside the 11.80m setback-envelope depth (rear setback actual comes out 3.10m, still >= the 3.00m minimum) -- see rationale.md for the full account of this as a real, caught-and-fixed design conflict, not a zoning-number workaround.

level_specs = [
    plan_mod.LevelSpec(
        index=-1, name="Bodrum Kat", program=bodrum_program, floor_to_floor_height=4.80,
        footprint_style="explicit_depth", explicit_depth=BODRUM_DEPTH,
        door_width=1.00, count_toward_taks=False, count_toward_kaks=False,
    ),
    plan_mod.LevelSpec(
        index=0, name="Zemin Kat", program=zemin_program, floor_to_floor_height=4.00,
        footprint_style="explicit_depth", explicit_depth=ZEMIN_DEPTH,
        door_width=1.50, entry_at_core_front=True, count_toward_taks=True, count_toward_kaks=True,
    ),
    plan_mod.LevelSpec(
        index=1, name="1. Normal Kat", units=[make_unit(), make_unit()], floor_to_floor_height=3.50,
        footprint_style="explicit_depth", explicit_depth=NORMAL_KAT_DEPTH,
        corridor_depth=1.20, count_toward_taks=False, count_toward_kaks=True,
    ),
    plan_mod.LevelSpec(
        index=2, name="2. Normal Kat", units=[make_unit(), make_unit()], floor_to_floor_height=3.50,
        footprint_style="explicit_depth", explicit_depth=NORMAL_KAT_DEPTH,
        corridor_depth=1.20, count_toward_taks=False, count_toward_kaks=True,
    ),
    plan_mod.LevelSpec(
        index=3, name="3. Normal Kat", units=[make_unit(), make_unit()], floor_to_floor_height=3.50,
        footprint_style="explicit_depth", explicit_depth=NORMAL_KAT_DEPTH,
        corridor_depth=1.20, count_toward_taks=False, count_toward_kaks=True,
    ),
    plan_mod.LevelSpec(
        index=4, name="Cati Piyesi", program=piyes_program, floor_to_floor_height=2.60,
        footprint_style="fitted", door_width=1.00, count_toward_taks=False, count_toward_kaks=False,
    ),
]

building = plan_mod.generate_multilevel_plan(
    name="Parcel 377-1 -- Multi-Unit Apartment Building (schematic)",
    lot=lot, zoning=zoning, level_specs=level_specs,
    red_grade_elevation=RED_GRADE_ELEVATION, ground_floor_elevation=GROUND_FLOOR_ELEVATION,
    core=CORE,
)

TOTAL_DWELLING_UNITS = 2 * 3  # 2 units/floor x 3 normal kat floors -- zemin/bodrum/piyes are not dwelling units
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
    -1: ("A-101", "Bodrum Kat Plani"),
    0: ("A-102", "Zemin Kat Plani"),
    1: ("A-103", "1. Normal Kat Plani"),
    2: ("A-104", "2. Normal Kat Plani"),
    3: ("A-105", "3. Normal Kat Plani"),
    4: ("A-106", "Cati Piyesi Plani"),
}
SLUGS = {
    -1: "bodrum-kat", 0: "zemin-kat", 1: "1-normal-kat", 2: "2-normal-kat", 3: "3-normal-kat", 4: "cati-piyesi",
}


def titleblock_for(level: int, scale: str = "1:100 (schematic)") -> titleblock_mod.TitleBlockInfo:
    sheet_no, sheet_title = SHEETS[level]
    return titleblock_mod.TitleBlockInfo(
        project_name="Parcel 377/1 -- Ereğli Mah., Karamursel, Kocaeli (multi-unit apartment building)",
        parcel_id="Ada 377 / Parsel 1, Tapu Kutugu Eregli, Pafta G23D04D3D",
        date="2026-08-20", scale=scale, sheet_number=sheet_no, sheet_title=sheet_title,
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
        project_name="Parcel 377/1 -- Ereğli Mah., Karamursel, Kocaeli (multi-unit apartment building)",
        parcel_id="Ada 377 / Parsel 1, Tapu Kutugu Eregli, Pafta G23D04D3D",
        date="2026-08-20", scale="N/A (schedule table)",
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
# 6. Core alignment verification (the specific bug this pass fixes)
# ---------------------------------------------------------------------------

section("6. Core (stair/elevator shaft) alignment verification")

core_report = plan_mod.verify_core_alignment(plan_dxf_paths, CORE)
print(core_report.summary())
record("Core alignment: identical shaft footprint on every level", core_report.all_passed, f"{sum(c.passed for c in core_report.checks)}/{len(core_report.checks)}")

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

PROJECT_NAME = "Parcel 377/1 -- Ereğli Mah., Karamursel, Kocaeli (multi-unit apartment building)"
PARCEL_ID = "Ada 377 / Parsel 1, Tapu Kutugu Eregli, Pafta G23D04D3D"


def _tb(sheet_number: str, sheet_title: str, scale: str = "1:100 (schematic)") -> titleblock_mod.TitleBlockInfo:
    return titleblock_mod.TitleBlockInfo(
        project_name=PROJECT_NAME, parcel_id=PARCEL_ID, date="2026-08-20", scale=scale,
        sheet_number=sheet_number, sheet_title=sheet_title,
    )


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
# Re-derived, in-memory, from the same building.levels this whole session was
# already compliance-verified against (Section 5/6) -- what every elevation's
# own re-read-from-disk XDATA height bounds are checked against just below.
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

    # Re-derive the just-written DXF's own XDATA height bounds fresh from
    # disk (not the in-memory Facade) and check against the SAME source
    # figures the mandatory compliance pass already verified in Section 5/6
    # -- not a second, independently-typed number.
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
# the founder's 373-6 reference format. Built by importing each already-
# generated, already-verified sheet DXF's modelspace entities into its own
# paperspace layout of one shared ezdxf Document via ezdxf.addons.importer
# (each per-sheet DXF stays the authoritative, independently-verifiable
# source; this step is pure presentation-layer consolidation, not a second
# geometry-generation path).
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

# ezdxf.new() creates one default empty paperspace layout ("Layout1") that
# none of our sheets used -- drop it so the tab set exactly matches the 19
# real sheets, not 19 + 1 stray blank tab.
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

    # Verify by READING IT BACK -- not just trusting the write call succeeded
    # (per the founder's explicit instruction: confirm the file actually
    # opens with multiple distinct layout tabs by reading it back with
    # ezdxf, not just trusting the write).
    reread_doc = export_dwg_mod.read_dwg(consolidated_dwg_path)
    reread_layouts = reread_doc.layouts.names()
    missing = [n for n in layout_names_written if n not in reread_layouts]
    record(
        "Consolidated DWG re-read from disk: all 19 sheet layout tabs present",
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
