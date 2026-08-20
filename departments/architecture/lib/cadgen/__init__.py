"""
cadgen — Sirketim architecture department's CAD generation library.

Foundation phase (see departments/architecture/reports/cad-tooling-gap-analysis.md
for the gap this closes, and departments/architecture/CLAUDE.md "Floor plan
generation" for the department conventions this package implements).

Modules:
    model.py        Core data model (Building/Wall/Room/Opening/Level) — the
                     single source of truth every generator reads from.
    plan.py          Baseline schematic floor-plan generator: lot + zoning +
                     room program -> Building -> DXF/SVG, plus the mandatory
                     compliance-verification pass.
    export_dwg.py    DXF <-> native DWG round-trip via ODA File Converter.
    titleblock.py    Sheet title block, with a hard-enforced prohibition on
                     reproducing governmental approval-stamp language.

Not built yet (roadmapped, later passes): schedule.py (door/window
schedules), elevation.py, section.py, finishes.py, furnishing.py. Do not
import names that would imply these exist.
"""

from __future__ import annotations

from .model import (
    Building,
    Level,
    Opening,
    OpeningType,
    Point2D,
    Room,
    Wall,
    polygon_area,
    polygon_perimeter,
)

__version__ = "0.1.0"  # foundation phase

__all__ = [
    "Building",
    "Level",
    "Opening",
    "OpeningType",
    "Point2D",
    "Room",
    "Wall",
    "polygon_area",
    "polygon_perimeter",
    "__version__",
]
