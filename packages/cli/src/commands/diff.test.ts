import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { mkdtempSync, rmSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { diffCommand } from "./diff.js";
import { hashContent } from "../lib/hash.js";

const SKELETON_CONTENT = `export function Skeleton({ className }: { className?: string }) { return null; }`;
const DATAGRID_CONTENT_V1 = `export function Datagrid() { return null; }`;
const DATAGRID_CONTENT_V2 = `export function Datagrid({ children }: { children?: React.ReactNode }) { return null; }`;

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
          files: ["src/list/datagrid.tsx"],
          dependencies: ["@radish-ui/core"],
        },
      ],
    }),
  );

  writeFileSync(join(dir, "src", "skeleton", "skeleton.tsx"), SKELETON_CONTENT);
  writeFileSync(join(dir, "src", "list", "datagrid.tsx"), DATAGRID_CONTENT_V2);
}

function makeLockfile(entries: object): string {
  return `${JSON.stringify(entries, null, 2)}\n`;
}

describe("diffCommand (single component)", () => {
  let tmpDir: string;
  let registryDir: string;
  let projectDir: string;

  beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), "radish-diff-test-"));
    registryDir = join(tmpDir, "registry");
    projectDir = join(tmpDir, "project");
    mkdirSync(registryDir);
    mkdirSync(projectDir);
    createRegistryFixture(registryDir);
  });

  afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true });
    vi.restoreAllMocks();
  });

  it("reports no upstream changes when file is in sync", async () => {
    const hash = hashContent(SKELETON_CONTENT);
    mkdirSync(join(projectDir, "components", "skeleton"), { recursive: true });
    writeFileSync(join(projectDir, "components", "skeleton", "skeleton.tsx"), SKELETON_CONTENT);
    writeFileSync(
      join(projectDir, "radish.lock.json"),
      makeLockfile({
        components: {
          skeleton: {
            files: {
              "skeleton/skeleton.tsx": { registryHash: hash, localHash: hash },
            },
          },
        },
      }),
    );

    const logs: string[] = [];
    vi.spyOn(console, "log").mockImplementation((...args) => {
      logs.push(args.join(" "));
    });

    await diffCommand("skeleton", { registry: registryDir, target: "components", cwd: projectDir });

    expect(logs.some((l) => l.includes("no upstream changes"))).toBe(true);
  });

  it("throws when component is not in the lockfile", async () => {
    writeFileSync(join(projectDir, "radish.lock.json"), makeLockfile({ components: {} }));

    await expect(
      diffCommand("skeleton", { registry: registryDir, target: "components", cwd: projectDir }),
    ).rejects.toThrow(/not found in radish.lock.json/);
  });

  it("throws when component is not in the registry", async () => {
    const hash = hashContent(SKELETON_CONTENT);
    writeFileSync(
      join(projectDir, "radish.lock.json"),
      makeLockfile({
        components: {
          nonexistent: {
            files: {
              "skeleton/skeleton.tsx": { registryHash: hash, localHash: hash },
            },
          },
        },
      }),
    );

    await expect(
      diffCommand("nonexistent", {
        registry: registryDir,
        target: "components",
        cwd: projectDir,
      }),
    ).rejects.toThrow(/not found in registry/);
  });
});

