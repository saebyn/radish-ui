import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, rmSync, existsSync, readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { addCommand } from "./add.js";

type LockFile = {
  components: Record<
    string,
    { files: Record<string, { registryHash: string; localHash: string }> }
  >;
};

/**
 * Creates a minimal registry fixture with two components:
 *   - "skeleton"  →  src/skeleton/skeleton.tsx
 *   - "datagrid"  →  src/list/datagrid.tsx + src/skeleton/skeleton.tsx (shared)
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
          dependencies: ["@radish-ui/core"],
        },
        {
          name: "datagrid",
          files: ["src/list/datagrid.tsx", "src/skeleton/skeleton.tsx"],
          dependencies: ["@radish-ui/core"],
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

describe("addCommand", () => {
  let tmpDir: string;
  let registryDir: string;
  let projectDir: string;

  beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), "radish-add-test-"));
    registryDir = join(tmpDir, "registry");
    projectDir = join(tmpDir, "project");
    mkdirSync(registryDir);
    mkdirSync(projectDir);
    createRegistryFixture(registryDir);
  });

  afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  it("writes component files and records them in the lockfile", async () => {
    await addCommand(["skeleton"], {
      registry: registryDir,
      target: "components",
      cwd: projectDir,
    });

    expect(existsSync(join(projectDir, "components", "skeleton", "skeleton.tsx"))).toBe(true);

    const lock = JSON.parse(
      readFileSync(join(projectDir, "radish.lock.json"), "utf-8"),
    ) as LockFile;
    expect(lock.components["skeleton"]).toBeDefined();
    const entry = lock.components["skeleton"].files["skeleton/skeleton.tsx"];
    expect(entry).toBeDefined();
    expect(entry.registryHash).toMatch(/^sha256-[0-9a-f]{64}$/);
    expect(entry.localHash).toBe(entry.registryHash);
  });

  it("skips a pre-existing file but still writes the other files", async () => {
    // Pre-install a different version of skeleton
    mkdirSync(join(projectDir, "components", "skeleton"), { recursive: true });
    writeFileSync(
      join(projectDir, "components", "skeleton", "skeleton.tsx"),
      `export function Skeleton() { return "pre-existing"; }`,
    );

    await addCommand(["datagrid"], {
      registry: registryDir,
      target: "components",
      cwd: projectDir,
    });

    // datagrid.tsx should be written
    expect(existsSync(join(projectDir, "components", "list", "datagrid.tsx"))).toBe(true);

    // skeleton.tsx should retain the pre-existing content (not overwritten)
    const skeletonContent = readFileSync(
      join(projectDir, "components", "skeleton", "skeleton.tsx"),
      "utf-8",
    );
    expect(skeletonContent).toContain("pre-existing");
  });

  it("records skipped files in the lockfile with correct hashes", async () => {
    // Pre-install a different version of skeleton
    mkdirSync(join(projectDir, "components", "skeleton"), { recursive: true });
    writeFileSync(
      join(projectDir, "components", "skeleton", "skeleton.tsx"),
      `export function Skeleton() { return "pre-existing"; }`,
    );

    await addCommand(["datagrid"], {
      registry: registryDir,
      target: "components",
      cwd: projectDir,
    });

    const lock = JSON.parse(
      readFileSync(join(projectDir, "radish.lock.json"), "utf-8"),
    ) as LockFile;

    expect(lock.components["datagrid"]).toBeDefined();
    const files = lock.components["datagrid"].files;

    // datagrid.tsx: freshly written — localHash === registryHash
    const datagridEntry = files["list/datagrid.tsx"];
    expect(datagridEntry).toBeDefined();
    expect(datagridEntry.registryHash).toMatch(/^sha256-[0-9a-f]{64}$/);
    expect(datagridEntry.localHash).toBe(datagridEntry.registryHash);

    // skeleton.tsx: skipped — localHash reflects pre-existing content, not registry content
    const skeletonEntry = files["skeleton/skeleton.tsx"];
    expect(skeletonEntry).toBeDefined();
    expect(skeletonEntry.registryHash).toMatch(/^sha256-[0-9a-f]{64}$/);
    expect(skeletonEntry.localHash).toMatch(/^sha256-[0-9a-f]{64}$/);
    // The pre-existing file differs from registry, so hashes should differ
    expect(skeletonEntry.localHash).not.toBe(skeletonEntry.registryHash);
  });

  it("records skipped files with matching hashes when content is identical to registry", async () => {
    // Pre-install skeleton with the exact same content as the registry
    mkdirSync(join(projectDir, "components", "skeleton"), { recursive: true });
    writeFileSync(
      join(projectDir, "components", "skeleton", "skeleton.tsx"),
      `export function Skeleton() { return null; }`, // same as registry
    );

    await addCommand(["datagrid"], {
      registry: registryDir,
      target: "components",
      cwd: projectDir,
    });

    const lock = JSON.parse(
      readFileSync(join(projectDir, "radish.lock.json"), "utf-8"),
    ) as LockFile;

    const skeletonEntry = lock.components["datagrid"].files["skeleton/skeleton.tsx"];
    expect(skeletonEntry).toBeDefined();
    // Content is identical, so localHash === registryHash
    expect(skeletonEntry.localHash).toBe(skeletonEntry.registryHash);
  });

  it("warns and skips a component already in the lockfile without --force", async () => {
    // First install
    await addCommand(["skeleton"], {
      registry: registryDir,
      target: "components",
      cwd: projectDir,
    });

    const lockBefore = readFileSync(join(projectDir, "radish.lock.json"), "utf-8");

    // Second install without --force
    await addCommand(["skeleton"], {
      registry: registryDir,
      target: "components",
      cwd: projectDir,
    });

    const lockAfter = readFileSync(join(projectDir, "radish.lock.json"), "utf-8");
    expect(lockAfter).toBe(lockBefore);
  });

  it("overwrites existing files and updates the lockfile when --force is used", async () => {
    // First install
    await addCommand(["skeleton"], {
      registry: registryDir,
      target: "components",
      cwd: projectDir,
    });

    // Simulate a local modification to skeleton.tsx
    writeFileSync(
      join(projectDir, "components", "skeleton", "skeleton.tsx"),
      `export function Skeleton() { return "modified"; }`,
    );

    // Force re-install
    await addCommand(["skeleton"], {
      registry: registryDir,
      target: "components",
      force: true,
      cwd: projectDir,
    });

    // File should be restored to registry content
    const content = readFileSync(
      join(projectDir, "components", "skeleton", "skeleton.tsx"),
      "utf-8",
    );
    expect(content).toContain("return null");

    // Lockfile should show localHash === registryHash (freshly written)
    const lock = JSON.parse(
      readFileSync(join(projectDir, "radish.lock.json"), "utf-8"),
    ) as LockFile;
    const entry = lock.components["skeleton"].files["skeleton/skeleton.tsx"];
    expect(entry.localHash).toBe(entry.registryHash);
  });

  it("throws when a component is not found in the registry", async () => {
    await expect(
      addCommand(["nonexistent"], {
        registry: registryDir,
        target: "components",
        cwd: projectDir,
      }),
    ).rejects.toThrow(/not found in registry/);
  });
});
