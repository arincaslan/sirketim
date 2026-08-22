import type { Metadata } from "next";
import { Bodoni_Moda, Manrope } from "next/font/google";
import "./globals.css";

import { Navbar } from "@/components/store/navbar";
import { Footer } from "@/components/store/footer";
import { Providers } from "@/components/store/providers";
import { OG_DEFAULT_IMAGE } from "@/lib/media";

const bodoniModa = Bodoni_Moda({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["500", "600", "700", "800"],
  style: ["normal", "italic"],
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const SITE_URL = "https://meridian-template.sirketim.example";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Meridian — Scent as a Place",
    template: "%s — Meridian",
  },
  description:
    "A mineral-light, editorial-gallery fragrance e-commerce template. Ten fragrances, each built around a remembered place. Built with Next.js, Tailwind CSS, shadcn/ui, and framer-motion.",
  openGraph: {
    title: "Meridian — Scent as a Place",
    description: "Ten fragrances, each built around a remembered place.",
    url: SITE_URL,
    siteName: "Meridian",
    images: [{ url: OG_DEFAULT_IMAGE, width: 1200, height: 630, alt: "Meridian — Scent as a Place" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Meridian — Scent as a Place",
    description: "Ten fragrances, each built around a remembered place.",
    images: [OG_DEFAULT_IMAGE],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${bodoniModa.variable} ${manrope.variable}`}>
      <body className="flex min-h-screen flex-col bg-background font-sans text-foreground antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-pill focus:bg-foreground focus:px-5 focus:py-3 focus:text-sm focus:font-semibold focus:text-background"
        >
          Skip to content
        </a>
        <Providers>
          <Navbar />
          <main id="main-content" className="flex-1">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
