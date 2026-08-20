"""
departments/architecture/lib/cadgen/plan.py

Baseline schematic floor-plan generator: lot geometry + zoning constraints +
room program -> a populated model.Building -> DXF (ezdxf) + SVG (svgwrite).
Implements the department's intake and compliance-verification conventions
in code (departments/architecture/CLAUDE.md, "Site intake", "Floor plan
generation", "Compliance verification").

Foundation-phase scope, stated plainly so it isn't mistaken for more than it
is:

- Rectangular, axis-aligned lots only (`LotGeometry`). Real parcels are
  frequently irregular polygons -- 377/1, the department's actual next
  project, is one. Generalizing to arbitrary polygon lots with true
  setback offsetting (polygon erosion) is a real, separate geometry problem,
  flagged here as a follow-up need, not solved in this pass.
- Single level (ground floor) only. Multi-story support is a follow-up need
  (`model.Building`/`model.Level` are already shaped to hold multiple levels
  -- this generator just doesn't populate more than one yet).
- A simple deterministic single-row "bay slicing" room layout, not a
  spatial-adjacency solver. Appropriate for a *baseline* generator; a more
  sophisticated layout engine is future work, not this pass.
- Openings are drawn as overlay markers (void rectangle + door-swing arc /
  window centerline tick + mark label), not true wall breaks (trimmed wall
  polylines). This is a schematic simplification -- it doesn't affect any
  dimension or the compliance check, which read geometry/XDATA that don't
  depend on it.

Every dimension this module draws is computed directly from the LotGeometry
/ ZoningConstraints / RoomSpec values passed in -- nothing is a hardcoded or
independently-typed number. `verify_compliance()` re-derives the key figures
from a freshly re-read DXF file (not the in-memory Building) specifically so
a bug in the writing step itself would also be caught, not just a bug in the
layout math.
"""

from __future__ import annotations

import math
from dataclasses import dataclass, field
from pathlib import Path

import ezdxf
import svgwrite

from .model import (
    Building,
    Level,
    Opening,
    OpeningType,
    Point2D,
    Room,
    Wall,
    bounding_box,
    polygon_area,
)
from .titleblock import DISCLAIMER, TitleBlockInfo, assert_no_stamp_language, draw_titleblock

# ---------------------------------------------------------------------------
# Layers, project-data XDATA scheme
# ---------------------------------------------------------------------------

APPID = "SIRKETIM"
XDATA_MARKER = "SIRKETIM-CADGEN-V1"

# Loosely follows the AIA/NCS discipline-prefix convention observed in the
# founder's sample DWG (A-WALL, A-DOOR, A-GLAZ, C-TOPO, ...) -- not a claim
# of full NCS compliance, just a documented, consistent scheme so future
# generators (schedule.py, elevation.py, ...) know what to expect.
LAYERS = {
    "property": "C-PROP",
    "envelope": "A-ANNO-NPLT",  # setback-envelope reference (non-plot construction guide)
    "footprint": "A-AREA-PLAN",
    "wall_ext": "A-WALL",
    "wall_int": "A-WALL-INTR",
    "door": "A-DOOR",
    "window": "A-GLAZ",
    "room_boundary": "A-AREA-IDEN",
    "dims": "A-ANNO-DIMS",
    "notes": "A-ANNO-NOTE",
    "project_data": "Z-DATA-NOPLOT",
    "titleblock": "A-ANNO-TTLB",
}

# ACI color numbers -- cosmetic only (helps a human skim the drawing in a
# CAD viewer). Not load-bearing: the compliance check reads geometry/XDATA
# by layer name, never by color.
LAYER_COLORS = {
    LAYERS["property"]: 1,
    LAYERS["envelope"]: 8,
    LAYERS["footprint"]: 4,
    LAYERS["wall_ext"]: 7,
    LAYERS["wall_int"]: 7,
    LAYERS["door"]: 3,
    LAYERS["window"]: 5,
    LAYERS["room_boundary"]: 2,
    LAYERS["dims"]: 6,
    LAYERS["notes"]: 7,
    LAYERS["project_data"]: 8,
    LAYERS["titleblock"]: 7,
}


# ---------------------------------------------------------------------------
# Intake types
# ---------------------------------------------------------------------------


@dataclass
class Setbacks:
    front: float
    rear: float
    side_left: float
    side_right: float

    @classmethod
    def symmetric(cls, *, front: float, rear: float, side: float) -> "Setbacks":
        return cls(front=front, rear=rear, side_left=side, side_right=side)


@dataclass
class LotGeometry:
    """A simple rectangular, axis-aligned lot. (0, 0) is the front-left
    corner; +x runs along the front lot line (street frontage), +y runs
    front-to-rear. See module docstring re: irregular-polygon lots."""

    width: float  # meters, along the street frontage
    depth: float  # meters, front-to-rear
    source_note: str  # required -- cite the deed/survey this came from ("SYNTHETIC TEST DATA" for a test case)

    def __post_init__(self) -> None:
        if self.width <= 0 or self.depth <= 0:
            raise ValueError(f"LotGeometry width/depth must be > 0, got width={self.width}, depth={self.depth}")
        if not self.source_note.strip():
            raise ValueError(
                "LotGeometry.source_note is required -- state where width/depth "
                "came from (deed/survey doc, or 'SYNTHETIC TEST DATA')"
            )

    def area(self) -> float:
        return self.width * self.depth

    def polygon(self) -> list[Point2D]:
        return [(0.0, 0.0), (self.width, 0.0), (self.width, self.depth), (0.0, self.depth)]


