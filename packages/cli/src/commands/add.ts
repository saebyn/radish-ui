import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { hashContent } from "../lib/hash.js";
import { loadRegistry, findComponent, registryFileToRelative } from "../lib/registry.js";
import { loadLockfile, saveLockfile } from "../lib/lockfile.js";
import { resolveConfig } from "../lib/config.js";
import { RadishError } from "../lib/errors.js";
import { writeFileAtomicForce } from "../lib/fs.js";

export interface AddOptions {
  registry?: string;
  target?: string;
  force?: boolean;
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
    if (!findComponent(registry, componentName)) {
      throw new RadishError(`Component "${componentName}" not found in registry.`);
    }
  }

  for (const componentName of components) {
    const component = findComponent(registry, componentName)!;

    const existingLock = lockfile.components[componentName];
    if (existingLock && !options.force) {
      console.warn(
        `⚠ Component "${componentName}" is already installed. Use --force to overwrite.`,
      );
      continue;
    }

    // Resolve and validate all source/destination paths before writing anything
    const resolvedFiles: Array<{
      relPath: string;
      srcPath: string;
      destPath: string;
    }> = [];
    let skipComponent = false;

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

      const destPath = resolve(cwd, config.outputDir, relPath);
      if (existsSync(destPath) && !options.force) {
        console.warn(
          `⚠ File "${destPath}" already exists. Use --force to overwrite. Skipping component "${componentName}".`,
        );
        skipComponent = true;
        break;
      }

      resolvedFiles.push({ relPath, srcPath, destPath });
    }

    if (skipComponent) {
      continue;
    }

    const fileLocks: Record<string, { registryHash: string; localHash: string }> = {};

    for (const { relPath, srcPath, destPath } of resolvedFiles) {
      const content = readFileSync(srcPath);
      const hash = hashContent(content);

      writeFileAtomicForce(resolve(cwd, config.outputDir), destPath, content, options.force ?? false);

      fileLocks[relPath] = {
        registryHash: hash,
        localHash: hash,
      };

      console.log(`✓ Added ${componentName} → ${config.outputDir}/${relPath}`);
    }

    lockfile.components[componentName] = { files: fileLocks };
    componentsWritten++;

    for (const dep of component.dependencies) {
      allDeps.add(dep);
    }
  }

  if (componentsWritten > 0) {
    saveLockfile(cwd, lockfile);
  }

  if (allDeps.size > 0) {
    const agent = process.env["npm_config_user_agent"] ?? "";
    const pm = agent.startsWith("yarn")
      ? "yarn add"
      : agent.startsWith("npm")
        ? "npm install"
        : "pnpm add";
    console.log("\nDon't forget to install dependencies:");
    for (const dep of allDeps) {
      console.log(`  ${pm} ${dep}`);
    }
  }
}
