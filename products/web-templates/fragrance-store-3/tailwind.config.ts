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
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
      },
      borderRadius: {
        // Meridian's split radius system: frames/cards/images stay sharp
        // (0), interactive "objects" (buttons, chips, badges) use the
        // separate `pill` utility below. See DESIGN.md.
        lg: "var(--radius)",
        md: "var(--radius)",
        sm: "var(--radius)",
        pill: "var(--radius-pill)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "ui-serif", "Georgia", "serif"],
      },
      fontSize: {
        "fluid-h3": ["clamp(1.375rem, 1.2rem + 0.9vw, 1.875rem)", { lineHeight: "1.2" }],
        "fluid-h2": [
          "clamp(1.875rem, 1.4rem + 2.2vw, 3.25rem)",
          { lineHeight: "1.08", letterSpacing: "-0.01em" },
        ],
        "fluid-h1": [
          "clamp(2.5rem, 1.6rem + 4.2vw, 5.25rem)",
          { lineHeight: "1.02", letterSpacing: "-0.015em" },
        ],
        "fluid-hero": [
          "clamp(2.75rem, 1rem + 8vw, 7.5rem)",
          { lineHeight: "0.96", letterSpacing: "-0.02em" },
        ],
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        shimmer: "shimmer 2.4s linear infinite",
      },
      boxShadow: {
        object: "0 1px 2px hsl(264 30% 20% / 0.06), 0 12px 32px -12px hsl(264 30% 20% / 0.18)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