@dataclass
class ZoningConstraints:
    taks: float  # lot coverage ratio (0-1)
    kaks: float  # floor area ratio / emsal
    max_height: float  # meters, gabari -- max building height above red grade
    setbacks: Setbacks
    source_note: str  # required -- cite the imar durumu / plan notes doc this came from
    min_ground_floor_offset: float = 0.0  # meters above red grade
    max_ground_floor_offset: float | None = None  # meters above red grade; None = no upper bound enforced

    def __post_init__(self) -> None:
        if not (0 < self.taks <= 1):
            raise ValueError(f"taks must be in (0, 1], got {self.taks}")
        if self.kaks <= 0:
            raise ValueError(f"kaks must be > 0, got {self.kaks}")
        if self.max_height <= 0:
            raise ValueError(f"max_height must be > 0, got {self.max_height}")
        if not self.source_note.strip():
            raise ValueError(
                "ZoningConstraints.source_note is required -- state where these "
                "figures came from (imar durumu/plan notes doc, or 'SYNTHETIC TEST DATA')"
            )


@dataclass
class RoomSpec:
    name: str
    target_area: float  # m^2, net/usable target
    program_tag: str = "general"

    def __post_init__(self) -> None:
        if self.target_area <= 0:
            raise ValueError(f"RoomSpec {self.name!r}: target_area must be > 0, got {self.target_area}")


# ---------------------------------------------------------------------------
# Footprint sizing (pure geometry -- no file I/O)
# ---------------------------------------------------------------------------


def compute_buildable_envelope(lot: LotGeometry, setbacks: Setbacks) -> list[Point2D]:
    """The rectangle obtained by insetting the lot by each required
    setback. Setback geometry only -- does not consider TAKS coverage;
    compute_footprint() applies the TAKS cap on top of this."""
    x0 = setbacks.side_left
    x1 = lot.width - setbacks.side_right
    y0 = setbacks.front
    y1 = lot.depth - setbacks.rear
    if x1 <= x0 or y1 <= y0:
        raise ValueError(
            f"Setbacks leave no buildable envelope on a {lot.width}m x {lot.depth}m "
            f"lot (front={setbacks.front}, rear={setbacks.rear}, "
            f"side_left={setbacks.side_left}, side_right={setbacks.side_right})"
        )
    return [(x0, y0), (x1, y0), (x1, y1), (x0, y1)]


def compute_footprint(
    lot: LotGeometry,
    zoning: ZoningConstraints,
    program: list[RoomSpec],
    *,
    net_to_gross_efficiency: float = 0.85,
) -> list[Point2D]:
    """Sizes the footprint to the room program's net area needs (scaled up
    by `net_to_gross_efficiency` to account for wall thickness and
    circulation -- a schematic assumption, not derived from intake; 0.85 is
    a reasonable default for a small single-family layout and should be
    revisited per real project), capped at the TAKS-and-setback-defined
    maximum -- builds what the program needs, never more than zoning
    allows.

    Anchored to the front setback line, using the buildable envelope's full
    frontage width; any slack between the program-sized footprint and the
    maximum legal envelope is banked as extra rear yard rather than built
    out. That's a design decision (stated in the per-project rationale.md
    for real projects), not a geometric necessity.

    Raises ValueError if the program's net area needs (even at 100%
    efficiency) can't fit within the TAKS/setback-constrained envelope --
    a genuine site/program conflict to surface, not something to silently
    resolve by ignoring either the program or the zoning limit.
    """
    envelope = compute_buildable_envelope(lot, zoning.setbacks)
    (x0, y0), (x1, _y0b), _corner, (_x0b, y1) = envelope
    width = x1 - x0
    depth = y1 - y0
    envelope_area = width * depth
    taks_max_area = lot.area() * zoning.taks
    max_footprint_area = min(envelope_area, taks_max_area)

    net_program_area = sum(r.target_area for r in program)
    if net_program_area <= 0:
        raise ValueError("room program's target areas must sum to a positive number")
    required_footprint_area = net_program_area / net_to_gross_efficiency

    if required_footprint_area > max_footprint_area + 1e-9:
        raise ValueError(
            f"Room program needs ~{required_footprint_area:.1f} m2 of gross "
            f"footprint (net {net_program_area:.1f} m2 at "
            f"{net_to_gross_efficiency:.0%} efficiency), but the TAKS/setback-"
            f"constrained buildable envelope only allows {max_footprint_area:.1f} m2 "
            f"(setback envelope {envelope_area:.1f} m2, TAKS cap {taks_max_area:.1f} m2). "
            f"This is a genuine site/program conflict -- reduce the program or "
            f"confirm the zoning figures, rather than silently ignoring either one."
        )

    footprint_depth = required_footprint_area / width
    return [(x0, y0), (x1, y0), (x1, y0 + footprint_depth), (x0, y0 + footprint_depth)]


