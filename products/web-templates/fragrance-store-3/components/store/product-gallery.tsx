"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";

import { MeridianSweep } from "@/components/store/meridian-sweep";
import { Badge } from "@/components/ui/badge";
import { WishlistButton } from "@/components/store/wishlist-button";
import { getProductGallery } from "@/lib/media";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/types";

interface ProductGalleryProps {
  product: Product;
}

/**
 * Data-driven off however many shots actually exist for this product (2, 3,
 * or 5 — see `lib/media.ts`), never a hardcoded slot count. Meridian Sweep
 * plays once as the gallery scrolls into view, on whichever shot loads
 * first; switching shots afterward is a plain crossfade (the Sweep is a
 * one-time "this photograph settles into place" moment, not a per-click
 * effect — see DESIGN.md).
 */
export function ProductGallery({ product }: ProductGalleryProps) {
  const shots = getProductGallery(product.slug);
  const [active, setActive] = useState(0);
  const current = shots[active];

  if (!current) return null;

  return (
    <div className="flex flex-col gap-3 sm:flex-row-reverse sm:gap-4">
      <div className="group relative aspect-square w-full flex-1 overflow-hidden bg-secondary">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="absolute inset-0"
          >
            {current.type === "video" ? (
              <video
                className="h-full w-full object-cover"
                src={current.src}
                poster={current.poster}
                autoPlay
                muted
                loop
                playsInline
                controls={false}
              />
            ) : active === 0 ? (
              <MeridianSweep
                family={product.family}
                src={current.src}
                alt={`${product.name} — ${current.label}`}
                trigger="view"
                priority
                sizes="(min-width: 768px) 50vw, 100vw"
              />
            ) : (
              <Image
                src={current.src}
                alt={`${product.name} — ${current.label}`}
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
              />
            )}
          </motion.div>
        </AnimatePresence>

        <div className="absolute left-4 top-4 flex flex-col gap-1.5">
          {product.badge && <Badge>{product.badge}</Badge>}
        </div>
        <WishlistButton slug={product.slug} name={product.name} className="absolute right-4 top-4" />
      </div>

      {/* Thumbnail rail — horizontal scroll on touch, vertical column on desktop. */}
      {shots.length > 1 && (
        <div
          role="tablist"
          aria-label={`${product.name} gallery`}
          className="no-scrollbar flex gap-2 overflow-x-auto sm:w-20 sm:flex-col sm:overflow-visible"
        >
          {shots.map((shot, index) => (
            <button
              key={shot.id}
              type="button"
              role="tab"
              aria-selected={active === index}
              aria-label={`${shot.label} shot`}
              onClick={() => setActive(index)}
              className={cn(
                "relative aspect-square w-16 shrink-0 overflow-hidden border transition-colors sm:w-full",
                active === index ? "border-primary" : "border-border hover:border-foreground/40"
              )}
            >
              <Image
                src={shot.type === "video" ? shot.poster ?? shot.src : shot.src}
                alt=""
                fill
                sizes="64px"
                className="object-cover"
              />
              <span className="absolute inset-x-0 bottom-0 bg-foreground/70 px-1 py-0.5 text-center text-[9px] font-semibold uppercase tracking-wide text-background">
                {shot.label}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
