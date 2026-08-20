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
    # Roof/attic-piyes ridge allowance, e.g. Turkish plan notes item 4.2.32
    # ("mahya <= 5.50m above top floor's slab") -- a SEPARATE rule from
    # `max_height` (the eave-level gabari, which a roof piyes structure is
    # not counted against). None = no roof-ridge check performed.
    roof_ridge_max_above_top_slab: float | None = None

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


@dataclass
class CoreSpec:
    """A vertical circulation core (stair + elevator shaft), reserved at the
    SAME absolute (x, y) footprint on every level of a multi-level building
    -- this is what a real stair/elevator physically requires: the shaft has
    to punch through every floor slab at the same plan position, not just be
    positioned by convention.

    Found and fixed this pass (see the 377/1 rationale.md, design-judgment
    section): the pre-existing `generate_multilevel_plan()` had NO concept of
    a shared core at all -- each level's room program was independently
    bay-sliced by `build_level_geometry()`, with no mechanism tying one
    level's circulation room to the same X/Y position on another level.
    Inspecting the actual generated 377/1 DXFs confirmed this was a real, not
    theoretical, gap: the zemin kat's "Giris + Merdiven/Asansor" room sat at
    X=[3.125, 9.691], but the normal kat sheets had NO circulation-tagged
    room at that position at all (their first bay was a bedroom at
    X=[3.125, 8.821], and "Hol" was the LAST bay at X=[18.047, 20.025]), and
    the bodrum kat and cati piyesi sheets had no core room whatsoever. There
    was no continuous vertical shaft represented anywhere in the drawing set.

    `CoreSpec` fixes this by being applied identically on every level via
    `generate_multilevel_plan(core=...)`: the shaft rectangle
    (`width` x `depth`) is anchored to the footprint's own interior
    front-left corner (`x0 + exterior_wall_thickness/2`,
    `y0 + exterior_wall_thickness/2`), which is already identical across
    every level of a `generate_multilevel_plan()` building AS LONG AS every
    LevelSpec shares the same `exterior_wall_thickness` (enforced --
    `generate_multilevel_plan()` raises if a core is requested and levels
    don't agree) -- both `compute_footprint()` and
    `compute_footprint_fitted()` always anchor a footprint's front-left
    corner at `(setbacks.side_left, setbacks.front)` regardless of the
    footprint's own width/depth, so this anchor point is genuinely identical
    level to level, not just close.

    `depth` deliberately defaults small (2.60 m) so the shaft fits inside
    the SHALLOWEST level's own interior depth with margin -- sized to
    satisfy plan notes item 4.2.55 (elevator shaft dar kenar >= 1.60 m,
    alan >= 3.00 m2) and a minimal stair run, not a generous lobby. Any
    leftover depth behind the shaft (on levels whose interior is deeper than
    `depth`) is drawn as a separate small landing room by
    `build_level_geometry()`/`build_level_geometry_multiunit()` -- that
    landing area legitimately varies level to level (it's not part of the
    structural shaft), only the shaft rectangle itself is held identical.
    """

    width: float = 3.00
    depth: float = 2.60
    name: str = "Merdiven + Asansor Cekirdegi"
    landing_name: str = "Ortak Sahanlik"

    def __post_init__(self) -> None:
        if self.width <= 0 or self.depth <= 0:
            raise ValueError(f"CoreSpec width/depth must be > 0, got width={self.width}, depth={self.depth}")


def _core_rect(
    footprint: list[Point2D], exterior_wall_thickness: float, core: CoreSpec
) -> tuple[float, float, float, float]:
    """Returns (core_x0, core_y0, core_x1, core_y1) -- the core shaft's
    absolute plan rectangle, anchored to `footprint`'s own interior
    front-left corner. See CoreSpec's docstring for why this comes out
    identical across every level of a `generate_multilevel_plan()` building."""
    (x0, y0) = footprint[0]
    te2 = exterior_wall_thickness / 2.0
    core_x0 = x0 + te2
    core_y0 = y0 + te2
    return core_x0, core_y0, core_x0 + core.width, core_y0 + core.depth


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


def compute_footprint_fitted(
    lot: LotGeometry,
    zoning: ZoningConstraints,
    program: list[RoomSpec],
    *,
    net_to_gross_efficiency: float = 0.85,
    max_width: float | None = None,
) -> list[Point2D]:
    """Like `compute_footprint()`, but does NOT always stretch the footprint
    across the buildable envelope's full frontage width.

    Why this exists: `compute_footprint()` always uses the full envelope
    width and only varies depth, which is right for a level whose program
    area is large relative to the lot (e.g. 377/1's ground floor, ~127 m2 on
    a 30m-wide envelope -> a sensible ~4.2m-deep footprint, and with its
    4-room program each bay comes out a reasonable ~7.5m x 4.2m). But for a
    level whose program area is small relative to a wide lot (e.g. a
    bedroom-only upper floor with ~59 m2 of required footprint on the same
    30m-wide envelope), that same approach produces an unrealistic sliver
    (<2m deep) -- exactly the failure mode 377/1's own rationale.md already
    flagged under "Single-row bay-slicing layout" for the single-level case,
    now reproduced worse on a small upper-floor program.

    IMPORTANT, learned empirically while building this for 377/1: simply
    making the OVERALL footprint squarish (width ~= sqrt(area)) is not
    enough by itself -- `build_level_geometry()`'s single-row bay-slicing
    still divides whatever footprint it's given into `len(program)` bays
    side by side, each spanning the FULL footprint depth. A squarish overall
    footprint with, say, 5 bays in a row still produces 5 narrow, TALL
    slivers (width/5 wide x full depth), just slivers in the other
    orientation. What actually needs to be squarish is each individual BAY,
    which means sizing for `depth = sqrt(required_area / n_bays)` (so that
    an average bay, width/n_bays wide x depth deep, comes out close to
    square) rather than sizing the footprint as a whole in isolation from
    the room count that's about to subdivide it.

    Still capped by `max_width` (defaults to the full envelope width) and by
    the envelope's depth, still anchored to the same front-setback /
    left-side-setback corner as `compute_footprint()` (so it's still fully
    accountable to the same TAKS/envelope cap), and still raises ValueError
    if the program's net area needs, even at 100% efficiency, can't fit
    within the TAKS/setback-constrained envelope -- same as
    `compute_footprint()`.
    """
    envelope = compute_buildable_envelope(lot, zoning.setbacks)
    (x0, y0), (x1, _y0b), _corner, (_x0b, y1) = envelope
    envelope_width = x1 - x0
    envelope_depth = y1 - y0
    envelope_area = envelope_width * envelope_depth
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

    width_cap = min(envelope_width, max_width) if max_width is not None else envelope_width
    # Size for square-ish INDIVIDUAL BAYS, not a square overall footprint --
    # see the docstring above for why this distinction matters. With n_bays
    # bays in a row each ~ (width/n_bays) wide x depth deep, an average bay
    # is square when depth = sqrt(area / n_bays), i.e. width = n_bays * depth
    # = sqrt(area * n_bays).
    n_bays = max(1, len(program))
    ideal_width = math.sqrt(required_footprint_area * n_bays)
    width = min(width_cap, ideal_width)
    depth = required_footprint_area / width
    if depth > envelope_depth + 1e-9:
        # Squarish sizing doesn't fit the envelope's depth -- fall back to
        # using the full available depth and expand width to compensate
        # (still capped by width_cap, checked just below).
        depth = envelope_depth
        width = required_footprint_area / depth
    if width > width_cap + 1e-9:
        raise ValueError(
            f"Program area {required_footprint_area:.1f} m2 cannot fit within "
            f"the {envelope_width:.2f}m x {envelope_depth:.2f}m buildable "
            f"envelope at any width up to max_width={width_cap:.2f}m -- "
            f"a genuine site/program conflict, not silently resolved."
        )
    return [(x0, y0), (x0 + width, y0), (x0 + width, y0 + depth), (x0, y0 + depth)]


def compute_footprint_explicit_depth(
    lot: LotGeometry,
    zoning: ZoningConstraints,
    depth: float,
    *,
    max_width: float | None = None,
) -> list[Point2D]:
    """Like `compute_footprint()`, but the caller states `depth` directly
    instead of it being derived from a room program's net area.

    Why this exists: `compute_footprint()` and `compute_footprint_fitted()`
    both size the footprint FROM a room program, which is right when a
    level's own single program is what determines how big it needs to be.
    It's the wrong tool when the footprint needs to be sized from a
    DIFFERENT consideration -- e.g. 377/1's multi-unit normal kat floors,
    where the footprint has to be deep enough to hold a shared core + a
    shared entry corridor + two full apartment units side by side (a plan
    shape decision), not just "big enough for the combined net area" (which,
    at `compute_footprint()`'s always-full-envelope-width sizing, produces
    an unusably shallow slab when the combined program is modest relative to
    a 30m-wide envelope -- exactly the failure this function avoids).

    Still anchored to the same front-setback / left-side-setback corner as
    `compute_footprint()`/`compute_footprint_fitted()` (so it's still fully
    accountable to the same setback envelope), still uses the full buildable
    envelope width by default (or `max_width` if smaller), and still raises
    ValueError if the requested depth doesn't fit the setback-constrained
    envelope's own depth -- a genuine site conflict to surface, not silently
    resolved. Deliberately does NOT check TAKS here (TAKS applies to the
    level(s) a caller marks `count_toward_taks=True`, checked later by
    `verify_compliance_multilevel()` against the actual drawn footprint, not
    pre-emptively guessed here) -- this mirrors how `compute_footprint()`
    itself only pre-checks the setback envelope, leaving TAKS/KAKS as the
    compliance pass's job.
    """
    if depth <= 0:
        raise ValueError(f"depth must be > 0, got {depth}")
    envelope = compute_buildable_envelope(lot, zoning.setbacks)
    (x0, y0), (x1, _y0b), _corner, (_x0b, y1) = envelope
    envelope_width = x1 - x0
    envelope_depth = y1 - y0
    width = min(envelope_width, max_width) if max_width is not None else envelope_width
    if depth > envelope_depth + 1e-9:
        raise ValueError(
            f"Requested depth ({depth:.2f}m) exceeds the setback-constrained buildable "
            f"envelope's own depth ({envelope_depth:.2f}m) -- a genuine site conflict, "
            f"not silently resolved."
        )
    return [(x0, y0), (x0 + width, y0), (x0 + width, y0 + depth), (x0, y0 + depth)]


# ---------------------------------------------------------------------------
# Geometry layout (mutates a Building in place)
# ---------------------------------------------------------------------------


def _slug(text: str) -> str:
    return "".join(c.upper() if c.isalnum() else "-" for c in text).strip("-") or "ROOM"


