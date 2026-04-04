# Release Process

This document explains how to cut a new release for `@radish-ui/core` and `@radish-ui/cli`.

## Overview

Both packages are published to npm under the `@radish-ui` scope. Releases are
performed manually by a maintainer following the steps below.

## Prerequisites

- You must be logged in to npm with an account that has publish access to the
  `@radish-ui` scope (`npm login`).
- All CI checks on `main` must be passing.
- You must have `pnpm` installed.

## Steps

### 1. Update the changelog

Open `CHANGELOG.md` and move all items from the `[Unreleased]` section into a
new release section with today's date and the new version number, following the
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) format:

```md
## [x.y.z] - YYYY-MM-DD
```

Update the link references at the bottom of `CHANGELOG.md`:

```md
[Unreleased]: https://github.com/saebyn/radish-ui/compare/vx.y.z...HEAD
[x.y.z]: https://github.com/saebyn/radish-ui/compare/v<previous>...vx.y.z
```

> **Note:** For the very first release (no prior version exists), use a tag
> link instead of a compare URL:
>
> ```md
> [0.1.0]: https://github.com/saebyn/radish-ui/releases/tag/v0.1.0
> ```

### 2. Bump package versions

Update the `version` field in both package manifests to the new version number:

- `packages/core/package.json`
- `packages/cli/package.json`

### 3. Build and test

```bash
pnpm install
pnpm build
pnpm test
```

### 4. Commit and tag

```bash
git add CHANGELOG.md packages/core/package.json packages/cli/package.json
git commit -m "chore: release vx.y.z"
git tag vx.y.z
git push origin main
git push origin vx.y.z
```

### 5. Create a GitHub Release

On GitHub, go to **Releases → Draft a new release**, select the tag you just
pushed, set the title to `vx.y.z`, and paste the corresponding changelog section
as the release notes.

### 6. Publish to npm

```bash
pnpm --filter @radish-ui/core publish --access public
pnpm --filter @radish-ui/cli publish --access public
```

## Versioning Policy

This project follows [Semantic Versioning](https://semver.org/):

| Change type                           | Version bump |
| ------------------------------------- | ------------ |
| Breaking API or CLI changes           | **major**    |
| New backwards-compatible features     | **minor**    |
| Bug fixes, docs, internal refactoring | **patch**    |

While the project is in the **0.x** range, minor-version bumps may include
breaking changes. Breaking changes will always be called out explicitly in the
changelog.
