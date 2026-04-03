import { describe, it, expect } from "vitest";
import { registryFileToRelative } from "./registry.js";

describe("registryFileToRelative", () => {
  it("strips the leading src/ prefix", () => {
    expect(registryFileToRelative("src/list/datagrid.tsx")).toBe(
      "list/datagrid.tsx"
    );
  });

  it("works for a top-level file under src/", () => {
    expect(registryFileToRelative("src/button.tsx")).toBe("button.tsx");
  });

  it("throws when path does not start with src/", () => {
    expect(() => registryFileToRelative("components/button.tsx")).toThrow(
      /must start with "src\//
    );
  });

  it("throws on path traversal via src/../", () => {
    expect(() => registryFileToRelative("src/../package.json")).toThrow(
      /path traversal/
    );
  });

  it("throws on deeply nested path traversal", () => {
    expect(() => registryFileToRelative("src/a/../../etc/passwd")).toThrow(
      /path traversal/
    );
  });

  it("throws when path would resolve to an absolute path", () => {
    // On POSIX, normalize("src/" + "/etc/passwd") would give "/etc/passwd" after
    // slicing the "src/" prefix — guard against this.
    expect(() => registryFileToRelative("src//etc/passwd")).toThrow();
  });
});
