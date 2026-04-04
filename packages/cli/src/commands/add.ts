import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { hashContent } from "../lib/hash.js";
import {
  loadRegistryAsync,
  isRemoteRegistry,
  fetchRegistryFile,
  findComponent,
  registryFileToRelative,
  validateComponentName,
  type RegistryComponent,
} from "../lib/registry.js";
import { loadLockfile, saveLockfile, type FileLock } from "../lib/lockfile.js";
import { resolveConfig, type RadishConfig } from "../lib/config.js";
import { RadishError } from "../lib/errors.js";
import { assertWithinDir, writeFileAtomic } from "../lib/fs.js";

export interface AddOptions {
  registry?: string;
  target?: string;
  force?: boolean;
}

interface ResolvedFile {
  relPath: string;
  /** Local source path (local registry only). Null for remote registries. */
  srcPath: string | null;
  /** Registry-relative file path used to fetch from a remote registry. */
  registryFilePath: string;
  destPath: string;
  /** When true the destination already exists and should be skipped at write time. */
  skip: boolean;
}

/**
 * Resolves and validates all source/destination paths for a component's files.
 * For local registries, performs the assertWithinDir check on each srcPath here,
 * where the path is first constructed, rather than deferring it to write time.
 * For remote registries, srcPath is null and file content is fetched later.
 * Files whose destination already exists are marked skip=true; the rest of the
 * component's files are still resolved and written.
 */
function resolveComponentFiles(
  component: RegistryComponent,
  componentName: string,
  config: Required<RadishConfig>,
  cwd: string,
  force: boolean,
): ResolvedFile[] {
  const resolvedFiles: ResolvedFile[] = [];

  for (const registryFilePath of component.files) {
    let relPath: string;
    try {
      relPath = registryFileToRelative(registryFilePath);
    } catch (err) {
      throw new RadishError(
        `Invalid registry file path for component "${componentName}": ${err instanceof Error ? err.message : String(err)}`,
      );
    }

    let srcPath: string | null = null;
    if (!isRemoteRegistry(config.registry)) {
      srcPath = resolve(config.registry, registryFilePath);
      if (!existsSync(srcPath)) {
        throw new RadishError(
          `Registry file not found for component "${componentName}": ${srcPath}`,
        );
      }
      // Guard against registry file entries that are symlinks pointing outside
      // the registry directory. Done here, as soon as the path is constructed.
      assertWithinDir(config.registry, srcPath);
    }

    const destPath = resolve(cwd, config.outputDir, relPath);
    const skip = existsSync(destPath) && !force;
    if (skip) {
      console.warn(
        `⚠ File "${destPath}" already exists. Use --force to overwrite. Skipping file "${relPath}" for component "${componentName}".`,
      );
    }

    resolvedFiles.push({ relPath, srcPath, registryFilePath, destPath, skip });
  }

  return resolvedFiles;
}

/**
 * Writes all resolved files for a component and returns the per-file lock
 * entries to record in the lockfile.
 */
async function writeComponentFiles(
  resolvedFiles: ResolvedFile[],
  componentName: string,
  config: Required<RadishConfig>,
  cwd: string,
  force: boolean,
): Promise<Record<string, FileLock>> {
  const fileLocks: Record<string, FileLock> = {};

  for (const { relPath, srcPath, registryFilePath, destPath, skip } of resolvedFiles) {
    if (skip) continue;

    let content: Buffer;
    if (srcPath !== null) {
      content = readFileSync(srcPath);
    } else {
      try {
        content = await fetchRegistryFile(config.registry, registryFilePath);
      } catch (err) {
        throw new RadishError(
          `Failed to fetch registry file "${registryFilePath}" for component "${componentName}": ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }
    const hash = hashContent(content);

    writeFileAtomic(resolve(cwd, config.outputDir), destPath, content, force);

    fileLocks[relPath] = { registryHash: hash, localHash: hash };
    console.log(`✓ Added ${componentName} → ${config.outputDir}/${relPath}`);
  }

  return fileLocks;
}

/**
 * Prints the suggested install command for any npm dependencies the added
 * components require.
 */
function printDependencyHint(deps: Set<string>): void {
  if (deps.size === 0) return;
  const agent = process.env["npm_config_user_agent"] ?? "";
  const pm = agent.startsWith("yarn")
    ? "yarn add"
    : agent.startsWith("npm")
      ? "npm install"
      : "pnpm add";
  console.log("\nDon't forget to install dependencies:");
  for (const dep of deps) {
    console.log(`  ${pm} ${dep}`);
  }
}

export async function addCommand(components: string[], options: AddOptions): Promise<void> {
  const cwd = process.cwd();
  const config = resolveConfig(cwd, {
    registry: options.registry,
    outputDir: options.target,
  });

  const registry = await loadRegistryAsync(config.registry);
  const lockfile = loadLockfile(cwd);
  const allDeps = new Set<string>();
  let componentsWritten = 0;

  // Pre-validate all component names before writing anything
  for (const componentName of components) {
    validateComponentName(componentName);
    if (!findComponent(registry, componentName)) {
      throw new RadishError(`Component "${componentName}" not found in registry.`);
    }
  }

  for (const componentName of components) {
    const component = findComponent(registry, componentName)!;

    if (lockfile.components[componentName] && !options.force) {
      console.warn(
        `⚠ Component "${componentName}" is already installed. Use --force to overwrite.`,
      );
      continue;
    }

    const resolvedFiles = resolveComponentFiles(
      component,
      componentName,
      config,
      cwd,
      options.force ?? false,
    );

    const fileLocks = await writeComponentFiles(
      resolvedFiles,
      componentName,
      config,
      cwd,
      options.force ?? false,
    );

    // fileLocks may be empty if every file was already present and --force was not passed.
    // The component is still recorded in the lockfile so subsequent installs know it was added.
    lockfile.components[componentName] = { files: fileLocks };
    componentsWritten++;

    for (const dep of component.dependencies) {
      allDeps.add(dep);
    }
  }

  if (componentsWritten > 0) {
    saveLockfile(cwd, lockfile);
  }

  printDependencyHint(allDeps);
}