# ---------------------------------------------------------------------------
# Geometry layout (mutates a Building in place)
# ---------------------------------------------------------------------------


def _slug(text: str) -> str:
    return "".join(c.upper() if c.isalnum() else "-" for c in text).strip("-") or "ROOM"


def build_level_geometry(
    building: Building,
    footprint: list[Point2D],
    program: list[RoomSpec],
    *,
    level: int = 0,
    finished_floor_elevation: float,
    floor_to_floor_height: float,
    exterior_wall_thickness: float = 0.25,
    interior_wall_thickness: float = 0.10,
    door_width: float = 1.00,
    door_height: float = 2.10,
    window_width: float = 1.20,
    window_sill: float = 0.90,
    window_head: float = 2.10,
    id_prefix: str = "",
) -> None:
    """Lays out one level's walls/rooms/openings inside a rectangular
    `footprint`, and records that footprint on `building.footprints[level]`.
    Single-row "bay slicing": the footprint's interior is split into as many
    vertical bays as there are rooms in `program`, each spanning the full
    interior depth, with bay widths proportional to each room's share of the
    program's total target area (so actual room areas come out uniformly
    scaled from the requested targets, exactly filling the interior -- see
    module docstring re: this being a baseline layout, not an
    adjacency-aware solver).
    """
    if len(program) == 0:
        raise ValueError("room program must have at least one room")
    if len(footprint) != 4:
        raise ValueError(
            "build_level_geometry only supports a rectangular (4-point) "
            "footprint in this foundation-phase implementation"
        )
    (x0, y0), (x1, y0b), (x1b, y1), (x0b, y1b) = footprint
    if not (x0 == x0b and x1 == x1b and y0 == y0b and y1 == y1b and x1 > x0 and y1 > y0):
        raise ValueError(
            "footprint must be an axis-aligned rectangle given as "
            f"[(x0,y0),(x1,y0),(x1,y1),(x0,y1)], got {footprint}"
        )

    base_elev = finished_floor_elevation
    top_elev = finished_floor_elevation + floor_to_floor_height
    prefix = id_prefix or f"L{level}"

    building.footprints[level] = [(x0, y0), (x1, y0), (x1, y1), (x0, y1)]

    def mkwall(suffix: str, start: Point2D, end: Point2D, exterior: bool) -> Wall:
        return building.add_wall(
            Wall(
                id=f"{prefix}-WALL-{suffix}",
                start=start,
                end=end,
                thickness=exterior_wall_thickness if exterior else interior_wall_thickness,
                base_elevation=base_elev,
                top_elevation=top_elev,
                level=level,
                exterior=exterior,
                layer="A-WALL" if exterior else "A-WALL-INTR",
            )
        )

    wall_front = mkwall("FRONT", (x0, y0), (x1, y0), True)
    mkwall("RIGHT", (x1, y0), (x1, y1), True)
    wall_rear = mkwall("REAR", (x1, y1), (x0, y1), True)
    mkwall("LEFT", (x0, y1), (x0, y0), True)

    te2 = exterior_wall_thickness / 2.0
    ti2 = interior_wall_thickness / 2.0
    interior_x0, interior_x1 = x0 + te2, x1 - te2
    interior_y0, interior_y1 = y0 + te2, y1 - te2
    interior_width = interior_x1 - interior_x0
    interior_depth = interior_y1 - interior_y0
    if interior_width <= 0 or interior_depth <= 0:
        raise ValueError("exterior wall thickness leaves no interior space for this footprint")

    n = len(program)
    total_target = sum(r.target_area for r in program)

    bay_edges = [interior_x0]
    acc = 0.0
    for spec in program[:-1]:
        acc += spec.target_area
        bay_edges.append(interior_x0 + interior_width * (acc / total_target))
    bay_edges.append(interior_x1)

    for i in range(1, n):
        x = bay_edges[i]
        mkwall(f"PART-{i}", (x, interior_y0), (x, interior_y1), False)

    for i, spec in enumerate(program):
        left = bay_edges[i] + (ti2 if i > 0 else 0.0)
        right = bay_edges[i + 1] - (ti2 if i < n - 1 else 0.0)
        boundary = [(left, interior_y0), (right, interior_y0), (right, interior_y1), (left, interior_y1)]
        room = Room(
            id=f"{prefix}-ROOM-{i + 1}-{_slug(spec.name)}",
            name=spec.name,
            boundary=boundary,
            program_tag=spec.program_tag,
            level=level,
        )
        building.add_room(room)

        bay_width = bay_edges[i + 1] - bay_edges[i]
        w_width = min(window_width, bay_width - 0.6)
        if w_width > 0.3:
            bay_center_x = (bay_edges[i] + bay_edges[i + 1]) / 2.0
            position = wall_rear.start[0] - (bay_center_x + w_width / 2.0)
            building.add_opening(
                Opening(
                    id=f"{prefix}-WIN-{i + 1}",
                    type=OpeningType.WINDOW,
                    host_wall_id=wall_rear.id,
                    position=position,
                    width=w_width,
                    sill_height=window_sill,
                    head_height=window_head,
                    mark=f"W{i + 1}",
                )
            )

    first_bay_width = bay_edges[1] - bay_edges[0]
    d_width = max(0.7, min(door_width, first_bay_width - 0.4))
    first_bay_center = (bay_edges[0] + bay_edges[1]) / 2.0
    door_position = (first_bay_center - d_width / 2.0) - wall_front.start[0]
    building.add_opening(
        Opening(
            id=f"{prefix}-DOOR-1",
            type=OpeningType.DOOR,
            host_wall_id=wall_front.id,
            position=door_position,
            width=d_width,
            sill_height=0.0,
            head_height=door_height,
            mark="D1",
        )
    )


