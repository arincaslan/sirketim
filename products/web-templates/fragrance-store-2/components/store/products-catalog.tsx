"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { SlidersHorizontal, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/store/product-card";
import {
  FilterSidebar,
  matchesFilters,
  type FilterState,
} from "@/components/store/filter-sidebar";
import { PRODUCTS, SCENT_FAMILIES } from "@/lib/products";
import type { ScentFamily } from "@/lib/types";

const EMPTY_FILTERS: FilterState = {
  families: [],
  concentrations: [],
  priceBands: [],
};

function isScentFamily(value: string | null): value is ScentFamily {
  return !!value && (SCENT_FAMILIES as string[]).includes(value);
}

export function ProductsCatalog() {
  const searchParams = useSearchParams();
  const familyParam = searchParams.get("family");

  const [filters, setFilters] = useState<FilterState>(() => ({
    ...EMPTY_FILTERS,
    families: isScentFamily(familyParam) ? [familyParam] : [],
  }));
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Keep in sync if a nav link with ?family=... is clicked while already here.
  useEffect(() => {
    if (isScentFamily(familyParam)) {
      setFilters((current) => ({ ...current, families: [familyParam] }));
    }
  }, [familyParam]);

  const filtered = useMemo(
    () => PRODUCTS.filter((product) => matchesFilters(product, filters)),
    [filters]
  );

  const activeCount =
    filters.families.length + filters.concentrations.length + filters.priceBands.length;

  return (
    <div className="container py-12">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
          The full collection
        </p>
        <h1 className="font-display mt-3 text-fluid-h1 font-semibold">
          All fragrances
        </h1>
        <p className="mt-3 text-muted-foreground">
          Eleven scents across five families. Filter by family, concentration,
          or price.
        </p>
      </div>

      <div className="mt-10 flex items-center justify-between gap-4 border-b border-border pb-4 lg:hidden">
        <button
          type="button"
          onClick={() => setMobileFiltersOpen(true)}
          className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filter{activeCount > 0 ? ` (${activeCount})` : ""}
        </button>
        <p className="text-sm text-muted-foreground">{filtered.length} results</p>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[220px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <FilterSidebar value={filters} onChange={setFilters} />
          </div>
        </aside>

        <div>
          <div className="hidden items-center justify-between lg:flex">
            <p className="text-sm text-muted-foreground">
              {filtered.length} {filtered.length === 1 ? "result" : "results"}
            </p>
          </div>

          {filtered.length === 0 ? (
            <div className="mt-16 flex flex-col items-center gap-4 py-16 text-center">
              <p className="font-display text-xl font-semibold">
                No fragrances match those filters
              </p>
              <p className="max-w-sm text-sm text-muted-foreground">
                Try clearing a filter — the full collection has something in
                every family.
              </p>
              <Button variant="outline" onClick={() => setFilters(EMPTY_FILTERS)}>
                Clear filters
              </Button>
            </div>
          ) : (
            <div className="mt-6 columns-2 gap-5 sm:columns-2 lg:columns-3 xl:columns-4">
              {filtered.map((product, index) => (
                <div key={product.slug} className="mb-5 break-inside-avoid">
                  <ProductCard product={product} index={index} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter bottom sheet. */}
      <AnimatePresence>
        {mobileFiltersOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileFiltersOpen(false)}
              className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
              aria-hidden="true"
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Filter fragrances"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 32, stiffness: 300 }}
              className="fixed inset-x-0 bottom-0 z-50 max-h-[80vh] overflow-y-auto rounded-t-lg border-t border-border bg-background p-6 lg:hidden"
            >
              <div className="flex items-center justify-between">
                <p className="font-display text-lg font-semibold">Filter</p>
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(false)}
                  aria-label="Close filters"
                  className="flex h-11 w-11 items-center justify-center rounded-sm hover:bg-secondary"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-6">
                <FilterSidebar value={filters} onChange={setFilters} />
              </div>
              <Button
                className="mt-8 w-full"
                onClick={() => setMobileFiltersOpen(false)}
              >
                Show {filtered.length} results
              </Button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
