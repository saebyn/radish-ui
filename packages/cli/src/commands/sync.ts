import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { hashContent } from "../lib/hash.js";
import {
  loadRegistry,
  validateRelativePath,
  relativeToRegistryFile,
  validateComponentName,
} from "../lib/registry.js";
import { loadLockfile, saveLockfile, shouldUpdate } from "../lib/lockfile.js";
import { resolveConfig } from "../lib/config.js";
import { RadishError } from "../lib/errors.js";
import { writeFileAtomic, readFileWithinDir } from "../lib/fs.js";

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
    throw new RadishError(
      "No registry path specified. Use --registry <path> or set registry in radish.json",
    );
  }

  const registry = loadRegistry(config.registry);
  const lockfile = loadLockfile(cwd);
  let lockfileChanged = 0;

  if (Object.keys(lockfile.components).length === 0) {
    console.log("No components found in radish.lock.json. Run `radish add` first.");
    return;
  }

  for (const [componentName, componentLock] of Object.entries(lockfile.components)) {
    try {
      validateComponentName(componentName);
    } catch {
      console.warn(`⚠ Skipping invalid component name in lockfile: "${componentName}"`);
      continue;
    }

    const registryComponent = registry.components.find((c) => c.name === componentName);
    if (!registryComponent) {
      console.warn(`⚠ Component "${componentName}" not found in registry. Skipping.`);
      continue;
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

      const localPath = resolve(cwd, config.outputDir, relPath);
      const componentPath = resolve(config.registry, relativeToRegistryFile(relPath));

      if (!existsSync(componentPath)) {
        console.warn(`⚠ Registry file not found: ${componentPath}. Skipping.`);
        continue;
      }

      const registryContent = readFileWithinDir(config.registry, componentPath);
      const newRegistryHash = hashContent(registryContent);

      if (!existsSync(localPath)) {
        if (!(options.force ?? false)) {
          console.warn(`⚠ Local file not found: ${localPath}. Skipping.`);
          continue;
        }

        writeFileAtomic(resolve(cwd, config.outputDir), localPath, registryContent);
        componentLock.files[relPath] = {
          registryHash: newRegistryHash,
          localHash: newRegistryHash,
        };
        lockfileChanged++;
        console.log(`✓ Restored ${relPath}`);
        continue;
      }

      const localContent = readFileWithinDir(resolve(cwd, config.outputDir), localPath);
      const currentLocalHash = hashContent(localContent);

      const { update, reason } = shouldUpdate(
        currentLocalHash,
        fileLock.localHash,
        newRegistryHash,
        fileLock.registryHash,
        options.force ?? false,
      );

      if (reason === "modified") {
        console.warn(
          `⚠ Skipping ${relPath} — local modifications detected.\n  Run \`radish diff ${componentName}\` to see upstream changes.`,
        );
        continue;
      }

      if (!update) {
        // up-to-date, skip silently
        continue;
      }

      // Either force update, or unmodified and changed in registry. In both cases, overwrite local file and update lock.
      writeFileAtomic(resolve(cwd, config.outputDir), localPath, registryContent);
      componentLock.files[relPath] = { registryHash: newRegistryHash, localHash: newRegistryHash };
      lockfileChanged++;
      console.log(`✓ Updated ${relPath}`);
    }
  }

  if (lockfileChanged > 0) {
    saveLockfile(cwd, lockfile);
  }
}
