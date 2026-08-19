"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingBag, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { OrderSummary } from "@/components/store/order-summary";
import { useCartStore, selectCartSubtotal } from "@/lib/cart-store";
import { computeOrderTotals } from "@/lib/utils";

export default function CartPage() {
  const lines = useCartStore((state) => state.lines);
  const subtotal = useCartStore(selectCartSubtotal);
  const hasHydrated = useCartStore((state) => state.hasHydrated);
  const { shipping, tax, total } = computeOrderTotals(subtotal);

  if (!hasHydrated) {
    return (
      <div className="container py-24 text-center text-sm text-muted-foreground">
        Loading your bag…
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="container flex flex-col items-center justify-center gap-4 py-32 text-center">
        <ShoppingBag className="h-10 w-10 text-muted-foreground" />
        <h1 className="font-serif text-2xl">Your bag is empty</h1>
        <p className="max-w-sm text-muted-foreground">
          Browse the collection and find something worth adding.
        </p>
        <Button asChild size="lg">
          <Link href="/products">Shop fragrances</Link>
        </Button>
      </div>
    );
  }

  const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0);

  return (
    <div className="container py-12">
      <h1 className="font-serif text-3xl sm:text-4xl">Your bag</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {itemCount} {itemCount === 1 ? "item" : "items"}
      </p>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mx-auto mt-8 max-w-xl"
      >
        <OrderSummary
          lines={lines}
          subtotal={subtotal}
          shipping={shipping}
          tax={tax}
          total={total}
          editable
        />

        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <Button asChild variant="outline" className="sm:flex-1">
            <Link href="/products">Continue shopping</Link>
          </Button>
          <Button asChild size="lg" className="sm:flex-1">
            <Link href="/checkout">
              Checkout <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
