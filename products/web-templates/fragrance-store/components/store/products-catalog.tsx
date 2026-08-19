"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { ScentFilter } from "@/components/store/scent-filter";
import { ProductGrid } from "@/components/store/product-grid";
import { PRODUCTS, SCENT_FAMILIES } from "@/lib/products";
import type { ScentFamily } from "@/lib/types";

function isScentFamily(value: string | null): value is ScentFamily {
  return !!value && (SCENT_FAMILIES as string[]).includes(value);
}

export function ProductsCatalog() {
  const searchParams = useSearchParams();
  const familyParam = searchParams.get("family");

  const [active, setActive] = useState<ScentFamily | "All">(
    isScentFamily(familyParam) ? familyParam : "All"
  );

  // Keep the filter in sync if the query param changes (e.g. a nav link is
  // clicked while already on this page).
  useEffect(() => {
    setActive(isScentFamily(familyParam) ? familyParam : "All");
  }, [familyParam]);

  const filtered = useMemo(() => {
    if (active === "All") return PRODUCTS;
    return PRODUCTS.filter((product) => product.family === active);
  }, [active]);

  return (
    <div className="container py-12">
      <div className="max-w-2xl">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-gold">
          The full collection
        </p>
        <h1 className="mt-2 font-serif text-3xl sm:text-4xl">
          All fragrances
        </h1>
        <p className="mt-3 text-muted-foreground">
          Twelve scents across five families. Filter by family, or browse
          everything.
        </p>
      </div>

      <div className="mt-8">
        <ScentFilter
          families={SCENT_FAMILIES}
          active={active}
          onChange={setActive}
        />
      </div>

      <div className="mt-8">
        <ProductGrid products={filtered} />
      </div>
    </div>
  );
}
