import { existsSync, readFileSync } from "node:fs";
import { resolve, posix } from "node:path";
import { RadishError, getErrorMessage } from "./errors.js";

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
  if (!existsSync(registryPath)) {
    throw new RadishError(`Registry not found at "${registryPath}". Check your --registry path or radish.json.`);
  }
  try {
    const raw = readFileSync(registryPath, "utf-8");
    return JSON.parse(raw) as Registry;
  } catch (err) {
    throw new RadishError(`Failed to read or parse registry at "${registryPath}": ${getErrorMessage(err)}`);
  }
}

export function findComponent(registry: Registry, name: string): RegistryComponent | undefined {
  return registry.components.find((c) => c.name === name);
}

/**
 * Given a relative path like "list/datagrid.tsx", returns the registry file
 * path with the "src/" prefix, e.g. "src/list/datagrid.tsx".
 * This is the symmetric inverse of registryFileToRelative.
 */
export function relativeToRegistryFile(relPath: string): string {
  return `src/${relPath}`;
}

/**
 * Given a registry file path like "src/list/datagrid.tsx",
 * returns the relative path without the leading "src/" prefix,
 * e.g. "list/datagrid.tsx".
 * Throws if the path does not start with "src/" or contains path traversal.
 */
export function registryFileToRelative(registryFilePath: string): string {
  if (!registryFilePath.startsWith("src/")) {
    throw new Error(`Registry file path must start with "src/": ${registryFilePath}`);
  }
  const relPath = posix.normalize(registryFilePath.slice(4));
  if (posix.isAbsolute(relPath) || relPath.startsWith("..")) {
    throw new Error(`Registry file path contains path traversal: ${registryFilePath}`);
  }
  return relPath;
}

/**
 * Validates that a relative path read from radish.lock.json does not
 * contain path traversal sequences. Throws if unsafe.
 */
export function validateRelativePath(relPath: string): void {
  // Reject Windows-style backslash separators and drive-letter prefixes
  // (e.g. "a\\..\\..\\etc" or "C:/Windows/...") before POSIX normalisation.
  if (relPath.includes("\\") || /^[A-Za-z]:/.test(relPath)) {
    throw new Error(`Unsafe relative path in lockfile: ${relPath}`);
  }

  const normalized = posix.normalize(relPath);
  if (
    posix.isAbsolute(normalized) ||
    normalized === "." ||
    normalized === ".." ||
    normalized.startsWith("../")
  ) {
    throw new Error(`Unsafe relative path in lockfile: ${relPath}`);
  }
}
