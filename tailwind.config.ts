import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))"
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))"
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))"
        }
      },
      borderRadius: {
        "2xl": "0.875rem",
        "3xl": "1.25rem"
      },
      boxShadow: {
        soft:      "0 1px 4px -1px rgba(15,23,42,0.08), 0 0 0 1px rgba(15,23,42,0.04)",
        md:        "0 4px 20px -4px rgba(15,23,42,0.12), 0 0 0 1px rgba(15,23,42,0.05)",
        glow:      "0 0 0 1px rgba(99,102,241,0.18), 0 8px 32px -8px rgba(79,70,229,0.42)",
        "glow-sm": "0 4px 14px -4px rgba(79,70,229,0.35)"
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "ui-sans-serif", "system-ui"]
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to:   { opacity: "1", transform: "translateY(0)" }
        }
      },
      animation: {
        "fade-up": "fade-up 0.3s ease-out both"
      }
    }
  },
  plugins: []
};

export default config;
