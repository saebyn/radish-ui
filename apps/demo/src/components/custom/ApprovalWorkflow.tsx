/**
 * ApprovalWorkflow — demo-only component.
 *
 * Renders one or more status-transition buttons based on the current record's
 * status and a caller-supplied transition map. On click, opens a modal that
 * lets the user optionally add a comment before confirming the transition.
 *
 * On confirm:
 *  1. Updates the record's `statusField` via useUpdate (pessimistic)
 *  2. Appends an ActivityLog entry via useCreate with the comment and
 *     change_details { from, to }
 *
 * Usage:
 *   <ApprovalWorkflow
 *     resource="projects"
 *     statusField="status"
 *     transitions={PROJECT_STATUS_TRANSITIONS}
 *   />
 */

import { useEffect, useId, useRef, useState } from "react";
import { useRecordContext, useUpdate, useCreate, useRefresh } from "ra-core";
import { cn } from "@radish-ui/core";

// ─── Public types ────────────────────────────────────────────────────────────

export type TransitionVariant = "primary" | "success" | "danger";

export interface StatusTransition {
  /** Target status value after the transition. */
  to: string;
  /** Short label shown on the trigger button, e.g. "Submit for Review". */
  label: string;
  /** Confirm button text inside the modal. Defaults to `label`. */
  confirmLabel?: string;
  /** Body copy shown in the modal. */
  prompt: string;
  /** Visual style of the trigger + confirm buttons. */
  variant: TransitionVariant;
}

export type TransitionMap = Record<string, StatusTransition[]>;

interface ApprovalWorkflowProps {
  /** The RA resource name, e.g. "projects". */
  resource: string;
  /** The field on the record that holds the current status. Default: "status". */
  statusField?: string;
  /**
   * Maps each status value to the transitions available from that status.
   * If a status is absent, or maps to an empty array, no buttons are rendered.
   */
  transitions: TransitionMap;
}

// ─── Button variant styles ──────────────────────────────────────────────────

const TRIGGER_STYLES: Record<TransitionVariant, string> = {
  primary:
    "bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 dark:bg-primary-700 dark:hover:bg-primary-600",
  success:
    "bg-success-600 text-white hover:bg-success-700 focus:ring-success-500 dark:bg-success-700 dark:hover:bg-success-600",
  danger:
    "bg-danger-600 text-white hover:bg-danger-700 focus:ring-danger-500 dark:bg-danger-700 dark:hover:bg-danger-600",
};

const BASE_BTN =
  "rounded-md px-3 py-1.5 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 transition-colors";

// ─── Modal ───────────────────────────────────────────────────────────────────

interface TransitionModalProps {
  isOpen: boolean;
  title: string;
  prompt: string;
  confirmLabel: string;
  variant: TransitionVariant;
  comment: string;
  onCommentChange: (v: string) => void;
  onConfirm: () => void;
  onClose: () => void;
  isPending: boolean;
}

