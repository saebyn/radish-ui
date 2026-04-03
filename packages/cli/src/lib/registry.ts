import { readFileSync } from "fs";
import { resolve, normalize, isAbsolute } from "path";

export interface RegistryComponent {
  name: string;
  files: string[];
  dependencies: string[];
}

export interface Registry {
  components: RegistryComponent[];
}

export function loadRegistry(registryDir: string): Registry {
  const registryPath = resolve(registryDir, "registry.json");
  const raw = readFileSync(registryPath, "utf-8");
  return JSON.parse(raw) as Registry;
}

export function findComponent(
  registry: Registry,
  name: string
): RegistryComponent | undefined {
  return registry.components.find((c) => c.name === name);
}

/**
 * Given a registry file path like "src/list/datagrid.tsx",
 * returns the relative path without the leading "src/" prefix,
 * e.g. "list/datagrid.tsx".
 * Throws if the path does not start with "src/" or contains path traversal.
 */
export function registryFileToRelative(registryFilePath: string): string {
  if (!registryFilePath.startsWith("src/")) {
    throw new Error(
      `Registry file path must start with "src/": ${registryFilePath}`
    );
  }
  const relPath = normalize(registryFilePath.slice(4));
  if (isAbsolute(relPath) || relPath.startsWith("..")) {
    throw new Error(
      `Registry file path contains path traversal: ${registryFilePath}`
    );
  }
  return relPath;
}
