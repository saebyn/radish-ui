import React from "react";
import { useFieldValue, cn } from "@radish-ui/core";
import { RecordContextProvider } from "ra-core";

interface ArrayFieldProps {
  source: string;
  label?: string;
  /**
   * The field component(s) to render for each item.
   * Each item is set as the record in a `RecordContextProvider` so nested
   * field components (e.g. `<ChipField source="name" />`) resolve correctly.
   */
  children: React.ReactNode;
  className?: string;
}

/**
 * Iterates over an array field value and renders child fields for each item.
 * Each array element is exposed via a `RecordContextProvider` so children
 * can use `source` props to access nested values.
 *
 * Copy this file into your project and customise freely.
 *
 * @example
 * // Record: { id: 1, tags: [{ id: 1, name: "React" }, { id: 2, name: "TypeScript" }] }
 * <ArrayField source="tags">
 *   <ChipField source="name" />
 * </ArrayField>
 */
export function ArrayField({ source, children, className }: ArrayFieldProps) {
  const value = useFieldValue({ source });

  if (!Array.isArray(value) || value.length === 0) {
    return (
      <span className={cn("text-sm text-neutral-400 dark:text-neutral-500", className)}>—</span>
    );
  }

  return (
    <ul role="list" className={cn("flex flex-wrap gap-1 list-none p-0 m-0", className)}>
      {value.map((item, index) => {
        const record =
          item !== null && typeof item === "object"
            ? (item as Record<string, unknown>)
            : { id: index, value: item };
        return (
          <li key={record.id !== undefined ? String(record.id) : index}>
            <RecordContextProvider value={record}>{children}</RecordContextProvider>
          </li>
        );
      })}
    </ul>
  );
}
