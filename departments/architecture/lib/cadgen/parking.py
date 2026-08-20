"""
departments/architecture/lib/cadgen/parking.py

Real, to-scale parking-stall layout generator. Reads a level's existing
"Kapali Otopark" room (already drawn by plan.py's bay-slicing on the basement
sheet, tagged `program_tag="parking"`) from a model.Building, and lays out
real stall-by-stall geometry -- individual stall rectangles + a real drive
aisle, sized per the national Otopark Yonetmeligi -- inside that room's own
boundary. This closes the gap flagged for 377/1: the basement's "Kapali
Otopark" was previously a labeled program-tagged zone, not drawn parking
geometry.

Sourced dimensions -- read directly from the Otopark Yonetmeligi text
(RG 22.02.2018, Sayi 30340, plus its Ek-1 annex), not summarized from a
secondary source:

- Stall size, maneuvering area excluded: a passenger-car stall must be
  >= 2.40 m x 4.90 m ("Otoparklarin tefrisinde ... binek otolari icin en az
  2,40x4,90 metre ... olculeri esas alinir", Madde 5(1)(h)(8)).
- "Birim otopark alani" (stall + its share of aisle/maneuvering area) must
  be >= 20 m2 per car, camyon/otobus excluded ("Binek otolari icin birim
  park alani, manevra alani dahil en az 20 m2'dir", Madde 4(1)(c)).
- Two-way drive aisle for a 90-degree stall arrangement, in a building's OWN
  parking (not a public/umumi otopark): >= 6.00 m combined
  approach-and-return width ("Umumi otoparklarda ... toplami 6,50 metreden
  az olamaz. Umumi otoparklar haricinde bu olcu 6,00 metreden az olamaz",
  Madde 5(1)(h)(7)).
- Parking entry door: >= 2.75 m net width, >= 2.00 m net height
  (Madde 5(1)(h)(2)/(3)). Interior clear height (kiris alti dahil):
  >= 2.10 m anywhere (Madde 5(1)(h)(4)).
- Ramp: width >= 2.75 m, turning radius >= 2.75 m inner, slope <= %20 for a
  building's own-need parking (Madde 5(1)(h)(5)/(6); plan notes item 4.2.66
  independently agrees, also %20 -- both sources converge).

Required stall COUNT: the Otopark Yonetmeligi's own annex (Ek-1) sets the
national baseline for residential use as a flat "1- Meskenler: Her daire
icin [1 otopark]" -- 1 space per dwelling unit, not scaled by net area
(unlike the commercial-use rows in the same table, which ARE m2-scaled).
No Kocaeli-specific stricter local table was found in `plannotes.pdf`
(the department's usual first-check source for local overrides); this is
flagged explicitly, per Madde 8(2), as the NATIONAL baseline, subject to
verification against Kocaeli Buyuksehir Belediyesi's own resolution before
a real permit application -- same "research to verify" framing the
department applies to every other zoning figure.

Foundation-phase scope: single-loaded row layout only (stalls along one
side of the basement, aisle running the width of the room) -- not a
two-sided/double-loaded layout (the ~11.8m setback-envelope depth doesn't
comfortably fit two stall rows + a shared aisle, see rationale.md), and not
an accessible/engelli stall variant (Madde 5(1)(h)(9) requires a >= 3.50 m
short side for those -- not modeled separately this pass, flagged as a
follow-up for the full-production tier).
"""

from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path

import ezdxf
import svgwrite

from . import plan as plan_mod
from .model import Building, Room, bounding_box, polygon_area
from .titleblock import DISCLAIMER, TitleBlockInfo, assert_no_stamp_language, draw_titleblock

APPID = plan_mod.APPID
PARKING_XDATA_MARKER = "SIRKETIM-CADGEN-PARKING-V1"

STALL_WIDTH = 2.40  # meters, Otopark Yonetmeligi Madde 5(1)(h)(8)
STALL_DEPTH = 4.90  # meters, Otopark Yonetmeligi Madde 5(1)(h)(8)
AISLE_WIDTH = 6.00  # meters, two-way, 90-degree, own-need/private parking, Madde 5(1)(h)(7)
UNIT_PARK_AREA_MIN = 20.0  # m2/car incl. maneuvering, Madde 4(1)(c)
WALL_MARGIN = 0.15  # meters, clearance kept off the room's own bounding walls