def _layout_bay_row(
    building: Building,
    mkwall,
    rect: tuple[float, float, float, float],
    program: list[RoomSpec],
    *,
    level: int,
    interior_wall_thickness: float,
    window_width: float,
    window_sill: float,
    window_head: float,
    rear_wall: Wall,
    id_prefix: str,
) -> list[float]:
    """Bay-slices `program` (single row, each bay spanning the full depth of
    `rect`) via `mkwall` (a closure that draws a Wall and returns it -- see
    build_level_geometry()/build_level_geometry_multiunit() for the exact
    signature each passes), adds one Room + one rear-wall window per bay to
    `building`, and returns the list of bay edge x-coordinates
    (len == len(program) + 1) so the caller can place a door against a
    specific bay. Factored out of build_level_geometry() this pass so the
    same single-row layout math can also be applied per-unit inside
    build_level_geometry_multiunit(), instead of duplicating it.
    """
    ix0, iy0, ix1, iy1 = rect
    interior_width = ix1 - ix0
    n = len(program)
    total_target = sum(r.target_area for r in program)
    ti2 = interior_wall_thickness / 2.0

    bay_edges = [ix0]
    acc = 0.0
    for spec in program[:-1]:
        acc += spec.target_area
        bay_edges.append(ix0 + interior_width * (acc / total_target))
    bay_edges.append(ix1)

    for i in range(1, n):
        x = bay_edges[i]
        mkwall(f"PART-{i}", (x, iy0), (x, iy1), False)

    for i, spec in enumerate(program):
        left = bay_edges[i] + (ti2 if i > 0 else 0.0)
        right = bay_edges[i + 1] - (ti2 if i < n - 1 else 0.0)
        boundary = [(left, iy0), (right, iy0), (right, iy1), (left, iy1)]
        room = Room(
            id=f"{id_prefix}-ROOM-{i + 1}-{_slug(spec.name)}",
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
            position = rear_wall.start[0] - (bay_center_x + w_width / 2.0)
            building.add_opening(
                Opening(
                    id=f"{id_prefix}-WIN-{i + 1}",
                    type=OpeningType.WINDOW,
                    host_wall_id=rear_wall.id,
                    position=position,
                    width=w_width,
                    sill_height=window_sill,
                    head_height=window_head,
                    mark=f"W{i + 1}",
                )
            )
    return bay_edges


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
    core: CoreSpec | None = None,
    entry_at_core_front: bool = False,
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

    `core` (optional, added this pass -- see CoreSpec's docstring for the
    real alignment bug this closes): when given, a stair/elevator shaft is
    carved out of the footprint's front-left corner FIRST, at the exact same
    absolute position `core` would produce on every other level of the same
    multi-level building, and `program` is then bay-sliced into the
    remaining area to the RIGHT of the core (not the full interior) --
    still single-row, same algorithm, just operating on a narrower rect.
    `entry_at_core_front`: if True, the level's one auto-placed door opens
    directly from the building's front exterior wall into the core itself
    (the ground-floor main entrance leading straight into the stair/elevator
    lobby); if False (default), the door instead connects the core to the
    first bay of `program` (an upper floor's landing opening into its
    single hallway/room), matching how a resident actually moves through
    the building. Ignored (must be False) when `core` is None.
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
    if core is None and entry_at_core_front:
        raise ValueError("entry_at_core_front=True requires a core to be given")

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

    if core is None:
        bay_edges = _layout_bay_row(
            building, mkwall, (interior_x0, interior_y0, interior_x1, interior_y1), program,
            level=level, interior_wall_thickness=interior_wall_thickness,
            window_width=window_width, window_sill=window_sill, window_head=window_head,
            rear_wall=wall_rear, id_prefix=prefix,
        )
        first_bay_width = bay_edges[1] - bay_edges[0]
        d_width = max(0.7, min(door_width, first_bay_width - 0.4))
        first_bay_center = (bay_edges[0] + bay_edges[1]) / 2.0
        door_position = (first_bay_center - d_width / 2.0) - wall_front.start[0]
        building.add_opening(
            Opening(
                id=f"{prefix}-DOOR-1", type=OpeningType.DOOR, host_wall_id=wall_front.id,
                position=door_position, width=d_width, sill_height=0.0, head_height=door_height, mark="D1",
            )
        )
        return

    # -- core-aware path: carve the shaft out of the front-left corner first,
    # then bay-slice `program` into the remainder to its right ---------------
    core_x0, core_y0, core_x1_raw, core_y1_raw = _core_rect(footprint, exterior_wall_thickness, core)
    if core_x1_raw > interior_x1 - 1e-9 or core_y1_raw > interior_y1 + 1e-9:
        raise ValueError(
            f"CoreSpec ({core.width}m x {core.depth}m) does not fit inside level {level}'s own "
            f"interior ({interior_width:.2f}m x {interior_depth:.2f}m) -- a genuine site/program "
            f"conflict to surface, not silently resolved."
        )

    core_right_wall = mkwall("CORE-RIGHT", (core_x1_raw, interior_y0), (core_x1_raw, interior_y1), False)

    landing_depth = interior_y1 - core_y1_raw
    if landing_depth > 0.05:
        mkwall("CORE-REAR", (core_x0, core_y1_raw), (core_x1_raw, core_y1_raw), False)
        core_rear_edge = core_y1_raw - ti2
        landing_front_edge = core_y1_raw + ti2
        building.add_room(
            Room(
                id=f"{prefix}-CORE-LANDING", name=core.landing_name,
                boundary=[(core_x0, landing_front_edge), (core_x1_raw - ti2, landing_front_edge),
                          (core_x1_raw - ti2, interior_y1), (core_x0, interior_y1)],
                program_tag="circulation", level=level,
            )
        )
    else:
        core_rear_edge = interior_y1

    building.add_room(
        Room(
            id=f"{prefix}-CORE", name=core.name,
            boundary=[(core_x0, core_y0), (core_x1_raw - ti2, core_y0), (core_x1_raw - ti2, core_rear_edge), (core_x0, core_rear_edge)],
            program_tag="circulation-core", level=level,
        )
    )

    region_x0 = core_x1_raw + ti2
    bay_edges = _layout_bay_row(
        building, mkwall, (region_x0, interior_y0, interior_x1, interior_y1), program,
        level=level, interior_wall_thickness=interior_wall_thickness,
        window_width=window_width, window_sill=window_sill, window_head=window_head,
        rear_wall=wall_rear, id_prefix=prefix,
    )

    if entry_at_core_front:
        d_width = max(0.7, min(door_width, core.width - 0.4))
        core_center_x = (core_x0 + core_x1_raw) / 2.0
        door_position = (core_center_x - d_width / 2.0) - wall_front.start[0]
        building.add_opening(
            Opening(
                id=f"{prefix}-DOOR-1", type=OpeningType.DOOR, host_wall_id=wall_front.id,
                position=door_position, width=d_width, sill_height=0.0, head_height=door_height, mark="D1",
            )
        )
    else:
        d_width = max(0.7, min(door_width, interior_depth - 0.2))
        door_center_y = (interior_y0 + min(core_y1_raw, interior_y1)) / 2.0
        wall_len = core_right_wall.length()
        door_position = max(0.05, min(door_center_y - interior_y0 - d_width / 2.0, wall_len - d_width - 0.05))
        building.add_opening(
            Opening(
                id=f"{prefix}-DOOR-1", type=OpeningType.DOOR, host_wall_id=core_right_wall.id,
                position=door_position, width=d_width, sill_height=0.0, head_height=door_height, mark="D1",
            )
        )


def build_level_geometry_multiunit(
    building: Building,
    footprint: list[Point2D],
    units: list[list[RoomSpec]],
    *,
    core: CoreSpec,
    level: int = 0,
    finished_floor_elevation: float,
    floor_to_floor_height: float,
    exterior_wall_thickness: float = 0.25,
    interior_wall_thickness: float = 0.10,
    demising_wall_thickness: float = 0.20,
    corridor_depth: float = 1.50,
    door_width: float = 1.00,
    door_height: float = 2.10,
    window_width: float = 1.20,
    window_sill: float = 0.90,
    window_head: float = 2.10,
    id_prefix: str = "",
) -> None:
    """Like build_level_geometry(), but lays out MULTIPLE independent
    apartment units side by side on one level, all served by one shared
    vertical core (`core`, mandatory here) via a shared entry corridor.

    Built for the 377/1 multi-unit program pivot (see
    clients/377-1/notes/rationale.md's design-judgment section): a normal
    kat with 2+ units needs each unit to have its own front door reachable
    from the shared stair/elevator core, which build_level_geometry()'s
    single "bay-slice the rest of the level into one program" can't express
    (it only ever produces one shared entry into one row of rooms). This
    function instead:

    1. carves out `core` at the footprint's front-left corner, exactly like
       build_level_geometry()'s core path (same CoreSpec, same alignment
       guarantee across levels);
    2. reserves a shared entry corridor (`corridor_depth` deep, full width)
       immediately behind the front wall, to the right of the core -- this
       is what makes multiple independent unit doors possible from one
       shared core;
    3. splits the remaining depth's width into one block per entry in
       `units` (proportional to each unit's own total target area),
       separated by a `demising_wall_thickness` party wall;
    4. bay-slices each unit's own room list into its block via the same
       `_layout_bay_row()` helper build_level_geometry() uses, and opens
       one door per unit onto the shared corridor.

    Foundation-phase scope, same caveat as build_level_geometry(): each
    unit's own rooms are still a single row of full-block-depth bays, not an
    adjacency-aware layout, and every unit gets the same rectangular block
    shape (proportioned by area, not hand-planned).
    """
    if len(units) == 0:
        raise ValueError("units must contain at least one unit's room program")
    for u in units:
        if len(u) == 0:
            raise ValueError("every unit's room program must have at least one room")
    if len(footprint) != 4:
        raise ValueError("build_level_geometry_multiunit only supports a rectangular (4-point) footprint")
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

    def mkwall(suffix: str, start: Point2D, end: Point2D, exterior: bool, *, thickness: float | None = None) -> Wall:
        return building.add_wall(
            Wall(
                id=f"{prefix}-WALL-{suffix}",
                start=start,
                end=end,
                thickness=thickness if thickness is not None else (exterior_wall_thickness if exterior else interior_wall_thickness),
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
    dw2 = demising_wall_thickness / 2.0
    interior_x0, interior_x1 = x0 + te2, x1 - te2
    interior_y0, interior_y1 = y0 + te2, y1 - te2
    interior_width = interior_x1 - interior_x0
    interior_depth = interior_y1 - interior_y0
    if interior_width <= 0 or interior_depth <= 0:
        raise ValueError("exterior wall thickness leaves no interior space for this footprint")

    core_x0, core_y0, core_x1_raw, core_y1_raw = _core_rect(footprint, exterior_wall_thickness, core)
    if core_x1_raw > interior_x1 - 1e-9 or core_y1_raw > interior_y1 + 1e-9:
        raise ValueError(
            f"CoreSpec ({core.width}m x {core.depth}m) does not fit inside level {level}'s own "
            f"interior ({interior_width:.2f}m x {interior_depth:.2f}m) -- a genuine site/program "
            f"conflict to surface, not silently resolved."
        )
    if interior_depth <= corridor_depth + 0.5:
        raise ValueError(
            f"corridor_depth ({corridor_depth}m) leaves under 0.5m of room depth on a "
            f"{interior_depth:.2f}m-deep level -- widen the footprint or shrink corridor_depth."
        )

    core_right_wall = mkwall("CORE-RIGHT", (core_x1_raw, interior_y0), (core_x1_raw, interior_y1), False)

    landing_depth = interior_y1 - core_y1_raw
    if landing_depth > 0.05:
        mkwall("CORE-REAR", (core_x0, core_y1_raw), (core_x1_raw, core_y1_raw), False)
        core_rear_edge = core_y1_raw - ti2
        landing_front_edge = core_y1_raw + ti2
        building.add_room(
            Room(
                id=f"{prefix}-CORE-LANDING", name=core.landing_name,
                boundary=[(core_x0, landing_front_edge), (core_x1_raw - ti2, landing_front_edge),
                          (core_x1_raw - ti2, interior_y1), (core_x0, interior_y1)],
                program_tag="circulation", level=level,
            )
        )
    else:
        core_rear_edge = interior_y1

    building.add_room(
        Room(
            id=f"{prefix}-CORE", name=core.name,
            boundary=[(core_x0, core_y0), (core_x1_raw - ti2, core_y0), (core_x1_raw - ti2, core_rear_edge), (core_x0, core_rear_edge)],
            program_tag="circulation-core", level=level,
        )
    )

    corridor_y1 = interior_y0 + corridor_depth
    corridor_rear_wall = mkwall("CORRIDOR-REAR", (core_x1_raw, corridor_y1), (interior_x1, corridor_y1), False)
    building.add_room(
        Room(
            id=f"{prefix}-CORRIDOR", name="Ortak Kat Holu",
            boundary=[(core_x1_raw + ti2, interior_y0), (interior_x1, interior_y0),
                      (interior_x1, corridor_y1 - ti2), (core_x1_raw + ti2, corridor_y1 - ti2)],
            program_tag="circulation", level=level,
        )
    )

    unit_rows_y0 = corridor_y1 + ti2
    unit_rows_y1 = interior_y1
    n_units = len(units)
    total_unit_area = sum(sum(r.target_area for r in u) for u in units)

    unit_edges = [core_x1_raw + ti2]
    acc = 0.0
    for u in units[:-1]:
        acc += sum(r.target_area for r in u)
        unit_edges.append(core_x1_raw + ti2 + (interior_x1 - (core_x1_raw + ti2)) * (acc / total_unit_area))
    unit_edges.append(interior_x1)

    for i in range(1, n_units):
        x = unit_edges[i]
        mkwall(f"DEMISE-{i}", (x, unit_rows_y0), (x, unit_rows_y1), False, thickness=demising_wall_thickness)

    for i, unit_program in enumerate(units):
        left = unit_edges[i] + (dw2 if i > 0 else 0.0)
        right = unit_edges[i + 1] - (dw2 if i < n_units - 1 else 0.0)
        unit_prefix = f"{prefix}-U{i + 1}"

        def unit_mkwall(suffix: str, start: Point2D, end: Point2D, exterior: bool, _up: str = unit_prefix) -> Wall:
            return building.add_wall(
                Wall(
                    id=f"{_up}-WALL-{suffix}", start=start, end=end, thickness=interior_wall_thickness,
                    base_elevation=base_elev, top_elevation=top_elev, level=level, exterior=False, layer="A-WALL-INTR",
                )
            )

        bay_edges = _layout_bay_row(
            building, unit_mkwall, (left, unit_rows_y0, right, unit_rows_y1), unit_program,
            level=level, interior_wall_thickness=interior_wall_thickness,
            window_width=window_width, window_sill=window_sill, window_head=window_head,
            rear_wall=wall_rear, id_prefix=unit_prefix,
        )

        # Unit entry door: hosted on the shared corridor-rear wall (one wall,
        # multiple door openings -- the model already supports this via
        # Building.openings_on_wall()), positioned against this unit's own
        # first bay so the door opens directly into the room a resident
        # would actually enter from.
        first_bay_width = bay_edges[1] - bay_edges[0]
        d_width = max(0.7, min(door_width, first_bay_width - 0.3))
        bay_center = (bay_edges[0] + bay_edges[1]) / 2.0
        door_position = bay_center - d_width / 2.0 - corridor_rear_wall.start[0]
        wall_len = corridor_rear_wall.length()
        door_position = max(0.05, min(door_position, wall_len - d_width - 0.05))
        building.add_opening(
            Opening(
                id=f"{unit_prefix}-DOOR-1", type=OpeningType.DOOR, host_wall_id=corridor_rear_wall.id,
                position=door_position, width=d_width, sill_height=0.0, head_height=door_height, mark=f"D{i + 1}",
            )
        )


# ---------------------------------------------------------------------------
# True duplex support (added for 377/1's reverse-duplex / roof-duplex pass,
# see clients/377-1/notes/rationale.md's dated section for this pass).
#
# Real, reusable library gap this closes, stated precisely: every
# LevelSpec/generate_multilevel_plan() level up to this point -- including
# CoreSpec's own multi-level alignment guarantee -- sizes and lays out ONE
# level's own room program independently (see LevelSpec's module docs,
# "per-level independent footprint sizing"). There was no way to express a
# single bagimsiz bolum (independent dwelling unit) whose OWN room program
# spans two physically stacked levels, connected by its own internal stair
# -- a reverse duplex (bodrum+zemin) or a roof duplex (top normal kat +
# cati piyesi) are both exactly this. DuplexPairSpec/DuplexUnitSpec/
# DuplexZoneSpec + build_level_geometry_duplex_level() add it as real
# library capability, not a per-project hack -- same status CoreSpec itself
# has (see that class's own docstring for the identical alignment-guarantee
# reasoning this reuses).
# ---------------------------------------------------------------------------


@dataclass
class DuplexUnitSpec:
    """One duplex dwelling unit (bagimsiz bolum) whose room program spans
    TWO physically stacked levels of a DuplexPairSpec, connected by a
    private internal stair -- NOT the shared building core/corridor.

    `entry_rooms`: the rooms on the pair's `entry_level` (see
    DuplexPairSpec) -- where this unit's own front door opens onto the
    shared circulation (corridor), same as any other independent unit.
    `secondary_rooms`: the rooms on the OTHER level of the pair, reached
    ONLY via this unit's own private internal stair -- no door of their own
    onto any shared circulation (matches how a real reverse-duplex's
    basement half, or a roof-duplex's loft half, is actually accessed).
    """

    name_prefix: str
    entry_rooms: list[RoomSpec]
    secondary_rooms: list[RoomSpec]

    def __post_init__(self) -> None:
        if not self.entry_rooms:
            raise ValueError(f"DuplexUnitSpec {self.name_prefix!r}: entry_rooms must have at least one room")
        if not self.secondary_rooms:
            raise ValueError(f"DuplexUnitSpec {self.name_prefix!r}: secondary_rooms must have at least one room")

    def entry_area(self) -> float:
        return sum(r.target_area for r in self.entry_rooms)

    def secondary_area(self) -> float:
        return sum(r.target_area for r in self.secondary_rooms)


@dataclass
class DuplexZoneSpec:
    """One additional bay-sliced zone flanking a DuplexPairSpec's units
    zone (e.g. the shared entry lobby next to a reverse-duplex's units, on
    the building's own entry level) -- SAME width on both levels of the
    pair by construction (see build_level_geometry_duplex_level()), so it
    never breaks the pair's own cross-level x-alignment guarantee, even
    though what's actually built inside it can differ level to level
    (`entry_program` vs. `secondary_program` -- either may be left empty,
    meaning "reserve the width on this level but don't lay out rooms in it
    here", e.g. a basement zone that sits directly below the ground floor's
    lobby but is used for something else entirely)."""

    name: str
    width: float
    entry_program: list[RoomSpec] = field(default_factory=list)
    secondary_program: list[RoomSpec] = field(default_factory=list)

    def __post_init__(self) -> None:
        if self.width <= 0:
            raise ValueError(f"DuplexZoneSpec {self.name!r}: width must be > 0")


@dataclass
class DuplexPairSpec:
    """Two adjacent levels of one `generate_multilevel_plan()` building
    whose combined program is NOT independent per-level units (unlike
    `units=` on a LevelSpec / build_level_geometry_multiunit()), but
    `units` REAL duplex units, each spanning BOTH levels via its own
    private internal stair. See `build_level_geometry_duplex_level()`'s
    docstring for exactly how cross-level alignment (the core, every
    DuplexZoneSpec boundary, the units zone itself, each unit's own stair
    shaft) is guaranteed identical on both levels.
    """

    lower_level: int
    upper_level: int
    entry_level: int  # must equal lower_level or upper_level
    units: list[DuplexUnitSpec]
    units_zone_width: float  # meters -- explicit, IDENTICAL on both levels (not derived from either level's own footprint)
    zones_before_units: list[DuplexZoneSpec] = field(default_factory=list)
    zones_after_units: list[DuplexZoneSpec] = field(default_factory=list)
    corridor_depth: float = 1.50  # entry level only -- shared circulation serving every unit's own front door
    stair_width: float = 1.00
    stair_run: float = 2.80
    stair_gap: float = 0.20  # margin between a unit's own stair shaft and its slot's demising walls
    demising_wall_thickness: float = 0.20
    door_width: float = 1.00
    door_height: float = 2.10
    # If set, the entry level ALSO gets a front-wall -> core door of this
    # width (e.g. Madde 39(1)(b)'s >=1.50m bina giris kapisi) -- use this
    # for a pair whose entry_level IS the building's own street-level
    # entrance (e.g. a reverse-duplex pair anchored at zemin kat). Leave
    # None (default) for a pair whose entry_level is an upper floor with no
    # direct street door of its own (e.g. a roof-duplex pair anchored at
    # the top normal kat).
    street_entry_door_width: float | None = None
    # Set True for a roof-duplex-style pair, where the SECONDARY level's own
    # program is a "cati arasi piyesi" whose enclosed area must not exceed
    # the entry-level unit's own area (plan notes item 4.2.32: "hicbir
    # kosulda cati arasi piyesinin kapali alanlari, bagli bulundugu
    # bagimsiz bolumun alanini asamaz") -- checked per unit by
    # verify_duplex_area_caps() below. Leave False (default) for a
    # reverse-duplex-style pair (bodrum+zemin), where no equivalent
    # source-cited area cap was found -- see the per-project rationale.md
    # for the citation review.
    secondary_area_capped_by_entry: bool = False

    def __post_init__(self) -> None:
        if self.entry_level not in (self.lower_level, self.upper_level):
            raise ValueError("DuplexPairSpec.entry_level must equal lower_level or upper_level")
        if self.lower_level >= self.upper_level:
            raise ValueError("DuplexPairSpec.lower_level must be < upper_level")
        if not self.units:
            raise ValueError("DuplexPairSpec.units must contain at least one duplex unit")
        if self.units_zone_width <= 0:
            raise ValueError("DuplexPairSpec.units_zone_width must be > 0")

    @property
    def secondary_level(self) -> int:
        return self.upper_level if self.entry_level == self.lower_level else self.lower_level

    def stair_room_name(self, unit_index: int) -> str:
        return f"{self.units[unit_index].name_prefix} Ic Merdiveni"


def build_level_geometry_duplex_level(
    building: Building,
    footprint: list[Point2D],
    pair: DuplexPairSpec,
    *,
    level: int,
    is_entry: bool,
    core: CoreSpec,
    finished_floor_elevation: float,
    floor_to_floor_height: float,
    exterior_wall_thickness: float = 0.25,
    interior_wall_thickness: float = 0.10,
    window_width: float = 1.20,
    window_sill: float = 0.90,
    window_head: float = 2.10,
    id_prefix: str = "",
) -> None:
    """Lays out ONE level of a DuplexPairSpec. Called TWICE by
    `generate_multilevel_plan()` -- once per level of the pair -- with the
    SAME `pair` object and the SAME `core`, which is what makes the two
    calls' drawn geometry provably alignable: every x-position this
    function computes (the shared core itself, every DuplexZoneSpec
    boundary, the units zone's own bounds, each unit's own demising walls,
    each unit's own stair-shaft rect) is a pure function of `core` + `pair`
    + the shared exterior/interior_wall_thickness -- NEVER of `footprint`'s
    own width or depth. That is deliberate, and identical in spirit to why
    CoreSpec's own shaft comes out identical on every level of a
    `generate_multilevel_plan(core=...)` building (see CoreSpec's
    docstring): it is what makes a real, physical internal stair -- which
    must connect the two floors at the SAME (x, y) plan position -- provably
    correct by construction, checked by `verify_duplex_stair_alignment()`
    re-reading both levels' DXFs fresh from disk (same discipline as
    `verify_core_alignment()`).

    `footprint` still matters for TWO things only: (1) `building.footprints[level]`
    -- what the existing TAKS/KAKS/setback compliance checks read, entirely
    unchanged by this function; and (2) `interior_y1` (this level's own back
    wall) -- free to differ between the pair's two levels, which is the
    whole point of a duplex (a reverse-duplex's basement is typically much
    deeper than the ground floor above it).

    Genuine, stated simplification (same documentation style as the rest of
    this library): each unit's internal stair is drawn as a fixed
    `stair_width` x `stair_run` shaft immediately beside the shared core, at
    the SAME y-band on both levels (`[core_y0, core_y0+stair_run]`) -- a
    real, aligned stair position, not literally hand-placed inside the
    unit's own living space the way a human designer would refine it. This
    function's job is to prove the shaft's position is IDENTICAL across
    both floors it connects (a real structural requirement), not to
    hand-plan exactly where within the unit it should sit -- flagged
    plainly, not smoothed over, same as every other layout simplification
    already documented in this module.
    """
    if len(footprint) != 4:
        raise ValueError("build_level_geometry_duplex_level only supports a rectangular (4-point) footprint")
    (x0, y0), (x1, y0b), (x1b, y1), (x0b, y1b) = footprint
    if not (x0 == x0b and x1 == x1b and y0 == y0b and y1 == y1b and x1 > x0 and y1 > y0):
        raise ValueError(f"footprint must be an axis-aligned rectangle, got {footprint}")

    base_elev = finished_floor_elevation
    top_elev = finished_floor_elevation + floor_to_floor_height
    prefix = id_prefix or f"L{level}"
    building.footprints[level] = [(x0, y0), (x1, y0), (x1, y1), (x0, y1)]

    def mkwall(suffix: str, start: Point2D, end: Point2D, exterior: bool, *, thickness: float | None = None) -> Wall:
        return building.add_wall(
            Wall(
                id=f"{prefix}-WALL-{suffix}", start=start, end=end,
                thickness=thickness if thickness is not None else (exterior_wall_thickness if exterior else interior_wall_thickness),
                base_elevation=base_elev, top_elevation=top_elev, level=level, exterior=exterior,
                layer="A-WALL" if exterior else "A-WALL-INTR",
            )
        )

    wall_front = mkwall("FRONT", (x0, y0), (x1, y0), True)
    mkwall("RIGHT", (x1, y0), (x1, y1), True)
    wall_rear = mkwall("REAR", (x1, y1), (x0, y1), True)
    mkwall("LEFT", (x0, y1), (x0, y0), True)

    te2 = exterior_wall_thickness / 2.0
    ti2 = interior_wall_thickness / 2.0
    dw2 = pair.demising_wall_thickness / 2.0
    interior_x0, interior_x1 = x0 + te2, x1 - te2
    interior_y0, interior_y1 = y0 + te2, y1 - te2
    if interior_x1 <= interior_x0 or interior_y1 <= interior_y0:
        raise ValueError("exterior wall thickness leaves no interior space for this footprint")

    core_x0, core_y0, core_x1_raw, core_y1_raw = _core_rect(footprint, exterior_wall_thickness, core)
    if core_x1_raw > interior_x1 - 1e-9 or core_y1_raw > interior_y1 + 1e-9:
        raise ValueError(
            f"CoreSpec ({core.width}m x {core.depth}m) does not fit inside level {level}'s own "
            f"interior ({interior_x1 - interior_x0:.2f}m x {interior_y1 - interior_y0:.2f}m) -- a "
            f"genuine site/program conflict to surface, not silently resolved."
        )
    core_right_wall = mkwall("CORE-RIGHT", (core_x1_raw, interior_y0), (core_x1_raw, interior_y1), False)
    landing_depth = interior_y1 - core_y1_raw
    if landing_depth > 0.05:
        mkwall("CORE-REAR", (core_x0, core_y1_raw), (core_x1_raw, core_y1_raw), False)
        core_rear_edge = core_y1_raw - ti2
        landing_front_edge = core_y1_raw + ti2
        building.add_room(
            Room(
                id=f"{prefix}-CORE-LANDING", name=core.landing_name,
                boundary=[(core_x0, landing_front_edge), (core_x1_raw - ti2, landing_front_edge),
                          (core_x1_raw - ti2, interior_y1), (core_x0, interior_y1)],
                program_tag="circulation", level=level,
            )
        )
    else:
        core_rear_edge = interior_y1
    building.add_room(
        Room(
            id=f"{prefix}-CORE", name=core.name,
            boundary=[(core_x0, core_y0), (core_x1_raw - ti2, core_y0), (core_x1_raw - ti2, core_rear_edge), (core_x0, core_rear_edge)],
            program_tag="circulation-core", level=level,
        )
    )

    if is_entry and pair.street_entry_door_width is not None:
        d_width = max(0.7, min(pair.street_entry_door_width, core.width - 0.4))
        core_center_x = (core_x0 + core_x1_raw) / 2.0
        door_position = (core_center_x - d_width / 2.0) - wall_front.start[0]
        building.add_opening(
            Opening(
                id=f"{prefix}-DOOR-STREET", type=OpeningType.DOOR, host_wall_id=wall_front.id,
                position=door_position, width=d_width, sill_height=0.0, head_height=2.10, mark="D0",
            )
        )

    def _layout_flanking_zones(zones: list[DuplexZoneSpec], start_x: float, zone_kind: str) -> float:
        x = start_x
        for zi, zone in enumerate(zones):
            zx1 = x + zone.width
            mkwall(f"{zone_kind}-{zi}-RIGHT", (zx1, interior_y0), (zx1, interior_y1), False)
            program = zone.entry_program if is_entry else zone.secondary_program
            if program:
                _layout_bay_row(
                    building, mkwall, (x, interior_y0, zx1 - ti2, interior_y1), program,
                    level=level, interior_wall_thickness=interior_wall_thickness,
                    window_width=window_width, window_sill=window_sill, window_head=window_head,
                    rear_wall=wall_rear, id_prefix=f"{prefix}-{zone_kind}{zi}",
                )
            x = zx1 + ti2
        return x

    cursor_x = _layout_flanking_zones(pair.zones_before_units, core_x1_raw + ti2, "PRE")

    units_zone_x0 = cursor_x
    units_zone_x1 = units_zone_x0 + pair.units_zone_width
    if units_zone_x1 > interior_x1 + 1e-6:
        raise ValueError(
            f"Level {level}: DuplexPairSpec's units_zone_width ({pair.units_zone_width}m), placed "
            f"after {units_zone_x0 - (core_x1_raw + ti2):.2f}m of flanking zones, does not fit "
            f"inside this level's own interior width ({interior_x1 - interior_x0:.2f}m) -- a "
            f"genuine site/program conflict, not silently resolved."
        )

    n_units = len(pair.units)
    weights = [u.entry_area() + u.secondary_area() for u in pair.units]
    total_w = sum(weights)
    unit_edges = [units_zone_x0]
    acc = 0.0
    for w in weights[:-1]:
        acc += w
        unit_edges.append(units_zone_x0 + pair.units_zone_width * (acc / total_w))
    unit_edges.append(units_zone_x1)

    for i in range(1, n_units):
        xx = unit_edges[i]
        mkwall(f"UNIT-DEMISE-{i}", (xx, core_y0), (xx, interior_y1), False, thickness=pair.demising_wall_thickness)

    # -- per-unit internal stair shaft: SAME (x, y) box on both levels of
    # the pair, since it only depends on `core` + `pair` + unit_edges (all
    # level-independent) -- see docstring. -----------------------------
    stair_boxes: list[tuple[float, float, float, float]] = []
    for i in range(n_units):
        sx0 = unit_edges[i] + pair.stair_gap
        sx1 = sx0 + pair.stair_width
        if sx1 > unit_edges[i + 1] - pair.stair_gap:
            raise ValueError(
                f"Unit {i + 1} ({pair.units[i].name_prefix})'s own slot "
                f"({unit_edges[i + 1] - unit_edges[i]:.2f}m wide) is too narrow for a "
                f"{pair.stair_width}m-wide internal stair shaft with {pair.stair_gap}m margins on "
                f"each side -- a genuine site/program conflict, not silently resolved (widen "
                f"units_zone_width or reduce unit count)."
            )
        sy0, sy1 = core_y0, core_y0 + pair.stair_run
        if sy1 > interior_y1 - 1e-9:
            raise ValueError(
                f"Level {level}: stair_run ({pair.stair_run}m) does not fit inside this level's own "
                f"interior depth -- a genuine site/program conflict, not silently resolved."
            )
        stair_boxes.append((sx0, sy0, sx1, sy1))
        mkwall(f"STAIR-{i}-L", (sx0, sy0), (sx0, sy1), False)
        mkwall(f"STAIR-{i}-R", (sx1, sy0), (sx1, sy1), False)
        mkwall(f"STAIR-{i}-REAR", (sx0, sy1), (sx1, sy1), False)
        building.add_room(
            Room(
                id=f"{prefix}-U{i + 1}-STAIR", name=pair.stair_room_name(i),
                boundary=[(sx0, sy0), (sx1, sy0), (sx1, sy1), (sx0, sy1)],
                program_tag="stair-internal", level=level,
            )
        )

    # The internal stair shares the SAME y-band as the shared corridor
    # (both start at core_y0) rather than sitting in a separate band ahead
    # of it -- a real hallway with a stair opening inside it, not two
    # sequential bands eating depth twice. This is what makes a shallow
    # (TAKS-maximized) entry level's own room depth survive at all: a
    # stair_run-then-corridor_depth SEQUENTIAL layout was tried and found,
    # by actually running this generator, to starve room depth on a level
    # like 377/1's zemin kat down to ~2.6m -- an unbuildable band, not a
    # believable room -- exactly the kind of conflict this generator is
    # supposed to surface, not quietly build past. `stair_run` must not
    # exceed `corridor_depth` (checked below) for this sharing to be valid.
    if pair.stair_run > pair.corridor_depth + 1e-9:
        raise ValueError(
            f"DuplexPairSpec: stair_run ({pair.stair_run}m) must not exceed corridor_depth "
            f"({pair.corridor_depth}m) -- the internal stair shares the shared corridor's own "
            f"y-band by design (see build_level_geometry_duplex_level()'s docstring); increase "
            f"corridor_depth or reduce stair_run."
        )

    if is_entry:
        corridor_y0 = core_y0
        corridor_y1 = corridor_y0 + pair.corridor_depth
        if corridor_y1 > interior_y1 - 0.5:
            raise ValueError(
                f"Level {level}: corridor_depth ({pair.corridor_depth}m) leaves under 0.5m of unit "
                f"room depth on this level -- widen the footprint or shrink corridor_depth."
            )
        corridor_rear_wall = mkwall("CORRIDOR-REAR", (units_zone_x0, corridor_y1), (units_zone_x1, corridor_y1), False)
        building.add_room(
            Room(
                id=f"{prefix}-CORRIDOR", name="Ortak Kat Holu",
                boundary=[(units_zone_x0 + ti2, corridor_y0), (units_zone_x1 - ti2, corridor_y0),
                          (units_zone_x1 - ti2, corridor_y1 - ti2), (units_zone_x0 + ti2, corridor_y1 - ti2)],
                program_tag="circulation", level=level,
            )
        )
        rooms_y0 = corridor_y1 + ti2
        access_wall = corridor_rear_wall
    else:
        # No corridor room is drawn on the secondary level (access is via
        # each unit's own internal stair, not shared circulation), but the
        # SAME band depth (corridor_depth) is still reserved here so
        # rooms_y0 lines up with the entry level's own rooms_y0 -- a bonus
        # consistency, not a strict requirement, that falls out naturally
        # from reserving the identical band on both levels.
        rooms_y0 = core_y0 + pair.corridor_depth + ti2
        access_wall = None

    rooms_y1 = interior_y1
    if rooms_y1 <= rooms_y0 + 0.5:
        raise ValueError(
            f"Level {level}: not enough depth left for duplex unit rooms behind the "
            f"stair/corridor band ({rooms_y1 - rooms_y0:.2f}m) -- a genuine site/program conflict, "
            f"not silently resolved."
        )

    for i, unit in enumerate(pair.units):
        left = unit_edges[i] + (dw2 if i > 0 else 0.0)
        right = unit_edges[i + 1] - (dw2 if i < n_units - 1 else 0.0)
        unit_prefix = f"{prefix}-U{i + 1}"

        def unit_mkwall(suffix: str, start: Point2D, end: Point2D, exterior: bool, _up: str = unit_prefix) -> Wall:
            return building.add_wall(
                Wall(
                    id=f"{_up}-WALL-{suffix}", start=start, end=end, thickness=interior_wall_thickness,
                    base_elevation=base_elev, top_elevation=top_elev, level=level, exterior=False, layer="A-WALL-INTR",
                )
            )

        room_program = unit.entry_rooms if is_entry else unit.secondary_rooms
        bay_edges = _layout_bay_row(
            building, unit_mkwall, (left, rooms_y0, right, rooms_y1), room_program,
            level=level, interior_wall_thickness=interior_wall_thickness,
            window_width=window_width, window_sill=window_sill, window_head=window_head,
            rear_wall=wall_rear, id_prefix=unit_prefix,
        )
        first_bay_width = bay_edges[1] - bay_edges[0]
        d_width = max(0.7, min(pair.door_width, first_bay_width - 0.3))
        bay_center = (bay_edges[0] + bay_edges[1]) / 2.0

        if is_entry:
            door_position = bay_center - d_width / 2.0 - access_wall.start[0]
            wall_len = access_wall.length()
            door_position = max(0.05, min(door_position, wall_len - d_width - 0.05))
            building.add_opening(
                Opening(
                    id=f"{unit_prefix}-DOOR-1", type=OpeningType.DOOR, host_wall_id=access_wall.id,
                    position=door_position, width=d_width, sill_height=0.0, head_height=pair.door_height, mark=f"D{i + 1}",
                )
            )
        else:
            sx0, sy0, sx1, sy1 = stair_boxes[i]
            stair_rear_wall = building.get_wall(f"{prefix}-WALL-STAIR-{i}-REAR")
            d_width2 = max(0.7, min(pair.door_width, (sx1 - sx0) - 0.1))
            door_position = max(0.02, ((sx1 - sx0) - d_width2) / 2.0)
            building.add_opening(
                Opening(
                    id=f"{unit_prefix}-DOOR-STAIR", type=OpeningType.DOOR, host_wall_id=stair_rear_wall.id,
                    position=door_position, width=d_width2, sill_height=0.0, head_height=pair.door_height, mark=f"D{i + 1}S",
                )
            )

    if pair.zones_after_units:
        mkwall("UNITSZONE-RIGHT", (units_zone_x1, core_y0), (units_zone_x1, interior_y1), False)
        _layout_flanking_zones(pair.zones_after_units, units_zone_x1 + ti2, "POST")


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
# Multi-level generation
#
# Extends the single-level pipeline above (compute_footprint[_fitted]() +
# build_level_geometry(), both already level-agnostic) to populate every
# level of a model.Building in one pass, one level at a time, each level
# still fully traceable to its own room program and to the shared
# LotGeometry/ZoningConstraints intake. This does NOT attempt true
# multi-story structural realism (a real building keeps one consistent
# structural footprint stacked floor-to-floor); each level here is sized
# independently from its own program's net area, same design philosophy
# generate_plan() already uses for the single ground-floor case ("build
# what the program needs, never more than zoning allows, bank the rest as
# yard") -- just applied per level instead of assuming vertical footprint
# consistency. This is a genuine, documented simplification versus how a
# real RC-frame building would be engineered; see the per-project
# rationale.md for the explicit call-out.
# ---------------------------------------------------------------------------


@dataclass
class LevelSpec:
    """One level's generation inputs for `generate_multilevel_plan()`.
    `index` follows model.Wall's convention (0 = ground floor; negative =
    below grade, e.g. -1 = first basement; positive = above grade)."""

    index: int
    name: str  # e.g. "Zemin Kat", "1. Normal Kat"
    program: list[RoomSpec] = field(default_factory=list)
    floor_to_floor_height: float = 3.0
    footprint_style: str = "full_width"  # "full_width" (compute_footprint), "fitted" (compute_footprint_fitted), or "explicit_depth" (compute_footprint_explicit_depth, needs explicit_depth set)
    explicit_depth: float | None = None  # meters -- required when footprint_style == "explicit_depth"; see compute_footprint_explicit_depth()
    explicit_max_width: float | None = None  # meters -- optional, only used when footprint_style == "explicit_depth"; caps the footprint narrower than the full buildable-envelope width (compute_footprint_explicit_depth()'s own max_width). Added for the 377/1 roof-duplex pass: a DuplexPairSpec's two levels must share an identical interior_x1 (see build_level_geometry_duplex_level()'s docstring), which requires both levels' footprints to use the SAME max_width -- not just each level's own default full envelope width.
    door_width: float = 1.00
    door_height: float = 2.10
    exterior_wall_thickness: float = 0.25
    interior_wall_thickness: float = 0.10
    net_to_gross_efficiency: float = 0.85
    count_toward_taks: bool = False  # only the level(s) that set the site's ground coverage should be True
    count_toward_kaks: bool = True  # floor area counted toward KAKS/emsal (e.g. basement parking, roof piyes are typically excluded -- set False for those)
    # -- multi-unit levels (added for the 377/1 program pivot) --------------
    # When `units` is set (a list of independent apartment room programs),
    # `program` is ignored for LAYOUT purposes (must be left empty) and
    # build_level_geometry_multiunit() is used instead of
    # build_level_geometry() -- see that function's docstring. `program`
    # itself is still used, indirectly, for FOOTPRINT SIZING: the flattened
    # union of every unit's rooms is what compute_footprint[_fitted]() sizes
    # against (generate_multilevel_plan() builds that flattened list
    # automatically -- callers don't need to duplicate it into `program`).
    units: list[list[RoomSpec]] | None = None
    demising_wall_thickness: float = 0.20
    corridor_depth: float = 1.50
    # Requires `core` to be passed to generate_multilevel_plan(); see
    # build_level_geometry()'s entry_at_core_front docstring for what this
    # controls on a single-program (non-multiunit) level. Ignored (has no
    # effect) on a multiunit level, where every unit always gets its own
    # door off the shared corridor regardless of this flag.
    entry_at_core_front: bool = False
    # Set True when this level is one half of a DuplexPairSpec (see that
    # dataclass, added for the 377/1 reverse-duplex/roof-duplex pass --
    # "true duplex" support the pre-existing per-level-independent
    # LevelSpec/program/units model had no way to express: a single
    # bagimsiz bolum whose own room program spans TWO physically stacked
    # levels via an internal stair, not one level's own program). When
    # True: `program`/`units` must be left empty (the pair's own
    # DuplexUnitSpec.entry_rooms/secondary_rooms supply the program
    # instead, passed to generate_multilevel_plan(duplex_pairs=...)
    # separately -- LevelSpec still only carries this level's elevation/
    # height/wall-thickness/footprint-sizing inputs), and `footprint_style`
    # must be "explicit_depth" (a duplex pair's footprint is sized by the
    # building massing decision, same as every other explicit_depth level
    # in this project, not derived from a program list that doesn't live
    # on this LevelSpec at all).
    is_duplex_level: bool = False

    def __post_init__(self) -> None:
        if self.footprint_style not in ("full_width", "fitted", "explicit_depth"):
            raise ValueError(
                f"LevelSpec {self.name!r}: footprint_style must be 'full_width', 'fitted', or "
                f"'explicit_depth', got {self.footprint_style!r}"
            )
        if self.footprint_style == "explicit_depth" and (self.explicit_depth is None or self.explicit_depth <= 0):
            raise ValueError(f"LevelSpec {self.name!r}: explicit_depth must be > 0 when footprint_style is 'explicit_depth'")
        if self.is_duplex_level:
            if self.program or self.units is not None:
                raise ValueError(
                    f"LevelSpec {self.name!r}: program/units must be left empty when is_duplex_level=True -- "
                    "the program comes from the matching DuplexPairSpec's own DuplexUnitSpec list instead."
                )
            if self.footprint_style != "explicit_depth":
                raise ValueError(f"LevelSpec {self.name!r}: is_duplex_level=True requires footprint_style='explicit_depth'")
            return
        if self.units is not None:
            if len(self.units) == 0:
                raise ValueError(f"LevelSpec {self.name!r}: units, if given, must contain at least one unit")
            if self.program:
                raise ValueError(
                    f"LevelSpec {self.name!r}: program must be left empty when units is set -- footprint "
                    "sizing uses the flattened union of every unit's rooms automatically, program would "
                    "be ignored for layout and is confusing to also set."
                )
        elif not self.program:
            raise ValueError(f"LevelSpec {self.name!r}: either program or units must be given")


def generate_multilevel_plan(
    *,
    name: str,
    lot: LotGeometry,
    zoning: ZoningConstraints,
    level_specs: list[LevelSpec],
    red_grade_elevation: float,
    ground_floor_elevation: float,
    core: CoreSpec | None = None,
    duplex_pairs: list[DuplexPairSpec] | None = None,
) -> Building:
    """Populates every level in `level_specs` on one shared `Building`,
    stacking elevations sequentially from level 0 (anchored at
    `ground_floor_elevation`, validated against
    `zoning.min_ground_floor_offset` / `max_ground_floor_offset` exactly
    like `generate_plan()`) -- upward through increasing positive indices,
    downward through decreasing negative indices, each level's elevation
    derived from the previous level's elevation + that previous level's own
    `floor_to_floor_height`. Exactly one LevelSpec with index 0 is required.

    `core` (added this pass -- see CoreSpec's docstring): when given, the
    SAME CoreSpec is applied to every level in `level_specs`, guaranteeing
    the stair/elevator shaft lands at an identical absolute (x, y) footprint
    on every level -- the real structural requirement a shaft has to satisfy
    that the pre-existing per-level-independent generation had no mechanism
    for. This requires every LevelSpec to share the same
    `exterior_wall_thickness` (checked explicitly below and raised on
    mismatch) -- see CoreSpec's docstring for why that specific field is
    what makes the alignment guarantee hold. Levels whose LevelSpec sets
    `units` are laid out via `build_level_geometry_multiunit()`; every other
    level uses `build_level_geometry()`'s core path. `core=None` (default)
    reproduces the pre-fix behavior exactly (no core drawn at all) for
    backward compatibility with any single-level-program caller that
    doesn't need one.

    `duplex_pairs` (added for the 377/1 reverse-duplex/roof-duplex pass --
    see DuplexPairSpec's docstring): each pair's `lower_level`/`upper_level`
    must both exist in `level_specs` with `is_duplex_level=True` (empty
    program/units, `footprint_style="explicit_depth"` -- the pair's own
    DuplexUnitSpec list supplies the actual room program instead), and
    `core` is required (a duplex pair's internal stair alignment reuses the
    exact same core-anchored-footprint-corner guarantee CoreSpec already
    established). Every level flagged `is_duplex_level=True` MUST appear in
    exactly one DuplexPairSpec (checked below) -- there is no
    "is_duplex_level but not part of any pair" state, since a LevelSpec
    with no program/units of its own has nothing else to build from.
    """
    if duplex_pairs and core is None:
        raise ValueError("duplex_pairs requires core= to be given to generate_multilevel_plan() (the internal stair alignment reuses the shared core's own anchor point)")
    duplex_level_role: dict[int, tuple[DuplexPairSpec, bool]] = {}
    for pair in duplex_pairs or []:
        for lvl, is_entry in ((pair.lower_level, pair.entry_level == pair.lower_level), (pair.upper_level, pair.entry_level == pair.upper_level)):
            if lvl in duplex_level_role:
                raise ValueError(f"Level {lvl} appears in more than one DuplexPairSpec -- a level can only be one half of one duplex pair")
            duplex_level_role[lvl] = (pair, is_entry)
    duplex_flagged = {spec.index for spec in level_specs if spec.is_duplex_level}
    if duplex_flagged != set(duplex_level_role):
        raise ValueError(
            f"LevelSpec.is_duplex_level=True levels {sorted(duplex_flagged)} must exactly match the "
            f"levels referenced by duplex_pairs {sorted(duplex_level_role)} -- every is_duplex_level "
            f"LevelSpec needs a DuplexPairSpec to supply its program, and every DuplexPairSpec level "
            f"needs its LevelSpec flagged is_duplex_level=True."
        )
    if core is not None:
        thicknesses = {spec.exterior_wall_thickness for spec in level_specs}
        if len(thicknesses) > 1:
            raise ValueError(
                f"A shared core requires every LevelSpec to use the same exterior_wall_thickness "
                f"(this is what keeps the core's interior anchor point identical level to level) -- "
                f"got {sorted(thicknesses)}. Either use one exterior_wall_thickness for every level, "
                f"or don't pass core= and accept the levels are architecturally independent."
            )
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

    by_index = {spec.index: spec for spec in level_specs}
    if len(by_index) != len(level_specs):
        raise ValueError("level_specs contains duplicate level indices")
    if 0 not in by_index:
        raise ValueError("level_specs must include exactly one LevelSpec with index 0 (ground floor)")

    elevations: dict[int, float] = {0: ground_floor_elevation}
    prev = 0
    for idx in sorted(i for i in by_index if i > 0):
        elevations[idx] = elevations[prev] + by_index[prev].floor_to_floor_height
        prev = idx
    prev = 0
    for idx in sorted((i for i in by_index if i < 0), reverse=True):
        elevations[idx] = elevations[prev] - by_index[idx].floor_to_floor_height
        prev = idx

    building = Building(name=name, red_grade_elevation=red_grade_elevation)
    for idx in sorted(by_index):
        spec = by_index[idx]
        building.levels.append(
            Level(
                index=idx,
                name=spec.name,
                finished_floor_elevation=elevations[idx],
                floor_to_floor_height=spec.floor_to_floor_height,
            )
        )
        if spec.is_duplex_level:
            # Footprint sizing only (explicit_depth, enforced by LevelSpec's
            # own validation) -- the actual geometry (walls/rooms/openings)
            # for this level is built AFTER this loop, once per
            # DuplexPairSpec, by build_level_geometry_duplex_level(). This
            # keeps footprint recording (what TAKS/KAKS/setback compliance
            # reads) on the exact same code path every other level uses.
            footprint = compute_footprint_explicit_depth(lot, zoning, spec.explicit_depth, max_width=spec.explicit_max_width)
            building.footprints[idx] = footprint
            continue

        sizing_program = spec.program if spec.units is None else [r for unit in spec.units for r in unit]
        if spec.footprint_style == "explicit_depth":
            footprint = compute_footprint_explicit_depth(lot, zoning, spec.explicit_depth, max_width=spec.explicit_max_width)
        else:
            footprint_fn = compute_footprint if spec.footprint_style == "full_width" else compute_footprint_fitted
            footprint = footprint_fn(lot, zoning, sizing_program, net_to_gross_efficiency=spec.net_to_gross_efficiency)

        if spec.units is not None:
            if core is None:
                raise ValueError(f"LevelSpec {spec.name!r} sets units, which requires core= to be given to generate_multilevel_plan()")
            build_level_geometry_multiunit(
                building,
                footprint,
                spec.units,
                core=core,
                level=idx,
                finished_floor_elevation=elevations[idx],
                floor_to_floor_height=spec.floor_to_floor_height,
                exterior_wall_thickness=spec.exterior_wall_thickness,
                interior_wall_thickness=spec.interior_wall_thickness,
                demising_wall_thickness=spec.demising_wall_thickness,
                corridor_depth=spec.corridor_depth,
                door_width=spec.door_width,
                door_height=spec.door_height,
                id_prefix=f"L{idx}",
            )
        else:
            build_level_geometry(
                building,
                footprint,
                spec.program,
                level=idx,
                finished_floor_elevation=elevations[idx],
                floor_to_floor_height=spec.floor_to_floor_height,
                exterior_wall_thickness=spec.exterior_wall_thickness,
                interior_wall_thickness=spec.interior_wall_thickness,
                door_width=spec.door_width,
                door_height=spec.door_height,
                id_prefix=f"L{idx}",
                core=core,
                entry_at_core_front=spec.entry_at_core_front,
            )

    for pair in duplex_pairs or []:
        for idx in (pair.lower_level, pair.upper_level):
            spec = by_index[idx]
            build_level_geometry_duplex_level(
                building,
                building.footprints[idx],
                pair,
                level=idx,
                is_entry=(idx == pair.entry_level),
                core=core,
                finished_floor_elevation=elevations[idx],
                floor_to_floor_height=spec.floor_to_floor_height,
                exterior_wall_thickness=spec.exterior_wall_thickness,
                interior_wall_thickness=spec.interior_wall_thickness,
                id_prefix=f"L{idx}",
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
        # top of this level's own slab/wall-head, i.e. finished_floor_elevation
        # + floor_to_floor_height -- needed (alongside finished_floor_elevation
        # above) so a multi-sheet compliance pass (verify_compliance_multilevel())
        # can re-derive eave height and roof-ridge-above-top-slab checks per
        # level without needing Z data that a plan-view DXF otherwise can't carry.
        f"top_elevation_L{level}": lvl.finished_floor_elevation + lvl.floor_to_floor_height,
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
        f"This level ({lvl.name}): FFE {'+' if lvl.finished_floor_elevation >= 0 else ''}{lvl.finished_floor_elevation:.2f} m, "
        f"top {'+' if (lvl.finished_floor_elevation + lvl.floor_to_floor_height) >= 0 else ''}"
        f"{lvl.finished_floor_elevation + lvl.floor_to_floor_height:.2f} m above red grade",
        f"Overall building height above red grade, ALL levels through roof piyes if any: {building.max_height():.2f} m "
        f"-- NOT directly comparable to a gabari/eave limit on its own (a roof piyes is typically governed by a "
        f"separate ridge-above-top-slab allowance, not the eave gabari) -- see the compliance report for the "
        f"applicable per-check comparison, not this raw figure.",
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
    lvl_top = lvl.finished_floor_elevation + lvl.floor_to_floor_height
    info_lines = [
        f"Lot: {lot.width:.2f} m x {lot.depth:.2f} m ({lot.area():.1f} m2) -- {lot.source_note}",
        f"This level's footprint: {footprint_area:.1f} m2 (informational -- TAKS/KAKS applicability of this "
        f"specific level is a project-level design decision, see rationale.md; TAKS limit is {zoning.taks:.2f}) -- {zoning.source_note}",
        f"Red grade datum: {building.red_grade_elevation:.2f} m | This level ({lvl.name}): FFE "
        f"{'+' if lvl.finished_floor_elevation >= 0 else ''}{lvl.finished_floor_elevation:.2f} m, top "
        f"{'+' if lvl_top >= 0 else ''}{lvl_top:.2f} m above red grade -- see the compliance report for the "
        f"applicable eave/ridge height check, not a raw comparison against zoning.max_height on this sheet.",
    ]
    assert_no_stamp_language("\n".join(info_lines))
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


# ---------------------------------------------------------------------------
# Multi-level compliance verification -- extends verify_compliance() above to
# a whole multi-sheet set (one DXF per level, from generate_multilevel_plan())
# ---------------------------------------------------------------------------


def verify_compliance_multilevel(
    dxf_paths: dict[int, str | Path],
    lot: LotGeometry,
    zoning: ZoningConstraints,
    *,
    taks_level: int,
    kaks_levels: list[int],
    eave_levels: list[int],
    roof_level: int | None = None,
    top_structural_level: int | None = None,
    ground_floor_level: int = 0,
    tolerance: float = 1e-6,
) -> ComplianceReport:
    """Re-derives lot coverage, floor area, height, every setback (per
    level), and ground-floor level from a *freshly re-read* set of generated
    DXF files -- one per level, as produced by rendering each level of a
    `generate_multilevel_plan()` Building with `render_dxf()` -- and checks
    each explicitly against the constraint list from intake, exactly like
    `verify_compliance()` does for the single-level case, generalized across
    every level actually delivered:

    - TAKS (lot coverage): checked against `taks_level`'s own drawn
      footprint (the level whose footprint defines ground coverage -- in
      Turkish zoning practice this is normally the ground floor; a basement
      dedicated to parking/service is excluded per plan-notes item 4.2.1,
      which is exactly why callers exclude it via `taks_level`, not by this
      function guessing).
    - KAKS / emsal (floor area ratio): sum of the drawn footprint areas of
      every level in `kaks_levels` (callers exclude levels not counted
      toward floor area, e.g. a basement built as parking/service, or a
      roof piyes that state item 4.2.32/Madde 40(7) already exempts from
      the Kat Adedi count -- see the per-project rationale.md for exactly
      which levels are excluded and why, since this is a genuine judgment
      call this function does not make on its own).
    - Height / gabari (eave-level): max of the `top_elevation_L{i}` XDATA
      value across every level in `eave_levels` -- deliberately NOT
      including a roof piyes level, which is governed by a separate
      ridge-above-top-slab rule instead (see roof_level/top_structural_level
      below), matching how Turkish gabari rules exclude an attic piyes.
    - Roof ridge vs top-slab allowance (optional, only run when
      `roof_level`, `top_structural_level`, and
      `zoning.roof_ridge_max_above_top_slab` are all provided): the roof
      level's own `top_elevation_L{roof_level}` vs
      (`top_structural_level`'s `top_elevation` + the allowance).
    - Every setback (front/rear/side), for EVERY level in `dxf_paths` (not
      just one) -- since each level here is independently footprint-sized
      (see generate_multilevel_plan()'s module note on this), a setback
      violation on any one level is a real, reportable conflict, not
      redundant with checking just one level.
    - Ground floor level vs the kirmizi kot datum, at `ground_floor_level`.
    - [bonus] Drawn lot boundary matches intake lot geometry, for EVERY
      level's own re-read DXF (dimension-fidelity check, repeated per sheet
      since each sheet independently draws the property line).

    Every one of the above is derived from files re-read fresh from disk,
    not from any in-memory Building -- same rationale as `verify_compliance()`:
    a bug in the writing step itself must be caught too, not just a bug in
    the layout math.
    """
    if taks_level not in dxf_paths:
        raise ValueError(f"taks_level {taks_level} is not in dxf_paths")
    if ground_floor_level not in dxf_paths:
        raise ValueError(f"ground_floor_level {ground_floor_level} is not in dxf_paths")
    for lvl in kaks_levels:
        if lvl not in dxf_paths:
            raise ValueError(f"kaks_levels entry {lvl} is not in dxf_paths")
    for lvl in eave_levels:
        if lvl not in dxf_paths:
            raise ValueError(f"eave_levels entry {lvl} is not in dxf_paths")

    def polys_on_layer(msp, layer: str) -> list[list[Point2D]]:
        result = []
        for e in msp:
            if e.dxftype() == "LWPOLYLINE" and e.dxf.layer == layer:
                result.append([(float(x), float(y)) for x, y in e.get_points("xy")])
        return result

    checks: list[ComplianceCheck] = []
    lot_area = lot.area()
    footprint_area_by_level: dict[int, float] = {}
    project_data_by_level: dict[int, dict[str, float]] = {}

    for level, path in sorted(dxf_paths.items()):
        doc = ezdxf.readfile(str(path))
        msp = doc.modelspace()
        project_data_by_level[level] = _read_project_data(msp)

        # [bonus] drawn lot boundary matches intake lot geometry, this sheet
        prop_polys = polys_on_layer(msp, LAYERS["property"])
        if not prop_polys:
            raise ValueError(f"Level {level}: no property-line polyline found on layer {LAYERS['property']!r}")
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
                name=f"[bonus] L{level}: drawn lot boundary matches intake lot geometry",
                actual=drawn_lot_area, limit=lot.area(), requirement="==", passed=lot_ok,
                detail=f"drawn {drawn_width:.3f}m x {drawn_depth:.3f}m vs intake {lot.width:.3f}m x {lot.depth:.3f}m ({lot.source_note})",
            )
        )

        footprint_polys = polys_on_layer(msp, LAYERS["footprint"])
        if not footprint_polys:
            raise ValueError(f"Level {level}: no footprint polyline found on layer {LAYERS['footprint']!r}")
        footprint_area = polygon_area(footprint_polys[0])
        footprint_area_by_level[level] = footprint_area

        fx0, fy0, fx1, fy1 = bounding_box(footprint_polys[0])
        front_actual = fy0 - lot_y0
        rear_actual = lot_y1 - fy1
        left_actual = fx0 - lot_x0
        right_actual = lot_x1 - fx1
        for setback_name, actual, required in [
            (f"L{level}: Front setback", front_actual, zoning.setbacks.front),
            (f"L{level}: Rear setback", rear_actual, zoning.setbacks.rear),
            (f"L{level}: Side setback (left)", left_actual, zoning.setbacks.side_left),
            (f"L{level}: Side setback (right)", right_actual, zoning.setbacks.side_right),
        ]:
            checks.append(
                ComplianceCheck(
                    name=setback_name, actual=actual, limit=required, requirement=">=",
                    passed=actual >= required - tolerance,
                    detail=f"({zoning.source_note})",
                )
            )

    # TAKS -- lot coverage, at the designated ground-coverage level only
    taks_footprint_area = footprint_area_by_level[taks_level]
    taks_used = taks_footprint_area / lot_area
    checks.append(
        ComplianceCheck(
            name=f"TAKS (lot coverage, L{taks_level})", actual=taks_used, limit=zoning.taks, requirement="<=",
            passed=taks_used <= zoning.taks + tolerance,
            detail=f"footprint {taks_footprint_area:.2f} m2 / lot {lot_area:.2f} m2 ({zoning.source_note})",
        )
    )

    # KAKS / emsal -- floor area ratio, summed across the counted levels
    kaks_total_area = sum(footprint_area_by_level[lvl] for lvl in kaks_levels)
    kaks_used = kaks_total_area / lot_area
    checks.append(
        ComplianceCheck(
            name=f"KAKS / Emsal (floor area ratio, levels {sorted(kaks_levels)})",
            actual=kaks_used, limit=zoning.kaks, requirement="<=",
            passed=kaks_used <= zoning.kaks + tolerance,
            detail=(
                f"construction area {kaks_total_area:.2f} m2 "
                f"({', '.join(f'L{lvl}={footprint_area_by_level[lvl]:.2f}m2' for lvl in sorted(kaks_levels))}) "
                f"/ lot {lot_area:.2f} m2 ({zoning.source_note})"
            ),
        )
    )

    # Height / gabari -- eave level, max top_elevation across the counted
    # above-grade structural levels (deliberately excludes any roof-piyes
    # level, which the roof-ridge check below governs instead)
    eave_height = max(project_data_by_level[lvl][f"top_elevation_L{lvl}"] for lvl in eave_levels)
    checks.append(
        ComplianceCheck(
            name=f"Height / gabari (eave, levels {sorted(eave_levels)})",
            actual=eave_height, limit=zoning.max_height, requirement="<=",
            passed=eave_height <= zoning.max_height + tolerance,
            detail=f"from project-data XDATA, top_elevation_L{{level}} ({zoning.source_note})",
        )
    )

    # Roof ridge vs top-slab allowance (optional)
    if roof_level is not None and top_structural_level is not None and zoning.roof_ridge_max_above_top_slab is not None:
        if roof_level not in dxf_paths or top_structural_level not in dxf_paths:
            raise ValueError("roof_level and top_structural_level must both be in dxf_paths")
        roof_top = project_data_by_level[roof_level][f"top_elevation_L{roof_level}"]
        top_slab = project_data_by_level[top_structural_level][f"top_elevation_L{top_structural_level}"]
        allowance = zoning.roof_ridge_max_above_top_slab
        ridge_actual = roof_top - top_slab
        checks.append(
            ComplianceCheck(
                name=f"Roof ridge vs top-slab allowance (L{roof_level} above L{top_structural_level})",
                actual=ridge_actual, limit=allowance, requirement="<=",
                passed=ridge_actual <= allowance + tolerance,
                detail=(
                    f"L{roof_level} top {roof_top:.3f}m - L{top_structural_level} top slab "
                    f"{top_slab:.3f}m = {ridge_actual:.3f}m vs allowance {allowance:.2f}m "
                    f"({zoning.source_note})"
                ),
            )
        )

    # Ground floor level vs red grade (kirmizi kot) datum
    gf_data = project_data_by_level[ground_floor_level]
    red_grade = gf_data.get("red_grade_elevation")
    ffe = gf_data.get(f"finished_floor_elevation_L{ground_floor_level}")
    if red_grade is None or ffe is None:
        raise ValueError(
            f"red_grade_elevation / finished_floor_elevation_L{ground_floor_level} missing from project-data XDATA"
        )
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
            name=f"Ground floor (L{ground_floor_level}) level vs red grade (kirmizi kot) datum",
            actual=ffe, limit=min_off, requirement=requirement, passed=gf_ok,
            detail=f"red grade datum {red_grade:.2f} m absolute; finished floor at datum {'+' if ffe >= 0 else ''}{ffe:.3f} m ({zoning.source_note})",
        )
    )

    return ComplianceReport(checks=checks)


