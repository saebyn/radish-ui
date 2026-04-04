import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createPatch } from "diff";
import { hashContent } from "../lib/hash.js";
import {
  loadRegistryAsync,
  isRemoteRegistry,
  fetchRegistryFile,
  validateRelativePath,
  relativeToRegistryFile,
  validateComponentName,
} from "../lib/registry.js";
import { loadLockfile } from "../lib/lockfile.js";
import { resolveConfig } from "../lib/config.js";
import { RadishError } from "../lib/errors.js";
import { assertWithinDir, readFileWithinDir } from "../lib/fs.js";

export interface DiffOptions {
  registry?: string;
  target?: string;
}

export async function diffCommand(componentName: string, options: DiffOptions): Promise<void> {
  const cwd = process.cwd();
  const config = resolveConfig(cwd, {
    registry: options.registry,
    outputDir: options.target,
  });

  const lockfile = loadLockfile(cwd);
  validateComponentName(componentName);
  const componentLock = lockfile.components[componentName];
  if (!componentLock) {
    throw new RadishError(
      `Component "${componentName}" not found in radish.lock.json. Run \`radish add ${componentName}\` first.`,
    );
  }

  const registry = await loadRegistryAsync(config.registry);
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
    const registryFilePath = relativeToRegistryFile(relPath);

    let registryContent: string;
    if (isRemoteRegistry(config.registry)) {
      let buf: Buffer;
      try {
        buf = await fetchRegistryFile(config.registry, registryFilePath);
      } catch (err) {
        console.warn(
          `⚠ Could not fetch registry file for ${relPath}: ${err instanceof Error ? err.message : String(err)}`,
        );
        continue;
      }
      registryContent = buf.toString("utf-8");
    } else {
      const registryPath = resolve(config.registry, registryFilePath);
      if (!existsSync(registryPath)) {
        console.warn(`⚠ Registry file not found: ${registryPath}`);
        continue;
      }
      assertWithinDir(config.registry, registryPath);
      registryContent = readFileSync(registryPath, "utf-8");
    }

    const newRegistryHash = hashContent(registryContent);

    if (newRegistryHash === fileLock.registryHash) {
      console.log(`✓ ${relPath}: no upstream changes`);
      continue;
    }

    const localContent = readFileWithinDir(resolve(cwd, config.outputDir), localPath);
    const patch = createPatch(relPath, localContent, registryContent, "local", "registry");
    console.log(patch);
  }
}
