"use client";

import Image from "next/image";

import { Card } from "@/components/ui/card";
import { QuantityStepper } from "@/components/store/quantity-stepper";
import { useCartStore } from "@/lib/cart-store";
import { formatPrice } from "@/lib/utils";
import type { CartLine } from "@/lib/types";

interface OrderSummaryProps {
  lines: CartLine[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  editable?: boolean;
}

export function OrderSummary({
  lines,
  subtotal,
  shipping,
  tax,
  total,
  editable = false,
}: OrderSummaryProps) {
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  return (
    <Card className="p-5">
      <ul className="flex flex-col gap-4">
        {lines.map((line) => (
          <li key={`${line.slug}-${line.sizeMl}`} className="flex gap-3">
            <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-md bg-secondary">
              <Image
                src={line.image}
                alt={line.name}
                fill
                sizes="56px"
                className="object-cover"
              />
            </div>
            <div className="flex flex-1 flex-col justify-between">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium leading-tight">
                    {line.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {line.sizeMl}ml &middot; Qty {line.quantity}
                  </p>
                </div>
                <p className="whitespace-nowrap text-sm font-medium">
                  {formatPrice(line.unitPrice * line.quantity)}
                </p>
              </div>
              {editable && (
                <div className="mt-1 flex items-center justify-between">
                  <QuantityStepper
                    value={line.quantity}
                    onChange={(qty) =>
                      updateQuantity(line.slug, line.sizeMl, qty)
                    }
                    max={10}
                    className="scale-90 origin-left"
                  />
                  <button
                    type="button"
                    onClick={() => removeItem(line.slug, line.sizeMl)}
                    className="text-xs text-muted-foreground transition-colors hover:text-destructive"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-5 space-y-2 border-t border-border pt-4 text-sm">
        <div className="flex justify-between text-muted-foreground">
          <span>Subtotal</span>
          <span className="text-foreground">{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Shipping</span>
          <span className="text-foreground">
            {shipping === 0 ? "Free" : formatPrice(shipping)}
          </span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Estimated tax</span>
          <span className="text-foreground">{formatPrice(tax)}</span>
        </div>
        <div className="flex justify-between border-t border-border pt-2 text-base font-semibold">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>
    </Card>
  );
}
