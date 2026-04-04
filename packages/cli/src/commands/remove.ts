import { existsSync, unlinkSync } from "node:fs";
import { resolve } from "node:path";
import { hashContent } from "../lib/hash.js";
import { validateComponentName, validateRelativePath } from "../lib/registry.js";
import { loadLockfile, saveLockfile } from "../lib/lockfile.js";
import { resolveConfig } from "../lib/config.js";
import { RadishError } from "../lib/errors.js";
import { assertWithinDir, readFileWithinDir } from "../lib/fs.js";

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

  // Deduplicate to avoid processing the same component twice when the caller
  // accidentally passes the same name more than once.
  const uniqueComponents = Array.from(new Set(components));

  // Pre-validate all component names and verify they are installed
  for (const componentName of uniqueComponents) {
    validateComponentName(componentName);
    if (!lockfile.components[componentName]) {
      throw new RadishError(
        `Component "${componentName}" is not installed (not found in radish.lock.json).`,
      );
    }
  }

  let removedCount = 0;

  for (const componentName of uniqueComponents) {
    const componentLock = lockfile.components[componentName];
    const filePathsSet = new Set(Object.keys(componentLock.files));

    // Find files also referenced by any other component currently in the
    // lockfile (whether or not it is being removed in this invocation).
    // Checking ALL other entries — not just those outside the removal set —
    // prevents a file shared between two components being removed from being
    // deleted by the first successful removal before the second one finishes:
    // if the second component then fails and keeps its lockfile entry, the
    // shared file is still on disk. Successful removals delete their lockfile
    // entry, so they no longer protect any file; failed removals remain in the
    // lockfile and naturally continue to protect their files.
    // Using a Set for filePathsSet keeps the inner lookup O(1) per file.
    const sharedFiles = new Set<string>();
    for (const [otherName, otherLock] of Object.entries(lockfile.components)) {
      if (otherName === componentName) continue;
      for (const relPath of Object.keys(otherLock.files)) {
        if (filePathsSet.has(relPath)) {
          sharedFiles.add(relPath);
        }
      }
    }

    // Remove files from disk. Track any unlink failures so we can decide
    // whether it is safe to drop the lockfile entry afterwards.
    let fileRemovalFailed = false;
    const force = options.force ?? false;
    for (const relPath of filePathsSet) {
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

      // When --force is not set, read the file and compare its hash against
      // the lockfile to detect local modifications. If the file cannot be
      // read for any reason (permissions, symlink escape, etc.) treat the
      // situation as a removal failure so the lockfile entry is kept.
      if (!force) {
        try {
          const fileLock = componentLock.files[relPath];
          const localContent = readFileWithinDir(resolve(cwd, config.outputDir), destPath);
          const currentLocalHash = hashContent(localContent);
          const userModified = currentLocalHash !== fileLock.localHash;

          if (userModified) {
            console.warn(
              `⚠ Skipping "${relPath}" — local modifications detected. Use --force to remove anyway.`,
            );
            continue;
          }
        } catch (err) {
          console.warn(
            `⚠ Could not read "${relPath}" to check for local modifications: ${err instanceof Error ? err.message : String(err)}`,
          );
          fileRemovalFailed = true;
          continue;
        }
      }

      try {
        assertWithinDir(resolve(cwd, config.outputDir), destPath);
        unlinkSync(destPath);
        console.log(`✓ Removed ${relPath}`);
      } catch (err) {
        console.warn(
          `⚠ Could not remove "${destPath}": ${err instanceof Error ? err.message : String(err)}`,
        );
        fileRemovalFailed = true;
      }
    }

    if (fileRemovalFailed) {
      // At least one file could not be deleted or read. Keep the lockfile
      // entry so the component remains tracked and future remove/sync/diff
      // calls stay correct. Because this component's entry is still present in
      // lockfile.components, subsequent components in the same invocation will
      // naturally treat its files as shared and leave them on disk.
      console.warn(
        `⚠ Component "${componentName}" was not removed from the lockfile because one or more files could not be deleted. Resolve any file permission issues and run \`radish remove ${componentName}\` again.`,
      );
      continue;
    }

    delete lockfile.components[componentName];
    removedCount++;
    console.log(`✓ Removed component "${componentName}" from lockfile.`);
  }

  if (removedCount > 0) {
    saveLockfile(cwd, lockfile);
  }
}
