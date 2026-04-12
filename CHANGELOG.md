# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- `radish generate <ComponentName>` command to scaffold a new registry component with a stub `.tsx` file, Storybook story, and Vitest test. Updates `registry.json` and `apps/docs/guide/components.md`, runs `pnpm validate-registry` automatically, and prints next-step hints. Supports `--folder <domain>`, `--dry-run`, and `--list-folders` options.

## [0.2.0] - 2026-04-11

### Added

- Registry components: `show-button`, `wizard-form`, `select-array-input`, `dashboard-menu-item`.
- Storybook introduction page and Storybook hosted on the static docs site.

### Changed

- `radish diff` now runs project-wide (across all installed components) when no component argument is provided.
- Improved CLI help text to clarify the optional `component` argument on `radish diff`.
- Tailwind CSS entrypoints updated from directives to `@import "tailwindcss"` syntax (Tailwind v4 style).

### Fixed

- Datagrid `rowClick` now accepts a string or function value without requiring a `resource` prop.
- CI workflow permissions hardened; third-party GitHub Actions pinned to immutable commit SHAs.

## [0.1.0] - 2026-04-05

### Added

- `@radish-ui/core` — initial release with `Admin`, `ListBase`, and `cn()` utility for Tailwind class merging.
- `@radish-ui/cli` — initial release with `add`, `sync`, and `diff` commands for managing registry components.
- `radish init` command to scaffold a new radish-ui react-admin project.
- `radish new` command to scaffold a new radish-ui react-admin project from a template.
- `radish list` command to show available and installed components.
- `radish remove` command for uninstalling registry components.
- Registry components: `layout`, `datagrid`, `list`, `pagination`, `show`, `edit`, `create`, `text-field`, `boolean-field`, `number-field`, `date-field`, `edit-button`, `delete-button`, `create-button`, `simple-form`.
- Additional registry components: `filter-button`, `search-input`, `reference`, `tabs`, `confirm-dialog`, `bulk-actions-toolbar`, `bulk-delete-button`, `export-button`.
- `ErrorBoundary` registry component for graceful error handling.
- `notification` registry component for mutation feedback toasts.
- Accessible skeleton loading states for core registry components.
- Tailwind preset (`@radish-ui/core/preset`) with semantic design tokens (surface, status, and full `canvas` color scale).
- Dark mode support across all registry components.
- i18n support: registry component strings are resolved through React Admin's i18n context; `radishMessages` exported from `@radish-ui/core` with default English strings under the `radish.*` namespace.
- WCAG/ARIA improvements across all registry components (semantic HTML, `aria-current`, `aria-expanded`, `NavLink` for menus).
- Storybook 10 integration for developing registry components in isolation.
- Demo app (`apps/demo`) showing a working admin panel with zero Material UI, hosted at `/radish-ui/demo/` on GitHub Pages.
- Static documentation site and hosted registry on GitHub Pages.
- `radish.json` configuration file support for CLI.
- `radish.lock.json` lock file to track which registry version each component file came from.
- Remote registry support (http/https) in the CLI; default registry URL points to the hosted GitHub Pages registry (`https://saebyn.github.io/radish-ui/registry`).
- CI check to validate `registry.json` and lockfile integrity.
- Prop parity tests for registry components against their react-admin MUI equivalents.
- Unit/integration tests for all registry components (97 tests across 11 files).
- Playwright end-to-end tests for the demo app.
- Automated dependency updates via Dependabot.
- pnpm catalog for shared dependency version management across the monorepo.

### Changed

- `radish sync` now also installs newly added component files (not only updates existing ones).

### Fixed

- Path traversal guard: output directory is validated to ensure it cannot escape the project root.

[Unreleased]: https://github.com/saebyn/radish-ui/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/saebyn/radish-ui/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/saebyn/radish-ui/releases/tag/v0.1.0
