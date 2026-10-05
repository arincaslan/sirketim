# Architectural practice in Turkey: process, legal frame, cost

Legal process changes. This file gives the structure and vocabulary; figures and dates come from `09-regulation-quick-reference.md` or a fresh read of the source. **Sirketim does not sign or stamp projects.** A registered architect (proje müellifi) must sign anything submitted for a permit (department rule).

## 1. Who is who

| Role | What they do |
|---|---|
| **Mimarlar Odası** (TMMOB) | Chamber of Architects. Registration to practise, office registration (büro tescil), professional standards, minimum-fee guidance (Mimarlık Hizmetleri Şartnamesi). |
| **İç Mimarlar Odası** | Chamber of Interior Architects; publishes interior project standards |
| **Proje müellifi** | The architect or engineer who authors and signs a discipline's project and is responsible for it |
| **Yapı denetim kuruluşu** | Independent building-inspection firm (Law 4708). Mandatory for most buildings; supervises construction on the owner's and state's behalf. |
| **Şantiye şefi / fenni mesul** | Site manager / technically responsible person on site |
| **Belediye İmar Müdürlüğü** | Issues imar durumu, approves projects, issues the yapı ruhsatı and the yapı kullanma izni (iskan) |
| **TKGM / Tapu Müdürlüğü** | Cadastre and land registry: parcels, kat irtifakı, kat mülkiyeti |
| **LİHKAB** | Licensed surveying office: aplikasyon krokisi and other cadastral surveys |

## 2. From parcel to keys: the permit path (typical; municipal details vary)

1. **İmar durumu**, applied for with the aplikasyon krokisi. Read it with `zoning-compliance-tr`.
2. **Aplikasyon krokisi** from a LİHKAB: parcel corners, coordinates, dimensions. Also the plankote / yol ve arsa kotu tutanağı where the plan notes require one; this is the kırmızı kot source.
3. **Zemin etüdü** (geotechnical report) by a geological or geotechnical engineer, approved by the municipality.
4. **Projects:**
   - mimari (architecture), first
   - statik (structure) per the zemin etüdü and TBDY
   - mekanik (sanitary, heating, ventilation, fire, the TS 825 heat-insulation calculation, lift)
   - elektrik (electrical, low current)
   - plus peyzaj (landscape), doğalgaz (gas) and others as required
5. **Municipal check and approval** of the projects. Many municipalities now accept e-signed submissions.
6. **Yapı denetim contract** with a licensed inspection firm.
7. **Fees** (ruhsat harcı and others). **Otopark bedeli** applies if required parking cannot be provided on the parcel.
8. **Yapı ruhsatı** (building permit). It lapses if work does not start within 2 years or finish within 5 years of starting (3194 Madde 29, `09`).
9. **During construction:** foundation and ground-floor checks (temel / subasman vize, level check), inspection reports by the yapı denetim.
10. **Yapı kullanma izni (iskan):**
    - the building as approved
    - heat-insulation compliance
    - EKB (energy certificate)
    - shelter and parking as required
    - other institutions' approvals as required
11. **Kat mülkiyeti** at the land registry after iskan (§4).

## 3. The architectural permit set (mimari ruhsat projesi; check the municipality's list)

- **Vaziyet planı** (site plan, usually 1/500 or 1/200): parcel with dimensions and coordinates, setbacks, building footprint with dimensions, levels (kot) including ±0.00 and its relation to the kırmızı kot, entrances, parking and ramp, trees, neighbours, north arrow.
- **Floor plans** of every distinct floor (usually 1/100, 1/50 for small buildings): dimensions, room names and net areas, levels, door and window marks, stair and lift, shafts, sections marked.
- **At least two sections**, one through the stair: heights, levels, roof, foundation level, the ground line and the kırmızı kot.
- **All elevations**, with the ground line and levels.
- **Roof plan.**
- **Wall section (sistem kesiti, 1/20)** where required (`04` §11).
- **Area calculations:** TAKS, KAKS/emsal with the exclusions itemized (PAİY Madde 22, 30% cap, `09`), each bağımsız bölüm's area, common areas.
- **Parking plan and calculation** (Otopark Yönetmeliği), shelter calculation if required, accessibility provisions.
- **Mimari rapor** (written report).
- **Leave the approval area blank.** Never draw or imitate approval stamps (department rule, enforced in `lib/cadgen/titleblock.py`).

