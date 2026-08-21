"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

import { useToast } from "@/lib/toast-context";

/**
 * Bottom-of-viewport toast — this template has no slide-in cart drawer at
 * all (see DESIGN.md). Adding an item surfaces this instead; "View bag"
 * navigates to the full /cart page rather than toggling an overlay.
 */
export function ToastViewport() {
  const { toasts, dismissToast } = useToast();

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-4 sm:inset-x-auto sm:right-4 sm:items-end">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, transition: { duration: 0.2 } }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-sm border border-border bg-card p-3 shadow-[0_8px_40px_-8px_rgba(0,0,0,0.6)]"
          >
            {toast.image && (
              <div className="spotlight-card relative h-12 w-12 shrink-0 overflow-hidden rounded-sm">
                <Image
                  src={toast.image}
                  alt=""
                  fill
                  sizes="48px"
                  className="object-contain p-1"
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
              <Link
                href="/cart"
                onClick={() => dismissToast(toast.id)}
                className="mt-1 inline-block text-xs font-semibold uppercase tracking-wide text-primary underline-offset-2 hover:underline"
              >
                View bag
              </Link>
            </div>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              aria-label="Dismiss notification"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
