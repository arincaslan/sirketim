"""
departments/architecture/lib/cadgen/calc_table.py

Visible on-sheet calculation table generator: draws the lot area, per-level
footprint areas, TAKS/KAKS used-vs-allowed, and every other compliance
figure as a real, bordered table on a sheet -- matching what the founder's
373-6 reference DWG shows (a drawn area/hesap block on the sheet itself, not
just an internal Python check result the founder would have to take on
faith).

Deliberately reads its numbers from an ALREADY-COMPUTED
`plan.ComplianceReport` (from `plan.verify_compliance_multilevel()`) rather
than recomputing anything itself -- this is a single-source-of-truth
decision: the calc table must show exactly what the mandatory
compliance-verification pass already checked, not a second, potentially
divergent, calculation. If the compliance numbers ever change, the table
changes with them automatically because they're read from the same report
object, not re-derived by a second, easily-drifting code path.

Same conventions as every other cadgen module: DXF is the authoritative
deliverable, SVG a quick-review companion, and every drawn string --
including every table cell -- is screened through
`titleblock.assert_no_stamp_language()` before being added to a drawing.
"""

from __future__ import annotations

from pathlib import Path

import ezdxf
import svgwrite

from . import plan as plan_mod
from .model import Building
from .titleblock import DISCLAIMER, TitleBlockInfo, assert_no_stamp_language, draw_titleblock

LAYERS = dict(plan_mod.LAYERS)
LAYERS["calc_table"] = "A-ANNO-CALC"
LAYER_COLORS = dict(plan_mod.LAYER_COLORS)
LAYER_COLORS[LAYERS["calc_table"]] = 3


def _rows_from_report(building: Building, lot: plan_mod.LotGeometry, zoning: plan_mod.ZoningConstraints, report: "plan_mod.ComplianceReport") -> list[tuple[str, str, str, str]]:
    """(label, actual, limit/requirement, result) rows -- one per level-area
    line plus one per compliance check, all derived from already-computed
    data (Building.footprint_area()/lot/zoning for the per-level area rows,
    `report` for every checked figure)."""
    rows: list[tuple[str, str, str, str]] = []
    rows.append(("Parsel alani (lot area)", f"{lot.area():.2f} m2", lot.source_note[:40], "--"))
    for lvl in sorted(building.levels, key=lambda level_obj: level_obj.index):
        rows.append((f"L{lvl.index} {lvl.name} -- footprint alani", f"{building.footprint_area(lvl.index):.2f} m2", "--", "--"))
    rows.append(("Toplam insaat alani (tum kayitli footprintler)", f"{building.total_construction_area():.2f} m2", "--", "--"))
    for check in report.checks:
        result = "PASS" if check.passed else "FAIL"
        rows.append((check.name, f"{check.actual:.4f}", f"{check.requirement} {check.limit:.4f}", result))
    return rows


_COLUMNS_WIDTHS = (9.5, 3.2, 4.5, 1.8)  # label, actual, limit, result -- meters, matches schedule.py's table-drawing convention


def render_calc_table_dxf(
    building: Building,
    lot: plan_mod.LotGeometry,
    zoning: plan_mod.ZoningConstraints,
    report: "plan_mod.ComplianceReport",
    path: str | Path,
    *,
    titleblock_info: TitleBlockInfo | None = None,
    insert: tuple[float, float] = (0.0, 0.0),
    row_h: float = 0.32,
) -> Path:
    rows = _rows_from_report(building, lot, zoning, report)

    doc = ezdxf.new("R2018")
    doc.header["$INSUNITS"] = 6
    doc.header["$MEASUREMENT"] = 1
    for layer_name, color in LAYER_COLORS.items():
        doc.layers.add(name=layer_name, color=color)
    msp = doc.modelspace()

    x0, y_top = insert
    table_width = sum(_COLUMNS_WIDTHS)
    total_h = row_h * (2 + len(rows))
    y_bottom = y_top - total_h

    title = f"{building.name} -- ALAN HESABI / TAKS-KAKS TABLOSU (schematic)"
    assert_no_stamp_language(title)
    msp.add_lwpolyline([(x0, y_top), (x0 + table_width, y_top), (x0 + table_width, y_bottom), (x0, y_bottom)], close=True, dxfattribs={"layer": LAYERS["calc_table"]})
    title_bottom = y_top - row_h
    msp.add_line((x0, title_bottom), (x0 + table_width, title_bottom), dxfattribs={"layer": LAYERS["calc_table"]})
    t = msp.add_text(title, dxfattribs={"layer": LAYERS["calc_table"], "height": row_h * 0.4})
    t.set_placement((x0 + 0.1, title_bottom + row_h * 0.3))

    headers = ("KALEM", "DEGER", "SINIR / KOSUL", "SONUC")
    header_bottom = title_bottom - row_h
    msp.add_line((x0, header_bottom), (x0 + table_width, header_bottom), dxfattribs={"layer": LAYERS["calc_table"]})
    cx = x0
    for label, w in zip(headers, _COLUMNS_WIDTHS):
        assert_no_stamp_language(label)
        txt = msp.add_text(label, dxfattribs={"layer": LAYERS["calc_table"], "height": row_h * 0.28})
        txt.set_placement((cx + 0.08, header_bottom + row_h * 0.32))
        cx += w

    for i, row in enumerate(rows):
        row_top = header_bottom - row_h * i
        row_bottom = row_top - row_h
        if i > 0:
            msp.add_line((x0, row_top), (x0 + table_width, row_top), dxfattribs={"layer": LAYERS["calc_table"]})
        cx = x0
        for value, w in zip(row, _COLUMNS_WIDTHS):
            assert_no_stamp_language(str(value))
            txt = msp.add_text(str(value), dxfattribs={"layer": LAYERS["calc_table"], "height": row_h * 0.26})
            txt.set_placement((cx + 0.08, row_bottom + row_h * 0.32))
            cx += w

    cx = x0
    for w in _COLUMNS_WIDTHS:
        if cx > x0:
            msp.add_line((cx, header_bottom), (cx, y_bottom), dxfattribs={"layer": LAYERS["calc_table"]})
        cx += w

    assert_no_stamp_language(DISCLAIMER)
    disc = msp.add_mtext(DISCLAIMER, dxfattribs={"layer": plan_mod.LAYERS["notes"], "char_height": 0.14, "width": table_width})
    disc.set_location((x0, y_bottom - 0.5))

    if titleblock_info is not None:
        draw_titleblock(msp, titleblock_info, insert=(x0, y_bottom - 6.4), layer=plan_mod.LAYERS["titleblock"])

    out_path = Path(path)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    doc.saveas(str(out_path))
    return out_path


