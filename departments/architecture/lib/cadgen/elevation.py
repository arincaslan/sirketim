"""
departments/architecture/lib/cadgen/elevation.py

Real, to-scale 2D orthographic elevation generator: derives front/rear/side
elevation views by projecting each level's already-modeled wall/opening
geometry (model.Wall already carries real base_elevation/top_elevation per
level, per model.py's documented convention -- see multi-level generation in
plan.py) onto a vertical plane per facade direction.

This is a FLATTENING of existing 2D+Z data, not new 3D geometry: every
level's exterior walls and their hosted openings are already fully
positioned in (x, y, z) by the time plan.generate_multilevel_plan() has run
-- elevation.py's only job is to pick, for a given facade direction, the
right exterior wall on each level, and re-project its (horizontal position,
z) instead of its (x, y) plan coordinates. No wall thickness, no massing,
no perspective -- a flat orthographic elevation, matching standard
architectural-drafting convention (front view, not a 3D render -- 3D/Blender
is explicitly out of scope for this pass, per the founder's brief).

Foundation-phase scope, stated plainly:
- Only rectangular, axis-aligned levels are supported (matches plan.py's own
  scope) -- a facade wall is identified purely by its own geometry (a
  horizontal wall for front/rear, a vertical wall for left/right), not by
  any story-specific convention, so this generalizes across levels whose
  footprint width/depth differ level to level (matches 377/1's real
  situation -- see rationale.md's honest note that per-level footprints
  aren't yet unified into one consistent structural stack).
- No roof geometry is drawn beyond the top level's own wall-head line (a
  flat cap at the top level's top_elevation) -- the pitched-roof profile
  described in plan notes item 4.2.32 is NOT modeled here; this is a
  genuine, stated gap, not silently smoothed over.
- No material/finish hatching, no dimension strings beyond overall height
  and per-level floor lines -- a schematic massing elevation, not a
  construction-detail elevation.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path

import ezdxf
import svgwrite

from . import plan as plan_mod
from .model import Building, OpeningType, Wall
from .titleblock import DISCLAIMER, TitleBlockInfo, assert_no_stamp_language, draw_titleblock

APPID = plan_mod.APPID
ELEVATION_XDATA_MARKER = "SIRKETIM-CADGEN-ELEVATION-V1"

LAYERS = dict(plan_mod.LAYERS)
LAYERS["elevation_wall"] = "A-ELEV-WALL"
LAYERS["elevation_opening"] = "A-ELEV-GLAZ"
LAYERS["elevation_grade"] = "C-TOPO"
LAYER_COLORS = dict(plan_mod.LAYER_COLORS)
LAYER_COLORS[LAYERS["elevation_wall"]] = 7
LAYER_COLORS[LAYERS["elevation_opening"]] = 5
LAYER_COLORS[LAYERS["elevation_grade"]] = 1

DIRECTIONS = ("front", "rear", "left", "right")


@dataclass
class FacadeSegment:
    """One level's contribution to a facade: a horizontal span (`h0`-`h1`,
    along world X for front/rear, world Y for left/right) at a vertical
    span (`z0`-`z1`, the hosting wall's own base/top elevation -- already
    relative to Building.red_grade_elevation, per model.py's convention)."""

    level: int
    level_name: str
    h0: float
    h1: float
    z0: float
    z1: float


@dataclass
class FacadeOpening:
    level: int
    h0: float
    h1: float
    z0: float
    z1: float
    type: OpeningType
    mark: str


@dataclass
class Facade:
    direction: str
    segments: list[FacadeSegment] = field(default_factory=list)
    openings: list[FacadeOpening] = field(default_factory=list)

    def h_bounds(self) -> tuple[float, float]:
        hs = [s.h0 for s in self.segments] + [s.h1 for s in self.segments]
        return (min(hs), max(hs)) if hs else (0.0, 0.0)

    def z_bounds(self) -> tuple[float, float]:
        zs = [s.z0 for s in self.segments] + [s.z1 for s in self.segments]
        return (min(zs), max(zs)) if zs else (0.0, 0.0)


def _facade_wall(building: Building, level: int, direction: str) -> Wall | None:
    """Picks the exterior wall on `level` that represents `direction`,
    purely from its own geometry (a horizontal wall for front/rear, a
    vertical wall for left/right, picked by min/max position) -- not by any
    naming convention, so this works even for levels whose footprint
    width/depth differ from other levels."""
    ext = [w for w in building.walls_on_level(level) if w.exterior]
    horiz = [w for w in ext if abs(w.start[1] - w.end[1]) < 1e-6]
    vert = [w for w in ext if abs(w.start[0] - w.end[0]) < 1e-6]
    if direction == "front":
        return min(horiz, key=lambda w: w.start[1]) if horiz else None
    if direction == "rear":
        return max(horiz, key=lambda w: w.start[1]) if horiz else None
    if direction == "left":
        return min(vert, key=lambda w: w.start[0]) if vert else None
    if direction == "right":
        return max(vert, key=lambda w: w.start[0]) if vert else None
    raise ValueError(f"direction must be one of {DIRECTIONS}, got {direction!r}")


def project_facade(building: Building, direction: str) -> Facade:
    """Builds one Facade by picking each level's own `direction`-facing
    exterior wall (see `_facade_wall`) and projecting it + its hosted
    openings onto (horizontal-position, z)."""
    if direction not in DIRECTIONS:
        raise ValueError(f"direction must be one of {DIRECTIONS}, got {direction!r}")
    facade = Facade(direction=direction)
    for lvl in sorted(building.levels, key=lambda level_obj: level_obj.index):
        wall = _facade_wall(building, lvl.index, direction)
        if wall is None:
            continue
        if direction in ("front", "rear"):
            h0, h1 = sorted((wall.start[0], wall.end[0]))
        else:
            h0, h1 = sorted((wall.start[1], wall.end[1]))
        facade.segments.append(
            FacadeSegment(level=lvl.index, level_name=lvl.name, h0=h0, h1=h1, z0=wall.base_elevation, z1=wall.top_elevation)
        )
        for opening in building.openings_on_wall(wall.id):
            p0 = wall.point_at(opening.position)
            p1 = wall.point_at(opening.position + opening.width)
            if direction in ("front", "rear"):
                oh0, oh1 = sorted((p0[0], p1[0]))
            else:
                oh0, oh1 = sorted((p0[1], p1[1]))
            facade.openings.append(
                FacadeOpening(
                    level=lvl.index, h0=oh0, h1=oh1,
                    z0=wall.base_elevation + opening.sill_height,
                    z1=wall.base_elevation + opening.head_height,
                    type=opening.type, mark=opening.mark or opening.id,
                )
            )
    return facade


# ---------------------------------------------------------------------------
# DXF / SVG rendering
# ---------------------------------------------------------------------------


def _write_elevation_xdata(msp, facade: Facade, red_grade_elevation: float) -> None:
    h0, h1 = facade.h_bounds()
    z0, z1 = facade.z_bounds()
    point = msp.add_point((0.0, 0.0), dxfattribs={"layer": LAYERS["project_data"]})
    tags: list[tuple[int, str]] = [
        (1000, ELEVATION_XDATA_MARKER),
        (1000, f"direction={facade.direction}"),
        (1000, f"red_grade_elevation={red_grade_elevation}"),
        (1000, f"h0={h0}"), (1000, f"h1={h1}"), (1000, f"z0={z0}"), (1000, f"z1={z1}"),
        (1000, f"overall_height={z1 - z0}"),
    ]
    point.set_xdata(APPID, tags)


def render_elevation_dxf(
    building: Building,
    direction: str,
    path: str | Path,
    *,
    titleblock_info: TitleBlockInfo | None = None,
) -> Path:
    facade = project_facade(building, direction)
    if not facade.segments:
        raise ValueError(f"No exterior wall found for direction={direction!r} on any level -- nothing to draw.")
    h0, h1 = facade.h_bounds()
    z0_all, z1_all = facade.z_bounds()

    doc = ezdxf.new("R2018")
    doc.header["$INSUNITS"] = 6
    doc.header["$MEASUREMENT"] = 1
    doc.appids.new(APPID)
    for layer_name, color in LAYER_COLORS.items():
        doc.layers.add(name=layer_name, color=color)
    msp = doc.modelspace()

    # Grade line (kirmizi kot datum, z=0 in this Building's own relative frame)
    msp.add_line((h0 - 1.0, 0.0), (h1 + 1.0, 0.0), dxfattribs={"layer": LAYERS["elevation_grade"]})
    grade_label = f"Kirmizi kot (red grade) datum, {building.red_grade_elevation:.2f} m absolute -- PLACEHOLDER, see rationale.md"
    assert_no_stamp_language(grade_label)
    gt = msp.add_text(grade_label, dxfattribs={"layer": LAYERS["elevation_grade"], "height": 0.14})
    gt.set_placement((h0 - 1.0, -0.3))

    for seg in facade.segments:
        msp.add_lwpolyline(
            [(seg.h0, seg.z0), (seg.h1, seg.z0), (seg.h1, seg.z1), (seg.h0, seg.z1)],
            close=True, dxfattribs={"layer": LAYERS["elevation_wall"]},
        )
        floor_label = f"{seg.level_name} -- FFE {'+' if seg.z0 >= 0 else ''}{seg.z0:.2f} m"
        assert_no_stamp_language(floor_label)
        ft = msp.add_text(floor_label, dxfattribs={"layer": plan_mod.LAYERS["notes"], "height": 0.16})
        ft.set_placement((h1 + 0.3, seg.z0 + 0.1))
        msp.add_line((h0, seg.z0), (h1, seg.z0), dxfattribs={"layer": LAYERS["elevation_wall"]})

    for op in facade.openings:
        layer = LAYERS["elevation_opening"]
        msp.add_lwpolyline([(op.h0, op.z0), (op.h1, op.z0), (op.h1, op.z1), (op.h0, op.z1)], close=True, dxfattribs={"layer": layer})
        assert_no_stamp_language(op.mark)
        t = msp.add_text(op.mark, dxfattribs={"layer": layer, "height": 0.12})
        t.set_placement(((op.h0 + op.h1) / 2.0 - 0.1, op.z0 + 0.05))

    # Overall height dimension
    d = msp.add_linear_dim(base=(h0 - 2.0, 0), p1=(h0 - 1.5, z0_all), p2=(h0 - 1.5, z1_all), angle=90, dxfattribs={"layer": plan_mod.LAYERS["dims"]})
    d.render()

    _write_elevation_xdata(msp, facade, building.red_grade_elevation)

    note_lines = [
        f"{building.name} -- {direction.upper()} ELEVATION (schematic, derived from plan geometry)",
        f"Overall height above red grade: {z1_all - z0_all:.2f} m (placeholder red-grade datum, see rationale.md)",
        "Orthographic 2D elevation only -- no 3D/render output in this pass.",
    ]
    note_text = "\n".join(note_lines)
    assert_no_stamp_language(note_text)
    note = msp.add_mtext(note_text, dxfattribs={"layer": plan_mod.LAYERS["notes"], "char_height": 0.16})
    note.set_location((h0, z1_all + 1.0))

    if titleblock_info is not None:
        draw_titleblock(msp, titleblock_info, insert=(h1 + 2.5, z1_all - 5.4), layer=plan_mod.LAYERS["titleblock"])

    out_path = Path(path)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    doc.saveas(str(out_path))
    return out_path


def render_elevation_svg(
    building: Building,
    direction: str,
    path: str | Path,
    *,
    titleblock_info: TitleBlockInfo | None = None,
    scale_px_per_m: float = 20.0,
    margin_m: float = 3.0,
) -> Path:
    facade = project_facade(building, direction)
    if not facade.segments:
        raise ValueError(f"No exterior wall found for direction={direction!r} on any level -- nothing to draw.")
    h0, h1 = facade.h_bounds()
    z0_all, z1_all = facade.z_bounds()

    top_strip_m = 2.4
    bottom_strip_m = 2.0
    width_px = (h1 - h0 + margin_m * 2) * scale_px_per_m
    height_px = (z1_all - z0_all + margin_m * 2 + top_strip_m + bottom_strip_m) * scale_px_per_m

    def tx(h: float, z: float) -> tuple[float, float]:
        return ((h - h0 + margin_m) * scale_px_per_m, (z1_all - z + margin_m + top_strip_m) * scale_px_per_m)

    dwg = svgwrite.Drawing(str(path), size=(f"{width_px}px", f"{height_px}px"), viewBox=f"0 0 {width_px} {height_px}", profile="full")
    dwg.add(dwg.rect(insert=(0, 0), size=(width_px, height_px), fill="white"))
    header = f"{building.name} -- {direction.upper()} ELEVATION -- SCHEMATIC, requires licensed-architect review before permitting or construction"
    assert_no_stamp_language(header)
    dwg.add(dwg.text(header, insert=(10, 20), font_size="13px", font_family="Arial", fill="#b00020"))

    gx0, gy = tx(h0 - 1.0, 0.0)
    gx1, _ = tx(h1 + 1.0, 0.0)
    dwg.add(dwg.line(start=(gx0, gy), end=(gx1, gy), stroke="#996633", stroke_width=2))

    for seg in facade.segments:
        p0 = tx(seg.h0, seg.z1)
        p1 = tx(seg.h1, seg.z0)
        dwg.add(dwg.rect(insert=p0, size=(p1[0] - p0[0], p1[1] - p0[1]), fill="#f4f0ea", stroke="#333", stroke_width=1))
        lx, ly = tx(h1, seg.z0)
        dwg.add(dwg.text(f"{seg.level_name}", insert=(lx + 6, ly - 3), font_size="10px", font_family="Arial", fill="#333"))

    for op in facade.openings:
        p0 = tx(op.h0, op.z1)
        p1 = tx(op.h1, op.z0)
        color = "#2266cc" if op.type is OpeningType.WINDOW else "#2a7d46"
        dwg.add(dwg.rect(insert=p0, size=(p1[0] - p0[0], p1[1] - p0[1]), fill="#dcebff" if op.type is OpeningType.WINDOW else "#e3f2e6", stroke=color, stroke_width=1))

    if titleblock_info is not None:
        info_text = (
            f"{titleblock_info.project_name} | {titleblock_info.parcel_id} | "
            f"{titleblock_info.sheet_number}: {titleblock_info.sheet_title} | {titleblock_info.date}"
        )
        assert_no_stamp_language(info_text)
        dwg.add(dwg.text(info_text, insert=(10, 40), font_size="11px", font_family="Arial", fill="#333"))

    base_y = height_px - (bottom_strip_m * scale_px_per_m) + 10
    height_text = f"Overall height above red grade: {z1_all - z0_all:.2f} m (placeholder datum, see rationale.md)"
    assert_no_stamp_language(height_text)
    dwg.add(dwg.text(height_text, insert=(10, base_y), font_size="11px", font_family="Arial", fill="#333"))
    assert_no_stamp_language(DISCLAIMER)
    dwg.add(dwg.text(DISCLAIMER, insert=(10, base_y + 16), font_size="9px", font_family="Arial", fill="#b00020"))

    out_path = Path(path)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    dwg.save()
    return out_path
