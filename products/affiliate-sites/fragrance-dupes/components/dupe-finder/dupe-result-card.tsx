"use client";

import { motion } from "motion/react";
import { CaretRight } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/utils";
import { computeSimilarity, formatPricePerMl, valueMultiple } from "@/lib/similarity";
import type { DupeCandidate, ReferenceFragrance } from "@/lib/types";

export function DupeResultCard({
  reference,
  dupe,
  rank,
  index,
  active,
  onSelect,
}: {
  reference: ReferenceFragrance;
  dupe: DupeCandidate;
  rank: number;
  index: number;
  active: boolean;
  onSelect: () => void;
}) {
  const score = computeSimilarity(reference, dupe);
  const multiple = valueMultiple(reference, dupe);
  // "Why it matches" - the first clause of the editorial verdict, so the
  // rationale on the card and the fuller verdict shown in the comparison
  // detail never contradict each other.
  const rationale = dupe.verdict.split(".")[0] + ".";

  return (
    <motion.li
      initial={{ opacity: 0, transform: "translateY(10px) scale(0.97)" }}
      animate={{ opacity: 1, transform: "translateY(0px) scale(1)" }}
      transition={{ duration: 0.35, delay: Math.min(index, 5) * 0.04, ease: [0.23, 1, 0.32, 1] }}
    >
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={active}
        className={cn(
          "flex w-full flex-col gap-3 rounded-frame border p-4 text-left transition-[border-color,background-color,transform] duration-150 ease-out active:scale-[0.99]",
          active
            ? "border-primary bg-secondary/70"
            : "border-border bg-card hover:border-primary/50 hover:bg-secondary/40"
        )}
      >
        <span className="flex items-center gap-4">
          <span className="font-display text-lg text-muted-foreground">#{rank}</span>

          <span className="flex min-w-0 flex-1 flex-col">
            <span className="truncate font-display text-lg leading-tight">{dupe.name}</span>
            <span className="truncate text-sm text-muted-foreground">{dupe.brand}</span>
          </span>

          <span className="hidden shrink-0 flex-col items-end sm:flex">
            <span className="font-display text-xl leading-none text-dupe">{score}%</span>
            <span className="mt-1 text-xs text-muted-foreground">match</span>
          </span>

          <span className="hidden shrink-0 flex-col items-end md:flex">
            <span className="text-sm font-semibold tabular-nums">
              {formatPricePerMl(dupe.priceUsd, dupe.bottleMl)}
            </span>
            <span className="mt-1 text-xs text-muted-foreground">{multiple.toFixed(1)}x cheaper</span>
          </span>

          <CaretRight
            className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform", active && "rotate-90")}
            aria-hidden
          />
        </span>

        <span className="block border-t border-border/70 pt-3 text-sm text-foreground/75">{rationale}</span>
      </button>
    </motion.li>
  );
}
