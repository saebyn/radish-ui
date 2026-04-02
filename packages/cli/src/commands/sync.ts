import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve } from "path";
import { hashContent } from "../lib/hash.js";
import { loadRegistry } from "../lib/registry.js";
import { loadLockfile, saveLockfile, shouldUpdate } from "../lib/lockfile.js";
import { resolveConfig } from "../lib/config.js";

export interface SyncOptions {
  registry?: string;
  target?: string;
  force?: boolean;
}

export async function syncCommand(options: SyncOptions): Promise<void> {
  const cwd = process.cwd();
  const config = resolveConfig(cwd, {
    registry: options.registry,
    outputDir: options.target,
  });

  if (!config.registry) {
    console.error(
      "Error: No registry path specified. Use --registry <path> or set registry in radish.json"
    );
    process.exit(1);
  }

  const registry = loadRegistry(config.registry);
  const lockfile = loadLockfile(cwd);

  if (Object.keys(lockfile.components).length === 0) {
    console.log("No components found in radish.lock.json. Run `radish add` first.");
    return;
  }

  for (const [componentName, componentLock] of Object.entries(lockfile.components)) {
    const registryComponent = registry.components.find((c) => c.name === componentName);
    if (!registryComponent) {
      console.warn(`⚠ Component "${componentName}" not found in registry. Skipping.`);
      continue;
    }

    for (const [relPath, fileLock] of Object.entries(componentLock.files)) {
      const localPath = resolve(cwd, config.outputDir, relPath);
      const registryFilePath = `src/${relPath}`;
      const registryPath = resolve(config.registry, registryFilePath);

      if (!existsSync(localPath)) {
        console.warn(`⚠ Local file not found: ${localPath}. Skipping.`);
        continue;
      }

      if (!existsSync(registryPath)) {
        console.warn(`⚠ Registry file not found: ${registryPath}. Skipping.`);
        continue;
      }

      const localContent = readFileSync(localPath);
      const currentLocalHash = hashContent(localContent);

      const registryContent = readFileSync(registryPath);
      const newRegistryHash = hashContent(registryContent);

      const { update, reason } = shouldUpdate(
        currentLocalHash,
        fileLock.localHash,
        newRegistryHash,
        fileLock.registryHash,
        options.force ?? false
      );

      if (reason === "modified") {
        console.warn(
          `⚠ Skipping ${relPath} — local modifications detected.\n  Run \`radish diff ${componentName}\` to see upstream changes.`
        );
        continue;
      }

      if (!update) {
        // up-to-date, skip silently
        continue;
      }

      // update === true (force or unmodified-and-changed)
      writeFileSync(localPath, registryContent);
      fileLock.registryHash = newRegistryHash;
      fileLock.localHash = newRegistryHash;
      console.log(`✓ Updated ${relPath}`);
    }
  }

  saveLockfile(cwd, lockfile);
}
