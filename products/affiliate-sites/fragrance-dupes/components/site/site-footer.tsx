import Link from "next/link";

const COLUMNS = [
  {
    heading: "Tool",
    links: [
      { href: "/dupe-finder", label: "Dupe Finder" },
      { href: "/library", label: "Library" },
    ],
  },
  {
    heading: "About",
    links: [
      { href: "/about", label: "Our Standards" },
      { href: "/disclosure", label: "Affiliate Disclosure" },
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    heading: "For producers",
    links: [
      { href: "/producers", label: "List your fragrance" },
      { href: "/producers/pricing", label: "Plans and pricing" },
      { href: "/producers/login", label: "Producer sign in" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="container grid gap-10 py-16 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="flex flex-col gap-3">
          <span className="font-display text-xl font-semibold tracking-[0.02em]">DRYDOWN</span>
          <p className="max-w-[38ch] text-sm text-muted-foreground">
            Independent fragrance-dupe comparisons. We buy what we review and
            we say plainly where a match is strong and where it isn&apos;t.
          </p>
        </div>

        {COLUMNS.map((column) => (
          <div key={column.heading} className="flex flex-col gap-3">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              {column.heading}
            </span>
            <ul className="flex flex-col gap-2">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-foreground/80 transition-colors hover:text-primary"
                  >
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
          <p>Drydown is a Sirketim product. Independent editorial, funded by affiliate commissions.</p>
        </div>
      </div>
    </footer>
  );
}
