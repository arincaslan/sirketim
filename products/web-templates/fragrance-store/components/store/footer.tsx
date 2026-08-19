import Image from "next/image";
import Link from "next/link";
import { Instagram, Facebook, Twitter } from "lucide-react";

const SHOP_LINKS = [
  { href: "/products", label: "All fragrances" },
  { href: "/products?family=Floral", label: "Floral" },
  { href: "/products?family=Woody", label: "Woody" },
  { href: "/products?family=Oriental", label: "Oriental" },
  { href: "/products?family=Fresh", label: "Fresh" },
];

const COMPANY_LINKS = [
  { href: "/about", label: "About" },
  { href: "/cart", label: "Your bag" },
  { href: "mailto:hello@example.com", label: "Contact" },
];

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="container grid gap-10 py-16 sm:grid-cols-2 md:grid-cols-4">
        <div className="sm:col-span-2 md:col-span-2">
          <Link href="/" className="flex items-center">
            <Image
              src="/logo-sigdir.png"
              alt="Sirketim"
              width={120}
              height={34}
              className="h-auto w-[120px]"
            />
          </Link>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            Small-batch fragrance, blended around a single idea per bottle.
            Twelve scents, no fillers.
          </p>
          <div className="mt-5 flex items-center gap-3">
            <a
              href="#"
              aria-label="Instagram"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:text-foreground"
            >
              <Instagram className="h-4 w-4" />
            </a>
            <a
              href="#"
              aria-label="Facebook"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:text-foreground"
            >
              <Facebook className="h-4 w-4" />
            </a>
            <a
              href="#"
              aria-label="Twitter"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:text-foreground"
            >
              <Twitter className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold">Shop</p>
          <ul className="mt-4 flex flex-col gap-2.5">
            {SHOP_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold">Company</p>
          <ul className="mt-4 flex flex-col gap-2.5">
            {COMPANY_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-border py-6">
        <div className="container flex flex-col items-center justify-between gap-2 text-xs text-muted-foreground sm:flex-row">
          <p>&copy; {new Date().getFullYear()} Ambre. All rights reserved.</p>
          <p>A Sirketim web template — demo store, no orders are actually processed.</p>
        </div>
      </div>
    </footer>
  );
}
