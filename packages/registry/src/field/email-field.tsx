import { useFieldValue, cn } from "@radish-ui/core";

interface EmailFieldProps {
  source: string;
  label?: string;
  className?: string;
}

/**
 * Renders a record field as a `mailto:` link.
 *
 * Copy this file into your project and customise freely.
 *
 * @example
 * <EmailField source="email" />
 */
export function EmailField({ source, className }: EmailFieldProps) {
  const value = useFieldValue({ source });

  if (value === undefined || value === null) {
    return <span className={cn("text-sm text-gray-400 dark:text-gray-500", className)}>—</span>;
  }

  const email = String(value);

  return (
    <a
      href={`mailto:${email}`}
      className={cn(
        "text-sm text-indigo-600 underline hover:text-indigo-800",
        "dark:text-indigo-400 dark:hover:text-indigo-300",
        className,
      )}
    >
      {email}
    </a>
  );
}
