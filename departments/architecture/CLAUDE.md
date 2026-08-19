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

## Floor plan generation

Floor plans are generated with Python: **ezdxf** for real, to-scale `.dxf` files (openable in AutoCAD, FreeCAD, and most CAD software) and **svgwrite** for a quick-review `.svg` alongside it. Requires `pip install ezdxf svgwrite` in the environment generating the plan.

Inputs needed from the client/deed to produce a plan: lot dimensions and orientation, setback requirements, and the room program (spaces, approximate square footage, adjacencies). Treat missing inputs as blockers — ask rather than guessing lot geometry.

Output per project: `clients/<slug>/cad/<name>.dxf` and `.svg`, plus a short note in that client's folder stating these are schematic drawings requiring licensed-architect review before permitting or construction — never claim code compliance or a stamp on generated output.

**Dependencies**: `ezdxf` and `svgwrite` (Python) — already installed in this environment.

## 3D rendering (for sales catalogs)

Two-stage pipeline, in this order:

1. **Geometry — Blender, scripted, local.** Extrude the same floor plan (walls, openings, floor/ceiling slabs) into a basic 3D massing model via Blender's Python API (`bpy`), run headless (`blender --background --python script.py`). This gives accurate, to-scale geometry derived from the actual plan, not a guess. Export as `.blend` and `.glb` for reference/reuse. Render a clean, presentable pass with Blender's Cycles engine as the base image.
   **Requires Blender installed locally — it is not currently installed on this machine.** Install it (free, from blender.org) before this stage is usable; flag this to the founder rather than silently skipping it.
2. **Polish — AI image enhancement.** Use the Blender render as a reference/base and an AI image-generation connector to produce the final photorealistic catalog image (materials, lighting, staging). This connector isn't configured yet — see below.

Never present a render as a substitute for a licensed architect's drawings; it's sales/marketing collateral derived from the schematic plan.

**Output**: `clients/<slug>/renders/<name>.blend`, `.glb`, and final catalog images.

## Recommended connectors (not yet configured)

- **Google Drive or Dropbox** — the practical handoff point for CAD/BIM files and drawing sets a human is producing in native software
- **Autodesk Construction Cloud API** — worth wiring up if/when the practice standardizes on Revit + ACC for project data and issue tracking
- **AI image-generation API** (e.g. Stable Diffusion or similar) — needed for the render-polish stage above; needs an account/API key

## Conventions

- One client = one folder under `clients/<slug>/` with a `CLAUDE.md` for project-specific context (site, program, constraints, jurisdiction).
- Register every new client/project in `../../shared/clients.md`.
- Use the `architecture-assistant` subagent for this department's work.
