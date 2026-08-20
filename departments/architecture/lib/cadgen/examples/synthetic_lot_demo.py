"""
departments/architecture/lib/cadgen/examples/synthetic_lot_demo.py

Foundation-phase validation harness for the cadgen library. Runs the full
pipeline (generate -> DXF/SVG -> compliance verification -> DWG round-trip
-> titleblock stamp-language audit) against a SYNTHETIC test lot defined
inline below -- deliberately NOT the real 377/1 parcel, which is still
missing a room program and confirmed parcel boundary geometry (see
departments/architecture/reports/cad-tooling-gap-analysis.md, Section 7,
and the founder's brief for this build pass). Every number below that isn't
explicitly labeled "from the task prompt" was authored for this test and is
labeled as such -- nothing here should ever be mistaken for real intake.

Run with:
    python "departments/architecture/lib/cadgen/examples/synthetic_lot_demo.py"

Exits non-zero if any check fails, so this doubles as a regression test for
future passes.
"""

from __future__ import annotations

import sys
from pathlib import Path

LIB_DIR = Path(__file__).resolve().parents[2]  # .../departments/architecture/lib
if str(LIB_DIR) not in sys.path:
    sys.path.insert(0, str(LIB_DIR))

import ezdxf  # noqa: E402

from cadgen import export_dwg as export_dwg_mod  # noqa: E402
from cadgen import plan as plan_mod  # noqa: E402
from cadgen import titleblock as titleblock_mod  # noqa: E402
from cadgen.model import Building, Level, polygon_area  # noqa: E402

OUTPUT_DIR = Path(__file__).resolve().parent / "output"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

RESULTS: list[tuple[str, bool, str]] = []  # (check name, passed, detail)


def record(name: str, passed: bool, detail: str = "") -> None:
    RESULTS.append((name, passed, detail))
    print(f"{'PASS' if passed else 'FAIL'}  {name}" + (f"  -- {detail}" if detail else ""))


def section(title: str) -> None:
    print("\n" + "=" * 78)
    print(title)
    print("=" * 78)


# ---------------------------------------------------------------------------
# 1. Synthetic intake
#
# Lot size, TAKS, KAKS, front setback and side setback are taken directly
# from the task prompt's own example ("a plain rectangular 15m x 20m lot,
# TAKS 0.35/KAKS 1.0/front setback 5m/side setback 3m"). Everything else
# below (rear setback, max height/gabari, red grade elevation, ground-floor
# offset band, and the 3-room program's names/areas) was NOT specified
# there and was authored here to complete a runnable synthetic case --
# each is labeled inline.
# ---------------------------------------------------------------------------

section("1. Synthetic intake (NOT the real 377/1 parcel)")

lot = plan_mod.LotGeometry(
    width=15.0,  # from the task prompt
    depth=20.0,  # from the task prompt
    source_note="SYNTHETIC TEST DATA -- rectangular 15m x 20m lot, per the task prompt's own example. Not a real parcel.",
)

setbacks = plan_mod.Setbacks(
    front=5.0,  # from the task prompt
    rear=3.0,  # AUTHORED for this test (not specified in the prompt) -- chosen equal to the given side setback for a symmetric synthetic case, purely to exercise the rear-setback check.
    side_left=3.0,  # from the task prompt ("side setback 3m", applied symmetrically)
    side_right=3.0,  # see above
)

zoning = plan_mod.ZoningConstraints(
    taks=0.35,  # from the task prompt
    kaks=1.0,  # from the task prompt
    max_height=6.50,  # AUTHORED -- not specified in the prompt; generous headroom above the single-story building this test produces, chosen only so the height/gabari check has a real (non-trivial) limit to compare against.
    setbacks=setbacks,
    source_note="SYNTHETIC TEST DATA -- TAKS/KAKS/front-setback/side-setback per the task prompt; rear setback and max_height authored for this test (see inline comments). Not a real imar durumu document.",
    min_ground_floor_offset=0.15,  # AUTHORED -- a plausible schematic freeboard-above-red-grade rule, not from any real plan notes document.
    max_ground_floor_offset=0.60,  # AUTHORED, same basis as above.
)

