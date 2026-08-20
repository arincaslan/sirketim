"""
departments/architecture/lib/cadgen/model.py

Core data model for the cadgen library. This is the single source of truth
every generator reads from and writes to — plan.py today, and
schedule.py / elevation.py / section.py / finishes.py / furnishing.py in
later, not-yet-built passes. Getting this shape right matters more than any
individual generator, because everything downstream depends on it.

Units and conventions
----------------------
- All lengths, coordinates and areas are in **meters** / square meters.
- Plan coordinates are ``(x, y)`` tuples in a local project system: ``+x`` is
  to the right, ``+y`` runs from the front lot line toward the rear (see
  ``plan.LotGeometry`` for how the lot itself is placed in this system).
- Elevations (``base_elevation`` / ``top_elevation`` / ``finished_floor_elevation``)
  are meters **relative to the project's kirmizi kot (red grade line) datum**,
  i.e. ``Building.red_grade_elevation`` is the absolute site value that
  corresponds to 0.0 in every other elevation field in this model. This
  mirrors the department's mandatory intake rule (see
  departments/architecture/CLAUDE.md, "Site intake") that ground-floor level
  and height must be measured from the red grade datum, not an assumed grade.
"""

from __future__ import annotations

import math
from dataclasses import dataclass, field
from enum import Enum

Point2D = tuple[float, float]


class OpeningType(str, Enum):
    DOOR = "door"
    WINDOW = "window"


def polygon_area(points: list[Point2D]) -> float:
    """Shoelace formula. Accepts an open ring (first point not repeated at
    the end) or a closed one (repeated last==first) — both give the same
    result. Returns an unsigned (absolute) area in square meters."""
    if not points:
        return 0.0
    pts = points if points[0] != points[-1] else points[:-1]
    n = len(pts)
    if n < 3:
        return 0.0
    total = 0.0
    for i in range(n):
        x1, y1 = pts[i]
        x2, y2 = pts[(i + 1) % n]
        total += x1 * y2 - x2 * y1
    return abs(total) / 2.0


def polygon_perimeter(points: list[Point2D]) -> float:
    """Sum of edge lengths. Accepts an open or closed ring, same as
    polygon_area()."""
    if not points:
        return 0.0
    pts = points if points[0] != points[-1] else points[:-1]
    n = len(pts)
    if n < 2:
        return 0.0
    total = 0.0
    for i in range(n):
        x1, y1 = pts[i]
        x2, y2 = pts[(i + 1) % n]
        total += math.hypot(x2 - x1, y2 - y1)
    return total


def bounding_box(points: list[Point2D]) -> tuple[float, float, float, float]:
    """Returns (min_x, min_y, max_x, max_y)."""
    xs = [p[0] for p in points]
    ys = [p[1] for p in points]
    return (min(xs), min(ys), max(xs), max(ys))


@dataclass
class Wall:
    """A single straight wall segment, modeled as its centerline. When
    rendered, `thickness` is split evenly either side of the centerline
    (thickness / 2 each way)."""

    id: str
    start: Point2D
    end: Point2D
    thickness: float  # meters
    base_elevation: float  # meters, relative to Building.red_grade_elevation
    top_elevation: float  # meters, relative to Building.red_grade_elevation
    level: int = 0  # floor index; 0 = ground floor
    exterior: bool = False  # True = this wall is part of the building envelope/footprint
    layer: str = "A-WALL"

    def length(self) -> float:
        (x1, y1), (x2, y2) = self.start, self.end
        return math.hypot(x2 - x1, y2 - y1)

    def height(self) -> float:
        return self.top_elevation - self.base_elevation

    def direction(self) -> tuple[float, float]:
        """Unit vector from start to end. (0.0, 0.0) for a zero-length wall."""
        length = self.length()
        if length == 0:
            return (0.0, 0.0)
        (x1, y1), (x2, y2) = self.start, self.end
        return ((x2 - x1) / length, (y2 - y1) / length)

    def normal(self) -> tuple[float, float]:
        """Unit vector perpendicular to the wall, rotated +90 degrees from
        the start->end direction. Used to offset the centerline by
        thickness / 2 when rendering the wall as a solid."""
        dx, dy = self.direction()
        return (-dy, dx)

    def point_at(self, distance: float) -> Point2D:
        """Point on the centerline `distance` meters from start toward end."""
        dx, dy = self.direction()
        x1, y1 = self.start
        return (x1 + dx * distance, y1 + dy * distance)


@dataclass
class Opening:
    """A door or window hosted on a wall. `position` is measured along the
    host wall's centerline, from wall.start to the opening's own near edge —
    so ``position + width <= host_wall.length()`` must hold. Elevations are
    relative to the host wall's own base_elevation (i.e. to that floor's
    finished level), not to the red grade datum directly."""

    id: str
    type: OpeningType
    host_wall_id: str
    position: float  # meters, from host wall start to the opening's near edge
    width: float  # meters
    sill_height: float  # meters above the host wall's base_elevation
    head_height: float  # meters above the host wall's base_elevation
    mark: str | None = None  # schedule code, e.g. "D1", "W2" — future schedule.py keys off this
    layer: str = ""  # resolved in __post_init__ if left blank

    def __post_init__(self) -> None:
        if not self.layer:
            self.layer = "A-DOOR" if self.type is OpeningType.DOOR else "A-GLAZ"
        if self.width <= 0:
            raise ValueError(f"Opening {self.id!r}: width must be > 0, got {self.width}")
        if self.head_height <= self.sill_height:
            raise ValueError(
                f"Opening {self.id!r}: head_height ({self.head_height}) must be "
                f"greater than sill_height ({self.sill_height})"
            )


