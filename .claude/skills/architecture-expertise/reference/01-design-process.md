# Design process, principles and critique

## 1. Project stages

Name the stage a request belongs to. Each stage has its own deliverables and level of detail, and mixing them is a classic error: detailing a scheme that hasn't been decided, or "deciding" in a working drawing.

| Stage | International (RIBA 2020) | Turkish practice | Typical drawings |
|---|---|---|---|
| Strategy | 0 Strategic definition | fizibilite | Feasibility: what can the parcel carry (TAKS/KAKS, unit count, rough cost) |
| Brief | 1 Preparation and briefing | ihtiyaç programı | Space program, adjacencies, budget, the constraint ledger |
| Concept | 2 Concept design | eskiz / ön proje | Parti diagrams, massing, 2–3 options compared |
| Developed design | 3 Spatial coordination | **avan proje** (site 1/500, plans 1/200, sections and elevations, mimari rapor) | Coordinated plans, sections, elevations; structure grid agreed |
| Permit | — | **ruhsat projesi** (municipal submission, usually 1/100; mimari, statik, mekanik, elektrik + zemin etüdü) | The set the belediye approves |
| Technical design | 4 Technical design | **uygulama projesi** (site 1/200; all plans, roof, ≥ 2 sections and 4 elevations at 1/50; mahal listesi) + **detaylar** 1/20, 1/10, 1/5, 1/1 | Construction drawings, schedules, specifications |
| Construction | 5 Manufacturing and construction | şantiye, uygulama denetimi | Site queries, shop-drawing review |
| Handover / use | 6–7 | iskan, as-built (rölöve) | As-built set |

`lib/cadgen`'s schematic tier sits at **concept to early avan**. Never describe it as a ruhsat or uygulama set (department rule: no permit-ready claims).

## 2. Briefing (ihtiyaç programı)

A brief is finished when it answers all of these in writing:

1. **Who and why.** The client and their objective: sell, rent, live in, or operate. Who the end users are, and how many.
2. **Program.** Every space with its net area, count, and special needs. Use a table: `Space | Net m² | Qty | Total | Notes (daylight, privacy, equipment)`.
3. **Adjacencies.** Which spaces must touch, be near, or be kept apart. Use an adjacency matrix for anything with more than about 8 spaces.
4. **Gross-up.**
   - Net program ÷ efficiency = gross area.
   - For apartments, plan efficiency (net usable ÷ gross) is typically **0.75–0.85**. The rest is walls, shafts and common circulation.
   - Exterior walls with insulation are about 30–35 cm thick (see `04-construction-tr.md`). Walls alone are about 8–12% of gross.
   - Check the gross against the emsal budget **before** design starts.
5. **Budget.** Area × unit cost. Use the official reference cost for orders of magnitude (`09-regulation-quick-reference.md`, 2026 table), and a real market figure, labelled as such, for client conversations.
6. **Constraints.** The ledger from `zoning-compliance-tr`.
7. **Quality level and image.** Reference projects and a material palette, set by price point and target buyer.
8. **Success criteria.** What would make the client say yes.

## 3. Site analysis

Write down each of the following. Where a field is unknown, say so.

| Topic | What to record | Turkish data source |
|---|---|---|
| Legal | Parcel (ada/parsel), area, owners, easements | TKGM Parsel Sorgu, tapu, aplikasyon krokisi |
| Planning | TAKS, KAKS, height, setbacks, nizam, use, plan notes | İmar durumu, plan notes (`zoning-compliance-tr`) |
| Topography | Slope, levels, kırmızı kot, existing trees, rock | Plankote, survey (halihazır harita) |
| Ground | Soil class, groundwater, geological zone (e.g. ÖA) | Zemin etüdü, belediye jeoloji |
| Seismic | Hazard parameters for TBDY (S_S, S_1, PGA) | AFAD Türkiye Deprem Tehlike Haritası (tdth.afad.gov.tr) |
| Climate | Sun path, temperatures, prevailing and storm winds, rain, snow load | MGM climate normals. Latitude gives sun angles (see `05-building-physics-sustainability.md`). |
| Context | Neighbours' heights and windows, street character, cornice lines, views worth keeping or hiding | Site visit, street photos, Google Street View |
| Access | Road widths, vehicle entry point, pavement, public transport | İmar durumu (yol genişliği), site visit |
| Noise and nuisance | Main roads, commercial uses, industry | Site visit; stratejik gürültü haritaları for large cities |
| Infrastructure | Water, sewer, gas, electricity, telecom connection points | Utility companies, belediye |

