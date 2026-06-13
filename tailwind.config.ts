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
        bg:        "#09090f",
        "bg-2":    "#0d0e18",
        card:      "#111622",
        "card-2":  "#161c2e",
        line:      "rgba(255,255,255,0.07)",
        "line-2":  "rgba(255,255,255,0.12)",
        primary:   "#2775ca",
        "primary-h":"#1d5fa8",
        "primary-dim":"rgba(39,117,202,0.15)",
        white:     "#ffffff",
        "white-2": "#e2e8f0",
        "white-3": "#94a3b8",
        "white-4": "#4a5568",
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