describe("diffCommand (project-wide, no component arg)", () => {
  let tmpDir: string;
  let registryDir: string;
  let projectDir: string;
  let originalExitCode: number | undefined;

  beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), "radish-diff-all-test-"));
    registryDir = join(tmpDir, "registry");
    projectDir = join(tmpDir, "project");
    mkdirSync(registryDir);
    mkdirSync(projectDir);
    createRegistryFixture(registryDir);
    originalExitCode = process.exitCode as number | undefined;
    process.exitCode = 0;
  });

  afterEach(() => {
    process.exitCode = originalExitCode;
    rmSync(tmpDir, { recursive: true, force: true });
    vi.restoreAllMocks();
  });

  it("reports no components found when lockfile is empty", async () => {
    writeFileSync(join(projectDir, "radish.lock.json"), makeLockfile({ components: {} }));

    const logs: string[] = [];
    vi.spyOn(console, "log").mockImplementation((...args) => {
      logs.push(args.join(" "));
    });

    await diffCommand(undefined, { registry: registryDir, target: "components", cwd: projectDir });

    expect(logs.some((l) => l.includes("No components found"))).toBe(true);
    expect(process.exitCode).toBe(0);
  });

  it("reports up-to-date when local file matches registry and lockfile", async () => {
    const hash = hashContent(SKELETON_CONTENT);
    mkdirSync(join(projectDir, "components", "skeleton"), { recursive: true });
    writeFileSync(join(projectDir, "components", "skeleton", "skeleton.tsx"), SKELETON_CONTENT);
    writeFileSync(
      join(projectDir, "radish.lock.json"),
      makeLockfile({
        components: {
          skeleton: {
            files: {
              "skeleton/skeleton.tsx": { registryHash: hash, localHash: hash },
            },
          },
        },
      }),
    );

    const logs: string[] = [];
    vi.spyOn(console, "log").mockImplementation((...args) => {
      logs.push(args.join(" "));
    });

    await diffCommand(undefined, { registry: registryDir, target: "components", cwd: projectDir });

    expect(logs.some((l) => l.includes("skeleton") && l.includes("up-to-date"))).toBe(true);
    expect(logs.some((l) => l.includes("1 up-to-date") && l.includes("0 with drift"))).toBe(true);
    expect(process.exitCode).toBe(0);
  });

  it("reports modified locally and sets exit code 1 when local file has been changed", async () => {
    const originalHash = hashContent(DATAGRID_CONTENT_V1);
    mkdirSync(join(projectDir, "components", "list"), { recursive: true });
    // Write a modified version locally
    const modifiedContent = `// my custom change\n${DATAGRID_CONTENT_V1}`;
    writeFileSync(join(projectDir, "components", "list", "datagrid.tsx"), modifiedContent);
    writeFileSync(
      join(projectDir, "radish.lock.json"),
      makeLockfile({
        components: {
          datagrid: {
            files: {
              "list/datagrid.tsx": {
                registryHash: originalHash,
                localHash: originalHash,
              },
            },
          },
        },
      }),
    );

    const logs: string[] = [];
    vi.spyOn(console, "log").mockImplementation((...args) => {
      logs.push(args.join(" "));
    });

    await diffCommand(undefined, { registry: registryDir, target: "components", cwd: projectDir });

    expect(logs.some((l) => l.includes("datagrid") && l.includes("modified locally"))).toBe(true);
    expect(logs.some((l) => l.includes("1 with drift"))).toBe(true);
    expect(process.exitCode).toBe(1);
  });

  it("reports missing and sets exit code 1 when local file does not exist", async () => {
    const hash = hashContent(SKELETON_CONTENT);
    // Do NOT create local file
    writeFileSync(
      join(projectDir, "radish.lock.json"),
      makeLockfile({
        components: {
          skeleton: {
            files: {
              "skeleton/skeleton.tsx": { registryHash: hash, localHash: hash },
            },
          },
        },
      }),
    );

    const logs: string[] = [];
    vi.spyOn(console, "log").mockImplementation((...args) => {
      logs.push(args.join(" "));
    });

    await diffCommand(undefined, { registry: registryDir, target: "components", cwd: projectDir });

    expect(logs.some((l) => l.includes("skeleton") && l.includes("missing"))).toBe(true);
    expect(logs.some((l) => l.includes("1 with drift"))).toBe(true);
    expect(process.exitCode).toBe(1);
  });

  it("reports upstream changes and sets exit code 1 when registry has a newer version", async () => {
    // Lock records OLD registry hash
    const oldHash = hashContent(DATAGRID_CONTENT_V1);
    mkdirSync(join(projectDir, "components", "list"), { recursive: true });
    // Local file matches what was originally installed (V1 content)
    writeFileSync(join(projectDir, "components", "list", "datagrid.tsx"), DATAGRID_CONTENT_V1);
    writeFileSync(
      join(projectDir, "radish.lock.json"),
      makeLockfile({
        components: {
          datagrid: {
            files: {
              "list/datagrid.tsx": {
                registryHash: oldHash,
                localHash: oldHash,
              },
            },
          },
        },
      }),
    );

    const logs: string[] = [];
    vi.spyOn(console, "log").mockImplementation((...args) => {
      logs.push(args.join(" "));
    });

    // Registry now has V2 content
    await diffCommand(undefined, { registry: registryDir, target: "components", cwd: projectDir });

    expect(logs.some((l) => l.includes("datagrid") && l.includes("upstream changes"))).toBe(true);
    expect(logs.some((l) => l.includes("1 with drift"))).toBe(true);
    expect(process.exitCode).toBe(1);
  });

  it("reports untracked/unknown and sets exit code 1 when component is not in registry", async () => {
    const hash = hashContent(SKELETON_CONTENT);
    writeFileSync(
      join(projectDir, "radish.lock.json"),
      makeLockfile({
        components: {
          "unknown-widget": {
            files: {
              "widgets/unknown.tsx": { registryHash: hash, localHash: hash },
            },
          },
        },
      }),
    );

    const logs: string[] = [];
    vi.spyOn(console, "log").mockImplementation((...args) => {
      logs.push(args.join(" "));
    });

    await diffCommand(undefined, { registry: registryDir, target: "components", cwd: projectDir });

    expect(
      logs.some((l) => l.includes("unknown-widget") && l.includes("untracked/unknown")),
    ).toBe(true);
    expect(logs.some((l) => l.includes("1 with drift"))).toBe(true);
    expect(process.exitCode).toBe(1);
  });

  it("scans multiple components and reports correct totals", async () => {
    const skeletonHash = hashContent(SKELETON_CONTENT);
    const datagridOldHash = hashContent(DATAGRID_CONTENT_V1);

    mkdirSync(join(projectDir, "components", "skeleton"), { recursive: true });
    mkdirSync(join(projectDir, "components", "list"), { recursive: true });
    writeFileSync(join(projectDir, "components", "skeleton", "skeleton.tsx"), SKELETON_CONTENT);
    writeFileSync(join(projectDir, "components", "list", "datagrid.tsx"), DATAGRID_CONTENT_V1);

    writeFileSync(
      join(projectDir, "radish.lock.json"),
      makeLockfile({
        components: {
          skeleton: {
            files: {
              "skeleton/skeleton.tsx": {
                registryHash: skeletonHash,
                localHash: skeletonHash,
              },
            },
          },
          datagrid: {
            files: {
              "list/datagrid.tsx": {
                registryHash: datagridOldHash,
                localHash: datagridOldHash,
              },
            },
          },
        },
      }),
    );

    const logs: string[] = [];
    vi.spyOn(console, "log").mockImplementation((...args) => {
      logs.push(args.join(" "));
    });

    await diffCommand(undefined, { registry: registryDir, target: "components", cwd: projectDir });

    expect(logs.some((l) => l.includes("skeleton") && l.includes("up-to-date"))).toBe(true);
    expect(logs.some((l) => l.includes("datagrid") && l.includes("upstream changes"))).toBe(true);
    expect(
      logs.some((l) => l.includes("Scanned 2 components") && l.includes("1 up-to-date")),
    ).toBe(true);
    expect(process.exitCode).toBe(1);
  });

  it("reports untracked/unknown when lockfile contains an unsafe path entry", async () => {
    const hash = hashContent(SKELETON_CONTENT);
    mkdirSync(join(projectDir, "components", "skeleton"), { recursive: true });
    writeFileSync(join(projectDir, "components", "skeleton", "skeleton.tsx"), SKELETON_CONTENT);
    writeFileSync(
      join(projectDir, "radish.lock.json"),
      makeLockfile({
        components: {
          skeleton: {
            files: {
              // unsafe path with traversal
              "../../etc/passwd": { registryHash: hash, localHash: hash },
            },
          },
        },
      }),
    );

    const logs: string[] = [];
    const warns: string[] = [];
    vi.spyOn(console, "log").mockImplementation((...args) => {
      logs.push(args.join(" "));
    });
    vi.spyOn(console, "warn").mockImplementation((...args) => {
      warns.push(args.join(" "));
    });

    await diffCommand(undefined, { registry: registryDir, target: "components", cwd: projectDir });

    expect(logs.some((l) => l.includes("skeleton") && l.includes("untracked/unknown"))).toBe(true);
    expect(warns.some((w) => w.includes("unsafe path"))).toBe(true);
    expect(process.exitCode).toBe(1);
  });

  it("reports upstream changes and sets exit code 1 when registry adds a new file (manifest drift)", async () => {
    const hash = hashContent(SKELETON_CONTENT);
    mkdirSync(join(projectDir, "components", "skeleton"), { recursive: true });
    writeFileSync(join(projectDir, "components", "skeleton", "skeleton.tsx"), SKELETON_CONTENT);

    // Lockfile only knows about the original file, but registry now declares two files
    writeFileSync(
      join(projectDir, "radish.lock.json"),
      makeLockfile({
        components: {
          skeleton: {
            files: {
              "skeleton/skeleton.tsx": { registryHash: hash, localHash: hash },
              // NOTE: registry now also declares "src/skeleton/utils.tsx" which is absent here
            },
          },
        },
      }),
    );

    // Add a second file to the registry component manifest
    writeFileSync(
      join(registryDir, "registry.json"),
      JSON.stringify({
        components: [
          {
            name: "skeleton",
            files: ["src/skeleton/skeleton.tsx", "src/skeleton/utils.tsx"],
            dependencies: ["@radish-ui/core"],
          },
          {
            name: "datagrid",
            files: ["src/list/datagrid.tsx"],
            dependencies: ["@radish-ui/core"],
          },
        ],
      }),
    );
    writeFileSync(join(registryDir, "src", "skeleton", "utils.tsx"), `export function utils() {}`);

    const logs: string[] = [];
    vi.spyOn(console, "log").mockImplementation((...args) => {
      logs.push(args.join(" "));
    });

    await diffCommand(undefined, { registry: registryDir, target: "components", cwd: projectDir });

    expect(logs.some((l) => l.includes("skeleton") && l.includes("upstream changes"))).toBe(true);
    expect(logs.some((l) => l.includes("1 with drift"))).toBe(true);
    expect(process.exitCode).toBe(1);
  });
});
