import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { hashContent } from "../lib/hash.js";
import { loadRegistry, findComponent, registryFileToRelative } from "../lib/registry.js";
import { loadLockfile, saveLockfile } from "../lib/lockfile.js";
import { resolveConfig } from "../lib/config.js";

export interface AddOptions {
  registry?: string;
  target?: string;
  force?: boolean;
}

export async function addCommand(
  components: string[],
  options: AddOptions
): Promise<void> {
  const cwd = process.cwd();
  const config = resolveConfig(cwd, {
    registry: options.registry,
    outputDir: options.target,
  });

  if (!config.registry) {
    console.error(
      "Error: No registry path specified. Use --registry <path> or set registry in radish.json"
    );
    process.exit(1);
  }

  const registry = loadRegistry(config.registry);
  const lockfile = loadLockfile(cwd);
  const allDeps = new Set<string>();

  for (const componentName of components) {
    const component = findComponent(registry, componentName);
    if (!component) {
      console.error(`Error: Component "${componentName}" not found in registry.`);
      process.exit(1);
    }

    const existingLock = lockfile.components[componentName];
    if (existingLock && !options.force) {
      console.warn(
        `⚠ Component "${componentName}" is already installed. Use --force to overwrite.`
      );
      continue;
    }

    const fileLocks: Record<string, { registryHash: string; localHash: string }> = {};

    for (const registryFilePath of component.files) {      const relPath = registryFileToRelative(registryFilePath);
      const srcPath = resolve(config.registry, registryFilePath);
      const destPath = resolve(cwd, config.outputDir, relPath);

      if (existsSync(destPath) && !options.force) {
        console.warn(
          `⚠ File "${destPath}" already exists. Use --force to overwrite.`
        );
        continue;
      }

      const content = readFileSync(srcPath);
      const hash = hashContent(content);

      mkdirSync(dirname(destPath), { recursive: true });
      writeFileSync(destPath, content);

      fileLocks[relPath] = {
        registryHash: hash,
        localHash: hash,
      };

      console.log(`✓ Added ${componentName} → ${config.outputDir}/${relPath}`);
    }

    lockfile.components[componentName] = { files: fileLocks };

    for (const dep of component.dependencies) {
      allDeps.add(dep);
    }
  }

  saveLockfile(cwd, lockfile);

  if (allDeps.size > 0) {
    console.log("\nDon't forget to install dependencies:");
    for (const dep of allDeps) {
      console.log(`  pnpm add ${dep}`);
    }
  }
}
