"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";

/**
 * A Radix Dialog wrapped for framer-motion enter/exit animation, used for
 * every overlay surface in this template (cart drawer, mobile filter sheet,
 * quick-view modal) so all of them get real focus-trap, Escape-to-close,
 * and `aria-modal` behavior from Radix instead of a hand-rolled version —
 * one accessible primitive, several visual placements via `side`.
 */

const Sheet = DialogPrimitive.Root;
const SheetTrigger = DialogPrimitive.Trigger;
const SheetClose = DialogPrimitive.Close;

type Side = "right" | "bottom" | "center";

const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

function sideVariants(side: Side, reduced: boolean): Variants {
  if (reduced) {
    return { hidden: { opacity: 0 }, visible: { opacity: 1 } };
  }
  if (side === "right") {
    return {
      hidden: { x: "100%" },
      visible: { x: 0, transition: { type: "spring", stiffness: 340, damping: 34 } },
    };
  }
  if (side === "bottom") {
    return {
      hidden: { y: "100%" },
      visible: { y: 0, transition: { type: "spring", stiffness: 340, damping: 34 } },
    };
  }
  return {
    hidden: { opacity: 0, scale: 0.96 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] } },
  };
}

const sideClass: Record<Side, string> = {
  right: "fixed inset-y-0 right-0 h-full w-full max-w-md border-l border-border bg-card",
  bottom: "fixed inset-x-0 bottom-0 max-h-[85vh] w-full border-t border-border bg-card",
  center: "fixed left-1/2 top-1/2 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 border border-border bg-card",
};

interface SheetContentProps {
  side?: Side;
  open: boolean;
  children: React.ReactNode;
  title: string;
  description?: string;
  className?: string;
}

function SheetContent({ side = "right", open, children, title, description, className }: SheetContentProps) {
  const reduced = usePrefersReducedMotion();

  return (
    <DialogPrimitive.Portal forceMount>
      <AnimatePresence>
        {open && (
          <>
            <DialogPrimitive.Overlay asChild forceMount>
              <motion.div
                key="overlay"
                variants={overlayVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-[70] bg-foreground/30 backdrop-blur-[2px]"
              />
            </DialogPrimitive.Overlay>
            <DialogPrimitive.Content asChild forceMount onOpenAutoFocus={(e) => side === "center" && e.preventDefault()}>
              <motion.div
                key="content"
                variants={sideVariants(side, reduced)}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className={cn("z-[80] flex flex-col overflow-y-auto", sideClass[side], className)}
              >
                <div className="flex items-center justify-between border-b border-border p-5">
                  <DialogPrimitive.Title className="font-display text-lg font-semibold">
                    {title}
                  </DialogPrimitive.Title>
                  <DialogPrimitive.Close asChild>
                    <button
                      type="button"
                      aria-label="Close"
                      className="flex h-11 w-11 items-center justify-center rounded-pill text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </DialogPrimitive.Close>
                </div>
                {description && (
                  <DialogPrimitive.Description className="sr-only">{description}</DialogPrimitive.Description>
                )}
                <div className="flex-1">{children}</div>
              </motion.div>
            </DialogPrimitive.Content>
          </>
        )}
      </AnimatePresence>
    </DialogPrimitive.Portal>
  );
}

export { Sheet, SheetTrigger, SheetClose, SheetContent };
