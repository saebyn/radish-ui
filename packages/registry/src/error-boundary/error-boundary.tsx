import React from "react";
import { cn } from "@radish-ui/core";

interface ErrorBoundaryProps {
  /** Content to render when no error has been caught. */
  children: React.ReactNode;
  /**
   * Custom fallback UI. Receives the caught error and a `reset` callback that
   * clears the error state so the subtree is re-mounted.
   *
   * When omitted a default styled error panel is shown.
   */
  fallback?: (error: Error, reset: () => void) => React.ReactNode;
  /** Extra className forwarded to the default fallback panel. */
  className?: string;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * Catches unexpected runtime errors in a React component tree and displays a
 * styled fallback UI, preventing the application from crashing with an
 * uncaught exception.
 *
 * Wrap any subtree — or the entire application — in `<ErrorBoundary>`:
 *
 * @example
 * // Default fallback panel
 * <ErrorBoundary>
 *   <MyWidget />
 * </ErrorBoundary>
 *
 * @example
 * // Custom fallback
 * <ErrorBoundary
 *   fallback={(error, reset) => (
 *     <div>
 *       <p>Something went wrong: {error.message}</p>
 *       <button onClick={reset}>Try again</button>
 *     </div>
 *   )}
 * >
 *   <MyWidget />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { error: null };
    this.reset = this.reset.bind(this);
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  /**
   * Clears the caught error and re-mounts the children subtree.
   * Note: this only works if the underlying cause of the error has been resolved
   * (e.g. a prop or state change before calling reset). Otherwise the same
   * error will be thrown again immediately after the subtree is re-mounted.
   */
  reset() {
    this.setState({ error: null });
  }

  override render() {
    const { error } = this.state;
    const { children, fallback, className } = this.props;

    if (error) {
      if (fallback) {
        return fallback(error, this.reset);
      }

      return (
        <div
          role="alert"
          className={cn(
            "rounded-xl border border-danger-200 bg-danger-50 p-6",
            "dark:border-danger-800 dark:bg-danger-900/20",
            className,
          )}
        >
          <div className="flex items-start gap-3">
            <svg
              aria-hidden="true"
              className="mt-0.5 h-5 w-5 shrink-0 text-danger-500 dark:text-danger-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                clipRule="evenodd"
              />
            </svg>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-danger-800 dark:text-danger-300">
                Something went wrong
              </p>
              <p className="mt-1 break-words text-sm text-danger-700 dark:text-danger-400">
                {error.message}
              </p>
            </div>
          </div>

          <div className="mt-4">
            <button
              type="button"
              onClick={this.reset}
              className={cn(
                "rounded-md bg-danger-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm",
                "hover:bg-danger-700 focus:outline-none focus:ring-2 focus:ring-danger-500 focus:ring-offset-1",
                "dark:bg-danger-700 dark:hover:bg-danger-600",
              )}
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    return children;
  }
}
