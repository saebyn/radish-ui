import { describe, it, expect } from "vitest";
import { registryFileToRelative, validateRelativePath } from "./registry.js";

describe("registryFileToRelative", () => {
  it("strips the leading src/ prefix", () => {
    expect(registryFileToRelative("src/list/datagrid.tsx")).toBe("list/datagrid.tsx");
  });

  it("works for a top-level file under src/", () => {
    expect(registryFileToRelative("src/button.tsx")).toBe("button.tsx");
  });

  it("throws when path does not start with src/", () => {
    expect(() => registryFileToRelative("components/button.tsx")).toThrow(/must start with "src\//);
  });

  it("throws on path traversal via src/../", () => {
    expect(() => registryFileToRelative("src/../package.json")).toThrow(/path traversal/);
  });

  it("throws on deeply nested path traversal", () => {
    expect(() => registryFileToRelative("src/a/../../etc/passwd")).toThrow(/path traversal/);
  });

  it("throws when path would resolve to an absolute path", () => {
    // On POSIX, normalize("src/" + "/etc/passwd") would give "/etc/passwd" after
    // slicing the "src/" prefix — guard against this.
    expect(() => registryFileToRelative("src//etc/passwd")).toThrow();
  });
});

describe("validateRelativePath", () => {
  it("accepts a simple relative path", () => {
    expect(() => validateRelativePath("list/datagrid.tsx")).not.toThrow();
  });

  it("accepts a top-level file", () => {
    expect(() => validateRelativePath("button.tsx")).not.toThrow();
  });

  it("throws on a path starting with ..", () => {
    expect(() => validateRelativePath("../package.json")).toThrow(/Unsafe relative path/);
  });

  it("throws on a deeply nested traversal", () => {
    expect(() => validateRelativePath("a/../../etc/passwd")).toThrow(/Unsafe relative path/);
  });

  it("throws on an absolute path", () => {
    expect(() => validateRelativePath("/etc/passwd")).toThrow(/Unsafe relative path/);
  });

  it("accepts a path starting with .. but not a traversal (..foo/bar.tsx)", () => {
    expect(() => validateRelativePath("..foo/bar.tsx")).not.toThrow();
  });

  it("throws on a Windows drive-letter absolute path", () => {
    expect(() => validateRelativePath("C:/Windows/System32")).toThrow(/Unsafe relative path/);
  });

  it("throws on a Windows backslash traversal", () => {
    expect(() => validateRelativePath("a\\..\\..\\etc")).toThrow(/Unsafe relative path/);
  });
});
