import { Suspense } from "react";
import type { Metadata } from "next";

import { ProductsCatalog } from "@/components/store/products-catalog";

export const metadata: Metadata = {
  title: "All Fragrances — Ambre",
  description:
    "Browse the full Ambre fragrance collection — floral, woody, oriental, fresh, and gourmand.",
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
