"""
departments/architecture/lib/cadgen/schedule.py

Door/window schedule generator: reads the department's own model.Building
(specifically Building.openings, which already carry a `mark` field
commented "future schedule.py keys off this" -- see model.py's Opening
dataclass) and produces a real, to-scale DXF + SVG schedule sheet per level:
one Door Schedule table and one Window Schedule table per sheet, keyed by
the same mark IDs plan.py's render_dxf()/render_svg() already draw next to
each opening on the floor-plan sheet -- so a reviewer can cross-reference an
opening on the plan straight to its schedule row and back.

Foundation-phase scope, stated plainly so it isn't mistaken for more than it
is:

- **One row per opening**, keyed by its own `Opening.mark` -- NOT grouped by
  matching door/window type. A real single-family house typically reuses a
  handful of door/window types across many openings (e.g. one "D1" type used
  at three locations, with a Qty column); this generator does not detect or
  group repeats, it lists every physical opening individually. Type-grouping
  is a documented future enhancement, not attempted this pass.
- No hardware, elevation style, or manufacturer notes -- only the numeric
  fields already present on model.Opening (width, sill_height, head_height)
  plus which wall hosts it and whether that wall is exterior or interior.
  This is schematic sales collateral, not a spec-writer's hardware schedule.
- Sill/head heights are read directly from `Opening.sill_height` /
  `Opening.head_height` and drawn as-is -- both are already relative to the
  host wall's own base_elevation (that level's finished floor), per model.py's
  documented convention; this module does not re-derive or convert them.

Mirrors plan.py's conventions:
- `render_schedule_dxf()` is the authoritative to-scale deliverable,
  `render_schedule_svg()` a quick-review companion -- same DXF-is-authoritative
  convention as plan.py.
- `verify_schedule_fidelity()` mirrors plan.py's `verify_compliance()` design
  intent, and does so the same way plan.py does it: it re-reads a
  just-generated schedule DXF **fresh from disk** (not the in-memory Building
  that produced it) and re-parses the actual schedule-layer TEXT entities
  `_draw_table()` drew -- the visible cells, in drawn position and order --
  via `_read_drawn_schedule_cells()`, then compares those against the source
  Building's own opening data. This is the primary check, and it's what
  makes the "mirrors verify_compliance()" claim true: a bug that scrambled a
  column, transposed a row, or mismatched a mark **in the rendered table
  itself** is caught here, the same way plan.py re-derives from drawn
  LWPOLYLINE geometry rather than trusting the Building that produced it. A
  secondary check also re-reads the schedule's XDATA (`_read_schedule_xdata()`)
  and cross-checks it against the Building, catching drift between that side
  channel and the source data too -- useful, but on its own it would NOT
  catch a bug confined to `_draw_table()`'s visible output, which is why it's
  secondary rather than the whole check.
- Every string this module draws (table titles, column headers, cell values,
  notes, disclaimer) is screened via `titleblock.assert_no_stamp_language()`
  before being added to a drawing, per department convention
  (departments/architecture/CLAUDE.md, "Approval-stamp prohibition") --
  extending that guard's usage into this new module, not leaving any drawn
  text unscreened.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path

import ezdxf
import svgwrite

from . import plan as plan_mod
from .model import Building, OpeningType
from .titleblock import DISCLAIMER, TitleBlockInfo, assert_no_stamp_language, draw_titleblock

APPID = plan_mod.APPID
SCHEDULE_XDATA_MARKER = "SIRKETIM-CADGEN-SCHEDULE-V1"

# Reuse the shared AIA/NCS-style layer scheme from plan.py, plus one new
# layer for the schedule table geometry/text itself.
LAYERS = dict(plan_mod.LAYERS)
LAYERS["schedule"] = "A-ANNO-SCHD"
LAYER_COLORS = dict(plan_mod.LAYER_COLORS)
LAYER_COLORS[LAYERS["schedule"]] = 2  # ACI 2 (yellow) -- cosmetic only, same convention as plan.py


# ---------------------------------------------------------------------------
# Row model
# ---------------------------------------------------------------------------


@dataclass
class ScheduleRow:
    """One schedule row -- one physical opening, read directly off
    model.Building. Every field here traces 1:1 to a model.Opening /
    model.Wall field; nothing is invented or re-derived."""

    mark: str
    opening_type: OpeningType
    width: float
    sill_height: float
    head_height: float
    host_wall_id: str
    exterior: bool
    level: int
    level_name: str

    @property
    def height(self) -> float:
        """Rough-opening height: head_height - sill_height."""
        return self.head_height - self.sill_height


def compute_schedule_rows(building: Building, level: int) -> list[ScheduleRow]:
    """One ScheduleRow per opening on `level`, sorted by (type, mark) for a
    deterministic, reviewable order. Reads only from `building` -- the same
    Building a plan.py sheet for this level would have been rendered from,
    so schedule marks always match what's drawn on the plan."""
    lvl = building.get_level(level)  # raises KeyError if the level doesn't exist -- a real input error, not silently skipped
    rows: list[ScheduleRow] = []
    for wall in building.walls_on_level(level):
        for opening in building.openings_on_wall(wall.id):
            rows.append(
                ScheduleRow(
                    mark=opening.mark or opening.id,
                    opening_type=opening.type,
                    width=opening.width,
                    sill_height=opening.sill_height,
                    head_height=opening.head_height,
                    host_wall_id=wall.id,
                    exterior=wall.exterior,
                    level=level,
                    level_name=lvl.name,
                )
            )
    rows.sort(key=lambda r: (r.opening_type.value, r.mark))
    return rows


