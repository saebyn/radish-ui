import { Command } from "commander";
import { createRequire } from "node:module";
import { addCommand } from "./commands/add.js";
import { removeCommand } from "./commands/remove.js";
import { syncCommand } from "./commands/sync.js";
import { diffCommand } from "./commands/diff.js";
import { newCommand } from "./commands/new.js";
import { initCommand } from "./commands/init.js";
import { listCommand } from "./commands/list.js";
import { generateCommand, VALID_FOLDERS } from "./commands/generate.js";
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
  .command("remove <components...>")
  .description("Remove one or more installed components from your project")
  .option("--target <path>", `Output directory (default: ./${DEFAULT_OUTPUT_DIR})`)
  .option("--force", "Remove files even if they have local modifications")
  .action(removeCommand);

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
  .command("diff [component]")
  .description("Show drift for a component, or all components when no argument is given")
  .option(
    "--registry <path>",
    "Path or URL to registry (local path or https:// URL; defaults to GitHub raw URL)",
  )
  .option("--target <path>", `Output directory (default: ./${DEFAULT_OUTPUT_DIR})`)
  .action(diffCommand);

program
  .command("new [directory]")
  .description("Scaffold a new radish-ui powered react-admin project")
  .option("--registry <path>", "Path to a local registry directory to copy components from")
  .option("-y, --yes", "Accept all defaults and skip interactive prompts")
  .action(newCommand);

program
  .command("init")
  .description("Initialize radish-ui in an existing project")
  .option("--registry <url>", "Registry URL or path to use in radish.json")
  .option("-y, --yes", "Accept all defaults and skip interactive prompts")
  .action(initCommand);

program
  .command("list")
  .description("Show all components available in the registry and which ones are installed")
  .option(
    "--registry <path>",
    "Path or URL to registry (local path or https:// URL; defaults to GitHub raw URL)",
  )
  .action(listCommand);

program
  .command("generate <ComponentName>")
  .description(
    "Scaffold a new registry component with a stub .tsx file, Storybook story, and Vitest test",
  )
  .option(
    "--folder <domain>",
    `Registry subfolder to place the component in (default: custom). Valid folders: ${VALID_FOLDERS.join(", ")}`,
  )
  .option("--dry-run", "Print what would be created without writing any files")
  .option("--list-folders", "Print valid folder names and exit")
  .action(generateCommand);

program.parseAsync(process.argv).catch((err) => {
  if (err instanceof RadishError) {
    console.error(`Error: ${err.message}`);
  } else {
    console.error(err);
  }
  process.exitCode = 1;
});
