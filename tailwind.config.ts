import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pasko: {
          red: "#8B1E1E",
          "red-soft": "#A83232",
          forest: "#1F3D2B",
          "forest-soft": "#2E5640",
          gold: "#D4A12A",
          "gold-soft": "#E8C468",
          cream: "#F5EDD8",
          paper: "#FAF3E0",
          glow: "#FFC857",
          ink: "#2A1F14",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        parol: "0 0 24px rgba(255,200,87,0.55), 0 0 48px rgba(255,200,87,0.25)",
        "parol-soft": "0 0 12px rgba(255,200,87,0.35)",
        card: "0 2px 8px rgba(42,31,20,0.06), 0 8px 24px rgba(42,31,20,0.08)",
      },
      backgroundImage: {
        "paper-grain":
          "radial-gradient(circle at 20% 10%, rgba(212,161,42,0.06) 0%, transparent 40%), radial-gradient(circle at 80% 80%, rgba(139,30,30,0.05) 0%, transparent 40%)",
      },
      animation: {
        "parol-idle": "parolIdle 3.5s ease-in-out infinite",
        "fade-in": "fadeIn 0.8s ease-out both",
        "fade-up": "fadeUp 0.8s ease-out both",
      },
      keyframes: {
        parolIdle: {
          "0%,100%": { opacity: "0.85", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.03)" },
        },
        fadeIn:  { from: { opacity: "0" }, to: { opacity: "1" } },
        fadeUp:  {
          from: { opacity: "0", transform: "translateY(12px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;