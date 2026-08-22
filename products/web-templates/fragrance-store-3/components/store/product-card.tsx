"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { MeridianSweep } from "@/components/store/meridian-sweep";
import { AddToCartButton } from "@/components/store/add-to-cart-button";
import { WishlistButton } from "@/components/store/wishlist-button";
import { getDefaultSize, getSampleSize, getStartingPrice } from "@/lib/products";
import { getProductLifestyle, getProductStill } from "@/lib/media";
import { cn, formatPrice, formatRating } from "@/lib/utils";
import type { Product } from "@/lib/types";

interface ProductCardProps {
  product: Product;
  index?: number;
  className?: string;
  /** Taller aspect ratio for the rare "collection statement" slot in the
   * offset grid — see product-grid.tsx. */
  featureAspect?: boolean;
}

const AVAILABILITY_LABEL: Record<Product["availability"], string> = {
  "in-stock": "",
  "low-stock": "Only a few left",
  preorder: "Available for preorder",
  "sold-out": "Sold out",
};

export function ProductCard({ product, index = 0, className, featureAspect = false }: ProductCardProps) {
  const defaultSize = getDefaultSize(product);
  const sampleSize = getSampleSize(product);
  const startingPrice = getStartingPrice(product);
  const soldOut = product.availability === "sold-out";
  const still = getProductStill(product.slug);
  const lifestyle = getProductLifestyle(product.slug);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.45, delay: Math.min(index, 8) * 0.04 }}
      className={cn("group flex h-full flex-col", className)}
    >
      <Link href={`/products/${product.slug}`} className="flex h-full flex-col">
        <div
          className={cn(
            "relative w-full overflow-hidden bg-secondary",
            featureAspect ? "aspect-[4/5]" : "aspect-square"
          )}
        >
          {still && lifestyle ? (
            <MeridianSweep
              family={product.family}
              src={lifestyle}
              beforeSrc={still}
              alt={product.name}
              trigger="hover"
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            />
          ) : still ? (
            <Image
              src={still}
              alt={product.name}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          ) : null}

          <div className="absolute left-3 top-3 flex flex-col gap-1.5">
            {product.badge && <Badge>{product.badge}</Badge>}
            {soldOut && <Badge variant="warning">Sold out</Badge>}
          </div>

          <WishlistButton
            slug={product.slug}
            name={product.name}
            size="sm"
            className="absolute right-3 top-3"
          />

          {!soldOut && (
            <div className="absolute inset-x-3 bottom-3 translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100">
              <AddToCartButton
                slug={product.slug}
                name={product.name}
                family={product.family}
                sizeMl={defaultSize.ml}
                unitPrice={defaultSize.price}
                feedback="toast"
                className="w-full"
                label="Quick add"
              />
            </div>
          )}
        </div>

        <div className="mt-4 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              {product.family} &middot; {product.gender}
            </p>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Star className="h-3 w-3 fill-primary text-primary" aria-hidden="true" />
              {formatRating(product.rating)}
            </span>
          </div>
          <h3 className="font-display mt-1 text-lg leading-tight">{product.name}</h3>
          <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{product.tagline}</p>

          <div className="mt-2 flex items-center justify-between gap-2">
            <p className="text-sm font-semibold">
              From {formatPrice(startingPrice)}
            </p>
            {sampleSize && (
              <span className="text-[11px] text-muted-foreground">Sample available</span>
            )}
          </div>
          {AVAILABILITY_LABEL[product.availability] && (
            <p
              className={cn(
                "mt-1 text-[11px] font-medium",
                soldOut ? "text-muted-foreground" : "text-primary"
              )}
            >
              {AVAILABILITY_LABEL[product.availability]}
            </p>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
