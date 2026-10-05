# Structure, services, fire safety and accessibility: what the architect must get right

The engineers design the structure, the mechanical and electrical systems, and the fire systems. **The architect decides whether they fit.** Every rule of thumb below is for sizing and coordination at concept and avan stage, and is labelled as one. Regulation numbers are in `09-regulation-quick-reference.md`.

## 1. Structure for architects (reinforced-concrete frame)

**Spans and depths (rules of thumb, for drawing and for questions to the engineer):**

| Element | Rough depth |
|---|---|
| Beam (continuous) | span / 10–12 (a 6 m span gives about 50–60 cm deep) |
| Two-way slab on beams | span / 30–35 |
| Ribbed slab (asmolen), total | span / 20–25 |
| Flat slab (kirişsiz) | span / 25–30, with a punching-shear check |
| Column | TBDY sets minimum sizes: smallest side 300 mm and area at least 75,000 mm². **Verify against the current TBDY text.** Real sizes come from loads and seismic design. |

- **Economical grid for housing:** about 4–6 m. Align it with walls between flats and with the parking module (3 stalls ≈ 7.20 m clear + column).
- **Shear walls (perde)** in both directions, spread through the plan and as symmetric as possible. They are often wrapped around the core and in the façade between windows.
- **Columns** continue from foundation to roof without offsets. A column that stops, or lands on a beam or cantilever, is a seismic irregularity (B3) that TBDY restricts.
- **Seismic design principles (TBDY 2018). These are plan and section decisions, so the architect owns them too:**
  - compact, regular, near-symmetric plan; avoid long wings and deep re-entrant corners (A3)
  - centre of stiffness near the centre of mass, i.e. no eccentric core without balancing walls (A1, torsion)
  - no large slab openings that cut the floor diaphragm (A2)
  - no soft or weak storey, such as a tall open ground floor under walled floors (B1/B2)
  - no short columns created by ribbon windows or partial-height infill against columns
  - no heavy cantilevers carrying walls and columns
  - a seismic joint (derz) between adjacent buildings, as the engineer specifies

  The design classes (BYS, DTS) come from height, use and the AFAD hazard map. Ask the engineer early, because they can rule out systems or heights.
- **Foundations and basements.** The raft or strip choice, groundwater, excavation support next to neighbours (iksa) and retaining walls all come from the zemin etüdü. Basements under or near neighbours' foundations are a cost and risk item; flag them at concept.
- **Give the engineer:**
  - the grid
  - wall positions
  - all slab openings (shafts, stairs, voids)
  - heavy loads (water tanks, pools, roof plant, soil on slabs)
  - cantilevers and double-height spaces
  - floor-to-floor heights and finish build-ups

## 2. Mechanical, electrical and plumbing coordination

**Heating and cooling:**
- **Individual gas boilers (kombi)** are the most common in Turkish flats. Each one needs:
  - a flue route (room-sealed condensing types through the wall or into shared flues)
  - a gas supply and meter position
  - ventilation per the local gas company's technical rules (İGDAŞ, EGO, etc.)

  The mechanical engineer's doğalgaz projesi governs.
- **Central heating** with heat-cost meters (pay ölçer) needs a boiler or plant room (kazan dairesi), a flue to the roof and fuel access.
- **Underfloor heating** adds screed depth (`04`). Heat pumps need outdoor-unit space and a noise check.
- **Split air conditioning.** Reserve outdoor-unit positions (balcony corners, screened façade niches, roof) and condensate drains at design stage. Otherwise the façade fills up randomly after handover.

**Ventilation:**
- WC and bathroom extract (window or mechanical, `09`).
- Kitchen hood ducted to outside or to a shaft.
- Enclosed car parks need mechanical ventilation and smoke extract (jet fans, CO detection) sized by the engineer.

**Plumbing:**
- Stack wet rooms. Allow a shaft of about 40 × 60 cm or more beside each wet group (rule of thumb; it depends on the number of pipes).
- Soil stacks are about Ø100–110 mm and vented to the roof. Horizontal drains fall about 1–2%.
- Most Turkish apartment buildings have a **water tank (su deposu) and booster pump (hidrofor)** in the basement because of supply interruptions. Reserve a plant room. For a first estimate, size the tank on about 150–200 L per person per day; the mechanical engineer sizes it properly.
- Rainwater downpipes go on every roof plane and gutter. A common Turkish rule of thumb is about 1 cm² of downpipe cross-section per m² of roof; confirm with the engineer. Check whether the municipality requires rainwater kept separate from sewer.

