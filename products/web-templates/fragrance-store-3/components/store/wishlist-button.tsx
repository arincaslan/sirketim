"use client";

import type { MouseEvent } from "react";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";

import { cn } from "@/lib/utils";
import { useWishlistStore } from "@/lib/wishlist-store";

interface WishlistButtonProps {
  slug: string;
  name: string;
  className?: string;
  size?: "sm" | "md";
}

export function WishlistButton({ slug, name, className, size = "md" }: WishlistButtonProps) {
  const isSaved = useWishlistStore((state) => state.has(slug));
  const toggle = useWishlistStore((state) => state.toggle);

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    toggle(slug);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={isSaved}
      aria-label={isSaved ? `Remove ${name} from wishlist` : `Add ${name} to wishlist`}
      className={cn(
        "flex items-center justify-center rounded-pill bg-card/90 text-foreground shadow-object backdrop-blur transition-colors hover:text-primary",
        size === "sm" ? "h-9 w-9" : "h-11 w-11",
        className
      )}
    >
      <motion.span whileTap={{ scale: 0.8 }} className="inline-flex">
        <Heart
          className={cn("h-4 w-4 transition-colors", isSaved && "fill-primary text-primary")}
          aria-hidden="true"
        />
      </motion.span>
    </button>
  );
}
