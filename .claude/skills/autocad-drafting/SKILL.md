---
name: autocad-drafting
description: AutoCAD and DWG production knowledge for Turkish architectural drawing sets. Covers units and scale, layer conventions (AIA/NCS and Turkish office names), annotation sizes, dimension and level (kot) conventions, Turkish characters in fonts, blocks and attributes, xrefs, layouts and viewports, plotting (CTB/STB), DWG versions and ODA conversion, and generating .scr scripts and AutoLISP for the founder to run. Also covers the autocad MCP server (headless now, live AutoCAD later) and the whole-sheet visual QA every drawing must pass. Use when producing, reviewing, converting or scripting any DWG/DXF, or when the founder asks how to do something in AutoCAD.
---

# AutoCAD drafting for the architecture department

Read `departments/architecture/CLAUDE.md` first. Two rules from it apply here too:
- No approval-stamp language on any drawing.
- Everything is schematic and needs licensed-architect review.

## 1. Which tool does what

| Job | Tool |
|---|---|
| Generate plans, schedules, elevations, sections, parking, calc tables | `lib/cadgen` (ezdxf), with its mandatory `verify_*()` pass |
| DXF ↔ DWG | `lib/cadgen/export_dwg.py` (ODA File Converter, per-user install, path per machine) |
| Inspect any DXF: units, extents, stray objects, layers, labels, rooms | `autocad` MCP → `drawing_open` + `drawing_understand` |
| **See the whole sheet** | `autocad` MCP → `view_screenshot` (PNG) or `drawing_export_pdf` |
| Lint a drawing | `autocad` MCP → `drawing_critique` (see the caveats in §8) |
| Read a DWG someone else made | Convert to DXF first (`export_dwg.read_dwg()` or the ODA CLI). The headless MCP refuses `.dwg` input. |
| Work inside a live AutoCAD session | Not available yet. Two routes, depending on the edition bought:<br>• Full AutoCAD: the same `autocad` MCP on its COM backend.<br>• AutoCAD LT 2024+: `puran-water/autocad-mcp`, which uses file IPC and a LISP dispatcher.<br>Never use an AutoCAD MCP that serves HTTP without Origin validation and auth; `felixalmesberger/AUTOCAD-MCP` is one. See `departments/architecture/reports/cad-ai-tooling-2026-10.md` §2.A and §2.D. |
| Something the founder will run in their own AutoCAD | Generate a `.scr` or `.lsp` (see `reference/scripting.md`) |

The `autocad` MCP is `autocad-mcp-pro` 1.6.0, headless ezdxf engine, packs `core,arch`.
- It may open files only under the user's profile and the project directory (`ALLOWED_PATHS`).
- It writes DWG only when ezdxf can find the ODA converter. Set that per machine in `%USERPROFILE%\.config\ezdxf\ezdxf.ini` (see `SETUP.md`).

## 2. Units and scale

Draw in model space at 1:1, in real units. **Declare the units** in `$INSUNITS`: 4 = mm, 5 = cm, 6 = m.

- `lib/cadgen` draws in **metres** (`INSUNITS 6`).
- The founder's 373-6 reference set is in **millimetres** (`INSUNITS 4`). Turkish offices commonly draw in cm or mm.
- A metre drawing pasted, inserted or xref'd into a mm drawing comes in 1000× too small unless both files declare their units. Ask what the receiving office uses before delivering, and convert if needed: scale the geometry and reset `INSUNITS`. Don't only relabel it.
- Sanity-check any unfamiliar drawing against something with a known size. A door leaf is about 0.80–1.00 m. `drawing_understand` does this and reports declared versus inferred units.

**Common Turkish architectural scales:**
- site plan (vaziyet): 1/500, sometimes 1/200 or 1/1000
- permit and preliminary plans: 1/100, sometimes 1/200
- working drawings (uygulama): 1/50
- details: 1/20, 1/10, 1/5, 1/1

Check the municipality's and the brief's requirements for each submission.

## 3. Annotation sizes

Text is specified by its plotted height:
- 2.5 mm for general notes and dimensions
- 3.5 mm for room names
- 5–7 mm for titles

These come from the ISO 3098 series (1.8, 2.5, 3.5, 5, 7, 10 mm).

**Model-space height = plotted height × scale denominator, in drawing units.** For 2.5 mm at 1:100:

| Drawing units | Model-space height |
|---|---|
| mm | 250 |
| cm | 25 |
| m | 0.25 |

