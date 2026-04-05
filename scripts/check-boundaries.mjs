#!/usr/bin/env node
/**
 * Validates monorepo dependency boundaries.
 *
 * Enforced rules:
 *   - @radish-ui/core  must not import from @radish-ui/cli or @radish-ui/registry
 *   - @radish-ui/cli   must not import from @radish-ui/registry
 *   - @radish-ui/registry must not import from @radish-ui/cli
 *   - apps/demo must not import directly from @radish-ui/registry (use the CLI
 *     copy/paste model instead)
 *
 * Both package.json dependencies and TypeScript source imports are checked to
 * catch violations early and in two complementary ways.
 */

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { resolve, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const ROOT_DIR = resolve(__dirname, "..");

// ---------------------------------------------------------------------------
// Boundary rules
// Each entry declares which @radish-ui/* imports are FORBIDDEN for that scope.
// ---------------------------------------------------------------------------

/** @type {Array<{package: string, forbidden: string[], description: string}>} */
const BOUNDARY_RULES = [
  {
    package: "packages/core",
    forbidden: ["@radish-ui/cli", "@radish-ui/registry"],
    description: "@radish-ui/core must not depend on @radish-ui/cli or @radish-ui/registry",
  },
  {
    package: "packages/cli",
    forbidden: ["@radish-ui/registry"],
    description: "@radish-ui/cli must not depend on @radish-ui/registry",
  },
  {
    package: "packages/registry",
    forbidden: ["@radish-ui/cli"],
    description: "@radish-ui/registry must not depend on @radish-ui/cli",
  },
  {
    package: "apps/demo",
    forbidden: ["@radish-ui/registry"],
    description:
      "apps/demo must not import directly from @radish-ui/registry — " +
      "use the CLI copy/paste model (pnpm sync) instead",
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let errors = 0;

function error(msg) {
  console.error(`  ✗ ${msg}`);
  errors++;
}

function ok(msg) {
  console.log(`  ✓ ${msg}`);
}

/**
 * Yields absolute paths for every .js/.ts/.jsx/.tsx file under `dir`,
 * skipping node_modules, dist and .storybook sub-trees.
 */
function* walkSourceFiles(dir) {
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      if (entry !== "node_modules" && entry !== "dist" && entry !== ".storybook") {
        yield* walkSourceFiles(fullPath);
      }
    } else if (/\.[jt]sx?$/.test(entry)) {
      yield fullPath;
    }
  }
}

/**
 * Strips block comments, line comments, and template-literal bodies from
 * TypeScript/JavaScript source text.  This prevents false positives when the
 * same `@radish-ui/…` string appears inside a doc-comment or a code-generation
 * template string.
 *
 * Double-quoted and single-quoted string literals are left intact because
 * `import … from "specifier"` relies on the specifier surviving the strip.
 *
 * Newlines inside removed regions are preserved so that line numbers in
 * error messages remain accurate.
 *
 * Template literal parsing uses mutual recursion between skipTemplateBody()
 * and skipExpressionBody() to correctly handle nested template expressions
 * such as  `` `outer ${ `inner` } end` `` .
 */
function stripNonImportContexts(content) {
  // Use an object so inner functions share and mutate the scan position.
  const state = { pos: 0, out: "" };
  const len = content.length;

  function peek(offset = 0) {
    return content[state.pos + offset];
  }

  function advance() {
    return content[state.pos++];
  }

  /** Skip a template literal body (opening `` ` `` already consumed). */
  function skipTemplateBody() {
    while (state.pos < len) {
      const c = advance();
      if (c === "\\") {
        // Escape sequence — skip next char regardless of what it is.
        if (state.pos < len) state.pos++;
      } else if (c === "$" && peek() === "{") {
        state.pos++; // consume {
        skipExpressionBody();
      } else if (c === "`") {
        // Closing backtick — template literal ends.
        return;
      } else if (c === "\n") {
        // Preserve newlines for accurate error positions.
        state.out += "\n";
      }
    }
  }

  /** Skip a template expression body (opening `${` already consumed). */
  function skipExpressionBody() {
    let depth = 1;
    while (state.pos < len && depth > 0) {
      const c = advance();
      if (c === "\\") {
        if (state.pos < len) state.pos++;
      } else if (c === "{") {
        depth++;
      } else if (c === "}") {
        depth--;
      } else if (c === "`") {
        // Nested template literal inside ${…} — recurse.
        skipTemplateBody();
      } else if (c === '"') {
        // String literal inside expression — skip to closing quote.
        while (state.pos < len && peek() !== '"' && peek() !== "\n") {
          if (advance() === "\\") if (state.pos < len) state.pos++;
        }
        if (state.pos < len) state.pos++; // consume closing "
      } else if (c === "'") {
        while (state.pos < len && peek() !== "'" && peek() !== "\n") {
          if (advance() === "\\") if (state.pos < len) state.pos++;
        }
        if (state.pos < len) state.pos++; // consume closing '
      }
    }
  }

  while (state.pos < len) {
    const ch = peek();

    // Block comment  /* … */
    if (ch === "/" && peek(1) === "*") {
      state.pos += 2;
      while (state.pos < len && !(peek() === "*" && peek(1) === "/")) {
        if (advance() === "\n") state.out += "\n";
      }
      state.pos += 2; // consume closing */
      continue;
    }

    // Line comment  // …
    if (ch === "/" && peek(1) === "/") {
      while (state.pos < len && peek() !== "\n") state.pos++;
      continue;
    }

    // Template literal  ` … `  — strip body, preserve newlines
    if (ch === "`") {
      state.pos++; // consume opening backtick
      skipTemplateBody();
      continue;
    }

    state.out += advance();
  }

  return state.out;
}

/**
 * Returns the set of @radish-ui/* package specifiers that are actually
 * imported (via static `import … from` or `export … from`) in the file.
 */
function extractRadishImports(filePath) {
  const raw = readFileSync(filePath, "utf-8");
  const content = stripNonImportContexts(raw);

  const found = new Set();
  // Matches the package name in:  import … from "@radish-ui/pkg"
  //                               export … from '@radish-ui/pkg'
  const re = /\bfrom\s+['"](@radish-ui\/[^'"]+)['"]/g;
  let match;
  while ((match = re.exec(content)) !== null) {
    found.add(match[1]);
  }
  return found;
}

// ---------------------------------------------------------------------------
// Check 1: package.json declared dependencies
// ---------------------------------------------------------------------------

console.log("\nChecking package.json dependency declarations\n");

for (const rule of BOUNDARY_RULES) {
  const pkgPath = resolve(ROOT_DIR, rule.package, "package.json");

  if (!existsSync(pkgPath)) {
    error(`${rule.package}/package.json not found`);
    continue;
  }

  let pkg;
  try {
    pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
  } catch {
    error(`${rule.package}/package.json is not valid JSON`);
    continue;
  }

  const allDeps = {
    ...pkg.dependencies,
    ...pkg.devDependencies,
    ...pkg.peerDependencies,
    ...pkg.optionalDependencies,
  };

  let pkgViolations = 0;
  for (const forbidden of rule.forbidden) {
    if (Object.prototype.hasOwnProperty.call(allDeps, forbidden)) {
      error(
        `${rule.package}/package.json declares "${forbidden}" as a dependency — ${rule.description}`,
      );
      pkgViolations++;
    }
  }
  if (pkgViolations === 0) {
    ok(`${rule.package}/package.json has no forbidden dependency declarations`);
  }
}

// ---------------------------------------------------------------------------
// Check 2: Source file imports
// ---------------------------------------------------------------------------

console.log("\nChecking source file imports\n");

for (const rule of BOUNDARY_RULES) {
  const srcDir = resolve(ROOT_DIR, rule.package, "src");

  if (!existsSync(srcDir)) {
    // Some packages (e.g. docs) may not have a src/ directory — skip silently.
    continue;
  }

  let violations = 0;

  for (const filePath of walkSourceFiles(srcDir)) {
    const imports = extractRadishImports(filePath);
    for (const imp of imports) {
      const isForbidden = rule.forbidden.some(
        (forbidden) => imp === forbidden || imp.startsWith(`${forbidden}/`),
      );
      if (isForbidden) {
        const relPath = relative(ROOT_DIR, filePath);
        error(`${relPath} imports "${imp}" — ${rule.description}`);
        violations++;
      }
    }
  }

  if (violations === 0) {
    ok(`No forbidden imports found in ${rule.package}/src`);
  }
}

// ---------------------------------------------------------------------------
// Final result
// ---------------------------------------------------------------------------

if (errors > 0) {
  console.error(`\n✗ Boundary check failed with ${errors} violation(s).\n`);
  process.exit(1);
} else {
  console.log(`\n✓ All boundary checks passed.\n`);
}
