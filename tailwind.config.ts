import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["Inter", "SF Pro Display", "system-ui", "sans-serif"],
      },
      colors: {
        background: {
          DEFAULT: "#1A1A1C",
          section: "#222226",
          elevated: "#2A2A2D",
        },
        card: { DEFAULT: "#2A2A2D", foreground: "#F3F4F6" },
        section: { DEFAULT: "#242426" },
        primary: {
          DEFAULT: "#F3F4F6",
          softer: "#C7C7CC",
        },
        secondary: {
          DEFAULT: "#C7C7CC",
        },
        accent: {
          DEFAULT: "#4ADE80",
          foreground: "#052E16",
        },
        border: "#3A3A3D",
        input: "#242426",
        muted: { DEFAULT: "#232328", foreground: "#777882" },
        success: { DEFAULT: "#22C55E", background: "#24341B", foreground: "#DCFCE7" },
        warning: { DEFAULT: "#FDE68A", background: "#50440D", foreground: "#FDE68A" },
        danger: { DEFAULT: "#F87171", background: "#4B1818", foreground: "#FCA5A5" },
      },
      backgroundImage: {
        "hero-gradient": "linear-gradient(135deg, hsl(var(--hero-gradient-from)), hsl(var(--hero-gradient-to)))",
      },
      boxShadow: {
        sm: "0 2px 4px 0 #10101352",
        md: "0 6px 24px -4px #18181b62",
        lg: "0 14px 36px -8px #10101382",
        elevated: "0 2px 12px 0 #1010136e",
      },
      transitionProperty: {
        base: "background, color, border, box-shadow, opacity, transform",
      },
      borderRadius: {
        lg: "16px",
        md: "10px",
        sm: "6px",
        input: "6px",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      spacing: {
        'section-y': '3rem',
        'card-y': '2.25rem'
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
