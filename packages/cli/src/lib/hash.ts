import { createHash } from "node:crypto";

export function hashContent(content: Buffer | string): string {
  return "sha256-" + createHash("sha256").update(content).digest("hex");
}