def generate_plan(
    *,
    name: str,
    lot: LotGeometry,
    zoning: ZoningConstraints,
    program: list[RoomSpec],
    red_grade_elevation: float,
    ground_floor_elevation: float,
    floor_to_floor_height: float = 3.0,
    exterior_wall_thickness: float = 0.25,
    interior_wall_thickness: float = 0.10,
    net_to_gross_efficiency: float = 0.85,
    level_name: str = "Ground Floor",
) -> Building:
    """Baseline schematic floor-plan generator: lot geometry + zoning
    constraints + room program -> a populated Building (level 0 only --
    see module docstring re: single-level foundation-phase scope).

    `ground_floor_elevation` is required (no default) and validated against
    `zoning.min_ground_floor_offset` / `max_ground_floor_offset` immediately
    -- a red-grade-relative ground floor level is exactly the kind of
    zoning-derived number the department's intake rules say to get
    explicitly right, not default silently.
    """
    if ground_floor_elevation < zoning.min_ground_floor_offset - 1e-9:
        raise ValueError(
            f"ground_floor_elevation ({ground_floor_elevation}) is below "
            f"zoning.min_ground_floor_offset ({zoning.min_ground_floor_offset}) "
            f"-- ({zoning.source_note})"
        )
    if zoning.max_ground_floor_offset is not None and ground_floor_elevation > zoning.max_ground_floor_offset + 1e-9:
        raise ValueError(
            f"ground_floor_elevation ({ground_floor_elevation}) is above "
            f"zoning.max_ground_floor_offset ({zoning.max_ground_floor_offset}) "
            f"-- ({zoning.source_note})"
        )

    footprint = compute_footprint(lot, zoning, program, net_to_gross_efficiency=net_to_gross_efficiency)

    building = Building(name=name, red_grade_elevation=red_grade_elevation)
    building.levels.append(
        Level(
            index=0,
            name=level_name,
            finished_floor_elevation=ground_floor_elevation,
            floor_to_floor_height=floor_to_floor_height,
        )
    )
    build_level_geometry(
        building,
        footprint,
        program,
        level=0,
        finished_floor_elevation=ground_floor_elevation,
        floor_to_floor_height=floor_to_floor_height,
        exterior_wall_thickness=exterior_wall_thickness,
        interior_wall_thickness=interior_wall_thickness,
    )
    return building


# ---------------------------------------------------------------------------
# Rendering helpers shared by DXF/SVG
# ---------------------------------------------------------------------------


def _wall_rectangle(wall: Wall) -> list[Point2D]:
    nx, ny = wall.normal()
    t2 = wall.thickness / 2.0
    (x1, y1), (x2, y2) = wall.start, wall.end
    return [
        (x1 + nx * t2, y1 + ny * t2),
        (x2 + nx * t2, y2 + ny * t2),
        (x2 - nx * t2, y2 - ny * t2),
        (x1 - nx * t2, y1 - ny * t2),
    ]


def _centroid(points: list[Point2D]) -> Point2D:
    xs = [p[0] for p in points]
    ys = [p[1] for p in points]
    return (sum(xs) / len(xs), sum(ys) / len(ys))


# ---------------------------------------------------------------------------
# DXF rendering
# ---------------------------------------------------------------------------


def _write_project_data(msp, data: dict[str, float]) -> None:
    point = msp.add_point((0.0, 0.0), dxfattribs={"layer": LAYERS["project_data"]})
    tags: list[tuple[int, str]] = [(1000, XDATA_MARKER)]
    for key, value in data.items():
        tags.append((1000, f"{key}={value}"))
    point.set_xdata(APPID, tags)


def _read_project_data(msp) -> dict[str, float]:
    candidates = [e for e in msp if e.dxftype() == "POINT" and e.dxf.layer == LAYERS["project_data"]]
    if not candidates:
        raise ValueError(
            f"No project-data POINT entity found on layer {LAYERS['project_data']!r} "
            "-- this DXF wasn't produced by cadgen.plan.render_dxf(), or the "
            "layer/marker scheme changed."
        )
    xdata = candidates[0].get_xdata(APPID)
    strings = [tag.value for tag in xdata if tag.code == 1000]
    if not strings or strings[0] != XDATA_MARKER:
        raise ValueError(
            f"Project-data XDATA is missing its version marker ({XDATA_MARKER!r}) "
            "-- refusing to trust unrecognized data."
        )
    result: dict[str, float] = {}
    for s in strings[1:]:
        key, sep, raw_value = s.partition("=")
        if not sep:
            continue
        try:
            result[key] = float(raw_value)
        except ValueError:
            result[key] = raw_value  # type: ignore[assignment]
    return result


