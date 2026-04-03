import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { hashContent } from "../lib/hash.js";
import {
  loadRegistry,
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
  srcPath: string;
  destPath: string;
}

/**
 * Resolves and validates all source/destination paths for a component's files.
 * Performs the assertWithinDir check on each srcPath here, where the path is
 * first constructed, rather than deferring it to write time.
 * Returns null if the component should be skipped (dest file exists, no --force).
 */
function resolveComponentFiles(
  component: RegistryComponent,
  componentName: string,
  config: Required<RadishConfig>,
  cwd: string,
  force: boolean,
): ResolvedFile[] | null {
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

    const srcPath = resolve(config.registry, registryFilePath);
    if (!existsSync(srcPath)) {
      throw new RadishError(
        `Registry file not found for component "${componentName}": ${srcPath}`,
      );
    }
    // Guard against registry file entries that are symlinks pointing outside
    // the registry directory. Done here, as soon as the path is constructed.
    assertWithinDir(config.registry, srcPath);

    const destPath = resolve(cwd, config.outputDir, relPath);
    if (existsSync(destPath) && !force) {
      console.warn(
        `⚠ File "${destPath}" already exists. Use --force to overwrite. Skipping component "${componentName}".`,
      );
      return null;
    }

    resolvedFiles.push({ relPath, srcPath, destPath });
  }

  return resolvedFiles;
}

/**
 * Writes all resolved files for a component and returns the per-file lock
 * entries to record in the lockfile.
 */
function writeComponentFiles(
  resolvedFiles: ResolvedFile[],
  componentName: string,
  config: Required<RadishConfig>,
  cwd: string,
  force: boolean,
): Record<string, FileLock> {
  const fileLocks: Record<string, FileLock> = {};

  for (const { relPath, srcPath, destPath } of resolvedFiles) {
    const content = readFileSync(srcPath);
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

  if (!config.registry) {
    throw new RadishError(
      "No registry path specified. Use --registry <path> or set registry in radish.json",
    );
  }

  const registry = loadRegistry(config.registry);
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
    if (resolvedFiles === null) continue;

    const fileLocks = writeComponentFiles(
      resolvedFiles,
      componentName,
      config,
      cwd,
      options.force ?? false,
    );

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
