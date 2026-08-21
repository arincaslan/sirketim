"""
departments/architecture/lib/cadgen/export_dwg.py

Thin wrapper around ezdxf's ODA File Converter integration
(`ezdxf.addons.odafc`) for round-tripping generated DXF files to/from native
DWG.

Gotcha (recorded in
departments/architecture/reports/cad-tooling-gap-analysis.md, Section 2.2,
and empirically confirmed there against the founder's real sample DWG):
`ezdxf`'s odafc addon defaults to looking for the converter at
``C:\\Program Files\\ODA\\ODAFileConverter\\ODAFileConverter.exe`` — a
machine-wide path that does not exist on this machine, because the install
here is per-user (the machine-wide MSI install failed with "insufficient
privileges" in this environment). The real install path is
``ODA_EXEC_PATH`` below. Every public function in this module calls
`_ensure_oda_path()` first, which sets that override via
``ezdxf.options.set('odafc-addon', 'win_exec_path', ...)`` — callers of this
module don't need to remember the gotcha themselves.
"""

from __future__ import annotations

from pathlib import Path

import ezdxf
from ezdxf.addons import odafc
from ezdxf.document import Drawing

ODA_EXEC_PATH = r"C:\Users\win10\AppData\Local\Programs\ODA\ODAFileConverter 27.1.0\ODAFileConverter.exe"


class ODAConverterMissingError(RuntimeError):
    """Raised when the ODA File Converter executable isn't at the configured
    path — i.e. DWG export/import genuinely isn't available on this
    machine, as opposed to some other conversion failure."""


def _ensure_oda_path() -> None:
    ezdxf.options.set("odafc-addon", "win_exec_path", ODA_EXEC_PATH)
    if not Path(ODA_EXEC_PATH).exists():
        raise ODAConverterMissingError(
            "ODA File Converter not found at the configured path "
            f"({ODA_EXEC_PATH}). DWG export/import needs it installed — see "
            "departments/architecture/reports/cad-tooling-gap-analysis.md "
            "Section 2 for install steps. Say so and stop rather than "
            "silently skipping the DWG output."
        )


def export_dwg(
    source: str | Path | Drawing,
    dwg_path: str | Path | None = None,
    *,
    version: str = "R2018",
    replace: bool = True,
) -> Path:
    """Export a generated DXF (path or an already-open ezdxf Drawing) to
    native DWG via ODA File Converter.

    Args:
        source: path to a .dxf file, or an ezdxf Drawing object already in memory.
        dwg_path: output .dwg path. Defaults to `source` with its suffix
            swapped to .dwg (only valid when `source` is a path).
        version: DWG version key from ezdxf's VERSION_MAP, e.g. "R2018"
            (maps to ACAD2018 / AC1032 — the version confirmed against the
            founder's sample DWG in the gap-analysis report).
        replace: overwrite an existing file at `dwg_path` if True (default;
            ezdxf's own default is False, which is surprising for a
            re-run-friendly generator, so this wrapper flips it).

    Returns:
        The Path to the written .dwg file.
    """
    _ensure_oda_path()

    if isinstance(source, Drawing):
        doc = source
        if dwg_path is None:
            raise ValueError("dwg_path is required when source is a Drawing object (no source filename to derive it from)")
    else:
        dxf_path = Path(source)
        doc = ezdxf.readfile(str(dxf_path))
        if dwg_path is None:
            dwg_path = dxf_path.with_suffix(".dwg")

    dwg_path = Path(dwg_path)
    dwg_path.parent.mkdir(parents=True, exist_ok=True)

    odafc.export_dwg(doc, str(dwg_path), version=version, replace=replace)

    if not dwg_path.exists():
        raise RuntimeError(f"DWG export reported success but {dwg_path} was not created")
    return dwg_path


def read_dwg(dwg_path: str | Path) -> Drawing:
    """Read a native DWG file back via ODA File Converter, returning an
    ezdxf Drawing (the same object type ezdxf.readfile() returns for DXF —
    entities can be queried/compared the same way regardless of which one
    the file started as)."""
    _ensure_oda_path()
    dwg_path = Path(dwg_path)
    if not dwg_path.exists():
        raise FileNotFoundError(dwg_path)
    return odafc.readfile(str(dwg_path))