program = [
    plan_mod.RoomSpec(name="Living Room", target_area=24.0, program_tag="living"),  # AUTHORED ("a trivial 3-room program" per the prompt)
    plan_mod.RoomSpec(name="Bedroom", target_area=14.0, program_tag="bedroom"),
    plan_mod.RoomSpec(name="Bathroom", target_area=6.0, program_tag="bath"),
]

RED_GRADE_ELEVATION = 100.00  # AUTHORED -- an arbitrary absolute datum value for the synthetic site.
GROUND_FLOOR_ELEVATION = 0.30  # AUTHORED -- within [min_ground_floor_offset, max_ground_floor_offset] above.
FLOOR_TO_FLOOR_HEIGHT = 3.0  # AUTHORED -- typical single-story residential floor-to-floor.

print(f"Lot: {lot.width}m x {lot.depth}m = {lot.area():.1f} m2")
print(f"TAKS {zoning.taks} -> max footprint {lot.area() * zoning.taks:.2f} m2")
print(f"KAKS {zoning.kaks} -> max construction area {lot.area() * zoning.kaks:.2f} m2")
print(f"Setbacks: front {setbacks.front}m, rear {setbacks.rear}m, side {setbacks.side_left}/{setbacks.side_right}m")
print(f"Room program: {[(r.name, r.target_area) for r in program]}, net total {sum(r.target_area for r in program):.1f} m2")

envelope = plan_mod.compute_buildable_envelope(lot, setbacks)
print(f"Buildable envelope (setbacks only): {envelope} = {polygon_area(envelope):.2f} m2")

# ---------------------------------------------------------------------------
# 2. Generate the valid plan
# ---------------------------------------------------------------------------

section("2. Generate valid plan")

building = plan_mod.generate_plan(
    name="Synthetic Test Lot -- Single-Family Residence (schematic)",
    lot=lot,
    zoning=zoning,
    program=program,
    red_grade_elevation=RED_GRADE_ELEVATION,
    ground_floor_elevation=GROUND_FLOOR_ELEVATION,
    floor_to_floor_height=FLOOR_TO_FLOOR_HEIGHT,
)

footprint = building.footprints[0]
print(f"Generated footprint: {footprint} = {building.footprint_area(0):.2f} m2")
print(f"Walls: {len(building.walls)}, Rooms: {len(building.rooms)}, Openings: {len(building.openings)}")
for room in building.rooms:
    target = next(r.target_area for r in program if r.name == room.name)
    print(f"  Room {room.id!r} ({room.name}): actual {room.area():.2f} m2 (target was {target:.1f} m2)")
for opening in building.openings:
    print(f"  Opening {opening.id!r} mark={opening.mark} type={opening.type.value} width={opening.width:.2f}m on {opening.host_wall_id}")

titleblock_info = titleblock_mod.TitleBlockInfo(
    project_name="Synthetic Test Lot",
    parcel_id="SYNTHETIC -- not a real parcel (foundation-phase validation only)",
    date="2026-08-20",
    scale="1:100 (schematic)",
    sheet_number="A-101",
    sheet_title="Ground Floor Plan",
)

valid_dxf_path = OUTPUT_DIR / "valid_plan.dxf"
valid_svg_path = OUTPUT_DIR / "valid_plan.svg"
plan_mod.render_dxf(building, lot, zoning, valid_dxf_path, titleblock_info=titleblock_info)
plan_mod.render_svg(building, lot, zoning, valid_svg_path, titleblock_info=titleblock_info)
print(f"Wrote {valid_dxf_path}")
print(f"Wrote {valid_svg_path}")