def _doors(rows: list[ScheduleRow]) -> list[ScheduleRow]:
    return [r for r in rows if r.opening_type is OpeningType.DOOR]


def _windows(rows: list[ScheduleRow]) -> list[ScheduleRow]:
    return [r for r in rows if r.opening_type is OpeningType.WINDOW]


# Column spec shared by both the door and window tables (same fields apply
# to both opening types) -- (header label, column width in meters, value getter).
_COLUMNS: list[tuple[str, float, "callable"]] = [
    ("MARK", 1.3, lambda r: r.mark),
    ("WIDTH (m)", 1.5, lambda r: f"{r.width:.2f}"),
    ("HEIGHT (m)", 1.5, lambda r: f"{r.height:.2f}"),
    ("SILL HT (m)", 1.6, lambda r: f"{r.sill_height:.2f}"),
    ("HEAD HT (m)", 1.6, lambda r: f"{r.head_height:.2f}"),
    ("HOST WALL", 3.6, lambda r: r.host_wall_id),
    ("EXT/INT", 1.4, lambda r: "EXT" if r.exterior else "INT"),
]
_TABLE_WIDTH = sum(w for _, w, _ in _COLUMNS)


# ---------------------------------------------------------------------------
# DXF rendering
# ---------------------------------------------------------------------------


