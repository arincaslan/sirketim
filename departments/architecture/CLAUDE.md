# Architecture

Real building and interior architecture: floor plans, spatial programs, concept design, and the documentation that surrounds a project.

## Scope — what Claude can and can't do here

Claude assists with:
- Design briefs and room/space programs (requirements, adjacencies, square footage targets)
- Zoning and building-code research (jurisdiction rules, setbacks, occupancy classes) — always flagged as research to verify, not a legal determination
- **To-scale schematic floor plans as real CAD files**, generated programmatically from lot/deed data (dimensions, orientation, setbacks) and the space program — see Floor plan generation below
- **3D massing models and photorealistic-style catalog renders** derived from those same floor plans — see 3D rendering below
- Written specifications and material/finish schedules
- Client-facing documentation: concept narratives, presentation decks, meeting notes
- Reference imagery and mood-boarding via web research

Claude does **not**:
- Produce permit-ready, stamped construction documents — a licensed architect must review, refine, and stamp anything generated here before it's used for permitting or construction
- Substitute for a structural/MEP engineer's calculations

## Site intake — deed & zoning documents (Turkish)

Real projects start from municipal/deed paperwork, usually in Turkish, handed over as a mix of PDF and PNG. Read every provided document directly — both file types, and Turkish text, are readable natively — before generating anything:

- **Tapu (deed) information page** — typically a scanned PNG; confirms the parcel (ada/parsel), lot area, and ownership.
- **İmar durumu / plan notes (zoning status document)** — typically a PDF; states the building rights and hard constraints: **TAKS** (lot coverage ratio), **KAKS / emsal** (floor area ratio), **gabari** (max building height), **çekme mesafeleri** (setbacks — front/side/rear), plus any other plan notes (easements, special conditions).
- **Kırmızı kot (red grade/elevation line)** — the municipality's official reference road/site elevation. Ground-floor level and height calculations must be measured from this datum, not an assumed grade.

Extract every numeric constraint explicitly and list it back at the top of the project brief before designing anything, so it's auditable against the source document. Treat a missing or illegible constraint as a blocker — ask rather than guessing a setback, ratio, or elevation. This intake, plus the room program (spaces, approximate square footage, adjacencies), is what a floor plan is generated from.

## Floor plan generation

Floor plans are generated with Python: **ezdxf** for real, to-scale `.dxf` files (openable in AutoCAD, FreeCAD, and most CAD software) and **svgwrite** for a quick-review `.svg` alongside it. Requires `pip install ezdxf svgwrite` in the environment generating the plan.

Every dimension in the generated plan must trace back to the intake above: lot geometry and orientation from the deed, setbacks/TAKS/KAKS/gabari from the plan notes, ground floor level from the red grade line, and room layout from the program. Treat missing inputs as blockers — ask rather than guessing lot geometry or any zoning number.

Output per project: `clients/<slug>/cad/<name>.dxf` and `.svg`, plus a short note in that client's folder stating these are schematic drawings requiring licensed-architect review before permitting or construction — never claim code compliance or a stamp on generated output.

**Dependencies**: `ezdxf` and `svgwrite` (Python) — already installed in this environment.

## 3D rendering (for sales catalogs)

Two-stage pipeline, in this order:

1. **Geometry — Blender, scripted, local.** Extrude the same floor plan (walls, openings, floor/ceiling slabs) into a basic 3D massing model via Blender's Python API (`bpy`), run headless (`blender --background --python script.py`). This gives accurate, to-scale geometry derived from the actual plan, not a guess. Export as `.blend` and `.glb` for reference/reuse. Render a clean, presentable pass with Blender's Cycles engine as the base image.
   **Blender 4.5 LTS is installed** (`"C:\Program Files\Blender Foundation\Blender 4.5\blender.exe" --background --python <script>.py`, on the user PATH). `bpy` must be imported explicitly in the script — it isn't auto-imported.
2. **Polish — AI image enhancement.** Use the Blender render as a reference/base and **OpenArt** (MCP connector, see `../advertising/CLAUDE.md`) to produce the final photorealistic catalog image (materials, lighting, staging). Registered in `.mcp.json` and granted to the `architecture-assistant` subagent's tools; check `claude mcp list` in the current session before assuming it's live — approval is per-session, not global.

Never present a render as a substitute for a licensed architect's drawings; it's sales/marketing collateral derived from the schematic plan.

**Output**: `clients/<slug>/renders/<name>.blend`, `.glb`, and final catalog images.

## Compliance verification (mandatory, before delivering any CAD/render output)

This is schematic work, but it must never contradict the founder's own source documents — there's no room for a setback, ratio, or height that quietly doesn't match the intake. Before calling a floor plan or render finished, re-derive every key figure from the generated DXF/SVG and check it explicitly against the constraint list from intake:

- Lot coverage used vs. the TAKS limit
- Total floor area vs. KAKS/emsal
- Building height vs. gabari
- Each setback (front/side/rear) vs. its stated minimum
- Ground floor level vs. the kırmızı kot (red grade line) datum

Fix any conflict before delivering. State the check results plainly in the client's project notes (pass/fail per item, not just "looks fine") — this is what makes the output auditable, not just asserted.

## Design rationale (required deliverable, alongside CAD/render output)

Every project also gets a short written rationale — `clients/<slug>/notes/rationale.md` — explaining the design in plain language: why the building is oriented and placed as it is, how the room program maps onto the lot, and specifically how each municipal constraint (setbacks, TAKS/KAKS, gabari, red grade line) shaped the design decisions, plus any tradeoffs made. This is what turns a set of drawings into something the founder can defend to a client or reviewer, not just a CAD file with no explanation behind it.

## Recommended connectors

- **OpenArt MCP** — render-polish stage above. Configured (`.mcp.json`), granted to this subagent; approval is per-session, check `claude mcp list` (see root `CLAUDE.md`).
- **Google Drive or Dropbox** (not yet configured) — the practical handoff point for CAD/BIM files and drawing sets a human is producing in native software
- **Autodesk Construction Cloud API** (not yet configured) — worth wiring up if/when the practice standardizes on Revit + ACC for project data and issue tracking

## Conventions

- One client = one folder under `clients/<slug>/` with a `CLAUDE.md` for project-specific context (site, program, constraints, jurisdiction).
- Register every new client/project in `../../shared/clients.md`.
- Use the `architecture-assistant` subagent for this department's work.
