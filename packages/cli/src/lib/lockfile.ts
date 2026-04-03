import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { z } from "zod";
import { RadishError, getErrorMessage } from "./errors.js";
import { writeFileAtomic } from "./fs.js";

const FileLockSchema = z.object({
  registryHash: z.string(),
  localHash: z.string(),
});

const ComponentLockSchema = z.object({
  files: z.record(z.string(), FileLockSchema),
});

const LockfileSchema = z.object({
  components: z.record(z.string(), ComponentLockSchema),
});

export type FileLock = z.infer<typeof FileLockSchema>;
export type ComponentLock = z.infer<typeof ComponentLockSchema>;
export type Lockfile = z.infer<typeof LockfileSchema>;

export function loadLockfile(cwd: string): Lockfile {
  const lockPath = resolve(cwd, "radish.lock.json");
  if (!existsSync(lockPath)) {
    return { components: {} };
  }
  try {
    const raw = readFileSync(lockPath, "utf-8");
    return LockfileSchema.parse(JSON.parse(raw));
  } catch (err) {
    throw new RadishError(
      `Failed to read or parse lockfile at "${lockPath}": ${getErrorMessage(err)}`,
    );
  }
}

export function saveLockfile(cwd: string, lockfile: Lockfile): void {
  const lockPath = resolve(cwd, "radish.lock.json");
  writeFileAtomic(cwd, lockPath, JSON.stringify(lockfile, null, 2) + "\n");
}

export function shouldUpdate(
  currentLocalHash: string,
  lockedLocalHash: string,
  newRegistryHash: string,
  lockedRegistryHash: string,
  force: boolean,
): {
  update: boolean;
  reason: "force" | "unmodified-and-changed" | "modified" | "up-to-date";
} {
  if (force) {
    return { update: true, reason: "force" };
  }
  const userModified = currentLocalHash !== lockedLocalHash;
  if (userModified) {
    return { update: false, reason: "modified" };
  }
  const registryChanged = newRegistryHash !== lockedRegistryHash;
  if (registryChanged) {
    return { update: true, reason: "unmodified-and-changed" };
  }
  return { update: false, reason: "up-to-date" };
}
