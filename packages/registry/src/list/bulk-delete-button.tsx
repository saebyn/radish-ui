import { useState } from "react";
import { useResourceContext, useBulkDeleteController } from "ra-core";
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
  label = "Delete",
  confirmTitle = "Delete selected items?",
  confirmContent = "This action cannot be undone.",
  className,
}: BulkDeleteButtonProps) {
  const resourceContext = useResourceContext();
  const [open, setOpen] = useState(false);

  const { handleDelete, isPending } = useBulkDeleteController({
    resource: resource ?? resourceContext,
    mutationMode: "pessimistic",
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
          "inline-flex items-center rounded-md px-3 py-1.5 text-sm font-medium text-red-600",
          "hover:bg-red-50 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors",
          "dark:text-red-400 dark:hover:bg-red-900/30 dark:hover:text-red-300",
          className,
        )}
      >
        {isPending ? "Deleting…" : label}
      </button>
      <Confirm
        isOpen={open}
        title={confirmTitle}
        content={confirmContent}
        confirmLabel="Delete"
        onConfirm={handleConfirm}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
