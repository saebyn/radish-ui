import React, { useEffect, useId, useRef } from "react";
import { useTranslate } from "ra-core";
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
  confirmLabel,
  cancelLabel,
  onConfirm,
  onClose,
  className,
}: ConfirmProps) {
  const translate = useTranslate();
  const resolvedConfirmLabel = confirmLabel ?? translate("ra.action.confirm", { _: "Confirm" });
  const resolvedCancelLabel = cancelLabel ?? translate("ra.action.cancel", { _: "Cancel" });
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
        "rounded-xl border border-neutral-200 bg-white p-0 shadow-xl backdrop:bg-black/40",
        "dark:border-neutral-700 dark:bg-neutral-800",
        "open:flex open:flex-col",
        "w-full max-w-sm",
        className,
      )}
    >
      <div className="flex flex-col gap-4 p-6">
        <h2 id={titleId} className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
          {title}
        </h2>

        {content && (
          <p id={contentId} className="text-sm text-neutral-600 dark:text-neutral-300">
            {content}
          </p>
        )}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className={cn(
              "rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 shadow-sm",
              "hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1",
              "dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-600",
            )}
          >
            {resolvedCancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={cn(
              "rounded-md bg-danger-600 px-4 py-2 text-sm font-medium text-white shadow-sm",
              "hover:bg-danger-700 focus:outline-none focus:ring-2 focus:ring-danger-500 focus:ring-offset-1",
              "dark:bg-danger-700 dark:hover:bg-danger-600",
            )}
          >
            {resolvedConfirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
