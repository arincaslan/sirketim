"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, ShoppingBag, X } from "lucide-react";

import { useCartStore, selectCartCount } from "@/lib/cart-store";

const NAV_LINKS = [
  { href: "/products", label: "Shop All" },
  { href: "/products?family=Floral", label: "Floral" },
  { href: "/products?family=Woody", label: "Woody" },
  { href: "/about", label: "About" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const openCart = useCartStore((state) => state.openCart);
  const count = useCartStore(selectCartCount);
  const hasHydrated = useCartStore((state) => state.hasHydrated);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/90 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center">
          <Image
            src="/logo-sigdir.png"
            alt="Sirketim"
            width={140}
            height={39}
            priority
            className="h-auto w-[140px]"
          />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={openCart}
            aria-label="Open shopping bag"
            className="relative flex h-10 w-10 items-center justify-center rounded-md transition-colors hover:bg-secondary"
          >
            <ShoppingBag className="h-5 w-5" />
            <AnimatePresence>
              {hasHydrated && count > 0 && (
                <motion.span
                  key={count}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 20 }}
                  className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1 text-[11px] font-semibold text-gold-foreground"
                >
                  {count}
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label="Toggle menu"
            className="flex h-10 w-10 items-center justify-center rounded-md transition-colors hover:bg-secondary md:hidden"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t border-border md:hidden"
          >
            <div className="container flex flex-col gap-1 py-3">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-md px-2 py-2.5 text-sm font-medium text-foreground hover:bg-secondary"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
