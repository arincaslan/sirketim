"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

import { Badge } from "@/components/ui/badge";
import { AddToCartButton } from "@/components/store/add-to-cart-button";
import { formatPrice } from "@/lib/utils";
import { getDefaultSize } from "@/lib/products";
import type { Product } from "@/lib/types";

const BADGE_VARIANT: Record<string, "gold" | "default" | "outline"> = {
  Bestseller: "gold",
  New: "default",
  Limited: "outline",
};

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const defaultSize = getDefaultSize(product);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, delay: Math.min(index, 6) * 0.05 }}
    >
      <Link href={`/products/${product.slug}`} className="group block">
        <motion.div
          whileHover={{ y: -6 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="overflow-hidden rounded-lg border border-border bg-card"
        >
          <div className="relative aspect-[4/5] w-full overflow-hidden bg-secondary">
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {product.badge && (
              <Badge
                variant={BADGE_VARIANT[product.badge] ?? "default"}
                className="absolute left-3 top-3 shadow-sm"
              >
                {product.badge}
              </Badge>
            )}

            <div className="absolute inset-x-3 bottom-3 translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
              <AddToCartButton
                slug={product.slug}
                name={product.name}
                image={product.image}
                family={product.family}
                sizeMl={defaultSize.ml}
                unitPrice={defaultSize.price}
                size="sm"
                className="w-full"
                label="Quick add"
              />
            </div>
          </div>

          <div className="p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              {product.family} &middot; {product.concentration}
            </p>
            <h3 className="mt-1 font-serif text-lg leading-tight">
              {product.name}
            </h3>
            <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
              {product.tagline}
            </p>
            <p className="mt-2 text-sm font-medium">
              {formatPrice(defaultSize.price)}
              <span className="font-normal text-muted-foreground">
                {" "}
                / {defaultSize.ml}ml
              </span>
            </p>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}
