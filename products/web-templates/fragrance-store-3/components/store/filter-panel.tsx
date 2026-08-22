"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SlidersHorizontal, ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { FilterControls } from "@/components/store/filter-controls";
import { countActiveFilters, type FilterState } from "@/lib/filters";
import { cn } from "@/lib/utils";

interface FilterPanelProps {
  value: FilterState;
  onChange: (value: FilterState) => void;
  resultCount: number;
}

/**
 * Filters live in a top, toggle-open panel on desktop (not Ambre's always-
 * visible pill row, not Nocturne's persistent sidebar) and a bottom sheet
 * on mobile — see DESIGN.md.
 */
export function FilterPanel({ value, onChange, resultCount }: FilterPanelProps) {
  const [desktopOpen, setDesktopOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const activeCount = countActiveFilters(value);

  return (
    <div className="border-b border-border pb-6">
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => setDesktopOpen((v) => !v)}
          aria-expanded={desktopOpen}
          className="hidden items-center gap-2 text-sm font-semibold uppercase tracking-wide lg:flex"
        >
          <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
          Filters{activeCount > 0 ? ` (${activeCount})` : ""}
          <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", desktopOpen && "rotate-180")} />
        </button>

        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide lg:hidden"
        >
          <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
          Filters{activeCount > 0 ? ` (${activeCount})` : ""}
        </button>

        <p className="text-sm text-muted-foreground">
          {resultCount} {resultCount === 1 ? "result" : "results"}
        </p>
      </div>

      <AnimatePresence initial={false}>
        {desktopOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="hidden overflow-hidden lg:block"
          >
            <div className="border border-border bg-card p-6 mt-6">
              <FilterControls value={value} onChange={onChange} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent open={mobileOpen} side="bottom" title="Filters" className="lg:hidden">
          <div className="p-5 pb-28">
            <FilterControls value={value} onChange={onChange} />
          </div>
          <div className="fixed inset-x-0 bottom-0 border-t border-border bg-card p-4">
            <Button className="w-full" onClick={() => setMobileOpen(false)}>
              Show {resultCount} results
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