## 4. Concept and parti

- **Parti:** the one-sentence organizing idea of a building. For example: "Two dual-aspect flats per floor around a central core, living rooms to the garden."
  - If you cannot state it, you do not have a design yet, only an arrangement.
  - Every later decision should be testable against the parti.
- **Generate before choosing.** Make at least three genuinely different partis (see `design-reasoning`). Differences that matter include core position, units per floor, orientation, courtyard vs block, and where parking goes.
- **Massing first.** Test the envelope, sun, views and neighbours with simple volumes before drawing rooms.
- **Precedents.** Study 2–3 built projects of the same type and scale. Extract the principle (circulation pattern, unit depth, section idea), not the image. Never copy a published plan.

## 5. Design principles to reason with

- **Order.** Axis, symmetry, hierarchy, rhythm/repetition, datum, transformation (Ching, *Form, Space and Order*). A plan should have a legible structure that a visitor understands without signs.
- **Proportion and scale.** Room proportions between 1:1 and 1:2 furnish best. Long thin rooms (beyond 1:2) waste area on circulation. Façade openings follow the structural grid and the interior, not decoration.
- **Sequence.** Street → threshold → entry (antre) → living spaces → private spaces. Compression then release, from a low or narrow entry to a higher or wider living space, makes a small flat feel generous.
- **Zoning.**
  - Separate day (living, kitchen, guest WC) from night (bedrooms, bathrooms).
  - Separate public from private: guests should not walk past bedrooms.
  - Separate served from servant spaces (Louis Kahn's term): wet rooms and storage cluster next to shafts.
- **Light and air.**
  - Every habitable room gets a window.
  - Living rooms get the best orientation or view.
  - Dual aspect (two façades) beats single aspect for light and cross-ventilation.
  - Plan depth from a window wall beyond about 6–7 m gets dark in a habitable room (rule of thumb).
- **Structure and space together.** The column grid, the shear walls and the plan are one decision. Columns in the middle of rooms or in parking aisles mean the structure was not designed with the plan.
- **Economy.**
  - Compact forms, stacked wet rooms and repeated floors are cheaper.
  - Spend the money where people touch the building: entrance, living rooms, windows, stairs.
- **Durability and maintenance.** Materials and details that age well in the actual climate. Façades that can be cleaned. Equipment that can be reached.
- **Context.** Respond to the street: cornice lines, entrance on the street side, scale of the neighbours. In Turkish housing estates, also the shared garden and social facilities.

## 6. Turkish housing: cultural norms that plans must respect

These are expectations a Turkish buyer or family brings. Violating them makes a plan "wrong" even when it is legal.

- **Antre (entrance hall) with shoe storage (ayakkabılık).** Shoes come off at the door. The entrance needs a hall, a cabinet, and a place to sit or hang coats. A front door that opens straight into the living room is a defect.
- **Guest and family separation.** A salon that can receive guests without exposing bedrooms and bathrooms. A guest WC near the entrance in 3+1 and larger flats.
- **Kitchen size.** The kitchen is a daily dining place (breakfast). Plan room for a table, or a clear dining relationship in open kitchens. Closed kitchens are still widely preferred for cooking smells.
- **Balcony.** Expected in almost every flat, used for sitting and drying laundry. Plan where laundry dries without dominating the street façade.
- **Ebeveyn banyosu (en-suite)** in the master bedroom of 3+1 and larger. A separate WC from the main bathroom in larger flats.
- **Storage.** Kiler (pantry) or storage room, wardrobes in every bedroom, a place for the vacuum cleaner and cleaning items.
- **Wet rooms.** A bathroom door opening directly into the kitchen or salon is a defect.

## 7. The architect's crit: review checklist

Run this before showing any scheme to the founder or a client. Write a one-line answer to each question that applies. "Not considered" is an acceptable answer to show; "fine" without a reason is not.

**Site and context**
1. Why is the building placed and oriented where it is? Does that follow sun, view, street and neighbours?
2. Where do people and cars enter? Are they separated? Is the entrance visible from the street?
3. What do the neighbours see of us, and we of them? Which windows face a neighbour at about 6 m?

**Program and plan**
4. Does every space in the brief exist, at its required area? Which ones were cut, and why?
5. Is the parti still legible after every room is added?
6. Is the circulation short and clear? Any dead-end corridors, or corridors that serve one door?
7. Are day, night and service zones separated? Can guests use the WC without passing bedrooms?
8. Does every room furnish? Draw the bed, sofa, table and wardrobe; doors must not swing into them.
9. Do doors clash with each other, with fixtures, or with windows?
10. Is there storage: antre, kiler, wardrobes, balcony storage?

**Light, air, comfort**
11. Does every habitable room have a window of adequate size? Do wet rooms have a window or mechanical ventilation (see `09`)?
12. Which units are single-aspect? Which face north only? Is that acceptable for this market?
13. Is there privacy between facing windows, and from the street for ground-floor units?
14. Where are the noise sources (lift, stair, plumbing stacks, street), and what sits next to bedrooms?

**Vertical and section**
15. Does the stair work in section: risers, landings, headroom, every floor?
16. Do the elevator shaft, pit and overrun fit? Does it reach every required floor?
17. Do the ramp or lift and the parking work in section and plan?
18. Are floor-to-floor heights consistent with the clear-height minimum plus slab and services?

**Structure and services**
19. Is there a regular column grid that stacks basement to roof and misses parking aisles?
20. Is the plan seismically sensible: compact, regular, no soft storey, balanced core and walls?
21. Are wet rooms stacked over each other with shafts? Where do soil stacks go in the basement?
22. Where do kombi boilers, flues, AC outdoor units, meters, water tank and electrical room go?

**Regulation**
23. Is every ledger row satisfied, with the check shown?
24. Are fire escape, stairs and doors right for this height and use (see `06`, `09`)?
25. Is the entrance and common circulation accessible (ramp, door widths, lift)?

**Envelope and buildability**
26. What are the wall, roof and floor build-ups, and are their thicknesses drawn?
27. Where are the thermal bridges and waterproofing risks: balconies, parapets, basement walls, roof edges?
28. Can it be built with ordinary Turkish contractors, materials and methods? What is unusual, and is it worth it?
29. What does it cost per m² relative to the target, and where is the money going?

**Experience and presentation**
30. What is the first thing a visitor sees on entering a flat? Is it good?
31. Would you live here? What would you complain about after a year?
32. Can the design be explained in one paragraph and three drawings?

## 8. Common errors to catch, in generated plans especially

- Rooms with no window, or a window onto a 1–2 m light-well presented as daylight.
- Front door opening straight into the living space; no antre, no shoe storage.
- Bathroom door opening into the kitchen or living room.
- Furniture that doesn't fit. A 9 m² bedroom with doors on two walls and a window on the third has nowhere for the bed.
- Doors hitting each other, or a door swinging over a stair landing.
- Exterior walls drawn 20 cm thick when insulated walls are about 30–35 cm, inflating usable area by several percent.
- No shafts, flues or meter space. Services appear at the end and destroy the plan.
- A stair that only works in plan: too few risers for the floor height, no landing at the door.
- Parking that fits on paper but not the ramp, columns or turning.
- Copy-paste floors that ignore what changes per floor: entrance level, top floor, roof, basement.
- Area tables that disagree with the drawings. Compute areas from the drawing, never retype them.

## 9. Presenting a design

- **Structure.** Problem → constraints → options considered → chosen scheme and why → what it costs and gives up → next decisions needed.
- **Minimum set for a concept presentation:**
  - site plan with context
  - plans of each different floor, with furniture
  - one or two sections
  - main elevations
  - a massing view or render
  - the area and emsal table
- **Diagrams carry the argument better than renders.** Use them for zoning, circulation, sun and views, and structure.
- Every drawing is labelled schematic, needing licensed-architect review (department rule).
