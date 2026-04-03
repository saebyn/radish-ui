import { describe, it, expect } from "vitest";

import { hashContent } from "./hash.js";

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

