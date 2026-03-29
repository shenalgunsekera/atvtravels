import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#0B1F3A",
          light: "#143254",
          mid: "#1e4a72",
          dark: "#06121f",
        },
        gold: {
          DEFAULT: "#C9A84C",
          light: "#e8c76b",
          dark: "#a88630",
        },
        teal: {
          DEFAULT: "#3ECFBC",
          light: "#6ee3d6",
        },
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-up": "fadeUp 0.75s ease forwards",
        "nav-down": "navDown 0.5s ease forwards",
        "hero-zoom": "heroZoom 8s ease-out forwards",
        "wa-pulse": "waPulse 2.5s ease infinite",
        "bounce-slow": "bounceSlow 2.5s ease-in-out infinite",
      },
      keyframes: {
        fadeUp: {
          from: { opacity: "0", transform: "translateY(36px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        navDown: {
          from: { transform: "translateY(-100%)" },
          to:   { transform: "translateY(0)" },
        },
        heroZoom: {
          from: { scale: "1.05" },
          to:   { scale: "1" },
        },
        waPulse: {
          "0%,60%": { boxShadow: "0 6px 24px rgba(201, 168, 76, 0.45)" },
          "30%": { boxShadow: "0 6px 24px rgba(201, 168, 76, 0.45), 0 0 0 10px rgba(201, 168, 76, 0.12)" },
        },
        bounceSlow: {
          "0%,100%": { transform: "translateX(-50%) translateY(0)" },
          "50%":     { transform: "translateX(-50%) translateY(7px)" },
        },
      },
      backgroundImage: {
        "gold-gradient": "linear-gradient(135deg, #C9A84C, #e8c76b)",
        "navy-gradient": "linear-gradient(135deg, #0B1F3A, #1e4a72)",
      },
    },
  },
  plugins: [],
} satisfies Config;
