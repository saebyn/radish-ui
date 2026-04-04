import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, rmSync, existsSync, readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { addCommand } from "./add.js";
import { removeCommand } from "./remove.js";

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
          dependencies: [],
        },
        {
          name: "datagrid",
          files: ["src/list/datagrid.tsx", "src/skeleton/skeleton.tsx"],
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

describe("removeCommand", () => {
  let tmpDir: string;
  let registryDir: string;
  let projectDir: string;

  beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), "radish-remove-test-"));
    registryDir = join(tmpDir, "registry");
    projectDir = join(tmpDir, "project");
    mkdirSync(registryDir);
    mkdirSync(projectDir);
    createRegistryFixture(registryDir);
  });

  afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  it("removes component files and updates the lockfile", async () => {
    await addCommand(["skeleton"], {
      registry: registryDir,
      target: "components",
      cwd: projectDir,
    });

    expect(existsSync(join(projectDir, "components", "skeleton", "skeleton.tsx"))).toBe(true);

    await removeCommand(["skeleton"], {
      target: "components",
      cwd: projectDir,
    });

    expect(existsSync(join(projectDir, "components", "skeleton", "skeleton.tsx"))).toBe(false);

    const lock = JSON.parse(
      readFileSync(join(projectDir, "radish.lock.json"), "utf-8"),
    ) as LockFile;
    expect(lock.components["skeleton"]).toBeUndefined();
  });

  it("skips files shared with another installed component", async () => {
    await addCommand(["skeleton", "datagrid"], {
      registry: registryDir,
      target: "components",
      cwd: projectDir,
    });

    // Remove "datagrid" — skeleton.tsx is shared with "skeleton" and must not be deleted
    await removeCommand(["datagrid"], {
      target: "components",
      cwd: projectDir,
    });

    // datagrid.tsx should be removed
    expect(existsSync(join(projectDir, "components", "list", "datagrid.tsx"))).toBe(false);
    // skeleton.tsx must still exist (shared with "skeleton")
    expect(existsSync(join(projectDir, "components", "skeleton", "skeleton.tsx"))).toBe(true);

    const lock = JSON.parse(
      readFileSync(join(projectDir, "radish.lock.json"), "utf-8"),
    ) as LockFile;
    expect(lock.components["datagrid"]).toBeUndefined();
    expect(lock.components["skeleton"]).toBeDefined();
  });

  it("warns about locally modified files and skips them without --force", async () => {
    await addCommand(["skeleton"], {
      registry: registryDir,
      target: "components",
      cwd: projectDir,
    });

    // Simulate a local modification
    writeFileSync(
      join(projectDir, "components", "skeleton", "skeleton.tsx"),
      `export function Skeleton() { return "modified"; }`,
    );

    await removeCommand(["skeleton"], {
      target: "components",
      cwd: projectDir,
    });

    // File should NOT be deleted because it was modified
    expect(existsSync(join(projectDir, "components", "skeleton", "skeleton.tsx"))).toBe(true);

    // The component should still be removed from the lockfile
    const lock = JSON.parse(
      readFileSync(join(projectDir, "radish.lock.json"), "utf-8"),
    ) as LockFile;
    expect(lock.components["skeleton"]).toBeUndefined();
  });

  it("removes locally modified files when --force is used", async () => {
    await addCommand(["skeleton"], {
      registry: registryDir,
      target: "components",
      cwd: projectDir,
    });

    writeFileSync(
      join(projectDir, "components", "skeleton", "skeleton.tsx"),
      `export function Skeleton() { return "modified"; }`,
    );

    await removeCommand(["skeleton"], {
      target: "components",
      force: true,
      cwd: projectDir,
    });

    expect(existsSync(join(projectDir, "components", "skeleton", "skeleton.tsx"))).toBe(false);

    const lock = JSON.parse(
      readFileSync(join(projectDir, "radish.lock.json"), "utf-8"),
    ) as LockFile;
    expect(lock.components["skeleton"]).toBeUndefined();
  });

  it("throws when the component is not installed", async () => {
    await expect(
      removeCommand(["nonexistent"], {
        target: "components",
        cwd: projectDir,
      }),
    ).rejects.toThrow(/not installed/);
  });

  it("removes multiple components in a single invocation", async () => {
    await addCommand(["skeleton", "datagrid"], {
      registry: registryDir,
      target: "components",
      cwd: projectDir,
    });

    await removeCommand(["skeleton", "datagrid"], {
      target: "components",
      cwd: projectDir,
    });

    expect(existsSync(join(projectDir, "components", "skeleton", "skeleton.tsx"))).toBe(false);
    expect(existsSync(join(projectDir, "components", "list", "datagrid.tsx"))).toBe(false);

    const lock = JSON.parse(
      readFileSync(join(projectDir, "radish.lock.json"), "utf-8"),
    ) as LockFile;
    expect(lock.components["skeleton"]).toBeUndefined();
    expect(lock.components["datagrid"]).toBeUndefined();
  });

  it("handles gracefully a file that is already missing from disk", async () => {
    await addCommand(["skeleton"], {
      registry: registryDir,
      target: "components",
      cwd: projectDir,
    });

    // Manually delete the file before running remove
    rmSync(join(projectDir, "components", "skeleton", "skeleton.tsx"));

    await expect(
      removeCommand(["skeleton"], {
        target: "components",
        cwd: projectDir,
      }),
    ).resolves.not.toThrow();

    const lock = JSON.parse(
      readFileSync(join(projectDir, "radish.lock.json"), "utf-8"),
    ) as LockFile;
    expect(lock.components["skeleton"]).toBeUndefined();
  });

  it("deduplicates repeated component names without crashing", async () => {
    await addCommand(["skeleton"], {
      registry: registryDir,
      target: "components",
      cwd: projectDir,
    });

    // Passing the same name twice should behave identically to passing it once.
    await removeCommand(["skeleton", "skeleton"], {
      target: "components",
      cwd: projectDir,
    });

    expect(existsSync(join(projectDir, "components", "skeleton", "skeleton.tsx"))).toBe(false);

    const lock = JSON.parse(
      readFileSync(join(projectDir, "radish.lock.json"), "utf-8"),
    ) as LockFile;
    expect(lock.components["skeleton"]).toBeUndefined();
  });

  it("keeps the lockfile entry when unlinkSync fails for a file", async () => {
    await addCommand(["skeleton"], {
      registry: registryDir,
      target: "components",
      cwd: projectDir,
    });

    const skeletonFile = join(projectDir, "components", "skeleton", "skeleton.tsx");

    // Make the parent directory non-writable so unlinkSync will throw EACCES.
    const { chmodSync } = await import("node:fs");
    const skeletonDir = join(projectDir, "components", "skeleton");
    chmodSync(skeletonDir, 0o555);

    try {
      await removeCommand(["skeleton"], {
        target: "components",
        cwd: projectDir,
      });
    } finally {
      // Restore permissions so afterEach cleanup can delete the temp dir.
      chmodSync(skeletonDir, 0o755);
    }

    // The file should still be on disk (unlink failed).
    expect(existsSync(skeletonFile)).toBe(true);

    // The lockfile entry must be preserved so the component stays tracked.
    const lock = JSON.parse(
      readFileSync(join(projectDir, "radish.lock.json"), "utf-8"),
    ) as LockFile;
    expect(lock.components["skeleton"]).toBeDefined();
  });

  it("preserves a shared file when the first removal succeeds but a later one fails", async () => {
    // Install both components: datagrid and skeleton share skeleton.tsx.
    await addCommand(["skeleton", "datagrid"], {
      registry: registryDir,
      target: "components",
      cwd: projectDir,
    });

    const { chmodSync } = await import("node:fs");
    const skeletonDir = join(projectDir, "components", "skeleton");

    // Make skeleton's directory non-writable so its files cannot be deleted.
    chmodSync(skeletonDir, 0o555);

    try {
      // Remove datagrid first (will succeed), then skeleton (will fail).
      // datagrid shares skeleton.tsx with skeleton — with correct shared-file
      // detection datagrid must NOT delete skeleton.tsx even though skeleton
      // is also in the removal set, because skeleton may still end up tracked.
      await removeCommand(["datagrid", "skeleton"], {
        target: "components",
        cwd: projectDir,
      });
    } finally {
      chmodSync(skeletonDir, 0o755);
    }

    // datagrid.tsx should be gone (datagrid removed successfully).
    expect(existsSync(join(projectDir, "components", "list", "datagrid.tsx"))).toBe(false);
    // skeleton.tsx must still be on disk: datagrid preserved it (shared with
    // skeleton), and skeleton's own removal failed.
    expect(existsSync(join(projectDir, "components", "skeleton", "skeleton.tsx"))).toBe(true);

    const lock = JSON.parse(
      readFileSync(join(projectDir, "radish.lock.json"), "utf-8"),
    ) as LockFile;
    // datagrid was successfully removed.
    expect(lock.components["datagrid"]).toBeUndefined();
    // skeleton remains tracked because its removal failed.
    expect(lock.components["skeleton"]).toBeDefined();
  });

  it("protects shared files when a component is removed and a later one fails", async () => {
    // Install both components: skeleton and datagrid share skeleton.tsx.
    await addCommand(["skeleton", "datagrid"], {
      registry: registryDir,
      target: "components",
      cwd: projectDir,
    });

    const { chmodSync } = await import("node:fs");
    const skeletonDir = join(projectDir, "components", "skeleton");

    // Make skeleton's directory non-writable so its files cannot be deleted.
    chmodSync(skeletonDir, 0o555);

    try {
      // Remove ["skeleton", "datagrid"]:
      // - skeleton is processed first: skeleton.tsx is shared (datagrid still
      //   references it), so it is skipped and skeleton succeeds.
      // - datagrid is processed second: skeleton is now gone from the lockfile,
      //   so skeleton.tsx is no longer shared — datagrid tries to delete it but
      //   FAILS (directory non-writable), keeping datagrid in the lockfile.
      await removeCommand(["skeleton", "datagrid"], {
        target: "components",
        cwd: projectDir,
      });
    } finally {
      chmodSync(skeletonDir, 0o755);
    }

    // skeleton.tsx is still on disk because datagrid's attempt to delete it
    // failed (non-writable directory).
    expect(existsSync(join(projectDir, "components", "skeleton", "skeleton.tsx"))).toBe(true);
    // datagrid.tsx is in a different (writable) directory and was deleted.
    expect(existsSync(join(projectDir, "components", "list", "datagrid.tsx"))).toBe(false);

    const lock = JSON.parse(
      readFileSync(join(projectDir, "radish.lock.json"), "utf-8"),
    ) as LockFile;
    // skeleton succeeded (its file was shared and skipped); datagrid failed.
    expect(lock.components["skeleton"]).toBeUndefined();
    expect(lock.components["datagrid"]).toBeDefined();
  });
});
