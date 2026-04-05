# Release Process

This document explains how to cut a new release for `@radish-ui/core` and `@radish-ui/cli`.

## Table of contents

- [Overview](#overview)
- [Automated Publishing (CI — recommended)](#automated-publishing-ci--recommended)
  - [One-time setup: configure npm Trusted Publisher](#one-time-setup-configure-npm-trusted-publisher)
  - [Friendly reminder: you still need a "release prep" PR](#friendly-reminder-you-still-need-a-release-prep-pr)
  - [Verify the release](#verify-the-release)
- [Manual Publishing (fallback)](#manual-publishing-fallback)
  - [Prerequisites](#prerequisites)
  - [Steps (manual release)](#steps-manual-release)
- [Versioning Policy](#versioning-policy)

## Overview

Both packages are published to npm under the `@radish-ui` scope. Publishing happens automatically via GitHub Actions when a GitHub Release is published (recommended), or can be performed manually by a maintainer.

## Automated Publishing (CI — recommended)

Publishing is handled by the `.github/workflows/publish.yml` workflow, which triggers automatically whenever a GitHub Release is **published**. It builds both packages and publishes them to npm using [npm provenance attestations](https://docs.npmjs.com/generating-provenance-statements) via GitHub's OIDC token — no long-lived `NPM_TOKEN` secret is required.

### One-time setup: configure npm Trusted Publisher

Before the first automated publish, register the repository as a **Trusted Publisher** on npmjs.com so that GitHub Actions can publish without a stored token:

1. Log in to [npmjs.com](https://www.npmjs.com) and open the settings page for each package (`@radish-ui/core` and `@radish-ui/cli`).
2. Navigate to **Publishing access → Trusted publishers → Add a publisher**.
3. Fill in the fields:
   - **Repository owner**: `saebyn`
   - **Repository name**: `radish-ui`
   - **Workflow filename**: `publish.yml`
   - **Environment** (optional): leave blank
4. Save. Repeat for the other package.

Once this is set up, the publish workflow runs automatically on every GitHub Release and uses the GitHub OIDC token instead of a stored secret.

### Friendly reminder: you still need a "release prep" PR

CI takes care of _publishing_, but it doesn’t magically know what version you want to ship or what should go in the release notes. Before you publish a GitHub Release, open and merge a small "release prep" PR to get the repo into a releasable state.

**Release prep PR checklist:**

- [ ] Update `CHANGELOG.md`
  - Move everything in `[Unreleased]` into a new section like:

    ```md
    ## [x.y.z] - YYYY-MM-DD
    ```

  - Update the compare links at the bottom of the file.

- [ ] Bump versions in:
  - `packages/core/package.json`
  - `packages/cli/package.json`
- [ ] Make sure CI is green (and optionally run locally):

  ```bash
  pnpm install
  pnpm build
  pnpm test
  ```

**Suggested branch/PR naming (optional, but nice):**

- Branch: `release/vx.y.z`
- PR title: `chore: release vx.y.z`

Once that PR is merged to `main`, you’re ready to tag and publish a GitHub Release.

### Verify the release

After you click **Publish release**, wait for the `.github/workflows/publish.yml` workflow to finish, then double-check npm:

```bash
npm view @radish-ui/core version
npm view @radish-ui/cli version
```

## Manual Publishing (fallback)

Use this process only if the automated publish workflow cannot be used or if CI publishing fails and a maintainer needs to publish the packages directly to npm. This section describes a manual npm publish fallback.

### Prerequisites

- You must be logged in to npm with an account that has publish access to the `@radish-ui` scope (`npm login`).
- All CI checks on `main` must be passing.
- You must have `pnpm` installed.

### Steps (manual release)

#### 1. Update the changelog

Open `CHANGELOG.md` and move all items from the `[Unreleased]` section into a new release section with today's date and the new version number, following the [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) format.

Update the link references at the bottom of `CHANGELOG.md`:

```md
[Unreleased]: https://github.com/saebyn/radish-ui/compare/vx.y.z...HEAD
[x.y.z]: https://github.com/saebyn/radish-ui/compare/v<previous>...vx.y.z
```

> **Note:** For the very first release (no prior version exists), use a tag link instead of a compare URL:
>
> ```md
> [0.1.0]: https://github.com/saebyn/radish-ui/releases/tag/v0.1.0
> ```

#### 2. Bump package versions

Update the `version` field in both package manifests to the new version number:

- `packages/core/package.json`
- `packages/cli/package.json`

#### 3. Build and test

```bash
pnpm install
pnpm build
pnpm test
```

#### 4. Commit and tag

```bash
git add CHANGELOG.md packages/core/package.json packages/cli/package.json
git commit -m "chore: release vx.y.z"
git tag vx.y.z
git push origin main
git push origin vx.y.z
```

#### 5. Create a GitHub Release

On GitHub, go to **Releases → Draft a new release**, select the tag you just pushed, set the title to `vx.y.z`, and paste the corresponding changelog section as the release notes. Click **Publish release**.

Publishing the release triggers the `.github/workflows/publish.yml` CI workflow, which builds and publishes both packages to npm automatically. Wait for the workflow to complete before verifying the packages on npmjs.com.

#### 6. Publish to npm (manual fallback only)

If the automated workflow did not run or failed, publish manually:

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

While the project is in the **0.x** range, minor-version bumps may include breaking changes. Breaking changes will always be called out explicitly in the changelog.
