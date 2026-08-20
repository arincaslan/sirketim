# Client: Parcel 377/1 — Ereğli Mah., Karamürsel, Kocaeli

**Status: confirmed real client engagement** (founder confirmed 2026-08-20; registered in `../../../shared/clients.md`). This folder started as a checkpoint exercise — the founder asked the department to run the `project-brief` skill and `lib/cadgen` end-to-end against this parcel's real intake documents, before writing up the department's general workflow — but the underlying project is real, not practice-only. The ground floor delivered so far is still schematic/example-fidelity output (see `notes/rationale.md`), not a finished deliverable; treat this as an active project's first milestone, not a completed engagement.

## Depth tier

**Schematic** (the department's default and current baseline — see `departments/architecture/CLAUDE.md`, "Floor plan generation"). Full production set (sections/elevations/schedules/finishes/furnishing) is roadmapped, not built.

## Site

- İl / İlçe / Mahalle: Kocaeli / Karamürsel / Ereğli
- Ada / Parsel: 377 / 1, Tapu Kütüğü: Ereğli, Pafta G23D04D3D
- Kapı No 78, Selçuk Bey Caddesi (street name officially "Belirtilmemiş" — not designated on the parcel document itself)
- Parcel area: 713.26 m² (GIS/current figure; both source documents flag "Tapu alanı esastır" — the deed's own stated area governs if it differs. No tapu (deed) document has been provided yet, so this is not reconciled.)
- Approved plan: Karamürsel İlçesi 1/1000 Ölçekli Uygulama İmar Planı, tasdik 13.01.2022 no. 50
- Geological zone: ÖA-5.1
- Plan Fonksiyonu: Konut Alanı (residential)
- Single road frontage: Selçuk Bey Caddesi (12m) to the north. NOT a corner parcel and NOT a two-road-frontage parcel — Rüzgar Sk (10m) is further south, beyond interior parcels 377/11 and 377/12, not directly adjacent to 377/1.

## Source documents (outside the repo)

`C:\Users\Semih\Desktop\377-1\imardurumu.pdf`, `minuspalityimardurumu.pdf`, `plannotes.pdf`. All three read directly and in full for this pass (in addition to the prior gap-analysis pass — see `departments/architecture/reports/cad-tooling-gap-analysis.md`).

## Zoning constraints (confirmed from source, both parcel documents agree)

| Constraint | Value | Source |
|---|---|---|
| TAKS | 0.25 | imardurumu.pdf, minuspalityimardurumu.pdf |
| KAKS / Emsal | 1.00 | imardurumu.pdf, minuspalityimardurumu.pdf |
| Kat Adedi (above-grade floors) | 4 | imardurumu.pdf, minuspalityimardurumu.pdf; plan notes item 2.3 corroborates |
| İnşaat Nizamı | Ayrık (detached) | both parcel documents |
| Ön Bahçe (front) | 5 m | both parcel documents |
| Yan Bahçe (side) | 3 m each | both parcel documents |
| Arka Bahçe (rear) | 3 m | **resolved this pass** — blank on both parcel documents; plan notes item 4.2.10's h/2 formula does not apply (scoped to mixed residential+commercial blocks, 377/1 is pure Konut Alanı); plan notes item 1.1 directs fallback to the national **Planlı Alanlar İmar Yönetmeliği**, Madde 23(1)(c): "Arka bahçe mesafesi en az 3.00 metredir." (The +0.50m/floor increment in Madde 23(1)(ç) for buildings over 4 stories does not trigger — Kat Adedi=4, not >4.) |
| Basement floors (bodrum kat) | 1 occupied/habitable floor without reducing upper floors (more allowed if dedicated to parking/service, not counted toward KAKS/occupied-floor cap) | plan notes item 2.9 (Ereğli/Tepeköy, D-130-north, 4-kat blocks: "birden fazla bodrum kat yapılmasına müsaade edilmez ve toplam kat sayısı 5'i geçemez" — geographic applicability to 377/1 not independently confirmed, see rationale.md) and item 4.2.60/4.2.61 (general, plan-wide, no geographic qualifier — converges on the same practical answer independent of item 2.9's applicability) |
| Bina Yüksekliği (gabari, meters) | Not stated on either document (blank/dash) — height governed by Kat Adedi=4 instead. Eave-level estimate: 14.50 m (derived, see rationale.md) | — |
| Kırmızı kot (red grade line) | **Not available — no plankote document provided.** Placeholder datum used (0.00 m absolute), clearly flagged, not a real site elevation. | plan notes item 4.1.8 names the document type (Yol ve Arsa Kotu Tutanağı) that would carry this; not among the three PDFs. |

## Parcel geometry

Read directly off the plotted schema in both `minuspalityimardurumu.pdf` (hand-drawn 1/1000 İmar Durumu sheet) and `imardurumu.pdf` (KEOS GIS export). Topology/adjacency/orientation: high confidence (independently corroborated by both documents — simple quadrilateral, no jogs, wider than deep, single frontage north on Selçuk Bey Caddesi). Specific width/depth split (36.02m × 19.80m, used as `LotGeometry` input): a visual-proportion estimate anchored to the confirmed 713.26 m² area, **not a surveyed dimension** — neither plotted document has a legible printed edge-length on the parcel boundary itself. See `notes/rationale.md` for full discussion and what it would take to firm this up (Arsa Aplikasyon Krokisi or Plankote).

## Room program

See `brief.md` for the full 5-level concept program (basement + ground + 3 upper floors + roof piyes), derived through real space-planning judgment (adjacency, circulation, natural light, Turkish residential minimums per Planlı Alanlar İmar Yönetmeliği Madde 29/32). Only the **ground floor** was carried through to concrete DXF/SVG/DWG geometry this pass — `lib/cadgen/plan.py` is single-level only (a documented foundation-phase limitation, not specific to this project).

## Deliverables (this pass)

- `cad/377-1-ground-floor.dxf` / `.svg` / `.dwg` — schematic ground floor plan, example/practice output
- `brief.md` — site summary, full room program, concept narrative
- `notes/rationale.md` — design rationale, compliance verification results, open items

**Every drawing here is schematic and requires licensed-architect review before permitting or construction. None of it is stamped, approved, or code-compliant in a legal sense.**
