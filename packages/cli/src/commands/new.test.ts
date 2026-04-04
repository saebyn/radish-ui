import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, rmSync, existsSync, readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { newCommand } from "./new.js";

/**
 * Creates a minimal registry fixture at the given directory so that the new
 * command can copy components.
 */
function createRegistryFixture(dir: string): void {
  mkdirSync(join(dir, "src", "layout"), { recursive: true });
  mkdirSync(join(dir, "src", "list"), { recursive: true });
  mkdirSync(join(dir, "src", "field"), { recursive: true });

  writeFileSync(
    join(dir, "registry.json"),
    JSON.stringify({
      components: [
        {
          name: "layout",
          files: ["src/layout/layout.tsx", "src/layout/sidebar.tsx", "src/layout/menu.tsx"],
          dependencies: ["@radish-ui/core", "react-icons"],
        },
        {
          name: "datagrid",
          files: ["src/list/datagrid.tsx"],
          dependencies: ["@radish-ui/core"],
        },
        {
          name: "list-view",
          files: ["src/list/list-view.tsx"],
          dependencies: ["@radish-ui/core"],
        },
        {
          name: "text-field",
          files: ["src/field/text-field.tsx"],
          dependencies: ["@radish-ui/core"],
        },
      ],
    }),
  );

  writeFileSync(
    join(dir, "src", "layout", "layout.tsx"),
    `export function Layout() { return null; }`,
  );
  writeFileSync(
    join(dir, "src", "layout", "sidebar.tsx"),
    `export function Sidebar() { return null; }`,
  );
  writeFileSync(join(dir, "src", "layout", "menu.tsx"), `export function Menu() { return null; }`);
  writeFileSync(
    join(dir, "src", "list", "datagrid.tsx"),
    `export function Datagrid() { return null; }`,
  );
  writeFileSync(
    join(dir, "src", "list", "list-view.tsx"),
    `export function ListView() { return null; }`,
  );
  writeFileSync(
    join(dir, "src", "field", "text-field.tsx"),
    `export function TextField() { return null; }`,
  );
}

