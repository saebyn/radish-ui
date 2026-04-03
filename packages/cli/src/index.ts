import { Command } from "commander";
import { createRequire } from "node:module";
import { addCommand } from "./commands/add.js";
import { syncCommand } from "./commands/sync.js";
import { diffCommand } from "./commands/diff.js";
import { RadishError } from "./lib/errors.js";

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
  .option("--registry <path>", "Path to registry directory")
  .option("--target <path>", "Output directory (default: ./src/components/radish)")
  .option("--force", "Overwrite existing files")
  .action(addCommand);

program
  .command("sync")
  .description("Update previously-added components to the latest registry versions")
  .option("--registry <path>", "Path to registry directory")
  .option("--target <path>", "Output directory (default: ./src/components/radish)")
  .option("--force", "Overwrite all files, ignoring local modifications")
  .action(syncCommand);

program
  .command("diff <component>")
  .description("Show what changed upstream since you last synced a component")
  .option("--registry <path>", "Path to registry directory")
  .action(diffCommand);

program.parseAsync(process.argv).catch((error) => {
  if (error instanceof RadishError) {
    console.error(`Error: ${error.message}`);
  } else {
    console.error(error);
  }
  process.exitCode = 1;
});
