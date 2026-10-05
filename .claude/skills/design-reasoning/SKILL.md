---
name: design-reasoning
description: Make and defend architectural layout decisions by comparing real options against stated criteria before any CAD exists. Covers building placement and orientation, the vertical core (stair, elevator, shafts), unit count and mix, circulation, wet-core stacking, structural grid, basement parking and ramp, ground floor, daylight and privacy. Use before running lib/cadgen on a new or changed program, and whenever the founder asks why a building is laid out the way it is.
---

# Architectural design reasoning

On 2026-08-21 the founder rejected the 377/1 drawings for having **no defensible architectural reasoning behind decisions like core placement.** The drawings were to scale, and the compliance checks passed (39/39). They were still not a building anyone could defend.

The two skills split the work. `zoning-compliance-tr` defines the envelope. This skill decides what goes inside it, and why. A rationale written after the drawings, to justify them, does not count.

## Sequence: no CAD before step 6

1. **Constraint ledger** from `zoning-compliance-tr`. It sets the envelope, area budget, heights, parking rate and every threshold that a unit count could trip.
2. **Objective.** Ask the founder what the building is for if it is not written down. Options include maximum sellable area, maximum unit count, a specific unit mix, or quality and price point for a target buyer. Different objectives produce different correct answers. 377/1 changed from one house to 6 units to 7 units without the objective ever being stated.
3. **Site analysis.** Write a short paragraph for each of these: sun, outlook/view, street (noise, entrance), neighbours and privacy, slope and kırmızı kot, ground and geology zone, access for cars.
4. **Area budget.** Split it into gross, net and common circulation. Decide what counts toward emsal using the official method from the ledger.
5. **At least three genuinely different schemes.** They must differ in a decision that matters: core position, units per floor, orientation, or where parking goes. Three variations of one plan don't count. A plan sketch or a box diagram is enough at this stage.
6. **Score them** against weighted criteria (see the template at the end). Pick one, and write down why each of the others lost.
7. **Then produce the drawings:**
   - Draw with `lib/cadgen`.
   - Run the mandatory `verify_*()` pass.
   - Do the whole-sheet visual check from `autocad-drafting`.
8. **Decision records** go into `notes/rationale.md`.

**When the program changes, go back to step 2.** Don't patch the previous drawings. 377/1 was patched twice.

## Site facts that drive layout

- **Sun.** Turkey lies at roughly 36–42°N. Noon sun altitude is (90° − latitude) ± 23.44°. At Karamürsel (40.7°N) that is about 26° at the winter solstice and about 73° at the summer solstice.
  - South glazing gets low winter sun and is easy to shade in summer with an overhang.
  - West glazing overheats on summer afternoons.
  - North light is even and cool.
  - Living rooms want south or south-east, or the view. Bedrooms tolerate east. Stairs, wet rooms and storage can take north or the dark middle.
- **Ayrık nizam side gardens.** With 3 m side setbacks on both parcels, a side façade looks at the neighbour's side façade about 6 m away. That façade suits bedrooms and wet rooms poorly for privacy and well for nothing. Put living rooms on the front and rear façades.
- **Street side.** It brings noise, the entrance and the address. Ground-floor units on the street need privacy: use the front garden and raise the floor level above the pavement where the kot allows.
- **Earthquake.** Kocaeli sits on the North Anatolian Fault (the 1999 İzmit earthquake). TBDY 2018 penalizes plan and elevation irregularities, and those are architectural decisions:
  - Torsional irregularity (A1) comes from an eccentric core or walls.
  - Slab discontinuities (A2) come from large voids.
  - Plan projections (A3).
  - Weak or soft storeys (B1/B2). Classic case: a tall, open ground floor of shops under walled flats.
  - Discontinuous vertical elements (B3). Columns that stop mid-height or sit on beams.
  - Read the current TBDY text for the definitions and limits. The structural engineer decides, but the plan must not hand them a problem.
- **Slope and the kot.** These set basement exposure, entrance steps, step-free access and ramp length. Without a plankote the datum is a placeholder, so say so.

## The core: what it is and how to place it

The core is the shared vertical circulation: stair, elevator, and usually the service shafts.
- It must sit at the **identical position on every floor**, from basement to roof, because it punches through every slab.
- In a reinforced-concrete building, shear walls (perde) are usually wrapped around it, which makes it a structural decision as much as a circulation one.

Score each core option on these criteria:

| Criterion | What to measure |
|---|---|
| Circulation efficiency | Common landing and corridor m² per floor, and net ÷ gross. Ideally every unit door opens straight onto the landing. |
| Daylight and outlook | Does the core occupy the least valuable zone (the dark middle, north, or the façade 6 m from a neighbour) so the units get the good façades? |
| Unit quality it enables | Are units dual-aspect (two façades, cross-ventilation) or single-aspect facing the neighbour? |
| Structure | Is the core central or balanced? A core at one end of a long plan creates torsion unless walls at the far end balance it. Ask the engineer if in doubt. |
| Entry sequence | Is the path from street door to lobby to core short? A core at the rear forces a corridor through the most valuable ground-floor area. |
| Basement | Does the core land outside the parking aisle and between stall groups? Does it reach the parking level at all? |
| Roof | Elevator overrun and machine room. A machine-room-less elevator removes the roof room. Also roof access. |
| Fire escape | Travel distance to the stair, and whether a protected stair or second stair is required. Read the Yangın Yönetmeliği for this height and use. |
| Services | Are kitchens and bathrooms clustered on shafts next to the core and stacked floor to floor? |

