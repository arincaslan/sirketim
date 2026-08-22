import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { ProductCard } from "@/components/store/product-card";
import type { Product } from "@/lib/types";

interface ProductRailProps {
  title: string;
  subtitle?: string;
  products: Product[];
  viewAllHref?: string;
}

/** A horizontal scroll-snap rail — used for related products, "complete the
 * ritual" cross-sell, and bestsellers. Manual scroll only: no autoplay, no
 * marquee, per the brief's motion constraints. */
export function ProductRail({ title, subtitle, products, viewAllHref }: ProductRailProps) {
  if (products.length === 0) return null;

  return (
    <section className="container py-14">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-fluid-h2 font-semibold text-balance">{title}</h2>
          {subtitle && <p className="mt-2 max-w-lg text-muted-foreground">{subtitle}</p>}
        </div>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="hidden shrink-0 items-center gap-1 text-sm font-semibold uppercase tracking-wide text-primary hover:underline sm:flex"
          >
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>

      <div className="scroll-snap-x no-scrollbar mt-8 flex gap-6 overflow-x-auto pb-2">
        {products.map((product, index) => (
          <div key={product.slug} className="scroll-snap-start w-[72vw] shrink-0 sm:w-64">
            <ProductCard product={product} index={index} />
          </div>
        ))}
      </div>
    </section>
  );
}
