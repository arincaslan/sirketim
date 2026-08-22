"use client";

import { type ReactNode, useState } from "react";
import { Check, Tag, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCartStore, selectDiscountAmount } from "@/lib/cart-store";
import { formatPrice, FREE_SHIPPING_THRESHOLD } from "@/lib/utils";
import type { CartLine } from "@/lib/types";

interface OrderSummaryProps {
  lines: CartLine[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  showDiscountField?: boolean;
  children?: ReactNode;
}

export function OrderSummary({
  lines,
  subtotal,
  shipping,
  tax,
  total,
  showDiscountField = true,
  children,
}: OrderSummaryProps) {
  const discountCode = useCartStore((state) => state.discountCode);
  const applyDiscount = useCartStore((state) => state.applyDiscount);
  const clearDiscount = useCartStore((state) => state.clearDiscount);
  const discountAmount = useCartStore(selectDiscountAmount);

  const [codeInput, setCodeInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0);
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - (subtotal - discountAmount));

  function handleApply() {
    if (!codeInput.trim()) return;
    const ok = applyDiscount(codeInput);
    setError(ok ? null : "That code isn't valid.");
    if (ok) setCodeInput("");
  }

  return (
    <div className="border border-border bg-card p-6">
      <h2 className="font-display text-lg font-semibold">Order summary</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        {itemCount} {itemCount === 1 ? "item" : "items"}
      </p>

      {remainingForFreeShipping > 0 ? (
        <p className="mt-4 border border-dashed border-border px-3 py-2 text-xs text-muted-foreground">
          Add {formatPrice(remainingForFreeShipping)} more for free shipping.
        </p>
      ) : (
        <p className="mt-4 flex items-center gap-1.5 border border-dashed border-success/40 px-3 py-2 text-xs text-success">
          <Check className="h-3.5 w-3.5" /> You&apos;ve unlocked free shipping.
        </p>
      )}

      {showDiscountField && (
        <div className="mt-4">
          {discountCode ? (
            <div className="flex items-center justify-between bg-secondary px-3 py-2 text-xs">
              <span className="flex items-center gap-1.5 font-semibold text-foreground">
                <Tag className="h-3.5 w-3.5" /> {discountCode} applied
              </span>
              <button
                type="button"
                onClick={clearDiscount}
                aria-label="Remove discount code"
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div>
              <label htmlFor="discount-code" className="sr-only">
                Discount code
              </label>
              <div className="flex gap-2">
                <Input
                  id="discount-code"
                  placeholder="Discount code"
                  value={codeInput}
                  onChange={(event) => setCodeInput(event.target.value)}
                  className="h-10 text-sm"
                />
                <Button type="button" variant="outline" size="sm" className="h-10 shrink-0" onClick={handleApply}>
                  Apply
                </Button>
              </div>
              {error && (
                <p role="alert" className="mt-1.5 text-xs text-destructive">
                  {error}
                </p>
              )}
              <p className="mt-1.5 text-[11px] text-muted-foreground">Try WELCOME10 for 10% off.</p>
            </div>
          )}
        </div>
      )}

      <dl className="mt-5 flex flex-col gap-2 border-t border-border pt-5 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Subtotal</dt>
          <dd className="tabular-nums">{formatPrice(subtotal)}</dd>
        </div>
        {discountAmount > 0 && (
          <div className="flex justify-between text-success">
            <dt>Discount</dt>
            <dd className="tabular-nums">&minus;{formatPrice(discountAmount)}</dd>
          </div>
        )}
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Shipping</dt>
          <dd className="tabular-nums">{shipping === 0 ? "Free" : formatPrice(shipping)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Estimated tax</dt>
          <dd className="tabular-nums">{formatPrice(tax)}</dd>
        </div>
        <div className="flex justify-between border-t border-border pt-2 text-base font-semibold">
          <dt>Total</dt>
          <dd className="tabular-nums">{formatPrice(total)}</dd>
        </div>
      </dl>

      {children}
    </div>
  );
}
