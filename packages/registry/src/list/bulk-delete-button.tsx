import { useState } from "react";
import { useResourceContext, useBulkDeleteController, useListContext, useTranslate } from "ra-core";
import { cn } from "@radish-ui/core";
import { Confirm } from "../dialog/confirm";

interface BulkDeleteButtonProps {
  /** Override the resource name. Defaults to the current ResourceContext. */
  resource?: string;
  label?: string;
  /** Title shown in the confirm dialog. */
  confirmTitle?: string;
  /** Body text shown in the confirm dialog. */
  confirmContent?: string;
  className?: string;
}

/**
 * Bulk-delete button for use inside a `<BulkActionsToolbar>`.
 * Acts on `selectedIds` from the list context and shows a `<Confirm>` dialog.
 *
 * Copy this file into your project and customise freely.
 *
 * @example
 * <BulkActionsToolbar>
 *   <BulkDeleteButton />
 * </BulkActionsToolbar>
 */
export function BulkDeleteButton({
  resource,
  label,
  confirmTitle,
  confirmContent,
  className,
}: BulkDeleteButtonProps) {
  const translate = useTranslate();
  const resourceContext = useResourceContext();
  const { selectedIds } = useListContext();
  const [open, setOpen] = useState(false);

  const { handleDelete, isPending } = useBulkDeleteController({
    resource: resource ?? resourceContext,
    mutationMode: "pessimistic",
  });

  const count = selectedIds?.length ?? 0;
  const resourceName = resource ?? resourceContext ?? "items";
  const resolvedLabel = label ?? translate("ra.action.delete", { _: "Delete" });
  const resolvedConfirmTitle =
    confirmTitle ??
    translate("ra.message.bulk_delete_title", {
      smart_count: count,
      name: resourceName,
      _: "Delete selected items?",
    });
  const resolvedConfirmContent =
    confirmContent ??
    translate("ra.message.bulk_delete_content", {
      smart_count: count,
      name: resourceName,
      _: "This action cannot be undone.",
    });

  const handleConfirm = () => {
    handleDelete();
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={isPending}
        className={cn(
          "inline-flex items-center rounded-md px-3 py-1.5 text-sm font-medium text-danger-600",
          "hover:bg-danger-50 hover:text-danger-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors",
          "dark:text-danger-400 dark:hover:bg-danger-900/30 dark:hover:text-danger-300",
          className,
        )}
      >
        {isPending ? translate("radish.action.deleting", { _: "Deleting…" }) : resolvedLabel}
      </button>
      <Confirm
        isOpen={open}
        title={resolvedConfirmTitle}
        content={resolvedConfirmContent}
        confirmLabel={translate("ra.action.delete", { _: "Delete" })}
        onConfirm={handleConfirm}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
