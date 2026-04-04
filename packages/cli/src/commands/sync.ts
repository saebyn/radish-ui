import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { hashContent } from "../lib/hash.js";
import {
  loadRegistryAsync,
  isRemoteRegistry,
  fetchRegistryFile,
  validateRelativePath,
  relativeToRegistryFile,
  registryFileToRelative,
  validateComponentName,
} from "../lib/registry.js";
import { loadLockfile, saveLockfile, shouldUpdate } from "../lib/lockfile.js";
import { resolveConfig } from "../lib/config.js";
import { writeFileAtomic, readFileWithinDir } from "../lib/fs.js";

export interface SyncOptions {
  registry?: string;
  target?: string;
  force?: boolean;
  /** Override the working directory (used in tests; defaults to process.cwd()). */
  cwd?: string;
}

export async function syncCommand(options: SyncOptions): Promise<void> {
  const cwd = options.cwd ?? process.cwd();
  const config = resolveConfig(cwd, {
    registry: options.registry,
    outputDir: options.target,
  });

  const registry = await loadRegistryAsync(config.registry);
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
      const registryFilePath = relativeToRegistryFile(relPath);

      let registryContent: Buffer | string;
      if (isRemoteRegistry(config.registry)) {
        try {
          registryContent = await fetchRegistryFile(config.registry, registryFilePath);
        } catch (err) {
          console.warn(
            `⚠ Could not fetch registry file for ${relPath}: ${err instanceof Error ? err.message : String(err)}. Skipping.`,
          );
          continue;
        }
      } else {
        const componentPath = resolve(config.registry, registryFilePath);
        if (!existsSync(componentPath)) {
          console.warn(`⚠ Registry file not found: ${componentPath}. Skipping.`);
          continue;
        }
        registryContent = readFileWithinDir(config.registry, componentPath);
      }

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

    // Install any new files that were added to the component's registry definition
    // since the component was first installed (not yet tracked in the lockfile).
    for (const registryFilePath of registryComponent.files) {
      let relPath: string;
      try {
        relPath = registryFileToRelative(registryFilePath);
      } catch (err) {
        console.warn(
          `⚠ Skipping invalid registry path for "${componentName}": ${registryFilePath} — ${err instanceof Error ? err.message : String(err)}`,
        );
        continue;
      }

      if (componentLock.files[relPath]) {
        continue; // already tracked and handled above
      }

      const destPath = resolve(cwd, config.outputDir, relPath);

      let registryContent: Buffer | string;
      if (isRemoteRegistry(config.registry)) {
        try {
          registryContent = await fetchRegistryFile(config.registry, registryFilePath);
        } catch (err) {
          console.warn(
            `⚠ Could not fetch new file "${relPath}" for "${componentName}": ${err instanceof Error ? err.message : String(err)}. Skipping.`,
          );
          continue;
        }
      } else {
        const componentPath = resolve(config.registry, registryFilePath);
        if (!existsSync(componentPath)) {
          console.warn(`⚠ Registry file not found: ${componentPath}. Skipping.`);
          continue;
        }
        registryContent = readFileWithinDir(config.registry, componentPath);
      }

      const newHash = hashContent(registryContent);

      if (existsSync(destPath) && !(options.force ?? false)) {
        console.warn(
          `⚠ New file "${relPath}" for "${componentName}" already exists locally but is not tracked.\n  Run \`radish sync --force\` to overwrite.`,
        );
        continue;
      }

      writeFileAtomic(resolve(cwd, config.outputDir), destPath, registryContent);
      componentLock.files[relPath] = { registryHash: newHash, localHash: newHash };
      lockfileChanged++;
      console.log(`✓ Added ${relPath} (new file for ${componentName})`);
    }
  }

  if (lockfileChanged > 0) {
    saveLockfile(cwd, lockfile);
  }
}
