# radish-ui

Tailwind CSS components for react-admin. Like shadcn/ui, but for react-admin — use `ra-core` for the headless state management and own your UI components.

## What is this?

`radish-ui` provides:

- **`@radish-ui/core`** — A small npm package that wraps `ra-core` primitives (Admin, ListBase, hooks) and provides a `cn()` utility for Tailwind class merging.
- **`@radish-ui/cli`** — A CLI tool for copying registry components into your project and keeping them in sync with upstream changes.
- **Registry components** — Copy/paste Tailwind-styled components (Layout, Datagrid, ListView, TextField, etc.) that you own and can customize freely.

## Philosophy

This project takes the same approach as [shadcn/ui](https://ui.shadcn.com/): instead of installing a component library and fighting its styles, you copy the components directly into your project and make them your own.

The difference from plain react-admin: **zero Material UI**. All styling is Tailwind CSS. The headless state management comes from `ra-core`.

## Getting Started

### 1. Install the core package

```bash
pnpm add @radish-ui/core ra-core react react-dom
```

### 2. Add components with the CLI

```bash
# Add a single component (point --registry at a local checkout of packages/registry)
npx @radish-ui/cli add datagrid --registry ./path/to/registry

# Add multiple components at once
npx @radish-ui/cli add layout datagrid list-view text-field --registry ./path/to/registry
```

Components are copied into `./src/components/radish/` by default (configurable via `--target` or `radish.json`).

A `radish.lock.json` file is created to track which registry version each file came from.

### 3. Keep components up to date

```bash
# Update unmodified components to the latest registry versions
# (files you've customized are left untouched)
npx @radish-ui/cli sync

# Force-overwrite all components regardless of local changes
npx @radish-ui/cli sync --force
```

### 4. See upstream changes before syncing

```bash
npx @radish-ui/cli diff datagrid
```

## CLI reference

```
radish add <components...> [options]
  --registry <path>    Path to registry directory
  --target <path>      Output directory (default: ./src/components/radish)
  --force              Overwrite existing files

radish sync [options]
  --registry <path>    Path to registry directory
  --target <path>      Output directory (default: ./src/components/radish)
  --force              Overwrite all files, ignoring local modifications

radish diff <component> [options]
  --registry <path>    Path to registry directory
  --target <path>      Output directory (default: ./src/components/radish)
```

## Configuration file

Instead of passing flags every time, create a `radish.json` in your project root:

```json
{
  "registry": "./path/to/registry",
  "outputDir": "src/components/radish"
}
```

CLI flags take precedence over the config file.

## Available components

| Name | Files |
|------|-------|
| `layout` | `layout/layout.tsx`, `layout/sidebar.tsx`, `layout/menu.tsx` |
| `datagrid` | `list/datagrid.tsx` |
| `list-view` | `list/list-view.tsx` |
| `text-field` | `field/text-field.tsx` |

## Demo

```bash
pnpm install
pnpm build
pnpm dev
```

This runs `apps/demo` — a working admin panel listing posts from [JSONPlaceholder](https://jsonplaceholder.typicode.com), styled with Tailwind CSS, with zero Material UI.

To sync the demo app's components with the registry:

```bash
pnpm sync
```

## Structure

```
radish-ui/
├── packages/
│   ├── core/       # @radish-ui/core — published to npm
│   ├── cli/        # @radish-ui/cli — published to npm
│   └── registry/   # Copy/paste components — NOT published
└── apps/
    └── demo/       # Working demo app
```

## License

MIT
