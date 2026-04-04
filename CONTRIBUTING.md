# Contributing to radish-ui

Thank you for your interest in contributing! This guide explains how to set up
the project locally, run the development tools, and submit changes.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Setting Up the Repository](#setting-up-the-repository)
- [Project Structure](#project-structure)
- [Development Scripts](#development-scripts)
- [Code Style](#code-style)
- [Commit Message Format](#commit-message-format)
- [Pull Request Guidelines](#pull-request-guidelines)
- [Review Process](#review-process)

## Prerequisites

- **Node.js** — version specified in [`.node-version`](.node-version) (Node 24
  or the range declared in `package.json` `engines`). We recommend using a
  version manager such as [mise](https://mise.jdx.dev/), which reads
  `.node-version` automatically. If you use
  [nvm](https://github.com/nvm-sh/nvm), install and select the matching Node.js
  version manually with `nvm install` and `nvm use` unless you also add a
  matching `.nvmrc`.
- **pnpm** — version declared in `package.json` `packageManager` field. Install
  it with:
  ```bash
  corepack enable
  ```

## Setting Up the Repository

```bash
# 1. Fork the repo on GitHub, then clone your fork
git clone https://github.com/<your-username>/radish-ui.git
cd radish-ui

# 2. Install all dependencies (workspaces are resolved automatically)
pnpm install
```

## Project Structure

```
radish-ui/
├── packages/
│   ├── core/      # @radish-ui/core — published to npm
│   ├── cli/       # @radish-ui/cli  — published to npm
│   └── registry/  # Copy/paste components — NOT published
└── apps/
    └── demo/      # Working demo app (react-admin + Tailwind, zero MUI)
```

## Development Scripts

All scripts below are run from the **repository root** unless noted otherwise.

### Build

```bash
pnpm build          # Build @radish-ui/core and @radish-ui/cli
```

### Dev server

```bash
pnpm dev            # Start the demo app at http://localhost:5173 (or available port)
```

### Tests

```bash
pnpm test           # Run all tests across all packages (vitest)
```

To run tests for a single package:

```bash
pnpm --filter @radish-ui/cli test
```

### Linting

```bash
pnpm lint           # Run oxlint across the whole repo
```

### Formatting

```bash
pnpm format         # Auto-format with oxfmt
pnpm format:check   # Check formatting without writing files (used in CI)
```

### Storybook

Registry components can be developed and previewed in isolation:

```bash
cd packages/registry
pnpm storybook          # Start Storybook at http://localhost:6006
pnpm storybook:build    # Build a static Storybook site
```

### Sync demo components

```bash
pnpm sync           # Re-copy registry components into the demo app
```

## Code Style

- All TypeScript source is formatted with **oxfmt** — run `pnpm format` before
  committing.
- **oxlint** enforces linting rules; run `pnpm lint` and fix any reported issues
  before opening a PR.
- TypeScript is configured with `strict`, `noUnusedLocals`, and
  `noUnusedParameters` enabled — keep the compiler happy.
- Prefer named exports over default exports for components.
- Co-locate Storybook story files with their components inside
  `packages/registry/src/`.

## Commit Message Format

This project uses **Conventional Commits**:

```
<type>(<optional scope>): <short summary>

[optional body]

[optional footer(s)]
```

Common types:

| Type       | When to use                                        |
| ---------- | -------------------------------------------------- |
| `feat`     | A new feature                                      |
| `fix`      | A bug fix                                          |
| `docs`     | Documentation changes only                         |
| `style`    | Formatting, whitespace — no logic change           |
| `refactor` | Code change that is neither a fix nor a feature    |
| `test`     | Adding or correcting tests                         |
| `chore`    | Build scripts, dependency updates, release commits |

Examples:

```
feat(cli): add --dry-run flag to the sync command
fix(core): correct cn() type signature for undefined inputs
docs: add CONTRIBUTING guide
chore: release v0.2.0
```

Breaking changes must be noted with a `!` after the type/scope and a
`BREAKING CHANGE:` footer:

```
feat(cli)!: rename --output to --target flag

BREAKING CHANGE: The --output flag has been renamed to --target.
```

## Pull Request Guidelines

1. **One PR per concern.** Keep changes focused; split unrelated fixes into
   separate PRs.
2. **Target the `main` branch** for all contributions.
3. **Fill in the PR description** — explain _what_ changed and _why_. Link the
   relevant issue (e.g. `Closes #42`).
4. **Ensure CI passes** — the CI pipeline checks formatting, linting, build,
   tests, and the Storybook build. Fix any failures before requesting review.
5. **Add or update tests** when introducing new behaviour or fixing a bug.
6. **Update documentation** (README, JSDoc, Storybook stories) if your change
   affects the public API or developer-facing behaviour.
7. **Keep commits clean.** Squash fixup commits before marking the PR as ready
   for review; use `git rebase -i` if needed.

## Review Process

- A maintainer will review your PR, leave comments, and either approve it or
  request changes.
- Address review comments with new commits (or amended/rebased commits).
- Once approved and all CI checks are green, a maintainer will merge the PR
  using squash-merge to keep the commit history linear.
- Minor or trivial fixes (typos, docs) may be merged by any maintainer without
  a second review.
