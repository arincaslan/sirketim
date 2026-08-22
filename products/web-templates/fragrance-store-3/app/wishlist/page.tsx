"use client";

import Link from "next/link";
import { Heart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/store/product-card";
import { useWishlistStore } from "@/lib/wishlist-store";
import { getProductBySlug } from "@/lib/products";

export default function WishlistPage() {
  const items = useWishlistStore((state) => state.items);
  const hasHydrated = useWishlistStore((state) => state.hasHydrated);

  if (!hasHydrated) {
    return <div className="container py-24 text-center text-sm text-muted-foreground">Loading your wishlist…</div>;
  }

  const products = items
    .map((item) => getProductBySlug(item.slug))
    .filter((product): product is NonNullable<typeof product> => Boolean(product));

  if (products.length === 0) {
    return (
      <div className="container flex flex-col items-center justify-center gap-4 py-32 text-center">
        <Heart className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
        <h1 className="font-display text-2xl font-semibold">Your wishlist is empty</h1>
        <p className="max-w-sm text-muted-foreground">
          Tap the heart on any fragrance to save it here for later.
        </p>
        <Button asChild size="lg">
          <Link href="/products">Shop fragrances</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <h1 className="font-display text-fluid-h1 font-semibold">Your wishlist</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {products.length} {products.length === 1 ? "fragrance" : "fragrances"} saved
      </p>

      <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product, index) => (
          <ProductCard key={product.slug} product={product} index={index} />
        ))}
      </div>
    </div>
  );
}
