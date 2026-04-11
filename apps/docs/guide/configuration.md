# Configuration

Instead of passing flags every time you run a CLI command, you can create a
`radish.json` file in your project root.

## radish.json

```json
{
  "registry": "https://radish-ui.saebyn.dev/registry",
  "outputDir": "src/components/radish"
}
```

### Fields

| Field       | Type     | Default                                  | Description                                                                              |
| ----------- | -------- | ---------------------------------------- | ---------------------------------------------------------------------------------------- |
| `registry`  | `string` | `https://radish-ui.saebyn.dev/registry`  | Path or URL to the component registry. Accepts a local path or an `http(s)://` URL.      |
| `outputDir` | `string` | `src/components/radish`                       | Directory where components are copied. Must be a relative path within your project root. |

CLI flags take precedence over values in `radish.json`.

## Examples

### Use a local registry (development / monorepo)

```json
{
  "registry": "../../packages/registry",
  "outputDir": "src/ui"
}
```

### Custom output directory

```json
{
  "outputDir": "src/components/ui"
}
```

## Lock file

When you add or sync components, the CLI creates a `radish.lock.json` file
alongside `radish.json`. This file records the exact registry version of each
installed file so `sync` knows which files you have modified locally.

```json
{
  "layout/layout.tsx": {
    "registryVersion": "abc123",
    "installedVersion": "abc123"
  }
}
```

Do **not** edit this file manually. It is managed by the CLI.