# ---------------------------------------------------------------------------
# 3. Inspect the generated DXF directly (layers, entity counts, dimensions)
# ---------------------------------------------------------------------------

section("3. Inspect generated DXF directly")


def inspect_dxf(path: Path) -> tuple[dict[str, int], list[str], list[float]]:
    doc = ezdxf.readfile(str(path))
    msp = doc.modelspace()
    counts: dict[str, int] = {}
    for e in msp:
        counts[e.dxftype()] = counts.get(e.dxftype(), 0) + 1
    layers = sorted({e.dxf.layer for e in msp})
    dim_values = []
    for e in msp:
        if e.dxftype() == "DIMENSION":
            dim_values.append(e.get_measurement())
    return counts, layers, dim_values


counts, layers, dim_values = inspect_dxf(valid_dxf_path)
print(f"Entity counts: {counts}")
print(f"Layers used ({len(layers)}): {layers}")
print(f"Dimension entity measured values (m): {sorted(dim_values)}")

expected_dims = sorted([
    lot.width, lot.depth,  # lot width/depth
    footprint[1][0] - footprint[0][0],  # footprint width
    footprint[2][1] - footprint[1][1],  # footprint depth
    # dimensioned setbacks are the AS-BUILT distances (what's actually on the
    # sheet), not the zoning minimums -- this generator sizes the footprint
    # to the program, not to the max legal envelope, so actual rear/left/
    # right can legitimately be larger than the required minimum. The
    # compliance check (section 4 below) is what verifies each as-built
    # distance against its required minimum.
    footprint[0][1] - 0.0,  # actual front setback
    lot.depth - footprint[2][1],  # actual rear setback
    footprint[0][0] - 0.0,  # actual left setback
    lot.width - footprint[1][0],  # actual right setback
])
dims_match = all(abs(a - b) < 1e-6 for a, b in zip(sorted(dim_values), expected_dims)) and len(dim_values) == len(expected_dims)
record(
    "Every DIMENSION entity's measured value traces back to synthetic intake",
    dims_match,
    f"drawn={sorted(round(v, 3) for v in dim_values)} expected={sorted(round(v, 3) for v in expected_dims)}",
)

expected_layers = set(plan_mod.LAYERS.values())
layers_ok = expected_layers.issubset(set(layers))
record("Expected AIA/NCS-style layers present in DXF", layers_ok, f"missing={expected_layers - set(layers)}" if not layers_ok else "")

# Extra rigor: confirm the in-memory Building's own computed figures match
# what actually got drawn -- proves render_dxf() faithfully transcribes the
# model, not just that both happen to look plausible independently.
_doc_check = ezdxf.readfile(str(valid_dxf_path))
_dxf_footprint_polys = [
    [(float(x), float(y)) for x, y in e.get_points("xy")]
    for e in _doc_check.modelspace()
    if e.dxftype() == "LWPOLYLINE" and e.dxf.layer == plan_mod.LAYERS["footprint"]
]
dxf_footprint_area = polygon_area(_dxf_footprint_polys[0])
record(
    "In-memory Building.footprint_area() matches the footprint polygon actually drawn in the DXF",
    abs(building.footprint_area(0) - dxf_footprint_area) < 1e-6,
    f"in-memory={building.footprint_area(0):.4f} m2, dxf-drawn={dxf_footprint_area:.4f} m2",
)

# ---------------------------------------------------------------------------
# 4. Compliance verification -- valid case (expect all PASS)
# ---------------------------------------------------------------------------

section("4a. Compliance verification -- valid synthetic plan (expect ALL PASS)")

valid_report = plan_mod.verify_compliance(valid_dxf_path, lot, zoning)
print(valid_report.summary())
record("Compliance check: valid plan passes every check", valid_report.all_passed)

# ---------------------------------------------------------------------------
# 4b. Compliance verification -- deliberately broken variant A: front setback
# ---------------------------------------------------------------------------