LAYERS = dict(plan_mod.LAYERS)
LAYERS["parking_stall"] = "A-PARK-STAL"
LAYERS["parking_aisle"] = "A-PARK-CIRC"
LAYER_COLORS = dict(plan_mod.LAYER_COLORS)
LAYER_COLORS[LAYERS["parking_stall"]] = 5  # blue, cosmetic only
LAYER_COLORS[LAYERS["parking_aisle"]] = 8  # grey, cosmetic only


@dataclass
class ParkingLayoutResult:
    room_id: str
    stalls: list[list[tuple[float, float]]]
    aisle: list[tuple[float, float]]
    required_stalls: int
    provided_stalls: int

    @property
    def fits(self) -> bool:
        return self.provided_stalls >= self.required_stalls


def find_parking_room(building: Building, level: int, *, program_tag: str = "parking") -> Room:
    candidates = [r for r in building.rooms_on_level(level) if r.program_tag == program_tag]
    if not candidates:
        raise ValueError(f"No room with program_tag={program_tag!r} found on level {level} -- nothing to lay out stalls inside.")
    if len(candidates) > 1:
        raise ValueError(f"Multiple rooms with program_tag={program_tag!r} on level {level}; find_parking_room() needs exactly one.")
    return candidates[0]


def compute_parking_layout(
    room: Room,
    required_stalls: int,
    *,
    stall_width: float = STALL_WIDTH,
    stall_depth: float = STALL_DEPTH,
    aisle_width: float = AISLE_WIDTH,
    wall_margin: float = WALL_MARGIN,
) -> ParkingLayoutResult:
    """Lays out a single-loaded row of stalls (stall_width x stall_depth
    each) along the room's own front edge, with a two-way drive aisle
    (aisle_width deep) immediately behind them, inside `room`'s own
    bounding box. Raises ValueError if the room isn't deep enough to fit
    one stall row + the mandatory aisle at all (a genuine site/program
    conflict -- not silently resolved). If the room isn't WIDE enough to
    fit `required_stalls` stalls in one row, as many as fit are laid out
    and `ParkingLayoutResult.fits` comes back False -- the caller (and the
    compliance-style verification pass) must surface that, not hide it.
    """
    x0, y0, x1, y1 = bounding_box(room.boundary)
    width = x1 - x0
    depth = y1 - y0
    usable_width = width - 2 * wall_margin
    needed_depth = stall_depth + aisle_width + 2 * wall_margin
    if depth < needed_depth:
        raise ValueError(
            f"Otopark room {room.id!r} is only {depth:.2f}m deep; needs >= {needed_depth:.2f}m "
            f"for one stall row ({stall_depth}m) + the mandatory two-way aisle ({aisle_width}m, "
            f"Otopark Yonetmeligi Madde 5(1)(h)(7)) + wall margins -- a genuine site/program "
            f"conflict, not silently resolved."
        )
    n_fit_by_width = max(0, int(usable_width // stall_width))
    n = min(required_stalls, n_fit_by_width) if n_fit_by_width > 0 else 0

    stalls: list[list[tuple[float, float]]] = []
    sx0 = x0 + wall_margin
    sy0 = y0 + wall_margin
    for i in range(n):
        sx = sx0 + i * stall_width
        stalls.append([(sx, sy0), (sx + stall_width, sy0), (sx + stall_width, sy0 + stall_depth), (sx, sy0 + stall_depth)])

    row_width = n * stall_width if n > 0 else usable_width
    aisle = [
        (sx0, sy0 + stall_depth),
        (sx0 + row_width, sy0 + stall_depth),
        (sx0 + row_width, sy0 + stall_depth + aisle_width),
        (sx0, sy0 + stall_depth + aisle_width),
    ]

    return ParkingLayoutResult(room_id=room.id, stalls=stalls, aisle=aisle, required_stalls=required_stalls, provided_stalls=n)


# ---------------------------------------------------------------------------
# DXF / SVG rendering -- draws the FULL basement level (lot/envelope/
# footprint/walls/rooms, same as plan.render_dxf/render_svg) PLUS the real
# stall/aisle geometry overlaid inside the Otopark room, so this reads as a
# complete basement parking plan, not an abstract stall diagram.
# ---------------------------------------------------------------------------


def _write_parking_xdata(msp, layout: ParkingLayoutResult) -> None:
    point = msp.add_point((0.0, 0.0), dxfattribs={"layer": LAYERS["project_data"]})
    tags: list[tuple[int, str]] = [
        (1000, PARKING_XDATA_MARKER),
        (1000, f"required_stalls={layout.required_stalls}"),
        (1000, f"provided_stalls={layout.provided_stalls}"),
        (1000, f"stall_width={STALL_WIDTH}"),
        (1000, f"stall_depth={STALL_DEPTH}"),
        (1000, f"aisle_width={AISLE_WIDTH}"),
    ]
    point.set_xdata(APPID, tags)


def render_parking_dxf(
    building: Building,
    lot: plan_mod.LotGeometry,
    zoning: plan_mod.ZoningConstraints,
    layout: ParkingLayoutResult,
    path: str | Path,
    *,
    level: int,
    titleblock_info: TitleBlockInfo | None = None,
) -> Path:
    doc = ezdxf.new("R2018")
    doc.header["$INSUNITS"] = 6
    doc.header["$MEASUREMENT"] = 1
    doc.appids.new(APPID)
    for layer_name, color in LAYER_COLORS.items():
        doc.layers.add(name=layer_name, color=color)
    msp = doc.modelspace()

    msp.add_lwpolyline(lot.polygon(), close=True, dxfattribs={"layer": plan_mod.LAYERS["property"]})
    envelope = plan_mod.compute_buildable_envelope(lot, zoning.setbacks)
    msp.add_lwpolyline(envelope, close=True, dxfattribs={"layer": plan_mod.LAYERS["envelope"]})
    footprint = building.footprints.get(level)
    if footprint:
        msp.add_lwpolyline(footprint, close=True, dxfattribs={"layer": plan_mod.LAYERS["footprint"]})
    for wall in building.walls_on_level(level):
        layer = plan_mod.LAYERS["wall_ext"] if wall.exterior else plan_mod.LAYERS["wall_int"]
        msp.add_lwpolyline(plan_mod._wall_rectangle(wall), close=True, dxfattribs={"layer": layer})
    for room in building.rooms_on_level(level):
        msp.add_lwpolyline(room.boundary, close=True, dxfattribs={"layer": plan_mod.LAYERS["room_boundary"]})
        cx, cy = plan_mod._centroid(room.boundary)
        label = f"{room.name}\\P{room.area():.1f} m2"
        assert_no_stamp_language(label)
        mt = msp.add_mtext(label, dxfattribs={"layer": plan_mod.LAYERS["room_boundary"], "char_height": 0.20})
        mt.set_location((cx, cy))

    for i, stall in enumerate(layout.stalls, start=1):
        msp.add_lwpolyline(stall, close=True, dxfattribs={"layer": LAYERS["parking_stall"]})
        cx = sum(p[0] for p in stall) / 4.0
        cy = sum(p[1] for p in stall) / 4.0
        mark = f"P{i}"
        assert_no_stamp_language(mark)
        t = msp.add_text(mark, dxfattribs={"layer": LAYERS["parking_stall"], "height": 0.25})
        t.set_placement((cx - 0.2, cy))
    msp.add_lwpolyline(layout.aisle, close=True, dxfattribs={"layer": LAYERS["parking_aisle"]})
    aisle_label = f"Manevra / Sirkulasyon Koridoru ({AISLE_WIDTH:.2f} m)"
    assert_no_stamp_language(aisle_label)
    ax = sum(p[0] for p in layout.aisle) / 4.0
    ay = sum(p[1] for p in layout.aisle) / 4.0
    at = msp.add_text(aisle_label, dxfattribs={"layer": LAYERS["parking_aisle"], "height": 0.22})
    at.set_placement((ax - 3.0, ay))

    _write_parking_xdata(msp, layout)

    calc_lines = [
        f"Otopark ihtiyaci: {layout.required_stalls} adet (Otopark Yonetmeligi Ek-1, 'Meskenler: Her daire icin' -- "
        f"1 adet/daire x {layout.required_stalls} bagimsiz bolum -- ulusal taban deger, Kocaeli Buyuksehir "
        f"Belediyesi'nin yerel arttirimi olup olmadigi teyit edilmelidir, Madde 8(2))",
        f"Saglanan: {layout.provided_stalls} adet (2.40 m x 4.90 m/adet, Madde 5(1)(h)(8); "
        f"iki yonlu manevra koridoru {AISLE_WIDTH:.2f} m, Madde 5(1)(h)(7))",
        f"Sonuc: {'YETERLI' if layout.fits else 'YETERSIZ -- ilave otopark cozumu (rampa/mekanik/komsu parsel) gerekir'}",
    ]
    calc_text = "\n".join(calc_lines)
    assert_no_stamp_language(calc_text)
    note = msp.add_mtext(calc_text, dxfattribs={"layer": plan_mod.LAYERS["notes"], "char_height": 0.18})
    note.set_location((0.0, -2.5))

    if titleblock_info is not None:
        draw_titleblock(msp, titleblock_info, insert=(lot.width + 2.5, lot.depth - 5.4), layer=plan_mod.LAYERS["titleblock"])

    out_path = Path(path)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    doc.saveas(str(out_path))
    return out_path


def render_parking_svg(
    building: Building,
    lot: plan_mod.LotGeometry,
    zoning: plan_mod.ZoningConstraints,
    layout: ParkingLayoutResult,
    path: str | Path,
    *,
    level: int,
    titleblock_info: TitleBlockInfo | None = None,
    scale_px_per_m: float = 20.0,
    margin_m: float = 2.0,
) -> Path:
    top_strip_m = 2.4
    bottom_strip_m = 4.2
    width_px = (lot.width + margin_m * 2) * scale_px_per_m
    height_px = (lot.depth + margin_m * 2 + top_strip_m + bottom_strip_m) * scale_px_per_m

    def tx(pt: tuple[float, float]) -> tuple[float, float]:
        x, y = pt
        return ((x + margin_m) * scale_px_per_m, (lot.depth - y + margin_m + top_strip_m) * scale_px_per_m)

    dwg = svgwrite.Drawing(str(path), size=(f"{width_px}px", f"{height_px}px"), viewBox=f"0 0 {width_px} {height_px}", profile="full")
    dwg.add(dwg.rect(insert=(0, 0), size=(width_px, height_px), fill="white"))
    header = f"{building.name} -- Bodrum Kat Otopark Duzeni -- SCHEMATIC, requires licensed-architect review before permitting or construction"
    assert_no_stamp_language(header)
    dwg.add(dwg.text(header, insert=(10, 20), font_size="13px", font_family="Arial", fill="#b00020"))

    dwg.add(dwg.polygon(points=[tx(p) for p in lot.polygon()], fill="none", stroke="#c00", stroke_width=2))
    envelope = plan_mod.compute_buildable_envelope(lot, zoning.setbacks)
    dwg.add(dwg.polygon(points=[tx(p) for p in envelope], fill="none", stroke="#999", stroke_width=1))
    footprint = building.footprints.get(level)
    if footprint:
        dwg.add(dwg.polygon(points=[tx(p) for p in footprint], fill="#eaf3ff", stroke="#2266aa", stroke_width=1))
    for wall in building.walls_on_level(level):
        color = "#333" if wall.exterior else "#999"
        dwg.add(dwg.polygon(points=[tx(p) for p in plan_mod._wall_rectangle(wall)], fill=color, stroke="none"))
    for room in building.rooms_on_level(level):
        pts = [tx(p) for p in room.boundary]
        dwg.add(dwg.polygon(points=pts, fill="none", stroke="#222", stroke_width=1))

    for i, stall in enumerate(layout.stalls, start=1):
        pts = [tx(p) for p in stall]
        dwg.add(dwg.polygon(points=pts, fill="#eef6ff", stroke="#2266cc", stroke_width=1))
        cx = sum(p[0] for p in pts) / 4.0
        cy = sum(p[1] for p in pts) / 4.0
        dwg.add(dwg.text(f"P{i}", insert=(cx, cy), font_size="10px", font_family="Arial", fill="#2266cc", text_anchor="middle"))
    pts = [tx(p) for p in layout.aisle]
    dwg.add(dwg.polygon(points=pts, fill="#f2f2f2", stroke="#666", stroke_width=1, stroke_dasharray="4,3"))

    calc_lines = [
        f"Otopark ihtiyaci: {layout.required_stalls} adet (1/daire, Otopark Yonetmeligi Ek-1 -- ulusal taban, Kocaeli buyuksehir arttirimi teyit edilmeli)",
        f"Saglanan: {layout.provided_stalls} adet (2.40x4.90 m/adet + {AISLE_WIDTH:.2f} m iki yonlu koridor, Madde 5(1)(h))",
        f"Sonuc: {'YETERLI' if layout.fits else 'YETERSIZ'}",
    ]
    assert_no_stamp_language("\n".join(calc_lines))
    base_y = height_px - (bottom_strip_m * scale_px_per_m) + 14
    for i, line in enumerate(calc_lines):
        dwg.add(dwg.text(line, insert=(10, base_y + i * 16), font_size="12px", font_family="Arial", fill="#333"))
    assert_no_stamp_language(DISCLAIMER)
    dwg.add(dwg.text(DISCLAIMER, insert=(10, base_y + len(calc_lines) * 16 + 6), font_size="9px", font_family="Arial", fill="#b00020"))

    out_path = Path(path)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    dwg.save()
    return out_path


# ---------------------------------------------------------------------------
# Verification -- re-derives the drawn stall/aisle geometry from a freshly
# re-read DXF and checks each dimension against the Otopark Yonetmeligi
# minimums explicitly, same convention as plan.verify_compliance().
# ---------------------------------------------------------------------------


@dataclass
class ParkingCheck:
    name: str
    passed: bool
    detail: str = ""


@dataclass
class ParkingVerificationReport:
    checks: list[ParkingCheck] = field(default_factory=list)

    @property
    def all_passed(self) -> bool:
        return all(c.passed for c in self.checks)

    def summary(self) -> str:
        return "\n".join(f"[{'PASS' if c.passed else 'FAIL'}] {c.name}" + (f" -- {c.detail}" if c.detail else "") for c in self.checks)


def verify_parking_layout(dxf_path: str | Path, *, tolerance: float = 1e-6) -> ParkingVerificationReport:
    """Re-reads a just-generated parking DXF fresh from disk and checks the
    drawn stall/aisle geometry against the Otopark Yonetmeligi minimums
    explicitly -- mirrors plan.verify_compliance()'s re-derive-from-disk
    convention."""
    doc = ezdxf.readfile(str(dxf_path))
    msp = doc.modelspace()
    checks: list[ParkingCheck] = []

    stall_polys = [
        [(float(x), float(y)) for x, y in e.get_points("xy")]
        for e in msp if e.dxftype() == "LWPOLYLINE" and e.dxf.layer == LAYERS["parking_stall"]
    ]
    aisle_polys = [
        [(float(x), float(y)) for x, y in e.get_points("xy")]
        for e in msp if e.dxftype() == "LWPOLYLINE" and e.dxf.layer == LAYERS["parking_aisle"]
    ]

    xdata_point = next((e for e in msp if e.dxftype() == "POINT" and e.dxf.layer == plan_mod.LAYERS["project_data"]), None)
    required_stalls = None
    if xdata_point is not None:
        xdata = xdata_point.get_xdata(APPID)
        strings = [tag.value for tag in xdata if tag.code == 1000]
        if strings and strings[0] == PARKING_XDATA_MARKER:
            for s in strings[1:]:
                if s.startswith("required_stalls="):
                    required_stalls = int(s.split("=", 1)[1])

    checks.append(ParkingCheck("Parking XDATA present and versioned correctly", required_stalls is not None))
    checks.append(
        ParkingCheck(
            f"Drawn stall count ({len(stall_polys)}) meets required count ({required_stalls})",
            required_stalls is not None and len(stall_polys) >= required_stalls,
            detail=f"drawn={len(stall_polys)} required={required_stalls}",
        )
    )

    for i, poly in enumerate(stall_polys, start=1):
        x0, y0, x1, y1 = bounding_box(poly)
        w, d = x1 - x0, y1 - y0
        dims_ok = (w >= STALL_WIDTH - tolerance and d >= STALL_DEPTH - tolerance) or (d >= STALL_WIDTH - tolerance and w >= STALL_DEPTH - tolerance)
        checks.append(
            ParkingCheck(
                f"Stall P{i} meets minimum {STALL_WIDTH}m x {STALL_DEPTH}m (Otopark Yonetmeligi Madde 5(1)(h)(8))",
                dims_ok, detail=f"drawn {w:.2f}m x {d:.2f}m",
            )
        )

    if aisle_polys:
        x0, y0, x1, y1 = bounding_box(aisle_polys[0])
        aisle_depth = min(x1 - x0, y1 - y0)
        checks.append(
            ParkingCheck(
                f"Drive aisle meets the {AISLE_WIDTH}m two-way minimum (Otopark Yonetmeligi Madde 5(1)(h)(7))",
                aisle_depth >= AISLE_WIDTH - tolerance, detail=f"drawn {aisle_depth:.2f}m",
            )
        )
    else:
        checks.append(ParkingCheck("Drive aisle drawn on the sheet", False, "no aisle polygon found"))

    return ParkingVerificationReport(checks=checks)
