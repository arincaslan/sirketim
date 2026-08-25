"use client";

import { useId } from "react";
import { motion, useReducedMotion } from "motion/react";
import type { FacetScores } from "@/lib/types";
import { RADAR_AXES, buildRadarData } from "@/lib/similarity";
import { pointOnAxis, polygonPoints } from "@/lib/radar-geometry";

/**
 * The "Match Reveal" - this site's one signature motion moment. See
 * DESIGN.md §5. Plays once per viewport entry; fully static under
 * prefers-reduced-motion (both polygons render at final state immediately).
 */

const SIZE = 320;
const CENTER = SIZE / 2;
const MAX_RADIUS = 118;
const MAX_VALUE = 10;
const RINGS = [0.25, 0.5, 0.75, 1];

export function RadarChart({
  referenceName,
  dupeName,
  referenceFacets,
  dupeFacets,
}: {
  referenceName: string;
  dupeName: string;
  referenceFacets: FacetScores;
  dupeFacets: FacetScores;
}) {
  const shouldReduceMotion = useReducedMotion();
  const gradientId = useId();
  const count = RADAR_AXES.length;
  const rows = buildRadarData(referenceFacets, dupeFacets);

  const referencePoints = RADAR_AXES.map((axis, i) =>
    pointOnAxis(i, count, referenceFacets[axis.key], MAX_VALUE, CENTER, MAX_RADIUS)
  );
  const dupePoints = RADAR_AXES.map((axis, i) =>
    pointOnAxis(i, count, dupeFacets[axis.key], MAX_VALUE, CENTER, MAX_RADIUS)
  );

  const summary = rows
    .map((r) => `${r.axis}: ${referenceName} ${r.Reference} out of 10, ${dupeName} ${r.Dupe} out of 10`)
    .join(". ");

  return (
    <figure className="flex flex-col items-center gap-4">
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        role="img"
        aria-label={`Facet comparison radar chart. ${summary}.`}
        className="w-full max-w-[360px]"
      >
        <defs>
          <radialGradient id={gradientId}>
            <stop offset="0%" stopColor="hsl(var(--dupe))" stopOpacity="0.22" />
            <stop offset="100%" stopColor="hsl(var(--dupe))" stopOpacity="0.04" />
          </radialGradient>
        </defs>

        {/* Grid rings */}
        {RINGS.map((ring) => (
          <polygon
            key={ring}
            points={polygonPoints(
              RADAR_AXES.map((_, i) => pointOnAxis(i, count, ring * MAX_VALUE, MAX_VALUE, CENTER, MAX_RADIUS))
            )}
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth={1}
          />
        ))}

        {/* Spokes + axis labels */}
        {RADAR_AXES.map((axis, i) => {
          const outer = pointOnAxis(i, count, MAX_VALUE, MAX_VALUE, CENTER, MAX_RADIUS);
          const labelPoint = pointOnAxis(i, count, MAX_VALUE * 1.22, MAX_VALUE, CENTER, MAX_RADIUS);
          return (
            <g key={axis.key}>
              <line
                x1={CENTER}
                y1={CENTER}
                x2={outer.x}
                y2={outer.y}
                stroke="hsl(var(--border))"
                strokeWidth={1}
              />
              <text
                x={labelPoint.x}
                y={labelPoint.y}
                textAnchor="middle"
                dominantBaseline="middle"
                style={{ fill: "hsl(var(--muted-foreground))" }}
                className="font-sans text-[9px] font-semibold uppercase tracking-wide"
              >
                {axis.label}
              </text>
            </g>
          );
        })}

        {/* Reference polygon - draws in via pathLength ("Settle" motion, DESIGN.md §5) */}
        <motion.polygon
          points={polygonPoints(referencePoints)}
          fill="hsl(var(--series-reference) / 0.14)"
          stroke="hsl(var(--series-reference))"
          strokeWidth={2}
          strokeLinejoin="round"
          initial={shouldReduceMotion ? false : { pathLength: 0, opacity: 0.6 }}
          whileInView={{ pathLength: 1, opacity: 1 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.55, ease: "linear" }}
        />

        {/* Dupe polygon - fades and settles in shortly after, the one place
            on the site a small spring bounce is used deliberately. */}
        <motion.polygon
          points={polygonPoints(dupePoints)}
          fill={`url(#${gradientId})`}
          stroke="hsl(var(--series-dupe))"
          strokeWidth={2}
          strokeLinejoin="round"
          style={{ originX: 0.5, originY: 0.5 }}
          initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={
            shouldReduceMotion
              ? { duration: 0 }
              : { type: "spring", duration: 0.5, bounce: 0.18, delay: 0.4 }
          }
        />

        {/* Direct value labels on the Dupe series - the dataviz-required
            "relief" for the chart palette's contrast WARN (see DESIGN.md §3). */}
        {dupePoints.map((p, i) => (
          <text
            key={i}
            x={p.x}
            y={p.y - 8}
            textAnchor="middle"
            style={{ fill: "hsl(var(--series-dupe))" }}
            className="font-sans text-[9px] font-bold"
          >
            {dupeFacets[RADAR_AXES[i].key]}
          </text>
        ))}
      </svg>

      <figcaption className="flex items-center justify-center gap-6 text-xs font-semibold">
        <span className="flex items-center gap-1.5">
          <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-reference" />
          {referenceName}
        </span>
        <span className="flex items-center gap-1.5">
          <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-dupe" />
          {dupeName}
        </span>
      </figcaption>
    </figure>
  );
}
