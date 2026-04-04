import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ command, isPreview }) => ({
  base: isPreview || command === "build" ? "/radish-ui/demo/" : "/",
  plugins: [react()],
}));
