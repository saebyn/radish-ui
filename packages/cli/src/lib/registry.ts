import { readFileSync } from "fs";
import { resolve } from "path";

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
 * e.g. "list/datagrid.tsx"
 */
export function registryFileToRelative(registryFilePath: string): string {
  return registryFilePath.replace(/^src\//, "");
}
