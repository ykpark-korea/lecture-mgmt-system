import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    include: ["tests/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["tests/e2e/**"],
    passWithNoTests: true
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, ".")
    }
  }
});
