"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

import { Badge } from "@/components/ui/badge";
import { AddToCartButton } from "@/components/store/add-to-cart-button";
import { cn, formatPrice } from "@/lib/utils";
import { getDefaultSize } from "@/lib/products";
import type { Product } from "@/lib/types";

interface ProductCardProps {
  product: Product;
  index?: number;
  className?: string;
}

export function ProductCard({ product, index = 0, className }: ProductCardProps) {
  const defaultSize = getDefaultSize(product);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, delay: Math.min(index, 6) * 0.05 }}
      className={cn("h-full", className)}
    >
      <Link href={`/products/${product.slug}`} className="group flex h-full flex-col">
        <div className="spotlight-card relative aspect-[4/5] w-full overflow-hidden rounded-sm border border-border">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-contain p-6 transition-transform duration-500 group-hover:scale-105"
          />
          {product.badge && (
            <Badge className="absolute left-3 top-3">{product.badge}</Badge>
          )}

          <div className="absolute inset-x-3 bottom-3 translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100">
            <AddToCartButton
              slug={product.slug}
              name={product.name}
              image={product.image}
              family={product.family}
              sizeMl={defaultSize.ml}
              unitPrice={defaultSize.price}
              className="w-full"
              label="Quick add"
            />
          </div>
        </div>

        <div className="mt-4 flex-1">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            {product.family} &middot; {product.concentration}
          </p>
          <h3 className="font-display mt-1 text-lg leading-tight">
            {product.name}
          </h3>
          <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
            {product.tagline}
          </p>
          <p className="mt-2 text-sm font-semibold text-primary">
            {formatPrice(defaultSize.price)}
            <span className="font-normal text-muted-foreground"> / {defaultSize.ml}ml</span>
          </p>
        </div>
      </Link>
    </motion.div>
  );
}
