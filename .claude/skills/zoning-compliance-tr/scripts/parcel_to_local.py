"""
parcel_to_local.py -- turn a TKGM Parsel Sorgu GeoJSON download into a
parcel outline in local metres, ready to check against lib/cadgen's
LotGeometry.

Why this exists: 377/1's lot was drawn as a 36.02 x 19.80 m rectangle read
off the proportions of a plotted schema -- an estimate, not a survey. TKGM
Parsel Sorgu (parselsorgu.tkgm.gov.tr) gives the cadastral polygon for free
("Indir" -> GeoJSON). This script projects it to the TUREF / TM 3-degree
zone the imar durumu itself uses, puts the street frontage on the +x axis
(cadgen's convention: (0, 0) is the front-left corner, +y runs front to
rear), and reports how far the real outline is from a rectangle.

Checked against real data: pyproj EPSG:4326 -> EPSG:5254 reproduces the
coordinates printed on 377/1's imar durumu (40d42'3.248"N 29d40'1.315"E ->
Y=471859.39 X=4507411.51) to within 1 cm.

Limits, stated plainly:
- TKGM's online geometry is informational. The legal outline for a permit is
  the aplikasyon krokisi / plankote from a licensed surveyor. Use this for
  design, and say so wherever the numbers end up.
- WGS84 vs TUREF (ITRF96, epoch 2005) is treated as identical, which can
  shift ABSOLUTE position by decimetres. Edge lengths, angles and area --
  the things a lot outline needs -- are unaffected.
- Map projection scale error inside a 3-degree zone is below ~1:7000, so the
  computed area can differ slightly from the official figure; a difference of
  more than a few tenths of a percent means the wrong parcel or wrong zone.

Usage:
    pip install pyproj
    python parcel_to_local.py parsel.geojson                      # list edges
    python parcel_to_local.py parsel.geojson --front-side north \\
        --official-area 713.26 --json lot.json

Exit code is non-zero on bad input; it never guesses a frontage.
"""

from __future__ import annotations

import argparse
import json
import math
import sys
from pathlib import Path

try:
    from pyproj import CRS, Transformer
except ImportError:  # pragma: no cover - environment message only
    sys.exit("pyproj is required: pip install pyproj")

# TUREF / TM zones (3-degree, central meridians 27..45 E), EPSG-registered.
TUREF_TM_EPSG = {27: 5253, 30: 5254, 33: 5255, 36: 5256, 39: 5257, 42: 5258, 45: 5259}

# A lot whose corners are this close to 90 degrees and whose area fills this
# much of its bounding rectangle can be passed to cadgen as a rectangle.
RECT_ANGLE_TOL_DEG = 1.0
RECT_FILL_MIN = 0.99

Point = tuple[float, float]


def load_ring(path: Path) -> tuple[list[Point], dict]:
    data = json.loads(path.read_text(encoding="utf-8"))
    props: dict = {}
    if data.get("type") == "FeatureCollection":
        feats = data.get("features") or []
        if len(feats) != 1:
            raise ValueError(f"expected exactly one parcel feature, found {len(feats)}")
        data = feats[0]
    if data.get("type") == "Feature":
        props = data.get("properties") or {}
        data = data.get("geometry") or {}
    gtype = data.get("type")
    coords = data.get("coordinates")
    if gtype == "MultiPolygon":
        if len(coords) != 1:
            raise ValueError(f"MultiPolygon with {len(coords)} parts -- a parcel should be one polygon")
        coords = coords[0]
    elif gtype != "Polygon":
        raise ValueError(f"unsupported geometry type {gtype!r}")
    if len(coords) > 1:
        raise ValueError("polygon has holes -- not a simple parcel outline, check the download")
    ring = [(float(x), float(y)) for x, y, *_ in coords[0]]
    if len(ring) > 1 and ring[0] == ring[-1]:
        ring = ring[:-1]
    if len(ring) < 3:
        raise ValueError("fewer than 3 distinct vertices")
    return ring, props


def signed_area(pts: list[Point]) -> float:
    return 0.5 * sum(x0 * y1 - x1 * y0 for (x0, y0), (x1, y1) in zip(pts, pts[1:] + pts[:1]))


