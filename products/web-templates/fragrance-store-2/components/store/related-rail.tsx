import { ProductCard } from "@/components/store/product-card";
import { getRelatedProducts } from "@/lib/products";

interface RelatedRailProps {
  slug: string;
}

export function RelatedRail({ slug }: RelatedRailProps) {
  const related = getRelatedProducts(slug, 4);
  if (related.length === 0) return null;

  return (
    <section className="border-t border-border py-16">
      <div className="container">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
          Pairs well with
        </p>
        <h2 className="font-display mt-3 text-fluid-h3 font-semibold">
          You might also wear
        </h2>

        <div className="scroll-snap-x no-scrollbar mt-8 flex gap-5 overflow-x-auto pb-2">
          {related.map((product, index) => (
            <div
              key={product.slug}
              className="scroll-snap-start w-[70%] shrink-0 sm:w-[38%] lg:w-[24%]"
            >
              <ProductCard product={product} index={index} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
