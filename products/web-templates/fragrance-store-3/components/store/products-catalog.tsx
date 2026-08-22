"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/store/product-card";
import { ProductGrid } from "@/components/store/product-grid";
import { CollectionStatementCard } from "@/components/store/collection-statement-card";
import { FilterPanel } from "@/components/store/filter-panel";
import { SortMenu } from "@/components/store/sort-menu";
import { EMPTY_FILTERS, matchesFilters, matchesSearch, type FilterState } from "@/lib/filters";
import { PRODUCTS, SCENT_FAMILIES, sortProducts, type SortOption } from "@/lib/products";
import type { ScentFamily } from "@/lib/types";

function isScentFamily(value: string): value is ScentFamily {
  return (SCENT_FAMILIES as string[]).includes(value);
}

/** Reads `?family=` as a comma-separated list, e.g. `?family=Oriental,Gourmand`
 * — the curated-collection theme cards link to cross-family groupings, so
 * this accepts one or several families rather than assuming a single value. */
function parseFamilyParam(value: string | null): ScentFamily[] {
  if (!value) return [];
  return value.split(",").map((v) => v.trim()).filter(isScentFamily);
}

export function ProductsCatalog() {
  const searchParams = useSearchParams();
  const familyParam = searchParams.get("family");
  const queryParam = searchParams.get("q") ?? "";
  /** Curated-collection's "Signature Line" card links here — not a
   * FilterState dimension (no UI control exposes it), just a one-off
   * read-only query filter applied on top of the normal filter/sort pass. */
  const badgeParam = searchParams.get("badge");

  const [filters, setFilters] = useState<FilterState>(() => ({
    ...EMPTY_FILTERS,
    families: parseFamilyParam(familyParam),
  }));
  const [sort, setSort] = useState<SortOption>("featured");

  useEffect(() => {
    const families = parseFamilyParam(familyParam);
    if (families.length) {
      setFilters((current) => ({ ...current, families }));
    }
  }, [familyParam]);

  const filtered = useMemo(() => {
    const byFilter = PRODUCTS.filter(
      (product) =>
        matchesFilters(product, filters) &&
        matchesSearch(product, queryParam) &&
        (!badgeParam || product.badge === badgeParam)
    );
    return sortProducts(byFilter, sort);
  }, [filters, sort, queryParam, badgeParam]);

  const slots = useMemo(() => {
    const items: { key: string; node: React.ReactNode }[] = [];
    filtered.forEach((product, index) => {
      const isStatementSlot = (index + 1) % 6 === 0 && index !== filtered.length - 1;
      items.push({
        key: product.slug,
        node: <ProductCard product={product} index={index} featureAspect={index % 6 === 0} />,
      });
      if (isStatementSlot) {
        const family = product.family;
        items.push({ key: `statement-${index}`, node: <CollectionStatementCard family={family} /> });
      }
    });
    return items;
  }, [filtered]);

  return (
    <div className="container py-12">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">The full collection</p>
        <h1 className="font-display mt-3 text-fluid-h1 font-semibold text-balance">
          {queryParam ? `Results for "${queryParam}"` : "Ten fragrances, ten places"}
        </h1>
        <p className="mt-3 text-muted-foreground">
          Filter by family, gender expression, intensity, season, format, size, price, or availability.
        </p>
      </div>

      <div className="mt-10">
        <FilterPanel value={filters} onChange={setFilters} resultCount={filtered.length} />
      </div>

      <div className="mt-8 flex justify-end">
        <SortMenu value={sort} onChange={setSort} />
      </div>

      {filtered.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-4 py-16 text-center">
          <p className="font-display text-xl font-semibold">No fragrances match those filters</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Try clearing a filter — the full collection has something in every family.
          </p>
          <Button variant="outline" onClick={() => setFilters(EMPTY_FILTERS)}>
            Clear filters
          </Button>
        </div>
      ) : (
        <div className="mt-10">
          <ProductGrid slots={slots} />
        </div>
      )}
    </div>
  );
}