describe("newCommand", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), "radish-new-test-"));
  });

  afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  it("creates a project directory with all required files (--yes, no registry)", async () => {
    await newCommand("test-app", { yes: true, cwd: tmpDir });

    const projectDir = join(tmpDir, "test-app");
    expect(existsSync(projectDir)).toBe(true);
    expect(existsSync(join(projectDir, "package.json"))).toBe(true);
    expect(existsSync(join(projectDir, "tsconfig.json"))).toBe(true);
    expect(existsSync(join(projectDir, "vite.config.ts"))).toBe(true);
    expect(existsSync(join(projectDir, "tailwind.config.ts"))).toBe(true);
    expect(existsSync(join(projectDir, "postcss.config.js"))).toBe(true);
    expect(existsSync(join(projectDir, "index.html"))).toBe(true);
    expect(existsSync(join(projectDir, "src", "main.tsx"))).toBe(true);
    expect(existsSync(join(projectDir, "src", "App.tsx"))).toBe(true);
    expect(existsSync(join(projectDir, "src", "index.css"))).toBe(true);
    expect(existsSync(join(projectDir, "src", "vite-env.d.ts"))).toBe(true);
    expect(existsSync(join(projectDir, "radish.json"))).toBe(true);
    expect(existsSync(join(projectDir, "README.md"))).toBe(true);
  });

  it("generates valid package.json with the project name", async () => {
    await newCommand("my-project", { yes: true, cwd: tmpDir });

    const pkgJson = JSON.parse(
      readFileSync(join(tmpDir, "my-project", "package.json"), "utf-8"),
    ) as { name: string; scripts: Record<string, string> };
    expect(pkgJson.name).toBe("my-project");
    expect(pkgJson.scripts.dev).toBe("vite");
    expect(pkgJson.scripts.build).toContain("tsc");
  });

  it("uses directory basename as project name by default", async () => {
    await newCommand("my-dir", { yes: true, cwd: tmpDir });

    const pkgJson = JSON.parse(readFileSync(join(tmpDir, "my-dir", "package.json"), "utf-8")) as {
      name: string;
    };
    expect(pkgJson.name).toBe("my-dir");
  });

  it("uses an explicit project name that differs from the directory name", async () => {
    await newCommand("my-dir", { yes: true, cwd: tmpDir, projectName: "custom-name" });

    const projectDir = join(tmpDir, "my-dir");
    expect(existsSync(projectDir)).toBe(true);
    const pkgJson = JSON.parse(readFileSync(join(projectDir, "package.json"), "utf-8")) as {
      name: string;
    };
    expect(pkgJson.name).toBe("custom-name");
    const appTsx = readFileSync(join(projectDir, "src", "App.tsx"), "utf-8");
    expect(appTsx).toContain(`title="custom-name"`);
    const html = readFileSync(join(projectDir, "index.html"), "utf-8");
    expect(html).toContain("<title>custom-name</title>");
  });

  it("includes ra-data-json-server by default (JSON Server provider)", async () => {
    await newCommand("json-app", { yes: true, cwd: tmpDir });

    const pkgJson = JSON.parse(readFileSync(join(tmpDir, "json-app", "package.json"), "utf-8")) as {
      dependencies: Record<string, string>;
    };
    expect(pkgJson.dependencies["ra-data-json-server"]).toBeDefined();
  });

  it("generates index.html with the project name as title", async () => {
    await newCommand("my-title-app", { yes: true, cwd: tmpDir });

    const html = readFileSync(join(tmpDir, "my-title-app", "index.html"), "utf-8");
    expect(html).toContain("<title>my-title-app</title>");
  });

  it("generates tailwind-based index.css", async () => {
    await newCommand("css-app", { yes: true, cwd: tmpDir });

    const css = readFileSync(join(tmpDir, "css-app", "src", "index.css"), "utf-8");
    expect(css).toContain("@tailwind base");
    expect(css).toContain("@tailwind components");
    expect(css).toContain("@tailwind utilities");
  });

  it("creates radish.json with remote registry URL when no --registry given", async () => {
    await newCommand("remote-app", { yes: true, cwd: tmpDir });

    const config = JSON.parse(readFileSync(join(tmpDir, "remote-app", "radish.json"), "utf-8")) as {
      registry: string;
      outputDir: string;
    };
    expect(config.registry).toBe(
      "https://raw.githubusercontent.com/saebyn/radish-ui/main/packages/registry",
    );
    expect(config.outputDir).toBe("src/components");
  });

  it("creates radish.lock.json (empty) when no registry provided", async () => {
    await newCommand("lock-app", { yes: true, cwd: tmpDir });

    const lock = JSON.parse(
      readFileSync(join(tmpDir, "lock-app", "radish.lock.json"), "utf-8"),
    ) as { components: Record<string, unknown> };
    expect(lock.components).toEqual({});
  });

  it("copies component files when --registry is provided", async () => {
    const registryDir = join(tmpDir, "registry");
    mkdirSync(registryDir);
    createRegistryFixture(registryDir);

    await newCommand("with-components", { yes: true, cwd: tmpDir, registry: registryDir });

    const projectDir = join(tmpDir, "with-components");
    expect(existsSync(join(projectDir, "src", "components", "layout", "layout.tsx"))).toBe(true);
    expect(existsSync(join(projectDir, "src", "components", "list", "datagrid.tsx"))).toBe(true);
    expect(existsSync(join(projectDir, "src", "components", "list", "list-view.tsx"))).toBe(true);
    expect(existsSync(join(projectDir, "src", "components", "field", "text-field.tsx"))).toBe(true);
  });

  it("creates radish.lock.json with component hashes when registry is provided", async () => {
    const registryDir = join(tmpDir, "registry");
    mkdirSync(registryDir);
    createRegistryFixture(registryDir);

    await newCommand("locked-app", { yes: true, cwd: tmpDir, registry: registryDir });

    const lock = JSON.parse(
      readFileSync(join(tmpDir, "locked-app", "radish.lock.json"), "utf-8"),
    ) as { components: Record<string, { files: Record<string, unknown> }> };
    expect(lock.components["layout"]).toBeDefined();
    expect(lock.components["datagrid"]).toBeDefined();
    expect(lock.components["list-view"]).toBeDefined();
    expect(lock.components["text-field"]).toBeDefined();
  });

  it("sets radish.json registry to a relative path when local --registry is provided", async () => {
    const registryDir = join(tmpDir, "registry");
    mkdirSync(registryDir);
    createRegistryFixture(registryDir);

    await newCommand("local-reg-app", { yes: true, cwd: tmpDir, registry: registryDir });

    const config = JSON.parse(
      readFileSync(join(tmpDir, "local-reg-app", "radish.json"), "utf-8"),
    ) as { registry: string };
    // Should be a relative path from the project dir to the registry, not an absolute path
    expect(config.registry).toBe("../registry");
  });

  it("throws when project name is invalid", async () => {
    await expect(
      newCommand("valid-dir", { yes: true, cwd: tmpDir, projectName: "My_Bad_Name!" }),
    ).rejects.toThrow(/Invalid project name/);
  });

  it("throws when directory exists and --yes is set", async () => {
    mkdirSync(join(tmpDir, "existing-project"));
    await expect(newCommand("existing-project", { yes: true, cwd: tmpDir })).rejects.toThrow(
      /already exists/,
    );
  });

  it("generates App.tsx with JSON Server provider import", async () => {
    await newCommand("provider-app", { yes: true, cwd: tmpDir });

    const appTsx = readFileSync(join(tmpDir, "provider-app", "src", "App.tsx"), "utf-8");
    expect(appTsx).toContain("ra-data-json-server");
    expect(appTsx).toContain("jsonplaceholder.typicode.com");
  });

  it("uses the project name as the Admin title in App.tsx", async () => {
    await newCommand("my-cool-app", { yes: true, cwd: tmpDir });

    const appTsx = readFileSync(join(tmpDir, "my-cool-app", "src", "App.tsx"), "utf-8");
    expect(appTsx).toContain(`title="my-cool-app"`);
  });

  it("generates App.tsx importing layout component when layout is selected", async () => {
    const registryDir = join(tmpDir, "registry");
    mkdirSync(registryDir);
    createRegistryFixture(registryDir);

    await newCommand("layout-app", { yes: true, cwd: tmpDir, registry: registryDir });

    const appTsx = readFileSync(join(tmpDir, "layout-app", "src", "App.tsx"), "utf-8");
    expect(appTsx).toContain(`"./components/layout/layout"`);
    expect(appTsx).toContain("Layout");
  });
});