**Known defect, found 2026-10-05:** `lib/cadgen` dimensions render with 1.0 m text, which plots at 10 mm at its own 1:100 title-block scale. That is four times the 2.5 mm standard and four times its 0.24 m room labels. The rendered synthetic plan shows it plainly. It is not fixed yet; the fix belongs in `plan._add_dimensions()` as a dimstyle override and needs founder approval while architecture CAD work is paused. Until then, mention it on any delivered sheet.

## 4. Layers

- **Naming:** AIA/NCS discipline-major-minor names, as `lib/cadgen` writes them: `A-WALL`, `A-WALL-INTR`, `A-GLAZ`, `A-ANNO-DIMS`, `A-ANNO-TTLB`. The 373-6 reference mixes AIA names (`A-DOOR`, `A-FLOR-LEVL`, `C-TOPO`, `L-PLNT`) with Turkish office names. ISO 13567 is the international naming standard.
- **Typical Turkish office equivalents.** These are a convention, not a standard, so match the office you deliver to:

| AIA/NCS | Turkish office name |
|---|---|
| A-WALL | DUVAR |
| A-DOOR / A-GLAZ | KAPI_PENCERE (or KAPI, PENCERE) |
| A-FURN | TEFRIS |
| A-FLOR-STRS | MERDIVEN |
| S-COLS | KOLON |
| S-BEAM | KIRIS |
| A-GRID | AKS |
| A-ANNO-DIMS | OLCU |
| A-ANNO-TEXT | YAZI |
| A-PATT | TARAMA |
| A-ROOF | CATI |
| A-ANNO-SYMB (level marks) | KOT |

  373-6 uses DUVAR, KAPI_PENCERE, TEFRIS and MERDİVEN. Its TEFRIS layer was the busiest in the file (4,029 entities).
- **Hygiene:**
  - No geometry on layer `0` (except inside block definitions) or on `Defpoints`, which never plots.
  - Colour, linetype and lineweight should be ByLayer.

## 5. Lineweights, plotting, sheets

- **ISO 128 pen series (mm):** 0.13, 0.18, 0.25, 0.35, 0.50, 0.70, 1.00, 1.40, 2.00.
- **Usual architectural hierarchy:**
  - cut walls and columns: 0.50–0.70
  - visible edges beyond the cut: 0.25–0.35
  - furniture, hatch and minor lines: 0.13–0.18
  - dimensions and text: 0.18–0.25
- **Plot styles.** Turkish offices usually plot with a **CTB**: colour index → pen weight. That makes layer colours meaningful. An **STB** is the alternative: named styles. Get the receiving office's CTB with their DWG rather than inventing one.
- **Plotting:** PDF via the "DWG To PDF.pc3" plotter. `PUBLISH` batch-plots every layout.
- **ISO sheet sizes (mm):** A0 841×1189, A1 594×841, A2 420×594, A3 297×420, A4 210×297.
- **Layouts:**
  - One layout per sheet, named by sheet number (`A-101` …). 377/1's consolidated DWG had 19.
  - Title block in paper space at 1:1 mm.
  - Viewports at a standard scale and locked.
  - Use per-viewport layer freezing (`VPLAYER`) instead of duplicating geometry.

## 6. Dimensions, levels, openings (Turkish conventions)

- **Copy the receiving office's dimension style.** Read a reference DWG's `DIMSTYLE` before generating: `DIMLUNIT`, `DIMDEC`, `DIMDSEP`, `DIMLFAC` and `DIMTXT`.
  - `DIMLFAC` lets a mm drawing print cm values (0.1).
- **Decimal separator.** Turkish uses a comma, so `DIMDSEP` is ",". `lib/cadgen` writes "9,25". ISO 80000-1 allows a comma. The MCP's `drawing_critique` flags it as an ISO 129 warning, which is **not a defect in a Turkish set**.
- **Opening sizes** are written as width and height in cm, as 373-6 writes them: "K1 100/220", "90X210".
- **Levels (kot)** are in metres with two decimals:
  - ±0.00 is the ground-floor finished floor.
  - Show both relative and absolute levels where the set needs them; 373-6 uses pairs like "19.70(+0.95)".
  - The absolute datum comes from the kırmızı kot or plankote. Without one, say the datum is a placeholder.
- **Grids (akslar):** letters in one direction, numbers in the other. Bubbles go outside the building on the dimension lines.

## 7. Text and Turkish characters

