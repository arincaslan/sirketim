# Building technology: how buildings are built in Turkey

Typical Turkish practice and layer thicknesses for **drawing and reasoning**. Thermal and acoustic targets come from TS 825:2024 and the Gürültü Yönetmeliği (`09`, `05`). The structure is the engineer's design (`06`). Anything marked "verify" was not confirmed against a current text.

## 1. Structural systems (what you will meet)

| System | Where | Architectural consequence |
|---|---|---|
| **Betonarme karkas** (reinforced-concrete frame + shear walls/perde) | Almost all apartment buildings | Column grid and shear walls must be designed with the plan (`06`). Infill walls are non-structural, so layouts can change later. Columns and beams in the façade are thermal-bridge risks. |
| **Tünel kalıp** (tunnel formwork, monolithic RC walls and slabs) | Mass housing (TOKİ, large estates) | Very rigid and fast, but interior walls are structural, so plans can never be changed. Highly repetitive plans. |
| **Yığma** (load-bearing masonry) | Low-rise, rural, older buildings | Strict TBDY limits on height and openings; check TBDY before proposing it. |
| **Çelik / hafif çelik** (steel / light-gauge steel) | Industrial, some villas and additions | Fire protection and corrosion detailing; light steel needs careful acoustic and thermal detailing. |
| **Prefabrik betonarme** | Industrial and commercial | Fixed spans and grids; joints matter for water and seismic behaviour. |

**Foundations:**
- tekil (isolated footings)
- sürekli (strip)
- radye (raft; common under apartments with basements)
- kazıklı (piled, where the zemin etüdü requires)

Basement walls are RC retaining walls (bodrum perdeleri).

## 2. Walls

**External wall (most common build-up, inside → outside, about 30–38 cm total):**

| Layer | Thickness |
|---|---|
| Interior plaster (alçı / kireç-çimento), paint | ~2 cm |
| Infill: horizontal-hole clay brick (yatay delikli tuğla) 19 cm, **or** AAC (gazbeton) 20–25 cm, **or** pumice block (bims) 19–20 cm | 19–25 cm |
| Adhesive mortar | ~0.5 cm |
| Thermal insulation (ETICS / **mantolama**): EPS, graphite EPS, XPS (plinth, wet zones) or **taşyünü (stone wool, non-combustible)**. Thickness set by TS 825:2024 zone (`05`). | 5–12 cm |
| Mechanical fixings (dübel), mesh (file), base coat | ~0.5 cm |
| Decorative render (dekoratif sıva: silikon/akrilik) or cladding | ~0.3 cm (render); cladding more |

- **Fire.** Taller buildings need non-combustible insulation or fire barriers in the façade. The thresholds are in the Yangın Yönetmeliği; verify before specifying EPS on a tall building.
- **Cladding alternatives:**
  - aluminium composite panels (fire class matters)
  - ceramic or granite on anchors (ventilated façade)
  - natural stone
  - fibre-cement
  - wood or composite boards
  - curtain wall for commercial buildings

**Internal walls:**

| Wall | Typical build-up | Approx. total |
|---|---|---|
| Partition (masonry) | 8.5–10 cm brick or AAC + plaster both sides | 12–15 cm |
| Partition (drywall / alçıpan) | 50–75 mm studs + 2 × 12.5 mm boards each side (mineral wool inside for sound) | 10–12.5 cm |
| Between flats | Heavy masonry 19–25 cm, or double drywall with separate studs and wool; must reach the class required by the Gürültü Yönetmeliği | 20–25 cm |
| Wet-room walls | Masonry, or moisture-resistant (green) drywall; waterproofed at the floor junction and in showers | — |
| Shaft walls | Masonry or rated drywall; fire-stop at each floor | ~10 cm |
| RC shear wall (perde) | 20–30 cm structure (+ insulation if external) | 20–40 cm |

