import { loadRegistryAsync } from "../lib/registry.js";
import { loadLockfile } from "../lib/lockfile.js";
import { resolveConfig } from "../lib/config.js";

export interface ListOptions {
  registry?: string;
  target?: string;
  /** Override the working directory (used in tests; defaults to process.cwd()). */
  cwd?: string;
}

export async function listCommand(options: ListOptions): Promise<void> {
  const cwd = options.cwd ?? process.cwd();
  const config = resolveConfig(cwd, {
    registry: options.registry,
    outputDir: options.target,
  });

  const registry = await loadRegistryAsync(config.registry);
  const lockfile = loadLockfile(cwd);

  const components = registry.components;

  if (components.length === 0) {
    console.log("No components found in registry.");
    return;
  }

  const installedNames = new Set(Object.keys(lockfile.components));

  const installedCount = components.filter((c) => installedNames.has(c.name)).length;

  console.log(
    `Available components (${components.length} available, ${installedCount} installed):\n`,
  );

  const nameWidth = Math.max(...components.map((c) => c.name.length), "Component".length, 1);

  console.log(`  ${"Component".padEnd(nameWidth)}  Status`);
  console.log(`  ${"─".repeat(nameWidth)}  ─────────`);

  for (const component of components) {
    const installed = installedNames.has(component.name);
    const marker = installed ? "✓" : "-";
    const status = installed ? "installed" : "available";
    console.log(`  ${marker} ${component.name.padEnd(nameWidth - 2)}  ${status}`);
  }

  console.log("");
}
