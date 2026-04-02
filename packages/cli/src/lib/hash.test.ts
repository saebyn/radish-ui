import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, readFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { rmSync } from "fs";

import { hashContent } from "./hash.js";
import { loadLockfile, saveLockfile, shouldUpdate } from "./lockfile.js";

describe("hashContent", () => {
  it("returns a sha256- prefixed hex string", () => {
    const hash = hashContent("hello");
    expect(hash).toMatch(/^sha256-[0-9a-f]{64}$/);
  });

  it("returns the same hash for the same content", () => {
    const a = hashContent("test content");
    const b = hashContent("test content");
    expect(a).toBe(b);
  });

  it("returns different hashes for different content", () => {
    const a = hashContent("content A");
    const b = hashContent("content B");
    expect(a).not.toBe(b);
  });

  it("works with Buffer input", () => {
    const str = hashContent("hello");
    const buf = hashContent(Buffer.from("hello"));
    expect(str).toBe(buf);
  });
});

describe("lockfile read/write", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), "radish-test-"));
  });

  afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

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
              registryHash: "sha256-abc",
              localHash: "sha256-abc",
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
  const HASH_A = "sha256-aaaa";
  const HASH_B = "sha256-bbbb";

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