def _draw_table(
    msp,
    title: str,
    rows: list[ScheduleRow],
    insert: tuple[float, float],
    *,
    layer: str,
    row_h: float = 0.4,
) -> float:
    """Draws a bordered table (title row + column-header row + one row per
    entry, or a single '(none)' row if `rows` is empty) at `insert`
    (TOP-LEFT corner -- schedules stack downward from a fixed sheet point,
    unlike titleblock.draw_titleblock which anchors bottom-left). Every
    string drawn is screened via assert_no_stamp_language() first. Returns
    the y-coordinate of the table's bottom edge, so callers can stack
    multiple tables on one sheet."""
    assert_no_stamp_language(title)
    x0, y_top = insert
    n_rows = max(len(rows), 1)
    total_h = row_h * (2 + n_rows)  # title row + header row + data rows
    y_bottom = y_top - total_h

    msp.add_lwpolyline(
        [(x0, y_top), (x0 + _TABLE_WIDTH, y_top), (x0 + _TABLE_WIDTH, y_bottom), (x0, y_bottom)],
        close=True,
        dxfattribs={"layer": layer},
    )

    title_bottom = y_top - row_h
    msp.add_line((x0, title_bottom), (x0 + _TABLE_WIDTH, title_bottom), dxfattribs={"layer": layer})
    t = msp.add_text(title, dxfattribs={"layer": layer, "height": row_h * 0.4})
    t.set_placement((x0 + 0.1, title_bottom + row_h * 0.3))

    header_bottom = title_bottom - row_h
    msp.add_line((x0, header_bottom), (x0 + _TABLE_WIDTH, header_bottom), dxfattribs={"layer": layer})
    cx = x0
    for label, w, _ in _COLUMNS:
        assert_no_stamp_language(label)
        txt = msp.add_text(label, dxfattribs={"layer": layer, "height": row_h * 0.26})
        txt.set_placement((cx + 0.08, header_bottom + row_h * 0.32))
        cx += w

    for i in range(n_rows):
        row_top = header_bottom - row_h * i
        row_bottom = row_top - row_h
        if i > 0:
            msp.add_line((x0, row_top), (x0 + _TABLE_WIDTH, row_top), dxfattribs={"layer": layer})
        cx = x0
        if i < len(rows):
            row = rows[i]
            for _, w, getter in _COLUMNS:
                value = getter(row)
                assert_no_stamp_language(value)
                txt = msp.add_text(value, dxfattribs={"layer": layer, "height": row_h * 0.26})
                txt.set_placement((cx + 0.08, row_bottom + row_h * 0.32))
                cx += w
        else:
            assert_no_stamp_language("(none)")
            txt = msp.add_text("(none)", dxfattribs={"layer": layer, "height": row_h * 0.26})
            txt.set_placement((cx + 0.08, row_bottom + row_h * 0.32))

    # Column separators, spanning the header row + all data rows (not the
    # title row, which is one merged cell spanning the full table width).
    cx = x0
    for _, w, _ in _COLUMNS:
        if cx > x0:
            msp.add_line((cx, header_bottom), (cx, y_bottom), dxfattribs={"layer": layer})
        cx += w

    return y_bottom


def _write_schedule_xdata(msp, rows: list[ScheduleRow]) -> None:
    """Writes every row's exact numeric values as XDATA on a dedicated POINT
    entity -- the same machine-readable-ground-truth convention plan.py's
    render_dxf() already uses for project data (_write_project_data()),
    kept distinct via its own marker string. This is what
    verify_schedule_fidelity() reads back, rather than re-parsing the
    display-rounded TEXT cell strings, so the fidelity check compares exact
    values, not values already rounded for display."""
    point = msp.add_point((0.0, 0.0), dxfattribs={"layer": LAYERS["project_data"]})
    tags: list[tuple[int, str]] = [(1000, SCHEDULE_XDATA_MARKER)]
    for r in rows:
        tags.append(
            (
                1000,
                f"{r.mark}|{r.opening_type.value}|{r.width}|{r.sill_height}|{r.head_height}|"
                f"{r.host_wall_id}|{int(r.exterior)}|{r.level}",
            )
        )
    point.set_xdata(APPID, tags)