function TransitionModal({
  isOpen,
  title,
  prompt,
  confirmLabel,
  variant,
  comment,
  onCommentChange,
  onConfirm,
  onClose,
  isPending,
}: TransitionModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const uid = useId();
  const titleId = `${uid}-title`;

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (isOpen) {
      if (!el.open) {
        if (typeof el.showModal === "function") {
          el.showModal();
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

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    const handler = () => onClose();
    el.addEventListener("cancel", handler);
    return () => el.removeEventListener("cancel", handler);
  }, [onClose]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      onClick={handleBackdropClick}
      aria-labelledby={titleId}
      className={cn(
        "rounded-xl border border-neutral-200 bg-canvas-0 p-0 shadow-xl",
        "backdrop:bg-black/40",
        "dark:border-neutral-700 dark:bg-canvas-800",
        "open:flex open:flex-col w-full max-w-md",
      )}
    >
      <div className="flex flex-col gap-4 p-6">
        <h2 id={titleId} className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
          {title}
        </h2>

        <p className="text-sm text-neutral-600 dark:text-neutral-300">{prompt}</p>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor={`${uid}-comment`}
            className="text-xs font-medium text-neutral-500 dark:text-neutral-400"
          >
            Add a note <span className="font-normal">(optional)</span>
          </label>
          <textarea
            id={`${uid}-comment`}
            rows={3}
            value={comment}
            onChange={(e) => onCommentChange(e.target.value)}
            placeholder="Describe the reason for this transition…"
            className={cn(
              "w-full rounded-md border border-neutral-300 bg-canvas-0 px-3 py-2 text-sm",
              "placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500",
              "dark:border-neutral-600 dark:bg-canvas-700 dark:text-neutral-100 dark:placeholder:text-neutral-500",
            )}
          />
        </div>

        <div className="flex justify-end gap-3 pt-1">
          <button
            type="button"
            disabled={isPending}
            onClick={onClose}
            className={cn(
              BASE_BTN,
              "border border-neutral-300 bg-canvas-0 text-neutral-700 hover:bg-canvas-50 focus:ring-neutral-400",
              "dark:border-neutral-600 dark:bg-canvas-700 dark:text-neutral-200 dark:hover:bg-canvas-600",
              isPending && "opacity-50 cursor-not-allowed",
            )}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={onConfirm}
            className={cn(
              BASE_BTN,
              TRIGGER_STYLES[variant],
              isPending && "opacity-50 cursor-not-allowed",
            )}
          >
            {isPending ? "Saving…" : confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

interface ActiveTransition {
  transition: StatusTransition;
  fromStatus: string;
}

export function ApprovalWorkflow({
  resource,
  statusField = "status",
  transitions,
}: ApprovalWorkflowProps) {
  const record = useRecordContext();
  const [update, { isPending: isUpdating }] = useUpdate();
  const [create, { isPending: isCreating }] = useCreate();
  const refresh = useRefresh();

  const [active, setActive] = useState<ActiveTransition | null>(null);
  const [comment, setComment] = useState("");

  if (!record) return null;

  const currentStatus = String(record[statusField] ?? "");
  const available = transitions[currentStatus] ?? [];

  if (available.length === 0) return null;

  const handleOpen = (transition: StatusTransition) => {
    setComment("");
    setActive({ transition, fromStatus: currentStatus });
  };

  const handleClose = () => {
    if (isUpdating || isCreating) return;
    setActive(null);
    setComment("");
  };

  const handleConfirm = async () => {
    if (!active) return;
    const { transition, fromStatus } = active;

    try {
      await update(
        resource,
        {
          id: record.id,
          data: { ...record, [statusField]: transition.to },
          previousData: record,
        },
        { mutationMode: "pessimistic" },
      );

      await create("activityLog", {
        data: {
          actor_id: 1, // demo: no real auth, default to user 1
          action: "status_transition",
          resource_type: resource,
          resource_id: record.id,
          change_details: {
            from: fromStatus,
            to: transition.to,
            ...(comment.trim() ? { comment: comment.trim() } : {}),
          },
          timestamp: new Date().toISOString(),
        },
      });

      setActive(null);
      setComment("");
      refresh();
    } catch (err) {
      console.error("Approval workflow transition failed:", err);
    }
  };

  const isPending = isUpdating || isCreating;

  return (
    <>
      {/* Trigger buttons — one per available transition */}
      {available.map((t) => (
        <button
          key={t.to}
          type="button"
          onClick={() => handleOpen(t)}
          className={cn(BASE_BTN, TRIGGER_STYLES[t.variant])}
        >
          {t.label}
        </button>
      ))}

      {/* Modal — only mounted when a transition is active */}
      {active && (
        <TransitionModal
          isOpen
          title={active.transition.label}
          prompt={active.transition.prompt}
          confirmLabel={active.transition.confirmLabel ?? active.transition.label}
          variant={active.transition.variant}
          comment={comment}
          onCommentChange={setComment}
          onConfirm={handleConfirm}
          onClose={handleClose}
          isPending={isPending}
        />
      )}
    </>
  );
}
