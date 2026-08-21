import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: {
        "2xl": "1280px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // "ember" is NOCTURNE's single saturated accent (CTAs, price, focus
        // rings) — the equivalent role fragrance-store's "gold" plays there,
        // renamed because the color and mood are deliberately different
        // (hot crimson vs muted gold).
        ember: {
          DEFAULT: "hsl(var(--ember))",
          foreground: "hsl(var(--ember-foreground))",
        },
        // "foil" is the desaturated warm-silver secondary accent — dividers,
        // icon strokes, small labels. Never used as a CTA color.
        foil: "hsl(var(--foil))",
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "ui-serif", "Georgia", "serif"],
      },
      fontSize: {
        "fluid-h3": ["clamp(1.5rem, 1.3rem + 1vw, 2.1rem)", { lineHeight: "1.15" }],
        "fluid-h2": [
          "clamp(2rem, 1.5rem + 2.2vw, 3.25rem)",
          { lineHeight: "1.05", letterSpacing: "-0.01em" },
        ],
        "fluid-h1": [
          "clamp(2.75rem, 1.7rem + 4.6vw, 5.5rem)",
          { lineHeight: "0.98", letterSpacing: "-0.02em" },
        ],
        "fluid-hero": [
          "clamp(3rem, 1rem + 8vw, 8rem)",
          { lineHeight: "0.92", letterSpacing: "-0.025em" },
        ],
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s ease-out forwards",
        marquee: "marquee 28s linear infinite",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
