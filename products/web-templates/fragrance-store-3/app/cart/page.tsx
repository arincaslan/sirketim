"use client";

import Link from "next/link";
import { ShoppingBag, ArrowRight } from "lucide-react";
import { AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import { CartLineItem } from "@/components/store/cart-line-item";
import { OrderSummary } from "@/components/store/order-summary";
import { useCartStore, selectCartSubtotal, selectDiscountAmount } from "@/lib/cart-store";
import { computeOrderTotals } from "@/lib/utils";

export default function CartPage() {
  const lines = useCartStore((state) => state.lines);
  const subtotal = useCartStore(selectCartSubtotal);
  const discountAmount = useCartStore(selectDiscountAmount);
  const hasHydrated = useCartStore((state) => state.hasHydrated);
  const { shipping, tax, total } = computeOrderTotals(subtotal, discountAmount);

  if (!hasHydrated) {
    return <div className="container py-24 text-center text-sm text-muted-foreground">Loading your bag…</div>;
  }

  if (lines.length === 0) {
    return (
      <div className="container flex flex-col items-center justify-center gap-4 py-32 text-center">
        <ShoppingBag className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
        <h1 className="font-display text-2xl font-semibold">Your bag is empty</h1>
        <p className="max-w-sm text-muted-foreground">Browse the collection and find a place worth bottling.</p>
        <Button asChild size="lg">
          <Link href="/products">Shop fragrances</Link>
        </Button>
      </div>
    );
  }

  const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0);

  return (
    <div className="container py-12">
      <h1 className="font-display text-fluid-h1 font-semibold">Your bag</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {itemCount} {itemCount === 1 ? "item" : "items"}
      </p>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]">
        <ul className="flex flex-col">
          <AnimatePresence initial={false}>
            {lines.map((line) => (
              <CartLineItem key={`${line.slug}-${line.sizeMl}`} line={line} />
            ))}
          </AnimatePresence>
        </ul>

        <div className="lg:sticky lg:top-24 lg:h-fit">
          <OrderSummary lines={lines} subtotal={subtotal} shipping={shipping} tax={tax} total={total}>
            <Button asChild size="lg" className="mt-6 w-full">
              <Link href="/checkout">
                Continue to checkout <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="mt-2 w-full">
              <Link href="/products">Continue shopping</Link>
            </Button>
          </OrderSummary>
        </div>
      </div>
    </div>
  );
}
