#!/usr/bin/env node
/**
 * Validates the integrity of registry.json and radish.lock.json.
 *
 * Checks performed on registry.json:
 *   - Valid JSON and expected schema (components array)
 *   - No duplicate component names
 *   - File paths start with "src/" and contain no path traversal
 *   - Referenced files exist on disk relative to the registry package
 *   - Dependency names are valid npm package names
 *
 * Checks performed on radish.lock.json (if present):
 *   - Valid JSON
 *   - Top-level "components" value is a non-array object
 *   - Every component name in the lockfile exists in registry.json
 */

import { existsSync, readFileSync, statSync } from "node:fs";
import { resolve, posix } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const ROOT_DIR = resolve(__dirname, "..");
const REGISTRY_DIR = resolve(ROOT_DIR, "packages", "registry");
const REGISTRY_JSON_PATH = resolve(REGISTRY_DIR, "registry.json");
const LOCKFILE_PATH = resolve(ROOT_DIR, "apps", "demo", "radish.lock.json");

// Mirrors the rules in packages/cli/src/lib/registry.ts
const COMPONENT_NAME_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)*$/;
const NPM_PACKAGE_NAME_RE = /^(?:@[a-z0-9][a-z0-9._-]*\/)?[a-z0-9][a-z0-9._-]{0,213}$/;

let errors = 0;

function error(msg) {
  console.error(`  ✗ ${msg}`);
  errors++;
}

function ok(msg) {
  console.log(`  ✓ ${msg}`);
}

// ---------------------------------------------------------------------------
// Validate registry.json
// ---------------------------------------------------------------------------

console.log(`\nValidating registry.json (${REGISTRY_JSON_PATH})\n`);

if (!existsSync(REGISTRY_JSON_PATH)) {
  error(`registry.json not found at "${REGISTRY_JSON_PATH}"`);
  process.exit(1);
}

let registry;
try {
  registry = JSON.parse(readFileSync(REGISTRY_JSON_PATH, "utf-8"));
} catch {
  error("registry.json is not valid JSON");
  process.exit(1);
}

if (!registry || !Array.isArray(registry.components)) {
  error('registry.json must have a "components" array at the top level');
  process.exit(1);
}

ok("registry.json is valid JSON with a components array");

const seenNames = new Set();

for (const [index, component] of registry.components.entries()) {
  const componentIndexPrefix = `component at index ${index}`;

  if (component === null || typeof component !== "object") {
    error(`${componentIndexPrefix}: must be an object`);
    continue;
  }

  const prefix = `component "${component.name ?? "<unnamed>"}"`;

  // --- name ---
  if (typeof component.name !== "string" || component.name.trim() === "") {
    error(`${prefix}: missing or empty "name" field`);
    continue;
  }

  if (!COMPONENT_NAME_RE.test(component.name)) {
    error(
      `${prefix}: name must be lowercase alphanumeric words separated by hyphens (optionally grouped with slashes)`,
    );
  }

  if (seenNames.has(component.name)) {
    error(`${prefix}: duplicate component name`);
  } else {
    seenNames.add(component.name);
  }

  // --- files ---
  if (!Array.isArray(component.files)) {
    error(`${prefix}: "files" must be an array`);
  } else {
    const seenFiles = new Set();
    for (const file of component.files) {
      if (typeof file !== "string") {
        error(`${prefix}: file entry is not a string: ${JSON.stringify(file)}`);
        continue;
      }

      // Duplicate file within the same component
      if (seenFiles.has(file)) {
        error(`${prefix}: duplicate file entry "${file}"`);
      } else {
        seenFiles.add(file);
      }

      // Path must start with "src/"
      if (!file.startsWith("src/")) {
        error(`${prefix}: file "${file}" must start with "src/"`);
        continue;
      }

      // No path traversal, null bytes, or Windows-style paths
      if (file.includes("\0") || file.includes("\\") || /^[A-Za-z]:/.test(file)) {
        error(`${prefix}: file "${file}" contains invalid characters`);
        continue;
      }
      const rel = posix.normalize(file.slice(4));
      if (posix.isAbsolute(rel) || rel.startsWith("..")) {
        error(`${prefix}: file "${file}" contains path traversal`);
        continue;
      }

      // File must exist on disk and be a regular file (not a directory or symlink)
      const absPath = resolve(REGISTRY_DIR, file);
      try {
        const stat = statSync(absPath);
        if (!stat.isFile()) {
          error(`${prefix}: referenced path is not a regular file: "${absPath}"`);
        }
      } catch {
        error(`${prefix}: referenced file does not exist: "${absPath}"`);
      }
    }
  }

  // --- dependencies ---
  // Must be present and be an array, matching the CLI RegistryComponentSchema requirement.
  if (!Object.prototype.hasOwnProperty.call(component, "dependencies")) {
    error(`${prefix}: missing "dependencies" field`);
  } else if (!Array.isArray(component.dependencies)) {
    error(`${prefix}: "dependencies" must be an array`);
  } else {
    const seenDeps = new Set();
    for (const dep of component.dependencies) {
      if (typeof dep !== "string") {
        error(`${prefix}: dependency entry is not a string: ${JSON.stringify(dep)}`);
        continue;
      }
      if (!NPM_PACKAGE_NAME_RE.test(dep)) {
        error(`${prefix}: dependency "${dep}" is not a valid npm package name`);
      }
      if (seenDeps.has(dep)) {
        error(`${prefix}: duplicate dependency "${dep}"`);
      } else {
        seenDeps.add(dep);
      }
    }
  }
}

if (errors === 0) {
  ok(`All ${registry.components.length} component(s) passed validation`);
}

// ---------------------------------------------------------------------------
// Validate radish.lock.json (optional — skip if not present)
// ---------------------------------------------------------------------------

if (!existsSync(LOCKFILE_PATH)) {
  console.log(`\nNo lockfile found at "${LOCKFILE_PATH}" — skipping lockfile checks.\n`);
} else {
  console.log(`\nValidating radish.lock.json (${LOCKFILE_PATH})\n`);

  let lockfile;
  try {
    lockfile = JSON.parse(readFileSync(LOCKFILE_PATH, "utf-8"));
  } catch {
    error("radish.lock.json is not valid JSON");
    lockfile = null;
  }

  if (lockfile !== null) {
    if (
      !lockfile ||
      typeof lockfile.components !== "object" ||
      lockfile.components === null ||
      Array.isArray(lockfile.components)
    ) {
      error('radish.lock.json must have a "components" object at the top level');
    } else {
      ok("radish.lock.json is valid JSON with a components object");

      const registryNames = seenNames;

      for (const componentName of Object.keys(lockfile.components)) {
        if (!registryNames.has(componentName)) {
          error(
            `radish.lock.json references component "${componentName}" which does not exist in registry.json`,
          );
        }
      }

      if (errors === 0) {
        ok(`All lockfile component references are present in registry.json`);
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Final result
// ---------------------------------------------------------------------------

if (errors > 0) {
  console.error(`\n✗ Validation failed with ${errors} error(s).\n`);
  process.exit(1);
} else {
  console.log(`\n✓ All registry checks passed.\n`);
}
