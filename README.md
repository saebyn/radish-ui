# radish-ui

Tailwind CSS components for react-admin. Like shadcn/ui, but for react-admin — use `ra-core` for the headless state management and own your UI components.

## What is this?

`radish-ui` provides:

- **`@radish-ui/core`** — A small npm package that wraps `ra-core` primitives (Admin, ListBase, hooks) and provides a `cn()` utility for Tailwind class merging.
- **Registry components** — Copy/paste Tailwind-styled components (Layout, Datagrid, ListView, TextField, etc.) that you own and can customize freely.

## Philosophy

This project takes the same approach as [shadcn/ui](https://ui.shadcn.com/): instead of installing a component library and fighting its styles, you copy the components directly into your project and make them your own.

The difference from plain react-admin: **zero Material UI**. All styling is Tailwind CSS. The headless state management comes from `ra-core`.

## Getting Started

```bash
# Install the core package
pnpm add @radish-ui/core ra-core react react-dom

# Copy components from the registry into your project
# (see packages/registry/src for source components)
```

## Demo

```bash
pnpm install
pnpm build
pnpm dev
```

This runs `apps/demo` — a working admin panel listing posts from [JSONPlaceholder](https://jsonplaceholder.typicode.com), styled with Tailwind CSS, with zero Material UI.

## Structure

```
radish-ui/
├── packages/
│   ├── core/       # @radish-ui/core — published to npm
│   └── registry/   # Copy/paste components — NOT published
└── apps/
    └── demo/       # Working demo app
```

## License

MIT
