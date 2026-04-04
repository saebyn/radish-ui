import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, rmSync, existsSync, readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { initCommand } from "./init.js";

describe("initCommand", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), "radish-init-test-"));
  });

  afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  it("creates radish.json with default values (--yes)", async () => {
    await initCommand({ yes: true, cwd: tmpDir });

    const config = JSON.parse(readFileSync(join(tmpDir, "radish.json"), "utf-8")) as {
      registry: string;
      outputDir: string;
    };
    expect(config.registry).toBe("https://saebyn.github.io/radish-ui/registry");
    expect(config.outputDir).toBe("src/components/radish");
  });

  it("creates the default components directory (--yes)", async () => {
    await initCommand({ yes: true, cwd: tmpDir });

    expect(existsSync(join(tmpDir, "src", "components", "radish"))).toBe(true);
  });

  it("does not create a sample component by default (--yes)", async () => {
    await initCommand({ yes: true, cwd: tmpDir });

    expect(existsSync(join(tmpDir, "src", "components", "radish", "sample.tsx"))).toBe(false);
  });

  it("uses the --registry option in radish.json", async () => {
    await initCommand({ yes: true, cwd: tmpDir, registry: "https://example.com/registry" });

    const config = JSON.parse(readFileSync(join(tmpDir, "radish.json"), "utf-8")) as {
      registry: string;
    };
    expect(config.registry).toBe("https://example.com/registry");
  });

  it("throws when radish.json already exists and --yes is set", async () => {
    writeFileSync(join(tmpDir, "radish.json"), JSON.stringify({ registry: "old" }));

    await expect(initCommand({ yes: true, cwd: tmpDir })).rejects.toThrow(
      /radish\.json.*already exists/,
    );
  });

  it("does not overwrite an existing components directory", async () => {
    const compDir = join(tmpDir, "src", "components", "radish");
    mkdirSync(compDir, { recursive: true });
    writeFileSync(join(compDir, "existing.tsx"), "// keep me");

    await initCommand({ yes: true, cwd: tmpDir });

    // Directory already existed; existing file should be untouched
    expect(existsSync(join(compDir, "existing.tsx"))).toBe(true);
  });

  it("radish.json has correct JSON structure", async () => {
    await initCommand({ yes: true, cwd: tmpDir });

    const raw = readFileSync(join(tmpDir, "radish.json"), "utf-8");
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    expect(Object.keys(parsed)).toEqual(["registry", "outputDir"]);
  });
});
