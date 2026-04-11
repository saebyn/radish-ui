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
import { loadLockfile, type ComponentLock } from "../lib/lockfile.js";
import { resolveConfig, type RadishConfig } from "../lib/config.js";
import { RadishError } from "../lib/errors.js";
import { assertWithinDir, readFileWithinDir } from "../lib/fs.js";

export interface DiffOptions {
  registry?: string;
  target?: string;
  /** Override the working directory (used in tests; defaults to process.cwd()). */
  cwd?: string;
}

type ComponentStatus =
  | "up-to-date"
  | "modified locally"
  | "missing"
  | "upstream changes"
  | "untracked/unknown";

export async function diffCommand(
  componentName: string | undefined,
  options: DiffOptions,
): Promise<void> {
  const cwd = options.cwd ?? process.cwd();
  if (componentName !== undefined) {
    await diffSingleComponent(componentName, options, cwd);
  } else {
    await diffAllComponents(options, cwd);
  }
}

async function diffSingleComponent(
  componentName: string,
  options: DiffOptions,
  cwd: string,
): Promise<void> {
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

async function getComponentStatus(
  componentLock: ComponentLock,
  config: Required<RadishConfig>,
  cwd: string,
): Promise<ComponentStatus> {
  let hasMissing = false;
  let hasLocalMod = false;
  let hasUpstreamChange = false;

  for (const [relPath, fileLock] of Object.entries(componentLock.files)) {
    try {
      validateRelativePath(relPath);
    } catch {
      continue;
    }

    const localPath = resolve(cwd, config.outputDir, relPath);

    if (!existsSync(localPath)) {
      hasMissing = true;
      continue;
    }

    let localContent: string;
    try {
      localContent = readFileWithinDir(resolve(cwd, config.outputDir), localPath);
    } catch {
      hasMissing = true;
      continue;
    }

    const currentLocalHash = hashContent(localContent);
    if (currentLocalHash !== fileLock.localHash) {
      hasLocalMod = true;
    }

    const registryFilePath = relativeToRegistryFile(relPath);
    let registryContent: string | undefined;

    if (isRemoteRegistry(config.registry)) {
      try {
        const buf = await fetchRegistryFile(config.registry, registryFilePath);
        registryContent = buf.toString("utf-8");
      } catch {
        // If we can't fetch, skip upstream check for this file
        continue;
      }
    } else {
      const registryPath = resolve(config.registry, registryFilePath);
      if (!existsSync(registryPath)) {
        continue;
      }
      try {
        assertWithinDir(config.registry, registryPath);
        registryContent = readFileSync(registryPath, "utf-8");
      } catch {
        continue;
      }
    }

    if (registryContent !== undefined) {
      const newRegistryHash = hashContent(registryContent);
      if (newRegistryHash !== fileLock.registryHash) {
        hasUpstreamChange = true;
      }
    }
  }

  if (hasMissing) return "missing";
  if (hasLocalMod) return "modified locally";
  if (hasUpstreamChange) return "upstream changes";
  return "up-to-date";
}

async function diffAllComponents(options: DiffOptions, cwd: string): Promise<void> {
  const config = resolveConfig(cwd, {
    registry: options.registry,
    outputDir: options.target,
  });

  const lockfile = loadLockfile(cwd);
  const componentNames = Object.keys(lockfile.components);

  if (componentNames.length === 0) {
    console.log("No components found in radish.lock.json. Run `radish add` first.");
    return;
  }

  const registry = await loadRegistryAsync(config.registry);

  let upToDateCount = 0;
  let driftCount = 0;

  for (const componentName of componentNames) {
    let status: ComponentStatus;

    try {
      validateComponentName(componentName);
    } catch {
      status = "untracked/unknown";
      console.log(`  ? ${componentName}: ${status}`);
      driftCount++;
      continue;
    }

    if (!registry.components.some((c) => c.name === componentName)) {
      status = "untracked/unknown";
      console.log(`  ? ${componentName}: ${status}`);
      driftCount++;
      continue;
    }

    const componentLock = lockfile.components[componentName];
    status = await getComponentStatus(componentLock, config, cwd);

    const statusSymbols: Record<ComponentStatus, string> = {
      "up-to-date": "✓",
      "upstream changes": "↑",
      "modified locally": "✗",
      missing: "✗",
      "untracked/unknown": "?",
    };
    const symbol = statusSymbols[status];
    console.log(`  ${symbol} ${componentName}: ${status}`);

    if (status === "up-to-date") {
      upToDateCount++;
    } else {
      driftCount++;
    }
  }

  const total = componentNames.length;
  const componentLabel = total === 1 ? "component" : "components";
  console.log(
    `\nScanned ${total} ${componentLabel}: ${upToDateCount} up-to-date, ${driftCount} with drift`,
  );

  if (driftCount > 0) {
    process.exitCode = 1;
  }
}
