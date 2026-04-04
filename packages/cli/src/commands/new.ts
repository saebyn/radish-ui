import { existsSync, lstatSync, mkdirSync, readFileSync } from "node:fs";
import { basename, relative, resolve, join } from "node:path";
import * as clack from "@clack/prompts";
import chalk from "chalk";
import { hashContent } from "../lib/hash.js";
import { loadRegistry, registryFileToRelative, type RegistryComponent } from "../lib/registry.js";
import { saveLockfile, type FileLock } from "../lib/lockfile.js";
import { writeFileAtomic } from "../lib/fs.js";
import { RadishError } from "../lib/errors.js";
import { DEFAULT_REGISTRY_URL } from "../lib/config.js";

export interface NewOptions {
  registry?: string;
  yes?: boolean;
  cwd?: string;
  /** Override the project name (used in tests; in interactive mode it is prompted). */
  projectName?: string;
}

// ---------------------------------------------------------------------------
// Project file templates
// ---------------------------------------------------------------------------

function generatePackageJson(
  projectName: string,
  dataProvider: string,
  selectedComponents: string[],
): string {
  const deps: Record<string, string> = {
    "@radish-ui/core": "^0.1.0",
    "ra-core": "^5.3.3",
    "ra-i18n-polyglot": "^5.3.3",
    "ra-language-english": "^5.3.3",
    react: "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.23.1",
  };

  if (dataProvider === "JSON Server") {
    deps["ra-data-json-server"] = "^5.3.3";
  }

  if (selectedComponents.includes("layout")) {
    deps["react-icons"] = "^5.2.1";
  }

  const devDeps: Record<string, string> = {
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.0",
    autoprefixer: "^10.4.19",
    postcss: "^8.4.38",
    tailwindcss: "^3.4.4",
    typescript: "^5.4.5",
    vite: "^5.3.1",
  };

  return `${JSON.stringify(
    {
      name: projectName,
      version: "0.1.0",
      private: true,
      type: "module",
      scripts: {
        dev: "vite",
        build: "tsc && vite build",
        preview: "vite preview",
      },
      dependencies: deps,
      devDependencies: devDeps,
    },
    null,
    2,
  )}\n`;
}

function generateTsConfig(): string {
  return `${JSON.stringify(
    {
      compilerOptions: {
        target: "ES2020",
        useDefineForClassFields: true,
        lib: ["ES2020", "DOM", "DOM.Iterable"],
        module: "ESNext",
        skipLibCheck: true,
        moduleResolution: "bundler",
        allowImportingTsExtensions: true,
        resolveJsonModule: true,
        isolatedModules: true,
        noEmit: true,
        jsx: "react-jsx",
        strict: true,
        noUnusedLocals: true,
        noUnusedParameters: true,
        noFallthroughCasesInSwitch: true,
      },
      include: ["src"],
      exclude: ["node_modules"],
    },
    null,
    2,
  )}\n`;
}

function generateViteConfig(): string {
  return `import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
});
`;
}

function generateTailwindConfig(): string {
  return `import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config;
`;
}

function generatePostCssConfig(): string {
  return `/** @type {import('postcss').ProcessOptions} */
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
`;
}

function generateIndexHtml(projectName: string): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${projectName}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`;
}

function generateMainTsx(): string {
  return `import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
// oxlint-disable-next-line no-unassigned-import -- CSS side-effect import, intentional
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
`;
}

function generateIndexCss(): string {
  return `@tailwind base;
@tailwind components;
@tailwind utilities;
`;
}

function generateViteEnvDts(): string {
  return `/// <reference types="vite/client" />
