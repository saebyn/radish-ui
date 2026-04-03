import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

export interface FileLock {
  registryHash: string;
  localHash: string;
}

export interface ComponentLock {
  files: Record<string, FileLock>;
}

export interface Lockfile {
  components: Record<string, ComponentLock>;
}

export function loadLockfile(cwd: string): Lockfile {
  const lockPath = resolve(cwd, "radish.lock.json");
  if (!existsSync(lockPath)) {
    return { components: {} };
  }
  try {
    const raw = readFileSync(lockPath, "utf-8");
    return JSON.parse(raw) as Lockfile;
  } catch (error) {
    console.warn(
      `Warning: Failed to read or parse lockfile at ${lockPath}. The lockfile will be ignored.`,
      error,
    );
    return { components: {} };
  }
}

export function saveLockfile(cwd: string, lockfile: Lockfile): void {
  const lockPath = resolve(cwd, "radish.lock.json");
  writeFileSync(lockPath, JSON.stringify(lockfile, null, 2) + "\n", "utf-8");
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
