import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { z } from "zod";
import { getErrorMessage, RadishError } from "./errors.js";
import { validateRelativeDir } from "./registry.js";

const RadishConfigSchema = z.object({
  registry: z.string().optional(),
  outputDir: z.string().optional(),
});

export type RadishConfig = z.infer<typeof RadishConfigSchema>;

export const DEFAULT_OUTPUT_DIR = "src/components/radish";

/**
 * Default registry base URL used when no --registry flag or radish.json entry is present.
 * Points to the registry package in the main branch of the radish-ui GitHub repository.
 */
export const DEFAULT_REGISTRY_URL =
  "https://raw.githubusercontent.com/saebyn/radish-ui/main/packages/registry";

export function loadConfig(cwd: string): RadishConfig {
  const configPath = resolve(cwd, "radish.json");
  if (!existsSync(configPath)) {
    return {};
  }
  try {
    const raw = readFileSync(configPath, "utf-8");
    return RadishConfigSchema.parse(JSON.parse(raw));
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
    registry: flags.registry ?? file.registry ?? DEFAULT_REGISTRY_URL,
    outputDir,
  };
}
