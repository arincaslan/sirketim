"use client";

import { useState } from "react";
import { CaretDown } from "@phosphor-icons/react/dist/ssr";
import { RADAR_AXES } from "@/lib/similarity";
import type { FacetScores } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Accessible/CVD-safe fallback for the radar chart, per the dataviz skill's
 * requirement to ship a table view alongside any chart carrying a contrast
 * WARN or floor-band CVD result (see DESIGN.md §3). Collapsed by default,
 * one click away - not buried.
 */
export function DataTableFallback({
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
  const [open, setOpen] = useState(false);

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="mx-auto flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-primary"
      >
        View as table
        <CaretDown
          className={cn("h-3 w-3 transition-transform duration-200", open && "rotate-180")}
          aria-hidden
        />
      </button>

      {open && (
        <table className="mt-4 w-full border-collapse text-sm">
          <caption className="sr-only">
            Facet-by-facet comparison of {referenceName} and {dupeName}, rated 0 to 10.
          </caption>
          <thead>
            {/* Swatches rather than tinted header text. This table IS the
                colour-blind and screen-reader fallback for the radar chart, so
                it was the worst possible place to identify a column by hue
                alone - and `text-reference`/`text-dupe` measure 2.77:1 and
                4.03:1 on this surface in dark mode besides, both under AA.
                A swatch is a non-text mark and owes 3:1, which both clear. */}
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th scope="col" className="py-2 font-semibold">
                Facet
              </th>
              <th scope="col" className="py-2 font-semibold text-foreground/80">
                <span className="flex items-center gap-1.5">
                  <span aria-hidden className="h-2 w-2 shrink-0 rounded-pill bg-reference-mark" />
                  {referenceName}
                </span>
              </th>
              <th scope="col" className="py-2 font-semibold text-foreground/80">
                <span className="flex items-center gap-1.5">
                  <span aria-hidden className="h-2 w-2 shrink-0 rounded-pill bg-dupe-mark" />
                  {dupeName}
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {RADAR_AXES.map(({ key, label }) => (
              <tr key={key} className="border-b border-border/60">
                <th scope="row" className="py-2 text-left font-medium text-foreground/85">
                  {label}
                </th>
                <td className="py-2 tabular-nums">{referenceFacets[key]}/10</td>
                <td className="py-2 tabular-nums">{dupeFacets[key]}/10</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
