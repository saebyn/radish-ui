import React from "react";
import { useListContext, RecordContextProvider, useTranslate } from "ra-core";
import { cn } from "@radish-ui/core";
import { Skeleton, SkeletonContainer } from "../skeleton/skeleton";

interface DatagridProps {
  /** Field components (e.g. <TextField source="title" />) */
  children: React.ReactElement | React.ReactElement[];
  /** Optional action buttons rendered at the end of each row (e.g. <EditButton /><DeleteButton />) */
  rowActions?: React.ReactNode;
  /** Accessible label for the table. Defaults to the resource's default title. */
  label?: string;
  className?: string;
}

/**
 * Table-based datagrid component.
 * Reads the current list from useListContext and renders one row per record.
 * Accepts field components as children and renders them for each row via RecordContextProvider.
 *
 * Column headers are derived from children's `label` prop, falling back to the capitalised `source`.
 *
 * Copy this file into your project and customise freely.
 *
 * @example
 * <Datagrid>
 *   <TextField source="id" label="ID" />
 *   <TextField source="title" />
 * </Datagrid>
 */
export function Datagrid({ children, rowActions, label, className }: DatagridProps) {
  const translate = useTranslate();
  const { data, isLoading, defaultTitle } = useListContext();

  const columns = React.Children.toArray(children) as React.ReactElement<{
    source?: string;
    label?: string;
  }>[];

  if (isLoading) {
    return (
      <SkeletonContainer
        label={translate("ra.page.loading", { _: "Loading table data…" })}
        className={cn(
          "overflow-x-auto rounded-lg border border-neutral-200 bg-canvas-0 shadow-sm dark:border-neutral-700 dark:bg-canvas-800",
          className,
        )}
      >
        <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700 text-sm">
          <thead className="bg-canvas-50 dark:bg-canvas-700">
            <tr>
              {columns.map((col, i) => {
                const header =
                  col.props.label ??
                  (col.props.source ? capitalize(col.props.source) : `Column ${i + 1}`);
                return (
                  <th
                    key={col.props.source ?? i}
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400"
                  >
                    {header}
                  </th>
                );
              })}
              {rowActions && (
                <th
                  scope="col"
                  className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400"
                >
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-700">
            {Array.from({ length: 5 }).map((_, rowIdx) => (
              <tr key={rowIdx}>
                {columns.map((col, colIdx) => (
                  <td key={col.props.source ?? colIdx} className="px-4 py-3">
                    <Skeleton className="h-4" />
                  </td>
                ))}
                {rowActions && (
                  <td className="px-4 py-3 text-right">
                    <Skeleton className="ml-auto h-4 w-16" />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </SkeletonContainer>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-neutral-400 dark:text-neutral-500">
        No records found.
      </div>
    );
  }

  return (
    <div
      className={cn(
        "overflow-x-auto rounded-lg border border-neutral-200 bg-canvas-0 shadow-sm dark:border-neutral-700 dark:bg-canvas-800",
        className,
      )}
    >
      <table
        aria-label={label ?? defaultTitle ?? undefined}
        className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700 text-sm"
      >
        <thead className="bg-canvas-50 dark:bg-canvas-700">
          <tr>
            {columns.map((col, i) => {
              const header =
                col.props.label ??
                (col.props.source ? capitalize(col.props.source) : `Column ${i + 1}`);
              return (
                <th
                  key={col.props.source ?? i}
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400"
                >
                  {header}
                </th>
              );
            })}
            {rowActions && (
              <th
                scope="col"
                className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400"
              >
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100 dark:divide-neutral-700">
          {data.map((record) => (
            <RecordContextProvider key={record.id} value={record}>
              <tr className="hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors">
                {columns.map((col, i) => (
                  <td
                    key={col.props.source ?? i}
                    className="px-4 py-3 text-neutral-700 dark:text-neutral-300"
                  >
                    {col}
                  </td>
                ))}
                {rowActions && (
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">{rowActions}</div>
                  </td>
                )}
              </tr>
            </RecordContextProvider>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
