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
  image: string;
  family: ScentFamily;
  sizeMl: number;
  unitPrice: number;
  quantity?: number;
  label?: string;
}

export function AddToCartButton({
  slug,
  name,
  image,
  family,
  sizeMl,
  unitPrice,
  quantity = 1,
  label = "Add to bag",
  className,
  ...buttonProps
}: AddToCartButtonProps) {
  const addItem = useCartStore((state) => state.addItem);
  const { showToast } = useToast();
  const [justAdded, setJustAdded] = useState(false);

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();

    addItem({ slug, name, image, family, sizeMl, unitPrice }, quantity);
    showToast({
      title: name,
      description: `${quantity} x ${sizeMl}ml added to your bag`,
      image,
    });

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
              <Check className="h-4 w-4" />
              Added
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
              <ShoppingBag className="h-4 w-4" />
              {label}
            </motion.span>
          )}
        </AnimatePresence>
      </Button>
    </motion.span>
  );
}
