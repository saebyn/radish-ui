# CLI Reference

The `@radish-ui/cli` package provides commands to add, sync, and inspect
registry components in your project.

## Installation

You don't need to install the CLI globally. Use `npx`:

```bash
npx @radish-ui/cli <command> [options]
```

Or install it globally:

```bash
npm install -g @radish-ui/cli
```

## Commands

### `radish init`

Initialize radish-ui in an existing project. Creates a `radish.json`
configuration file and optionally sets up the components directory.

```
radish init [options]
```

**Options:**

| Option             | Description                                      |
| ------------------ | ------------------------------------------------ |
| `--registry <url>` | Registry URL or path to use in `radish.json`     |
| `-y, --yes`        | Accept all defaults and skip interactive prompts |

**Examples:**

```bash
# Interactive setup
npx @radish-ui/cli init

# Non-interactive (CI / scripts)
npx @radish-ui/cli init --yes

# Use a custom registry
npx @radish-ui/cli init --registry https://my-org.github.io/my-registry
```

---

### `radish add`

Copy one or more components from the registry into your project.

```
radish add <components...> [options]
```

**Arguments:**

| Argument        | Description                        |
| --------------- | ---------------------------------- |
| `components...` | One or more component names to add |

**Options:**

| Option              | Description                                                         |
| ------------------- | ------------------------------------------------------------------- |
| `--registry <path>` | Path or URL to the registry. Defaults to the hosted registry.       |
| `--target <path>`   | Output directory for components. Default: `./src/components/radish` |
| `--force`           | Overwrite existing files without prompting                          |

**Examples:**

```bash
# Add a single component
npx @radish-ui/cli add datagrid

# Add multiple components
npx @radish-ui/cli add layout datagrid list text-field

# Add with a custom output directory
npx @radish-ui/cli add datagrid --target src/ui

# Add from a local registry (useful during development)
npx @radish-ui/cli add datagrid --registry ./packages/registry
```

---

### `radish sync`

Update components that have not been locally modified to the latest registry
versions. Locally-customized files are left untouched unless `--force` is used.

```
radish sync [options]
```

**Options:**

| Option              | Description                                                         |
| ------------------- | ------------------------------------------------------------------- |
| `--registry <path>` | Path or URL to the registry. Defaults to the hosted registry.       |
| `--target <path>`   | Output directory for components. Default: `./src/components/radish` |
| `--force`           | Overwrite all files, ignoring local modifications                   |

**Examples:**

```bash
# Sync all unmodified components
npx @radish-ui/cli sync

# Force-overwrite everything
npx @radish-ui/cli sync --force
```

---

### `radish diff`

Show a diff between a component in your project and the current registry version, or check drift status for all components listed in `radish.lock.json`.

```
radish diff [component] [options]
```

**Arguments:**

| Argument    | Description                                                                      |
| ----------- | -------------------------------------------------------------------------------- |
| `component` | Component to diff. If omitted, prints a drift status summary for each component. |

**Options:**

| Option              | Description                                                         |
| ------------------- | ------------------------------------------------------------------- |
| `--registry <path>` | Path or URL to the registry. Defaults to the hosted registry.       |
| `--target <path>`   | Output directory for components. Default: `./src/components/radish` |

**Examples:**

```bash
# Show diff for the datagrid component
npx @radish-ui/cli diff datagrid
```

```bash
# Show drift status for all components in radish.lock.json
npx @radish-ui/cli diff
```

---

### `radish new`

Scaffold a new react-admin project pre-configured with radish-ui.

```
radish new [options]
```

**Options:**

| Option          | Description  |
| --------------- | ------------ |
| `--name <name>` | Project name |

---

## Default registry

When no `--registry` flag is provided and there is no `registry` entry in
`radish.json`, the CLI fetches components from the hosted registry:

```
https://saebyn.github.io/radish-ui/registry
```

You can override this at any time with the `--registry` flag or via
[configuration](/guide/configuration).
