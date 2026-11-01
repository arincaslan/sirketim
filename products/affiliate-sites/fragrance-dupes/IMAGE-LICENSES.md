# Image licence register

Written 2026-11-01. **This is the one file that records image licences** -
founder instruction the same day ("lisansları sadece bir dosyada tut"). Code
comments and other docs point here rather than repeating it. Every image the
site serves, where it came from, and what lets us show it. Re-measure before
quoting the counts:

```bash
# from this directory, after a build
for d in fragrance fragrance-cj fragrance-pm fragrance-irfe dupe originals originals-pm; do
  echo "$d $(grep -rhoE "src=\"/images/$d/[A-Za-z0-9._-]+" out --include=*.html | sort -u | wc -l)"
done
```

**There are no stock photographs on the site.** Nothing was bought from or
downloaded off a stock library. Everything is one of three kinds below.

## 1. Merchant product photographs (affiliate programmes)

The rule (from `CLAUDE.md`): **the licence rides on the affiliate
relationship, not on the picture.** A merchant supplies product imagery in its
feed so publishers can promote its products; we show a merchant's photograph
only while we are enrolled in its programme and link to that product through
it. Self-hosted, never hot-linked.

| Directory | Merchant / programme | Shown (built HTML, 2026-11-01) | Status |
|---|---|---|---|
| `public/images/fragrance-cj/` | FragranceShop.com, CJ 16941446 | 116 | live |
| `public/images/originals/` | FragranceShop.com, CJ 16941446 | 58 | live |
| `public/images/fragrance-pm/` | Perfumania, CJ 17335854 | 6 | live |
| `public/images/originals-pm/` | Perfumania, CJ 17335854 | 192 | live |
| `public/images/fragrance-irfe/` | Maison IRFE, CJ 17213922 | 8 | live |
| `public/images/dupe/` | Opulensi (Awin 123248), Clone of Perfume (117395), AromaPassions (34989) | 77 | live |
| `public/images/fragrance/` | My Perfume Shop, Awin 106089 | 74 | programme **closed for tracking** since 2026-09-01; still shown |

**The closed programme's photographs stay on the site - founder decision,
2026-11-01** ("hiçbir görseli kaldırma ... affiliate'lerden gelen resimlerin
sorumlusu belli zaten"). They were supplied by the merchant through its own
affiliate feed while we were enrolled, and the merchant is the party that
published them for that use. The first 2026-11-01 deploy switched them off;
the follow-up deploy the same day put them back.

What this register records instead, so the position is explicit rather than
silent: for these 74 there is no live programme behind the image, only the
past enrolment. If My Perfume Shop or a rights holder ever asks for removal,
the fix is one line in `lib/data/references.ts` (drop `FEED_IMAGES` from the
merge) and the references fall back to the generated note-signature mark.

## 2. Retailer marks (logos)

`public/images/retailers/` - six wordmarks shown on the home page under a
heading saying these are the retailers we earn from (a disclosure, never a
"partners" strip). Provenance per mark is recorded in `lib/merchants.ts`: two
from the networks' own advertiser creatives, four from the retailer's own site
header. They are used nominatively to identify the company, painted one colour
via CSS mask and never otherwise altered. Remove a mark the day its programme
ends.

## 3. Generated mood imagery (OpenArt)

`public/generated/` - six files: four still images
(`about-standards-atmosphere.png`, `dupe-comparison-1-support.png`,
`dupe-comparison-2-support.png`, `home-hero-atmosphere.png`) and two video loops
(`home-hero-loop.mp4`, `chapter-try-it-loop.mp4`). Made with OpenArt for the
site build (`DESIGN.md` sections 7 and 10). Abstract scent-mood imagery: no real
bottle, label or brand appears, per the trademark caution in
`departments/web-development/CLAUDE.md`.

**Open item for the founder:** confirm that the OpenArt plan used when these
were generated grants commercial use of outputs, and keep a dated copy of those
terms here. This register does not assert it.

`public/og-cover.png` is our own design (rendered from a throwaway route, see
`CLAUDE.md`).

## 4. What must never be added

- A retailer's photograph from a programme we are not in, or copied off a shop
  page.
- A generated render of a real, identifiable bottle (trade dress).
- A stock photo without its licence recorded in this file, with the date and
  the licence text or link.
- An altered or AI-redrawn retailer logo.
