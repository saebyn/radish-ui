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

import { vi, beforeEach, afterEach } from "vitest";
import { isRemoteRegistry, loadRegistryAsync, fetchRegistryFile } from "./registry.js";

describe("isRemoteRegistry", () => {
  it("returns true for https URLs", () => {
    expect(isRemoteRegistry("https://example.com/registry")).toBe(true);
  });

  it("returns true for http URLs", () => {
    expect(isRemoteRegistry("http://example.com/registry")).toBe(true);
  });

  it("returns false for local paths", () => {
    expect(isRemoteRegistry("/path/to/registry")).toBe(false);
  });

  it("returns false for relative paths", () => {
    expect(isRemoteRegistry("./registry")).toBe(false);
  });
});

describe("loadRegistryAsync (remote)", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("fetches registry.json from the base URL", async () => {
    const registryData = { components: [] };
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => registryData,
    } as Response);

    const result = await loadRegistryAsync("https://example.com/registry");

    expect(fetch).toHaveBeenCalledWith("https://example.com/registry/registry.json");
    expect(result).toEqual(registryData);
  });

  it("strips trailing slash from base URL before appending registry.json", async () => {
    const registryData = { components: [] };
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => registryData,
    } as Response);

    await loadRegistryAsync("https://example.com/registry/");

    expect(fetch).toHaveBeenCalledWith("https://example.com/registry/registry.json");
  });

  it("throws RadishError on HTTP error response", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: "Not Found",
    } as Response);

    await expect(loadRegistryAsync("https://example.com/registry")).rejects.toThrow(
      /Failed to fetch registry.*404/,
    );
  });

  it("throws RadishError on network failure", async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error("ENOTFOUND"));

    await expect(loadRegistryAsync("https://example.com/registry")).rejects.toThrow(
      /Network error fetching registry/,
    );
  });
});

describe("fetchRegistryFile", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("fetches the file from the correct URL", async () => {
    const fileContent = Buffer.from("export const x = 1;");
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      arrayBuffer: async () =>
        fileContent.buffer.slice(
          fileContent.byteOffset,
          fileContent.byteOffset + fileContent.byteLength,
        ),
    } as unknown as Response);

    const result = await fetchRegistryFile("https://example.com/registry", "src/button.tsx");

    expect(fetch).toHaveBeenCalledWith("https://example.com/registry/src/button.tsx");
    expect(result).toBeInstanceOf(Buffer);
    expect(result.toString()).toBe("export const x = 1;");
  });

  it("strips trailing slash before appending file path", async () => {
    const fileContent = Buffer.from("content");
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      arrayBuffer: async () =>
        fileContent.buffer.slice(
          fileContent.byteOffset,
          fileContent.byteOffset + fileContent.byteLength,
        ),
    } as unknown as Response);

    await fetchRegistryFile("https://example.com/registry/", "src/button.tsx");

    expect(fetch).toHaveBeenCalledWith("https://example.com/registry/src/button.tsx");
  });

  it("throws RadishError on HTTP error response", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: "Not Found",
    } as Response);

    await expect(
      fetchRegistryFile("https://example.com/registry", "src/button.tsx"),
    ).rejects.toThrow(/Failed to fetch.*404/);
  });

  it("throws RadishError on network failure", async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error("ENOTFOUND"));

    await expect(
      fetchRegistryFile("https://example.com/registry", "src/button.tsx"),
    ).rejects.toThrow(/Network error fetching/);
  });
});
