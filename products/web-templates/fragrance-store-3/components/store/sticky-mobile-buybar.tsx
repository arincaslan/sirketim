"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import { getDefaultSize, getStartingPrice } from "@/lib/products";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/lib/types";

interface StickyMobileBuybarProps {
  product: Product;
}

/**
 * Appears only once the main purchase panel has scrolled out of view, and
 * only on mobile — never overlaps the notes thread below it (see
 * DESIGN.md). Links back to the panel's size/quantity controls rather than
 * silently adding a size the shopper never chose.
 */
export function StickyMobileBuybar({ product }: StickyMobileBuybarProps) {
  const [visible, setVisible] = useState(false);
  const defaultSize = getDefaultSize(product);

  useEffect(() => {
    const target = document.getElementById("purchase-panel");
    if (!target) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(!entry.isIntersecting), {
      rootMargin: "-96px 0px 0px 0px",
    });
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 96 }}
          animate={{ y: 0 }}
          exit={{ y: 96 }}
          transition={{ type: "spring", stiffness: 380, damping: 34 }}
          className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 p-3 backdrop-blur lg:hidden"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate font-display text-sm font-semibold">{product.name}</p>
              <p className="text-xs text-muted-foreground">From {formatPrice(getStartingPrice(product))}</p>
            </div>
            <Button asChild size="default" className="shrink-0">
              <a href="#purchase-panel">{defaultSize ? "Choose size" : "View options"}</a>
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
