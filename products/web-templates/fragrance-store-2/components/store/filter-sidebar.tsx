"use client";

import { cn } from "@/lib/utils";
import { SCENT_FAMILIES } from "@/lib/products";
import type { ScentFamily } from "@/lib/types";

export type Concentration = "Eau de Parfum" | "Eau de Toilette";
export type PriceBand = "under-90" | "90-150" | "150-plus";

export interface FilterState {
  families: ScentFamily[];
  concentrations: Concentration[];
  priceBands: PriceBand[];
}

const CONCENTRATIONS: Concentration[] = ["Eau de Parfum", "Eau de Toilette"];
const PRICE_BANDS: { id: PriceBand; label: string }[] = [
  { id: "under-90", label: "Under $90" },
  { id: "90-150", label: "$90 – $150" },
  { id: "150-plus", label: "$150+" },
];

interface FilterSidebarProps {
  value: FilterState;
  onChange: (value: FilterState) => void;
  className?: string;
}

function toggle<T>(list: T[], item: T): T[] {
  return list.includes(item) ? list.filter((v) => v !== item) : [...list, item];
}

export function FilterSidebar({ value, onChange, className }: FilterSidebarProps) {
  const activeCount =
    value.families.length + value.concentrations.length + value.priceBands.length;

  return (
    <div className={cn("space-y-8", className)}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-foil">
          Filter
        </p>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={() =>
              onChange({ families: [], concentrations: [], priceBands: [] })
            }
            className="-mx-2 -my-2 px-2 py-2 text-xs font-medium text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
          >
            Clear ({activeCount})
          </button>
        )}
      </div>

      <fieldset>
        <legend className="text-sm font-semibold">Family</legend>
        <div className="mt-3 flex flex-col gap-2.5">
          {SCENT_FAMILIES.map((family) => (
            <label
              key={family}
              className="-mx-1 flex min-h-[2.75rem] cursor-pointer items-center gap-2.5 rounded-sm px-1 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              <input
                type="checkbox"
                checked={value.families.includes(family)}
                onChange={() =>
                  onChange({ ...value, families: toggle(value.families, family) })
                }
                className="h-4 w-4 shrink-0 rounded-none border-border bg-transparent accent-primary"
              />
              {family}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-semibold">Concentration</legend>
        <div className="mt-3 flex flex-col gap-2.5">
          {CONCENTRATIONS.map((concentration) => (
            <label
              key={concentration}
              className="-mx-1 flex min-h-[2.75rem] cursor-pointer items-center gap-2.5 rounded-sm px-1 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              <input
                type="checkbox"
                checked={value.concentrations.includes(concentration)}
                onChange={() =>
                  onChange({
                    ...value,
                    concentrations: toggle(value.concentrations, concentration),
                  })
                }
                className="h-4 w-4 shrink-0 rounded-none border-border bg-transparent accent-primary"
              />
              {concentration}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-semibold">Price</legend>
        <div className="mt-3 flex flex-col gap-2.5">
          {PRICE_BANDS.map((band) => (
            <label
              key={band.id}
              className="-mx-1 flex min-h-[2.75rem] cursor-pointer items-center gap-2.5 rounded-sm px-1 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              <input
                type="checkbox"
                checked={value.priceBands.includes(band.id)}
                onChange={() =>
                  onChange({ ...value, priceBands: toggle(value.priceBands, band.id) })
                }
                className="h-4 w-4 shrink-0 rounded-none border-border bg-transparent accent-primary"
              />
              {band.label}
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
}

export function matchesFilters(
  product: { family: ScentFamily; concentration: Concentration; sizes: { price: number }[] },
  filters: FilterState
): boolean {
  if (filters.families.length && !filters.families.includes(product.family)) {
    return false;
  }
  if (
    filters.concentrations.length &&
    !filters.concentrations.includes(product.concentration)
  ) {
    return false;
  }
  if (filters.priceBands.length) {
    const startingPrice = Math.min(...product.sizes.map((s) => s.price));
    const inBand = filters.priceBands.some((band) => {
      if (band === "under-90") return startingPrice < 90;
      if (band === "90-150") return startingPrice >= 90 && startingPrice <= 150;
      return startingPrice > 150;
    });
    if (!inBand) return false;
  }
  return true;
}
