"use client";

import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

import { useToast } from "@/lib/toast-context";
import { getProductStill } from "@/lib/media";

/**
 * Bottom-of-viewport toast confirmation. This template also has a slide-in
 * cart drawer *and* a dedicated /cart page (see DESIGN.md) — the toast is
 * the third, lightest-weight cart surface, mainly useful when an item is
 * added from somewhere the drawer opening might feel like too much (e.g.
 * the discovery-flow result screen).
 */
export function ToastViewport() {
  const { toasts, dismissToast } = useToast();

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-4 sm:inset-x-auto sm:right-4 sm:items-end"
      aria-live="polite"
    >
      <AnimatePresence>
        {toasts.map((toast) => {
          const still = toast.slug ? getProductStill(toast.slug) : undefined;
          return (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, transition: { duration: 0.18 } }}
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
            className="pointer-events-auto flex w-full max-w-sm items-center gap-3 border border-border bg-card p-3 shadow-object"
          >
            {still && (
              <div className="relative h-11 w-11 shrink-0 overflow-hidden bg-secondary">
                <Image src={still} alt="" fill sizes="44px" className="object-cover" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{toast.title}</p>
              {toast.description && (
                <p className="truncate text-xs text-muted-foreground">{toast.description}</p>
              )}
              {toast.actionHref && (
                <Link
                  href={toast.actionHref}
                  onClick={() => dismissToast(toast.id)}
                  className="mt-1 inline-block text-xs font-semibold uppercase tracking-wide text-primary underline-offset-2 hover:underline"
                >
                  {toast.actionLabel ?? "View"}
                </Link>
              )}
            </div>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              aria-label="Dismiss notification"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-pill text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
