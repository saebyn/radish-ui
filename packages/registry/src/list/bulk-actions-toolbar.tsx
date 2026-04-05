import React from "react";
import { useListContext } from "ra-core";
import { cn } from "@radish-ui/core";

interface BulkActionsToolbarProps {
  /** Action buttons to render (e.g. <BulkDeleteButton />). */
  children: React.ReactNode;
  /** Label prefix. "{count} selected" is appended. */
  label?: string;
  className?: string;
}

/**
 * Toolbar that appears above the datagrid when one or more rows are selected.
 * Reads `selectedIds` from `useListContext` and only renders when the count > 0.
 *
 * Copy this file into your project and customise freely.
 *
 * @example
 * <BulkActionsToolbar>
 *   <BulkDeleteButton />
 * </BulkActionsToolbar>
 */
export function BulkActionsToolbar({ children, label = "", className }: BulkActionsToolbarProps) {
  const { selectedIds } = useListContext();

  if (!selectedIds || selectedIds.length === 0) return null;

  const count = selectedIds.length;

  return (
    <div
      role="toolbar"
      aria-label={`${count} item${count !== 1 ? "s" : ""} selected`}
      className={cn(
        "flex items-center justify-between rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm",
        "dark:border-indigo-700 dark:bg-indigo-900/30",
        className,
      )}
    >
      <span className="font-medium text-indigo-700 dark:text-indigo-300">
        {label}
        {count} {count === 1 ? "item" : "items"} selected
      </span>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
}
