import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ command, isPreview }) => ({
  base: isPreview || command === "build" ? "/demo/" : "/",
  plugins: [react()],
}));
