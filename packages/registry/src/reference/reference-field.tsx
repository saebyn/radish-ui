import React from "react";
import { useRecordContext, useReference, RecordContextProvider } from "ra-core";
import { cn } from "@radish-ui/core";

interface ReferenceFieldProps {
  /** The source field on the current record that contains the foreign key. */
  source: string;
  /** The name of the referenced resource (e.g. "authors"). */
  reference: string;
  /** The field component to render for the referenced record. */
  children: React.ReactNode;
  /** Rendered while the referenced record is loading. */
  loadingElement?: React.ReactNode;
  /** Rendered when the reference lookup fails. */
  errorElement?: React.ReactNode;
  label?: string;
  className?: string;
}

/**
 * Loads a related record and renders child field components inside its context.
 * Wraps ra-core's `useReference` to fetch and display a referenced resource.
 *
 * Copy this file into your project and customise freely.
 *
 * @example
 * // Displays the referenced author's name for each post
 * <ReferenceField source="authorId" reference="authors">
 *   <TextField source="name" />
 * </ReferenceField>
 */
export function ReferenceField({
  source,
  reference,
  children,
  loadingElement,
  errorElement,
  className,
}: ReferenceFieldProps) {
  const record = useRecordContext();
  const id = record ? (record[source] as string | number) : undefined;

  const { referenceRecord, isLoading, error } = useReference({
    reference,
    id: id as string | number,
    options: { enabled: id !== undefined && id !== null },
  });

  if (id === undefined || id === null) {
    return <span className={cn("text-sm text-gray-400 dark:text-gray-500", className)}>—</span>;
  }

  if (isLoading) {
    return (
      <span className={cn("text-sm text-gray-400 dark:text-gray-500 animate-pulse", className)}>
        {loadingElement ?? "…"}
      </span>
    );
  }

  if (error || !referenceRecord) {
    return (
      <span className={cn("text-sm text-red-500 dark:text-red-400", className)}>
        {errorElement ?? "Error"}
      </span>
    );
  }

  return (
    <RecordContextProvider value={referenceRecord}>
      <span className={className}>{children}</span>
    </RecordContextProvider>
  );
}
