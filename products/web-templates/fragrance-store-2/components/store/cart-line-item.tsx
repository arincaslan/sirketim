"use client";

import Image from "next/image";
import Link from "next/link";
import { Trash2 } from "lucide-react";

import { QuantityStepper } from "@/components/store/quantity-stepper";
import { useCartStore } from "@/lib/cart-store";
import { formatPrice } from "@/lib/utils";
import type { CartLine } from "@/lib/types";

interface CartLineItemProps {
  line: CartLine;
}

export function CartLineItem({ line }: CartLineItemProps) {
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  return (
    <li className="flex gap-5 border-b border-border py-6 first:pt-0">
      <Link
        href={`/products/${line.slug}`}
        className="spotlight-card relative h-28 w-24 shrink-0 overflow-hidden rounded-sm border border-border"
      >
        <Image src={line.image} alt={line.name} fill sizes="96px" className="object-contain p-2" />
      </Link>

      <div className="flex flex-1 flex-col justify-between">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Link
              href={`/products/${line.slug}`}
              className="font-display text-lg font-semibold hover:text-primary"
            >
              {line.name}
            </Link>
            <p className="mt-0.5 text-xs uppercase tracking-wide text-muted-foreground">
              {line.family} &middot; {line.sizeMl}ml
            </p>
          </div>
          <p className="whitespace-nowrap text-sm font-semibold">
            {formatPrice(line.unitPrice * line.quantity)}
          </p>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <QuantityStepper
            quantity={line.quantity}
            onChange={(qty) => updateQuantity(line.slug, line.sizeMl, qty)}
            max={9}
          />
          <button
            type="button"
            onClick={() => removeItem(line.slug, line.sizeMl)}
            aria-label={`Remove ${line.name} from bag`}
            className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Remove
          </button>
        </div>
      </div>
    </li>
  );
}
