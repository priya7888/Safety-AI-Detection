/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        dark: {
          950: "#040508",
          900: "#080a12",
          850: "#0d101c",
          800: "#131728",
          750: "#191e34",
          700: "#212845",
          600: "#323c64",
          500: "#48568a",
        },
        light: {
          50: "#ffffff",
          100: "#f8fafc",
          200: "#f1f5f9",
          300: "#e2e8f0",
          400: "#cbd5e1",
          500: "#94a3b8",
          600: "#64748b",
          700: "#475569",
          800: "#1e293b",
          900: "#0f172a",
        },
        cyber: {
          rose: "#ff2d55",
          crimson: "#e11d48",
          pink: "#f43f5e",
          fuchsia: "#d946ef",
          amber: "#f59e0b",
          emerald: "#10b981",
          cyan: "#06b6d4",
          violet: "#8b5cf6",
          blue: "#3b82f6",
        },
        canvas: "#040508",
        hazard: {
          DEFAULT: "#f43f5e",
          bg: "rgba(244, 63, 94, 0.12)",
          dark: "#fb7185",
        },
        safe: {
          DEFAULT: "#10b981",
          bg: "rgba(16, 185, 129, 0.12)",
          dark: "#34d399",
        },
        amber: {
          DEFAULT: "#f59e0b",
          bg: "rgba(245, 158, 11, 0.12)",
        },
      },
      fontFamily: {
        display: ["Space Grotesk", "Plus Jakarta Sans", "sans-serif"],
        body: ["Plus Jakarta Sans", "Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      animation: {
        "radar-sweep": "radar-sweep 7s linear infinite",
        "radar-sweep-fast": "radar-sweep 3.5s linear infinite",
        "radar-pulse": "radar-pulse 3s ease-in-out infinite",
        "glow-pulse": "glow-pulse 2.5s ease-in-out infinite",
        "ping-slow": "ping 3s cubic-bezier(0, 0, 0.2, 1) infinite",
        "float": "float 4s ease-in-out infinite",
        "shimmer": "shimmer 2.5s linear infinite",
      },
      keyframes: {
        "radar-sweep": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "radar-pulse": {
          "0%, 100%": { opacity: "0.2", transform: "scale(0.97)" },
          "50%": { opacity: "0.55", transform: "scale(1.03)" },
        },
        "glow-pulse": {
          "0%, 100%": { opacity: "0.35" },
          "50%": { opacity: "0.85" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      borderRadius: {
        sm: "8px",
        DEFAULT: "12px",
        md: "14px",
        lg: "18px",
        xl: "22px",
        "2xl": "28px",
      },
      boxShadow: {
        "cyber-glow": "0 0 40px -8px rgba(244, 63, 94, 0.45)",
        "cyber-glow-sm": "0 0 20px -3px rgba(244, 63, 94, 0.35)",
        "safe-glow": "0 0 30px -5px rgba(16, 185, 129, 0.35)",
        "cyan-glow": "0 0 30px -5px rgba(6, 182, 212, 0.35)",
        "amber-glow": "0 0 30px -5px rgba(245, 158, 11, 0.35)",
        "glass": "0 10px 40px 0 rgba(0, 0, 0, 0.5)",
        "light-card": "0 10px 30px -5px rgba(0, 0, 0, 0.06), 0 0 1px 1px rgba(0, 0, 0, 0.04)",
        "light-hover": "0 20px 40px -10px rgba(244, 63, 94, 0.15), 0 0 1px 1px rgba(244, 63, 94, 0.2)",
      },
    },
  },
  plugins: [],
};
