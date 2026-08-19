import { ProductGrid } from "@/components/store/product-grid";
import { getRelatedProducts } from "@/lib/products";

export function RelatedProducts({ slug }: { slug: string }) {
  const related = getRelatedProducts(slug, 4);
  if (related.length === 0) return null;

  return (
    <section className="border-t border-border py-16">
      <div className="container">
        <h2 className="font-serif text-2xl sm:text-3xl">
          You might also like
        </h2>
        <div className="mt-8">
          <ProductGrid products={related} />
        </div>
      </div>
    </section>
  );
}
