# Building physics and environmental design

Physics is universal; climate and regulation are local. Turkish limits (TS 825:2024 zones and U-values, YSEB, sound classes) are in `09-regulation-quick-reference.md`. **The worked numbers below were computed for this file and are illustrative,** not a project calculation.

## 1. Heat: U-values in five minutes

- **U = 1 / (R_si + Σ d/λ + R_se)**
  - d: layer thickness (m)
  - λ: conductivity (W/mK)
  - R_si = 0.13, R_se = 0.04 m²K/W for walls (EN ISO 6946)
- **Typical λ (W/mK, approximate; use the product's declared value in a real calculation):**
  - graphite EPS about 0.031–0.032
  - EPS about 0.035–0.040
  - XPS about 0.030–0.036
  - stone wool about 0.035–0.040
  - AAC (gazbeton) about 0.09–0.16, by density class
  - hollow clay brick wall about 0.30–0.45
  - reinforced concrete about 2.0–2.5
  - gypsum plaster about 0.5
  - timber about 0.13
- **Worked examples** (20 mm gypsum plaster inside, 5 mm render outside):

| Wall | U (W/m²K) |
|---|---|
| AAC 20 cm + EPS 8 cm | **0.23** |
| Brick 19 cm (λ 0.33) + EPS 8 cm | **0.32** |
| RC column 20 cm + EPS 8 cm (insulation continuous over it) | **0.39** |
| RC column 20 cm, **no insulation** (insulation stopped at the column) | **3.30** |

- **The lesson of the last row.** Leave the columns and beams uninsulated and that strip of façade loses heat about 14× faster than the wall beside it. In a 1-D estimate (20 °C inside, 0 °C outside) its inside surface sits near 3–4 °C, which means **condensation and mould** on the room side.
- **Mould rule of thumb.** A temperature factor f_Rsi ≥ about 0.7 at every junction (ISO 13788 approach). The bare column above scores about 0.2; insulated, about 0.9.
- **TS 825:2024.** Turkey now has six degree-day zones with tighter U-values (`09`). Find the project's zone in the standard's province annex, then size the insulation. Don't reuse another zone's thickness.

## 2. Moisture and condensation

- Warm, moist indoor air must not reach a cold surface or a cold layer inside the construction.
- **Vapour control** goes on the warm (inside) side of insulation in roofs and lightweight walls. Outer layers must be more vapour-open than inner ones.
- **Check every build-up** with the Glaser method (in TS 825). Do this especially for warm pitched roofs, internal insulation and terraces.
- **The classic Turkish defects to design out:**
  - uninsulated columns and beams
  - balcony slabs (`04`)
  - cold window reveals
  - bathrooms without effective extract
  - basements without drainage or waterproofing

## 3. Sun and shading

- **Noon sun altitude = 90° − latitude ± 23.44°.** At 40.7°N (Karamürsel/İzmit): winter solstice about 26°, equinox about 49°, summer solstice about 73°. Turkey spans about 36–42°N, so adjust per site.
- **South façades** are easy to control. A horizontal overhang that shades summer sun lets winter sun in. Example: to shade a 1.5 m-tall window at summer noon at 40.7°N, the overhang projects about **0.47 m** above the window head (1.5 / tan 73°).
- **East and west façades** get low sun that overhangs cannot stop. Use vertical fins, external blinds or shutters, deep reveals, or simply fewer and smaller openings on the west.
- **North façades** get no direct sun most of the year: even light, but cold. Put stairs, wet rooms and storage there.
- Check neighbouring buildings' shadows on winter afternoons for ground-floor units. In ayrık nizam, side façades are about 6 m from the neighbour.

## 4. Ventilation and cooling

- **Cross-ventilation** works with openings on opposite or adjacent façades, across a plan depth up to about 5× the ceiling height. It is the main reason dual-aspect flats are better.
- **Single-sided ventilation** is effective to about 2–2.5× the ceiling height into the room.
- **Stack effect.** Warm air rises through stair cores, atria and shafts. That is useful for night cooling, and a smoke path in fire (`06`).
- **Kitchens and bathrooms** need extract: a window, or mechanical. Minimum window in `09`; kitchen hoods ducted to outside or into a shaft.

## 5. Design by climate region (Turkey)

| Region | Climate | Design emphasis |
|---|---|---|
| Marmara (İstanbul, Kocaeli, Bursa) | Temperate, humid; cold wet winters | Continuous insulation, driving-rain detailing, cross-ventilation, moderate glazing, sun on living rooms |
| Ege / Akdeniz (İzmir, Antalya) | Hot, humid or dry summers; mild winters | Shading first: overhangs, shutters, west protection. Cross-ventilation, light colours, covered outdoor space, cooling loads. |
| İç Anadolu (Ankara, Konya) | Cold winters, hot dry summers, big day–night swings | Compact forms, strong insulation, thermal mass with night cooling, south glazing for winter gain |
| Doğu Anadolu (Erzurum, Kars) | Very cold, snowy | Compactness, highest insulation and triple glazing, snow loads, entrance buffers (rüzgarlık), minimal north openings |
| Karadeniz (Trabzon, Rize) | Very wet, mild | Roof overhangs, steep roofs, waterproofing, drainage, ventilated façades, moisture control |
| Güneydoğu (Diyarbakır, Şanlıurfa) | Very hot dry summers | Thermal mass, shading, courtyards, small west openings, night ventilation |

## 6. Daylight

- **Rule of thumb:** glazing about 1/8–1/10 of the floor area for habitable rooms. Room depth no more than about 2–2.5× the window-head height from the window wall. Check the current PAİY text for any legal minimum (`09`).
- **Average daylight factor:** about 2% for living rooms and 1% for bedrooms is the classic target (BS 8206 tradition; EN 17037 now gives a fuller method).
- A light-well (ışıklık) only lights a room usefully if it is wide and its walls are light-coloured. Don't count a 1–2 m shaft as daylight for a living room.
- Light finishes, high window heads and glazed doors to balconies carry daylight deeper.

## 7. Acoustics

- **Two paths:** airborne sound (voices, TV) and impact sound (footsteps). Both pass through flanking routes: shared slabs, continuous walls, service penetrations.
- **Mass law.** Doubling a single wall's mass gains roughly 5–6 dB. Separating the layers (double walls, floating floors) gains more than adding mass.
- **Plan for quiet.** Don't put a bedroom against the neighbour's living room, the lift shaft, the stair or the refuse chute. Stack similar rooms over each other.
- **Regulation.** New buildings must reach at least sound-insulation class C under the Gürültü Yönetmeliği (`09`). The detailed limits are in its annexes; read them for separating walls and floors.

## 8. Energy and renewables

- **Order of priority:**
  1. Form and orientation (compactness, sun).
  2. Envelope (insulation, airtightness, thermal bridges, glazing).
  3. Efficient systems (condensing boilers or heat pumps, heat recovery).
  4. Renewables (solar thermal, PV, heat pumps).

  Renewables on a leaky building are wasted money.
- **Regulation.** The EKB (energy identity certificate, classes A–G) is calculated under the Binalarda Enerji Performansı Yönetmeliği. Buildings of 2,000 m² or more must be nearly zero-energy (YSEB) since 2025: EKB class B or better and at least 10% renewables (`09`, verify the details).
- **Common Turkish renewables:**
  - solar water heating (güneş kolektörü), widespread in the south
  - rooftop PV (çatı GES)
  - air-to-water heat pumps

  Reserve roof area and shaft space for them at concept stage.

## 9. Water, materials, landscape

- **Water.** Low-flow fittings. Rainwater harvesting for garden irrigation; check local plan notes for any requirement. Permeable paving.
- **Materials.** Concrete and steel dominate embodied carbon, so efficient structure (sensible spans, no oversizing) is the biggest lever. Prefer durable, local and low-VOC finishes.
- **Landscape.** Deciduous trees to the south and west give summer shade and winter sun. Shaded hard surfaces reduce heat-island effects. Plan soil depth where gardens sit on basements.
- **Certification.** LEED and BREEAM are international. Turkey's national scheme is **YeS-TR** (Bakanlık); verify its current status before promising it.
