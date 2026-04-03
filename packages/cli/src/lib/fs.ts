import {
  existsSync,
  mkdirSync,
  realpathSync,
  renameSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { randomBytes } from "node:crypto";
import { RadishError, getErrorMessage } from "./errors.js";

/**
 * Asserts that resolvedPath is contained within allowedRoot after resolving
 * all symlinks on both paths. Throws RadishError if it escapes.
 * Both paths must already exist on disk before calling this.
 */
export function assertWithinDir(allowedRoot: string, resolvedPath: string): void {
  const realRoot = realpathSync(allowedRoot);
  const realTarget = realpathSync(resolvedPath);
  if (!realTarget.startsWith(realRoot + "/") && realTarget !== realRoot) {
    throw new RadishError(`Path "${resolvedPath}" escapes the allowed directory "${allowedRoot}".`);
  }
}

/**
 * Writes content to destPath atomically by first writing to a sibling temp
 * file and then renaming it into place. Cleans up the temp file on failure.
 * Creates parent directories as needed. Asserts the resolved destination
 * is within allowedRoot to guard against symlink escapes.
 */
export function writeFileAtomic(
  allowedRoot: string,
  destPath: string,
  content: Buffer | string,
): void {
  mkdirSync(dirname(destPath), { recursive: true });
  assertWithinDir(allowedRoot, dirname(destPath));
  const tmpPath = join(dirname(destPath), `.radish-tmp-${randomBytes(6).toString("hex")}`);
  try {
    writeFileSync(tmpPath, content);
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
 * Writes content to destPath atomically. If the destination already exists
 * and force is true, it is removed before the rename (needed on some platforms
 * where rename does not overwrite). Asserts the resolved destination is within
 * allowedRoot to guard against symlink escapes.
 */
export function writeFileAtomicForce(
  allowedRoot: string,
  destPath: string,
  content: Buffer | string,
  force: boolean,
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
 * Writes data to path, wrapping any error in a RadishError with a clear message.
 */
export function writeFileSafe(filePath: string, data: string): void {
  try {
    writeFileSync(filePath, data, "utf-8");
  } catch (err) {
    throw new RadishError(`Failed to write file "${filePath}": ${getErrorMessage(err)}`);
  }
}
