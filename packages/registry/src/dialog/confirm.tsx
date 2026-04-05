import React, { useEffect, useId, useRef } from "react";
import { cn } from "@radish-ui/core";

interface ConfirmProps {
  /** Whether the dialog is visible. */
  isOpen: boolean;
  /** Dialog heading. */
  title: string;
  /** Dialog body text or content. */
  content?: React.ReactNode;
  /** Label for the confirm button. Default: "Confirm". */
  confirmLabel?: string;
  /** Label for the cancel button. Default: "Cancel". */
  cancelLabel?: string;
  /** Called when the user confirms. */
  onConfirm: () => void;
  /** Called when the user cancels or closes the dialog. */
  onClose: () => void;
  /** Extra className for the dialog panel. */
  className?: string;
}

/**
 * Accessible modal confirm dialog.
 * Used by `<DeleteButton>` and anywhere a confirmation step is needed.
 *
 * Uses the native `<dialog>` element for focus-trap and backdrop behaviour.
 * Falls back gracefully in environments where `showModal` is unavailable.
 *
 * Copy this file into your project and customise freely.
 *
 * @example
 * const [open, setOpen] = useState(false);
 * <Confirm
 *   isOpen={open}
 *   title="Delete record?"
 *   content="This action cannot be undone."
 *   onConfirm={() => { doDelete(); setOpen(false); }}
 *   onClose={() => setOpen(false)}
 * />
 */
export function Confirm({
  isOpen,
  title,
  content,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onClose,
  className,
}: ConfirmProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const uid = useId();
  const titleId = `${uid}-title`;
  const contentId = `${uid}-content`;

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (isOpen) {
      if (!el.open) {
        if (typeof el.showModal === "function") {
          el.showModal();
        } else if (typeof el.show === "function") {
          el.show();
        } else {
          el.setAttribute("open", "");
        }
      }
    } else {
      if (el.open) {
        if (typeof el.close === "function") {
          el.close();
        } else {
          el.removeAttribute("open");
        }
      }
    }
  }, [isOpen]);

  // Close on backdrop click: native <dialog> does NOT close on outside-click by default;
  // this is intentional custom behaviour that mirrors what users typically expect.
  const handleDialogClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) {
      onClose();
    }
  };

  // Close on Escape key (native dialog already handles this, but we sync state)
  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    const handleCancel = () => onClose();
    el.addEventListener("cancel", handleCancel);
    return () => el.removeEventListener("cancel", handleCancel);
  }, [onClose]);

  return (
    <dialog
      ref={dialogRef}
      onClick={handleDialogClick}
      aria-labelledby={titleId}
      aria-describedby={content ? contentId : undefined}
      className={cn(
        "rounded-xl border border-gray-200 bg-white p-0 shadow-xl backdrop:bg-black/40",
        "dark:border-gray-700 dark:bg-gray-800",
        "open:flex open:flex-col",
        "w-full max-w-sm",
        className,
      )}
    >
      <div className="flex flex-col gap-4 p-6">
        <h2 id={titleId} className="text-base font-semibold text-gray-900 dark:text-gray-100">
          {title}
        </h2>

        {content && (
          <p id={contentId} className="text-sm text-gray-600 dark:text-gray-300">
            {content}
          </p>
        )}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className={cn(
              "rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm",
              "hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1",
              "dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600",
            )}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={cn(
              "rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm",
              "hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1",
              "dark:bg-red-700 dark:hover:bg-red-600",
            )}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
