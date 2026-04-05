import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/preset.ts"],
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  external: ["ra-core", "react", "react-dom", "tailwindcss"],
});
