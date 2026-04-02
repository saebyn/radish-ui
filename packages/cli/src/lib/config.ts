import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

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
  } catch {
    return {};
  }
}

export function resolveConfig(
  cwd: string,
  flags: Partial<RadishConfig>
): Required<RadishConfig> {
  const file = loadConfig(cwd);
  return {
    registry: flags.registry ?? file.registry ?? "",
    outputDir: flags.outputDir ?? file.outputDir ?? "src/components/radish",
  };
}
