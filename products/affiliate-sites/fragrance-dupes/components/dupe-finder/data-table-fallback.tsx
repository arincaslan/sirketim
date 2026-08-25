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
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th scope="col" className="py-2 font-semibold">
                Facet
              </th>
              <th scope="col" className="py-2 font-semibold text-reference">
                {referenceName}
              </th>
              <th scope="col" className="py-2 font-semibold text-dupe">
                {dupeName}
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
