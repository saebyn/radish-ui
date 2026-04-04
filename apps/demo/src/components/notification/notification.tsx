import { useCallback, useEffect, useRef, useState } from "react";
import { useNotificationContext } from "ra-core";
import { cn } from "@radish-ui/core";
import type { NotificationPayload } from "ra-core";

/** Duration (ms) each toast is visible before auto-dismissing. */
const AUTO_HIDE_MS = 4000;

type NotificationType = "success" | "error" | "info" | "warning";

interface ActiveNotification extends NotificationPayload {
  /** Unique render key so React can animate in/out. */
  key: number;
  /** Auto-hide duration in ms (null = stay until manually dismissed). */
  autoHideDuration: number | null;
}

const typeStyles: Record<NotificationType, string> = {
  success:
    "bg-green-50 border-green-400 text-green-800 [&_[data-icon]]:text-green-500 dark:bg-green-900/30 dark:border-green-700 dark:text-green-300 dark:[&_[data-icon]]:text-green-400",
  error:
    "bg-red-50 border-red-400 text-red-800 [&_[data-icon]]:text-red-500 dark:bg-red-900/30 dark:border-red-700 dark:text-red-300 dark:[&_[data-icon]]:text-red-400",
  info: "bg-blue-50 border-blue-400 text-blue-800 [&_[data-icon]]:text-blue-500 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300 dark:[&_[data-icon]]:text-blue-400",
  warning:
    "bg-yellow-50 border-yellow-400 text-yellow-800 [&_[data-icon]]:text-yellow-500 dark:bg-yellow-900/30 dark:border-yellow-700 dark:text-yellow-300 dark:[&_[data-icon]]:text-yellow-400",
};

function NotificationIcon({ type }: { type: NotificationType }) {
  if (type === "success") {
    return (
      <svg
        data-icon
        className="h-5 w-5 shrink-0"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
          clipRule="evenodd"
        />
      </svg>
    );
  }
  if (type === "error") {
    return (
      <svg
        data-icon
        className="h-5 w-5 shrink-0"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
          clipRule="evenodd"
        />
      </svg>
    );
  }
  if (type === "warning") {
    return (
      <svg
        data-icon
        className="h-5 w-5 shrink-0"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
          clipRule="evenodd"
        />
      </svg>
    );
  }
  // info
  return (
    <svg
      data-icon
      className="h-5 w-5 shrink-0"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
        clipRule="evenodd"
      />
    </svg>
  );
}

interface ToastProps {
  notification: ActiveNotification;
  dismiss: (key: number) => void;
}

function Toast({ notification, dismiss }: ToastProps) {
  const type: NotificationType = (notification.type as NotificationType) ?? "info";
  const { autoHideDuration, key } = notification;

  useEffect(() => {
    if (autoHideDuration === null) return;
    const duration = autoHideDuration > 0 ? autoHideDuration : AUTO_HIDE_MS;
    const id = setTimeout(() => dismiss(key), duration);
    return () => clearTimeout(id);
  }, [autoHideDuration, dismiss, key]);

  return (
    <div
      role="alert"
      aria-live="polite"
      className={cn(
        "flex w-80 max-w-sm items-start gap-3 rounded-lg border px-4 py-3 shadow-md",
        typeStyles[type],
      )}
    >
      <NotificationIcon type={type} />
      <p className="flex-1 text-sm font-medium leading-5">{String(notification.message)}</p>
      <button
        type="button"
        aria-label="Dismiss notification"
        onClick={() => dismiss(key)}
        className="shrink-0 rounded p-0.5 opacity-60 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-current"
      >
        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
        </svg>
      </button>
    </div>
  );
}

/**
 * Notification toast container.
 * Reads from ra-core's NotificationContext (which is provided by CoreAdminContext)
 * and renders queued toasts in the top-right corner of the viewport.
 *
 * Place this inside your Layout so that it appears for all pages:
 *
 * @example
 * import { Notification } from "./notification/notification";
 *
 * export function Layout({ children, title }: LayoutProps) {
 *   return (
 *     <div className="flex h-screen flex-col">
 *       ...
 *       {children}
 *       <Notification />
 *     </div>
 *   );
 * }
 */
export function Notification({ className }: { className?: string }) {
  const { notifications, takeNotification } = useNotificationContext();
  const [active, setActive] = useState<ActiveNotification[]>([]);
  const keyRef = useRef(0);

  // Drain the ra-core queue into local state whenever new items arrive.
  useEffect(() => {
    if (notifications.length === 0) return;
    const payload = takeNotification();
    if (!payload) return;

    const rawDuration = payload.notificationOptions?.autoHideDuration;
    let duration: number | null;
    if (rawDuration === null) {
      duration = null;
    } else if (typeof rawDuration === "number") {
      duration = rawDuration;
    } else {
      duration = AUTO_HIDE_MS;
    }

    // Generate the key before entering setState to avoid mutation inside a
    // state updater function.
    keyRef.current += 1;
    const key = keyRef.current;
    setActive((prev) => [...prev, { ...payload, key, autoHideDuration: duration }]);
  }, [notifications, takeNotification]);

  const dismiss = useCallback(
    (key: number) => setActive((prev) => prev.filter((n) => n.key !== key)),
    [],
  );

  if (active.length === 0) return null;

  return (
    <div
      aria-label="Notifications"
      className={cn("fixed right-4 top-4 z-50 flex flex-col gap-2", className)}
    >
      {active.map((n) => (
        <Toast key={n.key} notification={n} dismiss={dismiss} />
      ))}
    </div>
  );
}
