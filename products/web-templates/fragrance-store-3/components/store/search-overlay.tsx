"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Search, X } from "lucide-react";

import { PRODUCTS, getStartingPrice } from "@/lib/products";
import { formatPrice } from "@/lib/utils";

interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
}

export function SearchOverlay({ open, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return PRODUCTS.filter(
      (product) =>
        product.name.toLowerCase().includes(q) ||
        product.tagline.toLowerCase().includes(q) ||
        product.family.toLowerCase().includes(q) ||
        product.place.toLowerCase().includes(q)
    ).slice(0, 6);
  }, [query]);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!query.trim()) return;
    router.push(`/products?q=${encodeURIComponent(query.trim())}`);
    onClose();
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.2 }}
          role="search"
          className="absolute inset-x-0 top-full z-40 border-b border-border bg-card shadow-object"
        >
          <div className="container py-5">
            <form onSubmit={handleSubmit} className="flex items-center gap-3">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <label htmlFor="site-search" className="sr-only">
                Search fragrances
              </label>
              <input
                id="site-search"
                type="search"
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search fragrances, families, places…"
                className="h-11 flex-1 border-0 bg-transparent text-base outline-none placeholder:text-muted-foreground"
              />
              <button
                type="button"
                onClick={onClose}
                aria-label="Close search"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-pill text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </form>

            {results.length > 0 && (
              <ul className="mt-4 flex flex-col divide-y divide-border border-t border-border">
                {results.map((product) => (
                  <li key={product.slug}>
                    <Link
                      href={`/products/${product.slug}`}
                      onClick={onClose}
                      className="flex items-center justify-between gap-4 py-3 text-sm hover:text-primary"
                    >
                      <span>
                        <span className="font-display font-semibold">{product.name}</span>
                        <span className="ml-2 text-xs uppercase tracking-wide text-muted-foreground">
                          {product.family}
                        </span>
                      </span>
                      <span className="shrink-0 tabular-nums text-muted-foreground">
                        From {formatPrice(getStartingPrice(product))}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            {query.trim() && results.length === 0 && (
              <p className="mt-4 border-t border-border pt-4 text-sm text-muted-foreground">
                No fragrances match &ldquo;{query}&rdquo;.
              </p>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
