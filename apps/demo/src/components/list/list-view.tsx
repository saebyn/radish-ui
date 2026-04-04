import React from "react";
import { useListContext } from "ra-core";
import { cn } from "@radish-ui/core";

interface ListViewProps {
  /** The datagrid or other list content */
  children: React.ReactNode;
  /** Optional toolbar (e.g. create button) rendered above the list */
  actions?: React.ReactNode;
  /** Optional filters rendered above the list */
  filters?: React.ReactNode;
  /** Optional aside panel rendered alongside the list */
  aside?: React.ReactNode;
  className?: string;
}

/**
 * List page container component.
 * Reads list state from useListContext (title, loading, error) and renders appropriate UI.
 *
 * Copy this file into your project and customise freely.
 *
 * @example
 * <ListBase resource="posts">
 *   <ListView>
 *     <Datagrid>
 *       <TextField source="title" />
 *     </Datagrid>
 *   </ListView>
 * </ListBase>
 */
export function ListView({ children, actions, filters, aside, className }: ListViewProps) {
  const { defaultTitle, error, isLoading } = useListContext();

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
        <strong>Error loading data:</strong>{" "}
        {error instanceof Error ? error.message : String(error)}
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Page header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">{defaultTitle}</h1>
        {actions && <div>{actions}</div>}
      </div>

      {/* Filters */}
      {filters && <div>{filters}</div>}

      {/* Content + optional aside */}
      <div className="flex gap-4">
        <div className="flex-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-gray-500">Loading…</div>
          ) : (
            children
          )}
        </div>
        {aside && <div className="w-64 shrink-0">{aside}</div>}
      </div>
    </div>
  );
}
