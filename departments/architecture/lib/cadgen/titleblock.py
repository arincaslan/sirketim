"""
departments/architecture/lib/cadgen/titleblock.py

Sheet title block: project/parcel/date/scale/sheet metadata, drawn as real
DXF entities in a bordered block, plus the department's mandatory schematic
disclaimer.

HARD RULE (non-negotiable) — see departments/architecture/CLAUDE.md,
"Approval-stamp prohibition", and the founder's brief for this build pass:

    Never reproduce or fabricate official governmental approval-stamp text
    or graphics. The founder's sample DWG (373-6, quality-bar reference,
    outside this repo) contains a real municipal review/approval stamp
    block. Real examples of that stamp's actual text, quoted here ONLY so
    this module can screen against it — never for reuse or as a template:

        "...sayili imar durumuna, imar kanunu ve ilgili mevzuat
        hukumlerine gore incelenerek onaylanmistir."
        "KARAMURSEL BELEDIYESI BASKANLIGI"

    (see departments/architecture/reports/cad-tooling-gap-analysis.md,
    Section 4.2, for the full quote and context.)

Our drawings are unreviewed and unstamped schematic/sales output. Drawing
anything resembling that stamp on our output would misrepresent it as
officially approved, which it never is. This module enforces that in code,
not just as a comment: every string this module draws is screened by
`assert_no_stamp_language()` before it's added to the drawing, and
`scan_dxf_for_stamp_language()` is available to audit a whole generated DXF
file after the fact (used in the foundation-phase validation pass — see
departments/architecture/lib/cadgen/examples/synthetic_lot_demo.py).
"""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

import ezdxf

# ---------------------------------------------------------------------------
# Banned language
# ---------------------------------------------------------------------------

# Approval/review/stamp language, Turkish and English. Deliberately scoped to
# phrases that assert governmental review/approval/signature happened — not
# ordinary zoning vocabulary (e.g. "imar durumu" alone, meaning "zoning
# status", is fine to reference; "...imar durumuna ... onaylanmistir",
# asserting that status was reviewed and approved, is not).
FORBIDDEN_PHRASES: list[str] = [
    "incelenerek onaylanmıştır",
    "incelenerek onaylanmistir",
    "onaylanmıştır",
    "onaylanmistir",
    "imar kanunu",
    "ilgili mevzuat hükümlerine göre",
    "ilgili mevzuat hukumlerine gore",
    "belediyesi başkanlığı",
    "belediyesi baskanligi",
    "tasdik edilmiştir",
    "tasdik edilmistir",
    "uygundur",
    "mühür",
    "muhur",
    "kaşe",
    "kase",
    # English equivalents, in case future output is bilingual
    "approved by",
    "reviewed and approved",
    "municipal approval",
    "permit approved",
    "stamped and approved",
    "official approval",
]

_TR_FOLD = str.maketrans("İIıŞşĞğÜüÖöÇç", "iiisSgGuuOoCc")


def _normalize(s: str) -> str:
    """Casefold + collapse common Turkish diacritics so both spellings
    ('onaylanmıştır' / 'onaylanmistir') and case variants are caught by the
    same phrase check."""
    return s.translate(_TR_FOLD).casefold()


class ApprovalStampLanguageError(ValueError):
    """Raised when text destined for a generated drawing matches banned
    approval-stamp language. This is a hard stop by design, not a warning —
    see the module docstring."""


def assert_no_stamp_language(text: str) -> None:
    """Raises ApprovalStampLanguageError if `text` contains any banned
    phrase (case/diacritic-insensitive substring match)."""
    normalized = _normalize(text)
    for phrase in FORBIDDEN_PHRASES:
        if _normalize(phrase) in normalized:
            raise ApprovalStampLanguageError(
                f"Text destined for a generated drawing matches banned "
                f"approval-stamp language ({phrase!r}) in: {text!r}. Our "
                f"output is unreviewed/unstamped schematic work — see "
                f"departments/architecture/CLAUDE.md, 'Approval-stamp "
                f"prohibition'."
            )


