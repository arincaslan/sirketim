# AutoCAD commands an architect reaches for

Every command below is standard AutoCAD. Use it to answer "how do I … in AutoCAD", and use it to write `.scr`/`.lsp` steps (add the `_` prefix in scripts). Commands marked † are full-AutoCAD only, or limited in LT. Check before telling an LT user to rely on one.

## File health

| Command | Use |
|---|---|
| `AUDIT` | Finds and fixes database errors in the open drawing. Run it before delivering and after receiving a file. |
| `RECOVER` | Opens a damaged drawing and repairs it. |
| `PURGE` / `-PURGE` | Removes unused layers, blocks, styles and regapps. Use `-PURGE _All * _No` in scripts. |
| `OVERKILL` | Deletes duplicate and overlapping lines. Generated or exploded geometry often has them. |
| `ZOOM` → `Extents` | Shows everything in the drawing. Stray objects far away show up here, and they break plotting and zoom. |
| `UNITS` / `INSUNITS` | Show and set drawing units. See SKILL.md §2. |
| `SAVEAS` | Change the DWG version (save down) when a recipient needs an older one. |

## Layers and selection

| Command | Use |
|---|---|
| `LAYER` / `-LAYER` | Layer manager, or its scriptable form. |
| `LAYMRG`, `LAYDEL` | Merge layers into one, or delete a layer and everything on it. |
| `LAYISO`, `LAYUNISO` | Isolate a layer to inspect it. |
| `QSELECT`, `FILTER`, `SELECTSIMILAR` | Select by property. For example, every TEXT on A-ANNO-TEXT taller than 0.3. |
| `MATCHPROP` | Copy properties from one object to others. |
| `SETBYLAYER` | Reset colour, linetype and lineweight to ByLayer. |

## Geometry editing (plans)

| Command | Use |
|---|---|
| `OFFSET` | Wall thickness from a centre or face line. |
| `FILLET` with radius 0 | Clean wall corners. |
| `TRIM`, `EXTEND`, `BREAK`, `JOIN`, `PEDIT` | Edit wall lines; join lines into polylines. |
| `STRETCH` | Move a wall and keep the lines attached to it. |
| `ARRAY`, `COPY`, `MIRROR`, `ALIGN` | Repeat units or stacks. Mirror unit plans. |
| `BOUNDARY` (`BPOLY`) | Pick inside a room and get its outline as a closed polyline, for area work. |
| `REVCLOUD` | Revision clouds. |
| `WIPEOUT` | Mask geometry behind labels. |

## Measurement and areas

| Command | Use |
|---|---|
| `AREA`, `MEASUREGEOM`, `LIST`, `DIST` | Measure areas and distances. The result is in drawing units (see SKILL.md §2). |
| `FIELD` | Put a live area field in a room tag. It updates when the outline changes. |
| `DATAEXTRACTION`† | Tabulate block attributes or areas into a table or CSV. |
| `TABLE` | Area tables and schedules on the sheet. |

## Annotation

| Command | Use |
|---|---|
| `DIMSTYLE`, `STYLE` | Dimension and text styles. Use a TrueType font for Turkish characters (SKILL.md §7). |
| `DIMLINEAR`, `DIMCONTINUE`, `DIMBASELINE`, `QDIM` | Dimension strings. |
| `DIMREASSOCIATE` | Re-attach dimensions to geometry after edits. |
| `MLEADER`, `MTEXT`, `TEXTEDIT` | Notes and callouts. |
| `ANNOTATIVE` property, `ANNOAUTOSCALE` | Annotative text and dimensions, scaled per viewport. |
| `ATTDEF`, `BATTMAN`, `ATTEDIT` / `-ATTEDIT` | Block attributes: door/window marks, title-block fields. |

## Blocks and references

| Command | Use |
|---|---|
| `BLOCK`, `WBLOCK`, `INSERT` / `-INSERT` | Define, export and insert blocks. |
| `BEDIT`† | Block editor, including dynamic-block parameters. ezdxf cannot author those. |
| `XREF`, `XATTACH`, `BIND` | External references. Bind before sending a set. |
| `ETRANSMIT` | Package a drawing with its xrefs, fonts and plot styles for sending. |

## Sheets and plotting

| Command | Use |
|---|---|
| `LAYOUT`, `MVIEW`, `VPORTS` | Create sheets and viewports. Set each viewport's scale, then lock it. |
| `VPLAYER` | Freeze layers in one viewport only. |
| `CHSPACE` | Move objects between model and paper space. |
| `PAGESETUP` | Plotter, paper size and CTB/STB per layout. |
| `PLOT` / `-PLOT` | Plot one layout. |
| `PUBLISH` | Batch-plot many layouts or drawings to one PDF. |
| `SCALELISTEDIT` | Clean up the viewport scale list. A bloated scale list slows files down. |

## Automation

| Command | Use |
|---|---|
| `SCRIPT` | Run a `.scr`. |
| `APPLOAD` | Load a `.lsp`. Add it to the Startup Suite to load it every session. |
| `ACTION` (action recorder)† | Record a macro without writing code. |
