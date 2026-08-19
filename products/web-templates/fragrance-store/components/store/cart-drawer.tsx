"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ShoppingBag, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { QuantityStepper } from "@/components/store/quantity-stepper";
import { useCartStore, selectCartSubtotal } from "@/lib/cart-store";
import { formatPrice } from "@/lib/utils";

export function CartDrawer() {
  const isOpen = useCartStore((state) => state.isOpen);
  const closeCart = useCartStore((state) => state.closeCart);
  const lines = useCartStore((state) => state.lines);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const subtotal = useCartStore(selectCartSubtotal);
  const hasHydrated = useCartStore((state) => state.hasHydrated);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 z-[90] bg-foreground/40 backdrop-blur-sm"
            aria-hidden="true"
          />
          <motion.aside
            key="panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 38 }}
            className="fixed inset-y-0 right-0 z-[95] flex w-full max-w-md flex-col bg-background shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-label="Shopping bag"
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="font-serif text-lg">Your Bag</h2>
              <button
                type="button"
                onClick={closeCart}
                aria-label="Close bag"
                className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {!hasHydrated ? (
              <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
                Loading your bag…
              </div>
            ) : lines.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
                <ShoppingBag className="h-10 w-10 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Your bag is empty.
                </p>
                <Button variant="outline" onClick={closeCart} asChild>
                  <Link href="/products">Browse fragrances</Link>
                </Button>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto px-5 py-4">
                  <ul className="flex flex-col gap-5">
                    <AnimatePresence initial={false}>
                      {lines.map((line) => (
                        <motion.li
                          key={`${line.slug}-${line.sizeMl}`}
                          layout
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, x: 40 }}
                          transition={{ duration: 0.25 }}
                          className="flex gap-4"
                        >
                          <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-md bg-secondary">
                            <Image
                              src={line.image}
                              alt={line.name}
                              fill
                              sizes="64px"
                              className="object-cover"
                            />
                          </div>
                          <div className="flex flex-1 flex-col justify-between py-0.5">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="text-sm font-medium leading-tight">
                                  {line.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {line.sizeMl}ml &middot; {line.family}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeItem(line.slug, line.sizeMl)}
                                aria-label={`Remove ${line.name} from bag`}
                                className="shrink-0 text-muted-foreground transition-colors hover:text-destructive"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                            <div className="flex items-center justify-between">
                              <QuantityStepper
                                value={line.quantity}
                                onChange={(qty) =>
                                  updateQuantity(line.slug, line.sizeMl, qty)
                                }
                                max={10}
                                className="scale-90 origin-left"
                              />
                              <p className="text-sm font-medium">
                                {formatPrice(line.unitPrice * line.quantity)}
                              </p>
                            </div>
                          </div>
                        </motion.li>
                      ))}
                    </AnimatePresence>
                  </ul>
                </div>

                <div className="border-t border-border px-5 py-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-semibold">{formatPrice(subtotal)}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Shipping and estimated tax are calculated at checkout.
                  </p>
                  <Button
                    asChild
                    size="lg"
                    className="mt-4 w-full"
                    onClick={closeCart}
                  >
                    <Link href="/checkout">Checkout</Link>
                  </Button>
                  <Button
                    asChild
                    variant="ghost"
                    className="mt-2 w-full"
                    onClick={closeCart}
                  >
                    <Link href="/cart">View full bag</Link>
                  </Button>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