def _draw_opening(msp, wall: Wall, opening: Opening) -> None:
    p0 = wall.point_at(opening.position)
    p1 = wall.point_at(opening.position + opening.width)
    nx, ny = wall.normal()
    t2 = wall.thickness / 2.0
    void = [
        (p0[0] + nx * t2, p0[1] + ny * t2),
        (p1[0] + nx * t2, p1[1] + ny * t2),
        (p1[0] - nx * t2, p1[1] - ny * t2),
        (p0[0] - nx * t2, p0[1] - ny * t2),
    ]
    msp.add_lwpolyline(void, close=True, dxfattribs={"layer": opening.layer})

    mid = ((p0[0] + p1[0]) / 2.0, (p0[1] + p1[1]) / 2.0)
    label_pt = (mid[0] + nx * (t2 + 0.15), mid[1] + ny * (t2 + 0.15))
    text = msp.add_text(opening.mark or opening.id, dxfattribs={"layer": opening.layer, "height": 0.15})
    text.set_placement(label_pt)

    if opening.type is OpeningType.DOOR:
        dx, dy = wall.direction()
        radius = opening.width
        angle_wall = math.degrees(math.atan2(dy, dx))
        angle_normal = math.degrees(math.atan2(ny, nx))
        start_angle, end_angle = sorted((angle_wall, angle_normal))
        msp.add_arc(
            center=p0, radius=radius, start_angle=start_angle, end_angle=end_angle,
            dxfattribs={"layer": opening.layer},
        )
        msp.add_line(p0, (p0[0] + nx * radius, p0[1] + ny * radius), dxfattribs={"layer": opening.layer})
    else:
        msp.add_line(
            (mid[0] + nx * t2, mid[1] + ny * t2),
            (mid[0] - nx * t2, mid[1] - ny * t2),
            dxfattribs={"layer": opening.layer},
        )


def _add_dimensions(msp, lot: LotGeometry, footprint: list[Point2D] | None) -> None:
    d = msp.add_linear_dim(base=(0, -1.0), p1=(0, 0), p2=(lot.width, 0), dxfattribs={"layer": LAYERS["dims"]})
    d.render()
    d = msp.add_linear_dim(base=(-1.0, 0), p1=(0, 0), p2=(0, lot.depth), angle=90, dxfattribs={"layer": LAYERS["dims"]})
    d.render()
    if not footprint:
        return
    fx0, fy0 = footprint[0]
    fx1, fy1 = footprint[2]

    d = msp.add_linear_dim(base=(fx0, fy1 + 0.6), p1=(fx0, fy1), p2=(fx1, fy1), dxfattribs={"layer": LAYERS["dims"]})
    d.render()
    d = msp.add_linear_dim(base=(fx1 + 0.6, fy0), p1=(fx1, fy0), p2=(fx1, fy1), angle=90, dxfattribs={"layer": LAYERS["dims"]})
    d.render()

    ref_x = lot.width + 1.2
    d = msp.add_linear_dim(base=(ref_x, 0), p1=(fx0, 0), p2=(fx0, fy0), angle=90, dxfattribs={"layer": LAYERS["dims"]})
    d.render()
    d = msp.add_linear_dim(base=(ref_x, 0), p1=(fx0, fy1), p2=(fx0, lot.depth), angle=90, dxfattribs={"layer": LAYERS["dims"]})
    d.render()

    ref_y = lot.depth + 1.2
    d = msp.add_linear_dim(base=(0, ref_y), p1=(0, fy0), p2=(fx0, fy0), dxfattribs={"layer": LAYERS["dims"]})
    d.render()
    d = msp.add_linear_dim(base=(0, ref_y), p1=(fx1, fy0), p2=(lot.width, fy0), dxfattribs={"layer": LAYERS["dims"]})
    d.render()


