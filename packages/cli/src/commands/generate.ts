import { existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { validateComponentName } from "../lib/registry.js";
import { writeFileAtomic } from "../lib/fs.js";
import { RadishError } from "../lib/errors.js";
import { buildTokens, renderTemplate } from "../lib/templates.js";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/**
 * All valid registry subfolders. "custom" is the default for new components
 * that don't yet belong to an established domain.
 */
export const VALID_FOLDERS = [
  "button",
  "custom",
  "detail",
  "dialog",
  "error-boundary",
  "field",
  "filter",
  "form",
  "layout",
  "list",
  "notification",
  "reference",
  "skeleton",
] as const;

export type RegistryFolder = (typeof VALID_FOLDERS)[number];

/**
 * Maps registry folder names to the section heading in
 * apps/docs/guide/components.md where the new stub should be inserted.
 */
const FOLDER_TO_SECTION: Record<string, string> = {
  button: "## Buttons",
  detail: "## Show / Detail",
  dialog: "## Utilities",
  "error-boundary": "## Utilities",
  field: "## Fields",
  filter: "## Fields",
  form: "## Forms",
  layout: "## Layout",
  list: "## List & Datagrid",
  notification: "## Utilities",
  reference: "## Fields",
  skeleton: "## Utilities",
  custom: "## Utilities",
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface GenerateOptions {
  /** Registry subfolder to place the component in. Defaults to "custom". */
  folder?: string;
  /** Print what would be done without writing any files. */
  dryRun?: boolean;
  /** Print valid folder names and exit. */
  listFolders?: boolean;
  /** Override the working directory (used in tests). Defaults to process.cwd(). */
  cwd?: string;
  /**
   * Override the templates directory (used in tests to point at src/templates/
   * without a built dist/). Defaults to the dist/templates/ folder resolved
   * via import.meta.url at runtime.
   */
  templatesDir?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Converts a PascalCase component name to kebab-case.
 * e.g. "MyTextField" → "my-text-field"
 */
function toKebabCase(name: string): string {
  return name
    .replace(/([A-Z])/g, (_match, letter, offset) =>
      offset === 0 ? letter.toLowerCase() : `-${letter.toLowerCase()}`,
    )
    .replace(/--+/g, "-");
}

/**
 * Appends a new component stub into the correct section of components.md.
 * If the target section heading is not found, appends at the end of the file.
 */
function appendToComponentsDocs(
  docsPath: string,
  kebabName: string,
  folder: string,
  dryRun: boolean,
): void {
  if (!existsSync(docsPath)) {
    console.warn(`⚠ components.md not found at "${docsPath}" — skipping docs update.`);
    return;
  }

  const stub = [
    "",
    `### \`${kebabName}\``,
    "",
    "TODO: describe this component.",
    "",
    `**Files:** \`${folder}/${kebabName}.tsx\``,
    "",
    "**Dependencies:** `@radish-ui/core`",
    "",
    "```bash",
    `npx @radish-ui/cli add ${kebabName}`,
    "```",
    "",
  ].join("\n");

  if (dryRun) {
    console.log(`  [dry-run] Would append to ${docsPath}:\n${stub}`);
    return;
  }

  const original = readFileSync(docsPath, "utf-8");
  const targetSection = FOLDER_TO_SECTION[folder] ?? null;

  let updated: string;

  if (targetSection !== null && original.includes(targetSection)) {
    // Find the position just before the next `## ` heading after the target
    // section, or at the end of the file if there is none.
    const sectionIdx = original.indexOf(targetSection);
    const nextSectionIdx = original.indexOf("\n## ", sectionIdx + targetSection.length);

    if (nextSectionIdx === -1) {
      // Target section is the last section — append before end of file.
      updated = `${original.trimEnd()}
${stub}`;
    } else {
      // Insert stub just before the next section heading.
      const before = original.slice(0, nextSectionIdx).trimEnd();
      const after = original.slice(nextSectionIdx).replace(/^[\n]*---[\n]*/, "");
      updated = `${before}
${stub}
---
${after}`;
    }
  } else {
    // Section not found — safely append at the end.
    updated = `${original.trimEnd()}
${stub}`;
  }

  writeFileAtomic(resolve(docsPath, ".."), docsPath, updated, true);
}

// ---------------------------------------------------------------------------
// Main command
// ---------------------------------------------------------------------------

export async function generateCommand(
  componentName: string,
  options: GenerateOptions,
): Promise<void> {
  const cwd = options.cwd ?? process.cwd();
  const folder = options.folder ?? "custom";
  const dryRun = options.dryRun ?? false;

  // --list-folders: print valid folders and exit
  if (options.listFolders) {
    console.log("Valid registry folders:\n");
    for (const f of VALID_FOLDERS) {
      console.log(`  ${f}${f === "custom" ? "  (default)" : ""}`);
    }
    return;
  }

  // Validate folder
  if (!(VALID_FOLDERS as readonly string[]).includes(folder)) {
    throw new RadishError(
      `Unknown folder "${folder}". Valid folders: ${VALID_FOLDERS.join(", ")}\nRun with --list-folders to see all options.`,
    );
  }

  // Validate component name (PascalCase input → derive kebab)
  const kebabName = toKebabCase(componentName);
  validateComponentName(kebabName);

  // Resolve registry paths
  const registryRoot = resolve(cwd, "packages", "registry");
  const registryJsonPath = resolve(registryRoot, "registry.json");

  if (!existsSync(registryJsonPath)) {
    throw new RadishError(
      `Registry not found at "${registryJsonPath}".\nRun this command from the radish-ui monorepo root.`,
    );
  }

  // Check for duplicate name
  const registryRaw = readFileSync(registryJsonPath, "utf-8");
  const registry = JSON.parse(registryRaw) as { components: { name: string }[] };
  if (registry.components.some((c) => c.name === kebabName)) {
    throw new RadishError(
      `Component "${kebabName}" already exists in registry.json. Choose a different name.`,
    );
  }

  // Build token map and file paths
  const tokens = buildTokens(componentName, kebabName, folder);
  const folderDir = resolve(registryRoot, "src", folder);
  const componentFile = resolve(folderDir, `${kebabName}.tsx`);
  const storiesFile = resolve(folderDir, `${kebabName}.stories.tsx`);
  const testFile = resolve(folderDir, `${kebabName}.test.tsx`);

  // Check for existing files
  for (const filePath of [componentFile, storiesFile, testFile]) {
    if (existsSync(filePath)) {
      throw new RadishError(
        `File already exists: "${filePath}".\nRemove it manually before running generate again.`,
      );
    }
  }

  const { templatesDir } = options;

  if (dryRun) {
    console.log(`\n[dry-run] Would create the following files:\n`);
    console.log(`  ${componentFile}`);
    console.log(`  ${storiesFile}`);
    console.log(`  ${testFile}`);
    console.log(`\n[dry-run] Would add to registry.json:\n`);
    console.log(
      `  { name: "${kebabName}", files: ["src/${folder}/${kebabName}.tsx"], dependencies: ["@radish-ui/core"] }`,
    );
    const docsPath = resolve(cwd, "apps", "docs", "guide", "components.md");
    appendToComponentsDocs(docsPath, kebabName, folder, true);
    return;
  }

  // Write component, stories, and test files
  const componentContent = renderTemplate("component.tsx.tmpl", tokens, templatesDir);
  const storiesContent = renderTemplate("component.stories.tsx.tmpl", tokens, templatesDir);
  const testContent = renderTemplate("component.test.tsx.tmpl", tokens, templatesDir);

  writeFileAtomic(folderDir, componentFile, componentContent, false);
  console.log(`✓ Created ${componentFile}`);

  writeFileAtomic(folderDir, storiesFile, storiesContent, false);
  console.log(`✓ Created ${storiesFile}`);

  writeFileAtomic(folderDir, testFile, testContent, false);
  console.log(`✓ Created ${testFile}`);

  // Update registry.json
  const newEntry = {
    name: kebabName,
    files: [`src/${folder}/${kebabName}.tsx`],
    dependencies: ["@radish-ui/core"],
  };
  registry.components = registry.components
    .concat([newEntry])
    .toSorted((a, b) => a.name.localeCompare(b.name));
  writeFileAtomic(
    registryRoot,
    registryJsonPath,
    `${JSON.stringify(registry, null, 2)}
`,
    true,
  );
  console.log(`✓ Updated registry.json (added "${kebabName}")`);

  // Update components.md
  const docsPath = resolve(cwd, "apps", "docs", "guide", "components.md");
  appendToComponentsDocs(docsPath, kebabName, folder, false);
  console.log(`✓ Updated components.md`);

  // Run validate-registry
  console.log(`\nRunning pnpm validate-registry…`);
  const result = spawnSync("pnpm", ["validate-registry"], {
    cwd,
    stdio: "inherit",
    shell: false,
  });
  if (result.status !== 0) {
    console.warn(
      `⚠ validate-registry exited with status ${result.status ?? "unknown"}. Review the output above.`,
    );
  }

  // Next steps
  console.log(`
✓ Component "${kebabName}" scaffolded successfully.

Next steps:
  1. Implement the component in:
       packages/registry/src/${folder}/${kebabName}.tsx
  2. Add the component to the demo app, then wire it in:
       pnpm --filter @radish-ui/demo radish add ${kebabName}
       apps/demo/src/
  3. Check prop-parity if there is an MUI equivalent:
       packages/registry/src/prop-parity/expected-props.ts
  4. Open Storybook to verify the story renders:
       pnpm --filter @radish-ui/registry storybook
`);
}
