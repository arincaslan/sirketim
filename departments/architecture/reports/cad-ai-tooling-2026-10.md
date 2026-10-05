# Architecture AI tooling: free tier built, paid tier for decision

**Date:** 2026-10-05
**Asked for:** "I want our architecture team to have architectural and AutoCAD knowledge with skills and MCPs. Start with the free ones, then the priced ones."
**Status:** The free tier is built, tested and wired in. **Nothing has been bought.** Every priced item below needs a founder decision, and a ledger row the day money moves.

Prices come from web searches on 2026-10-05. autodesk.com was unreachable from the session that wrote this, so these are reseller and aggregator figures. Turkish prices follow the exchange rate. Confirm at checkout.

---

## 1. What was built (free)

| Piece | What it gives the department | Verified how |
|---|---|---|
| Skill `architecture-expertise` (added the same day, at the founder's direction that this is about the team's expertise, not one parcel) | General knowledge base in nine reference files: design process and critique, building types, ergonomics, Turkish construction, building physics, structure/services/fire/access, interiors, Turkish practice and cost, and one dated regulation table | Regulation figures re-checked by search on 2026-10-05, with a status label on each; professional rules of thumb labelled as such |
| Skill `zoning-compliance-tr` | The method the 377/1 rejection showed was missing. Every plan-note item gets a disposition, applicability is tested in a fixed order, every article is quoted from text read that session, and there's a constraint-ledger format. Also a source index with verified mevzuat.gov.tr numbers (Planlı Alanlar 23722, Otopark 24408, Yangın 200712937, TBDY 24468, Sığınak 4883, Enerji 13594, 3194 İmar Kanunu, büyükşehir regulations). | MevzuatNo values taken from the URLs mevzuat.gov.tr itself serves |
| `parcel_to_local.py` (in that skill) | TKGM Parsel Sorgu GeoJSON → lot outline in local metres, frontage on +x, with an area cross-check. Replaces the estimated 36.02 × 19.80 m rectangle 377/1 was drawn on. | Reproduces 377/1's official imar durumu coordinates (Y=471859.39, X=4507411.51) within 1 cm. Synthetic rectangle comes back exact; a trapezoid is flagged, not forced. |
| Skill `design-reasoning` | The other half of the rejection, "no defensible reasoning behind core placement". At least three real schemes scored against weighted criteria, section checks (stair, ramp, heights), TBDY irregularity awareness, and decision-record template. | Content cross-checked against 377/1's own recorded facts |
| Skill `autocad-drafting` (+ `reference/scripting.md`, `reference/commands.md`) | AutoCAD knowledge: units, layer names (AIA ↔ Turkish office), annotation sizes, kot and dimension conventions, Turkish fonts and case mapping, DWG versions, `.scr`/AutoLISP generation rules, and the pre-delivery QA list | Turkish case-mapping pitfalls run in Python. The AutoLISP examples are **untested inside AutoCAD** and say so. |
| MCP `autocad` (`autocad-mcp-pro` 1.6.0, MIT, headless) | Open, understand (units, extents, stray objects), **render sheets to PNG/PDF**, lint and query any DXF. No AutoCAD licence needed. The same server drives live AutoCAD later (§2). | Started by Claude Code from the repo's `.mcp.json`. Opened, understood and rendered a `lib/cadgen` plan. Path scoping rejected a file outside `ALLOWED_PATHS`. |
| MCP `blender` (`mcp-for-blender` 2.1.3, MIT) | Interactive Blender with viewport screenshots, alongside the headless `bpy` route. Blender 4.5 is already installed. | Started by Claude Code from the repo config. Telemetry kill switch confirmed in the source. Safe mode on. Needs Blender open with the addon, which this container doesn't have. |
| Free viewer, no install needed by us | **DWG TrueView** (Autodesk, free, Windows) lets the founder open, measure, plot and save DWGs to other versions without any AutoCAD licence | Download listings for the 2026 version |

**The first real finding from the new tools.** Rendering the regression harness's plan through the `autocad` MCP showed `lib/cadgen` dimension text at 1.0 m. At the sheet's own 1:100 scale that plots at 10 mm, four times the 2.5 mm standard. The component checks had never caught it, because none of them looks at the whole sheet. It is not fixed, because architecture CAD work is paused pending the founder's review (dashboard task 128). The fix is a one-function dimstyle override and needs a yes.

**Considered and not wired:**
- **`mevzuat-mcp`** (Turkish legislation search): its GitHub repo returned 404 today, PyPI's 0.3.0 is a year old and drives Playwright and Chromium, and its free hosted endpoint couldn't be reached from the cloud container to test. The skill's source index plus WebFetch covers the same need without an unmaintained dependency. Worth one test from the founder's machine (`claude mcp add --transport http mevzuat https://mevzuat.surucu.dev/mcp`). If it answers, it can be added in five minutes.
- **`freecad-mcp`, `ifc-mcp`:** free BIM tools with no current use. Revisit when an IFC model arrives.

