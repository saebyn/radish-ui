import { existsSync, unlinkSync } from "node:fs";
import { resolve } from "node:path";
import { hashContent } from "../lib/hash.js";
import { validateComponentName, validateRelativePath } from "../lib/registry.js";
import { loadLockfile, saveLockfile } from "../lib/lockfile.js";
import { resolveConfig } from "../lib/config.js";
import { RadishError } from "../lib/errors.js";
import { readFileWithinDir } from "../lib/fs.js";

export interface RemoveOptions {
  target?: string;
  force?: boolean;
  /** Override the working directory (used in tests; defaults to process.cwd()). */
  cwd?: string;
}

export async function removeCommand(components: string[], options: RemoveOptions): Promise<void> {
  const cwd = options.cwd ?? process.cwd();
  const config = resolveConfig(cwd, {
    outputDir: options.target,
  });

  const lockfile = loadLockfile(cwd);

  // Pre-validate all component names and verify they are installed
  for (const componentName of components) {
    validateComponentName(componentName);
    if (!lockfile.components[componentName]) {
      throw new RadishError(
        `Component "${componentName}" is not installed (not found in radish.lock.json).`,
      );
    }
  }

  const componentsToRemove = new Set(components);
  let removedCount = 0;

  for (const componentName of components) {
    const componentLock = lockfile.components[componentName];
    const filePaths = Object.keys(componentLock.files);

    // Find files that are also used by other installed components not being removed.
    // Such shared files must not be deleted.
    const sharedFiles = new Set<string>();
    for (const [otherName, otherLock] of Object.entries(lockfile.components)) {
      if (componentsToRemove.has(otherName)) continue;
      for (const relPath of Object.keys(otherLock.files)) {
        if (filePaths.includes(relPath)) {
          sharedFiles.add(relPath);
        }
      }
    }

    // Remove files from disk
    for (const relPath of filePaths) {
      try {
        validateRelativePath(relPath);
      } catch (err) {
        console.warn(
          `⚠ Skipping unsafe path in lockfile: ${relPath} — ${err instanceof Error ? err.message : String(err)}`,
        );
        continue;
      }

      if (sharedFiles.has(relPath)) {
        console.log(`  Skipping "${relPath}" — still referenced by another installed component.`);
        continue;
      }

      const destPath = resolve(cwd, config.outputDir, relPath);

      if (!existsSync(destPath)) {
        // File was already deleted outside of radish; nothing to do.
        continue;
      }

      // Warn about locally modified files unless --force is set.
      const fileLock = componentLock.files[relPath];
      const localContent = readFileWithinDir(resolve(cwd, config.outputDir), destPath);
      const currentLocalHash = hashContent(localContent);
      const userModified = currentLocalHash !== fileLock.localHash;

      if (userModified && !(options.force ?? false)) {
        console.warn(
          `⚠ Skipping "${relPath}" — local modifications detected. Use --force to remove anyway.`,
        );
        continue;
      }

      try {
        unlinkSync(destPath);
        console.log(`✓ Removed ${relPath}`);
      } catch (err) {
        console.warn(
          `⚠ Could not remove "${destPath}": ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }

    delete lockfile.components[componentName];
    removedCount++;
    console.log(`✓ Removed component "${componentName}" from lockfile.`);
  }

  if (removedCount > 0) {
    saveLockfile(cwd, lockfile);
  }
}