- **Fonts.** Many SHX fonts (`txt.shx`, `romans.shx`) have no ğ, ş, ı or İ and print "?". Use a TrueType style (Arial) or a Turkish-capable SHX. 373-6 carries "TÜRKÇE" and "TROMANS" styles, almost certainly for this reason.
- **DXF encoding.** R2007-and-later DXF is UTF-8; `lib/cadgen` writes R2018. Saving down to R2004 or older switches to a code page (`ANSI_1254` for Turkish), and characters can break, so check after any save-down.
- **Changing case in code.** Python's case mapping is not Turkish. `"Giriş".upper()` gives "GIRIŞ", not "GİRİŞ". `"Kiler".upper()` gives "KILER". `"IŞIK".lower()` gives "işik", not "ışık". Map `i↔İ` and `ı↔I` explicitly before changing the case of any generated label. These outputs were checked on 2026-10-05.

## 8. Using the `autocad` MCP well (tested 2026-10-05 on lib/cadgen output)

- **Open, then understand.** `drawing_open(path)` then `drawing_understand()` returns:
  - declared vs inferred units, with evidence
  - extents and outliers, by handle
  - clusters (plan copies, sheets)
  - layers by discipline
  - labels

  Run it on every foreign drawing before trusting a single dimension.
- **Look at the sheet.** `view_screenshot()` renders a PNG headlessly. **Look at every sheet before calling it done**, because component checks miss composition problems. That is how the 10 mm dimension text above was found.
- **Units for the `arch_*` tools.** They assume **millimetre** drawings. On a metre-unit `lib/cadgen` plan, `arch_rooms_detect` found 0 rooms, even with its area and tolerance scaled down. For our own output, `lib/cadgen`'s `verify_*()` functions are authoritative. Use `arch_*` on mm drawings such as 373-6-style sets.
- **`drawing_critique` is a lint, not a gate for our sets.** Read each warning against these conventions.
- **DWG.**
  - Input: the headless engine refuses `.dwg`. Convert first.
  - Output: `drawing_export_dwg` works only when the ODA converter is configured for ezdxf.
- **Safety.**
  - `system_run_command` and `system_run_lisp` are a denylist guardrail, not a security boundary. Never set `DANGEROUS_COMMANDS_ENABLED`.
  - Never widen `ALLOWED_PATHS` past the user profile and the project directory.
  - Never point the server at the repo's `.env`-style secrets.

## 9. DWG versions and conversion

- **Header codes:**
  - AC1015 = R2000
  - AC1018 = 2004
  - AC1021 = 2007
  - AC1024 = 2010
  - AC1027 = 2013
  - AC1032 = 2018 format
- 373-6 and our ODA exports are AC1032. Save down only when a recipient asks, then re-check the Turkish text.
- ODA File Converter batch syntax (runs headless): `ODAFileConverter.exe <in_dir> <out_dir> ACAD2018 DWG|DXF <recurse 0|1> <audit 0|1>`. Running it with no arguments opens its GUI.
- Verify by reading the result back: `export_dwg.read_dwg()` or `ezdxf.readfile()`. Check layouts and entity counts rather than trusting the write.

## 10. Blocks, attributes, xrefs

- **Blocks for doors, windows and furniture** carry attributes: mark, size, type. Title blocks use attributes too.
  - ezdxf can define `ATTDEF`s and insert blocks with values.
  - It **cannot author dynamic-block parameters**; those are AutoCAD-only. Insert an existing dynamic block from the office's library instead.
- **Xrefs.**
  - Use Overlay for references that shouldn't nest, Attach for those that should.
  - Use relative paths.
  - Before sending a set, `BIND` it or package it with `ETRANSMIT` so the recipient doesn't get missing references. A consolidated multi-layout DWG (the 377/1 approach) avoids xrefs entirely.

## 11. QA before any DWG/DXF leaves the department

1. **Units:** `$INSUNITS` is declared and matches the recipient. Check one known dimension.
2. **Extents:** nothing stray far from the drawing (`drawing_understand` outliers, or `ZOOM` → Extents).
3. **Clean file:** run `AUDIT` and `PURGE`. Nothing on layer 0 or Defpoints, and properties are ByLayer.
4. **Turkish text** renders with no "?" and correct casing (§7).
5. **Every sheet** has a title block, a scale note and the schematic disclaimer. `titleblock.scan_dxf_for_stamp_language()` finds 0 hits.
6. **Every sheet rendered and looked at as a whole:** text size against the scale, overlaps, empty or clipped viewports.
7. **Delivered file read back:** layouts are present and none is empty.

Commands the founder may need are in `reference/commands.md`. Script and AutoLISP generation rules are in `reference/scripting.md`.
