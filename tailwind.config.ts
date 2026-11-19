import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg:        "#080f1b",
        "bg-2":    "#0d1626",
        card:      "#101b2e",
        "card-2":  "#172641",
        line:      "rgba(255,255,255,0.07)",
        "line-2":  "rgba(255,255,255,0.12)",
        primary:   "#2b6fd0",
        "primary-h":"#2563c1",
        "primary-dim":"rgba(43,111,208,0.15)",
        white:     "#ffffff",
        "white-2": "#e2e8f0",
        "white-3": "#94a3b8",
        "white-4": "#8495af",
        up:        "#22c55e",
        down:      "#ef4444",
        warn:      "#f59e0b",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      fontSize: {
        "2xs": ["10px", "14px"],
      },
      borderRadius: {
        DEFAULT: "8px",
        sm: "4px",
        md: "10px",
        lg: "12px",
        xl: "16px",
        full: "9999px",
      },
      animation: {
        "fade-in": "fadeIn 0.2s ease",
        "slide-up": "slideUp 0.25s ease",
      },
      keyframes: {
        fadeIn: { from: { opacity: "0" }, to: { opacity: "1" } },
        slideUp: { from: { opacity: "0", transform: "translateY(8px)" }, to: { opacity: "1", transform: "translateY(0)" } },
      },
    },
  },
  plugins: [],
};

export default config;
