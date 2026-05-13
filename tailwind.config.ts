import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        hanwha: {
          orange: "#f37321"
        },
        cool: {
          ice: "#f8fbff",
          mist: "#e8f1f8",
          blue: "#4f8fcf",
          sky: "#dff5ff",
          mint: "#8ddfd2",
          aqua: "#5fd4e8",
          navy: "#203a5f",
          ink: "#172033"
        }
      },
      boxShadow: {
        soft: "0 18px 45px rgba(23, 32, 51, 0.08)",
        glass: "0 24px 70px rgba(32, 58, 95, 0.13)",
        float: "0 18px 34px rgba(79, 143, 207, 0.17)"
      }
    }
  },
  plugins: []
};

export default config;
