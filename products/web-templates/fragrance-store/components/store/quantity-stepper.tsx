"use client";

import { Minus, Plus } from "lucide-react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  className?: string;
}

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 20,
  className,
}: QuantityStepperProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-md border border-input",
        className
      )}
    >
      <motion.button
        type="button"
        whileTap={{ scale: 0.85 }}
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label="Decrease quantity"
        className="flex h-9 w-9 items-center justify-center text-foreground transition-colors hover:bg-secondary disabled:pointer-events-none disabled:opacity-40"
      >
        <Minus className="h-3.5 w-3.5" />
      </motion.button>

      <span className="w-8 text-center text-sm font-medium tabular-nums" aria-live="polite">
        {value}
      </span>

      <motion.button
        type="button"
        whileTap={{ scale: 0.85 }}
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label="Increase quantity"
        className="flex h-9 w-9 items-center justify-center text-foreground transition-colors hover:bg-secondary disabled:pointer-events-none disabled:opacity-40"
      >
        <Plus className="h-3.5 w-3.5" />
      </motion.button>
    </div>
  );
}
