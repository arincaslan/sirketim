import Link from "next/link";

const FOOTER_LINKS = [
  {
    heading: "Shop",
    links: [
      { href: "/products", label: "All fragrances" },
      { href: "/products?family=Oriental", label: "Oriental" },
      { href: "/products?family=Fresh", label: "Fresh" },
      { href: "/discover", label: "Find your scent" },
    ],
  },
  {
    heading: "Studio",
    links: [
      { href: "/about", label: "Atelier" },
      { href: "/journal", label: "Journal" },
      { href: "/wishlist", label: "Wishlist" },
      { href: "/cart", label: "Bag" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="container grid gap-10 py-16 md:grid-cols-[1.3fr_1fr_1fr]">
        <div>
          <p className="font-sans text-sm font-bold uppercase tracking-[0.3em]">Meridian</p>
          <p className="font-display text-sm italic text-primary">Parfumerie</p>
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">
            Ten fragrances, each built around a remembered place rather than a
            mood word. Small batches, a sample with every order, no forty-note
            marketing pyramids.
          </p>
        </div>

        {FOOTER_LINKS.map((group) => (
          <div key={group.heading}>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{group.heading}</p>
            <ul className="mt-4 flex flex-col gap-2.5">
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-border">
        <div className="container flex flex-col gap-2 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} Meridian. A Sirketim web template.</p>
          <p>Demo storefront — no orders are actually processed.</p>
        </div>
      </div>
    </footer>
  );
}
