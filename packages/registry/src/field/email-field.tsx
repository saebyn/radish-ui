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
    return (
      <span className={cn("text-sm text-neutral-400 dark:text-neutral-500", className)}>—</span>
    );
  }

  const email = String(value);

  return (
    <a
      href={`mailto:${email}`}
      className={cn(
        "text-sm text-primary-600 underline hover:text-primary-800",
        "dark:text-primary-400 dark:hover:text-primary-300",
        className,
      )}
    >
      {email}
    </a>
  );
}