`;
}

function generateAppTsx(
  selectedComponents: string[],
  dataProvider: string,
  projectName: string,
): string {
  const imports: string[] = [
    `import { Admin } from "@radish-ui/core";`,
    `import { Resource } from "ra-core";`,
    `import polyglotI18nProvider from "ra-i18n-polyglot";`,
    `import englishMessages from "ra-language-english";`,
  ];

  if (dataProvider === "JSON Server") {
    imports.push(`import jsonServerProvider from "ra-data-json-server";`);
  }

  const hasLayout = selectedComponents.includes("layout");
  const hasDatagrid = selectedComponents.includes("datagrid");
  const hasList = selectedComponents.includes("list");
  const hasTextField = selectedComponents.includes("text-field");

  if (hasLayout) {
    imports.push(`import { Layout } from "./components/layout/layout";`);
  }
  if (hasList) {
    imports.push(`import { List } from "./components/list/list";`);
  }
  if (hasDatagrid) {
    imports.push(`import { Datagrid } from "./components/list/datagrid";`);
  }
  if (hasTextField) {
    imports.push(`import { TextField } from "./components/field/text-field";`);
  }

  const dataProviderLine =
    dataProvider === "JSON Server"
      ? `const dataProvider = jsonServerProvider("https://jsonplaceholder.typicode.com");`
      : `// TODO: Replace with your data provider\nconst dataProvider = undefined as never;`;

  const i18nLine = `const i18nProvider = polyglotI18nProvider(() => englishMessages, "en");`;

  let postListBody: string;
  if (hasList && hasDatagrid && hasTextField) {
    postListBody = `  return (
    <List resource="posts">
      <Datagrid>
          <TextField source="id" label="ID" />
          <TextField source="title" label="Title" />
          <TextField source="body" label="Body" />
          <TextField source="userId" label="User ID" />
        </Datagrid>
    </List>
  );`;
  } else if (hasList && hasTextField) {
    postListBody = `  return (
    <List resource="posts">
      <TextField source="title" label="Title" />
    </List>
  );`;
  } else {
    postListBody = `  // TODO: Add your list components here
  return <div>{/* add components here */}</div>;`;
  }

  const layoutProp = hasLayout ? `\n      layout={Layout}` : "";

  const appBody = `  return (
    <Admin
      dataProvider={dataProvider}
      i18nProvider={i18nProvider}${layoutProp}
      title="${projectName}"
    >
      <Resource name="posts" list={PostList} />
    </Admin>
  );`;

  return `${imports.join("\n")}

${dataProviderLine}

${i18nLine}

function PostList() {
${postListBody}
}

export default function App() {
${appBody}
}
`;
}

function generateRadishJson(registryValue: string): string {
  return `${JSON.stringify(
    {
      registry: registryValue,
      outputDir: "src/components",
    },
    null,
    2,
  )}\n`;
}

function generateReadme(projectName: string, packageManager: string, dataProvider: string): string {
  const runCmd = packageManager === "npm" ? "npm run" : packageManager;
  const installCmd = packageManager === "npm" ? "npm install" : `${packageManager} install`;

  const dataProviderNote =
    dataProvider === "JSON Server"
      ? "This project uses [JSON Server](https://jsonplaceholder.typicode.com) as a demo data provider."
      : "Configure your data provider in `src/App.tsx`.";

  return `# ${projectName}

A radish-ui powered React Admin application.

## Getting started

\`\`\`bash
${installCmd}
${runCmd} dev
\`\`\`

## Data Provider

${dataProviderNote}

## Adding components

Add new radish-ui components with:

\`\`\`bash
npx @radish-ui/cli add <component-name>
\`\`\`

Sync existing components to the latest version:

\`\`\`bash
npx @radish-ui/cli sync
\`\`\`

See what changed upstream for a component:

\`\`\`bash
npx @radish-ui/cli diff <component-name>
\`\`\`

## Project structure

- \`src/App.tsx\` — app entry point, wires up resources and providers
- \`src/components/\` — radish-ui components (managed by the \`radish\` CLI)
- \`radish.json\` — radish-ui configuration
- \`radish.lock.json\` — lockfile tracking component versions

## Learn more

- [radish-ui](https://github.com/saebyn/radish-ui)
- [react-admin / ra-core](https://marmelab.com/react-admin/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vite](https://vitejs.dev/)
`;
}

// ---------------------------------------------------------------------------
// Component copying
// ---------------------------------------------------------------------------

interface ComponentFileLock {
  relPath: string;
  lock: FileLock;
}

function copyComponent(
  component: RegistryComponent,
  registryDir: string,
  targetDir: string,
  force = false,
): ComponentFileLock[] {
  const fileLocks: ComponentFileLock[] = [];

  for (const registryFilePath of component.files) {
    const relPath = registryFileToRelative(registryFilePath);
    const srcPath = resolve(registryDir, registryFilePath);

    if (!existsSync(srcPath)) {
      console.warn(`⚠ Registry file not found: ${srcPath}. Skipping.`);
      continue;
    }

    const content = readFileSync(srcPath);
    const hash = hashContent(content);
    const destPath = join(targetDir, relPath);
    writeFileAtomic(targetDir, destPath, content, force);

    fileLocks.push({ relPath, lock: { registryHash: hash, localHash: hash } });
  }

  return fileLocks;
}

// ---------------------------------------------------------------------------
// Main command
// ---------------------------------------------------------------------------

