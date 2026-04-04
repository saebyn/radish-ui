import { existsSync, mkdirSync } from "node:fs";
import { join, resolve } from "node:path";
import * as clack from "@clack/prompts";
import chalk from "chalk";
import { writeFileAtomic } from "../lib/fs.js";
import { RadishError } from "../lib/errors.js";
import { DEFAULT_OUTPUT_DIR, DEFAULT_REGISTRY_URL } from "../lib/config.js";

export interface InitOptions {
  registry?: string;
  yes?: boolean;
  /** Override the working directory (used in tests; defaults to process.cwd()). */
  cwd?: string;
}

function generateRadishJson(registryValue: string, outputDir: string): string {
  return `${JSON.stringify(
    {
      registry: registryValue,
      outputDir,
    },
    null,
    2,
  )}\n`;
}

function generateSampleComponent(): string {
  return `import type { FC } from "react";

/**
 * SampleComponent – a placeholder radish-ui component.
 * Replace this with a real component added via \`radish add <component>\`.
 */
export const SampleComponent: FC = () => {
  return <div>Hello from radish-ui!</div>;
};
`;
}

function detectPackageManager(): string {
  const agent = process.env["npm_config_user_agent"] ?? "";
  if (agent.startsWith("yarn")) return "yarn";
  if (agent.startsWith("npm")) return "npm";
  return "pnpm";
}

function printInstallHint(pm: string): void {
  const installCmd = pm === "npm" ? "npm install" : pm === "yarn" ? "yarn add" : "pnpm add";
  const deps = ["@radish-ui/core", "ra-core", "ra-i18n-polyglot", "ra-language-english"];
  console.log("\nInstall recommended dependencies:");
  console.log(`  ${installCmd} ${deps.join(" ")}`);
}

export async function initCommand(options: InitOptions): Promise<void> {
  const cwd = options.cwd ?? process.cwd();
  const useDefaults = options.yes === true || !process.stdin.isTTY;

  if (!useDefaults) {
    clack.intro(chalk.bold.cyan("✦ radish init"));
  }

  const configPath = resolve(cwd, "radish.json");
  const configExists = existsSync(configPath);

  // 1. Handle existing radish.json
  if (configExists) {
    if (useDefaults) {
      throw new RadishError(
        `"radish.json" already exists in "${cwd}". Remove it or run without --yes to overwrite interactively.`,
      );
    }
    const overwrite = await clack.confirm({
      message: `${chalk.yellow("radish.json")} already exists. Overwrite?`,
      initialValue: false,
    });
    if (clack.isCancel(overwrite) || !overwrite) {
      clack.cancel("Cancelled.");
      return;
    }
  }

  // 2. Resolve registry URL
  let registryValue: string;
  if (options.registry !== undefined) {
    registryValue = options.registry;
  } else if (useDefaults) {
    registryValue = DEFAULT_REGISTRY_URL;
  } else {
    const answer = await clack.text({
      message: "Registry URL",
      placeholder: DEFAULT_REGISTRY_URL,
      defaultValue: DEFAULT_REGISTRY_URL,
    });
    if (clack.isCancel(answer)) {
      clack.cancel("Cancelled.");
      return;
    }
    registryValue = (answer as string).trim() || DEFAULT_REGISTRY_URL;
  }

  // 3. Resolve output directory
  let outputDir: string;
  if (useDefaults) {
    outputDir = DEFAULT_OUTPUT_DIR;
  } else {
    const answer = await clack.text({
      message: "Components output directory",
      placeholder: DEFAULT_OUTPUT_DIR,
      defaultValue: DEFAULT_OUTPUT_DIR,
    });
    if (clack.isCancel(answer)) {
      clack.cancel("Cancelled.");
      return;
    }
    outputDir = (answer as string).trim() || DEFAULT_OUTPUT_DIR;
  }

  // 4. Write radish.json
  writeFileAtomic(cwd, configPath, generateRadishJson(registryValue, outputDir), configExists);
  console.log(`✓ Created radish.json`);

  // 5. Optionally create components directory
  const componentsDir = resolve(cwd, outputDir);
  let createDir: boolean;
  if (useDefaults) {
    createDir = true;
  } else {
    const answer = await clack.confirm({
      message: `Create components directory ${chalk.cyan(outputDir)}?`,
      initialValue: true,
    });
    if (clack.isCancel(answer)) {
      clack.cancel("Cancelled.");
      return;
    }
    createDir = answer as boolean;
  }

  if (createDir && !existsSync(componentsDir)) {
    mkdirSync(componentsDir, { recursive: true });
    console.log(`✓ Created ${outputDir}/`);
  }

  // 6. Optionally create a sample component
  let createSample: boolean;
  if (useDefaults) {
    createSample = false;
  } else {
    const answer = await clack.confirm({
      message: "Create a sample component?",
      initialValue: false,
    });
    if (clack.isCancel(answer)) {
      clack.cancel("Cancelled.");
      return;
    }
    createSample = answer as boolean;
  }

  if (createSample && createDir) {
    const samplePath = join(componentsDir, "sample.tsx");
    if (!existsSync(samplePath)) {
      writeFileAtomic(componentsDir, samplePath, generateSampleComponent(), false);
      console.log(`✓ Created ${outputDir}/sample.tsx`);
    }
  }

  // 7. Print install hint
  printInstallHint(detectPackageManager());

  if (!useDefaults) {
    clack.outro(chalk.bold.green("✓ radish initialized!"));
  }
}
