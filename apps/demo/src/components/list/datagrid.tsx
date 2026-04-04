import React from "react";
import { useListContext, RecordContextProvider } from "ra-core";
import { cn } from "@radish-ui/core";

interface DatagridProps {
  /** Field components (e.g. <TextField source="title" />) */
  children: React.ReactElement | React.ReactElement[];
  /** Optional action buttons rendered at the end of each row (e.g. <EditButton /><DeleteButton />) */
  rowActions?: React.ReactNode;
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
export function Datagrid({ children, rowActions, className }: DatagridProps) {
  const { data, isLoading } = useListContext();

  const columns = React.Children.toArray(children) as React.ReactElement<{
    source?: string;
    label?: string;
  }>[];

  if (isLoading) {
    return <div className="flex items-center justify-center py-12 text-gray-500">Loading…</div>;
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-400">No records found.</div>
    );
  }

  return (
    <div
      className={cn(
        "overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm",
        className,
      )}
    >
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col, i) => {
              const header =
                col.props.label ??
                (col.props.source ? capitalize(col.props.source) : `Column ${i + 1}`);
              return (
                <th
                  key={col.props.source ?? i}
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500"
                >
                  {header}
                </th>
              );
            })}
            {rowActions && (
              <th scope="col" className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.map((record) => (
            <RecordContextProvider key={record.id} value={record}>
              <tr className="hover:bg-indigo-50 transition-colors">
                {columns.map((col, i) => (
                  <td key={col.props.source ?? i} className="px-4 py-3 text-gray-700">
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