export async function newCommand(
  outDirArg: string | undefined,
  options: NewOptions,
): Promise<void> {
  const cwd = options.cwd ?? process.cwd();
  const useDefaults = options.yes === true || !process.stdin.isTTY;

  if (!useDefaults) {
    clack.intro(chalk.bold.cyan("✦ radish new"));
  }

  // 1. Resolve output directory
  const outDir =
    outDirArg !== undefined && outDirArg.trim().length > 0 ? outDirArg.trim() : "my-admin";
  const projectDir = resolve(cwd, outDir);
  const dirBasename = basename(outDir) || outDir;

  // 2. Handle existing directory (before prompting for name, so the user can bail early)
  let overwriteExisting = false;
  if (existsSync(projectDir)) {
    const stat = lstatSync(projectDir);
    if (!stat.isDirectory()) {
      throw new RadishError(
        `"${outDir}" already exists and is not a directory. Choose a different name.`,
      );
    }
    if (useDefaults) {
      throw new RadishError(
        `Directory "${outDir}" already exists. Remove it or choose a different name.`,
      );
    }
    const overwrite = await clack.confirm({
      message: `Directory "${chalk.yellow(outDir)}" already exists. Continue and overwrite existing files?`,
      initialValue: false,
    });
    if (clack.isCancel(overwrite) || !overwrite) {
      clack.cancel("Cancelled.");
      return;
    }
    overwriteExisting = true;
  }

  // 3. Resolve project name (defaults to the directory basename)
  const nameDefault = /^[a-z0-9][a-z0-9._-]*$/.test(dirBasename) ? dirBasename : "my-admin";
  let projectName: string;
  if (options.projectName !== undefined && options.projectName.trim().length > 0) {
    projectName = options.projectName.trim();
  } else if (useDefaults) {
    projectName = nameDefault;
  } else {
    const answer = await clack.text({
      message: "Project name",
      placeholder: nameDefault,
      defaultValue: nameDefault,
      validate: (v) => {
        const name = v?.trim() || nameDefault;
        if (!/^[a-z0-9][a-z0-9._-]*$/.test(name)) {
          return "Must start with a lowercase letter or digit and contain only lowercase letters, digits, dots, underscores, and hyphens.";
        }
      },
    });
    if (clack.isCancel(answer)) {
      clack.cancel("Cancelled.");
      return;
    }
    projectName = (answer as string).trim() || nameDefault;
  }

  if (!/^[a-z0-9][a-z0-9._-]*$/.test(projectName)) {
    throw new RadishError(
      `Invalid project name "${projectName}". Must start with a lowercase letter or digit and contain only lowercase letters, digits, dots, underscores, and hyphens.`,
    );
  }

  // 4. Load registry component list (for the multi-select prompt)
  let availableComponents: string[] = [];
  let registryDir: string | undefined;

  if (options.registry !== undefined) {
    registryDir = resolve(cwd, options.registry);
    try {
      const registry = loadRegistry(registryDir);
      availableComponents = registry.components.map((c) => c.name);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      throw new RadishError(`Could not load registry at "${registryDir}": ${message}`);
    }
  } else {
    // No registry provided; use the known default component names for the prompt
    availableComponents = ["layout", "datagrid", "list", "text-field"];
  }

  // 5. Select components
  let selectedComponents: string[];
  if (useDefaults) {
    selectedComponents = [...availableComponents];
  } else {
    const answer = await clack.multiselect<string>({
      message: "Select components to include",
      options: availableComponents.map((c) => ({ value: c, label: c })),
      required: false,
    });
    if (clack.isCancel(answer)) {
      clack.cancel("Cancelled.");
      return;
    }
    selectedComponents = answer as string[];
  }

  // 6. Data provider
  const dataProviderChoices = ["JSON Server", "None"] as const;
  type DataProvider = (typeof dataProviderChoices)[number];
  let dataProvider: DataProvider;
  if (useDefaults) {
    dataProvider = dataProviderChoices[0];
  } else {
    const answer = await clack.select<DataProvider>({
      message: "Data provider",
      options: dataProviderChoices.map((c) => ({ value: c, label: c })),
      initialValue: dataProviderChoices[0],
    });
    if (clack.isCancel(answer)) {
      clack.cancel("Cancelled.");
      return;
    }
    dataProvider = answer as DataProvider;
  }

  // 7. Package manager
  const pmChoices = ["pnpm", "npm", "yarn"] as const;
  type PackageManager = (typeof pmChoices)[number];
  let packageManager: PackageManager;
  if (useDefaults) {
    packageManager = pmChoices[0];
  } else {
    const answer = await clack.select<PackageManager>({
      message: "Package manager",
      options: pmChoices.map((c) => ({ value: c, label: c })),
      initialValue: pmChoices[0],
    });
    if (clack.isCancel(answer)) {
      clack.cancel("Cancelled.");
      return;
    }
    packageManager = answer as PackageManager;
  }

  // 8. Create directory structure and write files
  const spin = useDefaults ? null : clack.spinner();
  spin?.start("Scaffolding project…");

  const srcDir = join(projectDir, "src");
  mkdirSync(srcDir, { recursive: true });

  const registryJsonValue =
    registryDir !== undefined ? relative(projectDir, registryDir) : DEFAULT_REGISTRY_URL;

  const files: Array<{ path: string; content: string }> = [
    {
      path: join(projectDir, "package.json"),
      content: generatePackageJson(projectName, dataProvider, selectedComponents),
    },
    { path: join(projectDir, "tsconfig.json"), content: generateTsConfig() },
    { path: join(projectDir, "vite.config.ts"), content: generateViteConfig() },
    { path: join(projectDir, "tailwind.config.ts"), content: generateTailwindConfig() },
    { path: join(projectDir, "postcss.config.js"), content: generatePostCssConfig() },
    { path: join(projectDir, "index.html"), content: generateIndexHtml(projectName) },
    { path: join(srcDir, "main.tsx"), content: generateMainTsx() },
    {
      path: join(srcDir, "App.tsx"),
      content: generateAppTsx(selectedComponents, dataProvider, projectName),
    },
    { path: join(srcDir, "index.css"), content: generateIndexCss() },
    { path: join(srcDir, "vite-env.d.ts"), content: generateViteEnvDts() },
    {
      path: join(projectDir, "radish.json"),
      content: generateRadishJson(registryJsonValue),
    },
    {
      path: join(projectDir, "README.md"),
      content: generateReadme(projectName, packageManager, dataProvider),
    },
  ];

  for (const { path, content } of files) {
    writeFileAtomic(projectDir, path, content, overwriteExisting);
  }

  // 9. Copy component files (if registry available)
  const lockfileComponents: Record<string, { files: Record<string, FileLock> }> = {};

  if (registryDir !== undefined && selectedComponents.length > 0) {
    const registry = loadRegistry(registryDir);
    const componentsDir = join(srcDir, "components");
    mkdirSync(componentsDir, { recursive: true });

    for (const componentName of selectedComponents) {
      const component = registry.components.find((c) => c.name === componentName);
      if (component === undefined) {
        if (!useDefaults)
          clack.log.warn(`Component "${componentName}" not found in registry. Skipping.`);
        continue;
      }

      const fileLocks = copyComponent(component, registryDir, componentsDir, overwriteExisting);
      if (fileLocks.length > 0) {
        const filesRecord: Record<string, FileLock> = {};
        for (const { relPath, lock } of fileLocks) {
          filesRecord[relPath] = lock;
        }
        lockfileComponents[componentName] = { files: filesRecord };
      }
    }

    saveLockfile(projectDir, { components: lockfileComponents });
  } else {
    saveLockfile(projectDir, { components: {} });
  }

  spin?.stop(chalk.green(`Scaffolded ${projectName}`));

  // 10. Print next steps
  const installCmd =
    packageManager === "npm" ? "npm install" : packageManager === "yarn" ? "yarn" : "pnpm install";
  const devCmd =
    packageManager === "npm" ? "npm run dev" : packageManager === "yarn" ? "yarn dev" : "pnpm dev";

  if (useDefaults) {
    console.log(`\n✅ Created ${projectName} at ./${outDir}\n`);
    console.log("Next steps:");
    console.log(`  cd ${outDir}`);
    console.log(`  ${installCmd}`);
    if (registryDir === undefined && selectedComponents.length > 0) {
      console.log(`  radish add ${selectedComponents.join(" ")}   # copy components from registry`);
    }
    console.log(`  ${devCmd}`);
    console.log("");
  } else {
    const nextSteps = [
      chalk.cyan(`cd ${outDir}`),
      chalk.cyan(installCmd),
      ...(registryDir === undefined && selectedComponents.length > 0
        ? [
            chalk.cyan(`radish add ${selectedComponents.join(" ")}`) +
              chalk.dim("   # copy components from registry"),
          ]
        : []),
      chalk.cyan(devCmd),
    ]
      .map((line) => `  ${line}`)
      .join("\n");

    clack.outro(
      `${chalk.green("✓")} Created ${chalk.bold(projectName)} at ${chalk.dim(`./${outDir}`)}\n\n${chalk.bold("Next steps:")}\n${nextSteps}`,
    );
  }
}
