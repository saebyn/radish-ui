# @radish-ui/core

[![npm](https://img.shields.io/npm/v/%40radish-ui%2Fcore?label=%40radish-ui%2Fcore)](https://www.npmjs.com/package/@radish-ui/core)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../../LICENSE)

Headless [react-admin](https://marmelab.com/react-admin/) wrappers and Tailwind CSS utilities for [radish-ui](https://github.com/saebyn/radish-ui).

> [!WARNING]
> **Early development — not production-ready.**
> The API may change rapidly without notice and is not yet stable.

## Installation

```bash
pnpm add @radish-ui/core ra-core react react-dom tailwindcss
# or
npm install @radish-ui/core ra-core react react-dom tailwindcss
```

## What's included

### `cn()` utility

A `clsx` + `tailwind-merge` helper for conditionally joining Tailwind class names without conflicts:

```ts
import { cn } from "@radish-ui/core";

<div className={cn("px-4 py-2", isActive && "bg-primary-500", className)} />
```

### Admin, ListBase, and ra-core wrappers

Thin wrappers around `ra-core` primitives so you can import everything from one package:

```ts
import { Admin, ListBase, EditBase, CreateBase, ShowBase } from "@radish-ui/core";
import { useFieldValue } from "@radish-ui/core";
```

### Tailwind CSS preset (`@radish-ui/core/preset`)

A Tailwind preset that registers semantic color tokens. Registry components use these tokens so you can retheme everything by overriding one value in your config.

| Token     | Default palette | Purpose                                 |
| --------- | --------------- | --------------------------------------- |
| `primary` | indigo          | Brand / interactive color               |
| `neutral` | gray            | Borders, dividers, muted text           |
| `danger`  | red             | Destructive actions and error states    |
| `success` | green           | Positive states and confirmations       |
| `info`    | blue            | Informational states                    |
| `warning` | yellow          | Warning states                          |
| `canvas`  | gray + white    | Surface backgrounds (page, card, input) |

```ts
// tailwind.config.ts
import radishPreset from "@radish-ui/core/preset";
import colors from "tailwindcss/colors";

export default {
  presets: [radishPreset],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  // Override the primary brand color for your project:
  theme: { extend: { colors: { primary: colors.violet } } },
};
```

## Learn more

- [radish-ui on GitHub](https://github.com/saebyn/radish-ui)
- [Documentation](https://saebyn.github.io/radish-ui/)
- [react-admin / ra-core](https://marmelab.com/react-admin/)
