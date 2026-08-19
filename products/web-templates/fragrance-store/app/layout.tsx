import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

import { Navbar } from "@/components/store/navbar";
import { Footer } from "@/components/store/footer";
import { Providers } from "@/components/store/providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ambre — Small-Batch Fragrance E-Commerce Template",
  description:
    "A full fragrance/perfume e-commerce storefront template: product catalog, product detail pages, a persistent cart, and a demo checkout flow. Built with Next.js, Tailwind CSS, shadcn/ui, and framer-motion.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="flex min-h-screen flex-col font-sans antialiased">
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
