import { describe, it, expect, beforeEach, afterEach, vi, type MockInstance } from "vitest";
import { mkdtempSync, rmSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { listCommand } from "./list.js";

/**
 * Creates a minimal registry fixture with two components:
 *   - "skeleton"  →  src/skeleton/skeleton.tsx
 *   - "datagrid"  →  src/list/datagrid.tsx
 */
function createRegistryFixture(dir: string): void {
  mkdirSync(join(dir, "src", "list"), { recursive: true });
  mkdirSync(join(dir, "src", "skeleton"), { recursive: true });

  writeFileSync(
    join(dir, "registry.json"),
    JSON.stringify({
      components: [
        {
          name: "skeleton",
          files: ["src/skeleton/skeleton.tsx"],
          dependencies: [],
        },
        {
          name: "datagrid",
          files: ["src/list/datagrid.tsx"],
          dependencies: [],
        },
      ],
    }),
  );

  writeFileSync(
    join(dir, "src", "skeleton", "skeleton.tsx"),
    `export function Skeleton() { return null; }`,
  );
  writeFileSync(
    join(dir, "src", "list", "datagrid.tsx"),
    `export function Datagrid() { return null; }`,
  );
}

describe("listCommand", () => {
  let tmpDir: string;
  let registryDir: string;
  let projectDir: string;
  let consoleSpy: MockInstance;

  beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), "radish-list-test-"));
    registryDir = join(tmpDir, "registry");
    projectDir = join(tmpDir, "project");
    mkdirSync(registryDir);
    mkdirSync(projectDir);
    createRegistryFixture(registryDir);
    consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    rmSync(tmpDir, { recursive: true, force: true });
  });

  it("lists all components as available when none are installed", async () => {
    await listCommand({
      registry: registryDir,
      cwd: projectDir,
    });

    const output = consoleSpy.mock.calls.map((c) => c[0] as string).join("\n");
    expect(output).toContain("skeleton");
    expect(output).toContain("datagrid");
    expect(output).toContain("available");
    // No component line should have the "installed" status (only "0 installed" in header)
    const lines = consoleSpy.mock.calls.map((c) => c[0] as string);
    const componentLines = lines.filter((l) => l.includes("skeleton") || l.includes("datagrid"));
    expect(componentLines.every((l) => !l.includes("installed"))).toBe(true);
  });

  it("marks installed components with installed status", async () => {
    // Simulate skeleton being installed by writing a lockfile
    writeFileSync(
      join(projectDir, "radish.lock.json"),
      JSON.stringify({
        components: {
          skeleton: {
            files: {
              "skeleton/skeleton.tsx": {
                registryHash: `sha256-${"a".repeat(64)}`,
                localHash: `sha256-${"a".repeat(64)}`,
              },
            },
          },
        },
      }),
    );

    await listCommand({
      registry: registryDir,
      cwd: projectDir,
    });

    const output = consoleSpy.mock.calls.map((c) => c[0] as string).join("\n");
    expect(output).toContain("installed");
    expect(output).toContain("available");
    // skeleton should be marked installed, datagrid should be available
    const lines = consoleSpy.mock.calls.map((c) => c[0] as string);
    const skeletonLine = lines.find((l) => l.includes("skeleton") && !l.includes("─"));
    const datagridLine = lines.find((l) => l.includes("datagrid"));
    expect(skeletonLine).toContain("installed");
    expect(datagridLine).toContain("available");
  });

  it("shows all components as installed when all are in lockfile", async () => {
    writeFileSync(
      join(projectDir, "radish.lock.json"),
      JSON.stringify({
        components: {
          skeleton: {
            files: {
              "skeleton/skeleton.tsx": {
                registryHash: `sha256-${"a".repeat(64)}`,
                localHash: `sha256-${"a".repeat(64)}`,
              },
            },
          },
          datagrid: {
            files: {
              "list/datagrid.tsx": {
                registryHash: `sha256-${"b".repeat(64)}`,
                localHash: `sha256-${"b".repeat(64)}`,
              },
            },
          },
        },
      }),
    );

    await listCommand({
      registry: registryDir,
      cwd: projectDir,
    });

    const output = consoleSpy.mock.calls.map((c) => c[0] as string).join("\n");
    expect(output).toContain("2 installed");
  });

  it("prints a message when registry has no components", async () => {
    // Overwrite registry.json with empty components
    writeFileSync(join(registryDir, "registry.json"), JSON.stringify({ components: [] }));

    await listCommand({
      registry: registryDir,
      cwd: projectDir,
    });

    const output = consoleSpy.mock.calls.map((c) => c[0] as string).join("\n");
    expect(output).toContain("No components found in registry");
  });

  it("shows the correct installed count in the header", async () => {
    writeFileSync(
      join(projectDir, "radish.lock.json"),
      JSON.stringify({
        components: {
          skeleton: {
            files: {
              "skeleton/skeleton.tsx": {
                registryHash: `sha256-${"a".repeat(64)}`,
                localHash: `sha256-${"a".repeat(64)}`,
              },
            },
          },
        },
      }),
    );

    await listCommand({
      registry: registryDir,
      cwd: projectDir,
    });

    const output = consoleSpy.mock.calls.map((c) => c[0] as string).join("\n");
    expect(output).toContain("2 available");
    expect(output).toContain("1 installed");
  });
});