**Draw walls at their real thickness.** Drawing a 20 cm external wall where 33 cm will be built overstates every flat's net area by a few percent. That is a sales and legal problem, not only a drafting one.

## 3. Floors (döşeme)

- **Slab types:**
  - beam-and-slab (kirişli plak, slab about 12–15 cm)
  - ribbed slab with infill blocks (asmolen/nervürlü, about 25–35 cm total)
  - flat slab (kirişsiz/mantar, about 20–30 cm)

  The engineer picks the type. Flat slabs give clean ceilings but need checks for punching shear and seismic behaviour.
- **Floor build-up above the slab (about 8–12 cm, more with underfloor heating):**
  - Impact-sound layer (ses yalıtım şiltesi) for a **floating floor** between flats. Run an edge strip up the walls so the screed never touches them.
  - Screed (şap) 4–6 cm. Underfloor heating pipes go inside the screed and add about 3–5 cm.
  - Finish:
    - porcelain/ceramic tile with adhesive, about 1–2 cm
    - laminate or engineered wood with underlay, about 1–1.5 cm
    - solid wood or marble, more
- **Ground floor over soil or an unheated basement:** add thermal insulation (XPS) and, over soil, a damp-proof membrane.

## 4. Roofs

**Pitched roof (kırma çatı), common for apartments and villas:**
- Structure: timber (ahşap) or steel trusses and rafters on the top slab or ring beam.
- Layers, outside in:
  - tiles (kiremit, clay or concrete) or shingles
  - battens and counter-battens (çıta, kontra çıta) for drainage and ventilation
  - breathable membrane (su buharı geçirgen membran) or bitumen membrane
  - OSB or plywood deck
  - insulation
- **Cold roof:** insulation on the top-floor slab, with a ventilated attic above.
- **Warm roof:** insulation in the roof slope. Use it when the attic is habitable (çatı piyesi), with a vapour control layer on the warm side.
- Eaves, gutters (oluk/dere) and downpipes: size and place them on the plans and elevations. Add snow guards in snowy regions.
- Plan notes cap pitch and ridge height (e.g. 377/1: 45%, mahya 5.50 m above the top slab); check the ledger.

**Flat roof (teras çatı):**
- **Conventional build-up, bottom to top:**
  - slab
  - screed to falls ≥ 1.5–2% toward drains
  - vapour control layer
  - insulation (XPS or PIR)
  - waterproofing (usually two layers of bitumen membrane)
  - protection (geotextile + screed/tiles, or gravel)
- **Inverted roof:** the membrane goes under the XPS, which protects it.
- **Upstands.** Turn the membrane up parapets and walls (commonly at least 15 cm above the finished surface, often 30 cm). Add overflows (taşma ağzı) beside every drain. Door thresholds onto terraces need the same upstand logic.

## 5. Basements and below-ground waterproofing

- **Bohçalama.** Wrap the raft and the outside of the retaining walls in a continuous waterproofing membrane. Add a protection board and a drainage layer (dimpled sheet, kabarcıklı levha), plus a perimeter drain pipe where the ground allows.
- **High groundwater** (the zemin etüdü says so): add watertight concrete (su geçirimsiz beton), detailed joints (waterstops) and possibly tanking. That is a cost line, so flag it early.
- **Habitable basement rooms** need daylight and ventilation. The emsal and floor-count treatment follows the plan notes and PAİY (ledger).

## 6. Wet rooms

- **Waterproofing** (cement-based or liquid membrane) across the whole floor and up the walls. Commonly about 15 cm generally, and full height or about 2.0 m in showers (rule of thumb). Tape corners and pipe penetrations.
- **Falls.** Floor falls of 1–2% to the drain (yer süzgeci). A level-access shower needs a recessed slab or a thicker build-up. Decide it at the structure stage, not at tiling.
- **Services.** Soil and waste pipes to the stack (vertical shaft). Check that pipe falls fit the screed depth. Wet rooms not stacked over each other mean pipes running through the flat below.

## 7. Windows, doors, balconies

