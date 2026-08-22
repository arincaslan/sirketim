"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SCENT_FAMILIES } from "@/lib/products";
import { FAMILY_MATERIAL } from "@/lib/scent-material";
import {
  AVAILABILITY_OPTIONS,
  PRICE_BANDS,
  countActiveFilters,
  toggleValue,
  type FilterState,
} from "@/lib/filters";
import type { Concentration, GenderExpression, Intensity, Season, ScentFamily } from "@/lib/types";

const GENDERS: GenderExpression[] = ["Feminine", "Masculine", "Unisex"];
const INTENSITIES: Intensity[] = ["Light", "Moderate", "Intense"];
const SEASONS: Season[] = ["Spring", "Summer", "Fall", "Winter"];
const FORMATS: Concentration[] = ["Eau de Parfum", "Eau de Toilette"];
const SIZES = [30, 50, 100];

interface ChipGroupProps<T extends string | number> {
  label: string;
  options: readonly { id: T; label: string }[] | readonly T[];
  selected: T[];
  onToggle: (value: T) => void;
  /** Tints an active chip with a per-option color instead of the generic
   * brand accent — used for the "Olfactive family" group only, per
   * DESIGN.md's family-palette job description. */
  colorFor?: (id: T) => string | undefined;
}

function ChipGroup<T extends string | number>({ label, options, selected, onToggle, colorFor }: ChipGroupProps<T>) {
  const normalized = options.map((o) => (typeof o === "object" ? o : { id: o, label: String(o) }));
  return (
    <fieldset>
      <legend className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</legend>
      {/* Wraps rather than clipping (ui-ux-pro-max chip-collection-reflow). */}
      <div className="mt-2.5 flex flex-wrap gap-2">
        {normalized.map((option) => {
          const active = selected.includes(option.id);
          const color = colorFor?.(option.id);
          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={active}
              onClick={() => onToggle(option.id)}
              style={active && color ? { borderColor: color, backgroundColor: color, color: "white" } : undefined}
              className={cn(
                "min-h-[2.5rem] rounded-pill border px-4 text-sm font-medium transition-colors",
                active
                  ? color
                    ? ""
                    : "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-transparent text-foreground hover:border-foreground/40"
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function familyChipColor(family: ScentFamily): string {
  return `hsl(${FAMILY_MATERIAL[family].deep.hsl})`;
}

interface FilterControlsProps {
  value: FilterState;
  onChange: (value: FilterState) => void;
}

export function FilterControls({ value, onChange }: FilterControlsProps) {
  const activeCount = countActiveFilters(value);

  return (
    <div className="flex flex-col gap-7">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">Filters</p>
        {activeCount > 0 && (
          <Button variant="link" size="sm" className="h-auto p-0 text-xs" onClick={() => onChange({ ...value, families: [], genders: [], intensities: [], seasons: [], priceBands: [], sizes: [], availabilities: [], formats: [], sampleOnly: false })}>
            Clear all ({activeCount})
          </Button>
        )}
      </div>

      <ChipGroup
        label="Olfactive family"
        options={SCENT_FAMILIES}
        selected={value.families}
        onToggle={(family) => onChange({ ...value, families: toggleValue(value.families, family) })}
        colorFor={familyChipColor}
      />
      <ChipGroup
        label="Gender expression"
        options={GENDERS}
        selected={value.genders}
        onToggle={(gender) => onChange({ ...value, genders: toggleValue(value.genders, gender) })}
      />
      <ChipGroup
        label="Intensity"
        options={INTENSITIES}
        selected={value.intensities}
        onToggle={(intensity) => onChange({ ...value, intensities: toggleValue(value.intensities, intensity) })}
      />
      <ChipGroup
        label="Season"
        options={SEASONS}
        selected={value.seasons}
        onToggle={(season) => onChange({ ...value, seasons: toggleValue(value.seasons, season) })}
      />
      <ChipGroup
        label="Format"
        options={FORMATS}
        selected={value.formats}
        onToggle={(format) => onChange({ ...value, formats: toggleValue(value.formats, format) })}
      />
      <ChipGroup
        label="Size"
        options={SIZES.map((ml) => ({ id: ml, label: `${ml}ml` }))}
        selected={value.sizes}
        onToggle={(ml) => onChange({ ...value, sizes: toggleValue(value.sizes, ml) })}
      />
      <ChipGroup
        label="Price"
        options={PRICE_BANDS}
        selected={value.priceBands}
        onToggle={(band) => onChange({ ...value, priceBands: toggleValue(value.priceBands, band) })}
      />
      <ChipGroup
        label="Availability"
        options={AVAILABILITY_OPTIONS}
        selected={value.availabilities}
        onToggle={(availability) =>
          onChange({ ...value, availabilities: toggleValue(value.availabilities, availability) })
        }
      />

      <label className="flex min-h-[2.75rem] cursor-pointer items-center gap-2.5 text-sm">
        <input
          type="checkbox"
          checked={value.sampleOnly}
          onChange={() => onChange({ ...value, sampleOnly: !value.sampleOnly })}
          className="h-4 w-4 shrink-0 accent-primary"
        />
        Sample available only
      </label>
    </div>
  );
}
