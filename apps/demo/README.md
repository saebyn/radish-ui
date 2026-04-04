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
