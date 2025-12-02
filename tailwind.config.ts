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
        sans: ["Inter", "sans-serif"],
        heading: ["Space Grotesk", "sans-serif"],
      },
      colors: {
        background: {
          DEFAULT: "#F8F7F4", // Warm light beige
          section: "#FFFFFF",
          elevated: "#FEFEFE",
        },
        card: {
          DEFAULT: "rgba(255, 255, 255, 0.85)", // Light glass effect
          foreground: "#1F2937"
        },
        primary: {
          DEFAULT: "#1F2937", // Dark gray for text
          muted: "#6B7280",
        },
        secondary: {
          DEFAULT: "#F3F4F6",
          foreground: "#1F2937",
        },
        accent: {
          DEFAULT: "#2D6F4A", // Forest green - earthy and professional
          hover: "#236039",
          foreground: "#FFFFFF",
        },
        border: "rgba(0, 0, 0, 0.08)", // Subtle dark border
        input: "rgba(0, 0, 0, 0.03)",
        muted: {
          DEFAULT: "#F3F4F6",
          foreground: "#6B7280"
        },
        success: { DEFAULT: "#2D6F4A", foreground: "#FFFFFF" },
        warning: { DEFAULT: "#F59E0B", foreground: "#FFFFFF" },
        danger: { DEFAULT: "#EF4444", foreground: "#450A0A" },
      },
      backgroundImage: {
        "hero-gradient": "radial-gradient(circle at top center, #1C1E24 0%, #0F1115 100%)",
        "glass": "linear-gradient(180deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)",
        "accent-gradient": "linear-gradient(135deg, #00E599 0%, #00B377 100%)",
      },
      boxShadow: {
        sm: "0 1px 2px 0 rgba(0, 0, 0, 0.3)",
        md: "0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.18)",
        lg: "0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.18)",
        xl: "0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.18)",
        glow: "0 0 20px rgba(0, 229, 153, 0.15)", // Mint glow
      },
      borderRadius: {
        lg: "12px",
        md: "8px",
        sm: "6px",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.4s ease-out forwards",
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
