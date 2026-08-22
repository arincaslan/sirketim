import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface GridSlot {
  key: string;
  node: ReactNode;
}

interface ProductGridProps {
  slots: GridSlot[];
  className?: string;
}

/**
 * Meridian's collection grid: a 12-column offset rhythm that repeats every six
 * slots, instead of Ambre's uniform grid or Nocturne's CSS-column masonry
 * (see DESIGN.md). Column spans + a light vertical stagger via margin-top
 * (never `translate`/negative margin, so rows can never overlap) create the
 * "break the rhythm occasionally" feel the brief asks for. Collapses to a
 * plain 1/2-column stack below `lg`.
 */
const PATTERN = [
  "lg:col-span-7",
  "lg:col-span-5 lg:mt-16",
  "lg:col-span-5",
  "lg:col-span-7 lg:mt-10",
  "lg:col-span-4",
  "lg:col-span-8 lg:mt-6",
];

export function ProductGrid({ slots, className }: ProductGridProps) {
  return (
    <div className={cn("grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-12", className)}>
      {slots.map((slot, index) => (
        <div key={slot.key} className={cn("sm:col-span-1", PATTERN[index % PATTERN.length])}>
          {slot.node}
        </div>
      ))}
    </div>
  );
}