def edges(pts: list[Point]) -> list[tuple[int, Point, Point, float, float]]:
    """(index, start, end, length, bearing in degrees clockwise from grid north)."""
    out = []
    for i, (a, b) in enumerate(zip(pts, pts[1:] + pts[:1])):
        dx, dy = b[0] - a[0], b[1] - a[1]
        out.append((i, a, b, math.hypot(dx, dy), math.degrees(math.atan2(dx, dy)) % 360.0))
    return out


def outward_normal_bearing(bearing: float) -> float:
    # For a counter-clockwise ring the interior is on the left of each edge,
    # so the outward normal points 90 degrees clockwise of travel.
    return (bearing + 90.0) % 360.0


def side_to_bearing(side: str) -> float:
    return {"north": 0.0, "east": 90.0, "south": 180.0, "west": 270.0}[side]


def angle_diff(a: float, b: float) -> float:
    return abs((a - b + 180.0) % 360.0 - 180.0)


def interior_angles(pts: list[Point]) -> list[float]:
    n = len(pts)
    out = []
    for i in range(n):
        p0, p1, p2 = pts[i - 1], pts[i], pts[(i + 1) % n]
        a = math.atan2(p0[1] - p1[1], p0[0] - p1[0])
        b = math.atan2(p2[1] - p1[1], p2[0] - p1[0])
        ang = math.degrees((a - b) % (2 * math.pi))  # CCW ring -> interior angle
        out.append(ang)
    return out


