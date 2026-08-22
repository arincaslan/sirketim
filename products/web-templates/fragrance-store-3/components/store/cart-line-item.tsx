"use client";

import Link from "next/link";
import Image from "next/image";
import { X } from "lucide-react";
import { motion } from "framer-motion";

import { QuantityStepper } from "@/components/store/quantity-stepper";
import { useCartStore } from "@/lib/cart-store";
import { getProductStill } from "@/lib/media";
import { formatPrice } from "@/lib/utils";
import type { CartLine } from "@/lib/types";

interface CartLineItemProps {
  line: CartLine;
  compact?: boolean;
}

export function CartLineItem({ line, compact = false }: CartLineItemProps) {
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const still = getProductStill(line.slug);

  return (
    <motion.li
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.25 }}
      className="flex gap-4 border-b border-border py-5"
    >
      <Link
        href={`/products/${line.slug}`}
        className="relative aspect-square shrink-0 overflow-hidden bg-secondary"
        style={{ width: compact ? "4.5rem" : "6rem" }}
      >
        {still && <Image src={still} alt="" fill sizes="96px" className="object-cover" />}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link href={`/products/${line.slug}`} className="font-display text-base font-semibold hover:text-primary">
              {line.name}
            </Link>
            <p className="mt-0.5 text-xs uppercase tracking-wide text-muted-foreground">
              {line.family} &middot; {line.isSample ? "Sample" : `${line.sizeMl}ml`}
            </p>
          </div>
          <button
            type="button"
            onClick={() => removeItem(line.slug, line.sizeMl)}
            aria-label={`Remove ${line.name} from bag`}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-pill text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3">
          {line.isSample ? (
            <span className="text-xs text-muted-foreground">Qty {line.quantity}</span>
          ) : (
            <QuantityStepper
              quantity={line.quantity}
              onChange={(quantity) => updateQuantity(line.slug, line.sizeMl, quantity)}
              className="h-9"
            />
          )}
          <p className="text-sm font-semibold">{formatPrice(line.unitPrice * line.quantity)}</p>
        </div>
      </div>
    </motion.li>
  );
}
