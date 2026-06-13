import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      colors: {
        ink: "#0d0b09",
        surface: "#15110d",
        "surface-2": "#1d1813",
        paper: "#f3ecde",
        muted: "#9a9082",
        ember: "#d8a24a",
        danger: "#d4604a",
      },
      borderColor: {
        line: "rgba(214, 198, 170, 0.12)",
        "line-strong": "rgba(214, 198, 170, 0.24)",
      },
      keyframes: {
        rise: {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fade: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        rise: "rise 0.6s cubic-bezier(0.2, 0.7, 0.2, 1) both",
        fade: "fade 0.8s ease both",
      },
    },
  },
  plugins: [],
};

export default config;
