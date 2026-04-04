import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test-setup.ts"],
    globals: false,
    typecheck: {
      enabled: true,
      tsconfig: "./tsconfig.typecheck.json",
      include: ["src/prop-parity/**/*.test.ts"],
    },
  },
});