def render_dxf(
    building: Building,
    lot: LotGeometry,
    zoning: ZoningConstraints,
    path: str | Path,
    *,
    titleblock_info: TitleBlockInfo | None = None,
    level: int = 0,
) -> Path:
    """Renders `building` (+ the lot/zoning context it was generated from)
    to a real, to-scale DXF file. Per department convention, this is the
    authoritative deliverable (SVG below is a quick-review companion)."""
    doc = ezdxf.new("R2018")
    doc.header["$INSUNITS"] = 6  # meters
    doc.header["$MEASUREMENT"] = 1  # metric
    doc.appids.new(APPID)
    for layer_name, color in LAYER_COLORS.items():
        doc.layers.add(name=layer_name, color=color)

    msp = doc.modelspace()

    msp.add_lwpolyline(lot.polygon(), close=True, dxfattribs={"layer": LAYERS["property"]})

    envelope = compute_buildable_envelope(lot, zoning.setbacks)
    msp.add_lwpolyline(envelope, close=True, dxfattribs={"layer": LAYERS["envelope"]})

    footprint = building.footprints.get(level)
    if footprint:
        msp.add_lwpolyline(footprint, close=True, dxfattribs={"layer": LAYERS["footprint"]})

    for wall in building.walls_on_level(level):
        layer = LAYERS["wall_ext"] if wall.exterior else LAYERS["wall_int"]
        msp.add_lwpolyline(_wall_rectangle(wall), close=True, dxfattribs={"layer": layer})

    for wall in building.walls_on_level(level):
        for opening in building.openings_on_wall(wall.id):
            _draw_opening(msp, wall, opening)

    for room in building.rooms_on_level(level):
        msp.add_lwpolyline(room.boundary, close=True, dxfattribs={"layer": LAYERS["room_boundary"]})
        cx, cy = _centroid(room.boundary)
        mt = msp.add_mtext(
            f"{room.name}\n{room.area():.1f} m2",
            dxfattribs={"layer": LAYERS["room_boundary"], "char_height": 0.24},
        )
        mt.set_location((cx, cy))

    _add_dimensions(msp, lot, footprint)

    lvl = building.get_level(level)
    project_data = {
        "red_grade_elevation": building.red_grade_elevation,
        f"finished_floor_elevation_L{level}": lvl.finished_floor_elevation,
        "building_height_max": building.max_height(),
        "lot_width": lot.width,
        "lot_depth": lot.depth,
        "footprint_area": building.footprint_area(level),
        "total_construction_area": building.total_construction_area(),
    }
    _write_project_data(msp, project_data)

    note_lines = [
        f"Kirmizi kot (red grade line) datum: {building.red_grade_elevation:.2f} m (absolute)",
        f"Finished ground floor: red grade {'+' if lvl.finished_floor_elevation >= 0 else ''}{lvl.finished_floor_elevation:.2f} m",
        f"Building height above red grade: {building.max_height():.2f} m",
        f"Lot source: {lot.source_note}",
        f"Zoning source: {zoning.source_note}",
    ]
    note_text = "\n".join(note_lines)
    assert_no_stamp_language(note_text)
    note = msp.add_mtext(note_text, dxfattribs={"layer": LAYERS["notes"], "char_height": 0.16})
    note.set_location((0.0, -2.0))

    if titleblock_info is not None:
        draw_titleblock(msp, titleblock_info, insert=(lot.width + 2.5, lot.depth - 5.4), layer=LAYERS["titleblock"])

    out_path = Path(path)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    doc.saveas(str(out_path))
    return out_path


# ---------------------------------------------------------------------------
# SVG rendering (quick-review companion; DXF above is authoritative)
# ---------------------------------------------------------------------------


def render_svg(
    building: Building,
    lot: LotGeometry,
    zoning: ZoningConstraints,
    path: str | Path,
    *,
    titleblock_info: TitleBlockInfo | None = None,
    level: int = 0,
    scale_px_per_m: float = 20.0,
    margin_m: float = 2.0,
) -> Path:
    top_strip_m = 2.4
    bottom_strip_m = 3.6  # room for 3 info lines + the mandatory disclaimer, all within the viewBox
    width_px = (lot.width + margin_m * 2) * scale_px_per_m
    height_px = (lot.depth + margin_m * 2 + top_strip_m + bottom_strip_m) * scale_px_per_m

    def tx(pt: Point2D) -> tuple[float, float]:
        x, y = pt
        # SVG y grows downward; flip so the front lot line (y=0, street
        # side) reads near the bottom of the image -- the common site-plan
        # convention of "street at the bottom".
        sx = (x + margin_m) * scale_px_per_m
        sy = (lot.depth - y + margin_m + top_strip_m) * scale_px_per_m
        return (sx, sy)

    dwg = svgwrite.Drawing(str(path), size=(f"{width_px}px", f"{height_px}px"), viewBox=f"0 0 {width_px} {height_px}", profile="full")
    dwg.add(dwg.rect(insert=(0, 0), size=(width_px, height_px), fill="white"))
    dwg.add(
        dwg.text(
            f"{building.name} -- SCHEMATIC, requires licensed-architect review before permitting or construction",
            insert=(10, 20), font_size="13px", font_family="Arial", fill="#b00020",
        )
    )

    if titleblock_info is not None:
        for label, value in [
            ("PROJECT", titleblock_info.project_name),
            ("PARCEL", titleblock_info.parcel_id),
            ("DATE", titleblock_info.date),
            ("SCALE", titleblock_info.scale),
            ("SHEET", f"{titleblock_info.sheet_number} -- {titleblock_info.sheet_title}"),
        ]:
            assert_no_stamp_language(f"{label}: {value}")
        dwg.add(
            dwg.text(
                f"{titleblock_info.project_name} | {titleblock_info.parcel_id} | "
                f"{titleblock_info.sheet_number}: {titleblock_info.sheet_title} | "
                f"{titleblock_info.scale} | {titleblock_info.date}",
                insert=(10, 40), font_size="11px", font_family="Arial", fill="#333",
            )
        )

    dwg.add(dwg.polygon(points=[tx(p) for p in lot.polygon()], fill="none", stroke="#c00", stroke_width=2))

    envelope = compute_buildable_envelope(lot, zoning.setbacks)
    dwg.add(dwg.polygon(points=[tx(p) for p in envelope], fill="none", stroke="#999", stroke_width=1))

    footprint = building.footprints.get(level)
    if footprint:
        dwg.add(dwg.polygon(points=[tx(p) for p in footprint], fill="#eaf3ff", stroke="#2266aa", stroke_width=1))

    for wall in building.walls_on_level(level):
        color = "#333" if wall.exterior else "#999"
        dwg.add(dwg.polygon(points=[tx(p) for p in _wall_rectangle(wall)], fill=color, stroke="none"))

    for wall in building.walls_on_level(level):
        for opening in building.openings_on_wall(wall.id):
            p0 = tx(wall.point_at(opening.position))
            p1 = tx(wall.point_at(opening.position + opening.width))
            color = "#2a7d46" if opening.type is OpeningType.DOOR else "#2266cc"
            dwg.add(dwg.line(start=p0, end=p1, stroke=color, stroke_width=4))

    for room in building.rooms_on_level(level):
        pts = [tx(p) for p in room.boundary]
        dwg.add(dwg.polygon(points=pts, fill="none", stroke="#222", stroke_width=1))
        cx, cy = _centroid(pts)
        dwg.add(dwg.text(room.name, insert=(cx, cy - 6), font_size="11px", font_family="Arial", fill="#111", text_anchor="middle"))
        dwg.add(dwg.text(f"{room.area():.1f} m2", insert=(cx, cy + 8), font_size="10px", font_family="Arial", fill="#555", text_anchor="middle"))

    lvl = building.get_level(level)
    footprint_area = building.footprint_area(level)
    info_lines = [
        f"Lot: {lot.width:.2f} m x {lot.depth:.2f} m ({lot.area():.1f} m2) -- {lot.source_note}",
        f"Footprint: {footprint_area:.1f} m2 | TAKS used: {footprint_area / lot.area():.3f} (limit {zoning.taks:.2f}) -- {zoning.source_note}",
        f"Red grade datum: {building.red_grade_elevation:.2f} m | Ground floor: {'+' if lvl.finished_floor_elevation >= 0 else ''}{lvl.finished_floor_elevation:.2f} m | Height: {building.max_height():.2f} m (limit {zoning.max_height:.2f} m)",
    ]
    base_y = height_px - (bottom_strip_m * scale_px_per_m) + 14
    for i, line in enumerate(info_lines):
        dwg.add(dwg.text(line, insert=(10, base_y + i * 14), font_size="11px", font_family="Arial", fill="#333"))
    assert_no_stamp_language(DISCLAIMER)
    dwg.add(dwg.text(DISCLAIMER, insert=(10, base_y + len(info_lines) * 14 + 4), font_size="9px", font_family="Arial", fill="#b00020"))

    out_path = Path(path)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    dwg.save()
    return out_path


