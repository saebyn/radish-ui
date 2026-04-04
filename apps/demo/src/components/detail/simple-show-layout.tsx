import React from "react";
import { cn } from "@radish-ui/core";

interface SimpleShowLayoutProps {
  /** Field components (e.g. <TextField source="title" />) */
  children: React.ReactElement | React.ReactElement[];
  className?: string;
}

/**
 * Simple two-column label/value layout for a Show page.
 * Reads each child's `source` and `label` props to render a labelled row.
 *
 * Copy this file into your project and customise freely.
 *
 * @example
 * <Show resource="posts">
 *   <SimpleShowLayout>
 *     <TextField source="title" />
 *     <TextField source="author.name" label="Author" />
 *   </SimpleShowLayout>
 * </Show>
 */
export function SimpleShowLayout({ children, className }: SimpleShowLayoutProps) {
  const fields = React.Children.toArray(children) as React.ReactElement<{
    source?: string;
    label?: string;
  }>[];

  return (
    <div className={cn("rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800", className)}>
      <dl className="divide-y divide-gray-100 dark:divide-gray-700">
        {fields.map((field, i) => {
          const label =
            field.props.label ??
            (field.props.source ? capitalize(field.props.source) : `Field ${i + 1}`);

          return (
            <div
              key={field.props.source ?? i}
              className="px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4"
            >
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:col-span-2 sm:mt-0">{field}</dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
