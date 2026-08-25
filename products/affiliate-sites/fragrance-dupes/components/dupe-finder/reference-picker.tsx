"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import type { ReferenceFragrance } from "@/lib/types";

export function ReferencePicker({
  references,
  selectedSlug,
  onSelect,
}: {
  references: ReferenceFragrance[];
  selectedSlug: string;
  onSelect: (slug: string) => void;
}) {
  return (
    <div
      role="radiogroup"
      aria-label="Choose a reference fragrance"
      className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6"
    >
      {references.map((ref, index) => {
        const active = ref.slug === selectedSlug;
        return (
          <motion.button
            key={ref.slug}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onSelect(ref.slug)}
            initial={{ opacity: 0, transform: "translateY(10px) scale(0.96)" }}
            animate={{ opacity: 1, transform: "translateY(0px) scale(1)" }}
            transition={{ duration: 0.35, delay: index * 0.04, ease: [0.23, 1, 0.32, 1] }}
            whileTap={{ scale: 0.97 }}
            className={cn(
              "flex flex-col items-start gap-1 rounded-frame border p-4 text-left transition-colors duration-150",
              active
                ? "border-primary bg-secondary/70"
                : "border-border bg-card hover:border-primary/50 hover:bg-secondary/40"
            )}
          >
            <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              {ref.family}
            </span>
            <span className="font-display text-base leading-tight">{ref.name}</span>
            <span className="text-xs text-muted-foreground">{ref.brand}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