def to_local(pts: list[Point], front: int) -> list[Point]:
    """Rotate so edge `front` runs along +x with the lot interior at +y, then
    translate so the frontage edge's left end (plan view, street at bottom)
    is (0, 0)."""
    a, b = pts[front], pts[(front + 1) % len(pts)]
    theta = math.atan2(b[1] - a[1], b[0] - a[0])
    c, s = math.cos(-theta), math.sin(-theta)
    rot = [((x - a[0]) * c - (y - a[1]) * s, (x - a[0]) * s + (y - a[1]) * c) for x, y in pts]
    # CCW ring: interior is left of travel, i.e. +y after this rotation.
    minx = min(rot[front][0], rot[(front + 1) % len(rot)][0])
    shifted = [(x - minx, y) for x, y in rot]
    start = front if rot[front][0] <= rot[(front + 1) % len(rot)][0] else (front + 1) % len(rot)
    return shifted[start:] + shifted[:start]


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("geojson", type=Path)
    ap.add_argument("--src-epsg", type=int, default=4326, help="CRS of the file (TKGM GeoJSON is lon/lat, 4326)")
    ap.add_argument("--epsg", type=int, help="target TUREF/TM EPSG (5253..5259); default derived from longitude")
    ap.add_argument("--front-edge", type=int, help="index of the street-frontage edge, as listed by a first run")
    ap.add_argument("--front-side", choices=["north", "east", "south", "west"],
                    help="pick the frontage as the edge facing this side (from the imar durumu's road)")
    ap.add_argument("--official-area", type=float, help="area on the tapu / imar durumu, m2, for a cross-check")
    ap.add_argument("--json", type=Path, help="write the result here")
    args = ap.parse_args(argv)

    try:
        ring, props = load_ring(args.geojson)
    except (ValueError, KeyError, json.JSONDecodeError) as e:
        print(f"bad input: {e}", file=sys.stderr)
        return 2

    if args.src_epsg == 4326 and any(abs(x) > 180 or abs(y) > 90 for x, y in ring):
        print("coordinates are not lon/lat -- pass --src-epsg for a projected file", file=sys.stderr)
        return 2

    if args.epsg is None:
        if args.src_epsg != 4326:
            print("--epsg is required when the source is not lon/lat", file=sys.stderr)
            return 2
        lon = sum(x for x, _ in ring) / len(ring)
        cm = 3 * round(lon / 3)
        if cm not in TUREF_TM_EPSG:
            print(f"longitude {lon:.3f} is outside Turkey's TM27..TM45 zones", file=sys.stderr)
            return 2
        args.epsg = TUREF_TM_EPSG[cm]
        print(f"zone: TM{cm} (EPSG:{args.epsg}) derived from longitude {lon:.5f} -- "
              "cross-check against the dilim / D.O.M. printed on the imar durumu")
    tf = Transformer.from_crs(f"EPSG:{args.src_epsg}", f"EPSG:{args.epsg}", always_xy=True)
    proj = [tf.transform(x, y) for x, y in ring]  # (easting, northing)
    if signed_area(proj) < 0:
        proj.reverse()

    print(f"target CRS: {CRS(f'EPSG:{args.epsg}').name}")
    if props:
        print("properties in file:", json.dumps(props, ensure_ascii=False))
    area = signed_area(proj)
    print(f"vertices: {len(proj)}   area: {area:.2f} m2   perimeter: {sum(e[3] for e in edges(proj)):.2f} m")
    if args.official_area:
        pct = 100.0 * (area - args.official_area) / args.official_area
        print(f"official area {args.official_area:.2f} m2 -> difference {area - args.official_area:+.2f} m2 ({pct:+.3f}%)")
        if abs(pct) > 0.5:
            print("  WARNING: more than 0.5% off -- wrong parcel, wrong zone, or the official figure is the deed's, "
                  "not the GIS area. Resolve before using this outline.")

    print("\nedges (projected; bearing = direction of travel, facing = outward normal):")
    for i, a, b, length, bearing in edges(proj):
        print(f"  [{i}] {length:8.2f} m  bearing {bearing:6.1f}  facing {outward_normal_bearing(bearing):6.1f}")

    front = args.front_edge
    if front is None and args.front_side:
        target = side_to_bearing(args.front_side)
        front = min(edges(proj), key=lambda e: angle_diff(outward_normal_bearing(e[4]), target))[0]
        print(f"\nfrontage: edge [{front}] is the one facing {args.front_side}")
    if front is None:
        print("\nno frontage given: re-run with --front-side (the road side from the imar durumu) "
              "or --front-edge <index>. Not guessing which side is the street.")
        return 0
    if not 0 <= front < len(proj):
        print(f"--front-edge must be 0..{len(proj) - 1}", file=sys.stderr)
        return 2

    local = to_local(proj, front)
    angles = interior_angles(local)
    xs, ys = [p[0] for p in local], [p[1] for p in local]
    width, depth = max(xs) - min(xs), max(ys) - min(ys)
    fill = area / (width * depth)
    worst = max(angle_diff(a, 90.0) for a in angles) if len(local) == 4 else float("nan")
    rect_ok = len(local) == 4 and worst <= RECT_ANGLE_TOL_DEG and fill >= RECT_FILL_MIN

    print("\nlocal frame (m): (0,0) = front-left corner, +x along the frontage, +y toward the rear")
    for (x, y), ang in zip(local, angles):
        print(f"  ({x:8.3f}, {y:8.3f})   interior angle {ang:6.2f}")
    print(f"bounding rectangle: width {width:.2f} m x depth {depth:.2f} m; polygon fills {fill:.4f} of it")
    if rect_ok:
        print(f"rectangle is a fair stand-in: LotGeometry(width={width:.2f}, depth={depth:.2f}, "
              "source_note='TKGM Parsel Sorgu GeoJSON <date>; informational, not an aplikasyon krokisi')")
    else:
        why = (f"{len(local)} vertices" if len(local) != 4 else f"worst corner {worst:.2f} deg off square")
        print(f"NOT a rectangle ({why}, fill {fill:.4f}). lib/cadgen's LotGeometry is rectangle-only: "
              "say so and do not force this outline into width x depth.")

    if args.json:
        args.json.write_text(json.dumps({
            "source_file": str(args.geojson), "epsg": args.epsg, "area_m2": round(area, 3),
            "official_area_m2": args.official_area, "front_edge": front,
            "local_vertices_m": [[round(x, 4), round(y, 4)] for x, y in local],
            "interior_angles_deg": [round(a, 3) for a in angles],
            "bbox_width_m": round(width, 4), "bbox_depth_m": round(depth, 4),
            "fill_ratio": round(fill, 5), "rectangle_ok": rect_ok, "properties": props,
            "caveat": "TKGM online geometry is informational; the permit outline is the aplikasyon krokisi/plankote.",
        }, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"\nwrote {args.json}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
