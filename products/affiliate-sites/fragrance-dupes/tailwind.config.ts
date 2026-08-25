import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
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
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        // UI-chrome text/badge colors for the Reference/Dupe series identity
        // (badges, labels, table headers) - a text-contrast-safe variant of
        // the chart palette below, not the literal chart-mark hexes (those
        // only need to clear 3:1 as graphical marks, not 4.5:1 as text; see
        // globals.css's --series-reference-text comment). `dupe` doubles as
        // both since its chart hex already clears 4.5:1 on its own.
        reference: {
          DEFAULT: "hsl(var(--series-reference-text))",
        },
        dupe: {
          DEFAULT: "hsl(var(--series-dupe))",
        },
      },
      borderRadius: {
        // Documented shape rule (DESIGN.md §3): frames/cards/tables/inputs
        // stay near-sharp, buttons get a modest rounded rect, tags/chips/
        // badges are full pill. Three distinct tokens, used consistently -
        // never an arbitrary radius value outside these three.
        frame: "var(--radius-frame)",
        lg: "var(--radius-button)",
        md: "var(--radius-button)",
        sm: "var(--radius-frame)",
        pill: "var(--radius-pill)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "ui-serif", "Georgia", "serif"],
      },
      fontSize: {
        "fluid-h3": ["clamp(1.375rem, 1.2rem + 0.9vw, 1.875rem)", { lineHeight: "1.25" }],
        "fluid-h2": [
          "clamp(1.875rem, 1.4rem + 2.2vw, 3rem)",
          { lineHeight: "1.1", letterSpacing: "-0.005em" },
        ],
        "fluid-h1": [
          "clamp(2.25rem, 1.5rem + 3.6vw, 4.5rem)",
          { lineHeight: "1.04", letterSpacing: "-0.01em" },
        ],
      },
      transitionTimingFunction: {
        // Emil Kowalski's stronger custom curves (DESIGN.md §5) - overriding
        // Tailwind's built-in `ease-out`/`ease-in-out` keys directly means
        // every plain `ease-out`/`ease-in-out` class site-wide gets the
        // strong curve automatically, no arbitrary-value classes needed.
        out: "cubic-bezier(0.23, 1, 0.32, 1)",
        "in-out": "cubic-bezier(0.77, 0, 0.175, 1)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px) scale(0.98)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
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
        "fade-up": "fade-up 0.5s cubic-bezier(0.23, 1, 0.32, 1) forwards",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      boxShadow: {
        object: "0 1px 2px hsl(150 20% 10% / 0.06), 0 10px 28px -12px hsl(150 25% 12% / 0.16)",
      },
      typography: () => ({
        DEFAULT: {
          css: {
            "--tw-prose-body": "hsl(var(--foreground))",
            "--tw-prose-headings": "hsl(var(--foreground))",
            "--tw-prose-links": "hsl(var(--primary))",
            "--tw-prose-bold": "hsl(var(--foreground))",
            "--tw-prose-quotes": "hsl(var(--foreground))",
            "--tw-prose-quote-borders": "hsl(var(--primary))",
            maxWidth: "68ch",
          },
        },
      }),
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
};

export default config;
