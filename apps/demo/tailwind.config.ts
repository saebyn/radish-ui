import type { Config } from "tailwindcss";
import radishPreset from "@radish-ui/core/preset";

export default {
  presets: [radishPreset],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config;
