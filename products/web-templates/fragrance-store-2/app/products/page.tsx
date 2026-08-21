import { Suspense } from "react";
import type { Metadata } from "next";

import { ProductsCatalog } from "@/components/store/products-catalog";

export const metadata: Metadata = {
  title: "All Fragrances — Nocturne",
  description:
    "Browse the full Nocturne fragrance collection — oriental, woody, floral, fresh, and gourmand, filterable by family, concentration, and price.",
};

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="container py-24 text-center text-sm text-muted-foreground">
          Loading fragrances…
        </div>
      }
    >
      <ProductsCatalog />
    </Suspense>
  );
}
