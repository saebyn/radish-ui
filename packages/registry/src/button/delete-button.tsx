import { useRecordContext, useResourceContext, useDeleteController, useTranslate } from "ra-core";
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
  label,
  confirmTitle,
  className,
}: DeleteButtonProps) {
  const translate = useTranslate();
  const record = useRecordContext();
  const resourceContext = useResourceContext();
  const { isPending, handleDelete } = useDeleteController({
    resource: resource ?? resourceContext,
    record,
    redirect: "list",
    mutationMode: "pessimistic",
  });

  if (!record) return null;

  const resolvedLabel = label ?? translate("ra.action.delete", { _: "Delete" });
  const resolvedConfirmTitle =
    confirmTitle ??
    translate("radish.message.delete_confirm_title", {
      _: "Are you sure you want to delete this record?",
    });

  const onClick = () => {
    if (window.confirm(resolvedConfirmTitle)) {
      handleDelete();
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isPending}
      className={cn(
        "inline-flex items-center rounded-md px-2.5 py-1.5 text-xs font-medium text-danger-600 hover:bg-danger-50 hover:text-danger-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors",
        "dark:text-danger-400 dark:hover:bg-danger-900/30 dark:hover:text-danger-300",
        className,
      )}
    >
      {isPending ? translate("ra.action.delete", { _: "Delete" }) : resolvedLabel}
    </button>
  );
}
