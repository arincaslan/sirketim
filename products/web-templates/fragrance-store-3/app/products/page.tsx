import { Suspense } from "react";
import type { Metadata } from "next";

import { ProductsCatalog } from "@/components/store/products-catalog";

export const metadata: Metadata = {
  title: "Shop all fragrances",
  description: "Ten fragrances across five olfactive families, each built around a remembered place.",
};

export default function ProductsPage() {
  return (
    <Suspense
      fallback={<div className="container py-24 text-sm text-muted-foreground">Loading the collection…</div>}
    >
      <ProductsCatalog />
    </Suspense>
  );
}
