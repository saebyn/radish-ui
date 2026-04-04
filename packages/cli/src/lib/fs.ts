import {
  existsSync,
  mkdirSync,
  readFileSync,
  realpathSync,
  renameSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { randomBytes } from "node:crypto";
import { RadishError } from "./errors.js";

/**
 * Asserts that resolvedPath is contained within allowedRoot after resolving
 * all symlinks on both paths. Throws RadishError if it escapes.
 * Both paths must already exist on disk before calling this.
 * Uses path.relative() for a platform-aware containment check that works
 * correctly on both POSIX (forward slashes) and Windows (backslashes).
 */
export function assertWithinDir(allowedRoot: string, resolvedPath: string): void {
  const realRoot = realpathSync(allowedRoot);
  const realTarget = realpathSync(resolvedPath);
  const rel = relative(realRoot, realTarget);
  // An empty string means realTarget === realRoot (exact match, allowed).
  // A path starting with ".." means it escapes the root.
  // A path starting with sep on Windows (absolute) also escapes.
  if (rel !== "" && (rel.startsWith("..") || rel.startsWith(sep))) {
    throw new RadishError(`Path "${resolvedPath}" escapes the allowed directory "${allowedRoot}".`);
  }
}

/**
 * Writes content to destPath atomically by first writing to a sibling temp
 * file and then renaming it into place. Cleans up the temp file on failure.
 * Creates parent directories as needed. Asserts the resolved destination
 * is within allowedRoot to guard against symlink escapes.
 *
 * If force is true and the destination already exists, it is removed before
 * the rename (needed on some platforms where rename does not overwrite).
 */
export function writeFileAtomic(
  allowedRoot: string,
  destPath: string,
  content: Buffer | string,
  force = false,
): void {
  mkdirSync(dirname(destPath), { recursive: true });
  assertWithinDir(allowedRoot, dirname(destPath));
  const tmpPath = join(dirname(destPath), `.radish-tmp-${randomBytes(6).toString("hex")}`);
  try {
    writeFileSync(tmpPath, content);
    if (force && existsSync(destPath)) {
      unlinkSync(destPath);
    }
    renameSync(tmpPath, destPath);
  } catch (err) {
    try {
      unlinkSync(tmpPath);
    } catch {
      // ignore cleanup errors
    }
    throw err;
  }
}

/**
 * Reads a file that is expected to be within allowedRoot, asserting the
 * symlink-resolved path does not escape it. Returns an empty string if the
 * file does not exist (callers can treat absence as empty content).
 * The file must exist before assertWithinDir is called, which is guaranteed
 * by the existsSync guard here.
 */
export function readFileWithinDir(allowedRoot: string, filePath: string): string {
  if (!existsSync(filePath)) {
    return "";
  }
  assertWithinDir(allowedRoot, filePath);
  return readFileSync(filePath, "utf-8");
}