- **Windows:**
  - Frames: multi-chamber PVC is most common; aluminium with a thermal break; timber.
  - Glazing: double glazing (ısıcam, e.g. 4 + 16 + 4 with low-e and argon); triple in cold zones.
  - Set the window **in the insulation plane** to avoid a thermal bridge at the reveal. Insulate the reveals too.
  - Sills (denizlik: marble, granite or aluminium) need a drip (damlalık) and a slope outward.
  - Masonry openings need lintels (lento).
  - Roller shutters need an insulated shutter box (panjur kutusu) in the wall build-up.
- **Doors:** steel flat-entrance doors (çelik kapı, fire- and security-rated where needed); interior doors in lacquered, PVC-foil or veneer finishes. Fire doors where the Yangın Yönetmeliği requires them (`06`).
- **Balconies.** A cantilevered RC balcony continuous with the floor slab is a major **thermal bridge**. Either use a structural thermal-break element, or insulate the slab above and below.
  - Falls of 1–2% away from the door.
  - A drip under the edge.
  - Membrane turned up at the door threshold.
  - Railing height per PAİY (commonly 1.10 m; verify), and no climbable horizontal rails.

## 8. Stairs, railings, shafts, chimneys

- Common stairs are RC flights with stone or terrazzo treads and nosings, a handrail at about 85–100 cm, and guards at landings and voids.
- Service shafts: plumbing, electrical and ventilation each need access panels and fire-stopping at every floor. Shaft sizes belong in the plan from concept stage (`06`).
- Flues (kombi boilers): room-sealed condensing boilers discharge through the wall or into shared flues, under gas-company rules. Plan their positions with the façade.

## 9. Finishes (Turkish market)

| Surface | Common options |
|---|---|
| Floors | Porcelain or ceramic (60×60, 60×120), laminate, engineered or solid parquet, marble or travertine, epoxy (technical rooms) |
| Walls | Gypsum plaster + emulsion paint (plastik / silikonlu), ceramic in wet rooms, wallpaper, wood panelling |
| Ceilings | Gypsum plaster, drywall suspended ceilings (asma tavan) with recessed or indirect light, cornice (kartonpiyer) |
| Kitchen and bath | Lacquer, acrylic, membrane or laminate cabinet fronts on MDF or chipboard (yonga levha); quartz, compact laminate, granite or laminate worktops |
| Exterior | Decorative render, composite panels, ceramic or granite cladding, natural stone, wood or composite boards |

## 10. Detailing principles (apply to every junction)

1. **Water.** Shed it (falls), throw it (drips), lap it in the direction of flow, turn membranes up (≥ 15 cm), and keep the seal as the second line, never the first.
2. **Heat.** One continuous insulation line around the heated volume. Hunt the bridges: slab edges, façade columns and beams, balconies, window reveals, parapets, roof eaves, the basement wall top.
3. **Vapour.** Vapour control on the warm side. Never trap moisture between two impermeable layers. Check condensation (Glaser method, TS 825).
4. **Air.** Airtight joints at windows (tapes) and around service penetrations.
5. **Movement.** Expansion joints (dilatasyon) where the structure needs them, joints between different materials, and joints in large tiled or rendered areas.
6. **Fire.** Compartment lines continuous through façades, floors and shafts (fire-stopping), with rated doors.
7. **Sound.** Break the path: floating floors, resilient layers, sealed gaps, no back-to-back sockets between flats, insulated soil stacks.

## 11. Wall section (sistem kesiti): what it must show

A 1/20 section from the foundation to the roof, through a window and a balcony. Every layer is named with its thickness and material:
- foundation and waterproofing
- basement wall and drainage
- ground-floor build-up
- typical floor build-up
- external wall with insulation, window, sill, lintel and shutter box
- balcony and its thermal-break solution
- top floor and parapet or eave
- roof layers

Municipal ruhsat sets commonly require one. It is also the best single test of whether a design has been thought through as a building.
