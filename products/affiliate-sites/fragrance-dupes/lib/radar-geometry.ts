/** Pure trig helpers for the hand-built radar chart (no charting library -
 *  see DESIGN.md §5 for why this is a bespoke SVG component rather than a
 *  wrapped Recharts/Chart.js radar: the Match Reveal needs a literal
 *  stroke-draw + spring settle on two named polygons, which is far more
 *  reliable to build directly with Motion's SVG primitives than to reach
 *  into a charting library's internals for. */

export interface RadarPoint {
  x: number;
  y: number;
}

export function axisAngle(index: number, count: number): number {
  // Start at the top (-90deg) and go clockwise.
  return -Math.PI / 2 + (index * 2 * Math.PI) / count;
}

export function pointOnAxis(
  index: number,
  count: number,
  value: number,
  maxValue: number,
  center: number,
  maxRadius: number
): RadarPoint {
  const angle = axisAngle(index, count);
  const radius = (Math.max(0, Math.min(value, maxValue)) / maxValue) * maxRadius;
  return {
    x: center + radius * Math.cos(angle),
    y: center + radius * Math.sin(angle),
  };
}

export function polygonPoints(points: RadarPoint[]): string {
  return points.map((p) => `${p.x},${p.y}`).join(" ");
}
