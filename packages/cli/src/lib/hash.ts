import { createHash } from "node:crypto";

export function hashContent(content: Buffer | string): string {
  return (
    "sha256-" +
    createHash("sha256")
      .update(content)
      .digest("hex")
  );
}

export function getErrorMessage(err: unknown): string {
  if (err && typeof err === "object" && "message" in err) {
    return String((err as { message: unknown }).message);
  }
  return String(err);
}
