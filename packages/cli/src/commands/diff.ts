import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createPatch } from "diff";
import { hashContent } from "../lib/hash.js";
import {
  loadRegistry,
  validateRelativePath,
  relativeToRegistryFile,
  validateComponentName,
} from "../lib/registry.js";
import { loadLockfile } from "../lib/lockfile.js";
import { resolveConfig } from "../lib/config.js";
import { RadishError } from "../lib/errors.js";
import { assertWithinDir } from "../lib/fs.js";

export interface DiffOptions {
  registry?: string;
  target?: string;
}

/**
 * Reads the local copy of a component file, asserting it is within the
 * allowed output directory (symlink-safe). Returns an empty string if the
 * file does not exist locally (so the diff shows the full registry content
 * as an addition).
 */
function readLocalFile(allowedRoot: string, localPath: string): string {
  if (!existsSync(localPath)) {
    return "";
  }
  assertWithinDir(allowedRoot, localPath);
  return readFileSync(localPath, "utf-8");
}

export async function diffCommand(componentName: string, options: DiffOptions): Promise<void> {
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

  const lockfile = loadLockfile(cwd);
  validateComponentName(componentName);
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

    const localPath = resolve(cwd, config.outputDir, relPath);
    const registryPath = resolve(config.registry, relativeToRegistryFile(relPath));

    if (!existsSync(registryPath)) {
      console.warn(`⚠ Registry file not found: ${registryPath}`);
      continue;
    }

    const registryContent = readFileSync(registryPath, "utf-8");
    const newRegistryHash = hashContent(registryContent);

    if (newRegistryHash === fileLock.registryHash) {
      console.log(`✓ ${relPath}: no upstream changes`);
      continue;
    }

    const localContent = readLocalFile(resolve(cwd, config.outputDir), localPath);
    const patch = createPatch(relPath, localContent, registryContent, "local", "registry");
    console.log(patch);
  }
}
