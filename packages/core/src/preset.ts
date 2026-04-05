import type { Config } from "tailwindcss";
import colors from "tailwindcss/colors";

/**
 * Radish UI Tailwind CSS preset.
 *
 * Registers semantic design tokens that components use for colors.
 * Override any token in your own tailwind.config.ts to retheme all
 * radish-ui components without touching component code.
 *
 * Color scale tokens (expose the full 50–950 shade range):
 *   - `primary`  – brand / interactive color (default: indigo)
 *   - `neutral`  – backgrounds, borders, and muted text (default: gray)
 *   - `danger`   – destructive actions and error states (default: red)
 *   - `success`  – positive states and confirmations (default: green)
 *   - `info`     – informational states, e.g. info notifications (default: blue)
 *   - `warning`  – warning states, e.g. warning notifications (default: yellow)
 *
 * Surface tokens (single background values, used as `bg-canvas`, `bg-paper`):
 *   - `canvas`   – app / page background (default: neutral-100 / neutral-900 dark)
 *   - `paper`    – card, panel, dialog, and input surface (default: white / neutral-800 dark)
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
        info: colors.blue,
        warning: colors.yellow,
        canvas: colors.gray[100],
        paper: colors.white,
      },
    },
  },
} satisfies Partial<Config>;

export default preset;
