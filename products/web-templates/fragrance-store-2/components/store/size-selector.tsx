"use client";

import { cn, formatPrice } from "@/lib/utils";
import type { ProductSize } from "@/lib/types";

interface SizeSelectorProps {
  sizes: ProductSize[];
  selected: number;
  onChange: (ml: number) => void;
}

export function SizeSelector({ sizes, selected, onChange }: SizeSelectorProps) {
  return (
    <div>
      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Size
      </span>
      <div
        role="radiogroup"
        aria-label="Bottle size"
        className="mt-2 grid grid-cols-3 gap-2"
      >
        {sizes.map((size) => {
          const isActive = size.ml === selected;
          return (
            <button
              key={size.ml}
              type="button"
              role="radio"
              aria-checked={isActive}
              onClick={() => onChange(size.ml)}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 border px-2 py-3 text-sm transition-colors",
                isActive
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border text-muted-foreground hover:border-foil/50 hover:text-foreground"
              )}
            >
              <span className="font-semibold">{size.ml}ml</span>
              <span className="text-xs">{formatPrice(size.price)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
