import { existsSync, mkdirSync, renameSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { randomBytes } from "node:crypto";
import { RadishError, getErrorMessage } from "./errors.js";

/**
 * Writes content to destPath atomically by first writing to a sibling temp
 * file and then renaming it into place. Cleans up the temp file on failure.
 * Creates parent directories as needed.
 */
export function writeFileAtomic(destPath: string, content: Buffer | string): void {
  mkdirSync(dirname(destPath), { recursive: true });
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
 * where rename does not overwrite). Throws RadishError on failure.
 */
export function writeFileAtomicForce(
  destPath: string,
  content: Buffer | string,
  force: boolean,
): void {
  mkdirSync(dirname(destPath), { recursive: true });
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