def _read_drawn_schedule_cells(msp, layer: str, row_h: float = 0.4) -> dict[str, list[list[str]]]:
    """Re-parses the actual TEXT entities `_draw_table()` drew on `layer` --
    NOT the XDATA side channel -- into
    ``{"DOOR SCHEDULE": [[cell, ...], ...], "WINDOW SCHEDULE": [[cell, ...], ...]}``,
    each inner list one data row's cell values in left-to-right column order
    (mirroring `_COLUMNS`), reconstructed purely from each TEXT entity's
    drawn position and content -- never from anything `_draw_table()` didn't
    actually write to the sheet. This is what lets `verify_schedule_fidelity()`
    catch a bug in the writing step itself (a scrambled column, a transposed
    row, a mismatched mark in the rendered table), not just an XDATA/Building
    inconsistency.

    Reconstruction relies only on `_draw_table()`'s own layout contract
    (title row height `row_h*0.4`, header/data row height `row_h*0.26`, one
    exact shared y per row, columns in `_COLUMNS` order left to right) -- the
    same contract `_draw_table()` itself draws by, not an assumption imported
    from anywhere else.
    """
    texts = [e for e in msp if e.dxftype() == "TEXT" and e.dxf.layer == layer]
    if not texts:
        raise ValueError(f"No TEXT entities found on schedule layer {layer!r} -- can't re-derive drawn rows.")

    title_height = round(row_h * 0.4, 6)
    cell_height = round(row_h * 0.26, 6)

    titles = [e for e in texts if round(e.dxf.height, 6) == title_height]
    cells = [e for e in texts if round(e.dxf.height, 6) == cell_height]
    if len(titles) != 2:
        raise ValueError(
            f"Expected exactly 2 schedule table titles (by drawn text height) on layer {layer!r}, "
            f"found {len(titles)}: {[t.dxf.text for t in titles]!r}"
        )

    # Titles sit above their own table's rows -- sort top-down (highest y first).
    titles.sort(key=lambda e: -e.dxf.insert.y)
    title_names = [t.dxf.text for t in titles]
    title_ys = [t.dxf.insert.y for t in titles]

    def owning_title_index(y: float) -> int:
        # The row's owning table is the closest title strictly above it.
        candidates = [(ty, i) for i, ty in enumerate(title_ys) if ty > y]
        if not candidates:
            raise ValueError(f"Schedule cell text at y={y} has no owning table title above it.")
        return min(candidates)[1]

    sections: dict[int, list] = {i: [] for i in range(len(titles))}
    for e in cells:
        sections[owning_title_index(e.dxf.insert.y)].append(e)

    expected_labels = [label for label, _, _ in _COLUMNS]
    result: dict[str, list[list[str]]] = {}
    for i, name in enumerate(title_names):
        by_y: dict[float, list] = {}
        for e in sections[i]:
            by_y.setdefault(round(e.dxf.insert.y, 6), []).append(e)
        row_ys = sorted(by_y.keys(), reverse=True)
        if not row_ys:
            raise ValueError(f"No header/data rows found under drawn table title {name!r}.")

        header_row = sorted(by_y[row_ys[0]], key=lambda e: e.dxf.insert.x)
        header_texts = [e.dxf.text for e in header_row]
        if header_texts != expected_labels:
            raise ValueError(
                f"Drawn column headers for table {name!r} are {header_texts!r}, expected "
                f"{expected_labels!r} -- the header row itself doesn't match the schedule contract."
            )

        data_rows: list[list[str]] = []
        for y in row_ys[1:]:
            row_entities = sorted(by_y[y], key=lambda e: e.dxf.insert.x)
            values = [e.dxf.text for e in row_entities]
            if values == ["(none)"]:
                continue  # placeholder row drawn for an empty table -- not a real data row
            if len(values) != len(_COLUMNS):
                raise ValueError(
                    f"Drawn row at y={y} in table {name!r} has {len(values)} cell(s), "
                    f"expected {len(_COLUMNS)}: {values!r}"
                )
            data_rows.append(values)
        result[name] = data_rows
    return result


def _read_schedule_xdata(msp) -> list[dict]:
    candidates = [e for e in msp if e.dxftype() == "POINT" and e.dxf.layer == LAYERS["project_data"]]
    if not candidates:
        raise ValueError(
            f"No schedule project-data POINT entity found on layer {LAYERS['project_data']!r} "
            "-- this DXF wasn't produced by cadgen.schedule.render_schedule_dxf(), or the "
            "layer/marker scheme changed."
        )
    xdata = candidates[0].get_xdata(APPID)
    strings = [tag.value for tag in xdata if tag.code == 1000]
    if not strings or strings[0] != SCHEDULE_XDATA_MARKER:
        raise ValueError(
            f"Schedule XDATA is missing its version marker ({SCHEDULE_XDATA_MARKER!r}) "
            "-- refusing to trust unrecognized data."
        )
    rows: list[dict] = []
    for s in strings[1:]:
        mark, type_, width, sill, head, host, ext, level = s.split("|")
        rows.append(
            {
                "mark": mark,
                "type": type_,
                "width": float(width),
                "sill_height": float(sill),
                "head_height": float(head),
                "host_wall_id": host,
                "exterior": bool(int(ext)),
                "level": int(level),
            }
        )
    return rows