# ---------------------------------------------------------------------------
# Core (stair/elevator shaft) alignment verification -- re-derives the
# drawn core room's plan position from a freshly re-read set of DXF files,
# one per level, and checks it's identical everywhere. This is the specific
# check the founder's brief asked for ("the core must stack identically") --
# see CoreSpec's docstring for the bug this closes.
# ---------------------------------------------------------------------------


@dataclass
class CoreAlignmentReport:
    checks: list[ComplianceCheck] = field(default_factory=list)

    @property
    def all_passed(self) -> bool:
        return all(c.passed for c in self.checks)

    def summary(self) -> str:
        lines = []
        for c in self.checks:
            status = "PASS" if c.passed else "FAIL"
            lines.append(f"[{status}] {c.name}: {c.detail}")
        return "\n".join(lines)


def verify_core_alignment(
    dxf_paths: dict[int, str | Path],
    core: CoreSpec,
    *,
    tolerance: float = 1e-6,
) -> CoreAlignmentReport:
    """Re-reads every level's generated DXF fresh from disk (not the
    in-memory Building) and re-derives the drawn core-shaft room's plan
    bounding box (matched by its name, `core.name`, on the A-AREA-IDEN
    layer -- the same layer/matching convention render_dxf() already uses
    for every room), then checks that this bounding box is IDENTICAL
    (within `tolerance`) on every level that has one. A level with no core
    room at all (e.g. a LevelSpec generated without `core=`) is reported as
    its own explicit failure, not silently skipped -- a level with no shaft
    drawn at all is exactly the pre-fix bug this check exists to catch.
    """
    checks: list[ComplianceCheck] = []
    boxes: dict[int, tuple[float, float, float, float]] = {}

    for level, path in sorted(dxf_paths.items()):
        doc = ezdxf.readfile(str(path))
        msp = doc.modelspace()
        core_polys: list[list[Point2D]] = []
        for e in msp:
            if e.dxftype() != "LWPOLYLINE" or e.dxf.layer != LAYERS["room_boundary"]:
                continue
            pts = [(float(x), float(y)) for x, y in e.get_points("xy")]
            core_polys.append(pts)
        # Match by the paired MTEXT label (room name is the first line,
        # "\P<area> m2" follows) rather than trusting polygon shape alone --
        # matches how a human would identify the core room on the sheet.
        core_mtext_ids = set()
        for e in msp:
            if e.dxftype() == "MTEXT" and e.dxf.layer == LAYERS["room_boundary"] and e.text.split("\\P")[0] == core.name:
                core_mtext_ids.add((round(e.dxf.insert.x, 3), round(e.dxf.insert.y, 3)))
        if not core_mtext_ids:
            checks.append(
                ComplianceCheck(
                    name=f"L{level}: core room {core.name!r} is present on the drawn sheet",
                    actual=0.0, limit=1.0, requirement="==", passed=False,
                    detail=f"no room named {core.name!r} found on layer {LAYERS['room_boundary']!r} -- no shaft drawn on this level",
                )
            )
            continue
        # The core polygon's centroid sits inside its own bbox, close to the
        # matched MTEXT insertion point (render_dxf() places the label at
        # the room's own centroid) -- pick the polygon whose bbox contains
        # the closest matched label point.
        best = None
        best_dist = None
        for poly in core_polys:
            x0, y0, x1, y1 = bounding_box(poly)
            cx, cy = (x0 + x1) / 2.0, (y0 + y1) / 2.0
            for mx, my in core_mtext_ids:
                d = (cx - mx) ** 2 + (cy - my) ** 2
                if best_dist is None or d < best_dist:
                    best_dist, best = d, (x0, y0, x1, y1)
        boxes[level] = best
        checks.append(
            ComplianceCheck(
                name=f"L{level}: core room {core.name!r} is present on the drawn sheet",
                actual=1.0, limit=1.0, requirement="==", passed=True,
                detail=f"bbox={tuple(round(v, 3) for v in best)}",
            )
        )

    if boxes:
        reference_level = min(boxes)
        reference_box = boxes[reference_level]
        for level, box in sorted(boxes.items()):
            matches = all(abs(a - b) <= tolerance for a, b in zip(box, reference_box))
            checks.append(
                ComplianceCheck(
                    name=f"L{level}: core shaft position matches L{reference_level} (identical x/y footprint, every level)",
                    actual=box[0], limit=reference_box[0], requirement="==", passed=matches,
                    detail=f"L{level} bbox={tuple(round(v, 3) for v in box)} vs L{reference_level} bbox={tuple(round(v, 3) for v in reference_box)}",
                )
            )

    return CoreAlignmentReport(checks=checks)


