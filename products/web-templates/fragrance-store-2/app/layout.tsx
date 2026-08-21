import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";

import { Navbar } from "@/components/store/navbar";
import { Footer } from "@/components/store/footer";
import { Providers } from "@/components/store/providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Nocturne — Dark-Maximalist Fragrance E-Commerce Template",
  description:
    "A full fragrance/perfume e-commerce storefront template built around a dark-maximalist direction: product catalog, product detail, a persistent bag, and a demo checkout flow. Built with Next.js, Tailwind CSS, shadcn/ui, and framer-motion.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable} dark`}>
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