def render_schedule_dxf(
    building: Building,
    level: int,
    path: str | Path,
    *,
    titleblock_info: TitleBlockInfo | None = None,
    insert: tuple[float, float] = (0.0, 0.0),
) -> Path:
    """Renders one level's door + window schedule to a real, to-scale DXF
    file. Per department convention (matching plan.py), this is the
    authoritative deliverable -- render_schedule_svg() below is a
    quick-review companion."""
    rows = compute_schedule_rows(building, level)
    door_rows = _doors(rows)
    window_rows = _windows(rows)
    lvl = building.get_level(level)

    doc = ezdxf.new("R2018")
    doc.header["$INSUNITS"] = 6  # meters
    doc.header["$MEASUREMENT"] = 1  # metric
    doc.appids.new(APPID)
    for layer_name, color in LAYER_COLORS.items():
        doc.layers.add(name=layer_name, color=color)
    msp = doc.modelspace()

    x0, y0 = insert
    header_text = f"{building.name} -- {lvl.name} -- DOOR & WINDOW SCHEDULE (schematic)"
    assert_no_stamp_language(header_text)
    hdr = msp.add_text(header_text, dxfattribs={"layer": LAYERS["notes"], "height": 0.3})
    hdr.set_placement((x0, y0))

    door_top = y0 - 1.0
    door_bottom = _draw_table(msp, "DOOR SCHEDULE", door_rows, (x0, door_top), layer=LAYERS["schedule"])
    window_top = door_bottom - 0.8
    window_bottom = _draw_table(msp, "WINDOW SCHEDULE", window_rows, (x0, window_top), layer=LAYERS["schedule"])

    _write_schedule_xdata(msp, rows)

    note_lines = [
        f"Schedule derived directly from Building.openings for {lvl.name} (level index {level}) "
        "-- one row per opening, keyed by its own Opening.mark (matches the mark label drawn on "
        "the corresponding plan.py floor-plan sheet for this level).",
        "Widths/heights/sill heights are read directly from the source Building model, not "
        "re-typed -- see cadgen.schedule.verify_schedule_fidelity() for the mandatory "
        "re-derivation check against a freshly re-read copy of this file.",
        "Sill/head heights are measured above this level's own finished floor (host wall "
        "base_elevation), per model.py's documented convention -- not above the red grade datum directly.",
        "One row per physical opening, NOT grouped by matching door/window type -- see module docstring.",
    ]
    note_text = "\n".join(note_lines)
    assert_no_stamp_language(note_text)
    note = msp.add_mtext(note_text, dxfattribs={"layer": LAYERS["notes"], "char_height": 0.14, "width": _TABLE_WIDTH})
    note.set_location((x0, window_bottom - 0.5))

    assert_no_stamp_language(DISCLAIMER)
    disc = msp.add_mtext(DISCLAIMER, dxfattribs={"layer": LAYERS["notes"], "char_height": 0.14, "width": _TABLE_WIDTH})
    disc.set_location((x0, window_bottom - 2.4))

    if titleblock_info is not None:
        draw_titleblock(msp, titleblock_info, insert=(x0, window_bottom - 8.5), layer=LAYERS["titleblock"])

    out_path = Path(path)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    doc.saveas(str(out_path))
    return out_path


# ---------------------------------------------------------------------------
# SVG rendering (quick-review companion; DXF above is authoritative)
# ---------------------------------------------------------------------------


