# demo

A radish-ui powered React Admin application.

## Getting started

```bash
pnpm install
pnpm dev
```

## Data Provider

This project uses [JSON Server](https://jsonplaceholder.typicode.com) as a demo data provider.

## Adding components

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
