import { useFieldValue, cn } from "@radish-ui/core";

interface UrlFieldProps {
  source: string;
  label?: string;
  /** Max characters to display; the full URL is still used in the href. */
  maxLength?: number;
  /** Link target. Default: "_blank". */
  target?: string;
  className?: string;
}

/**
 * Renders a record field as a clickable `<a href>` hyperlink.
 *
 * Copy this file into your project and customise freely.
 *
 * @example
 * <UrlField source="website" />
 * <UrlField source="profile_url" label="Profile" maxLength={30} />
 */
export function UrlField({ source, maxLength, target = "_blank", className }: UrlFieldProps) {
  const value = useFieldValue({ source });

  if (value === undefined || value === null) {
    return (
      <span className={cn("text-sm text-neutral-400 dark:text-neutral-500", className)}>—</span>
    );
  }

  const href = String(value);
  const display = maxLength && href.length > maxLength ? `${href.slice(0, maxLength)}…` : href;

  return (
    <a
      href={href}
      target={target}
      rel={target === "_blank" ? "noopener noreferrer" : undefined}
      className={cn(
        "text-sm text-primary-600 underline hover:text-primary-800",
        "dark:text-primary-400 dark:hover:text-primary-300",
        className,
      )}
    >
      {display}
    </a>
  );
}
