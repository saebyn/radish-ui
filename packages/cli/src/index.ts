import { Command } from "commander";
import { createRequire } from "node:module";
import { addCommand } from "./commands/add.js";
import { syncCommand } from "./commands/sync.js";
import { diffCommand } from "./commands/diff.js";
import { newCommand } from "./commands/new.js";
import { RadishError } from "./lib/errors.js";
import { DEFAULT_OUTPUT_DIR } from "./lib/config.js";

const require = createRequire(import.meta.url);
const packageJson = require("../package.json") as { version: string };

const program = new Command();

program
  .name("radish")
  .description("CLI for managing radish-ui registry components")
  .version(packageJson.version);

program
  .command("add <components...>")
  .description("Copy one or more components from the registry into your project")
  .option(
    "--registry <path>",
    "Path or URL to registry (local path or https:// URL; defaults to GitHub raw URL)",
  )
  .option("--target <path>", `Output directory (default: ./${DEFAULT_OUTPUT_DIR})`)
  .option("--force", "Overwrite existing files")
  .action(addCommand);

program
  .command("sync")
  .description("Update previously-added components to the latest registry versions")
  .option(
    "--registry <path>",
    "Path or URL to registry (local path or https:// URL; defaults to GitHub raw URL)",
  )
  .option("--target <path>", `Output directory (default: ./${DEFAULT_OUTPUT_DIR})`)
  .option("--force", "Overwrite all files, ignoring local modifications")
  .action(syncCommand);

program
  .command("diff <component>")
  .description("Show what changed upstream since you last synced a component")
  .option(
    "--registry <path>",
    "Path or URL to registry (local path or https:// URL; defaults to GitHub raw URL)",
  )
  .option("--target <path>", `Output directory (default: ./${DEFAULT_OUTPUT_DIR})`)
  .action(diffCommand);

program
  .command("new [project-name]")
  .description("Scaffold a new radish-ui powered react-admin project")
  .option("--registry <path>", "Path to a local registry directory to copy components from")
  .option("-y, --yes", "Accept all defaults and skip interactive prompts")
  .action(newCommand);

program.parseAsync(process.argv).catch((err) => {
  if (err instanceof RadishError) {
    console.error(`Error: ${err.message}`);
  } else {
    console.error(err);
  }
  process.exitCode = 1;
});
