import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import { hashContent } from "../lib/hash.js";
import { loadRegistry, validateRelativePath } from "../lib/registry.js";
import { loadLockfile } from "../lib/lockfile.js";
import { resolveConfig } from "../lib/config.js";

export interface DiffOptions {
  registry?: string;
}

export async function diffCommand(
  componentName: string,
  options: DiffOptions
): Promise<void> {
  const cwd = process.cwd();
  const config = resolveConfig(cwd, {
    registry: options.registry,
  });

  if (!config.registry) {
    console.error(
      "Error: No registry path specified. Use --registry <path> or set registry in radish.json"
    );
    process.exit(1);
  }

  const lockfile = loadLockfile(cwd);
  const componentLock = lockfile.components[componentName];
  if (!componentLock) {
    console.error(
      `Error: Component "${componentName}" not found in radish.lock.json. Run \`radish add ${componentName}\` first.`
    );
    process.exit(1);
  }

  const registry = loadRegistry(config.registry);
  const registryComponent = registry.components.find((c) => c.name === componentName);
  if (!registryComponent) {
    console.error(`Error: Component "${componentName}" not found in registry.`);
    process.exit(1);
  }

  for (const [relPath, fileLock] of Object.entries(componentLock.files)) {
    try {
      validateRelativePath(relPath);
    } catch (err) {
      console.warn(`⚠ Skipping unsafe path in lockfile: ${relPath} — ${err instanceof Error ? err.message : String(err)}`);
      continue;
    }

    const registryFilePath = `src/${relPath}`;
    const registryPath = resolve(config.registry, registryFilePath);

    if (!existsSync(registryPath)) {
      console.warn(`⚠ Registry file not found: ${registryPath}`);
      continue;
    }

    const registryContent = readFileSync(registryPath, "utf-8");
    const newRegistryHash = hashContent(registryContent);

    if (newRegistryHash === fileLock.registryHash) {
      console.log(`No upstream changes for ${relPath}`);
      continue;
    }

    console.log(`Upstream changes for ${relPath}:`);
    console.log(`  Old hash: ${fileLock.registryHash}`);
    console.log(`  New hash: ${newRegistryHash}`);
    console.log();

    // Show the new registry file content (we only store hashes, not old content)
    console.log(`--- ${relPath} (current registry version)`);
    for (const line of registryContent.split("\n")) {
      console.log(`+ ${line}`);
    }
    console.log();
  }
}
