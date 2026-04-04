import React from "react";
import { useRecordContext, useResourceContext, useDeleteController } from "ra-core";
import { cn } from "@radish-ui/core";

interface DeleteButtonProps {
  /** Override the resource name. Defaults to the current ResourceContext. */
  resource?: string;
  label?: string;
  /** Confirmation message shown in the browser confirm dialog. */
  confirmTitle?: string;
  className?: string;
}

/**
 * Delete button for use inside a Datagrid row.
 * Calls dataProvider.delete() for the current record, with a browser confirm dialog.
 *
 * Copy this file into your project and customise freely.
 *
 * @example
 * <Datagrid>
 *   <TextField source="title" />
 *   <EditButton />
 *   <DeleteButton />
 * </Datagrid>
 */
export function DeleteButton({
  resource,
  label = "Delete",
  confirmTitle = "Are you sure you want to delete this record?",
  className,
}: DeleteButtonProps) {
  const record = useRecordContext();
  const resourceContext = useResourceContext();
  const { isPending, handleDelete } = useDeleteController({
    resource: resource ?? resourceContext,
    record,
    redirect: "list",
    mutationMode: "pessimistic",
  });

  if (!record) return null;

  const onClick = () => {
    if (window.confirm(confirmTitle)) {
      handleDelete();
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isPending}
      className={cn(
        "inline-flex items-center rounded-md px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors",
        className,
      )}
    >
      {isPending ? "Deleting…" : label}
    </button>
  );
}
