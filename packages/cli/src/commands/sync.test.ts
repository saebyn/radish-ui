import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, rmSync, existsSync, readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { syncCommand } from "./sync.js";
import { hashContent } from "../lib/hash.js";

type LockFile = {
  components: Record<
    string,
    { files: Record<string, { registryHash: string; localHash: string }> }
  >;
};

const SKELETON_CONTENT_V2 = `export function Skeleton({ className }: { className?: string }) { return null; }`;
const DATAGRID_CONTENT_V1 = `export function Datagrid() { return null; }`;
const DATAGRID_CONTENT_V2 = `export function Datagrid({ children }: { children?: React.ReactNode }) { return null; }`;

/**
 * Creates a registry fixture.
 * When secondFile is true, "datagrid" also lists skeleton.tsx (simulating
 * a file added to the component definition after initial install).
 */
function createRegistryFixture(
  dir: string,
  opts: { datagridIncludesSkeleton?: boolean } = {},
): void {
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
          files: opts.datagridIncludesSkeleton
            ? ["src/list/datagrid.tsx", "src/skeleton/skeleton.tsx"]
            : ["src/list/datagrid.tsx"],
          dependencies: ["@radish-ui/core"],
        },
      ],
    }),
  );

  writeFileSync(join(dir, "src", "skeleton", "skeleton.tsx"), SKELETON_CONTENT_V2);
  writeFileSync(join(dir, "src", "list", "datagrid.tsx"), DATAGRID_CONTENT_V2);
}

/** Builds a minimal lockfile JSON string. */
function makeLockfile(entries: LockFile): string {
  return `${JSON.stringify(entries, null, 2)}\n`;
}

