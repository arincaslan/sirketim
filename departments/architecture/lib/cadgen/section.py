"""
departments/architecture/lib/cadgen/section.py

Real, to-scale building-section generator: at least one representative
longitudinal section, cut vertically through a chosen world-X position
(by convention, the vertical core's own centerline -- the department's
standard "representative section", matching the founder's brief), showing
the full floor-to-floor stack from a freshly re-derived model.Building.

Like elevation.py, this FLATTENS existing 2D+Z data (Building.footprints
per level for the envelope, Building.levels for floor-to-floor elevations,
Building.walls for anything the cut plane actually crosses) -- it does not
add new 3D geometry.

Foundation-phase scope, stated plainly:
- Only a LONGITUDINAL section (a vertical cut running front-to-rear, at a
  fixed world-X) is implemented. A transverse (side-to-side) section would
  be a straightforward analogous addition, not built this pass.
- An element is drawn as "cut" only if the cutting plane's X actually falls
  within that element's own horizontal extent (a wall's x-span, or the
  level's own footprint x-span for the envelope) -- there is NO
  visibility/hidden-line resolution for elements behind the cut plane (a
  full architectural section would show some background elements as thin
  lines); this section only draws what the plane directly intersects. A
  genuine, stated simplification, not silently smoothed over.
- Floor slabs are drawn as a schematic constant-thickness band
  (`slab_thickness`, default 0.20 m) at each level transition -- not
  derived from any real structural slab design (this library has no
  structural input at all, consistent with the department's standing
  architectural-schematic-only scope).
- No pitched-roof profile (same gap as elevation.py, see that module's
  docstring) -- the roof level is capped flat at its own top_elevation.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path

import ezdxf
import svgwrite

from . import plan as plan_mod
from .model import Building
from .titleblock import DISCLAIMER, TitleBlockInfo, assert_no_stamp_language, draw_titleblock

APPID = plan_mod.APPID
SECTION_XDATA_MARKER = "SIRKETIM-CADGEN-SECTION-V1"

LAYERS = dict(plan_mod.LAYERS)
LAYERS["section_wall"] = "A-SECT-WALL"
LAYERS["section_slab"] = "A-SECT-SLAB"
LAYERS["section_core"] = "A-SECT-CORE"
LAYERS["section_grade"] = "C-TOPO"
LAYER_COLORS = dict(plan_mod.LAYER_COLORS)
LAYER_COLORS[LAYERS["section_wall"]] = 7
LAYER_COLORS[LAYERS["section_slab"]] = 1
LAYER_COLORS[LAYERS["section_core"]] = 5
LAYER_COLORS[LAYERS["section_grade"]] = 1


@dataclass
class SectionLevel:
    level: int
    level_name: str
    h0: float  # envelope extent along the cut direction (world Y for a longitudinal section)
    h1: float
    z0: float
    z1: float
    slab_thickness: float
    cut_wall_hs: list[float] = field(default_factory=list)  # h-positions of any walls the plane crosses on this level
    has_core: bool = False
    core_h0: float | None = None
    core_h1: float | None = None


@dataclass
class Section:
    cut_x: float
    levels: list[SectionLevel] = field(default_factory=list)

    def h_bounds(self) -> tuple[float, float]:
        hs = [lv.h0 for lv in self.levels] + [lv.h1 for lv in self.levels]
        return (min(hs), max(hs)) if hs else (0.0, 0.0)

    def z_bounds(self) -> tuple[float, float]:
        zs = [lv.z0 for lv in self.levels] + [lv.z1 for lv in self.levels]
        return (min(zs), max(zs)) if zs else (0.0, 0.0)


def cut_longitudinal_section(building: Building, cut_x: float, *, slab_thickness: float = 0.20) -> Section:
    """Cuts a vertical, front-to-rear (longitudinal) section at world
    X = `cut_x`. Pass the vertical core's own centerline X to get the
    department's standard representative section (cutting through the
    stair/elevator shaft) -- see `section_cut_x_from_core()` below for a
    convenience helper that derives that X directly from a CoreSpec, the
    same way every level's core is anchored in plan.py.
    """
    section = Section(cut_x=cut_x)
    for lvl in sorted(building.levels, key=lambda level_obj: level_obj.index):
        footprint = building.footprints.get(lvl.index)
        if not footprint:
            continue
        xs = [p[0] for p in footprint]
        ys = [p[1] for p in footprint]
        if not (min(xs) - 1e-6 <= cut_x <= max(xs) + 1e-6):
            continue  # cut plane doesn't pass through this level's footprint at all
        h0, h1 = min(ys), max(ys)
        z0 = lvl.finished_floor_elevation
        z1 = z0 + lvl.floor_to_floor_height

        cut_wall_hs: list[float] = []
        core_h0 = core_h1 = None
        has_core = False
        for wall in building.walls_on_level(lvl.index):
            wx0, wx1 = sorted((wall.start[0], wall.end[0]))
            wy0, wy1 = sorted((wall.start[1], wall.end[1]))
            if wx0 - 1e-6 <= cut_x <= wx1 + 1e-6:
                # a horizontal wall (front/rear/corridor/core-rear/part wall)
                # the cut plane slices through transversally
                cut_wall_hs.append(wall.start[1])
        for room in building.rooms_on_level(lvl.index):
            if room.program_tag != "circulation-core":
                continue
            rxs = [p[0] for p in room.boundary]
            rys = [p[1] for p in room.boundary]
            if min(rxs) - 1e-6 <= cut_x <= max(rxs) + 1e-6:
                has_core = True
                core_h0, core_h1 = min(rys), max(rys)

        section.levels.append(
            SectionLevel(
                level=lvl.index, level_name=lvl.name, h0=h0, h1=h1, z0=z0, z1=z1,
                slab_thickness=slab_thickness, cut_wall_hs=sorted(set(round(h, 3) for h in cut_wall_hs)),
                has_core=has_core, core_h0=core_h0, core_h1=core_h1,
            )
        )
    return section


def section_cut_x_from_core(building: Building, core: "plan_mod.CoreSpec", *, level: int = 0) -> float:
    """Convenience: returns the core's own centerline X, derived the same
    way plan._core_rect() anchors it, from `level`'s own footprint (any
    level works -- the core's X anchor is identical on every level of a
    `generate_multilevel_plan(core=...)` building, see CoreSpec's
    docstring)."""
    footprint = building.footprints.get(level)
    if not footprint:
        raise ValueError(f"Building has no recorded footprint for level {level}")
    # exterior_wall_thickness isn't stored on Building directly; approximate
    # from the level's own front wall thickness (drawn at that anchor).
    ext_walls = [w for w in building.walls_on_level(level) if w.exterior]
    te = ext_walls[0].thickness if ext_walls else 0.25
    core_x0, _core_y0, core_x1, _core_y1 = plan_mod._core_rect(footprint, te, core)
    return (core_x0 + core_x1) / 2.0


# ---------------------------------------------------------------------------
# DXF / SVG rendering
# ---------------------------------------------------------------------------


def render_section_dxf(
    building: Building,
    section: Section,
    path: str | Path,
    *,
    titleblock_info: TitleBlockInfo | None = None,
) -> Path:
    if not section.levels:
        raise ValueError(f"Section at cut_x={section.cut_x} crosses no level's footprint -- nothing to draw.")
    h0, h1 = section.h_bounds()
    z0_all, z1_all = section.z_bounds()

    doc = ezdxf.new("R2018")
    doc.header["$INSUNITS"] = 6
    doc.header["$MEASUREMENT"] = 1
    doc.appids.new(APPID)
    for layer_name, color in LAYER_COLORS.items():
        doc.layers.add(name=layer_name, color=color)
    msp = doc.modelspace()

    msp.add_line((h0 - 1.0, 0.0), (h1 + 1.0, 0.0), dxfattribs={"layer": LAYERS["section_grade"]})
    grade_label = f"Kirmizi kot (red grade) datum, {building.red_grade_elevation:.2f} m absolute -- PLACEHOLDER, see rationale.md"
    assert_no_stamp_language(grade_label)
    gt = msp.add_text(grade_label, dxfattribs={"layer": LAYERS["section_grade"], "height": 0.14})
    gt.set_placement((h0 - 1.0, -0.3))

    for lv in section.levels:
        # Floor slab (schematic constant thickness, drawn just below FFE)
        msp.add_lwpolyline(
            [(h0, lv.z0 - lv.slab_thickness), (h1, lv.z0 - lv.slab_thickness), (h1, lv.z0), (h0, lv.z0)],
            close=True, dxfattribs={"layer": LAYERS["section_slab"]},
        )
        # Envelope outline (ceiling line at z1, floor at z0 already via slab)
        msp.add_line((h0, lv.z1), (h1, lv.z1), dxfattribs={"layer": LAYERS["section_wall"]})
        msp.add_line((h0, lv.z0), (h0, lv.z1), dxfattribs={"layer": LAYERS["section_wall"]})
        msp.add_line((h1, lv.z0), (h1, lv.z1), dxfattribs={"layer": LAYERS["section_wall"]})

        for wh in lv.cut_wall_hs:
            msp.add_line((wh, lv.z0), (wh, lv.z1), dxfattribs={"layer": LAYERS["section_wall"]})

        if lv.has_core and lv.core_h0 is not None and lv.core_h1 is not None:
            msp.add_lwpolyline(
                [(lv.core_h0, lv.z0), (lv.core_h1, lv.z0), (lv.core_h1, lv.z1), (lv.core_h0, lv.z1)],
                close=True, dxfattribs={"layer": LAYERS["section_core"]},
            )

        label = f"{lv.level_name} -- FFE {'+' if lv.z0 >= 0 else ''}{lv.z0:.2f} m"
        assert_no_stamp_language(label)
        t = msp.add_text(label, dxfattribs={"layer": plan_mod.LAYERS["notes"], "height": 0.16})
        t.set_placement((h1 + 0.3, lv.z0 + 0.1))

    core_note = "Merdiven + Asansor cekirdegi -- her katta ayni x/y konumunda (dusey surekli bosluk)"
    assert_no_stamp_language(core_note)
    ct = msp.add_text(core_note, dxfattribs={"layer": LAYERS["section_core"], "height": 0.14})
    ct.set_placement((h0, z1_all + 0.5))

    d = msp.add_linear_dim(base=(h0 - 2.0, 0), p1=(h0 - 1.5, z0_all), p2=(h0 - 1.5, z1_all), angle=90, dxfattribs={"layer": plan_mod.LAYERS["dims"]})
    d.render()

    point = msp.add_point((0.0, 0.0), dxfattribs={"layer": LAYERS["project_data"]})
    point.set_xdata(APPID, [
        (1000, SECTION_XDATA_MARKER), (1000, f"cut_x={section.cut_x}"),
        (1000, f"h0={h0}"), (1000, f"h1={h1}"), (1000, f"z0={z0_all}"), (1000, f"z1={z1_all}"),
    ])

    note_lines = [
        f"{building.name} -- LONGITUDINAL SECTION at X={section.cut_x:.2f} m (through the vertical core, schematic)",
        f"Overall height above red grade: {z1_all - z0_all:.2f} m (placeholder red-grade datum, see rationale.md)",
        "No pitched-roof profile drawn -- top level capped flat at its own top elevation, see module docstring.",
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


def render_section_svg(
    building: Building,
    section: Section,
    path: str | Path,
    *,
    titleblock_info: TitleBlockInfo | None = None,
    scale_px_per_m: float = 20.0,
    margin_m: float = 3.0,
) -> Path:
    if not section.levels:
        raise ValueError(f"Section at cut_x={section.cut_x} crosses no level's footprint -- nothing to draw.")
    h0, h1 = section.h_bounds()
    z0_all, z1_all = section.z_bounds()

    top_strip_m = 2.4
    bottom_strip_m = 2.0
    width_px = (h1 - h0 + margin_m * 2) * scale_px_per_m
    height_px = (z1_all - z0_all + margin_m * 2 + top_strip_m + bottom_strip_m) * scale_px_per_m

    def tx(h: float, z: float) -> tuple[float, float]:
        return ((h - h0 + margin_m) * scale_px_per_m, (z1_all - z + margin_m + top_strip_m) * scale_px_per_m)

    dwg = svgwrite.Drawing(str(path), size=(f"{width_px}px", f"{height_px}px"), viewBox=f"0 0 {width_px} {height_px}", profile="full")
    dwg.add(dwg.rect(insert=(0, 0), size=(width_px, height_px), fill="white"))
    header = f"{building.name} -- LONGITUDINAL SECTION (X={section.cut_x:.2f}m) -- SCHEMATIC, requires licensed-architect review before permitting or construction"
    assert_no_stamp_language(header)
    dwg.add(dwg.text(header, insert=(10, 20), font_size="13px", font_family="Arial", fill="#b00020"))

    gx0, gy = tx(h0 - 1.0, 0.0)
    gx1, _ = tx(h1 + 1.0, 0.0)
    dwg.add(dwg.line(start=(gx0, gy), end=(gx1, gy), stroke="#996633", stroke_width=2))

    for lv in section.levels:
        p0 = tx(h0, lv.z1)
        p1 = tx(h1, lv.z0)
        dwg.add(dwg.rect(insert=p0, size=(p1[0] - p0[0], p1[1] - p0[1]), fill="none", stroke="#333", stroke_width=1.5))
        s0 = tx(h0, lv.z0)
        s1 = tx(h1, lv.z0 - lv.slab_thickness)
        dwg.add(dwg.rect(insert=s0, size=(s1[0] - s0[0], s1[1] - s0[1]), fill="#999", stroke="none"))
        if lv.has_core and lv.core_h0 is not None and lv.core_h1 is not None:
            c0 = tx(lv.core_h0, lv.z1)
            c1 = tx(lv.core_h1, lv.z0)
            dwg.add(dwg.rect(insert=c0, size=(c1[0] - c0[0], c1[1] - c0[1]), fill="#eef6ff", stroke="#2266cc", stroke_width=1, stroke_dasharray="4,3"))
        lx, ly = tx(h1, lv.z0)
        dwg.add(dwg.text(lv.level_name, insert=(lx + 6, ly - 3), font_size="10px", font_family="Arial", fill="#333"))

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
