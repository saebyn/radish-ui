import { existsSync, readFileSync } from "node:fs";
import { resolve, posix } from "node:path";
import { z } from "zod";
import { RadishError, getErrorMessage } from "./errors.js";

/**
 * Returns true if the registry string is a remote URL (http or https).
 */
export function isRemoteRegistry(registry: string): boolean {
  return registry.startsWith("http://") || registry.startsWith("https://");
}

const COMPONENT_NAME_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)*$/;

const RegistryFilePathSchema = z.string().refine(
  (p) => {
    if (!p.startsWith("src/")) return false;
    // Reject null bytes and Windows-style paths before normalisation.
    if (p.includes("\0") || p.includes("\\") || /^[A-Za-z]:/.test(p)) return false;
    const rel = posix.normalize(p.slice(4));
    return !posix.isAbsolute(rel) && !rel.startsWith("..");
  },
  { message: 'Registry file path must start with "src/" and must not contain path traversal' },
);

// Matches valid npm package names: unscoped (e.g. "react-icons") and scoped
// (e.g. "@radish-ui/core"). Follows the npm package name spec:
// - Max 214 characters
// - Lowercase only
// - Unscoped: starts with a letter or digit, then letters/digits/hyphens/dots/underscores
// - Scoped: @scope/name where both parts follow the unscoped rules
const NPM_PACKAGE_NAME_RE = /^(?:@[a-z0-9][a-z0-9._-]*\/)?[a-z0-9][a-z0-9._-]{0,213}$/;

const RegistryComponentSchema = z.object({
  name: z
    .string()
    .regex(
      COMPONENT_NAME_RE,
      "Component name must be lowercase alphanumeric words separated by hyphens, optionally grouped with slashes",
    ),
  files: z.array(RegistryFilePathSchema),
  dependencies: z.array(
    z
      .string()
      .regex(
        NPM_PACKAGE_NAME_RE,
        'Dependency must be a valid npm package name (e.g. "react-icons" or "@scope/pkg")',
      ),
  ),
});

const RegistrySchema = z.object({
  components: z.array(RegistryComponentSchema),
});

export type RegistryComponent = z.infer<typeof RegistryComponentSchema>;
export type Registry = z.infer<typeof RegistrySchema>;

export function loadRegistry(registryDir: string): Registry {
  const registryPath = resolve(registryDir, "registry.json");
  if (!existsSync(registryPath)) {
    throw new RadishError(
      `Registry not found at "${registryPath}". Check your --registry path or radish.json.`,
    );
  }
  try {
    const raw = readFileSync(registryPath, "utf-8");
    return RegistrySchema.parse(JSON.parse(raw));
  } catch (err) {
    throw new RadishError(
      `Failed to read or parse registry at "${registryPath}": ${getErrorMessage(err)}`,
    );
  }
}

/**
 * Loads the registry from a local path or a remote URL.
 * For remote URLs (http/https), fetches registry.json from `${baseUrl}/registry.json`.
 * For local paths, delegates to `loadRegistry`.
 */
export async function loadRegistryAsync(registry: string): Promise<Registry> {
  if (!isRemoteRegistry(registry)) {
    return loadRegistry(registry);
  }
  if (typeof globalThis.fetch !== "function") {
    throw new RadishError(
      `Remote registries require a Node.js runtime with built-in fetch support. Upgrade Node.js or use a local registry path instead: "${registry}"`,
    );
  }
  const baseUrl = new URL(registry.replace(/\/?$/, "/"));
  const url = new URL("registry.json", baseUrl).toString();
  let response: Response;
  try {
    response = await globalThis.fetch(url);
  } catch (err) {
    throw new RadishError(`Network error fetching registry from "${url}": ${getErrorMessage(err)}`);
  }
  if (!response.ok) {
    throw new RadishError(
      `Failed to fetch registry from "${url}": HTTP ${response.status} ${response.statusText}`,
    );
  }
  let data: unknown;
  try {
    data = await response.json();
  } catch (err) {
    throw new RadishError(`Failed to parse registry JSON from "${url}": ${getErrorMessage(err)}`);
  }
  try {
    return RegistrySchema.parse(data);
  } catch (err) {
    throw new RadishError(`Invalid registry data from "${url}": ${getErrorMessage(err)}`);
  }
}

/**
 * Fetches the content of a registry file from a remote base URL.
 * `registryFilePath` is relative to the registry root (e.g. "src/button.tsx").
 */
export async function fetchRegistryFile(
  registry: string,
  registryFilePath: string,
): Promise<Buffer> {
  if (typeof globalThis.fetch !== "function") {
    throw new RadishError(
      `Remote registries require a Node.js runtime with built-in fetch support. Upgrade Node.js or use a local registry path instead: "${registry}"`,
    );
  }
  const baseUrl = new URL(registry.replace(/\/?$/, "/"));
  const encodedRegistryFilePath = registryFilePath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  const url = new URL(encodedRegistryFilePath, baseUrl).toString();
  let response: Response;
  try {
    response = await globalThis.fetch(url);
  } catch (err) {
    throw new RadishError(
      `Network error fetching "${registryFilePath}" from registry: ${getErrorMessage(err)}`,
    );
  }
  if (!response.ok) {
    throw new RadishError(
      `Failed to fetch "${registryFilePath}" from registry: HTTP ${response.status} ${response.statusText}`,
    );
  }
  const ab = await response.arrayBuffer();
  return Buffer.from(ab);
}

export function findComponent(registry: Registry, name: string): RegistryComponent | undefined {
  return registry.components.find((c) => c.name === name);
}

/**
 * Validates that a component name supplied by the user (CLI argument or
 * lockfile key) matches the allowed pattern. Throws if invalid.
 */
export function validateComponentName(name: string): void {
  if (!COMPONENT_NAME_RE.test(name)) {
    throw new RadishError(
      `Invalid component name "${name}". Names must be lowercase alphanumeric words separated by hyphens, optionally grouped with slashes (e.g. "button", "form/input").`,
    );
  }
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

/**
 * Validates that a directory path used as an output destination does not
 * escape the project root. Unlike validateRelativePath, "." is allowed
 * (meaning the project root itself).
 * Throws if the path is absolute or traverses upward.
 */
export function validateRelativeDir(dirPath: string): void {
  // Reject Windows-style backslash separators and drive-letter prefixes.
  if (dirPath.includes("\\") || /^[A-Za-z]:/.test(dirPath)) {
    throw new Error(`Unsafe directory path: ${dirPath}`);
  }

  const normalized = posix.normalize(dirPath);
  if (posix.isAbsolute(normalized) || normalized === ".." || normalized.startsWith("../")) {
    throw new Error(`Unsafe directory path: ${dirPath}`);
  }
}
