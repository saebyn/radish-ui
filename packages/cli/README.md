# @radish-ui/cli

CLI for managing [radish-ui](https://github.com/saebyn/radish-ui) registry components.

## Installation

```bash
npm install -g @radish-ui/cli
# or use directly with npx
npx @radish-ui/cli <command>
```

## Commands

### `radish init`

Initialize radish-ui in an existing project. Creates a `radish.json` configuration file and optionally sets up the components directory and a sample component.

```bash
npx @radish-ui/cli init [options]
```

**Options:**

| Option             | Description                                      |
| ------------------ | ------------------------------------------------ |
| `--registry <url>` | Registry URL or path to use in `radish.json`     |
| `-y, --yes`        | Accept all defaults and skip interactive prompts |

**What it does:**

1. Creates a `radish.json` in the project root with recommended defaults
2. Creates the default components directory (`src/components/radish/`)
3. Optionally creates a sample placeholder component
4. Prints instructions for installing recommended peer dependencies

**Example – interactive:**

```bash
npx @radish-ui/cli init
```

**Example – non-interactive (CI / scripts):**

```bash
npx @radish-ui/cli init --yes
```

---

### `radish new [directory]`

Scaffold a brand-new radish-ui powered react-admin project in a new directory.

```bash
npx @radish-ui/cli new [directory] [options]
```

**Options:**

| Option              | Description                                                |
| ------------------- | ---------------------------------------------------------- |
| `--registry <path>` | Path to a local registry directory to copy components from |
| `-y, --yes`         | Accept all defaults and skip interactive prompts           |

---

### `radish add <components...>`

Copy one or more components from the registry into your project.

```bash
npx @radish-ui/cli add <component> [component...] [options]
```

**Options:**

| Option              | Description                                         |
| ------------------- | --------------------------------------------------- |
| `--registry <path>` | Path or URL to the registry                         |
| `--target <path>`   | Output directory (default: `src/components/radish`) |
| `--force`           | Overwrite existing files                            |

---

### `radish remove <components...>`

Remove one or more installed components from your project. Files are deleted from disk and the component entries are removed from `radish.lock.json`.

```bash
npx @radish-ui/cli remove <component> [component...] [options]
```

**Options:**

| Option            | Description                                         |
| ----------------- | --------------------------------------------------- |
| `--target <path>` | Output directory (default: `src/components/radish`) |
| `--force`         | Remove files even if they have local modifications  |

**Behaviour:**

- Files that are **shared** with another installed component are skipped and not deleted (the other component still depends on them).
- Files that have **local modifications** are skipped unless `--force` is passed — you will see a warning for each skipped file.
- The component entry is always removed from `radish.lock.json` regardless of whether individual files were skipped.

**Example:**

```bash
# Remove a single component
npx @radish-ui/cli remove skeleton

# Remove multiple components at once
npx @radish-ui/cli remove skeleton datagrid

# Remove even if files have been locally modified
npx @radish-ui/cli remove skeleton --force
```

---

### `radish sync`

Update previously-added components to the latest registry versions.

```bash
npx @radish-ui/cli sync [options]
```

**Options:**

| Option              | Description                                         |
| ------------------- | --------------------------------------------------- |
| `--registry <path>` | Path or URL to the registry                         |
| `--target <path>`   | Output directory (default: `src/components/radish`) |
| `--force`           | Overwrite all files, ignoring local modifications   |

---

### `radish diff <component>`

Show what changed upstream since you last synced a component.

```bash
npx @radish-ui/cli diff <component> [options]
```

**Options:**

| Option              | Description                                         |
| ------------------- | --------------------------------------------------- |
| `--registry <path>` | Path or URL to the registry                         |
| `--target <path>`   | Output directory (default: `src/components/radish`) |

---

## Configuration (`radish.json`)

The `radish.json` file at the project root configures the CLI. It is created by `radish init` or `radish new`.

```json
{
  "registry": "https://saebyn.github.io/radish-ui/registry",
  "outputDir": "src/components/radish"
}
```

| Field       | Description                            | Default                                       |
| ----------- | -------------------------------------- | --------------------------------------------- |
| `registry`  | Registry URL or local path             | `https://saebyn.github.io/radish-ui/registry` |
| `outputDir` | Directory where components are written | `src/components/radish`                       |

## Learn more

- [radish-ui on GitHub](https://github.com/saebyn/radish-ui)
- [react-admin / ra-core](https://marmelab.com/react-admin/)
