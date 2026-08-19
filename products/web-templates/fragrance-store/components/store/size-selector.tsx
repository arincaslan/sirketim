"use client";

import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import type { ProductSize } from "@/lib/types";

interface SizeSelectorProps {
  sizes: ProductSize[];
  selected: ProductSize;
  onSelect: (size: ProductSize) => void;
  layoutId: string;
}

export function SizeSelector({
  sizes,
  selected,
  onSelect,
  layoutId,
}: SizeSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {sizes.map((size) => {
        const isActive = size.ml === selected.ml;
        return (
          <button
            key={size.ml}
            type="button"
            onClick={() => onSelect(size)}
            className={cn(
              "relative rounded-md border px-4 py-2 text-sm font-medium transition-colors",
              isActive
                ? "border-primary text-primary-foreground"
                : "border-input text-foreground hover:border-primary/50"
            )}
          >
            {isActive && (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 -z-10 rounded-md bg-primary"
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
              />
            )}
            {size.ml}ml
          </button>
        );
      })}
    </div>
  );
}