def render_schedule_svg(
    building: Building,
    level: int,
    path: str | Path,
    *,
    titleblock_info: TitleBlockInfo | None = None,
    scale_px_per_m: float = 40.0,
) -> Path:
    rows = compute_schedule_rows(building, level)
    door_rows = _doors(rows)
    window_rows = _windows(rows)
    lvl = building.get_level(level)

    row_h_m = 0.4

    def table_h_m(n: int) -> float:
        return row_h_m * (2 + max(n, 1))

    top_margin_m = 1.0
    gap_m = 0.6
    footer_m = 1.6
    total_h_m = top_margin_m + table_h_m(len(door_rows)) + gap_m + table_h_m(len(window_rows)) + footer_m
    width_px = (_TABLE_WIDTH + 1.0) * scale_px_per_m
    height_px = total_h_m * scale_px_per_m

    dwg = svgwrite.Drawing(
        str(path), size=(f"{width_px}px", f"{height_px}px"), viewBox=f"0 0 {width_px} {height_px}", profile="full"
    )
    dwg.add(dwg.rect(insert=(0, 0), size=(width_px, height_px), fill="white"))

    header_text = f"{building.name} -- {lvl.name} -- DOOR & WINDOW SCHEDULE (schematic)"
    assert_no_stamp_language(header_text)
    dwg.add(dwg.text(header_text, insert=(10, 20), font_size="14px", font_family="Arial", fill="#111"))

    def draw_table(title: str, table_rows: list[ScheduleRow], top_m: float) -> float:
        assert_no_stamp_language(title)
        x0_px = 10.0
        y0_px = top_m * scale_px_per_m
        row_h_px = row_h_m * scale_px_per_m
        n_rows = max(len(table_rows), 1)
        table_w_px = _TABLE_WIDTH * scale_px_per_m
        table_h_px = row_h_px * (2 + n_rows)

        dwg.add(dwg.rect(insert=(x0_px, y0_px), size=(table_w_px, table_h_px), fill="none", stroke="#333", stroke_width=1))
        dwg.add(dwg.text(title, insert=(x0_px + 4, y0_px + row_h_px * 0.65), font_size="12px", font_family="Arial", fill="#111"))
        dwg.add(dwg.line(start=(x0_px, y0_px + row_h_px), end=(x0_px + table_w_px, y0_px + row_h_px), stroke="#333", stroke_width=1))

        cx = x0_px
        header_y = y0_px + row_h_px * 1.65
        for label, w, _ in _COLUMNS:
            assert_no_stamp_language(label)
            dwg.add(dwg.text(label, insert=(cx + 4, header_y), font_size="9px", font_family="Arial", fill="#111"))
            cx += w * scale_px_per_m
        dwg.add(
            dwg.line(
                start=(x0_px, y0_px + row_h_px * 2), end=(x0_px + table_w_px, y0_px + row_h_px * 2),
                stroke="#333", stroke_width=1,
            )
        )

        for i in range(n_rows):
            row_top_px = y0_px + row_h_px * (2 + i)
            if i > 0:
                dwg.add(dwg.line(start=(x0_px, row_top_px), end=(x0_px + table_w_px, row_top_px), stroke="#999", stroke_width=0.5))
            cx = x0_px
            if i < len(table_rows):
                row = table_rows[i]
                for _, w, getter in _COLUMNS:
                    value = getter(row)
                    assert_no_stamp_language(value)
                    dwg.add(dwg.text(value, insert=(cx + 4, row_top_px + row_h_px * 0.65), font_size="9px", font_family="Arial", fill="#222"))
                    cx += w * scale_px_per_m
            else:
                assert_no_stamp_language("(none)")
                dwg.add(dwg.text("(none)", insert=(cx + 4, row_top_px + row_h_px * 0.65), font_size="9px", font_family="Arial", fill="#999"))

        cx = x0_px
        for _, w, _ in _COLUMNS:
            if cx > x0_px:
                dwg.add(dwg.line(start=(cx, y0_px + row_h_px), end=(cx, y0_px + table_h_px), stroke="#999", stroke_width=0.5))
            cx += w * scale_px_per_m

        return (y0_px + table_h_px) / scale_px_per_m

    door_bottom_m = draw_table("DOOR SCHEDULE", door_rows, top_margin_m)
    window_bottom_m = draw_table("WINDOW SCHEDULE", window_rows, door_bottom_m + gap_m)

    if titleblock_info is not None:
        for label, value in [
            ("PROJECT", titleblock_info.project_name),
            ("PARCEL", titleblock_info.parcel_id),
            ("DATE", titleblock_info.date),
            ("SCALE", titleblock_info.scale),
            ("SHEET", f"{titleblock_info.sheet_number} -- {titleblock_info.sheet_title}"),
        ]:
            assert_no_stamp_language(f"{label}: {value}")
        info_text = (
            f"{titleblock_info.project_name} | {titleblock_info.parcel_id} | "
            f"{titleblock_info.sheet_number}: {titleblock_info.sheet_title} | {titleblock_info.date}"
        )
        dwg.add(dwg.text(info_text, insert=(10, (window_bottom_m + 0.35) * scale_px_per_m), font_size="10px", font_family="Arial", fill="#333"))

    assert_no_stamp_language(DISCLAIMER)
    dwg.add(dwg.text(DISCLAIMER, insert=(10, (window_bottom_m + 0.75) * scale_px_per_m), font_size="9px", font_family="Arial", fill="#b00020"))

    out_path = Path(path)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    dwg.save()
    return out_path


