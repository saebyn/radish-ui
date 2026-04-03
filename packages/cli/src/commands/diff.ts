import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { hashContent } from "../lib/hash.js";
import { loadRegistry, validateRelativePath, relativeToRegistryFile } from "../lib/registry.js";
import { loadLockfile } from "../lib/lockfile.js";
import { resolveConfig } from "../lib/config.js";
import { RadishError } from "../lib/errors.js";

export interface DiffOptions {
  registry?: string;
}

export async function diffCommand(componentName: string, options: DiffOptions): Promise<void> {
  const cwd = process.cwd();
  const config = resolveConfig(cwd, {
    registry: options.registry,
  });

  if (!config.registry) {
    throw new RadishError(
      "No registry path specified. Use --registry <path> or set registry in radish.json",
    );
  }

  const lockfile = loadLockfile(cwd);
  const componentLock = lockfile.components[componentName];
  if (!componentLock) {
    throw new RadishError(
      `Component "${componentName}" not found in radish.lock.json. Run \`radish add ${componentName}\` first.`,
    );
  }

  const registry = loadRegistry(config.registry);
  if (!registry.components.some((c) => c.name === componentName)) {
    throw new RadishError(`Component "${componentName}" not found in registry.`);
  }

  for (const [relPath, fileLock] of Object.entries(componentLock.files)) {
    try {
      validateRelativePath(relPath);
    } catch (err) {
      console.warn(
        `⚠ Skipping unsafe path in lockfile: ${relPath} — ${err instanceof Error ? err.message : String(err)}`,
      );
      continue;
    }

    const registryPath = resolve(config.registry, relativeToRegistryFile(relPath));

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
