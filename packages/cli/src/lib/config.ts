import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { getErrorMessage, RadishError } from "./errors.js";
import { validateRelativeDir } from "./registry.js";

export interface RadishConfig {
  registry?: string;
  outputDir?: string;
}

export const DEFAULT_OUTPUT_DIR = "src/components/radish";

export function loadConfig(cwd: string): RadishConfig {
  const configPath = resolve(cwd, "radish.json");
  if (!existsSync(configPath)) {
    return {};
  }
  try {
    const raw = readFileSync(configPath, "utf-8");
    return JSON.parse(raw) as RadishConfig;
  } catch (err) {
    throw new RadishError(
      `Failed to read or parse radish config at "${configPath}": ${getErrorMessage(err)}`,
    );
  }
}

export function resolveConfig(cwd: string, flags: Partial<RadishConfig>): Required<RadishConfig> {
  const file = loadConfig(cwd);
  const outputDir = flags.outputDir ?? file.outputDir ?? DEFAULT_OUTPUT_DIR;
  try {
    validateRelativeDir(outputDir);
  } catch {
    throw new RadishError(
      `Invalid outputDir "${outputDir}": must be a relative path that does not escape the project root.`,
    );
  }
  return {
    registry: flags.registry ?? file.registry ?? "",
    outputDir,
  };
}
