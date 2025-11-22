import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        slot: {
          dark: "#0f172a",
          light: "#1e293b",
          accent: "#facc15",
          success: "#22c55e",
          danger: "#ef4444"
        }
      },
      keyframes: {
        glow: {
          "0%, 100%": { boxShadow: "0 0 10px rgba(250, 204, 21, 0.3)" },
          "50%": { boxShadow: "0 0 30px rgba(250, 204, 21, 0.8)" }
        }
      },
      animation: {
        glow: "glow 2s ease-in-out infinite"
      }
    }
  },
  plugins: []
};

export default config;