describe("syncCommand", () => {
  let tmpDir: string;
  let registryDir: string;
  let projectDir: string;

  beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), "radish-sync-test-"));
    registryDir = join(tmpDir, "registry");
    projectDir = join(tmpDir, "project");
    mkdirSync(registryDir);
    mkdirSync(projectDir);
  });

  afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  it("updates a tracked file whose registry content changed", async () => {
    createRegistryFixture(registryDir);

    // Project has the OLD version of datagrid and a matching lockfile
    mkdirSync(join(projectDir, "components", "list"), { recursive: true });
    writeFileSync(join(projectDir, "components", "list", "datagrid.tsx"), DATAGRID_CONTENT_V1);

    const oldHash = computeHash(DATAGRID_CONTENT_V1);
    writeFileSync(
      join(projectDir, "radish.lock.json"),
      makeLockfile({
        components: {
          datagrid: {
            files: {
              "list/datagrid.tsx": { registryHash: oldHash, localHash: oldHash },
            },
          },
        },
      }),
    );

    await syncCommand({ registry: registryDir, target: "components", cwd: projectDir });

    const updated = readFileSync(join(projectDir, "components", "list", "datagrid.tsx"), "utf-8");
    expect(updated).toBe(DATAGRID_CONTENT_V2);

    const lock: LockFile = JSON.parse(readFileSync(join(projectDir, "radish.lock.json"), "utf-8"));
    const newHash = computeHash(DATAGRID_CONTENT_V2);
    expect(lock.components.datagrid.files["list/datagrid.tsx"].registryHash).toBe(newHash);
    expect(lock.components.datagrid.files["list/datagrid.tsx"].localHash).toBe(newHash);
  });

  it("skips a file with local modifications and leaves lockfile unchanged", async () => {
    createRegistryFixture(registryDir);

    mkdirSync(join(projectDir, "components", "list"), { recursive: true });
    const localContent = `// my custom change\n${DATAGRID_CONTENT_V1}`;
    writeFileSync(join(projectDir, "components", "list", "datagrid.tsx"), localContent);

    const origHash = computeHash(DATAGRID_CONTENT_V1);
    writeFileSync(
      join(projectDir, "radish.lock.json"),
      makeLockfile({
        components: {
          datagrid: {
            files: {
              "list/datagrid.tsx": { registryHash: origHash, localHash: origHash },
            },
          },
        },
      }),
    );

    await syncCommand({ registry: registryDir, target: "components", cwd: projectDir });

    // File should NOT have been overwritten
    expect(readFileSync(join(projectDir, "components", "list", "datagrid.tsx"), "utf-8")).toBe(
      localContent,
    );
    // Lockfile unchanged
    const lock: LockFile = JSON.parse(readFileSync(join(projectDir, "radish.lock.json"), "utf-8"));
    expect(lock.components.datagrid.files["list/datagrid.tsx"].localHash).toBe(origHash);
  });

  it("force-updates a file with local modifications when --force is used", async () => {
    createRegistryFixture(registryDir);

    mkdirSync(join(projectDir, "components", "list"), { recursive: true });
    const localContent = `// my custom change\n${DATAGRID_CONTENT_V1}`;
    writeFileSync(join(projectDir, "components", "list", "datagrid.tsx"), localContent);

    const origHash = computeHash(DATAGRID_CONTENT_V1);
    writeFileSync(
      join(projectDir, "radish.lock.json"),
      makeLockfile({
        components: {
          datagrid: {
            files: {
              "list/datagrid.tsx": { registryHash: origHash, localHash: origHash },
            },
          },
        },
      }),
    );

    await syncCommand({
      registry: registryDir,
      target: "components",
      force: true,
      cwd: projectDir,
    });

    expect(readFileSync(join(projectDir, "components", "list", "datagrid.tsx"), "utf-8")).toBe(
      DATAGRID_CONTENT_V2,
    );
  });

  it("installs a new file added to a component definition that is not yet in the lockfile", async () => {
    // Registry now includes skeleton as part of datagrid
    createRegistryFixture(registryDir, { datagridIncludesSkeleton: true });

    // Project was installed when datagrid only had datagrid.tsx (no skeleton)
    mkdirSync(join(projectDir, "components", "list"), { recursive: true });
    writeFileSync(join(projectDir, "components", "list", "datagrid.tsx"), DATAGRID_CONTENT_V2);

    const hash = computeHash(DATAGRID_CONTENT_V2);
    writeFileSync(
      join(projectDir, "radish.lock.json"),
      makeLockfile({
        components: {
          datagrid: {
            files: {
              // Only the original file is tracked; skeleton.tsx is not yet tracked
              "list/datagrid.tsx": { registryHash: hash, localHash: hash },
            },
          },
        },
      }),
    );

    await syncCommand({ registry: registryDir, target: "components", cwd: projectDir });

    // skeleton.tsx should now be installed
    expect(existsSync(join(projectDir, "components", "skeleton", "skeleton.tsx"))).toBe(true);
    expect(readFileSync(join(projectDir, "components", "skeleton", "skeleton.tsx"), "utf-8")).toBe(
      SKELETON_CONTENT_V2,
    );

    // Lockfile should record the new file under datagrid
    const lock: LockFile = JSON.parse(readFileSync(join(projectDir, "radish.lock.json"), "utf-8"));
    expect(lock.components.datagrid.files["skeleton/skeleton.tsx"]).toBeDefined();
    const skeletonHash = computeHash(SKELETON_CONTENT_V2);
    expect(lock.components.datagrid.files["skeleton/skeleton.tsx"].registryHash).toBe(skeletonHash);
    expect(lock.components.datagrid.files["skeleton/skeleton.tsx"].localHash).toBe(skeletonHash);
  });

  it("warns about an untracked new file that already exists locally (without --force)", async () => {
    createRegistryFixture(registryDir, { datagridIncludesSkeleton: true });

    mkdirSync(join(projectDir, "components", "list"), { recursive: true });
    mkdirSync(join(projectDir, "components", "skeleton"), { recursive: true });
    writeFileSync(join(projectDir, "components", "list", "datagrid.tsx"), DATAGRID_CONTENT_V2);
    // User already has a custom skeleton that differs from the registry version
    writeFileSync(
      join(projectDir, "components", "skeleton", "skeleton.tsx"),
      `// my custom skeleton`,
    );

    const hash = computeHash(DATAGRID_CONTENT_V2);
    writeFileSync(
      join(projectDir, "radish.lock.json"),
      makeLockfile({
        components: {
          datagrid: {
            files: {
              "list/datagrid.tsx": { registryHash: hash, localHash: hash },
            },
          },
        },
      }),
    );

    await syncCommand({ registry: registryDir, target: "components", cwd: projectDir });

    // File should NOT have been overwritten
    expect(readFileSync(join(projectDir, "components", "skeleton", "skeleton.tsx"), "utf-8")).toBe(
      `// my custom skeleton`,
    );

    // Lockfile should NOT track the new file (since it was skipped)
    const lock: LockFile = JSON.parse(readFileSync(join(projectDir, "radish.lock.json"), "utf-8"));
    expect(lock.components.datagrid.files["skeleton/skeleton.tsx"]).toBeUndefined();
  });

  it("overwrites an untracked new file that already exists locally when --force is used", async () => {
    createRegistryFixture(registryDir, { datagridIncludesSkeleton: true });

    mkdirSync(join(projectDir, "components", "list"), { recursive: true });
    mkdirSync(join(projectDir, "components", "skeleton"), { recursive: true });
    writeFileSync(join(projectDir, "components", "list", "datagrid.tsx"), DATAGRID_CONTENT_V2);
    writeFileSync(
      join(projectDir, "components", "skeleton", "skeleton.tsx"),
      `// my custom skeleton`,
    );

    const hash = computeHash(DATAGRID_CONTENT_V2);
    writeFileSync(
      join(projectDir, "radish.lock.json"),
      makeLockfile({
        components: {
          datagrid: {
            files: {
              "list/datagrid.tsx": { registryHash: hash, localHash: hash },
            },
          },
        },
      }),
    );

    await syncCommand({
      registry: registryDir,
      target: "components",
      force: true,
      cwd: projectDir,
    });

    expect(readFileSync(join(projectDir, "components", "skeleton", "skeleton.tsx"), "utf-8")).toBe(
      SKELETON_CONTENT_V2,
    );

    const lock: LockFile = JSON.parse(readFileSync(join(projectDir, "radish.lock.json"), "utf-8"));
    expect(lock.components.datagrid.files["skeleton/skeleton.tsx"]).toBeDefined();
  });
});

/** Inline hash helper matching the CLI's hashContent implementation. */
function computeHash(content: string): string {
  return hashContent(content);
}
