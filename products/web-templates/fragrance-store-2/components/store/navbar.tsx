"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, ShoppingBag, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { useCartStore, selectCartCount } from "@/lib/cart-store";

const NAV_LINKS = [
  { href: "/products", label: "Shop" },
  { href: "/products?family=Oriental", label: "Oriental" },
  { href: "/products?family=Woody", label: "Woody" },
  { href: "/about", label: "About" },
];

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const count = useCartStore(selectCartCount);
  const hasHydrated = useCartStore((state) => state.hasHydrated);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll while the full-screen mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-colors duration-300",
        scrolled || menuOpen
          ? "border-b border-border bg-background/95 backdrop-blur"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <div className="container flex h-[4.5rem] items-center justify-between py-4">
        <Link
          href="/"
          className="font-display text-xl font-semibold tracking-[0.08em]"
        >
          NOCTURNE
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <Link
            href="/cart"
            aria-label="View shopping bag"
            className="relative flex h-11 w-11 items-center justify-center rounded-sm transition-colors hover:bg-secondary"
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
                  className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-semibold text-primary-foreground"
                >
                  {count}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            className="flex h-11 w-11 items-center justify-center rounded-sm transition-colors hover:bg-secondary md:hidden"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Full-screen takeover menu on mobile — distinct from Ambre's inline
          accordion dropdown. */}
      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 bottom-0 top-[4.5rem] z-40 flex flex-col justify-center gap-2 bg-background px-8 md:hidden"
          >
            {NAV_LINKS.map((link, index) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="font-display block py-3 text-4xl font-semibold"
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
