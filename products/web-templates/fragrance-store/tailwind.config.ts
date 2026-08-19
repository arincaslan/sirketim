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
        gold: {
          DEFAULT: "hsl(var(--gold))",
          foreground: "hsl(var(--gold-foreground))",
        },
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
        serif: ["var(--font-serif)", "ui-serif", "Georgia", "serif"],
      },
      fontSize: {
        // Fluid type scale: clamp()-based, scales continuously between a small
        // viewport (375px) and a wide desktop viewport (1440px) instead of
        // jumping at fixed Tailwind breakpoints. Only `fluid-hero` is wired up
        // (hero H1) for this pass; the rest of the scale is here for reuse.
        "fluid-h3": ["clamp(1.5rem, 1.32rem + 0.9vw, 2rem)", { lineHeight: "1.2" }],
        "fluid-h2": [
          "clamp(1.875rem, 1.5rem + 1.9vw, 2.75rem)",
          { lineHeight: "1.15", letterSpacing: "-0.01em" },
        ],
        "fluid-h1": [
          "clamp(2.5rem, 1.7rem + 4vw, 4.5rem)",
          { lineHeight: "1.08", letterSpacing: "-0.015em" },
        ],
        "fluid-hero": [
          "clamp(2.25rem, 0.93rem + 5.63vw, 6rem)",
          { lineHeight: "1.05", letterSpacing: "-0.02em" },
        ],
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s ease-out forwards",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
