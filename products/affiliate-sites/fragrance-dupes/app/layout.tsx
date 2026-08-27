import type { Metadata } from "next";
import { Cormorant_Garamond, Public_Sans } from "next/font/google";

import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { MotionProvider } from "@/components/site/motion-provider";
import { Preloader } from "@/components/site/preloader";
import { CustomCursor } from "@/components/site/custom-cursor";
import { GoogleAnalytics } from "@/components/kit/Analytics";
import { JsonLd } from "@/components/kit/JsonLd";
import { siteUrl } from "@/lib/site";
import "./globals.css";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

const sans = Public_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

const SITE_DESCRIPTION =
  "Honest, data-driven comparisons between designer fragrances and their closest dupes - visual note comparisons, real spec tables, and a matcher tool, not a text wall.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: "Drydown - Independent Fragrance Dupe Comparisons",
    template: "%s | Drydown",
  },
  description: SITE_DESCRIPTION,
  // Every page inherits a canonical unless it sets its own. Without this the
  // site had none at all, which leaves a crawler to guess which of several
  // reachable URLs is the real one.
  alternates: { canonical: "/" },
  verification: {
    google: process.env.NEXT_PUBLIC_GSC_VERIFICATION || undefined,
  },
  openGraph: {
    type: "website",
    siteName: "Drydown",
    url: siteUrl(),
    title: "Drydown - Independent Fragrance Dupe Comparisons",
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "Drydown - Independent Fragrance Dupe Comparisons",
    description: SITE_DESCRIPTION,
  },
};

/**
 * Site-wide structured data. Only Article/Review/ItemList existed before, and
 * only on content routes, so nothing told a search engine what this site or
 * its publisher actually is.
 *
 * `publisher` names Sirketim rather than Drydown: the FTC disclosure and the
 * independence claim both rest on who operates the site, and burying that is
 * the opposite of what an affiliate site should do.
 */
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Drydown",
  url: siteUrl(),
  description: SITE_DESCRIPTION,
  parentOrganization: { "@type": "Organization", name: "Sirketim" },
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Drydown",
  url: siteUrl(),
  description: SITE_DESCRIPTION,
  publisher: { "@type": "Organization", name: "Sirketim" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Applies the stored/system theme before first paint, to avoid a
            flash of the wrong theme - see components/site/theme-toggle.tsx. */}
        <script
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('drydown-theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark');}catch(e){}})();`,
          }}
        />
      </head>
      <body className={`${display.variable} ${sans.variable} paper-grain min-h-dvh antialiased`}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
        >
          Skip to content
        </a>
        <JsonLd data={organizationSchema} />
        <JsonLd data={websiteSchema} />
        <CustomCursor />
        <Preloader />
        <MotionProvider>
          <SiteHeader />
          <main id="main-content">{children}</main>
          <SiteFooter />
        </MotionProvider>
        <GoogleAnalytics />
      </body>
    </html>
  );
}