# ---------------------------------------------------------------------------
# Duplex verification -- re-derives the drawn geometry of every DuplexPairSpec
# from a freshly re-read set of DXF files (never the in-memory Building) and
# checks (1) each unit's own internal stair shaft is drawn identically on
# both levels of its pair (the real structural requirement a stair has to
# satisfy -- same discipline as verify_core_alignment() for the shared
# building core), and (2) for roof-duplex-style pairs, that the secondary
# level's own drawn area per unit does not exceed that unit's entry-level
# area (plan notes item 4.2.32).
# ---------------------------------------------------------------------------


@dataclass
class DuplexAlignmentReport:
    checks: list[ComplianceCheck] = field(default_factory=list)

    @property
    def all_passed(self) -> bool:
        return all(c.passed for c in self.checks)

    def summary(self) -> str:
        lines = []
        for c in self.checks:
            status = "PASS" if c.passed else "FAIL"
            lines.append(f"[{status}] {c.name}: {c.detail}")
        return "\n".join(lines)


def _room_boxes_by_name(msp) -> dict[str, list[tuple[float, float, float, float]]]:
    """Re-derives every room's own drawn bounding box from a freshly
    re-read DXF modelspace, keyed by its drawn NAME (the first line of its
    paired MTEXT label -- same room/MTEXT matching convention
    verify_core_alignment() already uses). A name may map to more than one
    box (e.g. two identical units on one level both have a "Salon") --
    callers needing per-unit disambiguation (verify_duplex_area_caps())
    resolve that by x-position instead of name.
    """
    polys = [
        [(float(x), float(y)) for x, y in e.get_points("xy")]
        for e in msp if e.dxftype() == "LWPOLYLINE" and e.dxf.layer == LAYERS["room_boundary"]
    ]
    labels: dict[tuple[float, float], str] = {}
    for e in msp:
        if e.dxftype() == "MTEXT" and e.dxf.layer == LAYERS["room_boundary"]:
            labels[(round(e.dxf.insert.x, 3), round(e.dxf.insert.y, 3))] = e.text.split("\\P")[0]
    result: dict[str, list[tuple[float, float, float, float]]] = {}
    for poly in polys:
        x0, y0, x1, y1 = bounding_box(poly)
        cx, cy = (x0 + x1) / 2.0, (y0 + y1) / 2.0
        best_name, best_dist = None, None
        for (mx, my), name in labels.items():
            d = (cx - mx) ** 2 + (cy - my) ** 2
            if best_dist is None or d < best_dist:
                best_dist, best_name = d, name
        result.setdefault(best_name or "?", []).append((x0, y0, x1, y1))
    return result


