"use client";

import { useState, type MouseEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ShoppingBag } from "lucide-react";

import { Button, type ButtonProps } from "@/components/ui/button";
import { useCartStore } from "@/lib/cart-store";
import { useToast } from "@/lib/toast-context";
import type { ScentFamily } from "@/lib/types";

interface AddToCartButtonProps extends Omit<ButtonProps, "onClick"> {
  slug: string;
  name: string;
  family: ScentFamily;
  sizeMl: number;
  unitPrice: number;
  isSample?: boolean;
  quantity?: number;
  label?: string;
  /** "drawer" (default) pops the slide-in bag — the right feedback for a
   * deliberate add from a PDP. "toast" adds quietly and shows a bottom
   * toast instead, used where popping a full drawer would be excessive
   * (grid quick-add, discovery-flow result, cross-sell rails). */
  feedback?: "drawer" | "toast";
}

export function AddToCartButton({
  slug,
  name,
  family,
  sizeMl,
  unitPrice,
  isSample = false,
  quantity = 1,
  label = "Add to bag",
  feedback = "drawer",
  className,
  ...buttonProps
}: AddToCartButtonProps) {
  const addItem = useCartStore((state) => state.addItem);
  const closeDrawer = useCartStore((state) => state.closeDrawer);
  const { showToast } = useToast();
  const [justAdded, setJustAdded] = useState(false);

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();

    addItem({ slug, name, family, sizeMl, unitPrice, isSample }, quantity);
    if (feedback === "toast") {
      closeDrawer();
      showToast({
        title: name,
        description: `${quantity} x ${isSample ? "Sample" : `${sizeMl}ml`} added to your bag`,
        family,
        slug,
        actionLabel: "View bag",
        actionHref: "/cart",
      });
    }

    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1400);
  }

  return (
    <motion.span whileTap={{ scale: 0.97 }} className="inline-block">
      <Button type="button" onClick={handleClick} className={className} {...buttonProps}>
        <AnimatePresence mode="wait" initial={false}>
          {justAdded ? (
            <motion.span
              key="added"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="flex items-center gap-2"
            >
              <Check className="h-4 w-4" /> Added
            </motion.span>
          ) : (
            <motion.span
              key="add"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="flex items-center gap-2"
            >
              <ShoppingBag className="h-4 w-4" /> {label}
            </motion.span>
          )}
        </AnimatePresence>
      </Button>
    </motion.span>
  );
}