**Electrical and low current:**
- Meter cabinets or a meter room (sayaç), the main distribution board, telecom and fibre room.
- A transformer (trafo) for large developments.
- A generator for lifts and common lighting where required.
- EV charging: Otopark Yönetmeliği amendments require it above certain parking counts. Verify the current threshold.

**Lifts (rules of thumb; check the supplier's data):**
- A 630 kg / 8-person car is about 1100 × 1400 mm. That is also the minimum accessible car (EN 81-70).
- Shaft about 1.6–1.8 m × 1.7–2.0 m.
- Pit about 1.2–1.5 m below the lowest stop. Overrun above the top stop about 3.5–4.0 m.
- A machine-room-less (MRL) lift avoids a roof machine room.
- Local plan notes may set a minimum shaft area (e.g. 377/1: ≥ 3.00 m²). The PAİY lift triggers are in `09`.

**Refuse:** a container area at ground level with vehicle access. Rubbish chutes are rare in new Turkish housing.

## 3. Fire safety (concepts; thresholds in `09`)

- **Objectives, in order:** people get out (escape), fire stays where it starts (compartmentation), firefighters can get in (access), the structure stands long enough (fire resistance).
- **Vocabulary:**
  - kullanım sınıfı (occupancy class)
  - kullanıcı yükü (occupant load)
  - kaçış yolu (escape route)
  - kaçış uzaklığı (escape distance)
  - korunumlu merdiven (protected stair)
  - yangın güvenlik holü (fire-safety lobby)
  - yangın kapısı (fire door: rated, self-closing)
  - yangın kompartımanı (compartment)
  - duman kontrolü / basınçlandırma (smoke control / pressurization)
  - yağmurlama (sprinklers)
  - itfaiye erişimi (fire-brigade access)
- **In housing:**
  - The common stair is the escape route. Enclose it; keep it free of storage and services openings. Its doors and protection level depend on building height (`09`: 21.50 m / 30.50 m / 51.50 m bands, number of stairs, protected stairs, fire lobbies).
  - Inside a flat, the distance from any point to the flat door is limited (`09`). Long thin flats can break this.
  - **Basement car parks** are separated from the stair by fire-rated doors or lobbies. Large car parks need compartments and sprinklers.
  - **Façades:** fire spread up insulated or clad façades is limited by material class and fire barriers. Check before specifying combustible insulation or composite panels on taller buildings.
- **Firefighter access.** A fire-engine approach to the building, and to the façade for taller buildings, within the distances the regulation sets. Gated estates must keep it open.
- **Approval.** The Yangın Yönetmeliği is applied through the project. Many municipalities ask the fire brigade (itfaiye) for an opinion on larger buildings. The Bakanlık's December 2024 Yangın Yönetmeliği Kılavuzu explains the application with examples; read it for anything beyond a small house.

## 4. Accessibility (concepts; figures in `09`)

- **An accessible route** from the street and the accessible parking to the building entrance and the lift: no steps, or a ramp to TS 9111 slopes with landings, plus door clear widths.
- **Common areas:** an accessible entrance door, lobby, lift car and corridor widths. Public buildings also need accessible WCs, tactile surfaces (hissedilebilir yüzey) and signage.
- **Inside flats:** not fully mandated for every unit, but cheap to allow at design stage (`03` §10).
- **Reference documents:** the Bakanlık's *Erişilebilirlik Kılavuzu* (2021, free) and TS 9111 (TSE, paid). Accessibility is checked at permit and at iskan, so plan it rather than retrofitting it.

## 5. Coordination checklist (concept → avan)

- [ ] Grid, shear walls and core agreed with the engineer, and stacking checked on every floor
- [ ] Shafts drawn (plumbing, electrical, ventilation, flues), stacked, with access
- [ ] Plant spaces placed: water tank and booster, boiler or heat pump, electrical and meters, telecom, generator if any, refuse
- [ ] Outdoor AC units, boiler flues and solar panels placed on the façade or roof drawings
- [ ] Stair, lift and fire strategy checked against the height band (`09`)
- [ ] Car-park ventilation and smoke-extract space, ramp, sprinklers if required
- [ ] Accessible route from street and parking to every common entrance
- [ ] Floor-to-floor height = clear height + slab + finishes + services zone, checked on every level