**Project stages and drawing scales** (Bayındırlık mimari proje düzenleme esasları and common şartnameler, `01` §1):
- **Avan:** site 1/500, plans 1/200.
- **Uygulama:** site 1/200; all plans and the roof at 1/50; at least 2 sections and 4 elevations at 1/50; mahal listesi; details at 1/20–1/1.

## 4. Kat irtifakı and kat mülkiyeti (Law 634); developers need this

- **Kat irtifakı** can be established on the land on the basis of the **approved architectural project**, before or during construction. It is what lets independent units (bağımsız bölüm) be sold off-plan.
- **Documents (TKGM list):**
  - the title deed
  - the approved mimari proje
  - the imar durumu
  - the site plan and ruhsat for multi-building sites
  - the **yönetim planı** (management plan, KMK m.12)
  - the **yapı aplikasyon projesi**
  - a **3-D digital building model of the architectural project**
  - the **arsa payı listesi**: each unit's land share, type and number, signed by all owners and notarized

  The 3-D model requirement means an architecture deliverable increasingly has to exist as a model, not only drawings.
- **Arsa payı** (land share) is usually distributed by unit value or area. Agree the method early with the owner.
- **Kat mülkiyeti** follows at the land registry after the **yapı kullanma izni (iskan)**.

## 5. Urban renewal (kentsel dönüşüm, Law 6306)

- Applies to risky buildings (riskli yapı tespiti by licensed institutions) and risk areas. Incentives and procedures are set by 6306 and its implementing regulation.
- **Decision threshold changed in 2023.** Law 7471 (07.11.2023) changed the majority for implementation decisions on risky buildings from **at least two-thirds** to **a simple majority of shareholders by share** (hisseleri oranında salt çoğunluk). Older guidance quoting 2/3 is out of date.
- **Design consequence.** Replacement projects must fit current PAİY, Otopark, Yangın and Sığınak rules. These often mean fewer or smaller units than the old building had, or bigger basements. Check the ledger before promising owners anything.

## 6. Cost

| Level | Method | Source |
|---|---|---|
| Official reference | Area × **yapı yaklaşık birim maliyeti** for the building class | Bakanlık tebliği, published every year (2026 figures in `09`). Used for fees, charges and the official cost. **Not a market price.** |
| Feasibility (market) | Area × current market cost per m² for comparable quality | Recent contractor quotes and comparable projects; research it and label the date and source |
| Detailed estimate (keşif) | Quantity takeoff (metraj) × unit prices | The Bakanlık's annual construction and installation unit-price books (poz numbers, used in public works), or contractor rates |

**Rule of thumb for a reinforced-concrete apartment** (rough split; verify per project and market):
- carcass (kaba inşaat): structure, masonry, roof, about 35–45%
- finishes (ince işler): about 35–45%
- mechanical and electrical: about 15–20%

Basements, retaining walls in poor ground, high groundwater and lifts move the numbers most.

## 7. Fees

The Mimarlar Odası publishes a fee schedule (*Mimarlık Hizmetleri Şartnamesi ve En Az Ücret Tarifesi*). It is based on the official approximate cost (§6) and the building class, split by project stage. Check its current status and figures before quoting. Sirketim's architecture work is schematic and advisory, so price it as consultancy, and state that a licensed architect's signed project is a separate cost.

## 8. Digital systems you will meet

- **TKGM Parsel Sorgu:** parcels, geometry download (`zoning-compliance-tr` §7).
- **e-Devlet / municipal e-imar portals:** imar durumu queries, plan viewers (kent rehberi), project submission with e-signature in many municipalities.
- **YDS (Yapı Denetim Sistemi, Bakanlık):** where permits, inspection firms and construction stages are tracked.
- **AFAD Türkiye Deprem Tehlike Haritası:** seismic parameters for TBDY.

Exact portals and procedures vary by municipality. Confirm per project.
