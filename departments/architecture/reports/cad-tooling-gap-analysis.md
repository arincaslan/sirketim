# CAD Tooling Gap Analysis

**Date**: 2026-08-20
**Scope**: Gap-analysis pass only — no CAD file generated for a real project, no client folder created, `shared/clients.md` untouched. Reference material used: `C:\Users\Semih\Desktop\373-6\` (finished sample DWG, quality-bar reference, different project) and `C:\Users\Semih\Desktop\377-1\` (real intake for the next project, parcel 377 ada 1). Neither Desktop folder was moved; a stray empty folder accidentally created inside `373-6\` during tool testing (`_dxf-export`, from an interactive ODA File Converter dialog, never populated with files) was removed to leave the reference folder as found. The original sample DWG is untouched (28,915,656 bytes, unchanged).

---

## 1. Summary

The department could previously only produce `.dxf`/`.svg` — no native `.dwg`, in or out. That gap is now closed: **ODA File Converter 27.1.0** is installed and empirically confirmed, in both directions, against the exact DWG version (`AC1032` / AutoCAD 2018) used by the founder's sample file. **Poppler 25.07.0** is also installed, unblocking the Read tool on scanned/image PDFs generally — confirmed by successfully reading both previously-unreadable PDFs in `377-1\`. Inspecting the sample DWG's actual contents resolved the open structural-vs-schematic question: it is an **architectural** working-drawing set (floor plans, sections, elevations, door/window schedules, finish specs, furnishing layout), not a structural/rebar drawing, despite the "döşeme revize" filename. No MCP change is needed for any of this. The concrete TAKS/KAKS/height/setback figures for parcel 377/1 are extracted and recorded in Section 4, with one genuine open item flagged rather than guessed: the rear setback (arka bahçe) is blank in both official parcel documents, and the one setback formula found in the district plan notes is textually scoped to mixed-use blocks that 377/1 may not qualify as.

---

## 2. DWG tooling: research, install, verification

### 2.1 Options considered

| Option | Verdict |
|---|---|
| **ODA File Converter** (Open Design Alliance) | Chosen. Free, official, actively maintained, turnkey Windows installer. Per [ezdxf's own odafc addon documentation](https://ezdxf.readthedocs.io/en/stable/addons/odafc.html), it's the standard external tool `ezdxf` itself integrates with for DWG conversion — not a third-party guess. |
| **LibreDWG** (GNU) | Sanity-checked, not installed. Current release (0.13.4, Mar 2026) reads r1.2–r2018 at ~99% per its own docs, but its **writer** is explicitly documented as reliable only up to R2000 — writing R2004+ (which covers our AC1032/R2018 target) is described in its own manual as "ongoing effort," with R2007 writing not implemented. It also has no simple Windows installer (needs building via cmake + MSVC/mingw/clang-cl). For a department that needs to *write* modern DWG reliably today, this is the weaker option. |
| **Autodesk Platform Services (APS) Model Derivative API** | Noted as a cloud-based alternative worth knowing about, not installed or wired up. Would mean sending drawing files to Autodesk's cloud and requires an Autodesk developer account/API credentials — a bigger integration and a data-handling decision, not a local CLI install like the other two. Worth revisiting only if/when the practice standardizes on a cloud CAD platform (this is also already flagged as a possible future connector in `departments/architecture/CLAUDE.md`, under Autodesk Construction Cloud). |

### 2.2 What got installed

- **ODA File Converter 27.1.0** (latest, from the official [opendesign.com/guestfiles/oda_file_converter](https://www.opendesign.com/guestfiles/oda_file_converter) page, MSI verified via download).
- Installed **per-user**, not machine-wide: the default all-users MSI install failed with `Error 1925 — insufficient privileges` (this session doesn't have admin rights). Re-run with `ALLUSERS=2 MSIINSTALLPERUSER=1` succeeded (exit code 0).
- **Actual install path**: `C:\Users\Semih\AppData\Local\Programs\ODA\ODAFileConverter 27.1.0\ODAFileConverter.exe`
- This matters: `ezdxf`'s `odafc` addon defaults to looking for the converter at `C:\Program Files\ODA\ODAFileConverter\ODAFileConverter.exe` (a machine-wide path), which doesn't exist here. Any script using `ezdxf.addons.odafc` on this machine must first do:
  ```python
  ezdxf.options.set('odafc-addon', 'win_exec_path',
      r'C:\Users\Semih\AppData\Local\Programs\ODA\ODAFileConverter 27.1.0\ODAFileConverter.exe')
  ```
  This is a one-time gotcha worth documenting wherever the DWG-export step gets added (see Section 5) so a future session doesn't waste time on a silent "converter not found."
- **Poppler 25.07.0-0** (`oschwartz10612.Poppler` via `winget`), giving `pdftoppm`, `pdftotext`, `pdfinfo`, etc. Installed cleanly, no privilege issue.

### 2.3 AC1032 support — confirmed empirically, both directions, not just from docs

`ezdxf`'s own version-mapping table (`ezdxf/addons/odafc.py`) lists `AC1032` as a first-class, explicitly recognized target (`"AC1032": "ACAD2018"`), and I verified this for real rather than trusting the table alone:

1. **Read direction**: converted the founder's actual sample — `KARAMÜRSEL EREĞLİ373 ADA 6 PARSEL26-11-2026  döşeme revize (1).dwg` (28MB, header-confirmed `AC1032`) — to DXF via `ODAFileConverter.exe <in_dir> <out_dir> ACAD2018 DXF 0 1`, run fully headless. Succeeded, exit code 0. The resulting DXF's `$ACADVER` header variable reads back `AC1032`, i.e. the exact same version round-tripped, not silently downgraded.
2. **Write direction**: generated a trivial test DXF with `ezdxf.new("R2018")` (a few lines, a circle, a text entity), converted it to DWG with the same converter (`... ACAD2018 DWG 0 1`), confirmed the output file's binary header signature is `AC1032` (byte-for-byte matching the sample's format), then read that DWG back with `ezdxf.addons.odafc.readfile()` — entity types and the text content ("SIRKETIM ROUNDTRIP TEST") survived the full round-trip intact.

Both directions work headlessly (no GUI interaction needed once invoked with proper CLI arguments) and both were run against files, not just documentation claims.

**One process note**: my first invocation of `ODAFileConverter.exe` (checking its usage/help with no arguments) launched its interactive GUI instead of printing help text — that's expected behavior for this tool (it's a GUI app with an optional batch-mode CLI signature, not a pure CLI tool), not a bug. All actual conversions in this pass were run with the documented 6-argument batch syntax (`<in_dir> <out_dir> <version> <format> <recurse> <audit>`), which runs headless.

---

## 3. Poppler / pdftoppm — install status

**Installed and confirmed working end-to-end.** `winget install oschwartz10612.Poppler` succeeded cleanly (pulled its `Microsoft.VCRedist.2015+.x64` dependency automatically). Confirmed by directly re-attempting the Read tool on both PDFs that failed in recon before this fix:

- `C:\Users\Semih\Desktop\377-1\imardurumu.pdf` — now reads successfully (2-page scanned zoning-status printout, Turkish text and all, rendered and read).
- `C:\Users\Semih\Desktop\377-1\minuspalityimardurumu.pdf` — now reads successfully (2-page official municipal İmar Durumu letter + stamped plot diagram).

This is a general environment fix, not project-specific — it unblocks the Read tool on any scanned/image-only PDF going forward, for this project and any other department's work.

---

## 4. Sample DWG inspection (`373-6`) — method and findings

### 4.1 Method

Converted the sample DWG to DXF via ODA File Converter (output written to a scratch temp directory, original untouched), then loaded the resulting 199MB DXF with `ezdxf.readfile()` and enumerated its header, layer table, block table, dimension styles, text styles, and every entity in modelspace (type, layer, and — for TEXT/MTEXT/attribute entities — content). Followed up with targeted raw-text searches across the converted DXF for structural-engineering-specific terminology (rebar/reinforcement terms) versus architectural terminology.

### 4.2 Structural-vs-schematic question — resolved

**Finding: this is an architectural (mimari) working-drawing set, not a structural/rebar engineering drawing.** Evidence, factually:

- **Explicit self-labeling found in the drawing's own text**: the string `MiMARİ` (Turkish for "architectural") appears as drawing text content, alongside a block/xref reference named `IDEMIMAR` (apparently an architecture office name) and a layer literally named `'$$ www.PislikMimar.com'` (a Turkish CAD-blocks resource site whose name contains "Mimar" = architect). **Zero** occurrences of `statik` (structural) or `mühendis` (engineer) anywhere in the file.
- **Zero rebar/reinforcement terminology anywhere** in the file: a case-insensitive search for `donatı/donati`, `etriye`, `pas payı`, `hasır çelik`, `nervür` (all standard Turkish structural-detailing terms) returned 0 matches across the entire converted DXF.
- **Layer naming is dominated by the AIA/NCS architectural convention**: `A-WALL`, `A-DOOR`, `A-DOOR-FRAM`, `A-DOOR-GLAZ`, `A-FLOR`, `A-FLOR-HDLN`, `A-FLOR-LEVL`, `A-FLOR-PATT`, `A-ROOF`, `A-CLNG` (ceiling), `A-COLS`, `A-GLAZ`, `C-TOPO` (civil/topography), `L-PLNT` (landscape/planting), `G-ANNO-DIMS`. Of 73 total layers, exactly **one** carries an `S-` (structural) prefix — `S-STRS` — and it has **zero entities anywhere in the file** (confirmed by direct query, modelspace and all paper-space layouts), i.e. it's an unused, inherited template layer, not actual structural content. (Per the NCS convention, "STRS" itself typically denotes *stairs*, not "structure" — consistent with it being unused here since the drawing already has a populated `MERDİVEN` — Turkish for "stairs" — layer with 784 entities.)
- **The single most heavily-used layer in the entire file is furnishing**: `TEFRIS` (Turkish: "furnishing") has 4,029 entities — more than any other layer, including walls (`DUVAR`, 2,163) or doors/windows (`KAPI_PENCERE`, 2,126). The block library includes furnishing/presentation content that would never appear in a structural drawing: named blocks for branded window units (e.g. `ANdersen_Casement_Quadruple_1845`), French-labeled casement window blocks (`3 Vantaux - Droits...`), and even a 3D model block named `Aston_Martin_DBS_6135`.
- **Text content is architectural room/finish/schedule content, not structural calculation content**: room labels (`ANTRE`, `BANYO`, `HOL`, `BODRUM KAT`, floor labels `1.NORMAL KAT`/`2.NORMAL KAT`/`3.NORMAL KAT`), a building-description note reading *"1 bodrum + 1 zemin + 3 normal kat çatı arası piyesi olan b.a karkas yapıda konut inşaatı"* (residential construction, RC frame, basement+ground+3 typical floors+attic), door/window schedule codes (`D1`, `D2`, `K1 100/220`, `M1`–`M6`, standard door sizes like `90X210`), finish callouts (`Alçı Asma Tavan` — gypsum suspended ceiling, `D:SERAMİK`/`D:LAMİNANT` — floor finishes, `Beyaz Mermer Denizlik` — marble windowsill), envelope/detail callouts referencing the Turkish thermal-insulation standard (`TS825 EK.5-...`), and a municipal permit-approval stamp text block (*"...sayılı imar durumuna, imar kanunu ve ilgili mevzuat hükümlerine göre incelenerek onaylanmıştır."* — reviewed/approved per zoning status, naming `KARAMÜRSEL BELEDİYESİ BAŞKANLIĞI`). Slab thickness appears only as a finish-buildup callout (`B.döşeme 15/25/30 cm`, `BETONARME DÖŞEME`) alongside insulation/screed layers (`GROBETON`, `Bitüm emülsiyonu`, `E.polistren köpük`) — i.e. drawn the way an architect draws a wall/floor section for coordination and finish specification, not the way a structural engineer draws a slab (no bar diameters, spacing, or reinforcement schedule anywhere).

**Read on the filename**: "döşeme revize" most likely refers to a *floor/level plan revision*, not a structural slab drawing — the text scan turned up dozens of paired relative/absolute elevation callouts (e.g. `19.70(+0.95)`, `20.47+0.18=20.65(%%P0.00)`), consistent with a revision pass that corrected floor-level (kat kotu) annotations on the architectural plan. This reading is inference from context, not a document field that states it outright — flagged as such rather than asserted as certain.

**Practical implication for the founder's decision**: matching this sample's *file format* (native DWG) is now unblocked (Section 2). Matching its *content depth* — full floor plans + sections + elevations + door/window schedules + finish specs + furnishing layout, formatted for municipal permit submission — is a separate, much larger production scope than what the department's current pipeline is built for. `departments/architecture/CLAUDE.md` currently and explicitly scopes the department to schematic output ("Claude does not produce permit-ready, stamped construction documents"). Closing the *file-format* gap doesn't by itself close that *content-depth* gap — that's a scope decision for the founder, not something resolved by this pass.

### 4.3 Supporting technical detail (for the record)

- Units: `$INSUNITS` = 4 (millimeters), `$MEASUREMENT` = 1 (metric) — consistent with standard Turkish AEC practice.
- 73 layers, 3,795 blocks (1,431 named/non-anonymous), 15 dimension styles (mix of Turkish-labeled styles like `AÇIKALIN_ÖLÇÜ STYLE`, `ÇELEBİ DIŞ ÖLÇÜ`), 38 text styles (mostly Arial/Times/Roman-based, several Turkish-charset-specific like `TÜRKÇE`, `TROMANS`).
- Entity totals in modelspace: 12,200 LINE, 4,219 LWPOLYLINE, 1,997 DIMENSION, 1,665 MTEXT, 1,519 TEXT, 730 INSERT, 495 CIRCLE, 451 HATCH, 371 ARC, 350 3DFACE, 117 WIPEOUT, plus smaller counts of SOLID/ELLIPSE/POINT/LEADER/OLE2FRAME/ATTDEF/SPLINE.

---

## 5. Should `project-brief` be extended, or does this need a new skill?

Read `.claude/skills/project-brief/SKILL.md` directly before concluding. **Recommendation: extend, don't replace.** The skill's existing flow (intake → slug/folder → brief.md → generate DXF/SVG per the department's Floor plan generation section → optional 3D render → register client) doesn't need to change structurally. What's missing is a final optional step: once the schematic DXF exists, export a native `.dwg` copy alongside it via the now-installed ODA File Converter (either the raw CLI batch call, or `ezdxf.addons.odafc.export_dwg()` with the `win_exec_path` override noted in Section 2.2). That's a small, mechanical addition to an existing step, not a new workflow — a new skill would be overkill for what amounts to one extra output format.

This is a recommendation, not something implemented in this pass — the task scope here was gap-analysis, and editing the skill or `departments/architecture/CLAUDE.md` is a separate follow-up (and would also need to decide, with the founder, whether DWG export becomes a default output or an on-request one, and whether it changes anything about the compliance-verification step — it shouldn't, since DXF and DWG carry the same geometry).

---

## 6. MCP status — no change needed for CAD

Confirmed via `claude mcp list` in this session: only `openart` is connected. Nothing about the DWG/DXF gap closed in this pass required or would benefit from an MCP — ODA File Converter and Poppler are both local CLI tools, installed the same way Blender was (a system install, not a connector). OpenArt remains relevant only for the separate 3D-render-polish stage described in `departments/architecture/CLAUDE.md`'s 3D rendering section, and is unrelated to the CAD geometry pipeline this report covers.

---

## 7. Parcel 377/1 (Ereğli Mahallesi, Karamürsel, Kocaeli) — zoning figures on record

All three PDFs in `C:\Users\Semih\Desktop\377-1\` were read directly and in full (`imardurumu.pdf` and `minuspalityimardurumu.pdf` are scanned/image PDFs, now readable end-to-end after the Poppler fix in Section 3; `plannotes.pdf` has a native text layer). This is a **records-only extraction** for whenever real design work starts — no design decisions were made from it in this pass, per the task's scope.

### 7.1 Parcel identification (consistent across both parcel-specific documents)

| Field | Value |
|---|---|
| İl / İlçe / Mahalle | Kocaeli / Karamürsel / Ereğli |
| Ada / Parsel | 377 / 1 |
| Tapu Kütüğü | Ereğli |
| Pafta | G23D04D3D (also written `G23d04d3d`) |
| Kapı No | 78, Selçuk Bey Caddesi (street name shown as "Belirtilmemiş" / not officially designated on the parcel doc) |
| Parsel Alanı (parcel area) | **713.26 m²** — flagged on the document itself: *"Tapu alanı esastır"* (the deed's own figure governs) and separately, footnote 1 warns *"Tapu alanı değildir"* (this GIS-computed figure is not itself the deed area) — i.e. 713.26 m² is the system/GIS figure, and the actual tapu (deed) document's stated area is the legally controlling number. Worth reconciling against the tapu when that's provided. |
| Coordinates (parcel midpoint) | ITRF96 / TM, 3° dilim, D.O.M=30°; Y=471859.39m, X=4507411.51m; 40°42'3.248"N, 29°40'1.315"E |
| Approved plan / date | Karamürsel İlçesi 1/1000 Ölçekli Uygulama İmar Planı, tasdik 13.01.2022 no. 50 |
| Geological zone | ÖA-5.1 |
| Plan Fonksiyonu (zoned use) | Konut Alanı (residential) |
| Source document reference | Karamürsel Belediyesi, İmar ve Şehircilik Müdürlüğü, Sayı E-95870865-310.05-00000179316, tarih 18.06.2026, in response to a 11.05.2026 application |

### 7.2 Building rights / constraints (cross-confirmed identically by both `imardurumu.pdf` and `minuspalityimardurumu.pdf`)

| Constraint | Value | Notes |
|---|---|---|
| **TAKS** (lot coverage ratio) | **0.25** | → max building footprint = 713.26 × 0.25 = **178.32 m²** (derived, not stated as an absolute figure on either document) |
| **KAKS / Emsal** (floor area ratio) | **1.00** | → max total construction area = 713.26 × 1.00 = **713.26 m²** (derived) |
| **Kat Adedi** (number of floors) | **4** | Height is controlled via floor count, not a meter figure — plotted map annotation reads "Yençok=4 kat" |
| **Bina Yüksekliği** (max height, meters) | *Not stated* (blank/dash on both documents) | Consistent with height being governed by Kat Adedi=4 instead |
| **İnşaat Nizamı** (construction order) | **Ayrık** (detached/freestanding) | |
| **Ön Bahçe** (front setback) | **5 m** | |
| **Yan Bahçe / Komşu Mesafesi** (side setback) | **3 m** | |
| **Arka Bahçe** (rear setback) | **Not stated — blank on both official documents.** | See 7.4, this is a genuine open item, not resolved in this pass. |
| Bina Derinliği (building depth) | Not stated (blank) | |
| Gayrimenkulün Cinsi | Arsa (undeveloped land) | |
| Kat alınan imar yolu genişliği (road width used for height/floor calc) | 12 m (Selçuk Bey Caddesi) | Adjacent Rüzgar Sk. shown as 10 m on the plotted map |

### 7.3 Relevant district-wide provisions from `plannotes.pdf` (Karamürsel İlçesi Uygulama İmar Planı Plan Hükümleri, KBBMK:14.07.2015/408, amended KBBMK:17.12.2015/725 and KBBMK:13.04.2017/226)

- **Item 2.3** matches this parcel's exact figures for "TA lejantlı" preferential residential-use areas: *"Konut alanlarında E=0.25/1.00 Hmax=4KAT"* — i.e. TAKS 0.25 / KAKS 1.00 / max 4 floors, the same numbers as the parcel documents. This is corroborating context for why 377/1 carries these specific figures, not a separate constraint.
- **Item 4.2.4** (default floor-to-floor heights, used only where the plan itself doesn't specify greater values): residential zones — ground floor 4.00 m, other floors 3.50 m, basement 4.80 m, mezzanine-ground 6.50 m. Useful later for estimating an approximate building height from Kat Adedi=4 (indicatively ~4.00 + 3×3.50 = 14.50 m above the ground-floor reference, before any roof/attic allowance) — **this is a derived estimate for later design use, not a stated "Yençok" meter figure**, and should be re-derived properly (with the roof-pitch rule in item 4.2.32, max 45% pitch / 5.50 m ridge above top slab) once design actually starts.
- **Item 4.2.20 series** (kotlandırma / grade-reference rules): defines the *procedure* for how a parcel's construction grade (kot) gets established from adjacent road tretuvar (curb) levels or natural grade, depending on slope and frontage conditions — but this is a general procedural rule set, **not a numeric red-grade-line value for this parcel**. Per item 4.1.8, the actual site-specific figure comes from a separate surveyor-prepared *"Yol ve Arsa Kotu Tutanağı (Plankote)"* document, approved by the municipality — **no such document is among the three PDFs provided**. This is a real, outstanding gap (kırmızı kot data), consistent with the department's mandatory intake requirement — flagged here for the record, not resolved.

### 7.4 Open item flagged, not resolved: rear setback (arka bahçe)

Both official parcel documents leave "Arka Bahçe" blank. The district plan notes do contain a rear-setback formula (**item 4.2.10**: rear setback = h/2, with a lookup table giving **6.25 m for 4-story buildings**, reducible to as low as 2 m if needed to keep building depth ≥10 m) — but that item's own text scopes it explicitly to *"konut ve ticaret alanı kullanımında olup üst katları konut olarak kullanılan yapı adaları"* (blocks zoned for **mixed residential-and-commercial** use with residential upper floors). Parcel 377/1's Plan Fonksiyonu is recorded simply as **"Konut Alanı"** (residential only), not "konut ve ticaret" — so it is not established from the documents in hand whether item 4.2.10 governs this parcel as-is, by analogy, or whether a different default applies (general provision 1.1 says matters the local plan notes don't cover fall back to the national *Planlı Alanlar Tip İmar Yönetmeliği*, which has not been read in this pass). **This should be confirmed directly with Karamürsel Belediyesi (or by reading the national type regulation) before rear setback is finalized for design — not guessed.**

---

## 8. Housekeeping

- No files were written under `departments/architecture/clients/`.
- `shared/clients.md` was not touched.
- No CAD file was generated for a real project.
- All conversion/inspection scratch work (converted 199MB DXF, test round-trip files, Python inspection scripts) lives under the session scratchpad, not in the repo or either Desktop reference folder.
- The one accidental artifact in the Desktop reference folder (`373-6\_dxf-export\`, empty) was removed; the original sample DWG is confirmed byte-identical/untouched.
- ODA File Converter 27.1.0 and Poppler 25.07.0 are now real, persistent installs on this machine (not scratch) — available for the next actual session of CAD work.
