# demo

A radish-ui powered React Admin application.

## Getting started

```bash
pnpm install
pnpm dev
```

## Data Provider

This project uses [JSON Server](https://jsonplaceholder.typicode.com) as a demo data provider.

## Dark mode and theming

All radish-ui components ship with full `dark:` Tailwind variants. Dark mode is
driven by the `dark` class on the root `<html>` element, which is the Tailwind
[`darkMode: "class"`](https://tailwindcss.com/docs/dark-mode) strategy.

### Built-in toggle

The `layout` component includes a light/dark toggle button in the header that
stores the user's preference in `localStorage` under the key `radish-dark-mode`.
No extra wiring is needed — install the `layout` component and the toggle works
out of the box:

```bash
radish add layout
```

### Customising the toggle

Because every component is a local copy, you can adjust any style or behaviour
freely. To add your own toggle logic anywhere in the tree, set or remove the
`dark` class on the document root:

```ts
// Turn dark mode on
document.documentElement.classList.add("dark");

// Turn dark mode off
document.documentElement.classList.remove("dark");

// Toggle
document.documentElement.classList.toggle("dark");
```

### Tailwind config requirement

Your project's `tailwind.config.ts` (or `.js`) must include:

```ts
export default {
  darkMode: "class",
  // ...
};
```

New projects created with `radish new` include this automatically.

### Storybook

The Storybook for the component registry has a **Dark mode** toolbar button
(☀ / ☾) that applies the `dark` class to the preview iframe, letting you
visually inspect every component in both light and dark mode without leaving the
browser.


Add new radish-ui components with:

```bash
radish add <component-name>
```

Sync existing components to the latest version:

```bash
radish sync
```

See what changed upstream for a component:

```bash
radish diff <component-name>
```

## Project structure

- `src/App.tsx` — app entry point, wires up resources and providers
- `src/components/` — radish-ui components (managed by the `radish` CLI)
- `radish.json` — radish-ui configuration
- `radish.lock.json` — lockfile tracking component versions

## Learn more

- [radish-ui](https://github.com/saebyn/radish-ui)
- [react-admin / ra-core](https://marmelab.com/react-admin/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vite](https://vitejs.dev/)

## End-to-end tests

The demo app has a [Playwright](https://playwright.dev/) end-to-end test suite covering
core flows: posts list, show, edit, and create.

### Running tests locally

Install Playwright's browser binaries the first time (Chromium only):

```bash
pnpm --filter @radish-ui/demo exec playwright install chromium --with-deps
```

Run the tests (the Vite dev server is started automatically):

```bash
# from the repo root
pnpm test:e2e

# or from apps/demo directly
pnpm test:e2e
```

Launch the interactive Playwright UI for step-by-step debugging:

```bash
pnpm --filter @radish-ui/demo test:e2e:ui
```

### Running tests in CI

The workflow in `.github/workflows/e2e.yml` runs the full suite on every push to
`main` and on every pull request. A Playwright HTML report is uploaded as a
workflow artifact (`playwright-report`) and retained for 7 days.
