import { useFieldValue, cn } from "@radish-ui/core";

interface BooleanFieldProps {
  source: string;
  label?: string;
  /** Label when the value is truthy. Default: "Yes" */
  trueLabel?: string;
  /** Label when the value is falsy. Default: "No" */
  falseLabel?: string;
  className?: string;
}

/**
 * Boolean field — renders a coloured badge or ✓/✗ icon.
 * Uses useFieldValue from @radish-ui/core to read the current record context.
 *
 * Copy this file into your project and customise freely.
 *
 * @example
 * <BooleanField source="is_published" label="Published" />
 */
export function BooleanField({
  source,
  trueLabel = "Yes",
  falseLabel = "No",
  className,
}: BooleanFieldProps) {
  const value = useFieldValue({ source });
  const isTrue = value === true || value === 1 || value === "true" || value === "1";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        isTrue ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400",
        className,
      )}
      aria-label={isTrue ? trueLabel : falseLabel}
    >
      {isTrue ? (
        <>
          <svg className="h-3 w-3" viewBox="0 0 12 12" fill="currentColor" aria-hidden>
            <path d="M4.5 9.5 1 6l1.4-1.4 2.1 2.1 4.1-4.1L10 4 4.5 9.5Z" />
          </svg>
          {trueLabel}
        </>
      ) : (
        <>
          <svg className="h-3 w-3" viewBox="0 0 12 12" fill="currentColor" aria-hidden>
            <path
              d="M9 3 3 9M3 3l6 6"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          {falseLabel}
        </>
      )}
    </span>
  );
}
