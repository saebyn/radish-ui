/**
 * Copies registry files from packages/registry into apps/docs/public/registry
 * so VitePress can serve them as static assets at /registry/...
 */

import { cpSync, mkdirSync, copyFileSync } from "node:fs";
import { resolve, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const repoRoot = resolve(__dirname, "../../..");
const registryPkg = resolve(repoRoot, "packages/registry");
const publicRegistry = resolve(__dirname, "../public/registry");

// Ensure the output directory exists
mkdirSync(publicRegistry, { recursive: true });

// Copy registry.json
copyFileSync(resolve(registryPkg, "registry.json"), resolve(publicRegistry, "registry.json"));

// Copy all component source files (src/) so the CLI can fetch them
cpSync(resolve(registryPkg, "src"), resolve(publicRegistry, "src"), {
  recursive: true,
  filter: (src) => {
    const name = basename(src);
    // Skip test and story files — only ship the component sources.
    // Match on the exact file suffixes using a regex to avoid false positives.
    if (/\.(test|stories)\.[jt]sx?$/.test(name)) return false;
    // Skip the storybook CSS and test setup entry point
    if (name === "storybook.css" || name === "test-setup.ts") return false;
    return true;
  },
});

console.log("Registry files copied to public/registry/");
