"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { List, X } from "@phosphor-icons/react/dist/ssr";

import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { CounterscentLogo } from "@/components/site/logo";

const NAV_LINKS = [
  { href: "/dupe-finder", label: "Dupe Finder" },
  { href: "/library", label: "Library" },
  { href: "/about", label: "Our Standards" },
];

/** Producer-facing entry point, kept visually separate from the reader nav
 *  above: it addresses a different audience (fragrance houses, not buyers),
 *  and burying it inside the reader nav would both confuse readers and hide
 *  it from the people it is actually for. */
const PRODUCER_LINK = { href: "/producers", label: "For producers" };

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" onClick={() => setOpen(false)} aria-label="Counterscent — home">
          <CounterscentLogo tagline />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-lg px-4 py-2 text-sm font-semibold transition-colors duration-150",
                  active ? "text-primary" : "text-foreground/75 hover:text-foreground"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1">
          <Link
            href={PRODUCER_LINK.href}
            className={cn(
              "mr-1 hidden rounded-lg border px-3.5 py-1.5 text-sm font-semibold transition-colors duration-150 lg:inline-flex",
              pathname.startsWith(PRODUCER_LINK.href)
                ? "border-primary text-primary"
                : "border-border text-foreground/75 hover:border-primary/50 hover:text-foreground"
            )}
          >
            {PRODUCER_LINK.label}
          </Link>
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-foreground/70 hover:bg-secondary hover:text-foreground lg:hidden"
          >
            {open ? <X className="h-[18px] w-[18px]" /> : <List className="h-[18px] w-[18px]" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
            className="overflow-hidden border-t border-border lg:hidden"
          >
            <div className="container flex flex-col gap-1 py-3">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-semibold text-foreground/85 hover:bg-secondary"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href={PRODUCER_LINK.href}
                onClick={() => setOpen(false)}
                className="mt-1 rounded-lg border border-border px-3 py-2.5 text-sm font-semibold text-foreground/85 hover:bg-secondary"
              >
                {PRODUCER_LINK.label}
              </Link>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