## 2. Priced options

### A. A live AutoCAD seat (the only paid item with a clear payoff)

This is what turns "the agent prepares DXF/DWG for the founder" into "the agent works inside the drawing the founder has open". It also means:
- reading DWG directly instead of converting through ODA
- using the office's dynamic blocks and CTB
- seeing drawings exactly as the municipality and other architects do

| Edition | Price | MCP that can drive it |
|---|---|---|
| **AutoCAD (full), Windows** | US list ~$2,095–2,310/yr, or ~$260/mo. Turkey resellers: **~120,924 ₺/yr** (356,298 ₺ for 3 years). | **The `autocad` server already configured**: set `AUTOCAD_MCP_BACKEND=com` and add the `[com]` extra. Free, and its 1.6 paths were run against live AutoCAD 2026 by its author. Optionally the **AUTOM8LABS MCP Connector**, an Autodesk App Store plugin: free read-only edition with no expiry, Pro £10/seat/mo or £100/seat/yr; full AutoCAD only. AutoCAD 2027 also ships Autodesk Assistant with a **read-only MCP technology preview** inside AutoCAD, included in the subscription. |
| **AutoCAD LT, Windows** | US ~$480–540/yr. Turkey resellers: **~33,309–39,497 ₺/yr** (annual only); 103,051 ₺ for 3 years. | No COM automation, so the configured server can't drive it, and .NET plugins like AUTOM8LABS don't load. The only route is `puran-water/autocad-mcp`: free and MIT, it dispatches AutoLISP over file IPC on LT 2024+. Its maintainer has since folded it into their PuranOS monorepo, so the standalone repo is a point-in-time reference. |

**Recommendation.** First decide whether anyone at Sirketim will open and edit DWGs in AutoCAD regularly.
- **If not:** buy nothing. Generation is headless, the `autocad` MCP renders and checks sheets, and DWG TrueView covers viewing and printing.
- **If yes:** buy **full AutoCAD, not LT**. LT costs about 81–88k ₺/yr less, but it leaves the agents with the weakest automation path. Full AutoCAD reuses the server already configured, at no extra software cost.

### B. Alternatives (not recommended now)

| Option | Price | Why not now |
|---|---|---|
| **BricsCAD** Lite / Pro (perpetual, DWG-native, LISP + COM) | Lite ~£649; Pro ~$1,752 / £1,356, perpetual | Cheapest one-off route to a live DWG editor, but the `autocad` server's own README says non-AutoCAD COM targets (BricsCAD, ZWCAD, GstarCAD) are **unverified** |
| **Revit 2027** + Autodesk's **Revit Public MCP Server** (official, tech preview, read + "Trusted-Write" tools) | ~$3,005/yr, $380/mo (Revit LT ~$560/yr) | A switch to BIM. Turkish municipal submissions and the founder's 373-6 reference are DWG sets. Revisit only if hiring architects who work in Revit. |
| **Archicad** + community Tapir MCP servers | Turkey reseller: Collaborate ₺100,418 + KDV/yr; Studio from €1,632/yr | Same BIM-switch argument. Archicad is common among Turkish architects, so it's relevant only if a hire brings it. |
| **Rhino 8** + rhinomcp | $995 perpetual | For free-form and massing studies. The residential work does not need it. |
| **Autodesk Platform Services** (Design Automation for AutoCAD in the cloud) | Not costed: autodesk.com was unreachable | AutoCAD without a desktop seat, but it sends drawings to Autodesk's cloud. A data-handling decision, not just a price. |
| **mcp-for-blender Premium** (AI 3D model generation in Blender) | Not costed | OpenArt (already paid) covers render polish. Props are not the bottleneck. |

### C. What no tool replaces

Every drawing this department produces is schematic. A licensed architect must still review and stamp anything used for a permit. That is a professional fee, not a software line, and it belongs in a project budget, not here.

## 3. One-time setup on each PC (no cost; also in `SETUP.md`)

1. Install uv: `winget install astral-sh.uv`. Both new servers run through `uvx`.
2. Point ezdxf at the ODA converter so the `autocad` server can write DWG. Create `%USERPROFILE%\.config\ezdxf\ezdxf.ini`:
   ```
   [odafc-addon]
   win_exec_path = "C:\Users\<name>\AppData\Local\Programs\ODA\ODAFileConverter 27.1.0\ODAFileConverter.exe"
   ```
   Use that machine's own path; `win10` and `Semih` differ.
3. Install the Blender addon once: `uvx mcp-for-blender@2.1.3 install-addon`.
4. For the parcel script: `pip install pyproj`.
5. Restart Claude Code and approve the two new servers in `/mcp`.

## 4. Network note

The cloud container that built this could not reach these hosts:
- mevzuat.gov.tr
- mevzuat.surucu.dev
- TKGM
- blender.org
- freecad.org
- autodesk.com

So live calls against those were not made from here. PyPI and GitHub were reachable, which is how the servers were installed and exercised.
