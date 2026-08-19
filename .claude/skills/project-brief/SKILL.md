---
name: project-brief
description: Turn architecture project intake into a structured design brief, and generate a schematic floor plan (DXF/SVG) and 3D catalog render when lot/deed data and a room program are available. Use when starting a new architecture client/project.
---

# Architecture Project Brief

Produces a structured brief under `departments/architecture/clients/<slug>/`, per `departments/architecture/CLAUDE.md`.

## Steps

1. **Intake**. Ask for whatever is missing: site/lot details (address, dimensions, orientation, setbacks — from the deed/survey if available), project type, room program (spaces + approximate square footage + adjacencies), budget range, timeline, style/reference preferences. Missing lot geometry or program data blocks floor plan generation — say so rather than guessing.
2. **Slug + folder**. Create `departments/architecture/clients/<slug>/` with a `CLAUDE.md` capturing the intake.
3. **Brief document** (`brief.md`): site summary, program table, relevant zoning/code research (flagged as research to verify), concept narrative, open questions for the client.
4. **If lot geometry + program are available**: generate the schematic floor plan (`cad/<name>.dxf` + `.svg`) per the Floor plan generation section of the department CLAUDE.md.
5. **If a floor plan was generated and a 3D render is requested**: run the Blender + AI-polish pipeline per the department CLAUDE.md's 3D rendering section — flag clearly if Blender isn't installed rather than skipping silently.
6. **Register** the client in `shared/clients.md` (department: Architecture).

## Notes

- Every deliverable that touches the floor plan (brief, DXF/SVG, render) must state it's schematic and needs licensed-architect review before permitting or construction.
- Never fabricate deed/lot dimensions — get them from the client or a real source (survey, public records lookup via WebSearch, clearly cited).