# ---------------------------------------------------------------------------
# Compliance verification -- re-derives figures from a freshly re-read DXF
# ---------------------------------------------------------------------------


@dataclass
class ComplianceCheck:
    name: str
    actual: float
    limit: float
    requirement: str  # e.g. "<=", ">=", or a short band description
    passed: bool
    detail: str = ""


@dataclass
class ComplianceReport:
    checks: list[ComplianceCheck] = field(default_factory=list)

    @property
    def all_passed(self) -> bool:
        return all(c.passed for c in self.checks)

    def summary(self) -> str:
        lines = []
        for c in self.checks:
            status = "PASS" if c.passed else "FAIL"
            lines.append(
                f"[{status}] {c.name}: actual={c.actual:.4f} {c.requirement} limit={c.limit:.4f}"
                + (f"  -- {c.detail}" if c.detail else "")
            )
        return "\n".join(lines)


def verify_compliance(
    dxf_path: str | Path,
    lot: LotGeometry,
    zoning: ZoningConstraints,
    *,
    level: int = 0,
    tolerance: float = 1e-6,
) -> ComplianceReport:
    """Re-derives lot coverage, floor area, height, each setback, and
    ground-floor level from a *freshly re-read* generated DXF file -- not
    the in-memory Building that produced it -- and checks each explicitly
    against the constraint list from intake. This is the department's
    mandatory compliance-verification pass
    (departments/architecture/CLAUDE.md, "Compliance verification"),
    implemented against the actual output file so a bug in the DXF-writing
    step itself would also be caught, not just a bug in the layout math.

    Also runs one check beyond the department's baseline five: that the
    drawn lot boundary matches the intake LotGeometry at all (dimension
    fidelity of the rendering step itself).

    Foundation-phase scope: single level only (see module docstring).
    """
    doc = ezdxf.readfile(str(dxf_path))
    msp = doc.modelspace()

    def polys_on_layer(layer: str) -> list[list[Point2D]]:
        result = []
        for e in msp:
            if e.dxftype() == "LWPOLYLINE" and e.dxf.layer == layer:
                result.append([(float(x), float(y)) for x, y in e.get_points("xy")])
        return result

    data = _read_project_data(msp)
    checks: list[ComplianceCheck] = []

    # 0. Drawn lot boundary matches the intake lot geometry (dimension-
    # fidelity check; not one of the department's baseline 5 -- added
    # because a generated dimension that quietly doesn't match the source
    # documents is exactly the failure mode this whole pass exists to catch)
    prop_polys = polys_on_layer(LAYERS["property"])
    if not prop_polys:
        raise ValueError(f"No property-line polyline found on layer {LAYERS['property']!r}")
    lot_x0, lot_y0, lot_x1, lot_y1 = bounding_box(prop_polys[0])
    drawn_width = lot_x1 - lot_x0
    drawn_depth = lot_y1 - lot_y0
    drawn_lot_area = polygon_area(prop_polys[0])
    lot_ok = (
        abs(drawn_width - lot.width) <= tolerance
        and abs(drawn_depth - lot.depth) <= tolerance
        and abs(drawn_lot_area - lot.area()) <= tolerance
    )
    checks.append(
        ComplianceCheck(
            name="[bonus] Drawn lot boundary matches intake lot geometry",
            actual=drawn_lot_area, limit=lot.area(), requirement="==", passed=lot_ok,
            detail=f"drawn {drawn_width:.3f}m x {drawn_depth:.3f}m vs intake {lot.width:.3f}m x {lot.depth:.3f}m ({lot.source_note})",
        )
    )

    # 1. TAKS -- lot coverage
    footprint_polys = polys_on_layer(LAYERS["footprint"])
    if not footprint_polys:
        raise ValueError(f"No footprint polyline found on layer {LAYERS['footprint']!r}")
    footprint_area = polygon_area(footprint_polys[0])
    lot_area = lot.area()
    taks_used = footprint_area / lot_area
    checks.append(
        ComplianceCheck(
            name="TAKS (lot coverage)", actual=taks_used, limit=zoning.taks, requirement="<=",
            passed=taks_used <= zoning.taks + tolerance,
            detail=f"footprint {footprint_area:.2f} m2 / lot {lot_area:.2f} m2 ({zoning.source_note})",
        )
    )

    # 2. KAKS / emsal -- floor area ratio. Foundation-phase simplification:
    # single level only, so total construction area == this level's
    # footprint area (model.Building.total_construction_area() already
    # generalizes to multiple levels for when that's built; this DXF-based
    # re-derivation reading a single footprint layer is the piece that
    # still needs extending alongside multi-story support generally).
    kaks_used = footprint_area / lot_area
    checks.append(
        ComplianceCheck(
            name="KAKS / Emsal (floor area ratio)", actual=kaks_used, limit=zoning.kaks, requirement="<=",
            passed=kaks_used <= zoning.kaks + tolerance,
            detail=f"construction area {footprint_area:.2f} m2 / lot {lot_area:.2f} m2 ({zoning.source_note})",
        )
    )

    # 3. Height / gabari. A plan-view DXF has no Z information (that's what
    # elevations/sections -- a later, not-yet-built pass -- are for), so
    # height is necessarily read from the project-data XDATA this generator
    # embeds, not from any drawn line geometry.
    height = data.get("building_height_max")
    if height is None:
        raise ValueError("building_height_max missing from project-data XDATA")
    checks.append(
        ComplianceCheck(
            name="Height / gabari", actual=height, limit=zoning.max_height, requirement="<=",
            passed=height <= zoning.max_height + tolerance,
            detail=f"from project-data XDATA ({zoning.source_note})",
        )
    )

    # 4. Setbacks -- footprint bounding box vs lot bounding box. Valid for
    # an axis-aligned rectangular lot + rectangular footprint (what this
    # foundation-phase generator produces); an irregular-polygon lot would
    # need true polygon-offset distances instead of a bbox comparison (see
    # LotGeometry docstring).
    fx0, fy0, fx1, fy1 = bounding_box(footprint_polys[0])
    front_actual = fy0 - lot_y0
    rear_actual = lot_y1 - fy1
    left_actual = fx0 - lot_x0
    right_actual = lot_x1 - fx1
    for setback_name, actual, required in [
        ("Front setback", front_actual, zoning.setbacks.front),
        ("Rear setback", rear_actual, zoning.setbacks.rear),
        ("Side setback (left)", left_actual, zoning.setbacks.side_left),
        ("Side setback (right)", right_actual, zoning.setbacks.side_right),
    ]:
        checks.append(
            ComplianceCheck(
                name=setback_name, actual=actual, limit=required, requirement=">=",
                passed=actual >= required - tolerance,
                detail=f"({zoning.source_note})",
            )
        )

    # 5. Ground floor level vs red grade (kirmizi kot) datum
    red_grade = data.get("red_grade_elevation")
    ffe = data.get(f"finished_floor_elevation_L{level}")
    if red_grade is None or ffe is None:
        raise ValueError("red_grade_elevation / finished_floor_elevation_L{level} missing from project-data XDATA")
    min_off = zoning.min_ground_floor_offset
    max_off = zoning.max_ground_floor_offset
    if max_off is None:
        gf_ok = ffe >= min_off - tolerance
        requirement = f">= {min_off:.3f}"
    else:
        gf_ok = (ffe >= min_off - tolerance) and (ffe <= max_off + tolerance)
        requirement = f"in [{min_off:.3f}, {max_off:.3f}]"
    checks.append(
        ComplianceCheck(
            name="Ground floor level vs red grade (kirmizi kot) datum",
            actual=ffe, limit=min_off, requirement=requirement, passed=gf_ok,
            detail=f"red grade datum {red_grade:.2f} m absolute; finished floor at datum {'+' if ffe >= 0 else ''}{ffe:.3f} m ({zoning.source_note})",
        )
    )

    return ComplianceReport(checks=checks)