def verify_duplex_stair_alignment(
    dxf_paths: dict[int, str | Path],
    duplex_pairs: list[DuplexPairSpec],
    *,
    tolerance: float = 1e-6,
) -> DuplexAlignmentReport:
    """Re-reads both levels of every DuplexPairSpec fresh from disk (not
    the in-memory Building) and checks that each unit's own internal-stair
    shaft room (matched by its unique drawn name,
    `pair.stair_room_name(i)`) has an IDENTICAL bounding box on both levels
    -- the real structural requirement a physical stair has to satisfy
    (same discipline as verify_core_alignment() for the shared building
    core). A level missing the room entirely is reported as its own
    explicit failure, not silently skipped."""
    checks: list[ComplianceCheck] = []
    for pair in duplex_pairs:
        boxes_by_level: dict[int, dict[str, list[tuple[float, float, float, float]]]] = {}
        for lvl in (pair.lower_level, pair.upper_level):
            if lvl not in dxf_paths:
                raise ValueError(f"Level {lvl} (part of a DuplexPairSpec) is not in dxf_paths")
            doc = ezdxf.readfile(str(dxf_paths[lvl]))
            boxes_by_level[lvl] = _room_boxes_by_name(doc.modelspace())
        for i, unit in enumerate(pair.units):
            name = pair.stair_room_name(i)
            lower_boxes = boxes_by_level[pair.lower_level].get(name)
            upper_boxes = boxes_by_level[pair.upper_level].get(name)
            if not lower_boxes or not upper_boxes:
                checks.append(
                    ComplianceCheck(
                        name=f"Duplex L{pair.lower_level}/L{pair.upper_level} unit {i + 1} ({unit.name_prefix}): stair shaft present on both levels",
                        actual=float(bool(lower_boxes)) + float(bool(upper_boxes)), limit=2.0, requirement="==", passed=False,
                        detail=f"L{pair.lower_level} found={bool(lower_boxes)}, L{pair.upper_level} found={bool(upper_boxes)}",
                    )
                )
                continue
            lo, up = lower_boxes[0], upper_boxes[0]
            matches = all(abs(a - b) <= tolerance for a, b in zip(lo, up))
            checks.append(
                ComplianceCheck(
                    name=f"Duplex L{pair.lower_level}/L{pair.upper_level} unit {i + 1} ({unit.name_prefix}): internal stair shaft identical x/y on both levels",
                    actual=lo[0], limit=up[0], requirement="==", passed=matches,
                    detail=f"L{pair.lower_level} bbox={tuple(round(v, 3) for v in lo)} vs L{pair.upper_level} bbox={tuple(round(v, 3) for v in up)}",
                )
            )
    return DuplexAlignmentReport(checks=checks)


