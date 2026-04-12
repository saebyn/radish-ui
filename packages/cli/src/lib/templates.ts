import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

export type TemplateTokens = Record<string, string>;

/**
 * Converts a folder name (e.g. "field") to title case (e.g. "Field").
 * Handles hyphenated folder names like "error-boundary" → "Error Boundary".
 */
function toTitleCase(str: string): string {
  return str
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Builds the standard token map for a new component scaffold.
 *
 * @param componentName - PascalCase component name, e.g. "MyField"
 * @param kebabName     - kebab-case file name, e.g. "my-field"
 * @param folder        - registry subfolder, e.g. "field"
 */
export function buildTokens(
  componentName: string,
  kebabName: string,
  folder: string,
): TemplateTokens {
  return {
    __COMPONENT_NAME__: componentName,
    __KEBAB_NAME__: kebabName,
    __FOLDER__: folder,
    __STORYBOOK_TITLE__: `${toTitleCase(folder)}/${componentName}`,
  };
}

/**
 * Reads a `.tmpl` file and replaces all tokens with their values.
 *
 * @param templateName - File name without path, e.g. "component.tsx.tmpl"
 * @param tokens       - Token map produced by {@link buildTokens}
 * @param templatesDir - Override the templates directory (used in tests to
 *                       point at `src/templates/` without a built `dist/`).
 *                       Defaults to the same directory as the compiled
 *                       `dist/index.js` at runtime (tsup publicDir copies
 *                       template files flat into dist/).
 */
export function renderTemplate(
  templateName: string,
  tokens: TemplateTokens,
  templatesDir?: string,
): string {
  const dir = templatesDir ?? dirname(fileURLToPath(import.meta.url));
  const templatePath = resolve(dir, templateName);
  let content = readFileSync(templatePath, "utf-8");
  for (const [token, value] of Object.entries(tokens)) {
    content = content.replaceAll(token, value);
  }
  return content;
}