section("4b. Compliance verification -- BROKEN variant A: footprint inside front setback")

broken_a = Building(name="BROKEN TEST -- front setback violation", red_grade_elevation=RED_GRADE_ELEVATION)
broken_a.levels.append(Level(index=0, name="Ground Floor", finished_floor_elevation=GROUND_FLOOR_ELEVATION, floor_to_floor_height=FLOOR_TO_FLOOR_HEIGHT))
bad_front_offset = 1.0  # meters from the lot's front line -- required minimum is 5.0m
bad_footprint_a = [(4.0, bad_front_offset), (10.0, bad_front_offset), (10.0, bad_front_offset + 6.0), (4.0, bad_front_offset + 6.0)]
plan_mod.build_level_geometry(
    broken_a, bad_footprint_a, program, level=0,
    finished_floor_elevation=GROUND_FLOOR_ELEVATION, floor_to_floor_height=FLOOR_TO_FLOOR_HEIGHT,
)
broken_a_path = OUTPUT_DIR / "broken_front_setback.dxf"
plan_mod.render_dxf(broken_a, lot, zoning, broken_a_path)
broken_a_report = plan_mod.verify_compliance(broken_a_path, lot, zoning)
print(broken_a_report.summary())

front_check = next(c for c in broken_a_report.checks if c.name == "Front setback")
other_checks_a = [c for c in broken_a_report.checks if c.name != "Front setback"]
isolated_failure_a = (not front_check.passed) and all(c.passed for c in other_checks_a)
record(
    "Compliance check: catches a real front-setback violation (footprint at 1.0m vs required 5.0m), and ONLY that check",
    isolated_failure_a,
    f"front_setback actual={front_check.actual:.2f}m required>={front_check.limit:.2f}m; other checks all passed={all(c.passed for c in other_checks_a)}",
)

# ---------------------------------------------------------------------------
# 4c. Compliance verification -- deliberately broken variant B: TAKS coverage
# ---------------------------------------------------------------------------

section("4c. Compliance verification -- BROKEN variant B: footprint exceeds TAKS coverage")

broken_b = Building(name="BROKEN TEST -- TAKS coverage violation", red_grade_elevation=RED_GRADE_ELEVATION)
broken_b.levels.append(Level(index=0, name="Ground Floor", finished_floor_elevation=GROUND_FLOOR_ELEVATION, floor_to_floor_height=FLOOR_TO_FLOOR_HEIGHT))
# Uses the RAW setback-only envelope (ignores the TAKS cap) as the footprint
# -- stays fully within every setback, but covers more of the lot than TAKS allows.
raw_envelope = plan_mod.compute_buildable_envelope(lot, setbacks)
plan_mod.build_level_geometry(
    broken_b, raw_envelope, program, level=0,
    finished_floor_elevation=GROUND_FLOOR_ELEVATION, floor_to_floor_height=FLOOR_TO_FLOOR_HEIGHT,
)
broken_b_path = OUTPUT_DIR / "broken_taks_coverage.dxf"
plan_mod.render_dxf(broken_b, lot, zoning, broken_b_path)
broken_b_report = plan_mod.verify_compliance(broken_b_path, lot, zoning)
print(broken_b_report.summary())

taks_check = next(c for c in broken_b_report.checks if c.name == "TAKS (lot coverage)")
other_checks_b = [c for c in broken_b_report.checks if c.name != "TAKS (lot coverage)"]
isolated_failure_b = (not taks_check.passed) and all(c.passed for c in other_checks_b)
record(
    "Compliance check: catches a real TAKS coverage violation (0.36 vs limit 0.35), and ONLY that check",
    isolated_failure_b,
    f"taks actual={taks_check.actual:.4f} limit<={taks_check.limit:.4f}; other checks all passed={all(c.passed for c in other_checks_b)}",
)

# ---------------------------------------------------------------------------
# 5. DWG round-trip: export the valid plan, read it back, compare content
# ---------------------------------------------------------------------------