def verify_duplex_area_caps(
    dxf_paths: dict[int, str | Path],
    duplex_pairs: list[DuplexPairSpec],
    core: CoreSpec,
    *,
    footprint_x0: float,
    exterior_wall_thickness: float = 0.25,
    interior_wall_thickness: float = 0.10,
) -> DuplexAlignmentReport:
    """For every DuplexPairSpec with `secondary_area_capped_by_entry=True`
    (plan notes item 4.2.32: a cati arasi piyesi's own enclosed area may
    never exceed the bagimsiz bolum it's attached to), re-reads both
    levels' DXFs fresh from disk, sums each unit's own drawn room area on
    each level -- matched by X-POSITION within that unit's own slot (the
    same level-independent `unit_edges` every duplex unit's rooms are
    already guaranteed to sit inside by construction, re-derived here from
    `core`/`pair`/wall thicknesses exactly as
    `build_level_geometry_duplex_level()` computed them at generation time
    -- NOT by room name, since two units on one level legitimately share
    room names, e.g. two identical "Salon"s), excluding the shared
    core/landing/corridor/stair rooms, and checks secondary <= entry per
    unit. `footprint_x0` is the footprint's own front-left corner x
    (== `zoning.setbacks.side_left` for every level this library anchors
    footprints at -- passed explicitly rather than re-derived, same
    convention `verify_core_alignment()` uses for `core`)."""
    checks: list[ComplianceCheck] = []
    te2 = exterior_wall_thickness / 2.0
    ti2 = interior_wall_thickness / 2.0

    def _rooms_in_range(dxf_path: str | Path, x0: float, x1: float, excluded_names: set[str]) -> float:
        doc = ezdxf.readfile(str(dxf_path))
        msp = doc.modelspace()
        boxes_by_name = _room_boxes_by_name(msp)
        polys = [
            [(float(px), float(py)) for px, py in e.get_points("xy")]
            for e in msp if e.dxftype() == "LWPOLYLINE" and e.dxf.layer == LAYERS["room_boundary"]
        ]
        total = 0.0
        for name, boxes in boxes_by_name.items():
            if name in excluded_names:
                continue
            for bx0, by0, bx1, by1 in boxes:
                cx = (bx0 + bx1) / 2.0
                if x0 - 1e-6 <= cx <= x1 + 1e-6:
                    total += (bx1 - bx0) * (by1 - by0)
        return total

    for pair in duplex_pairs:
        if not pair.secondary_area_capped_by_entry:
            continue
        core_x0 = footprint_x0 + te2
        core_x1_raw = core_x0 + core.width
        cursor_x = core_x1_raw + ti2
        for zone in pair.zones_before_units:
            cursor_x = cursor_x + zone.width + ti2
        units_zone_x0 = cursor_x
        units_zone_x1 = units_zone_x0 + pair.units_zone_width
        weights = [u.entry_area() + u.secondary_area() for u in pair.units]
        total_w = sum(weights)
        edges = [units_zone_x0]
        acc = 0.0
        for w in weights[:-1]:
            acc += w
            edges.append(units_zone_x0 + pair.units_zone_width * (acc / total_w))
        edges.append(units_zone_x1)

        excluded = {"Ortak Kat Holu", core.name, core.landing_name}
        excluded |= {pair.stair_room_name(j) for j in range(len(pair.units))}

        for i, unit in enumerate(pair.units):
            entry_area = _rooms_in_range(dxf_paths[pair.entry_level], edges[i], edges[i + 1], excluded)
            secondary_area = _rooms_in_range(dxf_paths[pair.secondary_level], edges[i], edges[i + 1], excluded)
            passed = secondary_area <= entry_area + 1e-6
            checks.append(
                ComplianceCheck(
                    name=f"Duplex L{pair.lower_level}/L{pair.upper_level} unit {i + 1} ({unit.name_prefix}): secondary-level drawn area <= entry-level drawn area (plan notes 4.2.32)",
                    actual=secondary_area, limit=entry_area, requirement="<=", passed=passed,
                    detail=f"secondary (L{pair.secondary_level}) {secondary_area:.2f} m2 vs entry (L{pair.entry_level}) {entry_area:.2f} m2",
                )
            )
    return DuplexAlignmentReport(checks=checks)