def scan_dxf_for_stamp_language(dxf_path: str | Path) -> list[dict]:
    """Re-opens a generated DXF file from disk and screens every
    TEXT/MTEXT/ATTRIB entity in modelspace for banned approval-stamp
    language. Returns a list of violation dicts (empty list = clean). This
    is the after-the-fact audit used by the foundation-phase validation
    pass — it checks the actual file that would ship, not just what
    titleblock.py itself wrote in memory."""
    doc = ezdxf.readfile(str(dxf_path))
    msp = doc.modelspace()
    violations: list[dict] = []
    for e in msp:
        dxftype = e.dxftype()
        if dxftype == "TEXT" or dxftype == "ATTRIB":
            text = e.dxf.text
        elif dxftype == "MTEXT":
            text = e.text
        else:
            continue
        normalized = _normalize(text)
        for phrase in FORBIDDEN_PHRASES:
            if _normalize(phrase) in normalized:
                violations.append(
                    {
                        "handle": e.dxf.handle,
                        "layer": e.dxf.layer,
                        "dxftype": dxftype,
                        "text": text,
                        "matched_phrase": phrase,
                    }
                )
    return violations


# ---------------------------------------------------------------------------
# Title block content + drawing
# ---------------------------------------------------------------------------

DISCLAIMER = (
    "SCHEMATIC DRAWING -- NOT FOR PERMIT OR CONSTRUCTION. Requires review, "
    "revision and stamp by a licensed architect before permitting or "
    "construction. Not a substitute for a structural/MEP engineer's "
    "calculations. No governmental review or approval implied or granted "
    "by this drawing."
)


@dataclass
class TitleBlockInfo:
    project_name: str
    parcel_id: str
    date: str
    scale: str
    sheet_number: str
    sheet_title: str
    prepared_by: str = "Sirketim -- Architecture department (schematic, AI-assisted)"


def draw_titleblock(
    msp,
    info: TitleBlockInfo,
    *,
    insert: tuple[float, float] = (0.0, 0.0),
    width: float = 9.0,
    height: float = 5.4,
    layer: str = "A-ANNO-TTLB",
) -> None:
    """Draws a bordered title block (project/parcel/date/scale/sheet fields
    + the mandatory schematic disclaimer) at `insert` (bottom-left corner),
    `width` x `height` meters. Every string is screened by
    assert_no_stamp_language() before being added — see module docstring."""
    fields = [
        ("PROJECT", info.project_name),
        ("PARCEL", info.parcel_id),
        ("DATE", info.date),
        ("SCALE", info.scale),
        ("SHEET", f"{info.sheet_number} -- {info.sheet_title}"),
        ("PREPARED BY", info.prepared_by),
    ]
    for label, value in fields:
        assert_no_stamp_language(f"{label}: {value}")
    assert_no_stamp_language(DISCLAIMER)

    x0, y0 = insert
    x1, y1 = x0 + width, y0 + height

    msp.add_lwpolyline(
        [(x0, y0), (x1, y0), (x1, y1), (x0, y1)],
        close=True,
        dxfattribs={"layer": layer},
    )

    n_rows = len(fields)
    row_h = height / (n_rows + 2)  # + disclaimer row + margin row
    for i, (label, value) in enumerate(fields):
        row_top = y1 - row_h * i
        row_bottom = row_top - row_h
        if i > 0:
            msp.add_line((x0, row_top), (x1, row_top), dxfattribs={"layer": layer})
        text_entity = msp.add_text(
            f"{label}: {value}",
            dxfattribs={"layer": layer, "height": row_h * 0.32},
        )
        text_entity.set_placement((x0 + 0.12, row_bottom + row_h * 0.32))

    disclaimer_top = y1 - row_h * n_rows
    msp.add_line((x0, disclaimer_top), (x1, disclaimer_top), dxfattribs={"layer": layer})
    note = msp.add_mtext(
        DISCLAIMER,
        dxfattribs={
            "layer": layer,
            "char_height": row_h * 0.24,
            "width": width - 0.24,
        },
    )
    note.set_location((x0 + 0.12, disclaimer_top - 0.1))
