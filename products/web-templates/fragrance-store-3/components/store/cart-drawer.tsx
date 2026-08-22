"use client";

import Link from "next/link";
import { ShoppingBag, ArrowRight } from "lucide-react";
import { AnimatePresence } from "framer-motion";

import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { CartLineItem } from "@/components/store/cart-line-item";
import {
  useCartStore,
  selectCartSubtotal,
  selectDiscountAmount,
} from "@/lib/cart-store";
import { computeOrderTotals, formatPrice } from "@/lib/utils";

/**
 * Mini-cart drawer — slides in from the right on add. This template also
 * ships a dedicated `/cart` page and a bottom toast (see DESIGN.md), so all
 * three cart surfaces the brief asks for exist here, each with a distinct
 * job: the drawer is the "just added, keep browsing" surface.
 */
export function CartDrawer() {
  const isOpen = useCartStore((state) => state.isDrawerOpen);
  const openDrawer = useCartStore((state) => state.openDrawer);
  const closeDrawer = useCartStore((state) => state.closeDrawer);
  const lines = useCartStore((state) => state.lines);
  const hasHydrated = useCartStore((state) => state.hasHydrated);
  const subtotal = useCartStore(selectCartSubtotal);
  const discountAmount = useCartStore(selectDiscountAmount);
  const { shipping, tax, total } = computeOrderTotals(subtotal, discountAmount);

  return (
    <Sheet open={isOpen} onOpenChange={(open) => (open ? openDrawer() : closeDrawer())}>
      <SheetContent open={isOpen} side="right" title="Your bag" description="Review the items in your bag before checkout.">
        {!hasHydrated ? (
          <div className="p-6 text-sm text-muted-foreground">Loading your bag…</div>
        ) : lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
            <ShoppingBag className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
            <div>
              <p className="font-display text-lg font-semibold">Your bag is empty</p>
              <p className="mt-1 text-sm text-muted-foreground">Every order ships with a free sample.</p>
            </div>
            <Button asChild onClick={closeDrawer}>
              <Link href="/products">Shop fragrances</Link>
            </Button>
          </div>
        ) : (
          <div className="flex flex-1 flex-col">
            <ul className="flex-1 divide-y divide-border px-5">
              <AnimatePresence initial={false}>
                {lines.map((line) => (
                  <CartLineItem key={`${line.slug}-${line.sizeMl}`} line={line} compact />
                ))}
              </AnimatePresence>
            </ul>

            <div className="border-t border-border p-5">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold tabular-nums">{formatPrice(total)}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Shipping and tax calculated at checkout.</p>
              <Button asChild size="lg" className="mt-4 w-full" onClick={closeDrawer}>
                <Link href="/checkout">
                  Checkout <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="mt-2 w-full" onClick={closeDrawer}>
                <Link href="/cart">View full bag</Link>
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
