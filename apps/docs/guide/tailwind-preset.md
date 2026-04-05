# Tailwind Preset

`@radish-ui/core` ships a Tailwind CSS **preset** that registers the semantic
design tokens used by all radish-ui components. Using the preset is the
recommended way to configure Tailwind for a project that uses radish-ui.

## Why a preset?

Every radish-ui component uses semantic color tokens (e.g. `primary-600`,
`neutral-200`, `danger-500`) instead of raw Tailwind palette names like
`indigo-600` or `red-500`. The preset maps those tokens to sensible defaults
so components work out of the box. Because the tokens are overridable in your
own config, you can retheme every component simply by changing one line —
without touching any component code.

## Usage

### 1. Add `@radish-ui/core` to your project

```bash
pnpm add @radish-ui/core
```

### 2. Reference the preset in `tailwind.config.ts`

```ts
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
```

The preset supplies `darkMode: "class"` and the semantic color tokens. Your
own `theme.extend` entries are merged on top, so you can override or add tokens
freely.

## Design tokens

### Color scale tokens

These tokens expose the full 11-shade scale (`50`–`950`) that Tailwind provides
for built-in palette colors, so all variants such as `bg-primary-100`,
`text-neutral-700`, or `border-danger-500` are available.

| Token     | Default palette | Typical usage                                      |
| --------- | --------------- | -------------------------------------------------- |
| `primary` | `indigo`        | Brand colour, interactive elements, links          |
| `neutral` | `gray`          | Borders, dividers, and muted text                  |
| `danger`  | `red`           | Destructive actions, error states                  |
| `success` | `green`         | Positive states, confirmations                     |
| `info`    | `blue`          | Informational states, info notifications and chips |
| `warning` | `yellow`        | Warning states, warning notifications and chips    |
| `canvas`  | `gray`          | Surface backgrounds: page, card, panel, and inputs |

The `canvas` scale also includes a `0` shade (`canvas-0`) mapped to pure white,
so the lightest surface (cards, inputs in light mode) can be expressed within
the same token family as darker surfaces (e.g. `dark:bg-canvas-800`).

## Overriding tokens

Pass replacement values inside `theme.extend.colors` in your own config.
Any key you define here overrides the preset's default for that token only.

```ts
import type { Config } from "tailwindcss";
import radishPreset from "@radish-ui/core/preset";
import colors from "tailwindcss/colors";

export default {
  presets: [radishPreset],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Swap the brand colour from indigo to violet:
        primary: colors.violet,
      },
    },
  },
} satisfies Config;
```

After this change every radish-ui component that uses a `primary-*` class
(buttons, focus rings, active states, …) will render with the violet palette
instead of indigo — no component code changes required.

## Opting out

The preset is completely optional. If you prefer to keep your Tailwind config
as-is, simply omit the `presets` key. You can copy radish-ui components into
your project as usual and rename the semantic token classes to the raw Tailwind
palette names you already use.