section("5. DWG round-trip (export_dwg.py)")

try:
    dwg_path = export_dwg_mod.export_dwg(valid_dxf_path, OUTPUT_DIR / "valid_plan.dwg")
    print(f"Exported {dwg_path} ({dwg_path.stat().st_size:,} bytes)")

    roundtrip_doc = export_dwg_mod.read_dwg(dwg_path)
    roundtrip_dxf_path = OUTPUT_DIR / "valid_plan_roundtrip.dxf"
    roundtrip_doc.saveas(str(roundtrip_dxf_path))
    print(f"Read back and re-saved as {roundtrip_dxf_path}")

    rt_counts, rt_layers, rt_dims = inspect_dxf(roundtrip_dxf_path)
    print(f"Original entity counts:   {counts}")
    print(f"Round-tripped counts:     {rt_counts}")
    print(f"Original layers ({len(layers)}):      {layers}")
    print(f"Round-tripped layers ({len(rt_layers)}): {rt_layers}")

    counts_match = counts == rt_counts
    layers_match = set(layers) == set(rt_layers)
    record("DWG round-trip: entity counts survive intact", counts_match, f"original={counts} roundtrip={rt_counts}")
    record("DWG round-trip: layers survive intact", layers_match, f"original={sorted(layers)} roundtrip={sorted(rt_layers)}")

    roundtrip_report = plan_mod.verify_compliance(roundtrip_dxf_path, lot, zoning)
    print(roundtrip_report.summary())
    record("DWG round-trip: compliance check still passes on the DXF->DWG->DXF roundtripped file", roundtrip_report.all_passed)

except export_dwg_mod.ODAConverterMissingError as exc:
    record("DWG round-trip", False, f"ODA File Converter not available: {exc}")

# ---------------------------------------------------------------------------
# 6. Title block: inspect generated text entities for approval-stamp language
# ---------------------------------------------------------------------------

section("6. Title block -- approval-stamp language audit")

clean_violations = titleblock_mod.scan_dxf_for_stamp_language(valid_dxf_path)
print(f"Violations found in generated plan's text entities: {len(clean_violations)}")
for v in clean_violations:
    print(f"  {v}")
record("Generated DXF's text entities contain zero approval-stamp language", len(clean_violations) == 0)

# Negative tests: prove the guard actually catches real violations, not just
# that it passes on clean input.
try:
    titleblock_mod.assert_no_stamp_language("...ilgili mevzuat hukumlerine gore incelenerek onaylanmistir...")
    guard_raised = False
except titleblock_mod.ApprovalStampLanguageError:
    guard_raised = True
record("assert_no_stamp_language() raises on real stamp text", guard_raised)

bad_doc = ezdxf.new("R2018")
bad_doc.modelspace().add_text(
    "KARAMURSEL BELEDIYESI BASKANLIGI -- incelenerek onaylanmistir",
    dxfattribs={"layer": "0", "height": 0.2},
)
bad_stamp_path = OUTPUT_DIR / "negative_test_stamp_language.dxf"
bad_doc.saveas(str(bad_stamp_path))
scanner_violations = titleblock_mod.scan_dxf_for_stamp_language(bad_stamp_path)
record("scan_dxf_for_stamp_language() catches a deliberately-injected stamp phrase", len(scanner_violations) >= 1, f"found {len(scanner_violations)} violation(s)")

# ---------------------------------------------------------------------------
# Final summary
# ---------------------------------------------------------------------------

section("FINAL SUMMARY")

n_pass = sum(1 for _, ok, _ in RESULTS if ok)
n_total = len(RESULTS)
for name, ok, detail in RESULTS:
    print(f"{'PASS' if ok else 'FAIL'}  {name}")
print(f"\n{n_pass}/{n_total} checks passed")

if n_pass != n_total:
    sys.exit(1)
