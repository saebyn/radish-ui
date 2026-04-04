import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { loadLockfile, saveLockfile, shouldUpdate } from "./lockfile.js";

describe("lockfile read/write", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), "radish-test-"));
  });

  afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  const VALID_HASH = `sha256-${"a".repeat(64)}`;

  it("returns empty lockfile when none exists", () => {
    const lock = loadLockfile(tmpDir);
    expect(lock).toEqual({ components: {} });
  });

  it("round-trips a lockfile", () => {
    const lock = {
      components: {
        datagrid: {
          files: {
            "list/datagrid.tsx": {
              registryHash: VALID_HASH,
              localHash: VALID_HASH,
            },
          },
        },
      },
    };
    saveLockfile(tmpDir, lock);
    const loaded = loadLockfile(tmpDir);
    expect(loaded).toEqual(lock);
  });

  it("written file ends with newline", () => {
    saveLockfile(tmpDir, { components: {} });
    const raw = readFileSync(join(tmpDir, "radish.lock.json"), "utf-8");
    expect(raw.endsWith("\n")).toBe(true);
  });
});

describe("shouldUpdate", () => {
  const HASH_A = "sha256-" + "a".repeat(64);
  const HASH_B = "sha256-" + "b".repeat(64);

  it("force=true always returns update=true", () => {
    const result = shouldUpdate(HASH_B, HASH_A, HASH_B, HASH_A, true);
    expect(result).toEqual({ update: true, reason: "force" });
  });

  it("returns up-to-date when nothing changed", () => {
    const result = shouldUpdate(HASH_A, HASH_A, HASH_A, HASH_A, false);
    expect(result).toEqual({ update: false, reason: "up-to-date" });
  });

  it("returns modified when local hash differs from locked local hash", () => {
    const result = shouldUpdate(HASH_B, HASH_A, HASH_B, HASH_A, false);
    expect(result).toEqual({ update: false, reason: "modified" });
  });

  it("returns unmodified-and-changed when registry changed but local untouched", () => {
    // currentLocalHash === lockedLocalHash (user didn't modify)
    // newRegistryHash !== lockedRegistryHash (upstream changed)
    const result = shouldUpdate(HASH_A, HASH_A, HASH_B, HASH_A, false);
    expect(result).toEqual({ update: true, reason: "unmodified-and-changed" });
  });
});
