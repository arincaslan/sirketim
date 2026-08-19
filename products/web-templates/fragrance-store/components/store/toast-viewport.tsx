"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

import { useToast } from "@/lib/toast-context";
import { useCartStore } from "@/lib/cart-store";

export function ToastViewport() {
  const { toasts, dismissToast } = useToast();
  const openCart = useCartStore((state) => state.openCart);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4 sm:inset-x-auto sm:right-4 sm:items-end">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, y: -16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 32, transition: { duration: 0.2 } }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-lg border border-border bg-card p-3 shadow-lg"
          >
            {toast.image && (
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-secondary">
                <Image
                  src={toast.image}
                  alt=""
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{toast.title}</p>
              {toast.description && (
                <p className="truncate text-xs text-muted-foreground">
                  {toast.description}
                </p>
              )}
              <button
                type="button"
                onClick={() => {
                  openCart();
                  dismissToast(toast.id);
                }}
                className="mt-1 text-xs font-medium text-primary underline-offset-2 hover:underline"
              >
                View bag
              </button>
            </div>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              aria-label="Dismiss notification"
              className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
