# Contributing to radish-ui

Thank you for your interest in contributing! This guide explains how to set up
the project locally, run the development tools, and submit changes.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Setting Up the Repository](#setting-up-the-repository)
- [Project Structure](#project-structure)
- [Development Scripts](#development-scripts)
- [Code Style](#code-style)
- [Package Dependency Boundaries](#package-dependency-boundaries)
- [Commit Message Format](#commit-message-format)
- [Deployment](#deployment)

- [Pull Request Guidelines](#pull-request-guidelines)
- [Review Process](#review-process)
- [Automated Dependency Updates (Dependabot)](#automated-dependency-updates-dependabot)

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

### Validate registry

```bash
pnpm validate-registry  # Validate registry.json and radish.lock.json integrity
```

This script checks that all files referenced in `packages/registry/registry.json` exist on disk,
that component names are unique and well-formed, that dependency names are valid npm package names,
and that every component referenced in `apps/demo/radish.lock.json` is present in the registry.
The same check runs automatically in CI.

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

## Package Dependency Boundaries

To prevent accidental architecture drift, the monorepo enforces a strict
one-way dependency graph between its packages. The allowed dependency
directions are:

```
@radish-ui/core        ← no internal dependencies
@radish-ui/cli         ← may depend on @radish-ui/core
@radish-ui/registry    ← may depend on @radish-ui/core
apps/demo              ← may depend on @radish-ui/core
```

The following are **explicitly forbidden**:

| Package / app         | Must NOT import from                            |
| --------------------- | ----------------------------------------------- |
| `@radish-ui/core`     | `@radish-ui/cli`, `@radish-ui/registry`         |
| `@radish-ui/cli`      | `@radish-ui/registry`                           |
| `@radish-ui/registry` | `@radish-ui/cli`                                |
| `apps/demo`           | `@radish-ui/registry` (use `pnpm sync` instead) |

These rules prevent circular dependencies and keep the published packages
(`@radish-ui/core` and `@radish-ui/cli`) free of unexpected transitive
dependencies.

Run `pnpm lint` locally to verify the rules are satisfied — boundary violations
are reported as lint errors by the `no-restricted-imports` rule configured in
`.oxlintrc.json`. CI will fail if any rule is violated.

If you believe a rule should be changed, open a discussion issue before
modifying the `overrides` section of `.oxlintrc.json`.

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

## Deployment

The docs site (VitePress), the demo app, and Storybook are hosted on
[Cloudflare Pages](https://pages.cloudflare.com/) at two environments:

| Environment       | URL                         | Trigger                  |
| ----------------- | --------------------------- | ------------------------ |
| **Production**    | `radish-ui.saebyn.dev`      | GitHub Release published |
| **Canary (next)** | `next.radish-ui.saebyn.dev` | Push to `main`           |
| **Preview**       | Cloudflare-generated URL    | `workflow_dispatch`      |

The canary deployment shows a yellow banner at the top of every page to make it
clear that visitors are reading unreleased documentation.

### How it works

The `.github/workflows/deploy-docs.yml` workflow handles all three environments:

- **`release: published`** — builds with no banner and deploys to the
  `production` Cloudflare Pages branch, which is aliased to
  `radish-ui.saebyn.dev`.
- **`push: main`** — builds with `VITE_DOCS_ENV=next` (which enables the
  canary banner) and deploys to the `main` Cloudflare Pages branch, aliased to
  `next.radish-ui.saebyn.dev`.
- **`workflow_dispatch`** — also builds and deploys to the `main` branch,
  useful for triggering an out-of-band preview.

### Required GitHub Actions secrets

Configure these secrets in **Settings → Secrets and variables → Actions** of
the repository:

| Secret name             | Description                                               |
| ----------------------- | --------------------------------------------------------- |
| `CLOUDFLARE_API_TOKEN`  | API token with _Cloudflare Pages: Edit_ permission        |
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare account ID (visible in the dashboard URL) |

### Cloudflare Pages project setup (one-time)

1. Create a Cloudflare Pages project named **`radish-ui-docs`** (Direct Upload
   mode — no Git integration needed, since deploys are driven by GitHub
   Actions).
2. In the project settings, set the **production branch** to `production`.
3. Add the following custom domain aliases:
   - `radish-ui.saebyn.dev` → `production` branch
   - `next.radish-ui.saebyn.dev` → `main` branch preview alias
4. Configure the DNS records in Cloudflare DNS for both custom domains.

### Local docs preview

```bash
pnpm --filter @radish-ui/docs dev       # VitePress dev server
pnpm --filter @radish-ui/demo dev       # Demo app dev server

# Build and preview the full site locally (mirrors CI output)
pnpm --filter @radish-ui/docs build
pnpm --filter @radish-ui/docs preview
```

## Automated Dependency Updates (Dependabot)

This repository uses [GitHub Dependabot](https://docs.github.com/en/code-security/dependabot) to automatically open pull requests for dependency updates.

### Configuration

Dependabot is configured in [`.github/dependabot.yml`](.github/dependabot.yml).
It monitors the following ecosystems on a **weekly** schedule:

| Ecosystem        | Directories monitored                                                                    |
| ---------------- | ---------------------------------------------------------------------------------------- |
| `npm` (pnpm)     | `/`, `/packages/cli`, `/packages/core`, `/packages/registry`, `/apps/demo`, `/apps/docs` |
| `github-actions` | `/`                                                                                      |

Updates within each directory are **grouped into a single PR** to reduce noise.

### Reviewing Dependabot PRs

1. Check that the CI pipeline passes (formatting, lint, build, tests, Storybook).
2. Review the changelog or release notes linked in the PR description.
3. For major version bumps, check for breaking changes and update consuming code
   as needed before merging.
4. Merge using **squash-merge** to keep the history linear, consistent with the
   rest of the project's merge strategy.
