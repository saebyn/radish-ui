import { useRecordContext } from "ra-core";

/**
 * Resolves a value from the current record context using a dot-notation path.
 *
 * @param options.source - The field path, e.g. "title" or "author.name"
 * @returns The resolved value, or undefined if not found
 *
 * @example
 * const title = useFieldValue({ source: "title" });
 * const authorName = useFieldValue({ source: "author.name" });
 */
export function useFieldValue({ source }: { source: string }) {
  const record = useRecordContext();
  if (!record) return undefined;
  return getByPath(record, source);
}

/**
 * Simple dot-notation path resolver.
 * Handles paths like "author.name" or "meta.tags.0".
 */
function getByPath(obj: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce<unknown>((current, key) => {
    if (current === null || current === undefined) return undefined;
    return (current as Record<string, unknown>)[key];
  }, obj);
}
