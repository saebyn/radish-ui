import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { getErrorMessage, RadishError } from "./errors.js";

export interface RadishConfig {
  registry?: string;
  outputDir?: string;
}

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
  return {
    registry: flags.registry ?? file.registry ?? "",
    outputDir: flags.outputDir ?? file.outputDir ?? "src/components/radish",
  };
}
