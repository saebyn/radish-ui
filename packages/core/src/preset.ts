import type { Config } from "tailwindcss";
import colors from "tailwindcss/colors";

/**
 * Radish UI Tailwind CSS preset.
 *
 * Registers semantic design tokens that components use for colors.
 * Override any token in your own tailwind.config.ts to retheme all
 * radish-ui components without touching component code.
 *
 * Tokens provided:
 *   - `primary`  – brand / interactive color (default: indigo)
 *   - `neutral`  – backgrounds, borders, and muted text (default: gray)
 *   - `danger`   – destructive actions and error states (default: red)
 *   - `success`  – positive states and confirmations (default: green)
 *
 * @example
 * // tailwind.config.ts
 * import radishPreset from "@radish-ui/core/preset";
 * import colors from "tailwindcss/colors";
 *
 * export default {
 *   presets: [radishPreset],
 *   content: ["./index.html", "./src/**\/*.{ts,tsx}"],
 *   // Override the primary brand color:
 *   theme: { extend: { colors: { primary: colors.violet } } },
 * };
 */
const preset = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: colors.indigo,
        neutral: colors.gray,
        danger: colors.red,
        success: colors.green,
      },
    },
  },
} satisfies Partial<Config>;

export default preset;
