# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2025-01-01

### Added

- `@radish-ui/core` — initial release with `Admin`, `ListBase`, and `cn()` utility for Tailwind class merging.
- `@radish-ui/cli` — initial release with `add`, `sync`, and `diff` commands for managing registry components.
- Registry components: `layout`, `datagrid`, `list`, `pagination`, `show`, `edit`, `create`, `text-field`, `boolean-field`, `number-field`, `date-field`, `edit-button`, `delete-button`, `create-button`, `simple-form`.
- Storybook integration for developing registry components in isolation.
- Demo app (`apps/demo`) showing a working admin panel with zero Material UI.
- `radish.json` configuration file support for CLI.
- `radish.lock.json` lock file to track which registry version each component file came from.
- Remote registry support (http/https) in the CLI.

[Unreleased]: https://github.com/saebyn/radish-ui/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/saebyn/radish-ui/releases/tag/v0.1.0