def render_calc_table_svg(
    building: Building,
    lot: plan_mod.LotGeometry,
    zoning: plan_mod.ZoningConstraints,
    report: "plan_mod.ComplianceReport",
    path: str | Path,
    *,
    titleblock_info: TitleBlockInfo | None = None,
    scale_px_per_m: float = 34.0,
    row_h_m: float = 0.32,
) -> Path:
    rows = _rows_from_report(building, lot, zoning, report)
    table_w_m = sum(_COLUMNS_WIDTHS)
    total_h_m = row_h_m * (2 + len(rows)) + 1.4
    width_px = (table_w_m + 1.0) * scale_px_per_m
    height_px = total_h_m * scale_px_per_m

    dwg = svgwrite.Drawing(str(path), size=(f"{width_px}px", f"{height_px}px"), viewBox=f"0 0 {width_px} {height_px}", profile="full")
    dwg.add(dwg.rect(insert=(0, 0), size=(width_px, height_px), fill="white"))

    title = f"{building.name} -- ALAN HESABI / TAKS-KAKS TABLOSU (schematic)"
    assert_no_stamp_language(title)
    dwg.add(dwg.text(title, insert=(10, 20), font_size="13px", font_family="Arial", fill="#111"))

    x0_px, y0_px = 10.0, 30.0
    row_h_px = row_h_m * scale_px_per_m
    table_w_px = table_w_m * scale_px_per_m
    headers = ("KALEM", "DEGER", "SINIR / KOSUL", "SONUC")
    cx = x0_px
    header_y = y0_px + row_h_px * 0.7
    for label, w in zip(headers, _COLUMNS_WIDTHS):
        assert_no_stamp_language(label)
        dwg.add(dwg.text(label, insert=(cx + 4, header_y), font_size="10px", font_family="Arial", fill="#111", font_weight="bold"))
        cx += w * scale_px_per_m
    dwg.add(dwg.line(start=(x0_px, y0_px + row_h_px), end=(x0_px + table_w_px, y0_px + row_h_px), stroke="#333", stroke_width=1))

    for i, row in enumerate(rows):
        row_top_px = y0_px + row_h_px * (1 + i)
        cx = x0_px
        fill = "#b00020" if row[3] == "FAIL" else "#222"
        for value, w in zip(row, _COLUMNS_WIDTHS):
            assert_no_stamp_language(str(value))
            dwg.add(dwg.text(str(value), insert=(cx + 4, row_top_px + row_h_px * 0.7), font_size="9px", font_family="Arial", fill=fill))
            cx += w * scale_px_per_m
        if i > 0:
            dwg.add(dwg.line(start=(x0_px, row_top_px), end=(x0_px + table_w_px, row_top_px), stroke="#ccc", stroke_width=0.5))

    footer_y = y0_px + row_h_px * (1 + len(rows)) + 20
    if titleblock_info is not None:
        info_text = (
            f"{titleblock_info.project_name} | {titleblock_info.parcel_id} | "
            f"{titleblock_info.sheet_number}: {titleblock_info.sheet_title} | {titleblock_info.date}"
        )
        assert_no_stamp_language(info_text)
        dwg.add(dwg.text(info_text, insert=(10, footer_y), font_size="10px", font_family="Arial", fill="#333"))
    assert_no_stamp_language(DISCLAIMER)
    dwg.add(dwg.text(DISCLAIMER, insert=(10, footer_y + 16), font_size="9px", font_family="Arial", fill="#b00020"))

    out_path = Path(path)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    dwg.save()
    return out_path
