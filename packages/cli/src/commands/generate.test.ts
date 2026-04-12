import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { mkdtempSync, rmSync, existsSync, readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { generateCommand } from "./generate.js";

vi.mock("node:child_process", () => ({
  spawnSync: vi.fn(() => ({
    status: 0,
    pid: 1,
    output: [],
    stdout: Buffer.from(""),
    stderr: Buffer.from(""),
    signal: null,
  })),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * The real src/templates/ directory — used as the templatesDir override so
 * tests don't need a built dist/ folder.
 */
const TEMPLATES_DIR = resolve(__dirname, "..", "..", "src", "templates");

/**
 * Creates a minimal monorepo-like fixture under `tmpDir`:
 *   <tmpDir>/
 *     packages/registry/
 *       registry.json     (with one existing component)
 *       src/
 *         <all valid folders>/
 *     apps/docs/guide/
 *       components.md
 */
function createFixture(tmpDir: string): void {
  const folders = [
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
  ];

  for (const folder of folders) {
    mkdirSync(join(tmpDir, "packages", "registry", "src", folder), { recursive: true });
  }

  writeFileSync(
    join(tmpDir, "packages", "registry", "registry.json"),
    `${JSON.stringify(
      {
        components: [
          {
            name: "skeleton",
            files: ["src/skeleton/skeleton.tsx"],
            dependencies: ["@radish-ui/core"],
          },
        ],
      },
      null,
      2,
    )}
`,
  );

  mkdirSync(join(tmpDir, "apps", "docs", "guide"), { recursive: true });
  writeFileSync(
    join(tmpDir, "apps", "docs", "guide", "components.md"),
    `# Available Components\n\n---\n\n## Fields\n\n### \`text-field\`\n\nA text field.\n\n**Files:** \`field/text-field.tsx\`\n\n**Dependencies:** \`@radish-ui/core\`\n\n\`\`\`bash\nnpx @radish-ui/cli add text-field\n\`\`\`\n\n---\n\n## Utilities\n\n### \`skeleton\`\n\nA skeleton loader.\n\n**Files:** \`skeleton/skeleton.tsx\`\n\n**Dependencies:** \`@radish-ui/core\`\n\n\`\`\`bash\nnpx @radish-ui/cli add skeleton\n\`\`\`\n`,
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

let tmpDir: string;

beforeEach(async () => {
  tmpDir = mkdtempSync(join(tmpdir(), "radish-generate-test-"));
  createFixture(tmpDir);
  // Reset the spawnSync mock before each test
  const { spawnSync } = await import("node:child_process");
  vi.mocked(spawnSync).mockClear();
});

afterEach(() => {
  rmSync(tmpDir, { recursive: true, force: true });
});

describe("generateCommand — happy path", () => {
  it("creates all three files in the correct folder", async () => {
    await generateCommand("MyField", {
      folder: "field",
      cwd: tmpDir,
      templatesDir: TEMPLATES_DIR,
    });

    const fieldDir = join(tmpDir, "packages", "registry", "src", "field");
    expect(existsSync(join(fieldDir, "my-field.tsx"))).toBe(true);
    expect(existsSync(join(fieldDir, "my-field.stories.tsx"))).toBe(true);
    expect(existsSync(join(fieldDir, "my-field.test.tsx"))).toBe(true);
  });

  it("component file contains the PascalCase name and kebab import", async () => {
    await generateCommand("MyField", {
      folder: "field",
      cwd: tmpDir,
      templatesDir: TEMPLATES_DIR,
    });

    const content = readFileSync(
      join(tmpDir, "packages", "registry", "src", "field", "my-field.tsx"),
      "utf-8",
    );
    expect(content).toContain("MyField");
    expect(content).toContain("export const MyField");
  });

  it("stories file contains correct storybook title", async () => {
    await generateCommand("MyField", {
      folder: "field",
      cwd: tmpDir,
      templatesDir: TEMPLATES_DIR,
    });

    const content = readFileSync(
      join(tmpDir, "packages", "registry", "src", "field", "my-field.stories.tsx"),
      "utf-8",
    );
    expect(content).toContain('title: "Field/MyField"');
    expect(content).toContain('from "./my-field"');
  });

  it("test file contains the component name", async () => {
    await generateCommand("MyField", {
      folder: "field",
      cwd: tmpDir,
      templatesDir: TEMPLATES_DIR,
    });

    const content = readFileSync(
      join(tmpDir, "packages", "registry", "src", "field", "my-field.test.tsx"),
      "utf-8",
    );
    expect(content).toContain("MyField");
    expect(content).toContain('from "./my-field"');
  });

  it("updates registry.json with the new entry", async () => {
    await generateCommand("MyField", {
      folder: "field",
      cwd: tmpDir,
      templatesDir: TEMPLATES_DIR,
    });

    const registry = JSON.parse(
      readFileSync(join(tmpDir, "packages", "registry", "registry.json"), "utf-8"),
    ) as { components: { name: string; files: string[]; dependencies: string[] }[] };

    const entry = registry.components.find((c) => c.name === "my-field");
    expect(entry).toBeDefined();
    expect(entry?.files).toEqual(["src/field/my-field.tsx"]);
    expect(entry?.dependencies).toEqual(["@radish-ui/core"]);
  });

  it("sorts registry.json components alphabetically", async () => {
    await generateCommand("AaaComponent", {
      folder: "field",
      cwd: tmpDir,
      templatesDir: TEMPLATES_DIR,
    });

    const registry = JSON.parse(
      readFileSync(join(tmpDir, "packages", "registry", "registry.json"), "utf-8"),
    ) as { components: { name: string }[] };

    const names = registry.components.map((c) => c.name);
    const sorted = names.toSorted((a, b) => a.localeCompare(b));
    expect(names).toEqual(sorted);
  });

  it("appends a stub to components.md in the correct section", async () => {
    await generateCommand("MyField", {
      folder: "field",
      cwd: tmpDir,
      templatesDir: TEMPLATES_DIR,
    });

    const docs = readFileSync(join(tmpDir, "apps", "docs", "guide", "components.md"), "utf-8");
    expect(docs).toContain("### `my-field`");
    expect(docs).toContain("npx @radish-ui/cli add my-field");
  });

  it("calls spawnSync to run validate-registry", async () => {
    const { spawnSync } = await import("node:child_process");
    await generateCommand("MyField", {
      folder: "field",
      cwd: tmpDir,
      templatesDir: TEMPLATES_DIR,
    });

    expect(vi.mocked(spawnSync)).toHaveBeenCalledWith(
      "pnpm",
      ["validate-registry"],
      expect.objectContaining({ cwd: tmpDir }),
    );
  });

  it("defaults folder to 'custom' when not specified", async () => {
    await generateCommand("MyWidget", {
      cwd: tmpDir,
      templatesDir: TEMPLATES_DIR,
    });

    expect(existsSync(join(tmpDir, "packages", "registry", "src", "custom", "my-widget.tsx"))).toBe(
      true,
    );
  });
});

describe("generateCommand — dry-run", () => {
  it("does not create any files", async () => {
    await generateCommand("DryField", {
      folder: "field",
      dryRun: true,
      cwd: tmpDir,
      templatesDir: TEMPLATES_DIR,
    });

    const fieldDir = join(tmpDir, "packages", "registry", "src", "field");
    expect(existsSync(join(fieldDir, "dry-field.tsx"))).toBe(false);
    expect(existsSync(join(fieldDir, "dry-field.stories.tsx"))).toBe(false);
    expect(existsSync(join(fieldDir, "dry-field.test.tsx"))).toBe(false);
  });

  it("does not update registry.json", async () => {
    const before = readFileSync(join(tmpDir, "packages", "registry", "registry.json"), "utf-8");
    await generateCommand("DryField", {
      folder: "field",
      dryRun: true,
      cwd: tmpDir,
      templatesDir: TEMPLATES_DIR,
    });
    const after = readFileSync(join(tmpDir, "packages", "registry", "registry.json"), "utf-8");
    expect(after).toBe(before);
  });

  it("does not run validate-registry", async () => {
    const { spawnSync } = await import("node:child_process");
    await generateCommand("DryField", {
      folder: "field",
      dryRun: true,
      cwd: tmpDir,
      templatesDir: TEMPLATES_DIR,
    });
    expect(vi.mocked(spawnSync)).not.toHaveBeenCalled();
  });
});

describe("generateCommand — error cases", () => {
  it("throws when packages/registry/registry.json does not exist", async () => {
    rmSync(join(tmpDir, "packages", "registry", "registry.json"));
    await expect(
      generateCommand("MyField", { folder: "field", cwd: tmpDir, templatesDir: TEMPLATES_DIR }),
    ).rejects.toThrow(/Registry not found/);
  });

  it("throws when the component name already exists in registry.json", async () => {
    await expect(
      generateCommand("Skeleton", { folder: "skeleton", cwd: tmpDir, templatesDir: TEMPLATES_DIR }),
    ).rejects.toThrow(/already exists in registry/);
  });

  it("throws when an unknown folder is specified", async () => {
    await expect(
      generateCommand("MyField", {
        folder: "nonexistent-folder",
        cwd: tmpDir,
        templatesDir: TEMPLATES_DIR,
      }),
    ).rejects.toThrow(/Unknown folder/);
  });

  it("throws when any of the target files already exist", async () => {
    const fieldDir = join(tmpDir, "packages", "registry", "src", "field");
    writeFileSync(join(fieldDir, "my-field.tsx"), "// existing");
    await expect(
      generateCommand("MyField", { folder: "field", cwd: tmpDir, templatesDir: TEMPLATES_DIR }),
    ).rejects.toThrow(/already exists/);
  });
});

describe("generateCommand — --list-folders", () => {
  it("returns without writing files when listFolders is true", async () => {
    await generateCommand("MyField", {
      listFolders: true,
      cwd: tmpDir,
      templatesDir: TEMPLATES_DIR,
    });
    // No files should have been created
    expect(existsSync(join(tmpDir, "packages", "registry", "src", "field", "my-field.tsx"))).toBe(
      false,
    );
  });
});
