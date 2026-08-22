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
      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Size</span>
      <div role="radiogroup" aria-label="Bottle size" className="mt-2 flex flex-wrap gap-2">
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
                "flex min-h-[2.75rem] flex-col items-center justify-center gap-0.5 rounded-pill border px-4 py-2 text-sm transition-colors",
                isActive
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-foreground hover:border-foreground/40"
              )}
            >
              <span className="font-semibold">{size.isSample ? "Sample" : `${size.ml}ml`}</span>
              <span className={cn("text-xs", isActive ? "text-primary-foreground/80" : "text-muted-foreground")}>
                {formatPrice(size.price)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
