---
name: project-brief
description: Turn architecture project intake into a structured design brief, and generate a schematic floor plan (DXF/SVG) and 3D catalog render when lot/deed data and a room program are available. Use when starting a new architecture client/project.
---

# Architecture Project Brief

Produces a structured brief under `departments/architecture/clients/<slug>/`, per `departments/architecture/CLAUDE.md`.

## Steps

1. **Intake**. Ask for whatever is missing: site/lot details (address, dimensions, orientation, setbacks — from the deed/survey if available), project type, room program (spaces + approximate square footage + adjacencies), budget range, timeline, style/reference preferences, and **which depth tier the deliverable needs — schematic or full production set** (see the department CLAUDE.md's "Floor plan generation" section for what each includes). Missing lot geometry or program data blocks floor plan generation — say so rather than guessing. If full depth is requested: say plainly that only the schematic tier is actually built today (`schedule.py` / `elevation.py` / `section.py` / `finishes.py` / `furnishing.py` are roadmapped, not built — see `departments/architecture/lib/cadgen/`) — confirm with the client/founder whether schematic now is acceptable rather than silently under-delivering against a full-depth request.
2. **Slug + folder**. Create `departments/architecture/clients/<slug>/` with a `CLAUDE.md` capturing the intake (including the depth tier).
3. **Brief document** (`brief.md`): site summary, program table, relevant zoning/code research (flagged as research to verify), concept narrative, open questions for the client.
4. **If lot geometry + program are available**: generate the schematic floor plan using `departments/architecture/lib/cadgen` (not freehanded):
   - Build a `cadgen.plan.LotGeometry`, `cadgen.plan.ZoningConstraints` (+ `cadgen.plan.Setbacks`), and a `cadgen.plan.RoomSpec` list from the intake. Each of these requires a `source_note` field citing the actual deed/plan-notes document it came from — never fill one in with a guess; a missing figure is a blocker, not a default.
   - Call `cadgen.plan.generate_plan(...)` to get a `Building`, then `cadgen.plan.render_dxf(...)` and `cadgen.plan.render_svg(...)` to write `cad/<name>.dxf` + `.svg`.
   - Run `cadgen.plan.verify_compliance(...)` against the generated DXF and the same constraints — this is the department's mandatory Compliance verification step, not optional. Fix any conflict before delivering; record the pass/fail results (per check, not just "looks fine") in the client's notes.
   - If a native `.dwg` is needed, export one alongside via `cadgen.export_dwg.export_dwg(...)`.
   - `departments/architecture/lib/cadgen/examples/synthetic_lot_demo.py` is a worked, runnable example of this whole call sequence end to end (against a synthetic lot, not a real client) — use it as a reference.
5. **If a floor plan was generated and a 3D render is requested**: run the Blender + AI-polish pipeline per the department CLAUDE.md's 3D rendering section — flag clearly if Blender isn't installed rather than skipping silently.
6. **Register** the client in `shared/clients.md` (department: Architecture).

## Notes

- Every deliverable that touches the floor plan (brief, DXF/SVG, render) must state it's schematic and needs licensed-architect review before permitting or construction.
- Never fabricate deed/lot dimensions — get them from the client or a real source (survey, public records lookup via WebSearch, clearly cited).
- Never draw approval-stamp language or graphics anywhere on a generated drawing — see the department CLAUDE.md's "Approval-stamp prohibition". `cadgen.titleblock` enforces this in code for anything generated through the library, but the same discipline applies to any hand-written drawing notes too.
