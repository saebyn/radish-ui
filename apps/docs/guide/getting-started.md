# Getting Started

`radish-ui` provides Tailwind CSS components for react-admin. Like
[shadcn/ui](https://ui.shadcn.com/), you copy the components into your project
and own them — no fighting library styles or peer-dependency conflicts.

## Prerequisites

- Node.js 20+
- A react-admin project (or a new one you're starting)
- [Tailwind CSS](https://tailwindcss.com/docs/installation) configured in your project

## 1. Install the core package

```bash
pnpm add @radish-ui/core ra-core react react-dom
```

Or with npm / yarn:

```bash
npm install @radish-ui/core ra-core react react-dom
yarn add @radish-ui/core ra-core react react-dom
```

## 2. Add components with the CLI

Use `npx` to run the CLI without installing it globally:

```bash
# Add a single component
npx @radish-ui/cli add datagrid

# Add multiple components at once
npx @radish-ui/cli add layout datagrid list text-field
```

Components are copied into `./src/components/radish/` by default (configurable
via `--target` or a `radish.json` file).

A `radish.lock.json` file is created to track which registry version each file
came from.

## 3. Wire up your Admin

```tsx
import { Admin } from "@radish-ui/core";
import { dataProvider } from "./dataProvider";

export default function App() {
  return <Admin dataProvider={dataProvider}>{/* your resources */}</Admin>;
}
```

## 4. Keep components up to date

```bash
# Update unmodified components to the latest registry versions
# (files you've customized are left untouched)
npx @radish-ui/cli sync

# Force-overwrite all components regardless of local changes
npx @radish-ui/cli sync --force
```

## 5. See upstream changes before syncing

```bash
npx @radish-ui/cli diff datagrid
```

## Next steps

- Browse [Available Components](/guide/components) to see what's in the registry
- Read the [CLI Reference](/guide/cli) for all available commands and options
- Set up a [Configuration file](/guide/configuration) to avoid repeating flags