**Typical options** for a wide, shallow, single-frontage ayrık footprint like 377/1 (buildable zone about 30 × 11.8 m):
- Core centred against the rear façade, with one unit on each side (each unit gets front and side light).
- Core centred against the front façade (short entry, but it consumes the street façade).
- Core at one end (long corridor, eccentric).

These are options to **score**, not answers. Derive the choice for each project from the criteria.

## Unit count and mix

- **Count parking first.** On small lots, parking usually binds before emsal does.
  - At 1 stall per unit (Otopark Yönetmeliği Ek-1 baseline), the stalls that physically fit cap the unit count.
  - Count them with real geometry: a 6.00 m two-way aisle and 2.40 × 4.90 m stalls, as recorded for 377/1; re-read the regulation before reuse. Also allow for the ramp or lift.
  - On 377/1, the basement's 29.77 m width capped the reverse-duplex count at one.
- **Thresholds that change the building as units are added.** Check each in the ledger: minimum unit net area (377/1's local item 4.2.7 was ≥ 50 m²), elevator, sığınak, kapıcı dairesi (377/1's 4.2.52–4.2.54: over 30 units), and whether a second stair is needed.
- **Market vocabulary.** Units are described as "1+1 / 2+1 / 3+1" (bedrooms plus living room). Sale area is often quoted gross, including a share of the common area. Don't present market sizes as facts. Ask the founder or research the local market and cite it.
- **Duplex types** (reverse duplex into the basement, roof duplex into the çatı piyesi) are tools for unit yield or value. Each carries conditions, often local ones, so check them in the ledger before drawing one.

## Structural grid: rules of thumb (the engineer decides)

- Residential reinforced-concrete spans of about 4–6 m are economical. Past about 7 m, slab and beam depth and cost climb.
- The column grid must stack from basement to roof. Check it against the parking module first: three 2.40 m stalls need at least 7.20 m clear plus the columns. Columns go between stall groups and never in the aisle.
- Put party walls between units on grid lines.
- Keep columns out of the middle of rooms.
- Note how façade columns set the window rhythm.

## Section, not only plan

A plan that works can still fail in section. Check these before drawing:

- **Floor-to-floor height** comes from the plan notes (377/1's item 4.2.4: zemin 4.00, normal 3.50, bodrum 4.80, which are local values). Subtract slab and finishes, then compare the clear height against the regulation's minimum.
- **Stair geometry.** Risers = floor-to-floor ÷ riser height.
  - Example: 3.50 m at ≤ 0.18 m needs at least 20 risers of 0.175 m. That is two flights of 10, each a 9 × 0.28 m = 2.52 m run, plus landings.
  - Check comfort with Blondel: 2R + G ≈ 0.60–0.64 m. Here 0.35 + 0.28 = 0.63. Blondel is a comfort rule, not a code. Read the current stair article for legal limits.
  - The stair's plan size follows from this arithmetic. Size the core from it, not from a guess.
- **Ramp.** Ramp length = vertical drop ÷ allowed slope, using the Otopark Yönetmeliği ramp bentler. Re-read them.
  - Check it fits between the street and the parking level inside the parcel, not on the pavement. A 3 m drop needs 20 m of ramp at 15%. A 19.8 m-deep lot with a 5 m front garden cannot hold that, which changes the scheme (car lift, fewer stalls, surface parking).
- **Elevator.** Check the shaft size (377/1: local item 4.2.55, ≥ 3.00 m²), the pit below the lowest stop, and the overrun above the top stop.

## Ground floor and basement checklist

- **Ground floor:**
  - step-free entrance and the accessibility rules
  - lobby and mailboxes
  - refuse and bicycle storage
  - privacy for ground units
  - optional commercial use where the plan notes allow it (377/1: item 4.2.2, on roads ≥ 10 m), weighed against soft-storey risk
- **Basement:** lay out parking geometry first, then the ramp or lift, then everything else:
  - sığınak sized from the Sığınak Yönetmeliği, never a placeholder presented as sized
  - mechanical room
  - water tank and pumps
  - storage
  - the core

## Decision record template (goes into `notes/rationale.md`)

```
### Decision: <e.g. core position>
Context: <the ledger rows and site facts that bear on it>
Options: A <one line>  B <one line>  C <one line>   (sketch or diagram reference)
Criteria (weight): circulation (3), daylight (3), structure (2), entry (2), basement fit (2), services (1)
Scores: table, 1-5 per option per criterion, weighted total
Decision: <option>, because <the two or three criteria that decided it>
Given up: <what the chosen option is worse at>
Would change if: <facts that would flip it, e.g. a second frontage, a plankote showing a 2 m slope>
```

## Before showing the founder

- Can a licensed architect point at any element (core, unit split, stair, ramp, entrance) and find its reason written down?
- Is every number either a ledger row or labelled as a design assumption?
- Were at least three real options compared for each major decision?
- Does it work in section (stair, ramp, heights) as well as in plan?
- Did someone look at every sheet as a whole image, not only at verify results?
- Does every deliverable state that it is schematic and needs licensed-architect review before permitting or construction?
