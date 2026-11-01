import Link from "next/link";

import { CounterscentLogo } from "@/components/site/logo";
import { CookieSettingsButton } from "@/components/kit/ConsentBanner";
import { LEGAL_ENTITY, PRODUCER_CONSOLE } from "@/lib/site";

const COLUMNS = [
  {
    heading: "Tool",
    links: [
      { href: "/dupe-finder", label: "Dupe Finder" },
      { href: "/fragrance", label: "Fragrance Catalog" },
      { href: "/new", label: "What's New" },
      { href: "/originals", label: "Where to Buy" },
      { href: "/library", label: "Library" },
    ],
  },
  {
    heading: "About",
    links: [
      { href: "/about", label: "Our Standards" },
      { href: "/disclosure", label: "Affiliate Disclosure" },
      { href: "/privacy", label: "Privacy Policy" },
      // Terms and Refunds are in the footer because a payment provider's
      // domain review requires all three legal documents to be "clearly
      // accessible via navigation" - a page that exists but is only reachable
      // by typing the URL fails that check. Added 2026-09-24 with the pages
      // themselves; see app/terms/page.tsx for the full reasoning.
      { href: "/terms", label: "Terms of Service" },
      // OFF-SITE ON PURPOSE. The refund policy lives on the console, because
      // that is the only origin where a subscription can be bought - a refund
      // policy on a site with no checkout describes a transaction that does
      // not happen there. Founder decision, 2026-09-24. The link stays in this
      // footer so the document is reachable by navigation from BOTH origins,
      // which is what a merchant-of-record domain review checks for.
      { href: `${PRODUCER_CONSOLE}/refunds`, label: "Refund Policy" },
      // Added 2026-11-01 with the consent banner: the banner links here, and
      // a policy only reachable from a banner the visitor already dismissed
      // is not navigable.
      { href: "/cookies", label: "Cookie Policy" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    // THE TURKISH TEXTS, 2026-11-01. Same documents and version dates as the
    // English ones, in Turkish: the controller is a Turkish company and KVKK
    // expects the notice in the data subject's language. Each page links to
    // its counterpart. The refund policy's Turkish half is a section of the
    // console's own page (#tr), so it cannot drift into a second document.
    heading: "Türkçe",
    links: [
      { href: "/tr/gizlilik", label: "Gizlilik ve KVKK" },
      { href: "/tr/kullanim-kosullari", label: "Kullanım Koşulları" },
      { href: "/tr/cerez-politikasi", label: "Çerez Politikası" },
      { href: `${PRODUCER_CONSOLE}/refunds#tr`, label: "İade ve İptal" },
    ],
  },
  {
    heading: "For producers",
    links: [
      { href: "/producers", label: "List your fragrance" },
      { href: "/producers/pricing", label: "Plans and pricing" },
      // Straight to the console rather than through /producers/login, which
      // is now a hand-off page explaining that sign-in lives on another
      // origin. Sending someone to a page whose only job is to point at a
      // second page is a hop nobody needs from a footer. /producers/login
      // stays for anyone arriving on the old URL.
      { href: `${PRODUCER_CONSOLE}/sign-in`, label: "Producer sign in" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="container grid gap-10 py-16 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1fr]">
        <div className="flex flex-col gap-3">
          <CounterscentLogo />
          {/* "We buy what we review" stood here and was false - see the note in
              components/home/chapter-gap.tsx. It sat in the footer of every
              page, which is the worst place for a claim we cannot support. */}
          <p className="max-w-[38ch] text-sm text-muted-foreground">
            Independent fragrance-dupe comparisons. One published formula,
            applied the same way to every bottle, and we say plainly where a
            match is strong and where it isn&apos;t.
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
          {/* The legal entity, not just the brand. A merchant-of-record's
              verification checks the trading site against the registered
              company. Until 2026-11-01 this said "Sirketim A.Ş.", the internal
              workspace name; it now reads the registered title from
              lib/site.ts, the same constant every legal page uses. */}
          <p>Counterscent is operated by {LEGAL_ENTITY}, Türkiye. Independent editorial, funded by affiliate commissions.</p>
          <CookieSettingsButton className="text-left underline underline-offset-2 hover:text-primary" />
        </div>
      </div>
    </footer>
  );
}