# ---------------------------------------------------------------------------
# Schedule fidelity verification -- re-derives every row from a freshly
# re-read DXF and checks it against the source Building, mirroring
# plan.py's verify_compliance() design intent.
# ---------------------------------------------------------------------------


@dataclass
class ScheduleCheck:
    name: str
    passed: bool
    detail: str = ""


@dataclass
class ScheduleFidelityReport:
    checks: list[ScheduleCheck] = field(default_factory=list)

    @property
    def all_passed(self) -> bool:
        return all(c.passed for c in self.checks)

    def summary(self) -> str:
        lines = []
        for c in self.checks:
            status = "PASS" if c.passed else "FAIL"
            lines.append(f"[{status}] {c.name}" + (f"  -- {c.detail}" if c.detail else ""))
        return "\n".join(lines)


def verify_schedule_fidelity(
    dxf_path: str | Path,
    building: Building,
    level: int,
    *,
    tolerance: float = 1e-6,
) -> ScheduleFidelityReport:
    """Re-derives every schedule row from a *freshly re-read* generated
    schedule DXF file -- not the in-memory Building/rows that produced it --
    and checks it against `building`'s own opening data two ways, both from
    data actually read back off disk:

    1. **Rendered-cell check (primary; genuinely mirrors plan.py's
       verify_compliance()):** re-parses the actual TEXT entities
       `_draw_table()` drew on the schedule layer (via
       `_read_drawn_schedule_cells()`) and compares each drawn row's cell
       values, in drawn position/order, against the same `_COLUMNS`
       formatting applied to `building`'s own opening data. This is checking
       what a reviewer would actually see on the sheet -- so a bug that
       scrambled a column, transposed a row, or mismatched a mark in the
       *visible table* is caught here, not just a bug in row selection.
    2. **XDATA/Building consistency check (secondary, kept for the
       machine-readable-ground-truth cross-reference it already provided):**
       re-reads the schedule's XDATA point (`_read_schedule_xdata()`) and
       checks it against `building`. XDATA is written independently of the
       visible cells by `_write_schedule_xdata()`, so this catches drift
       between the XDATA side channel and the source Building, but on its
       own would NOT catch a bug confined to `_draw_table()`'s visible
       output -- check 1 above is what closes that gap.

    Together these are the schedule-specific analog of plan.py's
    verify_compliance(): the same rationale (a bug in the writing step
    itself must be caught too, not just a bug in the row-selection logic),
    applied to schedule numbers instead of zoning figures."""
    doc = ezdxf.readfile(str(dxf_path))
    msp = doc.modelspace()
    expected_rows = compute_schedule_rows(building, level)
    expected_door_rows = _doors(expected_rows)
    expected_window_rows = _windows(expected_rows)

    checks: list[ScheduleCheck] = []

    # --- 1. Rendered-cell check: what's actually drawn on the sheet -------
    drawn_cells = _read_drawn_schedule_cells(msp, LAYERS["schedule"])
    for table_name, expected_table_rows in (
        ("DOOR SCHEDULE", expected_door_rows),
        ("WINDOW SCHEDULE", expected_window_rows),
    ):
        drawn_table_rows = drawn_cells.get(table_name, [])
        checks.append(
            ScheduleCheck(
                name=f"Rendered {table_name} row count on the drawn sheet matches Building.openings for this level",
                passed=len(drawn_table_rows) == len(expected_table_rows),
                detail=f"drawn={len(drawn_table_rows)} expected={len(expected_table_rows)}",
            )
        )
        max_len = max(len(drawn_table_rows), len(expected_table_rows))
        for i in range(max_len):
            exp = expected_table_rows[i] if i < len(expected_table_rows) else None
            drawn = drawn_table_rows[i] if i < len(drawn_table_rows) else None
            expected_cells = [getter(exp) for _, _, getter in _COLUMNS] if exp is not None else None
            label = exp.mark if exp is not None else (drawn[0] if drawn else "?")
            checks.append(
                ScheduleCheck(
                    name=f"Rendered {table_name} row {i} (mark {label!r}) cell values, as drawn on the sheet, match Building.Opening exactly",
                    passed=drawn is not None and expected_cells is not None and drawn == expected_cells,
                    detail=f"drawn={drawn!r} expected={expected_cells!r}",
                )
            )

    # --- 2. XDATA/Building consistency check (secondary) ------------------
    drawn_xdata_rows = _read_schedule_xdata(msp)
    checks.append(
        ScheduleCheck(
            name="Schedule XDATA row count matches Building.openings for this level",
            passed=len(drawn_xdata_rows) == len(expected_rows),
            detail=f"drawn={len(drawn_xdata_rows)} expected={len(expected_rows)}",
        )
    )

    drawn_by_mark: dict[str, list[dict]] = {}
    for d in drawn_xdata_rows:
        drawn_by_mark.setdefault(d["mark"], []).append(d)

    for exp in expected_rows:
        candidates = drawn_by_mark.get(exp.mark, [])
        match = None
        for c in candidates:
            if (
                c["type"] == exp.opening_type.value
                and abs(c["width"] - exp.width) <= tolerance
                and abs(c["sill_height"] - exp.sill_height) <= tolerance
                and abs(c["head_height"] - exp.head_height) <= tolerance
                and c["host_wall_id"] == exp.host_wall_id
                and c["exterior"] == exp.exterior
                and c["level"] == exp.level
            ):
                match = c
                break
        checks.append(
            ScheduleCheck(
                name=f"Mark {exp.mark!r} ({exp.opening_type.value}) XDATA on the schedule sheet matches its source Building.Opening exactly",
                passed=match is not None,
                detail=(
                    f"expected width={exp.width:.3f} sill={exp.sill_height:.3f} head={exp.head_height:.3f} "
                    f"host={exp.host_wall_id} ext={exp.exterior}; "
                    f"drawn candidates for this mark={candidates}"
                ),
            )
        )

    # Also flag any drawn XDATA row whose mark isn't in the source Building
    # at all (a schedule row that doesn't trace back to any real opening).
    expected_marks = {r.mark for r in expected_rows}
    for d in drawn_xdata_rows:
        if d["mark"] not in expected_marks:
            checks.append(
                ScheduleCheck(
                    name=f"Drawn schedule XDATA row mark {d['mark']!r} traces back to a real Building.Opening",
                    passed=False,
                    detail=f"no opening with this mark found on level {level} of the source Building",
                )
            )

    return ScheduleFidelityReport(checks=checks)
