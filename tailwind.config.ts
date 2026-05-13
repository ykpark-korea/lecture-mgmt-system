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
          mint: "#8ddfd2",
          ink: "#172033"
        }
      },
      boxShadow: {
        soft: "0 18px 45px rgba(23, 32, 51, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
