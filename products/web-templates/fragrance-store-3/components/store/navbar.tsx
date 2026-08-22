"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, Menu, Search, ShoppingBag, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { useCartStore, selectCartCount } from "@/lib/cart-store";
import { useWishlistStore, selectWishlistCount } from "@/lib/wishlist-store";
import { SearchOverlay } from "@/components/store/search-overlay";

const NAV_LINKS = [
  { href: "/products", label: "Shop" },
  { href: "/discover", label: "Discover your scent" },
  { href: "/journal", label: "Journal" },
  { href: "/about", label: "Atelier" },
];

function CountBadge({ count }: { count: number }) {
  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.span
          key={count}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 22 }}
          className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground"
          aria-hidden="true"
        >
          {count}
        </motion.span>
      )}
    </AnimatePresence>
  );
}

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const cartCount = useCartStore(selectCartCount);
  const cartHydrated = useCartStore((state) => state.hasHydrated);
  const openDrawer = useCartStore((state) => state.openDrawer);
  const wishlistCount = useWishlistStore(selectWishlistCount);
  const wishlistHydrated = useWishlistStore((state) => state.hasHydrated);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
        scrolled || menuOpen || searchOpen
          ? "border-b border-border bg-background/95 backdrop-blur"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <div className="relative">
        <div className="container flex h-[4.75rem] items-center justify-between">
          <Link href="/" className="flex flex-col leading-none">
            <span className="font-sans text-[0.7rem] font-bold uppercase tracking-[0.32em]">
              Meridian
            </span>
            <span className="font-display text-xs italic text-primary">Parfumerie</span>
            <span className="sr-only"> — home</span>
          </Link>

          <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
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

          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={() => setSearchOpen((v) => !v)}
              aria-expanded={searchOpen}
              aria-label={searchOpen ? "Close search" : "Search"}
              className="flex h-11 w-11 items-center justify-center rounded-pill text-foreground transition-colors hover:bg-secondary"
            >
              {searchOpen ? <X className="h-[18px] w-[18px]" /> : <Search className="h-[18px] w-[18px]" />}
            </button>

            <Link
              href="/wishlist"
              aria-label={wishlistHydrated && wishlistCount > 0 ? `View wishlist, ${wishlistCount} saved` : "View wishlist"}
              className="relative flex h-11 w-11 items-center justify-center rounded-pill text-foreground transition-colors hover:bg-secondary"
            >
              <Heart className="h-[18px] w-[18px]" />
              {wishlistHydrated && <CountBadge count={wishlistCount} />}
            </Link>

            <button
              type="button"
              onClick={openDrawer}
              aria-label={cartHydrated && cartCount > 0 ? `Open bag, ${cartCount} items` : "Open bag"}
              className="relative flex h-11 w-11 items-center justify-center rounded-pill text-foreground transition-colors hover:bg-secondary"
            >
              <ShoppingBag className="h-[18px] w-[18px]" />
              {cartHydrated && <CountBadge count={cartCount} />}
            </button>

            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
              className="flex h-11 w-11 items-center justify-center rounded-pill text-foreground transition-colors hover:bg-secondary lg:hidden"
            >
              {menuOpen ? <X className="h-[18px] w-[18px]" /> : <Menu className="h-[18px] w-[18px]" />}
            </button>
          </div>
        </div>

        <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            aria-label="Mobile"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 bottom-0 top-[4.75rem] z-40 flex flex-col justify-center gap-1 bg-background px-8 lg:hidden"
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
