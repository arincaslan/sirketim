"use client";

import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import type { ScentFamily } from "@/lib/types";

interface ScentFilterProps {
  families: ScentFamily[];
  active: ScentFamily | "All";
  onChange: (value: ScentFamily | "All") => void;
}

export function ScentFilter({ families, active, onChange }: ScentFilterProps) {
  const options: (ScentFamily | "All")[] = ["All", ...families];

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const isActive = option === active;
        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={cn(
              "relative rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
              isActive
                ? "border-primary text-primary-foreground"
                : "border-input text-muted-foreground hover:text-foreground"
            )}
          >
            {isActive && (
              <motion.span
                layoutId="scent-filter-highlight"
                className="absolute inset-0 -z-10 rounded-full bg-primary"
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
              />
            )}
            {option}
          </button>
        );
      })}
    </div>
  );
}