@dataclass
class Room:
    """A room/space boundary: a closed polygon in plan coordinates,
    representing the room's interior face (inside of its bounding walls)."""

    id: str
    name: str
    boundary: list[Point2D]
    program_tag: str  # e.g. "living", "bedroom", "bath", "kitchen", "circulation"
    level: int = 0
    layer: str = "A-AREA-IDEN"

    def area(self) -> float:
        return polygon_area(self.boundary)

    def perimeter(self) -> float:
        return polygon_perimeter(self.boundary)


@dataclass
class Level:
    """Vertical reference data for one floor. `Building.levels` holds one of
    these per floor index; the geometry itself (walls/rooms/openings) lives
    in Building's flat lists, tagged with the matching `level` index."""

    index: int
    name: str
    finished_floor_elevation: float  # meters, relative to Building.red_grade_elevation
    floor_to_floor_height: float  # meters


@dataclass
class Building:
    """The single source of truth for one building's geometry. plan.py is
    currently the only writer; every generator (present and future) should
    only need to read from this to do its job."""

    name: str
    red_grade_elevation: float  # meters, absolute site datum (kirmizi kot); see module docstring
    levels: list[Level] = field(default_factory=list)
    walls: list[Wall] = field(default_factory=list)
    rooms: list[Room] = field(default_factory=list)
    openings: list[Opening] = field(default_factory=list)
    # level index -> footprint polygon (outer face of that level's exterior
    # walls). This is the authoritative shape used for TAKS/setback checks —
    # it is *not* re-derived from the wall list at read time (computing a
    # footprint by unioning wall segments is a real polygon-boolean problem;
    # the generator that lays out the walls already knows the footprint it
    # used, so it records it directly here instead of asking every reader to
    # re-solve that problem).
    footprints: dict[int, list[Point2D]] = field(default_factory=dict)

    # -- mutation helpers ---------------------------------------------------
    def add_wall(self, wall: Wall) -> Wall:
        self.walls.append(wall)
        return wall

    def add_room(self, room: Room) -> Room:
        self.rooms.append(room)
        return room

    def add_opening(self, opening: Opening) -> Opening:
        try:
            host_wall = self.get_wall(opening.host_wall_id)
        except KeyError:
            raise KeyError(
                f"Opening {opening.id!r} references host_wall_id "
                f"{opening.host_wall_id!r}, which is not in this building's wall list"
            ) from None
        wall_length = host_wall.length()
        if opening.position < -1e-6:
            raise ValueError(
                f"Opening {opening.id!r}: position ({opening.position:.4f}) is "
                f"negative -- off the start of host wall {host_wall.id!r}"
            )
        if opening.position + opening.width > wall_length + 1e-6:
            raise ValueError(
                f"Opening {opening.id!r}: position + width "
                f"({opening.position + opening.width:.4f}) exceeds host wall "
                f"{host_wall.id!r}'s length ({wall_length:.4f}) -- opening runs "
                f"off the end of the wall"
            )
        self.openings.append(opening)
        return opening

    # -- lookups --------------------------------------------------------
    def get_wall(self, wall_id: str) -> Wall:
        for w in self.walls:
            if w.id == wall_id:
                return w
        raise KeyError(f"no wall with id {wall_id!r}")

    def get_level(self, index: int) -> Level:
        for lvl in self.levels:
            if lvl.index == index:
                return lvl
        raise KeyError(f"no level with index {index!r}")

    def walls_on_level(self, level: int) -> list[Wall]:
        return [w for w in self.walls if w.level == level]

    def rooms_on_level(self, level: int) -> list[Room]:
        return [r for r in self.rooms if r.level == level]

    def openings_on_wall(self, wall_id: str) -> list[Opening]:
        return [o for o in self.openings if o.host_wall_id == wall_id]

    # -- derived figures (used by plan.py's compliance-verification pass) ---
    def gross_floor_area(self, level: int) -> float:
        """Sum of room boundary areas on a level. A schematic proxy for
        programmed/usable floor area — it does not add back wall thickness,
        so it slightly under-counts true gross construction area. Prefer
        `footprint_area()` for KAKS/coverage-style checks; this is exposed
        for program-fit reporting (target vs. actual room area)."""
        return sum(r.area() for r in self.rooms_on_level(level))

    def footprint_area(self, level: int = 0) -> float:
        poly = self.footprints.get(level)
        if not poly:
            return 0.0
        return polygon_area(poly)

    def total_construction_area(self) -> float:
        """Sum of footprint area across every level with a recorded
        footprint. This is the figure to check against KAKS/emsal."""
        return sum(polygon_area(poly) for poly in self.footprints.values())

    def max_height(self) -> float:
        """Highest wall top_elevation across all levels — since every
        elevation in this model is already relative to the red grade datum
        (Building.red_grade_elevation == 0.0 in this coordinate system),
        this figure *is* the building height above red grade, directly
        comparable to a gabari/max-height constraint."""
        if not self.walls:
            return 0.0
        return max(w.top_elevation for w in self.walls)
