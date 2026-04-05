import React from "react";
import { useListContext, useTranslate } from "ra-core";
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
export function BulkActionsToolbar({ children, label, className }: BulkActionsToolbarProps) {
  const translate = useTranslate();
  const { selectedIds } = useListContext();

  if (!selectedIds || selectedIds.length === 0) return null;

  const count = selectedIds.length;
  const resolvedLabel =
    label ??
    translate("ra.action.bulk_actions", {
      smart_count: count,
      _: `${count} ${count === 1 ? "item" : "items"} selected`,
    });

  return (
    <div
      role="toolbar"
      aria-label={resolvedLabel}
      className={cn(
        "flex items-center justify-between rounded-lg border border-primary-200 bg-primary-50 px-4 py-2 text-sm",
        "dark:border-primary-700 dark:bg-primary-900/30",
        className,
      )}
    >
      <span className="font-medium text-primary-700 dark:text-primary-300">
        {resolvedLabel}
      </span>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
}
