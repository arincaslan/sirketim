import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { ProductGrid } from "@/components/store/product-grid";
import { PRODUCTS } from "@/lib/products";

export function FeaturedCollection() {
  const badged = PRODUCTS.filter((product) => product.badge).slice(0, 4);
  const items = badged.length >= 4 ? badged : PRODUCTS.slice(0, 4);

  return (
    <section className="py-16">
      <div className="container">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-gold">
              Fan favorites
            </p>
            <h2 className="mt-2 font-serif text-2xl sm:text-3xl">
              Best of the collection
            </h2>
          </div>
          <Link
            href="/products"
            className="hidden items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:flex"
          >
            Shop all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-8">
          <ProductGrid products={items} />
        </div>
      </div>
    </section>
  );
}
